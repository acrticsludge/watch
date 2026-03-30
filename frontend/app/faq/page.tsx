import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingNav } from "@/app/components/landing/LandingNav";
import { LandingFooter } from "@/app/components/landing/LandingFooter";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { createClient } from "@/lib/supabase/server";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

export const metadata: Metadata = {
  title: "FAQ — Stackwatch",
  description:
    "Frequently asked questions about Stackwatch — pricing, security, integrations, alerts, and more.",
  alternates: {
    canonical: `${APP_URL}/faq`,
  },
  openGraph: {
    url: `${APP_URL}/faq`,
    title: "FAQ — Stackwatch",
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
