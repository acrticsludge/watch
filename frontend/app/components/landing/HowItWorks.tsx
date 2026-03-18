"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Connect your services",
    description:
      "Paste your GitHub PAT, Vercel API token, or Supabase Management API key. Encrypted and stored securely — remove it any time.",
  },
  {
    step: "02",
    title: "Set your thresholds",
    description:
      "Choose when you want to be notified. Default is 80% — set it lower for an earlier heads-up on critical services.",
  },
  {
    step: "03",
    title: "Get alerted before it's too late",
    description:
      "Receive alerts via email, Slack, or Discord the moment usage crosses a threshold. No more surprises.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      className="py-24 bg-[#0a0a0a] border-t border-white/[0.04]"
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
            How it works
          </p>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Up and running in 2 minutes
          </h2>
          <p className="text-zinc-500 text-base">
            Quick and simple setup without the hassle.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              className="relative"
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: 0.1 + i * 0.12,
              }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-4 left-[calc(100%+1.25rem)] right-[-1.25rem] h-px z-0">
                  <div className="h-full bg-gradient-to-r from-white/[0.08] to-transparent" />
                </div>
              )}

              <div className="relative z-10">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-mono text-xs mb-5">
                  {s.step}
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">
                  {s.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
