import { createServiceClient } from "./lib/supabase/service";
import { fireAlerts } from "./lib/notifications";
import type { UsageMetric } from "./pollCycle";

export async function checkSpikes(
  userId: string,
  integrationId: string,
  metrics: UsageMetric[],
  tier: string,
  projectId?: string | null,
): Promise<void> {
  if (tier === "free") return;

  const supabase = createServiceClient();

  const { data: configs } = await supabase
    .from("spike_configs")
    .select("metric_name")
    .eq("user_id", userId)
    .eq("integration_id", integrationId)
    .eq("enabled", true);

  if (!configs || configs.length === 0) return;

  const enabledMetrics = new Set(configs.map((c) => c.metric_name));

  // Get user email and integration details once, shared across metrics
  const [{ data: userData }, { data: integration }] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase
      .from("integrations")
      .select("service, account_label")
      .eq("id", integrationId)
      .single(),
  ]);

  const userEmail = userData?.user?.email ?? "";

  for (const metric of metrics) {
    if (!enabledMetrics.has(metric.metricName)) continue;

    // Fetch the last 24 snapshots for baseline computation (exclude just-written row
    // by ordering descending and skipping to offset 1)
    const { data: snapshots } = await supabase
      .from("usage_snapshots")
      .select("current_value")
      .eq("integration_id", integrationId)
      .eq("metric_name", metric.metricName)
      .is("entity_id", null)
      .order("recorded_at", { ascending: false })
      .range(1, 24); // skip the snapshot just written; get the 24 before it

    if (!snapshots || snapshots.length < 6) continue; // not enough baseline

    const values = snapshots.map((s) => s.current_value as number);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);

    if (stddev === 0) continue; // perfectly stable, no spike possible

    const zscore = (metric.currentValue - mean) / stddev;

    // Spike: statistically unusual AND meaningfully above baseline
    if (zscore <= 2.5 || metric.currentValue <= mean * 1.5) continue;

    // Anti-spam: at most one spike alert per metric per hour
    const cooldownSince = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSpike } = await supabase
      .from("alert_history")
      .select("id")
      .eq("integration_id", integrationId)
      .eq("metric_name", metric.metricName)
      .eq("alert_kind", "spike")
      .gte("sent_at", cooldownSince)
      .limit(1);

    if (recentSpike && recentSpike.length > 0) continue; // still in cool-down

    const multiplier = Math.round((metric.currentValue / mean) * 10) / 10;
    const baseline = Math.round(mean * 10) / 10;

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
      alertKind: "spike",
      spikeContext: { baseline, multiplier },
    });
  }
}
