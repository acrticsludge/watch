import type { Metadata } from "next";
import { LandingNav } from "@/app/components/landing/LandingNav";
import { Hero } from "@/app/components/landing/Hero";
import { ProblemSection } from "@/app/components/landing/ProblemSection";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { ServicesSection } from "@/app/components/landing/ServicesSection";
import { DemoWidget } from "@/app/components/landing/DemoWidget";
import { AlertChannelsSection } from "@/app/components/landing/AlertChannelsSection";
import { PricingSection } from "@/app/components/landing/PricingSection";
import { LandingFooter } from "@/app/components/landing/LandingFooter";
import { createClient } from "@/lib/supabase/server";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

export const metadata: Metadata = {
  title: "Stackwatch — Monitor your dev stack limits",
  description:
    "Get alerted before you hit limits on GitHub Actions, Vercel, and Supabase. One dashboard, real-time alerts.",
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    url: APP_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Stackwatch",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: APP_URL,
  description:
    "Monitoring platform for developer tool usage limits. Get alerted before you hit limits on GitHub Actions, Vercel, and Supabase.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      name: "Free",
    },
    {
      "@type": "Offer",
      price: "10",
      priceCurrency: "USD",
      name: "Pro",
    },
    {
      "@type": "Offer",
      price: "30",
      priceCurrency: "USD",
      name: "Team",
    },
  ],
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav isLoggedIn={!!user} />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <ServicesSection />

        {/* Demo section */}
        <section className="py-24 bg-[#0a0a0a] border-t border-white/4">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">
                Live preview
              </p>
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                See it in action
              </h2>
              <p className="text-zinc-500 text-base max-w-xl mx-auto">
                This is what your dashboard looks like. No signup needed to
                explore.
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
