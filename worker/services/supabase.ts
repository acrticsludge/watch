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

// Supabase free tier limits
const FREE_TIER_LIMITS = {
  db_size_mb: 500,
  row_count: 500_000,
  storage_mb: 1_000,
  monthly_active_users: 50_000,
};

export async function fetchSupabaseUsage(
  integration: Integration
): Promise<UsageMetric[]> {
  const token = decrypt(integration.api_key);
  // NEVER log token

  const projectRef = (integration.meta as { project_ref?: string } | null)
    ?.project_ref;

  if (!projectRef) {
    throw new Error("Supabase integration missing project_ref in meta");
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/usage`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Supabase usage API error: ${res.status}`);
  }

  const data = await res.json() as {
    db_size?: number;
    num_rows?: number;
    storage_size?: number;
    monthly_active_users?: number;
  };

  const metrics: UsageMetric[] = [];

  if (data.db_size !== undefined) {
    const mb = Math.round(data.db_size / (1024 * 1024) * 100) / 100;
    metrics.push({
      metricName: "db_size_mb",
      currentValue: mb,
      limitValue: FREE_TIER_LIMITS.db_size_mb,
      percentUsed: Math.round((mb / FREE_TIER_LIMITS.db_size_mb) * 10000) / 100,
    });
  }

  if (data.num_rows !== undefined) {
    metrics.push({
      metricName: "row_count",
      currentValue: data.num_rows,
      limitValue: FREE_TIER_LIMITS.row_count,
      percentUsed:
        Math.round((data.num_rows / FREE_TIER_LIMITS.row_count) * 10000) / 100,
    });
  }

  if (data.storage_size !== undefined) {
    const mb = Math.round(data.storage_size / (1024 * 1024) * 100) / 100;
    metrics.push({
      metricName: "storage_mb",
      currentValue: mb,
      limitValue: FREE_TIER_LIMITS.storage_mb,
      percentUsed:
        Math.round((mb / FREE_TIER_LIMITS.storage_mb) * 10000) / 100,
    });
  }

  if (data.monthly_active_users !== undefined) {
    metrics.push({
      metricName: "monthly_active_users",
      currentValue: data.monthly_active_users,
      limitValue: FREE_TIER_LIMITS.monthly_active_users,
      percentUsed:
        Math.round(
          (data.monthly_active_users / FREE_TIER_LIMITS.monthly_active_users) *
            10000
        ) / 100,
    });
  }

  return metrics;
}
