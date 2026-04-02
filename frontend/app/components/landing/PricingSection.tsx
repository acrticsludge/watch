"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";

export type PlanState =
  | "none" // no subscription ever — eligible for trial
  | "trialing" // currently in trial
  | "active" // active pro
  | "active_cancelling" // active but cancel_at_period_end = true
  | "past_due" // payment failed
  | "used_trial"; // cancelled/lapsed — trial already consumed

export function PricingSection({
  userEmail,
  planState = "none",
}: {
  userEmail?: string;
  planState?: PlanState;
}) {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isProActive =
    planState === "active" ||
    planState === "active_cancelling" ||
    planState === "trialing";

  async function handleProCheckout() {
    if (!userEmail) {
      router.push("/signup");
      return;
    }
    setCheckoutLoading(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    setCheckoutLoading(false);
    if (!res.ok) return;
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For solo devs getting started",
      features: [
        "1 account per service",
        "5 services (GitHub, Vercel, Supabase, Railway, MongoDB Atlas)",
        "Email alerts",
        "15-minute polling",
        "7-day alert history",
      ],
      cta: userEmail ? "Go to dashboard" : "Get started free",
      href: userEmail ? "/dashboard" : "/signup",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$120",
      period: "/year",
      description: "For individuals with multiple projects",
      features: [
        "5 accounts per service",
        "Per Project breakdown for each service",
        "Email + Slack + Discord alerts + Browser Push",
        "5-minute polling",
        "30-day alert history",
        "Usage history charts",
        "Spike detection and anomaly alerts",
      ],
      cta: "Start free trial",
      href: null,
      highlight: true,
    },
    {
      name: "Team",
      price: "-$",
      period: "/month",
      description: "For teams sharing infrastructure",
      features: [
        "Unlimited accounts",
        "All services",
        "Multiple email, Slack and discord support",
        "1-minute polling",
        "90-day alert history",
        "Team dashboard",
        "Shared alert configs",
      ],
      cta: "Coming soon",
      href: null,
      highlight: false,
      comingSoon: true,
    },
  ];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="pricing"
      className="py-24 bg-[#0a0a0a] border-t border-white/4"
      ref={ref}
    >
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-500 text-base mb-3">
            Start free. Pro comes with a 14-day free trial.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Launch pricing — rates locked for early adopters
          </span>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-4 items-start overflow-visible"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.1 },
            },
          }}
        >
          {plans.map((p) => (
            <motion.div
              key={p.name}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`relative rounded-xl transition-all duration-300 hover:-translate-y-1 ${
                p.highlight
                  ? "bg-[#0d1628] border border-blue-500/30 shadow-xl shadow-blue-500/10 p-6 pt-10"
                  : "bg-[#111] border border-white/6 hover:border-white/10 p-6"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center text-[10px] font-semibold text-blue-300 bg-[#0d1628] border border-blue-500/40 rounded-full px-2.5 py-0.5 uppercase tracking-wider whitespace-nowrap">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p
                  className={`text-xs font-medium mb-2 uppercase tracking-widest ${
                    p.highlight ? "text-blue-400" : "text-zinc-600"
                  }`}
                >
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {p.price}
                  </span>
                  {p.period && (
                    <span className="text-sm text-zinc-600">{p.period}</span>
                  )}
                </div>
                {p.highlight && planState === "none" && (
                  <p className="text-xs text-emerald-400 mt-1 font-medium">
                    14-day free trial included
                  </p>
                )}
                <p
                  className={`text-sm mt-1.5 ${
                    p.highlight ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  {p.description}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                        p.highlight ? "text-blue-400" : "text-zinc-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={`text-sm ${p.highlight ? "text-zinc-300" : "text-zinc-500"}`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {"comingSoon" in p && p.comingSoon ? (
                <div className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium cursor-not-allowed opacity-50 bg-white/6 text-zinc-300">
                  {p.cta}
                </div>
              ) : p.highlight && isProActive ? (
                <div className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium cursor-not-allowed opacity-50 bg-blue-500 text-white">
                  {planState === "trialing" ? "In trial" : "Current plan"}
                </div>
              ) : p.highlight && planState === "past_due" ? (
                <a
                  href="/settings?tab=billing"
                  className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all bg-amber-500 hover:bg-amber-400 text-white"
                >
                  Update payment
                </a>
              ) : p.highlight ? (
                <button
                  onClick={handleProCheckout}
                  disabled={checkoutLoading}
                  className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50"
                >
                  {checkoutLoading
                    ? "Loading..."
                    : planState === "used_trial"
                      ? "Upgrade to Pro"
                      : "Start free trial"}
                </button>
              ) : (
                <a
                  href={p.href!}
                  className="flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all bg-white/6 hover:bg-white/10 text-zinc-300 hover:text-white"
                >
                  {p.cta}
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
