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

function handleGitHubError(status: number, context: string): never {
  switch (status) {
    case 401:
      throw new Error(`GitHub: Invalid or expired Personal Access Token (${context})`);
    case 403:
      throw new Error(
        `GitHub: Token lacks required permissions (${context}). ` +
        `Org billing requires the 'read:org' scope; user billing requires 'read:user'.`
      );
    case 429:
      throw new Error(`GitHub: Rate limited (${context}). Will retry next cycle.`);
    default:
      throw new Error(`GitHub billing API error: ${status} (${context})`);
  }
}

export async function fetchGitHubUsage(
  integration: Integration,
  tier: string
): Promise<UsageMetric[]> {
  const token = decrypt(integration.api_key);
  // NEVER log token

  const isPro = tier === "pro" || tier === "team";

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const org = (integration.meta as { org?: string } | null)?.org;
  const baseUrl = org
    ? `https://api.github.com/orgs/${org}/settings/billing`
    : `https://api.github.com/user/settings/billing`;
  const context = org ? `org: ${org}` : "user billing";

  // ── FREE: Actions minutes (aggregate) ──────────────────────────────────────
  const actionsRes = await fetch(`${baseUrl}/actions`, { headers });
  if (actionsRes.status === 404) {
    console.warn(
      `[github] Billing API unavailable for ${context} (integration ${integration.id}) — no Actions billing data for this plan.`
    );
    return [];
  }
  if (!actionsRes.ok) handleGitHubError(actionsRes.status, context);

  const actionsData = await actionsRes.json() as {
    total_minutes_used: number;
    included_minutes: number;
    minutes_used_breakdown?: { UBUNTU?: number; MACOS?: number; WINDOWS?: number };
  };
  const minutesUsed = actionsData.total_minutes_used ?? 0;
  const minutesLimit = actionsData.included_minutes ?? 2000;
  const breakdown = actionsData.minutes_used_breakdown ?? {};

  const metrics: UsageMetric[] = [
    {
      metricName: "actions_minutes",
      currentValue: minutesUsed,
      limitValue: minutesLimit,
      percentUsed: minutesLimit > 0 ? Math.round((minutesUsed / minutesLimit) * 10000) / 100 : 0,
    },
  ];

  if (!isPro) return metrics;

  // ── PRO: OS-level breakdown (aggregate) ────────────────────────────────────
  if (breakdown.UBUNTU != null) {
    metrics.push({
      metricName: "actions_minutes_ubuntu",
      currentValue: breakdown.UBUNTU,
      limitValue: minutesLimit,
      percentUsed: minutesLimit > 0 ? Math.round((breakdown.UBUNTU / minutesLimit) * 10000) / 100 : 0,
    });
  }
  if (breakdown.MACOS != null) {
    metrics.push({
      metricName: "actions_minutes_macos",
      currentValue: breakdown.MACOS,
      limitValue: minutesLimit,
      percentUsed: minutesLimit > 0 ? Math.round((breakdown.MACOS / minutesLimit) * 10000) / 100 : 0,
    });
  }
  if (breakdown.WINDOWS != null) {
    metrics.push({
      metricName: "actions_minutes_windows",
      currentValue: breakdown.WINDOWS,
      limitValue: minutesLimit,
      percentUsed: minutesLimit > 0 ? Math.round((breakdown.WINDOWS / minutesLimit) * 10000) / 100 : 0,
    });
  }

  // ── PRO: Packages bandwidth ─────────────────────────────────────────────────
  const packagesRes = await fetch(`${baseUrl}/packages`, { headers });
  if (packagesRes.ok) {
    const pkgData = await packagesRes.json() as {
      total_gigabytes_bandwidth_used: number;
      included_gigabytes_bandwidth: number;
    };
    const pkgUsed = pkgData.total_gigabytes_bandwidth_used ?? 0;
    const pkgLimit = pkgData.included_gigabytes_bandwidth ?? 0;
    metrics.push({
      metricName: "packages_bandwidth_gb",
      currentValue: pkgUsed,
      limitValue: pkgLimit,
      percentUsed: pkgLimit > 0 ? Math.round((pkgUsed / pkgLimit) * 10000) / 100 : 0,
    });
  } else if (packagesRes.status !== 404) {
    console.warn(`[github] Packages billing API error: ${packagesRes.status} (${context})`);
  }

  // ── PRO: Shared storage ─────────────────────────────────────────────────────
  const storageRes = await fetch(`${baseUrl}/shared-storage`, { headers });
  if (storageRes.ok) {
    const storageData = await storageRes.json() as {
      estimated_storage_for_month: number; // GB
    };
    const storageLimitGb = 0.5; // Free tier: 0.5 GB
    const storageUsedGb = storageData.estimated_storage_for_month ?? 0;
    metrics.push({
      metricName: "actions_storage_gb",
      currentValue: storageUsedGb,
      limitValue: storageLimitGb,
      percentUsed: storageLimitGb > 0 ? Math.round((storageUsedGb / storageLimitGb) * 10000) / 100 : 0,
    });
  } else if (storageRes.status !== 404) {
    console.warn(`[github] Shared storage billing API error: ${storageRes.status} (${context})`);
  }

  // ── PRO: Per-repo Actions minutes ───────────────────────────────────────────
  // Approximated from workflow run durations — not exact billing minutes but shows relative usage per repo.
  // Limited to top 30 most recently active repos to stay within rate limits.
  const reposUrl = org
    ? `https://api.github.com/orgs/${org}/repos?per_page=30&sort=pushed&type=sources`
    : `https://api.github.com/user/repos?per_page=30&sort=pushed&type=owner`;

  const reposRes = await fetch(reposUrl, { headers });
  if (reposRes.ok) {
    const repos = await reposRes.json() as Array<{
      id: number;
      name: string;
      full_name: string;
      has_actions?: boolean;
    }>;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    for (const repo of repos.slice(0, 20)) {
      try {
        const runsRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/actions/runs?status=completed&created=>=${startOfMonth}&per_page=100`,
          { headers }
        );
        if (!runsRes.ok) continue;

        const runsData = await runsRes.json() as {
          workflow_runs: Array<{ run_duration_ms?: number }>;
        };

        const repoMinutes = runsData.workflow_runs.reduce(
          (sum, r) => sum + (r.run_duration_ms ?? 0),
          0
        ) / 60_000;

        if (repoMinutes > 0) {
          metrics.push({
            metricName: "actions_minutes",
            currentValue: Math.round(repoMinutes * 100) / 100,
            limitValue: minutesLimit,
            percentUsed: minutesLimit > 0
              ? Math.round((repoMinutes / minutesLimit) * 10000) / 100
              : 0,
            entityId: repo.full_name,
            entityLabel: repo.name,
          });
        }
      } catch (err) {
        console.warn(
          `[github] Could not fetch runs for ${repo.full_name}:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }
  } else if (reposRes.status !== 404) {
    console.warn(`[github] Repos list error: ${reposRes.status} (${context})`);
  }

  return metrics;
}
