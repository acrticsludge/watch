import type { ServiceType, ChannelType } from "@/lib/database.types";

export const TIER_LIMITS = {
  free: {
    orgs: 1,
    projectsPerOrg: 1,
    integrationsPerService: 1,
    historyDays: 7,
    alertChannels: ["email"] as ChannelType[],
  },
  pro: {
    orgs: 2,
    projectsPerOrg: 3,
    integrationsPerService: 5,
    historyDays: 30,
    alertChannels: ["email", "slack", "discord", "push"] as ChannelType[],
  },
  team: {
    orgs: Infinity,
    projectsPerOrg: Infinity,
    integrationsPerService: 999,
    historyDays: 90,
    alertChannels: ["email", "slack", "discord", "push"] as ChannelType[],
  },
};

// Keep for backwards compat
export const FREE_TIER_LIMITS = TIER_LIMITS.free;

export class TierLimitError extends Error {
  code = "TIER_LIMIT_EXCEEDED" as const;
  upgradeUrl: string;

  constructor(message: string, upgradeUrl = "/settings?tab=billing") {
    super(message);
    this.name = "TierLimitError";
    this.upgradeUrl = upgradeUrl;
  }
}

export async function getUserTier(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<keyof typeof TIER_LIMITS> {
  const { data } = await supabase
    .from("subscriptions")
    .select("tier, status, past_due_since")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();
  if (!data) return "free";
  if (data.status === "past_due") {
    const gracePeriodMs = 3 * 24 * 60 * 60 * 1000;
    const since = data.past_due_since ? new Date(data.past_due_since as string).getTime() : 0;
    if (Date.now() - since > gracePeriodMs) return "free";
  }
  const t = data.tier as keyof typeof TIER_LIMITS | undefined;
  return t && t in TIER_LIMITS ? t : "free";
}

export async function checkOrgLimit(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<void> {
  const tier = await getUserTier(supabase, userId);
  const limit = TIER_LIMITS[tier].orgs;
  if (limit === Infinity) return;

  const { count } = await supabase
    .from("organizations")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);

  if ((count ?? 0) >= limit) {
    throw new TierLimitError(
      `${tier === "free" ? "Free" : "Pro"} plan allows ${limit} organization${limit !== 1 ? "s" : ""}. Delete an existing one or upgrade to add more.`,
    );
  }
}

export async function checkProjectLimit(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  orgId: string,
): Promise<void> {
  // Verify org ownership (RLS should catch this, but be explicit)
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .eq("owner_id", userId)
    .single();

  if (!org) {
    throw new TierLimitError("Organization not found or access denied.");
  }

  const tier = await getUserTier(supabase, userId);
  const limit = TIER_LIMITS[tier].projectsPerOrg;
  if (limit === Infinity) return;

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  if ((count ?? 0) >= limit) {
    throw new TierLimitError(
      `${tier === "free" ? "Free" : "Pro"} plan allows ${limit} project${limit !== 1 ? "s" : ""} per organization. Delete an existing one or upgrade to add more.`,
    );
  }
}

export async function checkIntegrationLimit(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  service: ServiceType,
  projectId?: string | null,
): Promise<void> {
  const tier = await getUserTier(supabase, userId);
  const limit = TIER_LIMITS[tier].integrationsPerService;

  let query = supabase
    .from("integrations")
    .select("id", { count: "exact", head: true })
    .eq("service", service)
    .neq("status", "disconnected");

  // Scope by project if provided, otherwise fall back to user scope
  if (projectId) {
    query = query.eq("project_id", projectId);
  } else {
    query = query.eq("user_id", userId);
  }

  const { count } = await query;

  if ((count ?? 0) >= limit) {
    throw new TierLimitError(
      `${tier === "free" ? "Free" : "Pro"} plan allows ${limit} ${service} account${limit !== 1 ? "s" : ""}. Remove an existing one or upgrade to add more.`,
    );
  }
}

export async function checkAlertChannelLimit(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  channelType: ChannelType,
): Promise<void> {
  const tier = await getUserTier(supabase, userId);
  const allowed = TIER_LIMITS[tier].alertChannels;

  if (!allowed.includes(channelType)) {
    throw new TierLimitError(
      `${channelType} notifications are not available on the free plan. Upgrade to Pro to access Slack, Discord, and push notifications.`,
    );
  }

  if (channelType === "email") {
    const { count } = await supabase
      .from("alert_channels")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "email");

    if ((count ?? 0) >= 1) {
      throw new TierLimitError("You already have an email channel configured.");
    }
  }
}
