import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingNav } from "@/app/components/landing/LandingNav";
import { LandingFooter } from "@/app/components/landing/LandingFooter";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { createClient } from "@/lib/supabase/server";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is there a free plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Free plan is $0 forever — no credit card required. You get one account per service (GitHub, Vercel, Supabase, Railway), email alerts, and 15-minute polling. Upgrade to Pro when you need more.",
      },
    },
    {
      "@type": "Question",
      name: "How does Stackwatch connect to my services?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You paste in an API key or personal access token for each service. Stackwatch never asks for your password. Tokens are encrypted before storage and are only used to read usage data — never to write or modify anything.",
      },
    },
    {
      "@type": "Question",
      name: "Are my API keys stored securely?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All API keys are AES-256 encrypted before they're written to the database. The encryption key is never stored alongside the data. Row-level security on the database ensures you can only ever access your own keys.",
      },
    },
    {
      "@type": "Question",
      name: "How often does it check my usage?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Free accounts are polled every 15 minutes. Pro and Team accounts are polled every 5 minutes. All polling runs on a dedicated Railway worker — your dashboard doesn't need to be open.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get alerted on Slack or Discord?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — on the Pro and Team plans. Add an incoming webhook URL in Settings and Stackwatch will post a structured alert message whenever a metric crosses your threshold. Free accounts receive email alerts only.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if the same metric stays over the threshold?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stackwatch won't spam you. An alert fires once when the metric crosses your threshold. It won't fire again for that metric until usage drops below the threshold and crosses it again.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work with GitHub organisations, not just personal accounts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. When you add a GitHub integration you can connect either a personal account or an organisation. Stackwatch will fetch Actions minutes for all repos under that account.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel at any time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. There's no lock-in. Cancel from the Billing tab in Settings and you won't be charged again. You'll keep Pro features until the end of your current billing period.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Stackwatch — pricing, security, integrations, alerts, and more.",
  alternates: {
    canonical: `${APP_URL}/faq`,
  },
  openGraph: {
    url: `${APP_URL}/faq`,
    title: "FAQ | Stackwatch",
    description:
      "Frequently asked questions about Stackwatch — pricing, security, integrations, alerts, and more.",
  },
};

async function DynamicNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <LandingNav isLoggedIn={!!user} />;
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Suspense fallback={<LandingNav isLoggedIn={false} />}>
        <DynamicNav />
      </Suspense>

      <main>
        <FAQSection />
      </main>

      <LandingFooter />
    </div>
  );
}
