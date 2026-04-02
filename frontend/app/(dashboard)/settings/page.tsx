import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSession, getSubscription } from "@/lib/queries/user";
import { SettingsContent } from "./SettingsContent";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Configure alert thresholds and notification channels.
        </p>
      </div>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SettingsData({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const supabase = await createClient();

  const [
    session,
    subscription,
    { data: integrations },
    { data: alertConfigs },
    { data: alertChannels },
  ] = await Promise.all([
    getSession(),
    getSubscription(),
    supabase
      .from("integrations")
      .select("id, service, account_label")
      .neq("status", "disconnected"),
    supabase.from("alert_configs").select("*"),
    supabase.from("alert_channels").select("id, type, config, enabled"),
  ]);

  // Fetch spike configs separately so a failure (e.g. migration not yet applied)
  // doesn't crash the entire settings page.
  let spikeConfigs: {
    integration_id: string;
    metric_name: string;
    enabled: boolean;
  }[] = [];
  try {
    const { data } = await supabase
      .from("spike_configs")
      .select("integration_id, metric_name, enabled");
    spikeConfigs = data ?? [];
  } catch {
    // Ignore errors, e.g., table not yet migrated
  }

  // Build a map of which metrics have snapshot data per integration.
  // Used to hide alert configs for pro metrics that this cluster never reports
  // (e.g. Network In/Out for Atlas M0 clusters which don't expose measurements).
  const integrationIds = (integrations ?? []).map((i) => i.id);
  const snapshotMetrics: Record<string, string[]> = {};
  if (integrationIds.length > 0) {
    const { data: snapRows } = await supabase
      .from("usage_snapshots")
      .select("integration_id, metric_name")
      .in("integration_id", integrationIds)
      .order("recorded_at", { ascending: false })
      .limit(200);
    const seen = new Map<string, Set<string>>();
    for (const row of snapRows ?? []) {
      if (!seen.has(row.integration_id))
        seen.set(row.integration_id, new Set());
      seen.get(row.integration_id)!.add(row.metric_name);
    }
    for (const [id, metricsSet] of seen) {
      snapshotMetrics[id] = [...metricsSet];
    }
  }

  // Auto-provision email channel for users who signed up before this was added
  let finalAlertChannels = alertChannels ?? [];
  if (session?.user) {
    const hasEmail = finalAlertChannels.some((c) => c.type === "email");
    if (!hasEmail) {
      await supabase.from("alert_channels").insert({
        user_id: session.user.id,
        type: "email",
        config: { email: session.user.email },
        enabled: true,
      });
      const { data: refreshed } = await supabase
        .from("alert_channels")
        .select("id, type, config, enabled");
      finalAlertChannels = refreshed ?? finalAlertChannels;
    }
  }

  return (
    <SettingsContent
      userEmail={session?.user?.email ?? ""}
      integrations={integrations ?? []}
      alertConfigs={alertConfigs ?? []}
      alertChannels={finalAlertChannels}
      tier={subscription?.tier ?? "free"}
      subscriptionStatus={subscription?.status ?? null}
      trialEndsAt={subscription?.trial_ends_at ?? null}
      nextBillingAt={subscription?.next_billing_at ?? null}
      cancelAtPeriodEnd={subscription?.cancel_at_period_end ?? false}
      defaultTab={tab ?? "alerts"}
      snapshotMetrics={snapshotMetrics}
      spikeConfigs={spikeConfigs ?? []}
    />
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab bar skeleton */}
      <div className="flex gap-1 border-b border-white/6 pb-0">
        {[80, 60, 80, 60].map((w, i) => (
          <div
            key={i}
            className={`h-9 w-${w} bg-white/5 rounded-t-lg animate-pulse`}
          />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-[#111] border border-white/6 rounded-xl p-5 h-24 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
