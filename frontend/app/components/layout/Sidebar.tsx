"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";
import {
  LayoutDashboard,
  Plug,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/alerts", label: "Alert History", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  email?: string;
}

export function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const avatarInitial = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-white/6 bg-[#0d0d0d] min-h-screen fixed top-0 left-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.35)] transition-shadow group-hover:shadow-[0_0_18px_rgba(59,130,246,0.55)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white">
                <path
                  d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">Stackwatch</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 pt-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-500 hover:bg-white/4 hover:text-zinc-200"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.7)]" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-blue-400" : "")} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/6">
          {email && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="h-6 w-6 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0 ring-1 ring-blue-500/10">
                <span className="text-[10px] font-bold text-blue-400">{avatarInitial}</span>
              </div>
              <p className="text-xs text-zinc-500 truncate">{email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-white/4 hover:text-zinc-300 transition-colors w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-white/6 flex safe-area-inset-bottom">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
                active ? "text-white" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors", active ? "text-blue-400" : "")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
