import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Privacy Policy — Stackwatch",
  description: "How Stackwatch collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
  robots: { index: true, follow: false },
};

export default async function PrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <LandingNav isLoggedIn={!!user} />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Effective date: 16 March 2026 · Last updated: 16 March 2026</p>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none space-y-10 text-zinc-400 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">1. Overview</h2>
            <p>
              Stackwatch (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is operated by an individual based in India. This Privacy Policy
              describes how we collect, use, store, and disclose information when you use our service at{" "}
              <span className="text-zinc-300">stackwatch.pulsemonitor.dev</span> (&ldquo;Service&rdquo;).
            </p>
            <p className="mt-3">
              This Policy is published in compliance with the{" "}
              <span className="text-zinc-300">Information Technology Act, 2000</span>,{" "}
              <span className="text-zinc-300">
                Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or
                Information) Rules, 2011
              </span>{" "}
              (&ldquo;SPDI Rules&rdquo;), and the{" "}
              <span className="text-zinc-300">Digital Personal Data Protection Act, 2023</span> (&ldquo;DPDP Act&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">2. Information We Collect</h2>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">2.1 Account Information</h3>
            <p>
              When you register, we collect your email address and (if you set one) a hashed password. If you sign in
              via GitHub or Google OAuth, we receive only your email address and public profile name from those providers.
            </p>
            <h3 className="text-sm font-medium text-zinc-300 mt-4 mb-2">2.2 Integration Credentials</h3>
            <p>
              You may provide API tokens or keys for third-party services (GitHub, Vercel, Supabase). These are
              encrypted using AES-256 at rest before storage. We never log, display, or transmit raw keys outside
              of the encrypted data store.
            </p>
            <h3 className="text-sm font-medium text-zinc-300 mt-4 mb-2">2.3 Usage Data</h3>
            <p>
              We poll your connected service APIs on your behalf and store the resulting metrics (e.g., Actions minutes
              used, database size) in our database. This data is used solely to power your dashboard and generate alerts.
            </p>
            <h3 className="text-sm font-medium text-zinc-300 mt-4 mb-2">2.4 Log and Technical Data</h3>
            <p>
              We collect standard server logs including IP addresses, browser type, pages visited, and timestamps.
              This data is retained for up to 30 days and used for security and debugging purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>To provide, operate, and maintain the Service</li>
              <li>To send usage alerts and notifications you have configured</li>
              <li>To respond to your support requests</li>
              <li>To detect and prevent fraud, abuse, or security incidents</li>
              <li>To comply with legal obligations under applicable Indian law</li>
            </ul>
            <p className="mt-3">
              We do <span className="text-zinc-300">not</span> sell your personal data to third parties. We do not use
              your data for advertising or profiling unrelated to the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">4. Sensitive Personal Data or Information (SPDI)</h2>
            <p>
              Under the SPDI Rules, API keys and passwords qualify as sensitive personal data. We handle this data with
              enhanced controls: encryption at rest, access restricted to the minimum necessary personnel, and no
              transmission to third parties except the service you have explicitly connected.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">5. Data Sharing and Third Parties</h2>
            <p>We share your data only in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>
                <span className="text-zinc-300">Supabase</span> — our database and authentication provider (data processed in the EU/US under their DPA)
              </li>
              <li>
                <span className="text-zinc-300">Vercel</span> — our hosting provider (infrastructure only, no application data access)
              </li>
              <li>
                <span className="text-zinc-300">Resend</span> — used to deliver alert emails on your behalf
              </li>
              <li>
                <span className="text-zinc-300">Railway</span> — runs our background polling worker
              </li>
              <li>As required by law or court order under Indian jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Usage snapshots are retained for 7 days
              (Free tier) or 30 days (Pro/Team). You may request deletion of your account and all associated data at any
              time by emailing us (see Section 10).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">7. Cross-Border Data Transfers</h2>
            <p>
              Our infrastructure providers (Supabase, Vercel, Railway) may store and process data outside India.
              By using the Service, you consent to such transfers. We ensure these providers maintain adequate security
              standards consistent with the DPDP Act and applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">8. Your Rights</h2>
            <p>Under the DPDP Act, 2023 and applicable law, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request erasure of your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li>Withdraw consent for processing at any time</li>
              <li>Nominate a person to exercise rights on your behalf in the event of death or incapacity</li>
              <li>File a complaint with the Data Protection Board of India</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email our Grievance Officer (Section 10) with the subject line
              &ldquo;Data Rights Request&rdquo;.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">9. Security</h2>
            <p>
              We implement reasonable security practices as required under the SPDI Rules, including AES-256 encryption
              for sensitive credentials, HTTPS-only communication, Row Level Security on all database tables, and
              restricted service-role access for background jobs. No system is perfectly secure — please use a strong,
              unique password and enable two-factor authentication on your connected service accounts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">10. Grievance Officer</h2>
            <p>
              As required under the IT Act, 2000 and SPDI Rules, we have appointed a Grievance Officer. You may
              contact them for any privacy-related concerns:
            </p>
            <div className="mt-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-zinc-300">
              <p className="font-medium text-zinc-200">Grievance Officer — Stackwatch</p>
              <p className="mt-1">
                Email:{" "}
                <a
                  href="mailto:anubhavrai100@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  anubhavrai100@gmail.com
                </a>
              </p>
              <p className="mt-1 text-zinc-500 text-xs">
                We aim to acknowledge your grievance within 48 hours and resolve it within 30 days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">11. Cookies</h2>
            <p>
              We use only essential session cookies required for authentication. We do not use advertising,
              analytics, or tracking cookies. You can disable cookies in your browser settings, but this will
              prevent you from logging in.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">12. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed at individuals under 18 years of age. We do not knowingly collect personal
              data from minors. If you believe a minor has provided us data, please contact the Grievance Officer for
              immediate deletion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users by email and
              update the &ldquo;Last updated&rdquo; date at the top. Continued use of the Service after changes constitutes
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">14. Governing Law</h2>
            <p>
              This Privacy Policy is governed by the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of the courts of India.
            </p>
          </section>

        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
