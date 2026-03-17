import type { Metadata } from "next";
import { LandingNav } from "@/app/components/landing/LandingNav";
import { LandingFooter } from "@/app/components/landing/LandingFooter";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Terms of Service — Stackwatch",
  description: "Terms and conditions for using Stackwatch.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms" },
  robots: { index: true, follow: false },
};

export default async function TermsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <LandingNav isLoggedIn={!!user} />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-zinc-500 text-sm">
            Effective date: 16 March 2026 · Last updated: 16 March 2026
          </p>
        </div>

        <div className="space-y-10 text-zinc-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Stackwatch (&ldquo;Service&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) at{" "}
              <span className="text-zinc-300">stackwatch.pulsemonitor.dev</span>
              , you agree to be bound by these Terms of Service
              (&ldquo;Terms&rdquo;). If you do not agree, do not use the
              Service. These Terms constitute a legally binding agreement under
              the{" "}
              <span className="text-zinc-300">
                Information Technology Act, 2000
              </span>{" "}
              and the{" "}
              <span className="text-zinc-300">Indian Contract Act, 1872</span>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              2. Description of Service
            </h2>
            <p>
              Stackwatch is a usage monitoring tool that connects to third-party
              developer services (GitHub, Vercel, Supabase) via credentials you
              provide, polls usage data on a schedule, and sends alerts when
              usage approaches limits you configure. The Service is provided on
              an &ldquo;as-is&rdquo; basis.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              3. Eligibility
            </h2>
            <p>
              You must be at least 18 years old to use the Service. By creating
              an account, you represent that you meet this requirement and have
              the legal capacity to enter into a binding contract under Indian
              law. If you are using the Service on behalf of an organisation,
              you represent that you have authority to bind that organisation to
              these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              4. Account and Security
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. You must notify us immediately at{" "}
              <a
                href="mailto:anubhavrai100@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                anubhavrai100@gmail.com
              </a>{" "}
              if you suspect unauthorised access to your account. We are not
              liable for any loss resulting from unauthorised use of your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              5. Use of Third-Party API Credentials
            </h2>
            <p>
              When you connect a third-party service (GitHub, Vercel, Supabase),
              you grant Stackwatch limited, read-only access to the billing and
              usage data exposed by that service&apos;s API. You must ensure
              that your use of those credentials complies with the respective
              service&apos;s terms of service. You are solely responsible for
              the credentials you provide. We store them encrypted and never
              share them with third parties beyond the service you are
              connecting.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              6. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>
                Use the Service for any unlawful purpose or in violation of any
                applicable law
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the Service
                or its systems
              </li>
              <li>
                Reverse-engineer, decompile, or disassemble any portion of the
                Service
              </li>
              <li>
                Use the Service to store or transmit malicious code or harmful
                data
              </li>
              <li>
                Resell or sublicense access to the Service without our written
                consent
              </li>
              <li>
                Submit API credentials belonging to a third party without their
                consent
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              7. Subscription and Billing
            </h2>
            <p>
              Stackwatch offers a Free tier at no charge and paid tiers (Pro,
              Team) billed monthly. Prices are displayed on our{" "}
              <a
                href="/pricing"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Pricing page
              </a>
              . All fees are exclusive of applicable taxes. Subscription charges
              are non-refundable except as required by the{" "}
              <span className="text-zinc-300">
                Consumer Protection Act, 2019
              </span>
              . You may cancel your subscription at any time; access continues
              until the end of the billing period.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              8. Service Availability and Modifications
            </h2>
            <p>
              We aim to maintain high availability but do not guarantee
              uninterrupted access. We may modify, suspend, or discontinue any
              part of the Service at any time. We will provide reasonable notice
              for material changes to paid tiers. We are not liable for any loss
              resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              9. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, express or
              implied, including but not limited to warranties of
              merchantability, fitness for a particular purpose, or
              non-infringement. We do not warrant that alerts will be delivered
              without delay, or that usage data fetched from third-party APIs
              will be accurate or complete.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted under applicable Indian law, we
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including loss of profits,
              data, or goodwill, arising out of or in connection with your use
              of the Service — even if we have been advised of the possibility
              of such damages. Our total liability for any claim arising under
              these Terms shall not exceed the amount you paid us in the 3
              months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              11. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold harmless Stackwatch and its
              operators from and against any claims, damages, losses, and
              expenses (including reasonable legal fees) arising from your
              violation of these Terms, your use of the Service, or your
              infringement of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              12. Intellectual Property
            </h2>
            <p>
              All content, code, and materials comprising the Service are the
              property of Stackwatch or its licensors and are protected under
              applicable intellectual property laws. You are granted a limited,
              non-exclusive, non-transferable licence to access and use the
              Service for its intended purpose only. No rights are granted
              beyond what is expressly stated here.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              13. Privacy
            </h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <a
                href="/privacy"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              14. Termination
            </h2>
            <p>
              We may terminate or suspend your account immediately, without
              notice, if you breach these Terms or engage in conduct we
              reasonably believe is harmful to the Service or other users. Upon
              termination, your right to use the Service ceases immediately and
              we may delete your data subject to our data retention obligations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              15. Governing Law and Dispute Resolution
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of India. Any dispute arising out of or relating to these
              Terms or the Service shall be subject to the exclusive
              jurisdiction of the competent courts of India. Before initiating
              legal proceedings, you agree to attempt to resolve disputes
              amicably by contacting us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              16. Contact
            </h2>
            <p>For any questions regarding these Terms, please contact:</p>
            <div className="mt-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-zinc-300">
              <p className="font-medium text-zinc-200">Stackwatch</p>
              <p className="mt-1">
                Email:{" "}
                <a
                  href="mailto:anubhavrai100@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  anubhavrai100@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-200 mb-3">
              17. Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              notify registered users via email and update the &ldquo;Last
              updated&rdquo; date above. Continued use of the Service after the
              effective date of revised Terms constitutes acceptance of those
              changes.
            </p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
