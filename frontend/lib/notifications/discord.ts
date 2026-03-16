import type { AlertPayload } from "./types";
import { METRIC_LABELS } from "@/lib/utils";

export async function sendDiscordAlert(
  webhookUrl: string,
  alert: AlertPayload
): Promise<void> {
  try {
    const metricLabel = METRIC_LABELS[alert.metricName] ?? alert.metricName;
    const color =
      alert.percentUsed >= 90
        ? 0xef4444
        : alert.percentUsed >= 80
          ? 0xeab308
          : 0x22c55e;

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: `Usage Alert: ${alert.service} — ${metricLabel}`,
            description: `**${alert.accountLabel}** is at **${Math.round(alert.percentUsed)}%** of limit`,
            color,
            fields: [
              {
                name: "Current",
                value: alert.currentValue.toLocaleString(),
                inline: true,
              },
              {
                name: "Limit",
                value: alert.limitValue.toLocaleString(),
                inline: true,
              },
            ],
            timestamp: alert.recordedAt,
          },
        ],
      }),
    });
  } catch {
    // Discord failure should not block other channels
  }
}
