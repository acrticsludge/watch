export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white">
              <path
                d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-semibold text-zinc-500 text-sm">Stackwatch</span>
          <span className="text-zinc-700 text-sm">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="/login" className="text-sm text-zinc-700 hover:text-zinc-400 transition-colors">Log in</a>
          <a href="/signup" className="text-sm text-zinc-700 hover:text-zinc-400 transition-colors">Sign up</a>
          <a href="#pricing" className="text-sm text-zinc-700 hover:text-zinc-400 transition-colors">Pricing</a>
          <a href="/privacy" className="text-sm text-zinc-700 hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="/terms" className="text-sm text-zinc-700 hover:text-zinc-400 transition-colors">Terms</a>
        </nav>
      </div>
    </footer>
  );
}
