import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Cached per-request user fetch.
 * Uses getUser() (server-verified) instead of getSession() (cookie-only, unverified).
 * Called from layout + multiple pages — only one Auth round-trip per request.
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { user };
});

/**
 * Cached per-request subscription fetch.
 * RLS ensures only the current user's row is returned — no user_id filter needed.
 * Called from layout, dashboard, integrations, alerts, settings — deduplicated automatically.
 */
export const getSubscription = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("tier, status, trial_ends_at")
    .in("status", ["active", "trialing"])
    .maybeSingle();
  return data;
});
