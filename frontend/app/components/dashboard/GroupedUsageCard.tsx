"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import {
  METRIC_LABELS,
  METRIC_UNITS,
  SERVICE_LABELS,
  relativeTime,
} from "@/lib/utils";
import { Badge } from "@/app/components/ui/badge";
import { UsageHistoryChart } from "./UsageHistoryChart";

interface Snapshot {
  metric_name: string;
  current_value: number;
  limit_value: number | null;
  percent_used: number | null;
  entity_id?: string | null;
  entity_label?: string | null;
  cost_usd?: number | null;
  cost_per_unit?: number | null;
}

interface HistoryEntry {
  recorded_at: string;
  percent_used: number | null;
  current_value: number;
  limit_value: number | null;
}

interface GroupedUsageCardProps {
  integrationId: string;
  service: string;
  accountLabel: string;
  snapshots: Snapshot[];
  entitySnapshots?: Snapshot[];
  lastSyncedAt: string | null;
  status: string;
  isPro?: boolean;
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
      viewBox="0 0 1024 1024"
      fill="currentColor"
      className="h-4 w-4 text-zinc-200"
    >
      <path d="M4.756 438.175A520.713 520.713 0 0 0 0 489.735h777.799c-2.716-5.306-6.365-10.09-10.045-14.772-132.97-171.791-204.498-156.896-306.819-161.26-34.114-1.403-57.249-1.967-193.037-1.967-72.677 0-151.688.185-228.628.39-9.96 26.884-19.566 52.942-24.243 74.14h398.571v51.909H4.756ZM783.93 541.696H.399c.82 13.851 2.112 27.517 3.978 40.999h723.39c32.248 0 50.299-18.297 56.162-40.999ZM45.017 724.306S164.941 1018.77 511.46 1024c207.112 0 385.071-123.006 465.907-299.694H45.017Z" />
      <path d="M511.454 0C319.953 0 153.311 105.16 65.31 260.612c68.771-.144 202.704-.226 202.704-.226h.031v-.051c158.309 0 164.193.707 195.118 1.998l19.149.706c66.7 2.224 148.683 9.384 213.19 58.19 35.015 26.471 85.571 84.896 115.708 126.52 27.861 38.499 35.876 82.756 16.933 125.158-17.436 38.97-54.952 62.215-100.383 62.215H16.69s4.233 17.944 10.58 37.751h970.632A510.385 510.385 0 0 0 1024 512.218C1024.01 229.355 794.532 0 511.454 0Z" />
    </svg>
  ),
  mongodb: (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-[#47A248]"
    >
      <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.109-1.622-.197-2.218z" />
    </svg>
  ),
};

// Metrics that are instantaneous readings, sizes, or rates — they fluctuate up
// and down rather than accumulating toward a monthly limit, so linear extrapolation
// produces meaningless "days to limit" values.
const FLUCTUATING_METRICS = new Set([
  // Instantaneous resource usage
  "memory_peak_mb",
  "memory_resident_mb",
  "cpu_percent",
  "cpu_peak_percent",
  "disk_usage_mb",
  "collection_size_mb",
  "actions_storage_gb",
  // Instantaneous counts & ratios
  "db_connections",
  "connections",
  "cache_hit_ratio",
  "realtime_peak_connections",
  "slow_queries_count",
  // Latency / performance readings
  "replication_lag_s",
  "avg_read_latency_ms",
  "avg_write_latency_ms",
  "disk_iops_read",
  "disk_iops_write",
  // Hourly network throughput rates (not monthly cumulative totals)
  "network_bytes_in_mb",
  "network_bytes_out_mb",
]);

type Projection =
  | { type: "will-exceed"; daysLeft: number }
  | { type: "safe"; projectedPct: number };

function getProjection(
  metricName: string,
  current: number,
  limit: number | null,
): Projection | null {
  if (FLUCTUATING_METRICS.has(metricName)) return null;
  if (limit === null || limit <= 0) return null;
  const now = new Date();
  const dayOfMonth = now.getDate();
  // Need at least 3 days of data before the extrapolation is meaningful.
  // On day 1-2, dividing by dayOfMonth produces a wildly inflated daily rate.
  if (dayOfMonth < 3) return null;
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  if (current <= 0) return null;
  const dailyRate = current / dayOfMonth;
  const daysLeft = (limit - current) / dailyRate;
  if (daysLeft <= daysRemaining) {
    return { type: "will-exceed", daysLeft: Math.max(0, Math.round(daysLeft)) };
  }
  const projected = current + dailyRate * daysRemaining;
  return {
    type: "safe",
    projectedPct: Math.min(99, Math.round((projected / limit) * 100)),
  };
}

function projectMonthlyCost(costUsd: number): number | null {
  const now = new Date();
  const dayOfMonth = now.getDate();
  if (dayOfMonth < 3) return null;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.round((costUsd * (daysInMonth / dayOfMonth)) * 100) / 100;
}

function formatCost(usd: number): string {
  if (usd >= 100) return `$${Math.round(usd)}`;
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(4)}`;
}

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

function MetricRow({
  snap,
  entitySnapshots,
  integrationId,
  isPro,
  service,
}: {
  snap: Snapshot;
  entitySnapshots: Snapshot[];
  integrationId: string;
  isPro: boolean;
  service: string;
}) {
  const [showChart, setShowChart] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const pct = Math.round(snap.percent_used ?? 0);
  const unit = METRIC_UNITS[snap.metric_name] ?? "";
  const subRows = entitySnapshots.filter(
    (e) => e.metric_name === snap.metric_name,
  );

  async function toggleChart() {
    if (showChart) {
      setShowChart(false);
      return;
    }
    setShowChart(true);
    if (history !== null) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/usage/history?integration_id=${integrationId}&metric=${snap.metric_name}`,
      );
      if (res.ok) setHistory(await res.json());
      else setHistory([]);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div key={snap.metric_name}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-500">
          {METRIC_LABELS[snap.metric_name] ?? snap.metric_name}
        </span>
        <div className="flex items-center gap-2">
          {isPro && (
            <button
              onClick={toggleChart}
              className="flex items-center gap-0.5 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              History
              <ChevronDown
                className={`h-3 w-3 transition-transform ${showChart ? "rotate-180" : ""}`}
              />
            </button>
          )}
          <Badge
            variant={getBadgeVariant(pct)}
            className="text-[10px] py-0 px-1.5"
          >
            {pct}%
          </Badge>
        </div>
      </div>
      {snap.limit_value !== null ? (
        <div className="h-1.5 w-full rounded-full bg-white/6 mb-1.5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getBarClass(pct)}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      ) : (
        <div className="h-1.5 mb-1.5" />
      )}
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-xs text-zinc-600">
          {snap.current_value.toLocaleString()}
          {snap.limit_value !== null
            ? ` / ${snap.limit_value.toLocaleString()} ${unit}`
            : ` ${unit}`}
        </span>
        {(() => {
          const proj = getProjection(
            snap.metric_name,
            snap.current_value,
            snap.limit_value,
          );
          if (!proj) return null;
          if (proj.type === "will-exceed") {
            return (
              <span
                className={`text-xs tabular-nums font-medium ${pct >= 80 ? "text-red-400" : "text-amber-400"}`}
              >
                {proj.daysLeft === 0
                  ? "Hits limit today"
                  : `Limit in ~${proj.daysLeft}d`}
              </span>
            );
          }
          return (
            <span className="text-xs text-zinc-600 tabular-nums">
              ~{proj.projectedPct}% by month end
            </span>
          );
        })()}
      </div>
      {subRows.length > 0 && (
        <div className="mt-2 space-y-1 pl-3 border-l border-white/6">
          {subRows.map((e) => (
            <div
              key={e.entity_id}
              className="flex items-center justify-between"
            >
              <span className="text-[11px] text-zinc-600 truncate max-w-40">
                {e.entity_label ?? e.entity_id}
              </span>
              <span className="text-[11px] text-zinc-600 shrink-0 ml-2">
                {e.current_value.toLocaleString()} {unit}
              </span>
            </div>
          ))}
        </div>
      )}
      {snap.cost_per_unit != null && (
        <p className="text-[10px] text-zinc-600 mt-1 tabular-nums">
          Rate: ${snap.cost_per_unit.toFixed(6)} / {unit || "unit"}
        </p>
      )}
      {service === "supabase" && snap.metric_name === "db_size_mb" && (
        <p className="text-[10px] text-zinc-600 mt-1.5 leading-relaxed">
          Measured via PostgreSQL — may be a few MB lower than the Supabase
          dashboard, which includes WAL files and dead tuple overhead.
        </p>
      )}
      {showChart && (
        <div className="mt-3 p-3 bg-white/3 rounded-lg border border-white/6">
          {loading ? (
            <p className="text-zinc-600 text-xs text-center py-4">Loading...</p>
          ) : (
            <UsageHistoryChart
              metricName={snap.metric_name}
              snapshots={history ?? []}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── MongoDB per-database/collection accordion ─────────────────────────────────

function MongoDBDatabaseAccordion({
  entitySnapshots,
  clusterName,
}: {
  entitySnapshots: Snapshot[];
  clusterName: string;
}) {
  const dbSnapshots = entitySnapshots.filter(
    (e) => e.metric_name === "db_size_mb",
  );
  const collSnapshots = entitySnapshots.filter(
    (e) => e.metric_name === "collection_size_mb",
  );
  const [expandedDbs, setExpandedDbs] = useState<Set<string>>(new Set());

  if (dbSnapshots.length === 0 && entitySnapshots.length === 0) return null;

  function toggle(dbName: string) {
    setExpandedDbs((prev) => {
      const next = new Set(prev);
      if (next.has(dbName)) next.delete(dbName);
      else next.add(dbName);
      return next;
    });
  }

  return (
    <div className="mt-3">
      {/* Cluster name header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Cluster
        </span>
        <span className="text-xs text-zinc-300 font-medium truncate">
          {clusterName}
        </span>
      </div>

      {dbSnapshots.length > 0 && (
        <>
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Databases
          </p>
          {(() => {
            const topDb = dbSnapshots.reduce(
              (a, b) => (b.current_value > a.current_value ? b : a),
              dbSnapshots[0],
            );
            return topDb ? (
              <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-white/4 border border-white/8">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    Top DB
                  </span>
                  <span className="text-xs text-zinc-300 font-medium truncate">
                    {topDb.entity_label ?? topDb.entity_id}
                  </span>
                </div>
                <span className="text-xs text-zinc-400 tabular-nums shrink-0 ml-2">
                  {topDb.current_value.toLocaleString()} MB
                </span>
              </div>
            ) : null;
          })()}
          <div className="space-y-1">
            {dbSnapshots.map((db) => {
              const dbName = db.entity_id ?? db.entity_label ?? "unknown";
              const isExpanded = expandedDbs.has(dbName);
              const dbColls = collSnapshots.filter((c) =>
                c.entity_id?.startsWith(`${dbName}/`),
              );
              return (
                <div
                  key={dbName}
                  className="rounded-lg border border-white/6 overflow-hidden"
                >
                  <button
                    onClick={() => toggle(dbName)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ChevronDown
                        className={`h-3 w-3 text-zinc-600 shrink-0 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                      />
                      <span className="text-xs text-zinc-300 truncate">
                        {db.entity_label ?? dbName}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0 ml-2 tabular-nums">
                      {db.current_value.toLocaleString()} MB
                    </span>
                  </button>
                  {isExpanded && dbColls.length > 0 && (
                    <div className="border-t border-white/6 px-3 py-1.5 space-y-1 bg-white/[0.02]">
                      {dbColls.map((coll) => (
                        <div
                          key={coll.entity_id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[11px] text-zinc-600 truncate max-w-40">
                            {coll.entity_label ?? coll.entity_id}
                          </span>
                          <span className="text-[11px] text-zinc-500 shrink-0 ml-2 tabular-nums">
                            {coll.current_value.toLocaleString()} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {isExpanded && dbColls.length === 0 && (
                    <div className="border-t border-white/6 px-3 py-2 bg-white/[0.02]">
                      <p className="text-[11px] text-zinc-700">
                        No collection data — grant{" "}
                        <span className="text-zinc-500">readAnyDatabase</span>{" "}
                        role in Atlas to enable
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function UsageDetailModal({
  integrationId,
  service,
  accountLabel,
  snapshots,
  entitySnapshots = [],
  lastSyncedAt,
  status,
  isPro = false,
  onClose,
}: GroupedUsageCardProps & { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <motion.div
        className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl shadow-black/60 max-h-[85vh] flex flex-col"
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/6 flex items-center justify-center shrink-0">
              {SERVICE_ICONS[service]}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                {SERVICE_LABELS[service] ?? service}
              </p>
              <p className="text-xs text-zinc-500">{accountLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Metrics — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.10)_transparent]">
          {snapshots.map((snap) => (
            <MetricRow
              key={snap.metric_name}
              snap={snap}
              entitySnapshots={entitySnapshots}
              integrationId={integrationId}
              isPro={isPro}
              service={service}
            />
          ))}
          {service === "mongodb" &&
            snapshots.every(
              (s) => s.current_value === 0 && (s.percent_used ?? 0) === 0,
            ) && (
              <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-2.5">
                <p className="text-xs text-amber-500/80 leading-relaxed">
                  M0 clusters don&apos;t expose measurements via the Atlas Admin
                  API. Add a connection string with{" "}
                  <span className="font-medium">clusterMonitor</span> access in
                  Integrations to get live storage and connection data.
                </p>
              </div>
            )}
          {service === "mongodb" && (
            <MongoDBDatabaseAccordion
              entitySnapshots={entitySnapshots}
              clusterName={accountLabel}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pt-4 pb-6 mt-2 border-t border-white/4 flex items-center justify-between shrink-0">
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
    </motion.div>
  );
}

const MAX_VISIBLE = 3;

export function GroupedUsageCard({
  integrationId,
  service,
  accountLabel,
  snapshots,
  entitySnapshots = [],
  lastSyncedAt,
  status,
  isPro = false,
}: GroupedUsageCardProps) {
  const [open, setOpen] = useState(false);
  const worstPct = Math.round(
    Math.max(...snapshots.map((s) => s.percent_used ?? 0)),
  );
  const sorted = [...snapshots].sort(
    (a, b) => (b.percent_used ?? 0) - (a.percent_used ?? 0),
  );
  const visible = sorted.slice(0, MAX_VISIBLE);
  const hiddenCount = Math.max(0, snapshots.length - MAX_VISIBLE);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={() => setOpen(true)}
        className="h-full bg-[#111] border border-white/6 rounded-xl p-5 flex flex-col hover:border-white/10 hover:shadow-lg hover:shadow-black/30 transition-[border-color,box-shadow] duration-200 cursor-pointer"
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

        {/* Compact bars (top 3 by usage) */}
        <div className="flex-1 space-y-2.5 mb-3">
          {visible.map((snap) => {
            const pct = Math.round(snap.percent_used ?? 0);
            const proj = getProjection(
              snap.metric_name,
              snap.current_value,
              snap.limit_value,
            );
            return (
              <div key={snap.metric_name} className="flex items-center gap-2">
                <span className="text-xs text-zinc-600 w-32 shrink-0 truncate">
                  {METRIC_LABELS[snap.metric_name] ?? snap.metric_name}
                </span>
                <div className="flex-1 h-1 rounded-full bg-white/6 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getBarClass(pct)}`}
                    style={{
                      width:
                        snap.limit_value !== null
                          ? `${Math.min(pct, 100)}%`
                          : "0%",
                    }}
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0 justify-end">
                  <span className="text-xs text-zinc-500 tabular-nums">
                    {pct}%
                  </span>
                  {proj &&
                    (proj.type === "will-exceed" ? (
                      <span
                        className={`text-[9px] tabular-nums font-medium ${pct >= 80 ? "text-red-400" : "text-amber-400"}`}
                      >
                        · {proj.daysLeft === 0 ? "today" : `~${proj.daysLeft}d`}
                      </span>
                    ) : (
                      <span className="text-[9px] text-zinc-600 tabular-nums">
                        · ~{proj.projectedPct}%
                      </span>
                    ))}
                  {snap.cost_usd != null && (() => {
                    const monthly = projectMonthlyCost(snap.cost_usd);
                    return monthly != null ? (
                      <span className="text-[9px] text-zinc-600 tabular-nums">
                        · {formatCost(monthly)}/mo
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })}
          {hiddenCount > 0 && (
            <p className="text-[11px] text-zinc-600">
              +{hiddenCount} more · click for details
            </p>
          )}
          {service === "mongodb" &&
            snapshots.every(
              (s) => s.current_value === 0 && (s.percent_used ?? 0) === 0,
            ) && (
              <p className="text-[10px] text-amber-500/60 mt-1.5">
                M0: add a connection string in Integrations for live data
              </p>
            )}
        </div>

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

      <AnimatePresence>
        {open && (
          <UsageDetailModal
            integrationId={integrationId}
            service={service}
            accountLabel={accountLabel}
            snapshots={snapshots}
            entitySnapshots={entitySnapshots}
            lastSyncedAt={lastSyncedAt}
            status={status}
            isPro={isPro}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
