import type { ServiceType, ChannelType } from "@/lib/database.types";

export const TIER_LIMITS = {
  free: {
    integrationsPerService: 1,
    historyDays: 7,
    alertChannels: ["email"] as ChannelType[],
  },
  pro: {
    integrationsPerService: 5,
    historyDays: 30,
    alertChannels: ["email", "slack", "discord", "push"] as ChannelType[],
  },
  team: {
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

async function getUserTier(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
): Promise<keyof typeof TIER_LIMITS> {
  const { data } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .maybeSingle();
  const t = data?.tier as keyof typeof TIER_LIMITS | undefined;
  return t && t in TIER_LIMITS ? t : "free";
}

export async function checkIntegrationLimit(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  service: ServiceType,
): Promise<void> {
  const tier = await getUserTier(supabase, userId);
  const limit = TIER_LIMITS[tier].integrationsPerService;

  const { count } = await supabase
    .from("integrations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("service", service)
    .neq("status", "disconnected");

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
