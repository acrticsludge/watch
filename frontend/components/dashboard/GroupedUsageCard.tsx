"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  METRIC_LABELS,
  METRIC_UNITS,
  SERVICE_LABELS,
  relativeTime,
} from "@/lib/utils";
import { Badge } from "@/app/components/ui/badge";

interface Snapshot {
  metric_name: string;
  current_value: number;
  limit_value: number;
  percent_used: number;
  entity_id: string | null;
  entity_label: string | null;
}

interface GroupedUsageCardProps {
  service: string;
  accountLabel: string;
  snapshots: Snapshot[];
  lastSyncedAt: string | null;
  status: string;
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  github: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-zinc-200"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  vercel: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-zinc-200"
    >
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  ),
  supabase: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-emerald-400"
    >
      <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
    </svg>
  ),
  railway: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-violet-400"
    >
      <path d="M3.456 12.004c.006 1.278.23 2.504.636 3.645L12 17.32l7.908-1.671a12.2 12.2 0 0 0 .636-3.645H3.456zm16.932-1.5H3.612A8.516 8.516 0 0 1 12 3.996a8.516 8.516 0 0 1 8.388 6.508zM12 2.496C6.754 2.496 2.496 6.754 2.496 12S6.754 21.504 12 21.504 21.504 17.246 21.504 12 17.246 2.496 12 2.496zm0 17.508a7.5 7.5 0 0 1-7.2-5.391l7.2 1.522 7.2-1.522A7.5 7.5 0 0 1 12 20.004z" />
    </svg>
  ),
};

function getBadgeVariant(pct: number): "success" | "warning" | "danger" {
  if (pct >= 80) return "danger";
  if (pct >= 60) return "warning";
  return "success";
}

function getBarClass(pct: number) {
  if (pct >= 80) return "bg-red-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-blue-500";
}

export function GroupedUsageCard({
  service,
  accountLabel,
  snapshots,
  lastSyncedAt,
  status,
}: GroupedUsageCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Separate aggregate metrics from per-entity breakdowns
  const topLevel = snapshots.filter((s) => !s.entity_id);
  const entityGroups = new Map<string, Snapshot[]>();
  for (const s of snapshots.filter((s) => s.entity_id)) {
    if (!entityGroups.has(s.metric_name)) entityGroups.set(s.metric_name, []);
    entityGroups.get(s.metric_name)!.push(s);
  }

  const worstPct =
    topLevel.length > 0
      ? Math.round(Math.max(...topLevel.map((s) => s.percent_used)))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => setExpanded(false)}
      className="bg-[#111] border border-white/6 rounded-xl p-5 hover:border-white/10 hover:shadow-lg hover:shadow-black/30 transition-[border-color,box-shadow] duration-300 cursor-default"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/6 flex items-center justify-center shrink-0">
            {SERVICE_ICONS[service]}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">
              {SERVICE_LABELS[service] ?? service}
            </p>
            <p className="text-xs text-zinc-600">{accountLabel}</p>
          </div>
        </div>
        <Badge variant={getBadgeVariant(worstPct)}>{worstPct}%</Badge>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {!expanded ? (
          /* Collapsed: compact bar rows for aggregate metrics only */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="space-y-2 mb-3">
              {topLevel.map((snap) => (
                <div key={snap.metric_name} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 w-32 shrink-0 truncate">
                    {METRIC_LABELS[snap.metric_name] ?? snap.metric_name}
                  </span>
                  <div className="flex-1 h-1 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getBarClass(snap.percent_used)}`}
                      style={{ width: `${Math.min(snap.percent_used, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-7 text-right shrink-0">
                    {Math.round(snap.percent_used)}%
                  </span>
                </div>
              ))}
            </div>
            {entityGroups.size > 0 && (
              <p className="text-[10px] text-zinc-700 mt-1">
                Hover for per-
                {service === "github"
                  ? "repo"
                  : service === "supabase"
                    ? "table/bucket"
                    : "project"}{" "}
                breakdown
              </p>
            )}
          </motion.div>
        ) : (
          /* Expanded: full metric detail rows with entity sub-rows */
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="space-y-4 mb-3">
              {topLevel.map((snap) => {
                const pct = Math.round(snap.percent_used);
                const unit = METRIC_UNITS[snap.metric_name] ?? "";
                const entityRows = entityGroups.get(snap.metric_name);

                return (
                  <div key={snap.metric_name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-zinc-500">
                        {METRIC_LABELS[snap.metric_name] ?? snap.metric_name}
                      </span>
                      <Badge
                        variant={getBadgeVariant(pct)}
                        className="text-[10px] py-0 px-1.5"
                      >
                        {pct}%
                      </Badge>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/6 mb-1.5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getBarClass(pct)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-xs text-zinc-600">
                      {snap.current_value.toLocaleString()} /{" "}
                      {snap.limit_value.toLocaleString()} {unit}
                    </span>

                    {/* Per-entity sub-rows */}
                    {entityRows && entityRows.length > 0 && (
                      <div className="mt-2 ml-2 space-y-1.5 border-l border-white/[0.05] pl-3">
                        {entityRows
                          .sort((a, b) => b.current_value - a.current_value)
                          .slice(0, 8)
                          .map((e) => (
                            <div
                              key={e.entity_id}
                              className="flex items-center gap-2"
                            >
                              <span
                                className="text-[10px] text-zinc-700 w-28 shrink-0 truncate"
                                title={e.entity_label ?? ""}
                              >
                                {e.entity_label ?? e.entity_id}
                              </span>
                              <div className="flex-1 h-0.5 rounded-full bg-white/[0.05] overflow-hidden">
                                <div
                                  className={`h-full rounded-full opacity-70 ${getBarClass(e.percent_used)}`}
                                  style={{
                                    width: `${Math.min(e.percent_used, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-zinc-700 shrink-0 tabular-nums">
                                {e.current_value.toLocaleString()} {unit}
                              </span>
                            </div>
                          ))}
                        {entityRows.length > 8 && (
                          <p className="text-[10px] text-zinc-700">
                            +{entityRows.length - 8} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="pt-3 border-t border-white/4 flex items-center justify-between">
        <span className="text-xs text-zinc-700">
          {lastSyncedAt
            ? `Synced ${relativeTime(lastSyncedAt)}`
            : "Never synced"}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 text-xs ${
            status === "connected"
              ? "text-green-500"
              : status === "error"
                ? "text-red-400"
                : "text-zinc-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "connected"
                ? "bg-green-500"
                : status === "error"
                  ? "bg-red-500"
                  : "bg-zinc-600"
            }`}
          />
          {status}
        </span>
      </div>
    </motion.div>
  );
}
