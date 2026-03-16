const services = [
  {
    name: "GitHub Actions",
    description: "Minutes used · Per-repo breakdown",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-zinc-200">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    description: "Bandwidth · Build minutes · Functions",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-zinc-200">
        <path d="M24 22.525H0l12-21.05 12 21.05z" />
      </svg>
    ),
  },
  {
    name: "Supabase",
    description: "DB size · Rows · Storage · MAU",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-emerald-400">
        <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
      </svg>
    ),
  },
];

export function ServicesSection() {
  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Supported services
          </h2>
          <p className="text-zinc-500 text-base">
            Connect once, monitor everything.{" "}
            <span className="text-zinc-700">More coming soon.</span>
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {services.map((s) => (
            <div
              key={s.name}
              className="bg-[#111] rounded-xl border border-white/[0.06] p-6 flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                {s.logo}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{s.name}</h3>
                <p className="text-zinc-500 text-xs mt-0.5">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
