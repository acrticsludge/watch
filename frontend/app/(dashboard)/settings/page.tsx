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
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Configure alert thresholds and notification channels.</p>
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

  const [session, subscription, { data: integrations }, { data: alertConfigs }, { data: alertChannels }] =
    await Promise.all([
      getSession(),
      getSubscription(),
      supabase
        .from("integrations")
        .select("id, service, account_label")
        .neq("status", "disconnected"),
      supabase.from("alert_configs").select("*"),
      supabase.from("alert_channels").select("id, type, config, enabled"),
    ]);

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
      defaultTab={tab ?? "alerts"}
    />
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab bar skeleton */}
      <div className="flex gap-1 border-b border-white/6 pb-0">
        {[80, 60, 80, 60].map((w, i) => (
          <div key={i} className={`h-9 w-${w} bg-white/5 rounded-t-lg animate-pulse`} />
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
