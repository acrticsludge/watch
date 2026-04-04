import { redirect } from "next/navigation";
import { getSession, getOrgCount } from "@/lib/queries/user";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Already has orgs — send to dashboard
  const count = await getOrgCount();
  if (count > 0) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="h-8 w-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.4)]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight text-lg">Stackwatch</span>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Welcome to Stackwatch</h1>
          <p className="text-zinc-500 text-sm mb-6">
            Set up your first organization and project to get started.
          </p>
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
