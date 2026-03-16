import type { AlertPayload } from "./types";
import { METRIC_LABELS } from "../utils";

export async function sendSlackAlert(
  webhookUrl: string,
  alert: AlertPayload
): Promise<void> {
  try {
    const metricLabel = METRIC_LABELS[alert.metricName] ?? alert.metricName;
    const color =
      alert.percentUsed >= 90
        ? "#ef4444"
        : alert.percentUsed >= 80
          ? "#eab308"
          : "#22c55e";

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attachments: [
          {
            color,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Usage Alert: ${alert.service} — ${metricLabel}*\n${alert.accountLabel} is at *${Math.round(alert.percentUsed)}%* of limit (${alert.currentValue.toLocaleString()} / ${alert.limitValue.toLocaleString()})`,
                },
              },
            ],
          },
        ],
      }),
    });
  } catch {
    // Slack failure should not block other channels
  }
}
