import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For solo devs getting started",
    features: [
      "1 account per service",
      "3 services (GitHub, Vercel, Supabase)",
      "Email alerts",
      "15-minute polling",
      "7-day alert history",
    ],
    cta: "Get started free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$10",
    period: "/month",
    description: "For individuals with multiple projects",
    features: [
      "5 accounts per service",
      "All services",
      "Email + Slack + Discord alerts",
      "5-minute polling",
      "30-day alert history",
      "Usage history charts",
    ],
    cta: "Start Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$30",
    period: "/month",
    description: "For teams sharing infrastructure",
    features: [
      "Unlimited accounts",
      "All services",
      "All alert channels + Browser push",
      "1-minute polling",
      "90-day alert history",
      "Team dashboard",
      "Shared alert configs",
    ],
    cta: "Start Team",
    href: "/signup?plan=team",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#0a0a0a] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-500 text-base">
            Start free. Upgrade when you need more.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 items-start">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl p-6 ${
                p.highlight
                  ? "bg-blue-600/[0.08] border border-blue-500/25"
                  : "bg-[#111] border border-white/[0.06]"
              }`}
            >
              <div className="mb-5">
                <p
                  className={`text-xs font-medium mb-2 uppercase tracking-widest ${
                    p.highlight ? "text-blue-400" : "text-zinc-600"
                  }`}
                >
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{p.price}</span>
                  {p.period && (
                    <span className="text-sm text-zinc-600">{p.period}</span>
                  )}
                </div>
                <p
                  className={`text-sm mt-1.5 ${
                    p.highlight ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  {p.description}
                </p>
              </div>
              <ul className="space-y-2.5 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                        p.highlight ? "text-blue-400" : "text-zinc-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={`text-sm ${
                        p.highlight ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={p.href}
                className={`flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  p.highlight
                    ? "bg-blue-500 hover:bg-blue-400 text-white"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white"
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
