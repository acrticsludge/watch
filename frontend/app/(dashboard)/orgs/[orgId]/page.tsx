import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOverLimitState } from "@/lib/queries/user";
import { getSubscription } from "@/lib/queries/user";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export const metadata: Metadata = { title: "Organization" };

export default function OrgPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  return (
    <Suspense fallback={<OrgSkeleton />}>
      <OrgContent params={params} />
    </Suspense>
  );
}

async function OrgContent({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  // Verify ownership
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, created_at")
    .eq("id", orgId)
    .eq("owner_id", user.id)
    .single();

  if (!org) redirect("/dashboard");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, slug, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  const subscription = await getSubscription();
  const tier = subscription?.tier ?? "free";
  const { excessProjectIds } = await getOverLimitState(user.id);

  const allProjects = projects ?? [];

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Organization</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">{org.name}</h1>
        </div>
        <Link href={`/orgs/${orgId}/new-project`}>
          <Button size="sm">New project</Button>
        </Link>
      </div>

      {allProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mb-5">
            <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white mb-2">No projects yet</h2>
          <p className="text-zinc-500 text-sm max-w-xs mb-6 leading-relaxed">
            Create a project to start organizing your integrations.
          </p>
          <Link href={`/orgs/${orgId}/new-project`}>
            <Button size="sm">Create your first project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProjects.map((project) => {
            const isExcess = excessProjectIds.includes(project.id);
            return (
              <Link
                key={project.id}
                href={`/orgs/${orgId}/projects/${project.id}/dashboard`}
                className={`block bg-[#111] border rounded-xl p-5 transition-colors hover:border-white/12 ${isExcess ? "border-amber-500/20 opacity-75" : "border-white/6"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  {isExcess && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">Over limit</span>
                  )}
                </div>
                <p className="font-semibold text-white text-sm mb-0.5">{project.name}</p>
                <p className="text-xs text-zinc-600">{project.slug}</p>
                {isExcess && tier === "free" && (
                  <p className="text-xs text-amber-500/70 mt-2">
                    Exceeds free plan project limit. <Link href="/settings?tab=billing" className="underline" onClick={(e) => e.stopPropagation()}>Upgrade to Pro</Link>
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrgSkeleton() {
  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-3 w-20 bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#111] border border-white/6 rounded-xl p-5 h-24 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
