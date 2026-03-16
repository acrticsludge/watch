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
    if (res.status === 404) {
      console.warn(`[github] Billing API unavailable for org '${org}' (integration ${integration.id}) — no Actions billing data for this plan.`);
      return [];
    }
    if (!res.ok) handleGitHubError(res.status, `org: ${org}`);
    const data = await res.json() as {
      total_minutes_used: number;
      included_minutes: number;
    };
    minutesUsed = data.total_minutes_used ?? 0;
    minutesLimit = data.included_minutes ?? 2000;
  } else {
    const res = await fetch(
      "https://api.github.com/user/settings/billing/actions",
      { headers }
    );
    if (res.status === 404) {
      console.warn(`[github] Billing API unavailable for user account (integration ${integration.id}) — no Actions billing data for this plan.`);
      return [];
    }
    if (!res.ok) handleGitHubError(res.status, "user billing");
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
