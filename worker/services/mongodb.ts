import { createHash, randomBytes } from "crypto";
import { decrypt } from "../lib/encryption";
import type { UsageMetric } from "../pollCycle";

interface Integration {
  id: string;
  user_id: string;
  service: string;
  account_label: string;
  api_key: string;
  meta: Record<string, unknown> | null;
}

const ATLAS_BASE = "https://cloud.mongodb.com/api/atlas/v2";
const ATLAS_ACCEPT = "application/vnd.atlas.2023-02-01+json";

// Storage (MB) and connection limits by cluster instance size
const CLUSTER_LIMITS: Record<string, { storageMB: number; connections: number }> = {
  M0: { storageMB: 512,    connections: 500    },
  M2: { storageMB: 2048,   connections: 300    },
  M5: { storageMB: 5120,   connections: 500    },
  M10: { storageMB: 10240,  connections: 1500  },
  M20: { storageMB: 20480,  connections: 3000  },
  M30: { storageMB: 40960,  connections: 3000  },
};
const DEFAULT_LIMITS = { storageMB: 512000, connections: 100000 };

// ── HTTP Digest Auth helper ────────────────────────────────────────────────────
// Implements RFC 7616 Digest auth using Node's built-in crypto (no extra deps).

function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

async function digestFetch(url: string, username: string, password: string): Promise<Response> {
  // Step 1: Send unauthenticated request to obtain the Digest challenge
  const challengeRes = await fetch(url, { headers: { Accept: ATLAS_ACCEPT } });
  if (challengeRes.status !== 401) return challengeRes;

  const wwwAuth = challengeRes.headers.get("www-authenticate") ?? "";
  const parse = (key: string): string =>
    wwwAuth.match(new RegExp(`${key}="([^"]+)"`))?.[1] ?? "";

  const realm = parse("realm");
  const nonce = parse("nonce");
  const qop = parse("qop") || "auth";
  const opaque = parse("opaque");

  const nc = "00000001";
  const cnonce = randomBytes(8).toString("hex");
  const { pathname, search } = new URL(url);
  const uri = pathname + search;

  const ha1 = md5(`${username}:${realm}:${password}`);
  const ha2 = md5(`GET:${uri}`);
  const response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);

  const authHeader = [
    `Digest username="${username}"`,
    `realm="${realm}"`,
    `nonce="${nonce}"`,
    `uri="${uri}"`,
    `qop=${qop}`,
    `nc=${nc}`,
    `cnonce="${cnonce}"`,
    `response="${response}"`,
    ...(opaque ? [`opaque="${opaque}"`] : []),
  ].join(", ");

  return fetch(url, {
    headers: { Accept: ATLAS_ACCEPT, Authorization: authHeader },
  });
}

function handleAtlasError(status: number): never {
  switch (status) {
    case 401:
      throw new Error("MongoDB Atlas: Invalid API key (public/private key mismatch)");
    case 403:
      throw new Error("MongoDB Atlas: API key lacks required access — needs Project Read Only");
    case 404:
      throw new Error("MongoDB Atlas: Project ID not found");
    case 429:
      throw new Error("MongoDB Atlas: Rate limited — will retry next cycle");
    default:
      throw new Error(`MongoDB Atlas API error: ${status}`);
  }
}

function pct(current: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((current / limit) * 10000) / 100;
}

type AtlasMeasurement = {
  name: string;
  dataPoints: Array<{ value: number | null; timestamp: string }>;
};

function latestValue(measurements: AtlasMeasurement[], name: string): number | null {
  const m = measurements.find((x) => x.name === name);
  if (!m) return null;
  const dp = m.dataPoints.find((p) => p.value !== null);
  return dp?.value ?? null;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchMongoDBUsage(
  integration: Integration,
  tier: string
): Promise<UsageMetric[]> {
  const privateKey = decrypt(integration.api_key);
  // NEVER log privateKey
  const publicKey = String(integration.meta?.public_key ?? "");
  const projectId = String(integration.meta?.project_id ?? "");

  if (!publicKey || !projectId) {
    throw new Error("MongoDB Atlas: Missing public_key or project_id in integration meta");
  }

  const isPro = tier === "pro" || tier === "team";

  // ── 1. Fetch clusters to determine instance sizes and limits ─────────────
  const clustersRes = await digestFetch(
    `${ATLAS_BASE}/groups/${projectId}/clusters`,
    publicKey,
    privateKey
  );
  if (!clustersRes.ok) handleAtlasError(clustersRes.status);

  const clustersData = await clustersRes.json() as {
    results: Array<{
      name: string;
      providerSettings?: { instanceSizeName?: string };
      diskSizeGB?: number;
    }>;
  };
  const clusters = clustersData.results ?? [];

  if (clusters.length === 0) {
    console.warn(`[mongodb] No clusters found in project ${projectId} (integration ${integration.id})`);
    return [];
  }

  // Build cluster name → limits map
  const clusterLimitsMap = new Map<string, { storageMB: number; connections: number }>();
  for (const cluster of clusters) {
    const instanceSize = cluster.providerSettings?.instanceSizeName ?? "M0";
    const baseSize = instanceSize.split("_")[0]; // "M0", "M10", "M30_NVME" → "M30"
    const limits = CLUSTER_LIMITS[baseSize] ?? {
      storageMB: cluster.diskSizeGB ? Math.round(cluster.diskSizeGB * 1024) : DEFAULT_LIMITS.storageMB,
      connections: DEFAULT_LIMITS.connections,
    };
    clusterLimitsMap.set(cluster.name, limits);
  }

  // ── 2. Fetch processes ───────────────────────────────────────────────────
  const processesRes = await digestFetch(
    `${ATLAS_BASE}/groups/${projectId}/processes`,
    publicKey,
    privateKey
  );
  if (!processesRes.ok) {
    console.warn(`[mongodb] Processes fetch failed: ${processesRes.status} (integration ${integration.id})`);
    return [];
  }

  const processesData = await processesRes.json() as {
    results: Array<{
      id: string;           // "hostname:port"
      replicaSetName?: string;
      typeName?: string;    // "REPLICA_PRIMARY" | "REPLICA_SECONDARY" | ...
    }>;
  };
  const processes = processesData.results ?? [];

  if (processes.length === 0) {
    console.warn(`[mongodb] No processes in project ${projectId} (integration ${integration.id})`);
    return [];
  }

  // Prefer primary nodes; fall back to the first available process
  const primaryProcesses = processes.filter((p) => p.typeName === "REPLICA_PRIMARY");
  const aggregateProcess = primaryProcesses[0] ?? processes[0];

  const metrics: UsageMetric[] = [];
  const primaryLimits = clusterLimitsMap.get(clusters[0]?.name ?? "") ?? DEFAULT_LIMITS;

  // ── 3. Fetch aggregate measurements (account-level) ──────────────────────
  const measurementNames = [
    "DB_DATA_SIZE_TOTAL",
    "CONNECTIONS",
    ...(isPro ? ["NETWORK_BYTES_IN", "NETWORK_BYTES_OUT"] : []),
  ];
  const measParams = [
    "granularity=PT1H",
    "period=PT2H",
    ...measurementNames.map((m) => `m=${m}`),
  ].join("&");

  const measRes = await digestFetch(
    `${ATLAS_BASE}/groups/${projectId}/processes/${aggregateProcess.id}/measurements?${measParams}`,
    publicKey,
    privateKey
  );

  if (!measRes.ok) {
    console.warn(`[mongodb] Measurements fetch failed: ${measRes.status} (process ${aggregateProcess.id})`);
    return [];
  }

  const measData = await measRes.json() as { measurements: AtlasMeasurement[] };
  const measurements = measData.measurements ?? [];

  // ── FREE: Storage ────────────────────────────────────────────────────────
  const dataSizeBytes = latestValue(measurements, "DB_DATA_SIZE_TOTAL");
  if (dataSizeBytes !== null) {
    const storageMB = Math.round(dataSizeBytes / 1_000_000 * 100) / 100;
    metrics.push({
      metricName: "storage_mb",
      currentValue: storageMB,
      limitValue: primaryLimits.storageMB,
      percentUsed: pct(storageMB, primaryLimits.storageMB),
    });
  }

  // ── FREE: Connections ────────────────────────────────────────────────────
  const connections = latestValue(measurements, "CONNECTIONS");
  if (connections !== null) {
    metrics.push({
      metricName: "connections",
      currentValue: Math.round(connections),
      limitValue: primaryLimits.connections,
      percentUsed: pct(connections, primaryLimits.connections),
    });
  }

  if (!isPro) return metrics;

  // ── PRO: Network throughput ──────────────────────────────────────────────
  // Atlas monitoring reports NETWORK_BYTES_IN/OUT as bytes/sec (rolling avg).
  // We multiply by 3600 to get MB/hour and compare against 10GB/day expressed
  // per hour (427 MB/h) so the percentage reflects sustained bandwidth usage.
  const HOURLY_NET_LIMIT_MB = Math.round((10 * 1024) / 24); // ~427 MB/h

  const netIn = latestValue(measurements, "NETWORK_BYTES_IN");
  if (netIn !== null) {
    const netInMBh = Math.round((netIn * 3600) / 1_000_000 * 100) / 100;
    metrics.push({
      metricName: "network_bytes_in_mb",
      currentValue: netInMBh,
      limitValue: HOURLY_NET_LIMIT_MB,
      percentUsed: pct(netInMBh, HOURLY_NET_LIMIT_MB),
    });
  }

  const netOut = latestValue(measurements, "NETWORK_BYTES_OUT");
  if (netOut !== null) {
    const netOutMBh = Math.round((netOut * 3600) / 1_000_000 * 100) / 100;
    metrics.push({
      metricName: "network_bytes_out_mb",
      currentValue: netOutMBh,
      limitValue: HOURLY_NET_LIMIT_MB,
      percentUsed: pct(netOutMBh, HOURLY_NET_LIMIT_MB),
    });
  }

  // ── PRO: Per-cluster storage breakdown ───────────────────────────────────
  // Only emitted when there are multiple clusters so it adds value.
  if (clusters.length > 1) {
    // Group primary processes by replicaSetName to map cluster → process
    const replicaSetToProcess = new Map<string, string>();
    for (const p of primaryProcesses.length > 0 ? primaryProcesses : processes) {
      if (p.replicaSetName && !replicaSetToProcess.has(p.replicaSetName)) {
        replicaSetToProcess.set(p.replicaSetName, p.id);
      }
    }

    for (const cluster of clusters) {
      // Find the process for this cluster — replicaSetName usually starts with the cluster name
      const processId =
        replicaSetToProcess.get(cluster.name) ??
        [...replicaSetToProcess.entries()].find(([rs]) => rs.startsWith(cluster.name))?.[1];

      if (!processId || processId === aggregateProcess.id) continue; // skip if same as aggregate

      try {
        const clRes = await digestFetch(
          `${ATLAS_BASE}/groups/${projectId}/processes/${processId}/measurements?granularity=PT1H&period=PT2H&m=DB_DATA_SIZE_TOTAL`,
          publicKey,
          privateKey
        );
        if (!clRes.ok) continue;

        const clData = await clRes.json() as { measurements: AtlasMeasurement[] };
        const clBytes = latestValue(clData.measurements ?? [], "DB_DATA_SIZE_TOTAL");
        if (clBytes === null) continue;

        const clStorageMB = Math.round(clBytes / 1_000_000 * 100) / 100;
        const clLimits = clusterLimitsMap.get(cluster.name) ?? DEFAULT_LIMITS;

        metrics.push({
          metricName: "storage_mb",
          currentValue: clStorageMB,
          limitValue: clLimits.storageMB,
          percentUsed: pct(clStorageMB, clLimits.storageMB),
          entityId: cluster.name,
          entityLabel: cluster.name,
        });
      } catch (err) {
        console.warn(
          `[mongodb] Per-cluster metrics failed for ${cluster.name}:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }
  }

  return metrics;
}
