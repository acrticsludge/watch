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

export async function fetchVercelUsage(
  integration: Integration
): Promise<UsageMetric[]> {
  const token = decrypt(integration.api_key);
  // NEVER log token

  const res = await fetch("https://api.vercel.com/v6/usage", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  switch (res.status) {
    case 401:
      throw new Error("Vercel: Invalid or expired API token.");
    case 403:
      throw new Error("Vercel: Token lacks billing read permissions.");
    case 404:
      // Vercel does not expose a billing/usage API for Hobby accounts.
      // Return empty — pollCycle will mark the integration as "unsupported".
      console.warn(
        `[vercel] Billing API unavailable for integration ${integration.id} — Hobby plan accounts are not supported.`
      );
      return [];
    case 429:
      throw new Error("Vercel: Rate limited. Will retry next cycle.");
  }

  if (!res.ok) {
    throw new Error(`Vercel billing API error: ${res.status}`);
  }

  // v6 response: { usage: { bandwidth: { usage, limit }, buildExecutionTime: { usage, limit }, serverlessFunctionExecution: { usage, limit } } }
  // Also handles v2-style flat fields as fallback.
  const raw = await res.json() as {
    usage?: {
      bandwidth?: { usage: number; limit: number };
      buildExecutionTime?: { usage: number; limit: number };
      serverlessFunctionExecution?: { usage: number; limit: number };
    };
    // v2 fallback
    bandwidth?: { usage: number; limit: number };
    buildMinutes?: { usage: number; limit: number };
    functionInvocations?: { usage: number; limit: number };
  };

  const nested = raw.usage ?? {};
  const bw = nested.bandwidth ?? raw.bandwidth;
  const build = nested.buildExecutionTime ?? raw.buildMinutes;
  const fn = nested.serverlessFunctionExecution ?? raw.functionInvocations;

  const metrics: UsageMetric[] = [];

  if (bw) {
    const { usage, limit } = bw;
    metrics.push({
      metricName: "bandwidth_gb",
      currentValue: Math.round((usage / (1024 ** 3)) * 100) / 100,
      limitValue: Math.round((limit / (1024 ** 3)) * 100) / 100,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  if (build) {
    const { usage, limit } = build;
    metrics.push({
      metricName: "build_minutes",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  if (fn) {
    const { usage, limit } = fn;
    metrics.push({
      metricName: "function_invocations",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  return metrics;
}
