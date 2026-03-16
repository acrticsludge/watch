import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { DemoWidget } from "@/components/landing/DemoWidget";
import { AlertChannelsSection } from "@/components/landing/AlertChannelsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Stackwatch — Monitor your dev stack limits",
  description:
    "Get alerted before you hit limits on GitHub Actions, Vercel, and Supabase. One dashboard, real-time alerts.",
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <LandingNav isLoggedIn={!!user} />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <ServicesSection />
        <section className="py-20 bg-[#0a0a0a] border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                See it in action
              </h2>
              <p className="text-zinc-500 text-base max-w-xl mx-auto">
                This is what your dashboard looks like. No signup needed to explore.
              </p>
            </div>
            <DemoWidget />
          </div>
        </section>
        <AlertChannelsSection />
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}
