"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";

interface LandingNavProps {
  isLoggedIn?: boolean;
}

export function LandingNav({ isLoggedIn: initialLoggedIn = false }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.07] bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
          : "border-b border-transparent bg-[#0a0a0a]/60 backdrop-blur-md",
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5 text-white"
            >
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">
            Stackwatch
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/#how-it-works", label: "How it works" },
            { href: "/#features", label: "Features" },
            { href: "/pricing", label: "Pricing" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/[0.04]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Button
              asChild
              size="sm"
              className="h-8 text-xs bg-white text-zinc-900 hover:bg-zinc-100 font-medium"
            >
              <a href="/dashboard">Dashboard →</a>
            </Button>
          ) : (
            <>
              <a
                href="/login"
                className="text-sm text-zinc-500 hover:text-white font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-white/[0.04]"
              >
                Log in
              </a>
              <Button asChild size="sm" className="h-8 text-xs font-medium">
                <a href="/signup">Get started</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
