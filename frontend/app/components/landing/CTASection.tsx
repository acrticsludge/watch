import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-[#161616]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.18em] mb-4">
          Free to start
        </p>
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-3">
          Never get surprised by usage limits again.
        </h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
          Connect GitHub, Vercel, Supabase, or Railway in under two minutes and
          get alerted before a limit becomes a production incident.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center h-10 px-6 rounded bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors duration-150"
          >
            Start monitoring for free →
          </Link>
        </div>
      </div>
    </section>
  );
}
