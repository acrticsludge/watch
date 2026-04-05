import type { Metadata } from "next";
import { Suspense } from "react";
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
          Manage your account and billing.
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

  const [session, subscription] = await Promise.all([
    getSession(),
    getSubscription(),
  ]);

  return (
    <SettingsContent
      userEmail={session?.user?.email ?? ""}
      integrations={[]}
      alertConfigs={[]}
      alertChannels={[]}
      tier={subscription?.tier ?? "free"}
      subscriptionStatus={subscription?.status ?? null}
      trialEndsAt={subscription?.trial_ends_at ?? null}
      nextBillingAt={subscription?.next_billing_at ?? null}
      cancelAtPeriodEnd={subscription?.cancel_at_period_end ?? false}
      defaultTab={tab ?? "account"}
      visibleTabs={["account", "billing"]}
      snapshotMetrics={{}}
      spikeConfigs={[]}
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
