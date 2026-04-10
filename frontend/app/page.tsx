import type { Metadata } from "next";
import { LandingNav } from "@/app/components/landing/LandingNav";
import { getSession } from "@/lib/queries/user";

import { Hero } from "@/app/components/landing/Hero";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { AlertChannelsSection } from "@/app/components/landing/AlertChannelsSection";
import { CTASection } from "@/app/components/landing/CTASection";
import { LandingFooter } from "@/app/components/landing/LandingFooter";
import { ServicesStrip } from "@/app/components/landing/ServicesStrip";
import { HeroDemoLoader } from "@/app/components/landing/HeroDemoLoader";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

export const metadata: Metadata = {
  title: "Stackwatch — Know before your users do",
  description:
    "Stackwatch is the quota guardrail for early-stage SaaS teams in production. Get alerted before GitHub Actions, Vercel, or Supabase limits become a production incident.",
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    url: APP_URL,
    title: "Stackwatch — Know before your users do",
  },
  twitter: {
    title: "Stackwatch — Know before your users do",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Stackwatch",
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "DevOps Monitoring",
  operatingSystem: "Web",
  url: APP_URL,
  description:
    "Stackwatch is a usage monitoring platform for developer teams. Connect GitHub Actions, Vercel, Supabase, and Railway to a single dashboard. Get alerted before you hit quota limits.",
  featureList: [
    "GitHub Actions minutes monitoring",
    "Vercel bandwidth and build minutes tracking",
    "Supabase database size and MAU monitoring",
    "Railway usage monitoring",
    "Email, Slack, Discord, and Browser Push alerts",
    "Configurable threshold alerts",
    "Usage history charts",
    "Team dashboard with shared pooled usage",
  ],
  "@id": `${APP_URL}/#software`,
  screenshot: `${APP_URL}/og`,
  author: {
    "@type": "Organization",
    "@id": `${APP_URL}/#organization`,
    name: "Stackwatch",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      description: "1 account per service, email alerts, 15-minute polling, 7-day history.",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
      url: `${APP_URL}/signup`,
    },
    {
      "@type": "Offer",
      name: "Pro",
      description: "5 accounts per service, all alert channels, 5-minute polling, 30-day history, usage charts.",
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
      description: "Unlimited accounts, all services, 1-minute polling, 90-day history, shared team dashboard.",
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

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${APP_URL}/#organization`,
  name: "Stackwatch",
  url: APP_URL,
  logo: {
    "@type": "ImageObject",
    url: `${APP_URL}/og`,
    width: 1200,
    height: 630,
  },
  description:
    "Stackwatch is a usage monitoring SaaS for developer teams. It watches GitHub Actions, Vercel, Supabase, and Railway quotas and sends alerts before limits cause production incidents.",
  sameAs: ["https://github.com/acrticsludge/Stackwatch"],
};

const videoLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Stackwatch product demo",
  description:
    "A walkthrough of the Stackwatch dashboard — connecting GitHub Actions, Vercel, and Supabase integrations, setting threshold alerts, and viewing usage history.",
  thumbnailUrl: `${APP_URL}/StackwatchDemo-poster.jpg`,
  uploadDate: "2026-03-26T00:00:00Z",
  duration: "PT46S",
  contentUrl: `${APP_URL}/StackwatchDemo.mp4`,
  embedUrl: `${APP_URL}/StackwatchDemo.mp4`,
};

export const revalidate = 3600; // revalidate landing page shell hourly

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }} />

      <LandingNav isLoggedIn={!!session} />

      <main>
        <Hero />
        <ServicesStrip />

        {/* Demo video */}
        <section className="py-16 bg-[#0a0a0a] border-t border-[#161616]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <HeroDemoLoader />
          </div>
        </section>

        <HowItWorks />
        <AlertChannelsSection />
        <CTASection />
      </main>

      <LandingFooter />
    </div>
  );
}
