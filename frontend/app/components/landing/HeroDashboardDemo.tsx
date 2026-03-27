"use client";

import { useState, useEffect } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const GH = (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4 text-zinc-200"
  >
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);
const VC = (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4 text-zinc-200"
  >
    <path d="M24 22.525H0l12-21.05 12 21.05z" />
  </svg>
);
const SB = (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4 text-emerald-400"
  >
    <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
  </svg>
);
const MDB = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#47A248]">
    <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.109-1.622-.197-2.218z" />
  </svg>
);

// ─── Frame constants ───────────────────────────────────────────────────────────
const FRAME_W = 560;
const CHROME_H = 40;
const CONTENT_H = 520;
const FRAME_H = CHROME_H + CONTENT_H;
const SCALE = 0.82;

// ─── DashCard ──────────────────────────────────────────────────────────────────
interface DashMetric {
  name: string;
  pct: number;
}

function DashCard({
  icon,
  service,
  label,
  metrics,
}: {
  icon: React.ReactNode;
  service: string;
  label: string;
  metrics: DashMetric[];
}) {
  const worstPct = Math.max(...metrics.map((m) => m.pct));
  const badgeClass =
    worstPct >= 80
      ? "text-red-400 bg-red-500/10 border-red-500/20"
      : worstPct >= 60
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
        : "text-green-400 bg-green-500/10 border-green-500/20";
  const barColor = (p: number) =>
    p >= 80 ? "bg-red-500" : p >= 60 ? "bg-amber-500" : "bg-blue-500";

  return (
    <div className="bg-[#111] border border-white/6 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/6 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-100 leading-tight">
              {service}
            </p>
            <p className="text-[10px] text-zinc-600">{label}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badgeClass}`}
        >
          {worstPct}%
        </span>
      </div>
      <div className="space-y-2">
        {metrics.map((m) => (
          <div key={m.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-600 truncate">
                {m.name}
              </span>
              <span className="text-[10px] text-zinc-500 ml-1 shrink-0">
                {m.pct}%
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/6 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor(m.pct)}`}
                style={{ width: `${Math.min(m.pct, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-white/4 flex items-center justify-between">
        <span className="text-[10px] text-zinc-700">Synced 2m ago</span>
        <span className="flex items-center gap-1 text-[10px] text-green-500">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          connected
        </span>
      </div>
    </div>
  );
}

// ─── Browser chrome frame ──────────────────────────────────────────────────────
function ChromeFrame({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-[#0d0d0d] border border-white/8 rounded-2xl overflow-hidden"
      style={{ width: FRAME_W }}
    >
      <div className="h-10 bg-[#161616] border-b border-white/6 flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c940]" />
        </div>
        <div className="flex-1 mx-2">
          <div className="h-6 bg-[#0a0a0a] border border-white/6 rounded-md flex items-center gap-2 px-3">
            <svg
              className="h-3 w-3 text-zinc-700 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-[11px] font-mono text-zinc-600">
              stackwatch.pulsemonitor.dev{url}
            </span>
          </div>
        </div>
      </div>
      <div
        className="bg-[#0a0a0a] overflow-hidden"
        style={{ height: CONTENT_H }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Animated dashboard demo ───────────────────────────────────────────────────
export function HeroDashboardDemo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const durations = [2000, 1200, 2800, 500];
    const t = setTimeout(() => setPhase((p) => (p + 1) % 4), durations[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const sbPct = phase === 0 ? 52 : 92;
  const alertVisible = phase === 2 || phase === 3;
  const summary =
    phase === 0
      ? { healthy: 2, warning: 2, critical: 0 }
      : { healthy: 2, warning: 1, critical: 1 };

  const sbBarColor = sbPct >= 80 ? "bg-red-500" : "bg-amber-500";
  const sbBadgeClass =
    sbPct >= 80
      ? "text-red-400 bg-red-500/10 border-red-500/20"
      : "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <div
      className="select-none"
      style={{ opacity: phase === 3 ? 0 : 1, transition: "opacity 0.4s ease" }}
    >
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/60"
        style={{ width: FRAME_W * SCALE, height: FRAME_H * SCALE }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: FRAME_W,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
          }}
        >
          <ChromeFrame url="/dashboard">
            <div
              className="px-7 py-5"
              style={{
                height: CONTENT_H,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-2xl font-bold text-white tracking-tight">
                    Dashboard
                  </p>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    4 services connected
                  </p>
                </div>
                <div className="h-8 px-3 rounded-lg bg-white/5 border border-white/6 flex items-center gap-2 shrink-0">
                  <svg
                    className="h-3.5 w-3.5 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-xs text-zinc-500">Refresh</span>
                </div>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {[
                  {
                    label: "Healthy",
                    val: summary.healthy,
                    color: "text-green-400",
                  },
                  {
                    label: "Warning",
                    val: summary.warning,
                    color: "text-amber-400",
                  },
                  {
                    label: "Critical",
                    val: summary.critical,
                    color: "text-red-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-[#111] border border-white/6 rounded-xl px-3 py-3"
                  >
                    <p className="text-[11px] text-zinc-600 mb-1.5 font-medium">
                      {s.label}
                    </p>
                    <p
                      className={`text-2xl font-semibold tabular-nums leading-none transition-all duration-500 ${s.color}`}
                    >
                      {s.val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Section label */}
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest shrink-0">
                  Usage
                </p>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <DashCard
                  icon={GH}
                  service="GitHub Actions"
                  label="personal"
                  metrics={[{ name: "Actions Minutes", pct: 42 }]}
                />
                <DashCard
                  icon={VC}
                  service="Vercel"
                  label="my-team"
                  metrics={[
                    { name: "Bandwidth", pct: 71 },
                    { name: "Build Mins", pct: 18 },
                  ]}
                />

                {/* Supabase — animated */}
                <div
                  className="bg-[#111] rounded-xl p-4 flex flex-col gap-3"
                  style={{
                    border: `1px solid ${sbPct >= 80 ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                    transition: "border-color 0.5s ease",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/6 flex items-center justify-center shrink-0">
                        {SB}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-100 leading-tight">
                          Supabase
                        </p>
                        <p className="text-[10px] text-zinc-600">prod-db</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${sbBadgeClass}`}
                      style={{ transition: "all 0.5s ease" }}
                    >
                      {sbPct}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-zinc-600">
                          DB Size
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {sbPct}%
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/6 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sbBarColor}`}
                          style={{
                            width: `${sbPct}%`,
                            transition:
                              "width 1.2s ease-in-out, background-color 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/4 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-700">
                      Synced 2m ago
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-green-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      connected
                    </span>
                  </div>
                </div>

                <DashCard
                  icon={MDB}
                  service="MongoDB Atlas"
                  label="prod-cluster"
                  metrics={[
                    { name: "Storage", pct: 38 },
                    { name: "Connections", pct: 15 },
                  ]}
                />
              </div>

              {/* Alert toast */}
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  transform: alertVisible
                    ? "translateY(0)"
                    : "translateY(150%)",
                  opacity: alertVisible ? 1 : 0,
                  transition:
                    "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
                  zIndex: 10,
                }}
                className="bg-[#150909] border border-red-500/25 rounded-xl p-3 shadow-2xl shadow-red-900/20 w-52"
              >
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    {SB}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-red-400 leading-tight mb-0.5">
                      Threshold exceeded
                    </p>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      Supabase · DB Size
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      460 / 500 MB ·{" "}
                      <span className="text-red-400 font-semibold">92%</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ChromeFrame>
        </div>
      </div>
    </div>
  );
}
