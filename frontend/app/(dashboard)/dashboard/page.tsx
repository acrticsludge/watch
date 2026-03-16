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
      <div className="min-h-[60vh] flex flex-col">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Monitor your dev stack usage in real time</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
            <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white mb-2">No services connected yet</h2>
          <p className="text-zinc-500 text-sm max-w-xs mb-6 leading-relaxed">
            Connect GitHub Actions, Vercel, or Supabase to start monitoring your usage and get alerted before you hit limits.
          </p>
          <Button asChild size="sm">
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

  const allSnapshots = Array.from(latestMap.values());
  const criticalCount = allSnapshots.filter((s) => s.percent_used >= 80).length;
  const warningCount = allSnapshots.filter((s) => s.percent_used >= 60 && s.percent_used < 80).length;
  const healthyCount = allSnapshots.filter((s) => s.percent_used < 60).length;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {integrations.length} service{integrations.length !== 1 ? "s" : ""} connected
            {allSnapshots.length > 0 && ` · ${allSnapshots.length} metric${allSnapshots.length !== 1 ? "s" : ""} tracked`}
          </p>
        </div>
        <DashboardRefresher />
      </div>

      {/* Status summary */}
      {allSnapshots.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#111] border border-white/6 rounded-xl px-4 py-3.5">
            <p className="text-xs text-zinc-600 mb-1.5 font-medium">Healthy</p>
            <p className="text-2xl font-semibold text-green-400 tabular-nums leading-none">{healthyCount}</p>
          </div>
          <div className="bg-[#111] border border-white/6 rounded-xl px-4 py-3.5">
            <p className="text-xs text-zinc-600 mb-1.5 font-medium">Warning</p>
            <p className="text-2xl font-semibold text-amber-400 tabular-nums leading-none">{warningCount}</p>
          </div>
          <div className="bg-[#111] border border-white/6 rounded-xl px-4 py-3.5">
            <p className="text-xs text-zinc-600 mb-1.5 font-medium">Critical</p>
            <p className="text-2xl font-semibold text-red-400 tabular-nums leading-none">{criticalCount}</p>
          </div>
        </div>
      )}

      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest shrink-0">Usage</p>
        <div className="flex-1 h-px bg-white/[0.05]" />
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const integrationSnapshots = Array.from(latestMap.entries())
            .filter(([key]) => key.startsWith(`${integration.id}::`))
            .map(([, v]) => v);

          if (integrationSnapshots.length === 0) {
            const isError = integration.status === "error";
            const isUnsupported = integration.status === "unsupported";

            let borderClass = "border-white/6";
            if (isError) borderClass = "border-red-500/20";
            if (isUnsupported) borderClass = "border-amber-500/20";

            return (
              <div
                key={integration.id}
                className={`bg-[#111] border rounded-xl p-5 ${borderClass}`}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  {isError || isUnsupported ? (
                    <>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isError ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                        <svg className={`h-4 w-4 ${isError ? "text-red-400" : "text-amber-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{integration.account_label}</p>
                        <p className="text-xs text-zinc-600 capitalize">{integration.service}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                        <div className="h-2.5 w-16 bg-white/4 rounded animate-pulse" />
                      </div>
                    </>
                  )}
                </div>
                <p className={`text-sm ${isError ? "text-red-400" : isUnsupported ? "text-amber-400/80" : "text-zinc-600"}`}>
                  {isError
                    ? "Sync failed — check your API key in Integrations."
                    : isUnsupported
                      ? "Billing API not available for your current plan."
                      : "Waiting for first sync..."}
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
