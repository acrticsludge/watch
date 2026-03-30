export function LandingFooter() {
  return (
    <footer className="border-t border-[#161616] bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="h-5 w-5 rounded bg-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white">
              <path
                d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-semibold text-zinc-500 text-sm tracking-tight">Stackwatch</span>
          <span className="text-zinc-700 text-sm">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex items-center gap-1 flex-wrap justify-center">
          {[
            { href: "/login", label: "Log in" },
            { href: "/signup", label: "Sign up" },
            { href: "/pricing", label: "Pricing" },
            { href: "/faq", label: "FAQ" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-700 hover:text-zinc-400 transition-colors px-3 py-1.5 rounded-md hover:bg-white/4"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
