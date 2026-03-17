"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const problems = [
  {
    icon: (
      <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    iconBg: "bg-red-500/10 border-red-500/20",
    title: "You find out when it breaks",
    description:
      "Actions quota runs out mid-sprint. Vercel bandwidth cuts off your users. Supabase row limit silently fails writes. Always at the worst time.",
  },
  {
    icon: (
      <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    iconBg: "bg-amber-500/10 border-amber-500/20",
    title: "5 dashboards, zero alerts",
    description:
      "GitHub, Vercel, Supabase, Railway — each has its own usage page. None of them ping you before the limit hits.",
  },
  {
    icon: (
      <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: "bg-white/[0.05] border-white/[0.08]",
    title: "Manual checking gets forgotten",
    description:
      "You check once, feel fine, and forget. Three weeks later usage has spiked and you're already over.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-white/4" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">
            The problem
          </p>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Sound familiar?
          </h2>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Small dev teams shouldn&apos;t have to babysit usage dashboards
            across every service they rely on.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        >
          {problems.map((p) => (
            <motion.div
              key={p.title}
              variants={itemVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="group bg-[#111] rounded-xl border border-white/6 p-6 hover:border-white/12 hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div
                className={`h-8 w-8 rounded-lg border flex items-center justify-center mb-4 ${p.iconBg}`}
              >
                {p.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{p.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
