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
  limit_value: number;
  percent_used: number;
  entity_id?: string | null;
  entity_label?: string | null;
}

interface HistoryEntry {
  recorded_at: string;
  percent_used: number;
  current_value: number;
  limit_value: number;
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
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-zinc-200">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  vercel: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-zinc-200">
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  ),
  supabase: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-emerald-400">
      <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
    </svg>
  ),
  railway: (
    <svg viewBox="0 0 1024 1024" fill="currentColor" className="h-4 w-4 text-zinc-200">
      <path d="M4.756 438.175A520.713 520.713 0 0 0 0 489.735h777.799c-2.716-5.306-6.365-10.09-10.045-14.772-132.97-171.791-204.498-156.896-306.819-161.26-34.114-1.403-57.249-1.967-193.037-1.967-72.677 0-151.688.185-228.628.39-9.96 26.884-19.566 52.942-24.243 74.14h398.571v51.909H4.756ZM783.93 541.696H.399c.82 13.851 2.112 27.517 3.978 40.999h723.39c32.248 0 50.299-18.297 56.162-40.999ZM45.017 724.306S164.941 1018.77 511.46 1024c207.112 0 385.071-123.006 465.907-299.694H45.017Z" />
      <path d="M511.454 0C319.953 0 153.311 105.16 65.31 260.612c68.771-.144 202.704-.226 202.704-.226h.031v-.051c158.309 0 164.193.707 195.118 1.998l19.149.706c66.7 2.224 148.683 9.384 213.19 58.19 35.015 26.471 85.571 84.896 115.708 126.52 27.861 38.499 35.876 82.756 16.933 125.158-17.436 38.97-54.952 62.215-100.383 62.215H16.69s4.233 17.944 10.58 37.751h970.632A510.385 510.385 0 0 0 1024 512.218C1024.01 229.355 794.532 0 511.454 0Z" />
    </svg>
  ),
};

function estimateDaysUntilLimit(current: number, limit: number): number | null {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  if (dayOfMonth === 0 || current <= 0) return null;
  const dailyRate = current / dayOfMonth;
  const daysLeft = (limit - current) / dailyRate;
  if (daysLeft < daysRemaining) return Math.max(0, Math.round(daysLeft));
  return null;
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
}: {
  snap: Snapshot;
  entitySnapshots: Snapshot[];
  integrationId: string;
  isPro: boolean;
}) {
  const [showChart, setShowChart] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const pct = Math.round(snap.percent_used);
  const unit = METRIC_UNITS[snap.metric_name] ?? "";
  const subRows = entitySnapshots.filter((e) => e.metric_name === snap.metric_name);

  async function toggleChart() {
    if (showChart) { setShowChart(false); return; }
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
          <Badge variant={getBadgeVariant(pct)} className="text-[10px] py-0 px-1.5">
            {pct}%
          </Badge>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/6 mb-1.5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBarClass(pct)}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-600">
          {snap.current_value.toLocaleString()} /{" "}
          {snap.limit_value.toLocaleString()} {unit}
        </span>
        {(() => {
          const d = estimateDaysUntilLimit(snap.current_value, snap.limit_value);
          return d !== null ? (
            <span className={`text-xs tabular-nums ${pct >= 80 ? "text-red-500" : "text-amber-500"}`}>
              · ~{d === 0 ? "hits limit today" : `${d} days until limit`}
            </span>
          ) : null;
        })()}
      </div>
      {subRows.length > 0 && (
        <div className="mt-2 space-y-1 pl-3 border-l border-white/6">
          {subRows.map((e) => (
            <div key={e.entity_id} className="flex items-center justify-between">
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
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Metrics — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 space-y-4">
          {snapshots.map((snap) => (
            <MetricRow
              key={snap.metric_name}
              snap={snap}
              entitySnapshots={entitySnapshots}
              integrationId={integrationId}
              isPro={isPro}
            />
          ))}
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
  const worstPct = Math.round(Math.max(...snapshots.map((s) => s.percent_used)));
  const sorted = [...snapshots].sort((a, b) => b.percent_used - a.percent_used);
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
        <div className="flex-1 space-y-2 mb-3">
          {visible.map((snap) => {
            const daysLeft = estimateDaysUntilLimit(snap.current_value, snap.limit_value);
            return (
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
                {daysLeft !== null && (
                  <span className={`text-[10px] shrink-0 tabular-nums ${snap.percent_used >= 80 ? "text-red-500" : "text-amber-500"}`}>
                    ~{daysLeft === 0 ? "today" : `${daysLeft}d`}
                  </span>
                )}
                <span className="text-xs text-zinc-500 w-7 text-right shrink-0">
                  {Math.round(snap.percent_used)}%
                </span>
              </div>
            );
          })}
          {hiddenCount > 0 && (
            <p className="text-[11px] text-zinc-600">
              +{hiddenCount} more · click for details
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
