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

export async function fetchGitHubUsage(
  integration: Integration
): Promise<UsageMetric[]> {
  const token = decrypt(integration.api_key);
  // NEVER log token

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const org = (integration.meta as { org?: string } | null)?.org;

  let minutesUsed = 0;
  let minutesLimit = 2000; // free tier default

  if (org) {
    const res = await fetch(
      `https://api.github.com/orgs/${org}/settings/billing/actions`,
      { headers }
    );
    if (!res.ok) throw new Error(`GitHub org billing API error: ${res.status}`);
    const data = await res.json() as {
      total_minutes_used: number;
      included_minutes: number;
    };
    minutesUsed = data.total_minutes_used ?? 0;
    minutesLimit = data.included_minutes ?? 2000;
  } else {
    // User-level billing
    const res = await fetch(
      "https://api.github.com/user/settings/billing/actions",
      { headers }
    );
    if (!res.ok) throw new Error(`GitHub billing API error: ${res.status}`);
    const data = await res.json() as {
      total_minutes_used: number;
      included_minutes: number;
    };
    minutesUsed = data.total_minutes_used ?? 0;
    minutesLimit = data.included_minutes ?? 2000;
  }

  const percentUsed = minutesLimit > 0 ? (minutesUsed / minutesLimit) * 100 : 0;

  return [
    {
      metricName: "actions_minutes",
      currentValue: minutesUsed,
      limitValue: minutesLimit,
      percentUsed: Math.round(percentUsed * 100) / 100,
    },
  ];
}
