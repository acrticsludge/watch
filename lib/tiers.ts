import type { ServiceType, ChannelType } from "@/lib/database.types";

export const FREE_TIER_LIMITS = {
  integrationsPerService: 1,
  historyDays: 7,
  alertChannels: ["email"] as ChannelType[],
};

export class TierLimitError extends Error {
  code = "TIER_LIMIT_EXCEEDED" as const;
  upgradeUrl: string;

  constructor(message: string, upgradeUrl = "/settings?tab=billing") {
    super(message);
    this.name = "TierLimitError";
    this.upgradeUrl = upgradeUrl;
  }
}

export async function checkIntegrationLimit(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  service: ServiceType
): Promise<void> {
  const { count } = await supabase
    .from("integrations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("service", service)
    .neq("status", "disconnected");

  if ((count ?? 0) >= FREE_TIER_LIMITS.integrationsPerService) {
    throw new TierLimitError(
      `Free plan allows ${FREE_TIER_LIMITS.integrationsPerService} ${service} account. Remove the existing one or upgrade to add more.`
    );
  }
}

export async function checkAlertChannelLimit(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  channelType: ChannelType
): Promise<void> {
  if (!FREE_TIER_LIMITS.alertChannels.includes(channelType)) {
    throw new TierLimitError(
      `${channelType} notifications are not available on the free plan. Upgrade to access Slack, Discord, and push notifications.`
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
