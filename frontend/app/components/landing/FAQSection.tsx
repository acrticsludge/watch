"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan is $0 forever — no credit card required. You get one account per service (GitHub, Vercel, Supabase, Railway), email alerts, and 15-minute polling. Upgrade to Pro when you need more.",
  },
  {
    q: "How does Stackwatch connect to my services?",
    a: "You paste in an API key or personal access token for each service. Stackwatch never asks for your password. Tokens are encrypted before storage and are only used to read usage data — never to write or modify anything.",
  },
  {
    q: "Are my API keys stored securely?",
    a: "All API keys are AES-256 encrypted before they're written to the database. The encryption key is never stored alongside the data. Row-level security on the database ensures you can only ever access your own keys.",
  },
  {
    q: "How often does it check my usage?",
    a: "Free accounts are polled every 15 minutes. Pro and Team accounts are polled every 5 minutes. All polling runs on a dedicated Railway worker — your dashboard doesn't need to be open.",
  },
  {
    q: "Can I get alerted on Slack or Discord?",
    a: "Yes — on the Pro and Team plans. Add an incoming webhook URL in Settings and Stackwatch will post a structured alert message whenever a metric crosses your threshold. Free accounts receive email alerts only.",
  },
  {
    q: "What happens if the same metric stays over the threshold?",
    a: "Stackwatch won't spam you. An alert fires once when the metric crosses your threshold. It won't fire again for that metric until usage drops below the threshold and crosses it again.",
  },
  {
    q: "Does it work with GitHub organisations, not just personal accounts?",
    a: "Yes. When you add a GitHub integration you can connect either a personal account or an organisation. Stackwatch will fetch Actions minutes for all repos under that account.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Absolutely. There's no lock-in. Cancel from the Billing tab in Settings and you won't be charged again. You'll keep Pro features until the end of your current billing period.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-white/4">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Common questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-1">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="border border-white/[0.06] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-zinc-200 hover:text-white transition-colors bg-transparent"
                >
                  <span>{item.q}</span>
                  <svg
                    className={`shrink-0 h-4 w-4 text-zinc-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-zinc-500 leading-relaxed border-t border-white/[0.05]">
                    <p className="pt-4">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Inline CTA */}
        <div className="mt-14 text-center">
          <p className="text-sm text-zinc-600 mb-4">
            Still have questions?{" "}
            <a
              href="mailto:support@pulsemonitor.dev"
              className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors"
            >
              Send us a note
            </a>{" "}
            — or just try it free.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
          >
            Get started for free →
          </Link>
        </div>
      </div>
    </section>
  );
}
