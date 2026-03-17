import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { IntegrationsContent } from "./IntegrationsContent";

export const metadata: Metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const supabase = await createClient();

  const [{ data: integrations }, { data: subscription }] = await Promise.all([
    supabase
      .from("integrations")
      .select("id, service, account_label, status, created_at, last_synced_at, meta")
      .neq("status", "disconnected")
      .order("created_at", { ascending: true }),
    supabase.from("subscriptions").select("tier").eq("status", "active").maybeSingle(),
  ]);

  const tier = subscription?.tier ?? "free";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Integrations</h1>
        <p className="text-zinc-500 text-sm mt-1">Connect your services to start monitoring usage.</p>
      </div>
      <IntegrationsContent integrations={integrations ?? []} tier={tier} />
    </div>
  );
}
