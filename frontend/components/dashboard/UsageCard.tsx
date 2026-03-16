import { getProgressColorClass, relativeTime, METRIC_LABELS, METRIC_UNITS, SERVICE_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UsageCardProps {
  service: string;
  accountLabel: string;
  metricName: string;
  currentValue: number;
  limitValue: number;
  percentUsed: number;
  lastSyncedAt: string | null;
  status: string;
}

const SERVICE_ICON_BG: Record<string, string> = {
  github: "bg-white/[0.05]",
  vercel: "bg-white/[0.05]",
  supabase: "bg-white/[0.05]",
};

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
};

function getStatusBadgeVariant(pct: number): "success" | "warning" | "danger" {
  if (pct >= 80) return "danger";
  if (pct >= 60) return "warning";
  return "success";
}

function getDarkProgressClass(pct: number) {
  if (pct >= 80) return "bg-red-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-blue-500";
}

export function UsageCard({
  service,
  accountLabel,
  metricName,
  currentValue,
  limitValue,
  percentUsed,
  lastSyncedAt,
  status,
}: UsageCardProps) {
  const pct = Math.round(percentUsed);
  const unit = METRIC_UNITS[metricName] ?? "";
  const label = METRIC_LABELS[metricName] ?? metricName;

  return (
    <div className="bg-[#111] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-8 w-8 rounded-lg ${SERVICE_ICON_BG[service] ?? "bg-white/[0.05]"} border border-white/[0.06] flex items-center justify-center flex-shrink-0`}
          >
            {SERVICE_ICONS[service]}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">
              {SERVICE_LABELS[service] ?? service}
            </p>
            <p className="text-xs text-zinc-600">{accountLabel}</p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(pct)}>{pct}%</Badge>
      </div>

      <p className="text-xs text-zinc-600 mb-2">{label}</p>

      <div className="h-1.5 w-full rounded-full bg-white/[0.06] mb-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getDarkProgressClass(pct)}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {currentValue.toLocaleString()} / {limitValue.toLocaleString()}{" "}
          {unit}
        </span>
        <span className="text-xs text-zinc-600">{pct}% used</span>
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <span className="text-xs text-zinc-700">
          {lastSyncedAt ? `Synced ${relativeTime(lastSyncedAt)}` : "Never synced"}
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
    </div>
  );
}
