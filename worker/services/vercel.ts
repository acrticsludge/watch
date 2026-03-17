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

interface UsageField {
  usage: number;
  limit: number;
}

export async function fetchVercelUsage(
  integration: Integration,
  tier: string
): Promise<UsageMetric[]> {
  const token = decrypt(integration.api_key);
  // NEVER log token

  const isPro = tier === "pro" || tier === "team";

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

  // v6 nested format; v2-style flat fields as fallback
  const raw = await res.json() as {
    usage?: {
      bandwidth?: UsageField;
      buildExecutionTime?: UsageField;
      serverlessFunctionExecution?: UsageField;
      edgeFunctionExecution?: UsageField;
      imageOptimizations?: UsageField;
      analyticsEvents?: UsageField;
      deployments?: UsageField;
    };
    bandwidth?: UsageField;
    buildMinutes?: UsageField;
    functionInvocations?: UsageField;
  };

  const nested = raw.usage ?? {};
  const metrics: UsageMetric[] = [];

  // ── FREE: bandwidth ─────────────────────────────────────────────────────────
  const bw = nested.bandwidth ?? raw.bandwidth;
  if (bw) {
    const { usage, limit } = bw;
    metrics.push({
      metricName: "bandwidth_gb",
      currentValue: Math.round((usage / (1024 ** 3)) * 100) / 100,
      limitValue: Math.round((limit / (1024 ** 3)) * 100) / 100,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  // ── FREE: build minutes ─────────────────────────────────────────────────────
  const build = nested.buildExecutionTime ?? raw.buildMinutes;
  if (build) {
    const { usage, limit } = build;
    metrics.push({
      metricName: "build_minutes",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  // ── FREE: serverless function invocations ───────────────────────────────────
  const fn = nested.serverlessFunctionExecution ?? raw.functionInvocations;
  if (fn) {
    const { usage, limit } = fn;
    metrics.push({
      metricName: "function_invocations",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  if (!isPro) return metrics;

  // ── PRO: edge function execution ────────────────────────────────────────────
  if (nested.edgeFunctionExecution) {
    const { usage, limit } = nested.edgeFunctionExecution;
    metrics.push({
      metricName: "edge_function_execution_ms",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  // ── PRO: image optimizations ────────────────────────────────────────────────
  if (nested.imageOptimizations) {
    const { usage, limit } = nested.imageOptimizations;
    metrics.push({
      metricName: "image_optimizations",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  // ── PRO: analytics events ───────────────────────────────────────────────────
  if (nested.analyticsEvents) {
    const { usage, limit } = nested.analyticsEvents;
    metrics.push({
      metricName: "analytics_events",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  // ── PRO: deployments (aggregate) ───────────────────────────────────────────
  const accountDeployLimit = nested.deployments?.limit ?? 6000;
  if (nested.deployments) {
    const { usage, limit } = nested.deployments;
    metrics.push({
      metricName: "deployments",
      currentValue: usage,
      limitValue: limit,
      percentUsed: limit > 0 ? Math.round((usage / limit) * 10000) / 100 : 0,
    });
  }

  // ── PRO: per-project deployment breakdown ───────────────────────────────────
  const projectsRes = await fetch("https://api.vercel.com/v9/projects?limit=100", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (projectsRes.ok) {
    const projectsData = await projectsRes.json() as {
      projects: Array<{ id: string; name: string }>;
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    for (const project of projectsData.projects) {
      try {
        const deploysRes = await fetch(
          `https://api.vercel.com/v6/deployments?projectId=${project.id}&since=${startOfMonth}&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!deploysRes.ok) continue;

        const deploysData = await deploysRes.json() as {
          deployments: unknown[];
        };
        const deployCount = deploysData.deployments.length;

        if (deployCount > 0) {
          metrics.push({
            metricName: "deployments",
            currentValue: deployCount,
            limitValue: accountDeployLimit,
            percentUsed: accountDeployLimit > 0
              ? Math.round((deployCount / accountDeployLimit) * 10000) / 100
              : 0,
            entityId: project.id,
            entityLabel: project.name,
          });
        }
      } catch (err) {
        console.warn(
          `[vercel] Could not fetch deployments for project ${project.id}:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }
  } else if (projectsRes.status !== 404) {
    console.warn(`[vercel] Projects list error: ${projectsRes.status}`);
  }

  return metrics;
}
