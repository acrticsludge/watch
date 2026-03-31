import type { Metadata } from "next";
import { LandingNav } from "@/app/components/landing/LandingNav";
import { PricingSection, type PlanState } from "@/app/components/landing/PricingSection";
import { LandingFooter } from "@/app/components/landing/LandingFooter";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description:
    "Stackwatch pricing: Free ($0), Pro ($120/yr). Free plan includes 1 account per service and email alerts. Pro adds Slack, Discord, and 5-minute polling. No credit card required to start.",
  alternates: { canonical: "/pricing" },
  openGraph: { url: "/pricing" },
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let planState: PlanState = "none";

  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier, status, cancel_at_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub) {
      if (sub.status === "trialing") {
        planState = "trialing";
      } else if (sub.status === "active" && (sub.tier === "pro" || sub.tier === "team")) {
        planState = sub.cancel_at_period_end ? "active_cancelling" : "active";
      } else if (sub.status === "past_due") {
        planState = "past_due";
      } else {
        planState = "used_trial";
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <LandingNav isLoggedIn={!!user} />
      <main className="pt-16">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-4 text-center">
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Choose your plan
          </h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Start free. Upgrade when you need more accounts, faster polling, or
            team features.
          </p>
        </div>
        <PricingSection userEmail={user?.email} planState={planState} />
      </main>
      <LandingFooter />
    </div>
  );
}
