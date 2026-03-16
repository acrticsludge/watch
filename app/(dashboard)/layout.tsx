import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar email={user.email} />
      {/* Offset for sidebar on desktop, bottom nav on mobile */}
      <main className="md:ml-56 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
