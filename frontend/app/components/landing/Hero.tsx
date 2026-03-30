import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export function Hero() {
  return (
    <section className="relative bg-[#0a0a0a] pt-20 pb-16 overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.18em] mb-7 flex items-center justify-center gap-2">
          <span className="h-px w-5 bg-zinc-700 inline-block" />
          Always-on usage monitoring for solo founders and dev teams
          <span className="h-px w-5 bg-zinc-700 inline-block" />
        </p>

        <h1 className="text-[3rem] md:text-[3.5rem] font-semibold text-white tracking-tight leading-[1.06] mb-5">
          Catch usage limits{" "}
          <span className="text-zinc-500">
            before a limit becomes a production meltdown.
          </span>
        </h1>

        <p className="text-sm text-zinc-600 mb-2 leading-relaxed font-mono">
          Actions quota hit. Builds stopped. Users noticed first.
        </p>
        <p className="text-base text-zinc-400 leading-relaxed mb-9 max-w-xl mx-auto">
          You&apos;re already wearing every hat. Stop spending hours a week
          manually checking 5 different usage dashboards. Stackwatch watches
          your GitHub, Vercel, Railway, Supabase and MongoDB Atlas limits 24/7, and puts
          you back{" "}
          <span className="text-white font-medium">in control</span> before
          anything reaches your users.
        </p>

        <div className="flex flex-wrap gap-2.5 justify-center">
          <Button
            asChild
            size="lg"
            className="h-10 px-7 text-sm font-medium bg-white text-zinc-900 hover:bg-zinc-100 rounded shadow-none transition-colors duration-150"
          >
            <Link href="/signup">Start for free</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-10 px-5 text-sm text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] rounded transition-colors duration-150"
          >
            <a href="#how-it-works">How it works →</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
