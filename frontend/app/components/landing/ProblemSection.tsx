"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const problems = [
  {
    step: "01",
    dot: "bg-red-500",
    title: "Your users find out before you do",
    description:
      "Actions quota runs out mid-deploy. Supabase silently fails writes. Vercel cuts off bandwidth during a launch. By the time you know, the damage is done — churn, support tickets, reputation.",
  },
  {
    step: "02",
    dot: "bg-amber-500",
    title: "Hours a week just checking dashboards",
    description:
      "GitHub, Vercel, Supabase, Railway — each buried in its own billing page. Solo founders lose hours every month doing manual laps just to feel safe. None of them alert you before the wall.",
  },
  {
    step: "03",
    dot: "bg-zinc-600",
    title: "The anxiety of not knowing",
    description:
      "You checked last week and it was fine. But usage spiked over the weekend and you have no idea. That low-level dread of \"is something about to break?\" never fully goes away.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-[#161616]" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.18em] mb-3">
            The problem
          </p>
          <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">
            You&apos;re already running lean. One quota hit can unravel it.
          </h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Solo founders and small teams can&apos;t afford a production meltdown. The platforms you rely on don&apos;t warn you — they just stop working.
          </p>
        </motion.div>

        <motion.div
          className="divide-y divide-[#161616]"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
        >
          {problems.map((p) => (
            <motion.div
              key={p.title}
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid grid-cols-[40px_1fr] gap-6 py-8"
            >
              {/* Left: step + signal dot */}
              <div className="flex flex-col items-center gap-2.5 pt-0.5">
                <span className="font-mono text-[10px] text-zinc-700 tabular-nums leading-none">
                  {p.step}
                </span>
                <div className={`h-1.5 w-1.5 rounded-full ${p.dot} opacity-60`} />
              </div>

              {/* Right: content */}
              <div>
                <h3 className="font-medium text-white text-[15px] mb-2.5 tracking-tight leading-snug">
                  {p.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {p.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
