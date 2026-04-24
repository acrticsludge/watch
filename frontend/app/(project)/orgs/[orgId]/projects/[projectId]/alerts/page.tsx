import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/queries/user";
import { METRIC_LABELS, SERVICE_LABELS, relativeTime } from "@/lib/utils";
import { Badge } from "@/app/components/ui/badge";
import { TIER_LIMITS } from "@/lib/tiers";

export const metadata: Metadata = { title: "Alert History" };

export default function ProjectAlertsPage({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Alert History</h1>
          <Suspense fallback={<div className="h-4 w-48 bg-white/5 rounded animate-pulse mt-1" />}>
            <AlertsSubtitle params={params} />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <UpgradeLink />
        </Suspense>
      </div>
      <Suspense fallback={<AlertsSkeleton />}>
        <AlertsContent params={params} />
      </Suspense>
    </div>
  );
}

/** Returns the PostgREST OR filter that covers both new and pre-migration rows. */
async function buildAlertFilter(projectId: string): Promise<{ filter: string; integrationIds: string[] }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("integrations")
    .select("id")
    .eq("project_id", projectId);
  const integrationIds = (data ?? []).map((i) => i.id);

  // New/backfilled rows have project_id set. Old pre-migration rows have project_id NULL
  // but their integration_id still belongs to this project.
  const filter =
    integrationIds.length > 0
      ? `project_id.eq.${projectId},and(project_id.is.null,integration_id.in.(${integrationIds.join(",")}))`
      : `project_id.eq.${projectId}`;

  return { filter, integrationIds };
}

async function AlertsSubtitle({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const subscription = await getSubscription();
  const tier = (subscription?.tier as keyof typeof TIER_LIMITS) ?? "free";
  const historyDays = TIER_LIMITS[tier]?.historyDays ?? TIER_LIMITS.free.historyDays;
  const since = new Date(Date.now() - historyDays * 24 * 60 * 60 * 1000).toISOString();

  const { filter } = await buildAlertFilter(projectId);
  const { count } = await supabase
    .from("alert_history")
    .select("id", { count: "exact", head: true })
    .or(filter)
    .gte("sent_at", since);

  const rows = count ?? 0;
  return (
    <p className="text-zinc-500 text-sm mt-1">
      {rows > 0
        ? `${rows} alert${rows !== 1 ? "s" : ""} in the last ${historyDays} days`
        : `A log of alerts from the last ${historyDays} days`}
    </p>
  );
}

async function UpgradeLink() {
  const subscription = await getSubscription();
  const tier = subscription?.tier ?? "free";
  if (tier !== "free") return null;
  return (
    <a href="/settings?tab=billing" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
      7-day history · <span className="underline underline-offset-2">Upgrade for 30 days</span>
    </a>
  );
}

async function AlertsContent({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const subscription = await getSubscription();

  const tier = (subscription?.tier as keyof typeof TIER_LIMITS) ?? "free";
  const historyDays = TIER_LIMITS[tier]?.historyDays ?? TIER_LIMITS.free.historyDays;
  const since = new Date(Date.now() - historyDays * 24 * 60 * 60 * 1000).toISOString();

  const { filter } = await buildAlertFilter(projectId);
  const { data: history } = await supabase
    .from("alert_history")
    .select("id, metric_name, percent_used, channel, sent_at, alert_kind, cost_context, integration_id, integration:integrations(id, service, account_label)")
    .or(filter)
    .gte("sent_at", since)
    .order("sent_at", { ascending: false })
    .limit(200);

  const rows = history ?? [];
  if (rows.length === 0) return <EmptyState />;

  return (
    <div className="bg-[#111] border border-white/6 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-140">
        <thead>
          <tr className="border-b border-white/6 bg-white/2">
            <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Service</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Metric</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Usage</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Channel</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/4">
          {rows.map((row) => {
            const intg = Array.isArray(row.integration) ? row.integration[0] : row.integration;
            const isCostDrift = row.alert_kind === "cost_drift";
            const costCtx = row.cost_context as { deltaPct?: number } | null;
            const pct = Math.round(row.percent_used ?? 0);
            return (
              <tr key={row.id} className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-zinc-200">{intg ? (SERVICE_LABELS[intg.service] ?? intg.service) : "—"}</p>
                  {intg && <p className="text-xs text-zinc-600">{intg.account_label}</p>}
                </td>
                <td className="px-5 py-3 text-zinc-400">{METRIC_LABELS[row.metric_name] ?? row.metric_name}</td>
                <td className="px-5 py-3">
                  {isCostDrift ? (
                    <Badge variant="warning">
                      💰 {costCtx?.deltaPct != null ? `${costCtx.deltaPct > 0 ? "+" : ""}${costCtx.deltaPct.toFixed(1)}%` : "rate change"}
                    </Badge>
                  ) : (
                    <Badge variant={pct >= 80 ? "danger" : pct >= 60 ? "warning" : "success"}>{pct}%</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-zinc-500 capitalize">{row.channel}</td>
                <td className="px-5 py-3 text-zinc-700 text-xs">{relativeTime(row.sent_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-14 w-14 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center mb-4">
        <svg className="h-7 w-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-white mb-1">No alerts yet</h2>
      <p className="text-zinc-600 text-sm max-w-xs">Alerts will appear here when your usage crosses a threshold.</p>
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <div className="bg-[#111] border border-white/6 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
      <div className="border-b border-white/6 bg-white/2 px-5 py-3 flex gap-8 min-w-140">
        <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-white/4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-3.5 flex gap-8 items-center min-w-140">
            <div className="space-y-1.5 w-24">
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
              <div className="h-2.5 w-14 bg-white/4 rounded animate-pulse" />
            </div>
            <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
            <div className="h-5 w-10 bg-white/5 rounded-full animate-pulse" />
            <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
