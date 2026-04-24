import { createServiceClient } from "./lib/supabase/service";
import { fireAlerts } from "./lib/notifications";
import type { UsageMetric } from "./pollCycle";

const DEFAULT_DRIFT_PCT = 10;
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

export async function checkCostDrift(
  userId: string,
  integrationId: string,
  metrics: UsageMetric[],
  tier: string,
  projectId?: string | null,
): Promise<void> {
  if (tier === "free") return;

  const costMetrics = metrics.filter((m) => m.costPerUnit != null && m.costPerUnit > 0);
  if (costMetrics.length === 0) return;

  const supabase = createServiceClient();

  const { data: configs } = await supabase
    .from("cost_alert_configs")
    .select("metric_name, drift_percent")
    .eq("user_id", userId)
    .eq("integration_id", integrationId)
    .eq("enabled", true);

  const configMap = new Map<string, number>(
    (configs ?? []).map((c) => [c.metric_name, c.drift_percent])
  );

  const [{ data: userData }, { data: integration }] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase
      .from("integrations")
      .select("service, account_label")
      .eq("id", integrationId)
      .single(),
  ]);

  const userEmail = userData?.user?.email ?? "";

  for (const metric of costMetrics) {
    const driftPct = configMap.get(metric.metricName) ?? DEFAULT_DRIFT_PCT;

    // Require at least 3 prior readings with cost_per_unit to avoid false positives
    const { data: snapshots } = await supabase
      .from("usage_snapshots")
      .select("cost_per_unit")
      .eq("integration_id", integrationId)
      .eq("metric_name", metric.metricName)
      .is("entity_id", null)
      .not("cost_per_unit", "is", null)
      .order("recorded_at", { ascending: false })
      .range(1, 6); // skip the just-written row; get up to 6 prior

    if (!snapshots || snapshots.length < 3) continue;

    const values = snapshots.map((s) => s.cost_per_unit as number);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    if (mean === 0) continue;

    const current = metric.costPerUnit!;
    const deltaPct = Math.abs(current - mean) / mean;

    if (deltaPct <= driftPct / 100) continue;

    // Anti-spam: at most one cost_drift alert per metric per 24h
    const cooldownSince = new Date(Date.now() - COOLDOWN_MS).toISOString();
    const { data: recentAlert } = await supabase
      .from("alert_history")
      .select("id")
      .eq("integration_id", integrationId)
      .eq("metric_name", metric.metricName)
      .eq("alert_kind", "cost_drift")
      .gte("sent_at", cooldownSince)
      .limit(1);

    if (recentAlert && recentAlert.length > 0) continue;

    await fireAlerts(userEmail, {
      userId,
      projectId,
      integrationId,
      service: integration?.service ?? "unknown",
      accountLabel: integration?.account_label ?? "unknown",
      metricName: metric.metricName,
      currentValue: metric.currentValue,
      limitValue: metric.limitValue,
      percentUsed: metric.percentUsed,
      recordedAt: new Date().toISOString(),
      alertKind: "cost_drift",
      costContext: {
        previousCostPerUnit: Math.round(mean * 1e8) / 1e8,
        currentCostPerUnit: current,
        deltaPct: Math.round(deltaPct * 1000) / 10,
      },
    });
  }
}
