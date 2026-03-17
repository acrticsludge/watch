"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const services = [
  {
    name: "GitHub Actions",
    description: "Minutes used · Per-repo breakdown",
    accent: "group-hover:border-zinc-600/60",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-zinc-200">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    description: "Bandwidth · Build minutes · Functions",
    accent: "group-hover:border-zinc-600/60",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-zinc-200">
        <path d="M24 22.525H0l12-21.05 12 21.05z" />
      </svg>
    ),
  },
  {
    name: "Supabase",
    description: "DB size · Rows · Storage · MAU",
    accent: "group-hover:border-emerald-500/30",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-emerald-400">
        <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
      </svg>
    ),
  },
  {
    name: "Railway",
    description: "Memory usage · CPU across services",
    accent: "group-hover:border-violet-500/30",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-violet-400">
        <path d="M.395 8.395C1.925 3.532 6.36.042 11.587 0h.042c3.75 0 7.1 1.56 9.5 4.073L17.5 7.33c-1.567-1.742-3.84-2.838-6.37-2.838-3.856 0-7.1 2.556-8.122 6.077L.395 8.395zm23.21 7.21C22.075 20.468 17.64 23.958 12.413 24h-.042c-3.75 0-7.1-1.56-9.5-4.073l3.629-3.257c1.567 1.742 3.84 2.838 6.37 2.838 3.856 0 7.1-2.556 8.122-6.077l2.613 2.174zM14.75 12c0 1.519-1.231 2.75-2.75 2.75S9.25 13.519 9.25 12 10.481 9.25 12 9.25 14.75 10.481 14.75 12z" />
      </svg>
    ),
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-white/[0.04]" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">
            Integrations
          </p>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Supported services
          </h2>
          <p className="text-zinc-500 text-base">
            Connect once, monitor everything.{" "}
            <span className="text-zinc-700">More coming soon.</span>
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-4 gap-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
        >
          {services.map((s) => (
            <motion.div
              key={s.name}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`group bg-[#111] rounded-xl border border-white/6 ${s.accent} p-6 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/6 flex items-center justify-center shrink-0">
                {s.logo}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{s.name}</h3>
                <p className="text-zinc-500 text-xs mt-0.5">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
