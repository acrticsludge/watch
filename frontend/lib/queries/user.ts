import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS, getUserTier } from "@/lib/tiers";

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
    .select("tier, status, trial_ends_at, next_billing_at, cancel_at_period_end, past_due_since")
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();

  if (!data) return null;

  // Enforce 3-day grace period: past the window, treat as free (return null).
  if (data.status === "past_due") {
    const gracePeriodMs = 3 * 24 * 60 * 60 * 1000;
    const since = data.past_due_since ? new Date(data.past_due_since).getTime() : 0;
    if (Date.now() - since > gracePeriodMs) return null;
  }

  return data;
});

/**
 * Count of orgs owned by the authenticated user.
 * Used by the onboarding redirect check.
 */
export const getOrgCount = cache(async () => {
  const supabase = await createClient();
  const { count } = await supabase
    .from("organizations")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
});

/**
 * Fetch a specific org + project pair for the authenticated user.
 * RLS enforces ownership — no explicit user_id filter needed.
 * Returns null if either doesn't exist or doesn't belong to the user.
 */
export const getOrgAndProject = cache(async (orgId: string, projectId: string) => {
  const supabase = await createClient();

  const [{ data: org }, { data: project }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, sort_order, created_at")
      .eq("id", orgId)
      .single(),
    supabase
      .from("projects")
      .select("id, org_id, name, slug, sort_order, created_at")
      .eq("id", projectId)
      .eq("org_id", orgId)
      .single(),
  ]);

  if (!org || !project) return null;
  return { org, project };
});

/**
 * Returns { excessOrgIds, excessProjectIds } for the authenticated user.
 * Primary = sort_order 0. Excess = sort_order >= tier limit.
 * Used by: /dashboard (OverLimitBanner), project layout (access gate), org page (lock cards).
 */
export async function getOverLimitState(userId: string) {
  const supabase = await createClient();
  const tier = await getUserTier(supabase, userId);
  const limits = TIER_LIMITS[tier];

  // Fetch all orgs
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, sort_order")
    .eq("owner_id", userId);

  const allOrgs = orgs ?? [];

  // Excess orgs: sort_order >= allowed count (free=1 → excess at sort_order≥1)
  const excessOrgIds: string[] =
    limits.orgs === Infinity
      ? []
      : allOrgs.filter((o) => o.sort_order >= limits.orgs).map((o) => o.id);

  // For each org, find excess projects by sort_order
  const excessProjectIds: string[] = [];

  if (limits.projectsPerOrg !== Infinity) {
    for (const org of allOrgs) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, sort_order")
        .eq("org_id", org.id);

      for (const p of projects ?? []) {
        if (p.sort_order >= limits.projectsPerOrg) {
          excessProjectIds.push(p.id);
        }
      }
    }
  }

  return { excessOrgIds, excessProjectIds };
}
