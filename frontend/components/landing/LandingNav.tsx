import { Button } from "@/components/ui/button";

interface LandingNavProps {
  isLoggedIn?: boolean;
}

export function LandingNav({ isLoggedIn = false }: LandingNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white">
              <path
                d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">Stackwatch</span>
        </a>
        <nav className="hidden md:flex items-center gap-7">
          <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
            How it works
          </a>
          <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 text-xs border-white/10 bg-transparent text-white hover:bg-white/[0.06] hover:text-white"
            >
              <a href="/dashboard">Dashboard →</a>
            </Button>
          ) : (
            <>
              <a href="/login" className="text-sm text-zinc-400 hover:text-white font-medium transition-colors">
                Log in
              </a>
              <Button asChild size="sm" className="h-8 text-xs">
                <a href="/signup">Get started</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
