"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";

const GITHUB_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-3.5 w-3.5 text-zinc-300"
  >
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const VERCEL_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-3.5 w-3.5 text-zinc-300"
  >
    <path d="M24 22.525H0l12-21.05 12 21.05z" />
  </svg>
);

const SUPABASE_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-3.5 w-3.5 text-emerald-400"
  >
    <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
  </svg>
);

interface MiniCardProps {
  icon: React.ReactNode;
  service: string;
  label: string;
  metric: string;
  current: number;
  limit: number;
  unit: string;
  pct: number;
}

function MiniUsageCard({
  icon,
  service,
  label,
  metric,
  current,
  limit,
  unit,
  pct,
}: MiniCardProps) {
  const barColor =
    pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-blue-500";
  const pctColor =
    pct >= 80
      ? "text-red-400"
      : pct >= 60
        ? "text-amber-400"
        : "text-green-400";
  const dotColor =
    pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-green-500";

  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-white/5 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-200 leading-tight">
              {service}
            </p>
            <p className="text-[10px] text-zinc-600">{label}</p>
          </div>
        </div>
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor} ${pct >= 80 ? "animate-pulse" : ""}`}
        />
      </div>
      <p className="text-[11px] text-zinc-600 mb-2">{metric}</p>
      <div className="h-1 w-full rounded-full bg-white/[0.06] mb-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600 tabular-nums">
          {current.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
        <span className={`text-[11px] font-semibold tabular-nums ${pctColor}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative bg-[#0a0a0a] pt-20 pb-24 overflow-hidden">
      {/* Subtle grid — not a dot grid, just faint lines */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-20 items-center">
          {/* ── Left: Copy ── */}
          <div className="max-w-xl">
            <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.18em] mb-8 flex items-center gap-2">
              <span className="h-px w-5 bg-zinc-700 inline-block" />
              Usage monitoring for dev teams
            </p>

            <h1 className="text-[3.25rem] md:text-[3.75rem] font-bold text-white tracking-tight leading-[1.06] mb-5">
              CI stopped
              <br />
              <span className="text-zinc-500">at 3am.</span>
            </h1>

            <p className="text-base text-zinc-600 mb-2 leading-relaxed">
              Actions minutes ran out. Nobody knew.
            </p>
            <p className="text-base text-zinc-400 leading-relaxed mb-10">
              Stackwatch monitors your GitHub Actions, Vercel, and Supabase
              usage and alerts you{" "}
              <span className="text-white font-medium">before</span> it becomes
              an incident.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 px-8 text-sm font-medium bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg shadow-none"
              >
                <Link href="/signup">Start for free</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-11 px-5 text-sm text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] rounded-lg"
              >
                <a href="#how-it-works">How it works →</a>
              </Button>
            </div>
          </div>

          {/* ── Right: Product visual ── */}
          <div className="relative">
            {/* Alert notification — hovers above the cards */}
            <div className="absolute -top-5 -left-3 z-10 max-w-[255px] bg-[#161616] border border-amber-500/20 rounded-xl px-3.5 py-2.5 shadow-2xl shadow-black/50 flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-px">
                <svg
                  className="h-3.5 w-3.5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-200">
                  GitHub Actions · 94%
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  Alert sent via email · 2h ago
                </p>
              </div>
            </div>

            {/* The three usage cards */}
            <div className="pt-8 space-y-2.5">
              <MiniUsageCard
                icon={GITHUB_ICON}
                service="GitHub Actions"
                label="personal"
                metric="Actions Minutes"
                current={1880}
                limit={2000}
                unit="min"
                pct={94}
              />
              <MiniUsageCard
                icon={VERCEL_ICON}
                service="Vercel"
                label="my-team"
                metric="Bandwidth"
                current={72}
                limit={100}
                unit="GB"
                pct={72}
              />
              <MiniUsageCard
                icon={SUPABASE_ICON}
                service="Supabase"
                label="prod-db"
                metric="Database Size"
                current={48}
                limit={500}
                unit="MB"
                pct={10}
              />
            </div>

            {/* Status bar */}
            <div className="mt-2.5 bg-[#111] border border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  1 critical
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />1
                  warning
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />1
                  healthy
                </span>
              </div>
              <span className="text-[10px] text-zinc-700 font-mono">
                synced 1m ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
