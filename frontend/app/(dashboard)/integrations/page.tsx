import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/queries/user";
import { IntegrationsContent } from "./IntegrationsContent";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Integrations</h1>
        <p className="text-zinc-500 text-sm mt-1">Connect your services to start monitoring usage.</p>
      </div>
      <Suspense fallback={<IntegrationsSkeleton />}>
        <IntegrationsData />
      </Suspense>
    </div>
  );
}

async function IntegrationsData() {
  const supabase = await createClient();

  const [{ data: integrations }, subscription, { data: { user } }] = await Promise.all([
    supabase
      .from("integrations")
      .select("id, service, account_label, status, created_at, last_synced_at, meta, sort_order")
      .neq("status", "disconnected")
      .order("sort_order", { ascending: true }),
    getSubscription(),
    supabase.auth.getUser(),
  ]);

  const tier = subscription?.tier ?? "free";
  const hasGithubIdentity =
    user?.identities?.some((i) => i.provider === "github") ?? false;

  return (
    <IntegrationsContent
      integrations={integrations ?? []}
      tier={tier}
      hasGithubIdentity={hasGithubIdentity}
    />
  );
}

function IntegrationsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-[#111] border border-white/6 rounded-xl p-5 h-36 animate-pulse"
        />
      ))}
    </div>
  );
}
