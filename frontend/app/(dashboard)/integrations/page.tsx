import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { IntegrationsContent } from "./IntegrationsContent";

export const metadata: Metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const supabase = await createClient();

  const { data: integrations } = await supabase
    .from("integrations")
    .select("id, service, account_label, status, created_at, last_synced_at")
    .neq("status", "disconnected")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-1 tracking-tight">Integrations</h1>
      <p className="text-zinc-600 text-sm mb-8">
        Connect your services to start monitoring usage.
      </p>
      <IntegrationsContent integrations={integrations ?? []} />
    </div>
  );
}
