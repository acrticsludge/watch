import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getOverLimitState, getSubscription } from "@/lib/queries/user";
import { TIER_LIMITS } from "@/lib/tiers";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { DashboardRefresher } from "./DashboardRefresher";

export const metadata: Metadata = { title: "Dashboard" };

// Non-async shell — no uncached data access at page level
export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your organizations and projects.</p>
        </div>
        <DashboardRefresher />
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardBody />
      </Suspense>
    </div>
  );
}

async function DashboardBody() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [orgsResult, subscription] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, created_at")
      .order("created_at", { ascending: true }),
    getSubscription(),
  ]);

  const orgs = orgsResult.data ?? [];
  const tier = (subscription?.tier as keyof typeof TIER_LIMITS) ?? "free";
  const limits = TIER_LIMITS[tier];
  const { excessOrgIds, excessProjectIds } = await getOverLimitState(user.id);
  const isOverLimit = excessOrgIds.length > 0 || excessProjectIds.length > 0;

  if (orgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mb-5">
          <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-white mb-2">No organizations yet</h2>
        <p className="text-zinc-500 text-sm max-w-xs mb-6 leading-relaxed">
          Create an organization to get started with Stackwatch.
        </p>
        <Link href="/onboarding">
          <Button size="sm">Create your first organization</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Over-limit banner */}
      {isOverLimit && tier === "free" && (
        <OverLimitBanner />
      )}

      {/* Org list */}
      <div className="space-y-6">
        {orgs.map((org) => (
          <OrgCard
            key={org.id}
            org={org}
            isExcess={excessOrgIds.includes(org.id)}
            excessProjectIds={excessProjectIds}
            tier={tier}
          />
        ))}
      </div>

      {/* New org button */}
      {(limits.orgs === Infinity || orgs.length < limits.orgs) && (
        <div className="pt-2">
          <NewOrgButton />
        </div>
      )}
    </div>
  );
}

async function OrgCard({
  org,
  isExcess,
  excessProjectIds,
  tier,
}: {
  org: { id: string; name: string; slug: string; created_at: string };
  isExcess: boolean;
  excessProjectIds: string[];
  tier: string;
}) {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: true });

  const allProjects = projects ?? [];
  const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];

  return (
    <div className={`bg-[#111] border rounded-xl p-6 ${isExcess ? "border-amber-500/20" : "border-white/6"}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-white">{org.name}</h2>
            {isExcess && (
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">Over limit</span>
            )}
          </div>
          <p className="text-xs text-zinc-600 mt-0.5">{org.slug}</p>
        </div>
        {!isExcess && (
          <Link href={`/orgs/${org.id}`}>
            <Button size="sm" variant="outline" className="border-white/10 text-zinc-300 hover:bg-white/6 text-xs">
              Manage
            </Button>
          </Link>
        )}
      </div>

      {isExcess ? (
        <p className="text-sm text-amber-500/70 mb-4">
          This organization exceeds your free plan limit.{" "}
          <Link href="/settings?tab=billing" className="text-blue-400 underline underline-offset-2">Upgrade to Pro</Link>{" "}
          or delete it to restore access.
        </p>
      ) : (
        <>
          {allProjects.length === 0 ? (
            <p className="text-sm text-zinc-600 mb-4">No projects yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {allProjects.map((project) => {
                const isProjectExcess = excessProjectIds.includes(project.id);
                return (
                  <Link
                    key={project.id}
                    href={`/orgs/${org.id}/projects/${project.id}/dashboard`}
                    className={`block border rounded-lg p-3.5 transition-colors hover:border-white/12 ${isProjectExcess ? "border-amber-500/20 bg-amber-500/3 opacity-75" : "border-white/6 bg-white/2 hover:bg-white/4"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-zinc-200 truncate">{project.name}</p>
                      {isProjectExcess && (
                        <span className="shrink-0 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1 py-0.5 ml-2">Over limit</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600">{project.slug}</p>
                  </Link>
                );
              })}
            </div>
          )}

          {(limits.projectsPerOrg === Infinity || allProjects.length < limits.projectsPerOrg) && (
            <Link href={`/orgs/${org.id}`} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              + New project
            </Link>
          )}
        </>
      )}
    </div>
  );
}

function OverLimitBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3.5">
      <svg className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-300 font-medium">You&apos;re over your Free plan limits</p>
        <p className="text-xs text-amber-400/70 mt-0.5">
          Some organizations or projects are locked.{" "}
          <Link href="/settings?tab=billing" className="underline underline-offset-2 hover:text-amber-300 transition-colors">
            Upgrade to Pro
          </Link>{" "}
          or delete excess resources to restore access.
        </p>
      </div>
    </div>
  );
}

function NewOrgButton() {
  return (
    <NewOrgButtonClient />
  );
}

// Client component for new org creation form
import { NewOrgButtonClient } from "./NewOrgButtonClient";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((i) => (
        <div key={i} className="bg-[#111] border border-white/6 rounded-xl p-6 h-32 animate-pulse" />
      ))}
    </div>
  );
}
