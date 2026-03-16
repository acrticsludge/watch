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
    throw new Error("Supabase integration missing project_ref in meta.");
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

  switch (res.status) {
    case 401:
      throw new Error(
        "Supabase: Invalid or expired Management API token. " +
        "This must be a Personal Access Token from supabase.com/dashboard/account/tokens, " +
        "not the project anon or service_role key."
      );
    case 403:
      throw new Error(
        "Supabase: Token lacks permission to read project usage. " +
        "Ensure the Personal Access Token has the required scopes."
      );
    case 404: {
      const body404 = await res.text().catch(() => "(unreadable)");
      throw new Error(
        `Supabase: 404 on /v1/projects/${projectRef}/usage — ${body404}`
      );
    }
    case 429:
      throw new Error("Supabase: Rate limited. Will retry next cycle.");
  }

  if (!res.ok) {
    throw new Error(`Supabase usage API error: ${res.status}`);
  }

  // The Supabase Management API returns { usages: [{ metric, usage, available_in_period, capped }] }
  const data = await res.json() as {
    usages?: Array<{ metric: string; usage: number; available_in_period: number | null }>;
  };

  const usageMap = new Map<string, { usage: number; available: number | null }>();
  for (const entry of data.usages ?? []) {
    usageMap.set(entry.metric, { usage: entry.usage ?? 0, available: entry.available_in_period ?? null });
  }

  const metrics: UsageMetric[] = [];

  const dbSize = usageMap.get("db_size");
  if (dbSize !== undefined) {
    const mb = Math.round(dbSize.usage / (1024 * 1024) * 100) / 100;
    const limitMb = dbSize.available != null ? Math.round(dbSize.available / (1024 * 1024)) : FREE_TIER_LIMITS.db_size_mb;
    metrics.push({
      metricName: "db_size_mb",
      currentValue: mb,
      limitValue: limitMb,
      percentUsed: Math.round((mb / limitMb) * 10000) / 100,
    });
  }

  const storage = usageMap.get("storage_size");
  if (storage !== undefined) {
    const mb = Math.round(storage.usage / (1024 * 1024) * 100) / 100;
    const limitMb = storage.available != null ? Math.round(storage.available / (1024 * 1024)) : FREE_TIER_LIMITS.storage_mb;
    metrics.push({
      metricName: "storage_mb",
      currentValue: mb,
      limitValue: limitMb,
      percentUsed: Math.round((mb / limitMb) * 10000) / 100,
    });
  }

  const mau = usageMap.get("monthly_active_users");
  if (mau !== undefined) {
    const limit = mau.available ?? FREE_TIER_LIMITS.monthly_active_users;
    metrics.push({
      metricName: "monthly_active_users",
      currentValue: mau.usage,
      limitValue: limit,
      percentUsed: Math.round((mau.usage / limit) * 10000) / 100,
    });
  }

  // If the API returned usages but none matched our known metrics, log for debugging
  if (data.usages && data.usages.length > 0 && metrics.length === 0) {
    console.warn(`[supabase] Unrecognised usage metrics for project '${projectRef}':`, data.usages.map((u) => u.metric));
  }

  return metrics;
}
