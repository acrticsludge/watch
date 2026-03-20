import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-[#0a0a0a] border-t border-white/4">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-4">
          Free to start
        </p>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
          Know before your users do.
        </h2>
        <p className="text-zinc-500 text-base mb-8 max-w-md mx-auto">
          Connect GitHub, Vercel, Supabase, or Railway in under two minutes and
          get alerted before a limit becomes a production incident.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center h-10 px-6 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
          >
            Start monitoring for free →
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center h-10 px-5 rounded-lg text-sm text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
          >
            See pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}
