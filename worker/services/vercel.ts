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

  const res = await fetch("https://api.vercel.com/v2/billing/usage", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Vercel billing API error: ${res.status}`);
  }

  const data = await res.json() as {
    bandwidth?: { usage: number; limit: number };
    buildMinutes?: { usage: number; limit: number };
    functionInvocations?: { usage: number; limit: number };
  };

  const metrics: UsageMetric[] = [];

  if (data.bandwidth) {
    const { usage, limit } = data.bandwidth;
    metrics.push({
      metricName: "bandwidth_gb",
      currentValue: Math.round((usage / (1024 ** 3)) * 100) / 100,
      limitValue: Math.round((limit / (1024 ** 3)) * 100) / 100,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  if (data.buildMinutes) {
    const { usage, limit } = data.buildMinutes;
    metrics.push({
      metricName: "build_minutes",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  if (data.functionInvocations) {
    const { usage, limit } = data.functionInvocations;
    metrics.push({
      metricName: "function_invocations",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  return metrics;
}
