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

const FREE_TIER_LIMITS = {
  db_size_mb: 500,
  storage_mb: 1_000,
  monthly_active_users: 50_000,
};

const PRO_TIER_LIMITS = {
  db_connections: 60,
  realtime_messages: 2_000_000,
  realtime_peak_connections: 200,
  func_invocations: 500_000,
  db_egress_mb: 5 * 1024,
};

async function runQuery(
  projectRef: string,
  token: string,
  query: string
): Promise<Record<string, unknown>[]> {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );

  if (res.status === 401) throw new Error("Supabase: Invalid or expired Management API token.");
  if (res.status === 403) throw new Error("Supabase: Token lacks permission to query the database.");
  if (res.status === 404) throw new Error(`Supabase: Project '${projectRef}' not found or database query endpoint unavailable.`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase database query error: ${res.status} — ${body}`);
  }

  return res.json() as Promise<Record<string, unknown>[]>;
}

export async function fetchSupabaseUsage(
  integration: Integration,
  tier: string
): Promise<UsageMetric[]> {
  const token = decrypt(integration.api_key);
  // NEVER log token

  const isPro = tier === "pro" || tier === "team";

  const projectRef = (integration.meta as { project_ref?: string } | null)?.project_ref;
  if (!projectRef) {
    throw new Error("Supabase integration missing project_ref in meta.");
  }

  const metrics: UsageMetric[] = [];

  // ── FREE: DB size ───────────────────────────────────────────────────────────
  const dbRows = await runQuery(
    projectRef,
    token,
    "SELECT pg_database_size(current_database()) AS db_bytes"
  );
  const dbBytes = Number(dbRows[0]?.db_bytes ?? 0);
  const dbMb = Math.round((dbBytes / (1024 * 1024)) * 100) / 100;
  metrics.push({
    metricName: "db_size_mb",
    currentValue: dbMb,
    limitValue: FREE_TIER_LIMITS.db_size_mb,
    percentUsed: Math.round((dbMb / FREE_TIER_LIMITS.db_size_mb) * 10000) / 100,
  });

  // ── FREE: Monthly active users ──────────────────────────────────────────────
  const mauRows = await runQuery(
    projectRef,
    token,
    "SELECT COUNT(*)::int AS mau FROM auth.users WHERE last_sign_in_at >= date_trunc('month', now())"
  );
  const mau = Number(mauRows[0]?.mau ?? 0);
  metrics.push({
    metricName: "monthly_active_users",
    currentValue: mau,
    limitValue: FREE_TIER_LIMITS.monthly_active_users,
    percentUsed: Math.round((mau / FREE_TIER_LIMITS.monthly_active_users) * 10000) / 100,
  });

  // ── FREE: Storage (aggregate + per-bucket breakdown) ───────────────────────
  const bucketsRes = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/storage/buckets`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (bucketsRes.ok) {
    const buckets = await bucketsRes.json() as Array<{
      id: string;
      name: string;
      size?: number;
    }>;

    const totalBytes = buckets.reduce((sum, b) => sum + (b.size ?? 0), 0);
    const storageMb = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;

    // Aggregate
    metrics.push({
      metricName: "storage_mb",
      currentValue: storageMb,
      limitValue: FREE_TIER_LIMITS.storage_mb,
      percentUsed: Math.round((storageMb / FREE_TIER_LIMITS.storage_mb) * 10000) / 100,
    });

    // Per-bucket breakdown
    for (const bucket of buckets) {
      const bucketBytes = bucket.size ?? 0;
      if (bucketBytes > 0) {
        const bucketMb = Math.round((bucketBytes / (1024 * 1024)) * 100) / 100;
        metrics.push({
          metricName: "storage_mb",
          currentValue: bucketMb,
          limitValue: FREE_TIER_LIMITS.storage_mb,
          percentUsed: Math.round((bucketMb / FREE_TIER_LIMITS.storage_mb) * 10000) / 100,
          entityId: bucket.id,
          entityLabel: bucket.name,
        });
      }
    }
  } else {
    console.warn(`[supabase] Could not fetch storage buckets for project '${projectRef}': ${bucketsRes.status}`);
  }

  if (!isPro) return metrics;

  // ── PRO: Active DB connections ──────────────────────────────────────────────
  try {
    const connRows = await runQuery(
      projectRef,
      token,
      "SELECT COUNT(*)::int AS connections FROM pg_stat_activity WHERE state IS NOT NULL"
    );
    const connections = Number(connRows[0]?.connections ?? 0);
    metrics.push({
      metricName: "db_connections",
      currentValue: connections,
      limitValue: PRO_TIER_LIMITS.db_connections,
      percentUsed: Math.round((connections / PRO_TIER_LIMITS.db_connections) * 10000) / 100,
    });
  } catch (err) {
    console.warn(`[supabase] Could not fetch connection count for '${projectRef}':`, err instanceof Error ? err.message : String(err));
  }

  // ── PRO: Buffer cache hit ratio ─────────────────────────────────────────────
  try {
    const cacheRows = await runQuery(
      projectRef,
      token,
      `SELECT ROUND(
        100.0 * SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0),
        2
      ) AS cache_hit_ratio FROM pg_statio_user_tables`
    );
    const ratio = Number(cacheRows[0]?.cache_hit_ratio ?? 0);
    if (ratio > 0) {
      metrics.push({
        metricName: "cache_hit_ratio",
        currentValue: ratio,
        limitValue: 100,
        percentUsed: ratio,
      });
    }
  } catch (err) {
    console.warn(`[supabase] Could not fetch cache hit ratio for '${projectRef}':`, err instanceof Error ? err.message : String(err));
  }

  // ── PRO: Per-table storage breakdown ───────────────────────────────────────
  try {
    const tableRows = await runQuery(
      projectRef,
      token,
      `SELECT
        schemaname || '.' || relname AS table_name,
        pg_total_relation_size(relid)::bigint AS total_bytes
      FROM pg_stat_user_tables
      ORDER BY total_bytes DESC
      LIMIT 20`
    );
    for (const row of tableRows) {
      const bytes = Number(row.total_bytes ?? 0);
      if (bytes > 0) {
        const tableMb = Math.round((bytes / (1024 * 1024)) * 100) / 100;
        const tableName = String(row.table_name ?? "unknown");
        metrics.push({
          metricName: "db_size_mb",
          currentValue: tableMb,
          limitValue: FREE_TIER_LIMITS.db_size_mb,
          percentUsed: Math.round((tableMb / FREE_TIER_LIMITS.db_size_mb) * 10000) / 100,
          entityId: tableName,
          entityLabel: tableName,
        });
      }
    }
  } catch (err) {
    console.warn(`[supabase] Could not fetch table sizes for '${projectRef}':`, err instanceof Error ? err.message : String(err));
  }

  // ── PRO: Management API usage (realtime, edge functions, egress) ────────────
  const usageRes = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/usage`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (usageRes.ok) {
    const usageData = await usageRes.json() as {
      metrics?: Array<{ metric: string; usage: number; limit: number }>;
    };

    for (const m of usageData.metrics ?? []) {
      const usage = m.usage ?? 0;
      const limit = m.limit;

      switch (m.metric) {
        case "realtime_message_count":
          metrics.push({
            metricName: "realtime_messages",
            currentValue: usage,
            limitValue: limit ?? PRO_TIER_LIMITS.realtime_messages,
            percentUsed: (limit ?? PRO_TIER_LIMITS.realtime_messages) > 0
              ? Math.round((usage / (limit ?? PRO_TIER_LIMITS.realtime_messages)) * 10000) / 100
              : 0,
          });
          break;
        case "realtime_peak_connection":
          metrics.push({
            metricName: "realtime_peak_connections",
            currentValue: usage,
            limitValue: limit ?? PRO_TIER_LIMITS.realtime_peak_connections,
            percentUsed: (limit ?? PRO_TIER_LIMITS.realtime_peak_connections) > 0
              ? Math.round((usage / (limit ?? PRO_TIER_LIMITS.realtime_peak_connections)) * 10000) / 100
              : 0,
          });
          break;
        case "func_invocations":
          metrics.push({
            metricName: "func_invocations",
            currentValue: usage,
            limitValue: limit ?? PRO_TIER_LIMITS.func_invocations,
            percentUsed: (limit ?? PRO_TIER_LIMITS.func_invocations) > 0
              ? Math.round((usage / (limit ?? PRO_TIER_LIMITS.func_invocations)) * 10000) / 100
              : 0,
          });
          break;
        case "db_egress": {
          const egressMb = Math.round(usage * 1024 * 100) / 100;
          const limitMb = limit != null
            ? Math.round(limit * 1024 * 100) / 100
            : PRO_TIER_LIMITS.db_egress_mb;
          metrics.push({
            metricName: "db_egress_mb",
            currentValue: egressMb,
            limitValue: limitMb,
            percentUsed: limitMb > 0 ? Math.round((egressMb / limitMb) * 10000) / 100 : 0,
          });
          break;
        }
      }
    }
  } else if (usageRes.status !== 404) {
    console.warn(`[supabase] Management API usage endpoint error for '${projectRef}': ${usageRes.status}`);
  }

  return metrics;
}
