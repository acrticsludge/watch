import { redirect } from "next/navigation";
import { getSession, getOrgAndProject, getOverLimitState } from "@/lib/queries/user";
import { getSubscription } from "@/lib/queries/user";
import { Sidebar } from "@/app/components/layout/Sidebar";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string; projectId: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { orgId, projectId } = await params;

  const session = await getSession();
  if (!session) redirect("/login");

  const result = await getOrgAndProject(orgId, projectId);
  if (!result) redirect("/dashboard");

  const { org, project } = result;

  // Check if this org or project is over the tier limit (downgrade handling)
  const { excessOrgIds, excessProjectIds } = await getOverLimitState(session.user.id);

  const isOrgExcess = excessOrgIds.includes(orgId);
  const isProjectExcess = excessProjectIds.includes(projectId);

  const subscription = await getSubscription();
  const tier = subscription?.tier ?? "free";

  if (isOrgExcess || isProjectExcess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Sidebar
          email={session.user.email}
          tier={tier}
          orgId={orgId}
          projectId={projectId}
          orgName={org.name}
          projectName={project.name}
        />
        <main className="md:ml-56 pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10">
            <LockedProjectPage
              orgId={orgId}
              orgName={org.name}
              projectName={project.name}
              isOrgExcess={isOrgExcess}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar
        email={session.user.email}
        tier={tier}
        orgId={orgId}
        projectId={projectId}
        orgName={org.name}
        projectName={project.name}
      />
      <main className="md:ml-56 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function LockedProjectPage({
  orgId,
  orgName,
  projectName,
  isOrgExcess,
}: {
  orgId: string;
  orgName: string;
  projectName: string;
  isOrgExcess: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
        <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">
        {isOrgExcess ? `Organization "${orgName}" is over your plan limit` : `Project "${projectName}" is over your plan limit`}
      </h2>
      <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">
        {isOrgExcess
          ? "This organization exceeds the number allowed on your current plan. Upgrade to Pro or delete excess organizations."
          : "This project exceeds the number allowed on your current plan. Upgrade to Pro or delete excess projects."}
      </p>
      <div className="flex gap-3">
        <a
          href="/settings?tab=billing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          Upgrade to Pro
        </a>
        <a
          href={isOrgExcess ? "/dashboard" : `/orgs/${orgId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-zinc-300 text-sm font-medium transition-colors"
        >
          Go back
        </a>
      </div>
    </div>
  );
}
