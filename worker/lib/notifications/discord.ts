import type { AlertPayload } from "./types";
import { METRIC_LABELS } from "../utils";

export async function sendDiscordAlert(
  webhookUrl: string,
  alert: AlertPayload
): Promise<void> {
  try {
    const metricLabel = METRIC_LABELS[alert.metricName] ?? alert.metricName;
    const isSpike = alert.alertKind === "spike";

    let embed: Record<string, unknown>;
    if (isSpike) {
      const multiplier = alert.spikeContext?.multiplier.toFixed(1) ?? "?";
      const baseline = alert.spikeContext?.baseline.toLocaleString() ?? "?";
      embed = {
        title: `⚡ Spike Detected: ${alert.service} — ${metricLabel}`,
        description: `**${alert.accountLabel}**: current value is **${multiplier}×** above baseline`,
        color: 0xf97316,
        fields: [
          { name: "Current", value: alert.currentValue.toLocaleString(), inline: true },
          { name: "Typical Baseline", value: baseline, inline: true },
        ],
        timestamp: alert.recordedAt,
      };
    } else {
      const pct = alert.percentUsed ?? 0;
      const color = pct >= 90 ? 0xef4444 : pct >= 80 ? 0xeab308 : 0x22c55e;
      embed = {
        title: `Usage Alert: ${alert.service} — ${metricLabel}`,
        description: `**${alert.accountLabel}** is at **${Math.round(pct)}%** of limit`,
        color,
        fields: [
          { name: "Current", value: alert.currentValue.toLocaleString(), inline: true },
          { name: "Limit", value: alert.limitValue?.toLocaleString() ?? "—", inline: true },
        ],
        timestamp: alert.recordedAt,
      };
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch {
    // Discord failure should not block other channels
  }
}
