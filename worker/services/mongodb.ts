import { createHash, randomBytes } from "crypto";
import { MongoClient } from "mongodb";
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
  M0:  { storageMB: 512,    connections: 500   },
  M2:  { storageMB: 2048,   connections: 300   },
  M5:  { storageMB: 5120,   connections: 500   },
  M10: { storageMB: 10240,  connections: 1500  },
  M20: { storageMB: 20480,  connections: 3000  },
  M30: { storageMB: 40960,  connections: 3000  },
};
const DEFAULT_LIMITS = { storageMB: 512000, connections: 100000 };

// System databases to skip when listing user databases
const SYSTEM_DBS = new Set(["admin", "local", "config"]);

// ── HTTP Digest Auth helper ────────────────────────────────────────────────────

function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

async function digestFetch(url: string, username: string, password: string): Promise<Response> {
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

async function handleAtlasError(res: Response): Promise<never> {
  let detail: string | null = null;
  try {
    const body = await res.json() as { detail?: string; reason?: string };
    detail = body.detail ?? body.reason ?? null;
  } catch { /* ignore parse failures */ }

  switch (res.status) {
    case 401:
      throw new Error("MongoDB Atlas: Invalid API key (public/private key mismatch)");
    case 402:
      throw new Error(detail ?? "MongoDB Atlas: Billing feature not available — check your Atlas plan");
    case 403:
      throw new Error("MongoDB Atlas: API key lacks required access — needs Project Read Only");
    case 404:
      throw new Error("MongoDB Atlas: Project ID not found");
    case 429:
      throw new Error("MongoDB Atlas: Rate limited — will retry next cycle");
    default:
      throw new Error(detail ?? `MongoDB Atlas API error: ${res.status}`);
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

// ── Direct connection path ─────────────────────────────────────────────────────
// Used when the user provides a MongoDB connection string with clusterMonitor access.
// Returns real storage and connection values instead of Admin API 0/limit placeholders.

async function fetchViaDirectConnection(
  connectionString: string,  // NEVER log this
  limits: { storageMB: number; connections: number },
  isPro: boolean
): Promise<UsageMetric[]> {
  const client = new MongoClient(connectionString, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
  });

  try {
    await client.connect();
    const adminDb = client.db("admin");

    // Connections from serverStatus
    const status = await adminDb.command({ serverStatus: 1 }) as {
      connections?: { current?: number; available?: number };
      mem?: { resident?: number };
    };
    const currentConnections = status.connections?.current ?? 0;

    // Get all user databases and their storage stats
    const dbListResult = await adminDb.admin().listDatabases() as {
      databases: Array<{ name: string; sizeOnDisk?: number }>;
    };
    const userDbs = dbListResult.databases.filter((d) => !SYSTEM_DBS.has(d.name));

    let totalStorageMB = 0;
    const metrics: UsageMetric[] = [];

    for (const dbInfo of userDbs) {
      const db = client.db(dbInfo.name);
      let dbStorageMB = 0;

      try {
        const stats = await db.command({ dbStats: 1 }) as { storageSize?: number };
        dbStorageMB = Math.round(((stats.storageSize ?? 0) / 1_000_000) * 100) / 100;
      } catch {
        // Fallback to sizeOnDisk if dbStats is unavailable (restricted clusters)
        dbStorageMB = Math.round(((dbInfo.sizeOnDisk ?? 0) / 1_000_000) * 100) / 100;
      }

      totalStorageMB += dbStorageMB;

      if (isPro) {
        metrics.push({
          metricName: "db_size_mb",
          currentValue: dbStorageMB,
          limitValue: null,
          percentUsed: null,
          entityId: dbInfo.name,
          entityLabel: dbInfo.name,
        });

        // Per-collection breakdown
        try {
          const collections = await db.listCollections({ type: "collection" }).toArray();
          for (const coll of collections) {
            let collStorageMB = 0;
            try {
              const cs = await db.command({ collStats: coll.name }) as { storageSize?: number };
              collStorageMB = Math.round(((cs.storageSize ?? 0) / 1_000_000) * 100) / 100;
            } catch {
              // collStats unavailable (restricted permissions) — record with 0 MB
            }
            metrics.push({
              metricName: "collection_size_mb",
              currentValue: collStorageMB,
              limitValue: null,
              percentUsed: null,
              entityId: `${dbInfo.name}/${coll.name}`,
              entityLabel: coll.name,
            });
          }
        } catch {
          // Skip collection listing if unavailable
        }
      }
    }

    // Resident memory
    if (isPro && status.mem?.resident != null) {
      metrics.push({
        metricName: "memory_resident_mb",
        currentValue: status.mem.resident,
        limitValue: null,
        percentUsed: null,
      });
    }

    // Replication lag (via replSetGetStatus)
    if (isPro) {
      try {
        const rsStatus = await adminDb.command({ replSetGetStatus: 1 }) as {
          members?: Array<{ stateStr?: string; optimeDate?: Date }>;
        };
        const primary = rsStatus.members?.find((m) => m.stateStr === "PRIMARY");
        const secondaries = rsStatus.members?.filter(
          (m) => m.stateStr === "SECONDARY" && m.optimeDate
        ) ?? [];
        if (primary?.optimeDate && secondaries.length > 0) {
          const maxLagMs = Math.max(
            ...secondaries.map((s) =>
              primary.optimeDate!.getTime() - (s.optimeDate?.getTime() ?? primary.optimeDate!.getTime())
            )
          );
          metrics.push({
            metricName: "replication_lag_s",
            currentValue: Math.round(maxLagMs / 10) / 100,
            limitValue: null,
            percentUsed: null,
          });
        }
      } catch {
        // Standalone node or restricted cluster — skip silently
      }
    }

    // Slow in-flight queries (active ops running > 1s)
    if (isPro) {
      try {
        const currentOp = await adminDb.command({
          currentOp: 1,
          active: true,
          secs_running: { $gt: 1 },
        }) as { inprog?: unknown[] };
        metrics.push({
          metricName: "slow_queries_count",
          currentValue: currentOp.inprog?.length ?? 0,
          limitValue: null,
          percentUsed: null,
        });
      } catch {
        // M0 shared clusters and restricted configs don't support currentOp
      }
    }

    return [
      {
        metricName: "storage_mb",
        currentValue: Math.round(totalStorageMB * 100) / 100,
        limitValue: limits.storageMB,
        percentUsed: pct(totalStorageMB, limits.storageMB),
      },
      {
        metricName: "connections",
        currentValue: currentConnections,
        limitValue: limits.connections,
        percentUsed: pct(currentConnections, limits.connections),
      },
      ...metrics,
    ];
  } finally {
    await client.close();
  }
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
  if (!clustersRes.ok) await handleAtlasError(clustersRes);

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

  const primaryLimits = clusterLimitsMap.get(clusters[0]?.name ?? "") ?? DEFAULT_LIMITS;

  // ── 2. Direct connection path (when connection string is provided) ────────
  const connStringEnc = integration.meta?.connection_string_enc;
  if (connStringEnc) {
    let connectionString: string;
    try {
      connectionString = decrypt(String(connStringEnc));
      // NEVER log connectionString
    } catch (err) {
      console.warn(
        `[mongodb] Failed to decrypt connection string for integration ${integration.id}:`,
        err instanceof Error ? err.message : String(err)
      );
      // Fall through to Admin API path
      return fetchViaAdminAPI(integration, projectId, publicKey, privateKey, clusters, clusterLimitsMap, primaryLimits, isPro);
    }

    try {
      const directMetrics = await fetchViaDirectConnection(connectionString, primaryLimits, isPro);

      // Pro: also get network metrics from Admin API (not available via direct connection)
      if (isPro) {
        const netMetrics = await fetchNetworkMetrics(integration, projectId, publicKey, privateKey, primaryLimits);
        return [...directMetrics, ...netMetrics];
      }

      return directMetrics;
    } catch (err) {
      console.warn(
        `[mongodb] Direct connection failed for integration ${integration.id} — falling back to Admin API:`,
        err instanceof Error ? err.message : String(err)
      );
      // Fall through to Admin API path
    }
  }

  return fetchViaAdminAPI(integration, projectId, publicKey, privateKey, clusters, clusterLimitsMap, primaryLimits, isPro);
}

// ── Admin API path (original, for non-connection-string or fallback) ──────────

async function fetchNetworkMetrics(
  integration: Integration,
  projectId: string,
  publicKey: string,
  privateKey: string,
  primaryLimits: { storageMB: number; connections: number }
): Promise<UsageMetric[]> {
  // Requires a process to query against
  const processesRes = await digestFetch(
    `${ATLAS_BASE}/groups/${projectId}/processes`,
    publicKey,
    privateKey
  );
  if (!processesRes.ok) return [];

  const processesData = await processesRes.json() as {
    results: Array<{ id: string; typeName?: string }>;
  };
  const processes = processesData.results ?? [];
  if (processes.length === 0) return [];

  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.typeName === "REPLICA_PRIMARY") return -1;
    if (b.typeName === "REPLICA_PRIMARY") return 1;
    return 0;
  });
  const aggregateProcess = sortedProcesses[0];

  const HOURLY_NET_LIMIT_MB = Math.round((10 * 1024) / 24);
  const measParams = [
    "granularity=PT1H",
    "period=PT2H",
    "m=NETWORK_BYTES_IN",
    "m=NETWORK_BYTES_OUT",
  ].join("&");

  const measRes = await digestFetch(
    `${ATLAS_BASE}/groups/${projectId}/processes/${aggregateProcess.id}/measurements?${measParams}`,
    publicKey,
    privateKey
  );
  if (!measRes.ok) return [];

  const measData = await measRes.json() as { measurements: AtlasMeasurement[] };
  const measurements = measData.measurements ?? [];
  const metrics: UsageMetric[] = [];

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

  return metrics;
}

async function fetchViaAdminAPI(
  integration: Integration,
  projectId: string,
  publicKey: string,
  privateKey: string,
  clusters: Array<{ name: string; providerSettings?: { instanceSizeName?: string }; diskSizeGB?: number }>,
  clusterLimitsMap: Map<string, { storageMB: number; connections: number }>,
  primaryLimits: { storageMB: number; connections: number },
  isPro: boolean
): Promise<UsageMetric[]> {
  // ── Fetch processes ───────────────────────────────────────────────────────
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
      id: string;
      replicaSetName?: string;
      typeName?: string;
    }>;
  };
  const processes = processesData.results ?? [];

  if (processes.length === 0) {
    console.warn(`[mongodb] No processes in project ${projectId} (integration ${integration.id})`);
    return [];
  }

  const replicaMemberNum = (id: string): number => {
    const m = id.match(/-(\d{2})\./);
    return m ? parseInt(m[1], 10) : 99;
  };
  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.typeName === "REPLICA_PRIMARY") return -1;
    if (b.typeName === "REPLICA_PRIMARY") return 1;
    return replicaMemberNum(a.id) - replicaMemberNum(b.id);
  });
  const aggregateProcess = sortedProcesses[0];

  const metrics: UsageMetric[] = [];

  // ── Fetch aggregate measurements ──────────────────────────────────────────
  const measurementNames = [
    "DB_DATA_SIZE_TOTAL",
    "CONNECTIONS",
    ...(isPro ? [
      "NETWORK_BYTES_IN",
      "NETWORK_BYTES_OUT",
      "SYSTEM_CPU_PERCENT",
      "MEMORY_RESIDENT",
      "OP_EXECUTION_TIME_READS",
      "OP_EXECUTION_TIME_WRITES",
      "DISK_PARTITION_IOPS_READ",
      "DISK_PARTITION_IOPS_WRITE",
    ] : []),
  ];

  const GRAN_CONFIGS = [
    { granularity: "PT1M", period: "PT2H" },
    { granularity: "PT1H", period: "PT2H" },
    { granularity: "P1D",  period: "P7D"  },
  ] as const;

  let measurements: AtlasMeasurement[] | null = null;

  for (const cfg of GRAN_CONFIGS) {
    const measParams = [
      `granularity=${cfg.granularity}`,
      `period=${cfg.period}`,
      ...measurementNames.map((m) => `m=${m}`),
    ].join("&");

    const measRes = await digestFetch(
      `${ATLAS_BASE}/groups/${projectId}/processes/${aggregateProcess.id}/measurements?${measParams}`,
      publicKey,
      privateKey
    );

    if (measRes.ok) {
      const measData = await measRes.json() as { measurements: AtlasMeasurement[] };
      measurements = measData.measurements ?? [];
      break;
    }

    console.warn(
      `[mongodb] Measurements ${measRes.status} for process ${aggregateProcess.id} ` +
      `at granularity=${cfg.granularity}${cfg.granularity === "PT1H" ? " — retrying with P1D" : ""}`
    );
  }

  if (!measurements) {
    console.info(
      `[mongodb] Process measurements unavailable for project ${projectId} ` +
      `(M0/free-tier limitation). Returning tier limits only (integration ${integration.id}).`
    );
    return [
      {
        metricName: "storage_mb",
        currentValue: 0,
        limitValue: primaryLimits.storageMB,
        percentUsed: 0,
      },
      {
        metricName: "connections",
        currentValue: 0,
        limitValue: primaryLimits.connections,
        percentUsed: 0,
      },
    ];
  }

  // Storage
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

  // Connections
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

  // ── PRO: Network throughput ───────────────────────────────────────────────
  const HOURLY_NET_LIMIT_MB = Math.round((10 * 1024) / 24);

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

  // CPU
  const cpuRaw = latestValue(measurements, "SYSTEM_CPU_PERCENT");
  if (cpuRaw !== null) {
    const cpuPct = Math.round(cpuRaw * 100) / 100;
    metrics.push({
      metricName: "cpu_percent",
      currentValue: cpuPct,
      limitValue: 100,
      percentUsed: pct(cpuPct, 100),
    });
  }

  // Resident memory
  const memRaw = latestValue(measurements, "MEMORY_RESIDENT");
  if (memRaw !== null) {
    metrics.push({
      metricName: "memory_resident_mb",
      currentValue: Math.round(memRaw * 100) / 100,
      limitValue: null,
      percentUsed: null,
    });
  }

  // Average read latency
  const readLat = latestValue(measurements, "OP_EXECUTION_TIME_READS");
  if (readLat !== null) {
    metrics.push({
      metricName: "avg_read_latency_ms",
      currentValue: Math.round(readLat * 100) / 100,
      limitValue: null,
      percentUsed: null,
    });
  }

  // Average write latency
  const writeLat = latestValue(measurements, "OP_EXECUTION_TIME_WRITES");
  if (writeLat !== null) {
    metrics.push({
      metricName: "avg_write_latency_ms",
      currentValue: Math.round(writeLat * 100) / 100,
      limitValue: null,
      percentUsed: null,
    });
  }

  // Disk IOPS read
  const iopsRead = latestValue(measurements, "DISK_PARTITION_IOPS_READ");
  if (iopsRead !== null) {
    metrics.push({
      metricName: "disk_iops_read",
      currentValue: Math.round(iopsRead * 100) / 100,
      limitValue: null,
      percentUsed: null,
    });
  }

  // Disk IOPS write
  const iopsWrite = latestValue(measurements, "DISK_PARTITION_IOPS_WRITE");
  if (iopsWrite !== null) {
    metrics.push({
      metricName: "disk_iops_write",
      currentValue: Math.round(iopsWrite * 100) / 100,
      limitValue: null,
      percentUsed: null,
    });
  }

  // Replication lag — must query a secondary process (primary always returns 0)
  const secondaryProcess = processes.find((p) => p.typeName === "REPLICA_SECONDARY");
  if (secondaryProcess) {
    try {
      const lagRes = await digestFetch(
        `${ATLAS_BASE}/groups/${projectId}/processes/${secondaryProcess.id}/measurements?granularity=PT1M&period=PT2H&m=REPLICATION_LAG`,
        publicKey,
        privateKey
      );
      if (lagRes.ok) {
        const lagData = await lagRes.json() as { measurements: AtlasMeasurement[] };
        const lagRaw = latestValue(lagData.measurements ?? [], "REPLICATION_LAG");
        if (lagRaw !== null) {
          metrics.push({
            metricName: "replication_lag_s",
            currentValue: Math.round(lagRaw * 100) / 100,
            limitValue: null,
            percentUsed: null,
          });
        }
      }
    } catch {
      // Non-fatal — replication lag unavailable
    }
  }

  // ── PRO: Per-cluster storage breakdown ────────────────────────────────────
  if (clusters.length > 1) {
    const replicaSetToProcess = new Map<string, string>();
    for (const p of processes) {
      if (p.replicaSetName && !replicaSetToProcess.has(p.replicaSetName)) {
        replicaSetToProcess.set(p.replicaSetName, p.id);
      }
    }

    for (const cluster of clusters) {
      const processId =
        replicaSetToProcess.get(cluster.name) ??
        [...replicaSetToProcess.entries()].find(([rs]) => rs.startsWith(cluster.name))?.[1];

      if (!processId || processId === aggregateProcess.id) continue;

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
