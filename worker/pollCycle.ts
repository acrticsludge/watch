import { createServiceClient } from "./lib/supabase/service";
import { fetchGitHubUsage } from "./services/github";
import { fetchVercelUsage } from "./services/vercel";
import { fetchSupabaseUsage } from "./services/supabase";
import { fetchRailwayUsage } from "./services/railway";
import { fetchMongoDBUsage } from "./services/mongodb";
import { checkThresholds } from "./thresholds";
import { checkSpikes } from "./spikes";
import { sendFirstSyncEmail } from "./lib/onboarding/emails";

export interface UsageMetric {
  metricName: string;
  currentValue: number;
  limitValue: number | null;   // null = informational metric with no hard quota
  percentUsed: number | null;  // null when limitValue is null
  entityId?: string;    // undefined = account-level aggregate; set = per-repo/project/bucket
  entityLabel?: string; // human-readable entity name for display
}

export async function runPollCycle(): Promise<void> {
  const supabase = createServiceClient();

  const { data: integrations, error } = await supabase
    .from("integrations")
    .select("id, user_id, service, account_label, api_key, meta, last_synced_at")
    .neq("status", "disconnected");

  if (error) {
    console.error("[pollCycle] Failed to fetch integrations:", error.message);
    return;
  }

  if (!integrations || integrations.length === 0) {
    console.log("[pollCycle] No integrations to poll.");
    return;
  }

  // Build a userId → tier map so services can gate pro metrics
  const userIds = [...new Set(integrations.map((i) => i.user_id))];
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("user_id, tier, status")
    .in("user_id", userIds)
    .in("status", ["active", "trialing", "past_due"]);

  const tierMap = new Map<string, string>();
  for (const sub of subscriptions ?? []) {
    tierMap.set(sub.user_id, sub.tier);
  }

  const FREE_POLL_INTERVAL_MS = 14.5 * 60 * 1000;
  const PRO_POLL_INTERVAL_MS = 4.5 * 60 * 1000;

  // Filter out integrations that were synced too recently for their tier
  const now = Date.now();
  const dueIntegrations = integrations.filter((i) => {
    const tier = tierMap.get(i.user_id) ?? "free";
    const interval = tier === "free" ? FREE_POLL_INTERVAL_MS : PRO_POLL_INTERVAL_MS;
    if (!i.last_synced_at) return true;
    return now - new Date(i.last_synced_at).getTime() >= interval;
  });

  console.log(
    `[pollCycle] ${dueIntegrations.length}/${integrations.length} integration(s) due for polling.`
  );

  if (dueIntegrations.length === 0) return;

  // Track users whose integration syncs data for the first time this cycle.
  // Map of userId → service (first service that syncs wins).
  const firstSyncCandidates = new Map<string, string>();

  const results = await Promise.allSettled(
    dueIntegrations.map(async (rawIntegration) => {
      // Cast meta from Json to the expected object type
      const integration = {
        ...rawIntegration,
        meta: rawIntegration.meta as Record<string, unknown> | null,
      };
      const tier = tierMap.get(integration.user_id) ?? "free";
      const isFirstSync = !integration.last_synced_at;
      try {
        let metrics: UsageMetric[] = [];

        switch (integration.service) {
          case "github":
            metrics = await fetchGitHubUsage(integration, tier);
            break;
          case "vercel":
            metrics = await fetchVercelUsage(integration, tier);
            break;
          case "supabase":
            metrics = await fetchSupabaseUsage(integration, tier);
            break;
          case "railway":
            metrics = await fetchRailwayUsage(integration, tier);
            break;
          case "mongodb":
            metrics = await fetchMongoDBUsage(integration, tier);
            break;
          default:
            console.warn(`[pollCycle] Unknown service: ${integration.service}`);
            return;
        }

        // Write usage snapshots — split aggregate and entity inserts so one
        // failing (e.g. NOT NULL constraint on limit_value) doesn't block the other.
        if (metrics.length > 0) {
          const aggregateMetrics = metrics.filter((m) => !m.entityId);
          const entityMetrics = metrics.filter((m) => !!m.entityId);

          const toRow = (m: UsageMetric) => ({
            integration_id: integration.id,
            metric_name: m.metricName,
            current_value: m.currentValue,
            limit_value: m.limitValue,
            percent_used: m.percentUsed,
            entity_id: m.entityId ?? null,
            entity_label: m.entityLabel ?? null,
          });

          if (aggregateMetrics.length > 0) {
            const { error: aggError } = await supabase
              .from("usage_snapshots")
              .insert(aggregateMetrics.map(toRow));
            if (aggError) {
              console.error(
                `[pollCycle] Failed to insert aggregate snapshots for ${integration.id}:`,
                aggError.message
              );
            }
          }

          if (entityMetrics.length > 0) {
            const { error: entityError } = await supabase
              .from("usage_snapshots")
              .insert(entityMetrics.map(toRow));
            if (entityError) {
              console.error(
                `[pollCycle] Failed to insert entity snapshots for ${integration.id}:`,
                entityError.message
              );
            }
          }

          // Update last_synced_at and set status to connected
          await supabase
            .from("integrations")
            .update({ last_synced_at: new Date().toISOString(), status: "connected" })
            .eq("id", integration.id);

          // Record first-sync candidates for onboarding email (sent after the loop)
          if (isFirstSync && !firstSyncCandidates.has(integration.user_id)) {
            firstSyncCandidates.set(integration.user_id, integration.service);
          }

          // Check thresholds only on aggregate (non-entity) metrics to avoid alert spam
          await checkThresholds(integration.user_id, integration.id, aggregateMetrics);
          await checkSpikes(integration.user_id, integration.id, aggregateMetrics, tier);
        } else {
          // Service connected successfully but returned no data (e.g. plan doesn't expose billing API).
          // Mark as "unsupported" so the dashboard can show a clear message instead of an error.
          await supabase
            .from("integrations")
            .update({ last_synced_at: new Date().toISOString(), status: "unsupported" })
            .eq("id", integration.id);
        }
      } catch (err) {
        console.error(
          `[pollCycle] Error polling integration ${integration.id} (${integration.service}):`,
          err instanceof Error ? err.message : String(err)
        );
        // Mark integration as error — but do NOT log the decrypted API key
        await supabase
          .from("integrations")
          .update({ status: "error" })
          .eq("id", integration.id);
        // Re-throw so Promise.allSettled counts this as rejected (failed)
        throw err;
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(
    `[pollCycle] Done. ${results.length - failed} succeeded, ${failed} failed.`
  );

  // ── First-sync onboarding emails ───────────────────────────────────────────
  if (firstSyncCandidates.size > 0) {
    await Promise.allSettled(
      Array.from(firstSyncCandidates.entries()).map(async ([userId, service]) => {
        try {
          // Try to claim the "first_sync" slot — unique constraint prevents duplicates
          const { error: insertError } = await supabase
            .from("onboarding_emails")
            .insert({ user_id: userId, type: "first_sync" });
          if (insertError) return; // 23505 = already sent, or other DB error

          const { data: authUser } = await supabase.auth.admin.getUserById(userId);
          const email = authUser?.user?.email;
          if (email) {
            await sendFirstSyncEmail(email, service);
            console.log(`[pollCycle] First-sync email sent to user ${userId}`);
          }
        } catch (err) {
          console.error(
            `[pollCycle] First-sync email failed for user ${userId}:`,
            err instanceof Error ? err.message : String(err)
          );
        }
      })
    );
  }

  // ── Prune old snapshots ────────────────────────────────────────────────────
  // Hard cutoff: delete anything older than 30 days (pro/team limit)
  const hardCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("usage_snapshots").delete().lt("recorded_at", hardCutoff);

  // Free tier: enforce 7-day limit
  const freeIntegrationIds = integrations
    .filter((i) => (tierMap.get(i.user_id) ?? "free") === "free")
    .map((i) => i.id);

  if (freeIntegrationIds.length > 0) {
    const freeCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("usage_snapshots")
      .delete()
      .in("integration_id", freeIntegrationIds)
      .lt("recorded_at", freeCutoff);
  }
}
