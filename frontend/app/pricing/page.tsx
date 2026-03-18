import type { Metadata } from "next";
import { LandingNav } from "@/app/components/landing/LandingNav";
import { PricingSection } from "@/app/components/landing/PricingSection";
import { LandingFooter } from "@/app/components/landing/LandingFooter";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pricing — Stackwatch",
  description:
    "Simple, transparent pricing. Start free and upgrade when you need more services, faster polling, or team collaboration.",
  alternates: { canonical: "/pricing" },
  openGraph: { url: "/pricing" },
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <LandingNav isLoggedIn={!!user} />
      <main className="pt-16">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-4 text-center">
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-zinc-500 text-base max-w-md mx-auto">
            Start free. Upgrade when you need more accounts, faster polling, or
            team features.
          </p>
        </div>
        <PricingSection userEmail={user?.email} />
      </main>
      <LandingFooter />
    </div>
  );
}
