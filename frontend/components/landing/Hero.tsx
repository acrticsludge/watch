import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative bg-[#0a0a0a] pt-28 pb-28 overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #555 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-7">
          GitHub Actions · Vercel · Supabase
        </p>
        <h1 className="text-5xl md:text-[4.5rem] font-bold text-white tracking-tight leading-[1.05] mb-6">
          Know before you hit
          <br />
          <span className="text-zinc-500">your limits.</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Stackwatch monitors your dev tool usage and alerts you before
          something breaks — no more surprise failures at 2am.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button asChild size="lg" className="px-8 text-sm font-medium">
            <a href="/signup">Start monitoring free</a>
          </Button>
          <a
            href="#how-it-works"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            See how it works →
          </a>
        </div>
      </div>
    </section>
  );
}
