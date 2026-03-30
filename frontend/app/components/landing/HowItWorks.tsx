"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Connect your services",
    description:
      "Paste your GitHub PAT, Vercel token, or Supabase Management API key. Encrypted at rest, remove it any time.",
    iconColor: "text-blue-400",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Set your thresholds",
    description:
      "Choose when to get notified. Default is 80%, but you can lower it for an earlier heads-up on anything critical.",
    iconColor: "text-violet-400",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Get alerted before limits hit",
    description:
      "Alerts fire via email, Slack, or Discord the moment usage crosses your threshold. Not after something breaks.",
    iconColor: "text-emerald-400",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      className="py-24 bg-[#0a0a0a] border-t border-[#161616]"
      ref={ref}
    >
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.18em] mb-3">
            How it works
          </p>
          <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">
            Up and running in 2 minutes
          </h2>
          <p className="text-zinc-500 text-sm">
            Three steps. No dashboards to babysit.
          </p>
        </motion.div>

        <motion.div
          className="divide-y divide-[#161616]"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
        >
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-start gap-5 py-7"
            >
              <div
                className={`h-8 w-8 rounded-md border border-[#1f1f1f] bg-[#141414] flex items-center justify-center shrink-0 mt-0.5 ${s.iconColor}`}
              >
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-700">{s.step}</span>
                  <h3 className="font-medium text-white text-sm leading-snug">{s.title}</h3>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
