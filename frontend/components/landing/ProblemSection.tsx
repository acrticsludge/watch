const problems = [
  {
    icon: (
      <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    title: "5 different dashboards",
    description:
      "Switching between GitHub, Vercel, and Supabase every time you want to check if you're close to a limit.",
  },
  {
    icon: (
      <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    title: "You find out when it breaks",
    description:
      "Actions stop running. Deploys fail. Users can't sign up. And you had no idea it was coming.",
  },
  {
    icon: (
      <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Manual checking is a chore",
    description:
      "Checking usage before every major push is tedious and easy to forget. There has to be a better way.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Sound familiar?
          </h2>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Small dev teams shouldn&apos;t have to babysit usage dashboards
            across every service they rely on.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {problems.map((p) => (
            <div
              key={p.title}
              className="bg-[#111] rounded-xl border border-white/[0.06] p-6"
            >
              <div className="h-8 w-8 rounded-lg bg-white/[0.04] flex items-center justify-center mb-4">
                {p.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{p.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
