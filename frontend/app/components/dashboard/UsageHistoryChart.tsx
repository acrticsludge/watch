"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { METRIC_LABELS } from "@/lib/utils";

interface Snapshot {
  recorded_at: string;
  percent_used: number;
  current_value: number;
  limit_value: number;
}

interface UsageHistoryChartProps {
  metricName: string;
  snapshots: Snapshot[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function UsageHistoryChart({ metricName, snapshots }: UsageHistoryChartProps) {
  if (snapshots.length === 0) {
    return (
      <p className="text-zinc-600 text-xs text-center py-6">No history yet</p>
    );
  }

  const data = snapshots.map((s) => ({
    date: formatDate(s.recorded_at),
    pct: Math.round(s.percent_used),
    value: s.current_value,
    limit: s.limit_value,
  }));

  const pcts = data.map((d) => d.pct);
  const min = Math.min(...pcts);
  const max = Math.max(...pcts);
  const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-zinc-400">
          {METRIC_LABELS[metricName] ?? metricName}
        </p>
        <div className="flex gap-3 text-xs text-zinc-600">
          <span>min <span className="text-zinc-400">{min}%</span></span>
          <span>avg <span className="text-zinc-400">{avg}%</span></span>
          <span>max <span className="text-zinc-400">{max}%</span></span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#52525b" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#52525b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              fontSize: 12,
              color: "#d4d4d8",
            }}
            formatter={(value: number) => [`${value}%`, "Usage"]}
            labelStyle={{ color: "#71717a" }}
          />
          <ReferenceLine y={80} stroke="rgba(239,68,68,0.3)" strokeDasharray="3 3" />
          <ReferenceLine y={60} stroke="rgba(234,179,8,0.3)" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="pct"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
