"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Plug,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const ROOT_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

const TIER_STYLES: Record<string, string> = {
  pro: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  team: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  free: "bg-white/5 text-zinc-500 border-white/8",
};

interface SidebarProps {
  email?: string;
  tier?: string;
  // Project-mode props — when set, renders project nav instead of root nav
  orgId?: string;
  projectId?: string;
  orgName?: string;
  projectName?: string;
}

export function Sidebar({
  email,
  tier = "free",
  orgId,
  projectId,
  orgName,
  projectName,
}: SidebarProps) {
  const pathname = usePathname();
  const isProjectMode = !!(orgId && projectId);

  const projectBase = isProjectMode ? `/orgs/${orgId}/projects/${projectId}` : "";
  const PROJECT_NAV_ITEMS = [
    { href: `${projectBase}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${projectBase}/integrations`, label: "Integrations", icon: Plug },
    { href: `${projectBase}/alerts`, label: "Alert History", icon: Bell },
    { href: `${projectBase}/settings`, label: "Settings", icon: Settings },
  ];

  const avatarInitial = email ? email.charAt(0).toUpperCase() : "?";

  const navItems = isProjectMode ? PROJECT_NAV_ITEMS : ROOT_NAV_ITEMS;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-white/6 bg-[#0d0d0d] min-h-screen fixed top-0 left-0">
        {/* Logo / Breadcrumb */}
        <div className="h-14 flex items-center px-4 border-b border-white/6">
          {isProjectMode ? (
            <Link href={`/orgs/${orgId}`} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-medium truncate">
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">{orgName ?? "Organization"}</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.35)] transition-shadow group-hover:shadow-[0_0_18px_rgba(59,130,246,0.55)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white">
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-semibold text-white tracking-tight text-sm">Stackwatch</span>
            </Link>
          )}
        </div>

        {/* Project header (project mode only) */}
        {isProjectMode && (
          <div className="px-4 py-3 border-b border-white/4">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-0.5">Project</p>
            <p className="text-sm font-semibold text-white truncate">{projectName ?? "Project"}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 pt-3">
          {navItems.map(({ href, label, icon: Icon }) => {
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
          {/* User-level settings link in project mode */}
          {isProjectMode && (
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-1",
                pathname === "/settings"
                  ? "bg-white/[0.07] text-white"
                  : "text-zinc-600 hover:bg-white/4 hover:text-zinc-400"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Account settings
            </Link>
          )}

          {email && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="h-6 w-6 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0 ring-1 ring-blue-500/10">
                <span className="text-[10px] font-bold text-blue-400">{avatarInitial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 truncate">{email}</p>
              </div>
              <span className={cn(
                "shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border",
                TIER_STYLES[tier] ?? TIER_STYLES.free
              )}>
                {tier}
              </span>
            </div>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-white/4 hover:text-zinc-300 transition-colors w-full"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-white/6 flex safe-area-inset-bottom">
        {navItems.map(({ href, label, icon: Icon }) => {
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
