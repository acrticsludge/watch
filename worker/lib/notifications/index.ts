import { createServiceClient } from "../supabase/service";
import type { AlertPayload, AlertChannel } from "./types";
import { sendAlertEmail } from "./email";
import { sendSlackAlert } from "./slack";
import { sendDiscordAlert } from "./discord";
import { sendPushAlert } from "./push";
import type webpush from "web-push";

export async function fireAlerts(
  userEmail: string,
  alert: AlertPayload
): Promise<void> {
  const supabase = createServiceClient();

  const { data: channels } = await supabase
    .from("alert_channels")
    .select("*")
    .eq("user_id", alert.userId)
    .eq("enabled", true);

  if (!channels || channels.length === 0) return;

  const results = await Promise.allSettled(
    channels.map(async (ch) => {
      const channel = ch as AlertChannel;
      switch (channel.type) {
        case "email":
          await sendAlertEmail(userEmail, alert);
          break;
        case "slack": {
          const cfg = channel.config as { webhook_url?: string };
          if (cfg.webhook_url) await sendSlackAlert(cfg.webhook_url, alert);
          break;
        }
        case "discord": {
          const cfg = channel.config as { webhook_url?: string };
          if (cfg.webhook_url) await sendDiscordAlert(cfg.webhook_url, alert);
          break;
        }
        case "push": {
          const sub = channel.config as webpush.PushSubscription | null;
          if (sub?.endpoint) await sendPushAlert(sub, alert);
          break;
        }
      }

      // Record to alert_history
      await supabase.from("alert_history").insert({
        user_id: alert.userId,
        integration_id: alert.integrationId,
        metric_name: alert.metricName,
        percent_used: alert.percentUsed,
        channel: channel.type,
      });
    })
  );

  // Log failures without throwing
  results.forEach((r) => {
    if (r.status === "rejected") {
      console.error("[fireAlerts] channel failed:", r.reason);
    }
  });
}
