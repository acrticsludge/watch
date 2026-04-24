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

const RAILWAY_GRAPHQL = "https://backboard.railway.app/graphql/v2";

async function railwayQuery<T>(
  token: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(RAILWAY_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401) throw new Error("Railway: Invalid or expired API token.");
  if (res.status === 429) throw new Error("Railway: Rate limited. Will retry next cycle.");
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Railway API error: ${res.status} — ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(`Railway GraphQL: ${json.errors[0].message}`);
  }
  if (!json.data) throw new Error("Railway: Empty response.");

  return json.data;
}


const PROJECTS_QUERY = `
  query {
    projects {
      edges {
        node {
          id
          name
          services {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

const PROJECT_USAGE_QUERY = `
  query ProjectUsage($projectId: String, $startDate: DateTime, $endDate: DateTime) {
    usage(
      projectId: $projectId
      startDate: $startDate
      endDate: $endDate
      measurements: [CPU_USAGE, MEMORY_USAGE_GB, NETWORK_TX_GB, NETWORK_RX_GB, DISK_USAGE_GB, ESTIMATED_USD]
    ) {
      ... on AggregatedUsage {
        measurement
        value
        tags { serviceId }
      }
    }
  }
`;

interface ServiceNode {
  id: string;
  name: string;
}

interface ProjectNode {
  id: string;
  name: string;
  services: { edges: { node: ServiceNode }[] };
}

interface Measurement {
  measurement: string;
  tags: { serviceId: string };
  value: number;
}

interface ProjectAgg {
  totalMemoryGB: number;
  totalCpuFraction: number;
  totalNetworkTxMB: number;
  totalNetworkRxMB: number;
  totalDiskGB: number;
  peakCpuFraction: number;
  peakMemoryGB: number;
  estimatedUsd: number;
}

// Free-tier limits
const MEMORY_LIMIT_MB_PER_SERVICE = 512;
const CPU_LIMIT_PERCENT_PER_SERVICE = 100;

export async function fetchRailwayUsage(
  integration: Integration,
  tier: string
): Promise<UsageMetric[]> {
  const token = decrypt(integration.api_key);
  // NEVER log token

  const isPro = tier === "pro" || tier === "team";

  const projectsData = await railwayQuery<{
    projects: { edges: { node: ProjectNode }[] };
  }>(token, PROJECTS_QUERY);

  const projects = projectsData.projects.edges.map((e) => e.node);
  if (projects.length === 0) return [];

  const totalServiceCount = projects.reduce(
    (sum, p) => sum + p.services.edges.length,
    0
  );
  if (totalServiceCount === 0) return [];

  const now = new Date();
  const startDateObj = new Date(now.getFullYear(), now.getMonth(), 1);
  // Railway returns cumulative sums for memory/CPU. Dividing by period minutes
  // converts the sum back to an average instantaneous reading.
  const periodMinutes = Math.max((now.getTime() - startDateObj.getTime()) / 60000, 1);
  const startDate = startDateObj.toISOString();
  const endDate = now.toISOString();

  // Per-project aggregations
  const projectData: Array<{
    project: ProjectNode;
    serviceCount: number;
    agg: ProjectAgg;
  }> = [];

  // Global aggregation (entity_id = null)
  const globalAgg: ProjectAgg = {
    totalMemoryGB: 0,
    totalCpuFraction: 0,
    totalNetworkTxMB: 0,
    totalNetworkRxMB: 0,
    totalDiskGB: 0,
    peakCpuFraction: 0,
    peakMemoryGB: 0,
    estimatedUsd: 0,
  };
  let anyUsageFetched = false;

  for (const project of projects) {
    const serviceCount = project.services.edges.length;
    const agg: ProjectAgg = {
      totalMemoryGB: 0,
      totalCpuFraction: 0,
      totalNetworkTxMB: 0,
      totalNetworkRxMB: 0,
      totalDiskGB: 0,
      peakCpuFraction: 0,
      peakMemoryGB: 0,
      estimatedUsd: 0,
    };

    try {
      const usageData = await railwayQuery<{
        usage: Measurement[];
      }>(token, PROJECT_USAGE_QUERY, { projectId: project.id, startDate, endDate });

      const measurements = usageData.usage ?? [];
      for (const m of measurements) {
        const val = m.value ?? 0;

        switch (m.measurement) {
          case "CPU_USAGE": {
            // val is cumulative sum of CPU fractions; divide by minutes to get average
            const avgCpu = val / periodMinutes;
            agg.totalCpuFraction += avgCpu;
            agg.peakCpuFraction = Math.max(agg.peakCpuFraction, avgCpu);
            anyUsageFetched = true;
            break;
          }
          case "MEMORY_USAGE_GB": {
            // val is cumulative sum of GB readings; divide by minutes to get average GB
            const avgMemGB = val / periodMinutes;
            agg.totalMemoryGB += avgMemGB;
            agg.peakMemoryGB = Math.max(agg.peakMemoryGB, avgMemGB);
            anyUsageFetched = true;
            break;
          }
          case "NETWORK_TX_GB":
            agg.totalNetworkTxMB += val * 1024;
            anyUsageFetched = true;
            break;
          case "NETWORK_RX_GB":
            agg.totalNetworkRxMB += val * 1024;
            anyUsageFetched = true;
            break;
          case "DISK_USAGE_GB":
            agg.totalDiskGB += val;
            anyUsageFetched = true;
            break;
          case "ESTIMATED_USD":
            agg.estimatedUsd += val;
            break;
        }
      }

      // Accumulate into global
      globalAgg.totalMemoryGB += agg.totalMemoryGB;
      globalAgg.totalCpuFraction += agg.totalCpuFraction;
      globalAgg.totalNetworkTxMB += agg.totalNetworkTxMB;
      globalAgg.totalNetworkRxMB += agg.totalNetworkRxMB;
      globalAgg.totalDiskGB += agg.totalDiskGB;
      globalAgg.peakCpuFraction = Math.max(globalAgg.peakCpuFraction, agg.peakCpuFraction);
      globalAgg.peakMemoryGB = Math.max(globalAgg.peakMemoryGB, agg.peakMemoryGB);
      globalAgg.estimatedUsd += agg.estimatedUsd;

      projectData.push({ project, serviceCount, agg });
    } catch (err) {
      console.warn(
        `[railway] Usage fetch failed for project ${project.id}:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  // If the usage API returned no measurements (e.g. all services are sleeping/idle),
  // still emit zero-value metrics so the integration stays "connected" rather than
  // being marked "unsupported".
  const metrics: UsageMetric[] = [];
  const memoryLimitMB = MEMORY_LIMIT_MB_PER_SERVICE * totalServiceCount;
  const cpuLimit = CPU_LIMIT_PERCENT_PER_SERVICE * totalServiceCount;

  // ── AGGREGATE (entity_id = undefined) ──────────────────────────────────────
  const totalMemoryMB = Math.round(globalAgg.totalMemoryGB * 1024 * 100) / 100;
  const globalCostUsd = globalAgg.estimatedUsd > 0 ? Math.round(globalAgg.estimatedUsd * 10000) / 10000 : undefined;
  metrics.push({
    metricName: "memory_usage_mb",
    currentValue: totalMemoryMB,
    limitValue: memoryLimitMB,
    percentUsed: memoryLimitMB > 0 ? Math.round((totalMemoryMB / memoryLimitMB) * 10000) / 100 : 0,
    costUsd: globalCostUsd,
    costPerUnit: globalCostUsd != null && totalMemoryMB > 0
      ? Math.round((globalCostUsd / totalMemoryMB) * 1e8) / 1e8
      : undefined,
  });

  const cpuPercent = Math.round(globalAgg.totalCpuFraction * 100 * 100) / 100;
  metrics.push({
    metricName: "cpu_percent",
    currentValue: cpuPercent,
    limitValue: cpuLimit,
    percentUsed: cpuLimit > 0 ? Math.round((cpuPercent / cpuLimit) * 10000) / 100 : 0,
  });

  // ── PER-PROJECT entity breakdown ────────────────────────────────────────────
  for (const { project, serviceCount, agg } of projectData) {
    const projectMemoryLimitMB = MEMORY_LIMIT_MB_PER_SERVICE * Math.max(serviceCount, 1);
    const projectCpuLimit = CPU_LIMIT_PERCENT_PER_SERVICE * Math.max(serviceCount, 1);
    const projectMemoryMB = Math.round(agg.totalMemoryGB * 1024 * 100) / 100;
    const projectCpuPct = Math.round(agg.totalCpuFraction * 100 * 100) / 100;

    metrics.push({
      metricName: "memory_usage_mb",
      currentValue: projectMemoryMB,
      limitValue: projectMemoryLimitMB,
      percentUsed: projectMemoryLimitMB > 0 ? Math.round((projectMemoryMB / projectMemoryLimitMB) * 10000) / 100 : 0,
      entityId: project.id,
      entityLabel: project.name,
    });
    metrics.push({
      metricName: "cpu_percent",
      currentValue: projectCpuPct,
      limitValue: projectCpuLimit,
      percentUsed: projectCpuLimit > 0 ? Math.round((projectCpuPct / projectCpuLimit) * 10000) / 100 : 0,
      entityId: project.id,
      entityLabel: project.name,
    });
  }

  if (!isPro) return metrics;

  // ── PRO AGGREGATE ───────────────────────────────────────────────────────────
  const networkLimitMB = 100 * 1024;
  const diskLimitMB = 1024 * totalServiceCount;

  const peakCpuPercent = Math.round(globalAgg.peakCpuFraction * 100 * 100) / 100;
  metrics.push({
    metricName: "cpu_peak_percent",
    currentValue: peakCpuPercent,
    limitValue: cpuLimit,
    percentUsed: cpuLimit > 0 ? Math.round((peakCpuPercent / cpuLimit) * 10000) / 100 : 0,
  });

  const peakMemoryMB = Math.round(globalAgg.peakMemoryGB * 1024 * 100) / 100;
  metrics.push({
    metricName: "memory_peak_mb",
    currentValue: peakMemoryMB,
    limitValue: memoryLimitMB,
    percentUsed: memoryLimitMB > 0 ? Math.round((peakMemoryMB / memoryLimitMB) * 10000) / 100 : 0,
  });

  const networkTxMB = Math.round(globalAgg.totalNetworkTxMB * 100) / 100;
  metrics.push({
    metricName: "network_tx_mb",
    currentValue: networkTxMB,
    limitValue: networkLimitMB,
    percentUsed: networkLimitMB > 0 ? Math.round((networkTxMB / networkLimitMB) * 10000) / 100 : 0,
  });

  const networkRxMB = Math.round(globalAgg.totalNetworkRxMB * 100) / 100;
  metrics.push({
    metricName: "network_rx_mb",
    currentValue: networkRxMB,
    limitValue: networkLimitMB,
    percentUsed: networkLimitMB > 0 ? Math.round((networkRxMB / networkLimitMB) * 10000) / 100 : 0,
  });

  const diskUsedMB = Math.round(globalAgg.totalDiskGB * 1024 * 100) / 100;
  metrics.push({
    metricName: "disk_usage_mb",
    currentValue: diskUsedMB,
    limitValue: diskLimitMB,
    percentUsed: diskLimitMB > 0 ? Math.round((diskUsedMB / diskLimitMB) * 10000) / 100 : 0,
  });

  // ── PRO PER-PROJECT entity breakdown ────────────────────────────────────────
  for (const { project, serviceCount, agg } of projectData) {
    const projectMemoryLimitMB = MEMORY_LIMIT_MB_PER_SERVICE * Math.max(serviceCount, 1);
    const projectCpuLimit = CPU_LIMIT_PERCENT_PER_SERVICE * Math.max(serviceCount, 1);
    const projectDiskLimitMB = 1024 * Math.max(serviceCount, 1);

    const peakCpu = Math.round(agg.peakCpuFraction * 100 * 100) / 100;
    metrics.push({
      metricName: "cpu_peak_percent",
      currentValue: peakCpu,
      limitValue: projectCpuLimit,
      percentUsed: projectCpuLimit > 0 ? Math.round((peakCpu / projectCpuLimit) * 10000) / 100 : 0,
      entityId: project.id,
      entityLabel: project.name,
    });

    const peakMem = Math.round(agg.peakMemoryGB * 1024 * 100) / 100;
    metrics.push({
      metricName: "memory_peak_mb",
      currentValue: peakMem,
      limitValue: projectMemoryLimitMB,
      percentUsed: projectMemoryLimitMB > 0 ? Math.round((peakMem / projectMemoryLimitMB) * 10000) / 100 : 0,
      entityId: project.id,
      entityLabel: project.name,
    });

    const txMB = Math.round(agg.totalNetworkTxMB * 100) / 100;
    metrics.push({
      metricName: "network_tx_mb",
      currentValue: txMB,
      limitValue: networkLimitMB,
      percentUsed: networkLimitMB > 0 ? Math.round((txMB / networkLimitMB) * 10000) / 100 : 0,
      entityId: project.id,
      entityLabel: project.name,
    });

    const rxMB = Math.round(agg.totalNetworkRxMB * 100) / 100;
    metrics.push({
      metricName: "network_rx_mb",
      currentValue: rxMB,
      limitValue: networkLimitMB,
      percentUsed: networkLimitMB > 0 ? Math.round((rxMB / networkLimitMB) * 10000) / 100 : 0,
      entityId: project.id,
      entityLabel: project.name,
    });

    const diskMB = Math.round(agg.totalDiskGB * 1024 * 100) / 100;
    metrics.push({
      metricName: "disk_usage_mb",
      currentValue: diskMB,
      limitValue: projectDiskLimitMB,
      percentUsed: projectDiskLimitMB > 0 ? Math.round((diskMB / projectDiskLimitMB) * 10000) / 100 : 0,
      entityId: project.id,
      entityLabel: project.name,
    });
  }

  return metrics;
}
