"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoMetric {
  service: string;
  label: string;
  metric: string;
  current: number;
  limit: number;
  unit: string;
}

const SCENARIOS: DemoMetric[][] = [
  [
    { service: "GitHub Actions", label: "personal", metric: "Actions Minutes", current: 1560, limit: 2000, unit: "min" },
    { service: "Vercel", label: "my-app", metric: "Bandwidth", current: 45, limit: 100, unit: "GB" },
    { service: "Supabase", label: "prod", metric: "DB Size", current: 450, limit: 500, unit: "MB" },
  ],
  [
    { service: "GitHub Actions", label: "personal", metric: "Actions Minutes", current: 400, limit: 2000, unit: "min" },
    { service: "Vercel", label: "my-app", metric: "Bandwidth", current: 78, limit: 100, unit: "GB" },
    { service: "Supabase", label: "prod", metric: "DB Size", current: 210, limit: 500, unit: "MB" },
  ],
  [
    { service: "GitHub Actions", label: "personal", metric: "Actions Minutes", current: 1950, limit: 2000, unit: "min" },
    { service: "Vercel", label: "my-app", metric: "Bandwidth", current: 92, limit: 100, unit: "GB" },
    { service: "Supabase", label: "prod", metric: "DB Size", current: 120, limit: 500, unit: "MB" },
  ],
];

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "GitHub Actions": (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-300">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  Vercel: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-zinc-300">
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  ),
  Supabase: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-emerald-400">
      <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
    </svg>
  ),
};

function getBarColor(pct: number) {
  if (pct >= 80) return "bg-red-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-blue-500";
}

function getDotColor(pct: number) {
  if (pct >= 80) return "bg-red-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-green-500";
}

function getPctColor(pct: number) {
  if (pct >= 80) return "text-red-400";
  if (pct >= 60) return "text-amber-400";
  return "text-green-400";
}

export function DemoWidget() {
  const [scenario, setScenario] = useState(0);
  const metrics = SCENARIOS[scenario];

  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden max-w-3xl mx-auto">
      {/* Browser chrome */}
      <div className="bg-[#0d0d0d] border-b border-white/6 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-[#1a1a1a] rounded border border-white/6 px-3 py-1 text-xs text-zinc-500 max-w-xs mx-auto text-center font-mono">
          stackwatch.pulsemonitor.dev/dashboard
        </div>
      </div>

      {/* Dashboard */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-white text-sm">Usage Overview</h3>
            <p className="text-xs text-zinc-600 mt-0.5">Synced 2 min ago</p>
          </div>
          <div className="flex gap-1.5">
            {(["All clear", "Warning", "Critical"] as const).map((label, i) => (
              <button
                key={i}
                onClick={() => setScenario(i)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  i === scenario
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    : "border-white/6 text-zinc-600 hover:text-zinc-400 hover:border-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <AnimatePresence mode="wait">
            {metrics.map((m) => {
              const pct = Math.round((m.current / m.limit) * 100);
              return (
                <motion.div
                  key={`${scenario}-${m.service}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="bg-[#0d0d0d] border border-white/6 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-white/5 flex items-center justify-center shrink-0">
                        {SERVICE_ICONS[m.service]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-200 leading-tight">{m.service}</p>
                        <p className="text-[10px] text-zinc-600">{m.label}</p>
                      </div>
                    </div>
                    <span className={`inline-flex h-1.5 w-1.5 rounded-full shrink-0 ${getDotColor(pct)}`} />
                  </div>
                  <p className="text-[11px] text-zinc-600 mb-2">{m.metric}</p>
                  <div className="h-1.5 w-full rounded-full bg-white/6 mb-2 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${getBarColor(pct)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600">
                      {m.current.toLocaleString()} / {m.limit.toLocaleString()} {m.unit}
                    </span>
                    <span className={`text-[11px] font-semibold ${getPctColor(pct)}`}>
                      {pct}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-4">
          Demo data.{" "}
          <a href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign up free
          </a>{" "}
          to connect your real services.
        </p>
      </div>
    </div>
  );
}
