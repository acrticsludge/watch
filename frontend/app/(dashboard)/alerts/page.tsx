import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { METRIC_LABELS, SERVICE_LABELS, relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Alert History" };

export default async function AlertsPage() {
  const supabase = await createClient();

  const { data: historyRaw } = await supabase
    .from("alert_history")
    .select("id, metric_name, percent_used, channel, sent_at, integration_id")
    .order("sent_at", { ascending: false })
    .limit(100);

  const integrationIds = [...new Set((historyRaw ?? []).map((h) => h.integration_id))];
  const { data: integrations } = integrationIds.length > 0
    ? await supabase
        .from("integrations")
        .select("id, service, account_label")
        .in("id", integrationIds)
    : { data: [] };

  const intgMap = new Map((integrations ?? []).map((i) => [i.id, i]));

  const history = (historyRaw ?? []).map((h) => ({
    ...h,
    integration: intgMap.get(h.integration_id) ?? null,
  }));

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-1 tracking-tight">Alert History</h1>
      <p className="text-zinc-600 text-sm mb-8">A log of all alerts that have been sent.</p>

      {!history || history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-14 w-14 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
            <svg className="h-7 w-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white mb-1">No alerts yet</h2>
          <p className="text-zinc-600 text-sm max-w-xs">
            Alerts will appear here when your usage crosses a threshold.
          </p>
        </div>
      ) : (
        <div className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Metric</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Usage</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">Channel</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wide">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map((row) => {
                const intg = row.integration;
                const pct = Math.round(row.percent_used);
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-200">
                        {intg ? SERVICE_LABELS[intg.service] ?? intg.service : "—"}
                      </p>
                      {intg && (
                        <p className="text-xs text-zinc-600">{intg.account_label}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      {METRIC_LABELS[row.metric_name] ?? row.metric_name}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={pct >= 80 ? "danger" : pct >= 60 ? "warning" : "success"}
                      >
                        {pct}%
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-zinc-500 capitalize">{row.channel}</td>
                    <td className="px-5 py-3 text-zinc-700 text-xs">
                      {relativeTime(row.sent_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
