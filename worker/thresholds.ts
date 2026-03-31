import { createServiceClient } from "./lib/supabase/service";
import { fireAlerts } from "./lib/notifications";
import type { UsageMetric } from "./pollCycle";

export async function checkThresholds(
  userId: string,
  integrationId: string,
  metrics: UsageMetric[]
): Promise<void> {
  const supabase = createServiceClient();

  const { data: configs } = await supabase
    .from("alert_configs")
    .select("metric_name, threshold_percent, enabled")
    .eq("user_id", userId)
    .eq("integration_id", integrationId)
    .eq("enabled", true);

  if (!configs || configs.length === 0) return;

  // Get user email for notifications
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const userEmail = userData?.user?.email ?? "";

  // Get integration details for the alert payload
  const { data: integration } = await supabase
    .from("integrations")
    .select("service, account_label")
    .eq("id", integrationId)
    .single();

  for (const metric of metrics) {
    const config = configs.find((c) => c.metric_name === metric.metricName);
    if (!config) continue;

    if (metric.percentUsed === null) continue; // informational metric — no threshold comparison
    if (metric.percentUsed < config.threshold_percent) continue;

    // Anti-spam: check if alert was already fired since the last time
    // usage dropped below threshold
    const { data: recentAlerts } = await supabase
      .from("alert_history")
      .select("sent_at")
      .eq("integration_id", integrationId)
      .eq("metric_name", metric.metricName)
      .order("sent_at", { ascending: false })
      .limit(1);

    const lastAlertAt = recentAlerts?.[0]?.sent_at;

    if (lastAlertAt) {
      // Check if usage dropped below threshold since last alert
      const { data: droppedBelow } = await supabase
        .from("usage_snapshots")
        .select("recorded_at")
        .eq("integration_id", integrationId)
        .eq("metric_name", metric.metricName)
        .lt("percent_used", config.threshold_percent)
        .gt("recorded_at", lastAlertAt)
        .limit(1);

      if (!droppedBelow || droppedBelow.length === 0) {
        // Usage has NOT dropped below threshold since last alert — skip
        continue;
      }
    }

    // For MongoDB storage_mb alerts, attach the top-consuming database
    let topEntity: { label: string; valueMb: number } | undefined;
    if (integration?.service === "mongodb" && metric.metricName === "storage_mb") {
      const { data: dbRows } = await supabase
        .from("usage_snapshots")
        .select("entity_label, entity_id, current_value")
        .eq("integration_id", integrationId)
        .eq("metric_name", "db_size_mb")
        .not("entity_id", "is", null)
        .order("current_value", { ascending: false })
        .limit(1);
      if (dbRows && dbRows.length > 0) {
        topEntity = {
          label: dbRows[0].entity_label ?? dbRows[0].entity_id ?? "unknown",
          valueMb: dbRows[0].current_value,
        };
      }
    }

    // Fire the alert
    await fireAlerts(userEmail, {
      userId,
      integrationId,
      service: integration?.service ?? "unknown",
      accountLabel: integration?.account_label ?? "unknown",
      metricName: metric.metricName,
      currentValue: metric.currentValue,
      limitValue: metric.limitValue,
      percentUsed: metric.percentUsed,
      recordedAt: new Date().toISOString(),
      topEntity,
    });
  }
}
