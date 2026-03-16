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
      <aside className="hidden md:flex w-56 flex-col border-r border-white/[0.06] bg-[#0d0d0d] min-h-screen fixed top-0 left-0">
        <div className="h-14 flex items-center px-4 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
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
        <nav className="flex-1 p-2 space-y-0.5 pt-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-white/[0.06]">
          {email && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-0.5">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-blue-400">{avatarInitial}</span>
              </div>
              <p className="text-xs text-zinc-600 truncate">{email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors w-full"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] border-t border-white/[0.06] flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors",
                active ? "text-white" : "text-zinc-600"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
