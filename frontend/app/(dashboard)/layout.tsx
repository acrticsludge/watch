import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, getSubscription } from "@/lib/queries/user";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { ProLaunchBanner } from "@/app/components/dashboard/ProLaunchBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/dashboard";
    redirect(`/login?redirectTo=${encodeURIComponent(pathname)}`);
  }

  const subscription = await getSubscription();
  const tier = subscription?.tier ?? "free";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar email={session.user.email} tier={tier} />
      {/* Offset for sidebar on desktop, bottom nav on mobile */}
      <main className="md:ml-56 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10">
          {tier === "free" && <ProLaunchBanner />}
          {children}
        </div>
      </main>
    </div>
  );
}
