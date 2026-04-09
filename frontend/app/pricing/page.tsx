import type { Metadata } from "next";
import { LandingNav } from "@/app/components/landing/LandingNav";
import { PricingSection, type PlanState } from "@/app/components/landing/PricingSection";
import { LandingFooter } from "@/app/components/landing/LandingFooter";
import { createClient } from "@/lib/supabase/server";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

const pricingLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${APP_URL}/#software`,
  name: "Stackwatch",
  applicationCategory: "DeveloperApplication",
  url: APP_URL,
  description:
    "Stackwatch is a usage monitoring platform for developer teams. Monitor GitHub Actions, Vercel, Supabase, and Railway quotas from a single dashboard.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      description:
        "1 account per service, email alerts only, 15-minute polling interval, 7-day usage history.",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
      url: `${APP_URL}/signup`,
    },
    {
      "@type": "Offer",
      name: "Pro",
      description:
        "Multiple accounts per service, all alert channels (Email, Slack, Discord, Browser Push), 5-minute polling, 30-day history, usage history graphs.",
      price: "120",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
      url: `${APP_URL}/pricing`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "120",
        priceCurrency: "USD",
        billingDuration: 1,
        unitCode: "ANN",
      },
    },
    {
      "@type": "Offer",
      name: "Team",
      description:
        "Everything in Pro plus team member invites, shared pooled usage dashboard, and team admin controls.",
      price: "360",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
      url: `${APP_URL}/pricing`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "360",
        priceCurrency: "USD",
        billingDuration: 1,
        unitCode: "ANN",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Pricing Plans",
  description:
    "Stackwatch pricing: Free ($0), Pro ($120/yr). Free plan includes 1 account per service and email alerts. Pro adds Slack, Discord, and 5-minute polling. No credit card required to start.",
  alternates: { canonical: `${APP_URL}/pricing` },
  openGraph: { url: `${APP_URL}/pricing` },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingLd) }} />
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
