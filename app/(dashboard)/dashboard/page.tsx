import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { UsageCard } from "@/components/dashboard/UsageCard";
import { DashboardRefresher } from "./DashboardRefresher";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

interface LatestSnapshot {
  metric_name: string;
  current_value: number;
  limit_value: number;
  percent_used: number;
  recorded_at: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: integrations } = await supabase
    .from("integrations")
    .select("id, service, account_label, status, last_synced_at")
    .neq("status", "disconnected")
    .order("created_at", { ascending: true });

  if (!integrations || integrations.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-white mb-1 tracking-tight">Dashboard</h1>
        <p className="text-zinc-600 mb-8 text-sm">Your usage overview</p>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
            <svg className="h-7 w-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white mb-2">
            No services connected yet
          </h2>
          <p className="text-zinc-600 text-sm max-w-sm mb-6">
            Connect GitHub Actions, Vercel, or Supabase to start monitoring your
            usage and get alerted before you hit limits.
          </p>
          <Button asChild>
            <Link href="/integrations">Connect a service</Link>
          </Button>
        </div>
      </div>
    );
  }

  const integrationIds = integrations.map((i) => i.id);

  const { data: snapshots } = await supabase
    .from("usage_snapshots")
    .select("integration_id, metric_name, current_value, limit_value, percent_used, recorded_at")
    .in("integration_id", integrationIds)
    .order("recorded_at", { ascending: false });

  const latestMap = new Map<string, LatestSnapshot>();
  for (const s of snapshots ?? []) {
    const key = `${s.integration_id}::${s.metric_name}`;
    if (!latestMap.has(key)) {
      latestMap.set(key, s);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
        <DashboardRefresher />
      </div>
      <p className="text-zinc-600 text-sm mb-8">
        {integrations.length} service{integrations.length !== 1 ? "s" : ""} connected
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const integrationSnapshots = Array.from(latestMap.entries())
            .filter(([key]) => key.startsWith(`${integration.id}::`))
            .map(([, v]) => v);

          if (integrationSnapshots.length === 0) {
            return (
              <div
                key={integration.id}
                className="bg-[#111] border border-white/[0.06] rounded-xl p-5"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.05] animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {integration.account_label}
                    </p>
                    <p className="text-xs text-zinc-600">{integration.service}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600">
                  {integration.status === "connected"
                    ? "Waiting for first sync..."
                    : `Status: ${integration.status}`}
                </p>
              </div>
            );
          }

          return integrationSnapshots.map((snap) => (
            <UsageCard
              key={`${integration.id}-${snap.metric_name}`}
              service={integration.service}
              accountLabel={integration.account_label}
              metricName={snap.metric_name}
              currentValue={snap.current_value}
              limitValue={snap.limit_value}
              percentUsed={snap.percent_used}
              lastSyncedAt={integration.last_synced_at}
              status={integration.status}
            />
          ));
        })}
      </div>
    </div>
  );
}
