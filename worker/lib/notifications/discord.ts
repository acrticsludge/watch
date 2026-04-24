import type { AlertPayload } from "./types";
import { METRIC_LABELS } from "../utils";

export async function sendDiscordAlert(
  webhookUrl: string,
  alert: AlertPayload
): Promise<void> {
  try {
    const metricLabel = METRIC_LABELS[alert.metricName] ?? alert.metricName;
    const isSpike = alert.alertKind === "spike";
    const isCostDrift = alert.alertKind === "cost_drift";

    let embed: Record<string, unknown>;
    if (isCostDrift) {
      const ctx = alert.costContext!;
      const sign = ctx.currentCostPerUnit > ctx.previousCostPerUnit ? "+" : "-";
      embed = {
        title: `💰 Price Change: ${alert.service} — ${metricLabel}`,
        description: `**${alert.accountLabel}**: unit rate changed **${sign}${Math.abs(ctx.deltaPct).toFixed(1)}%**`,
        color: 0xf59e0b,
        fields: [
          { name: "Previous Rate", value: `$${ctx.previousCostPerUnit.toFixed(6)}`, inline: true },
          { name: "Current Rate", value: `$${ctx.currentCostPerUnit.toFixed(6)}`, inline: true },
        ],
        timestamp: alert.recordedAt,
      };
    } else if (isSpike) {
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
  } catch (err) {
    console.error("[discord alert] delivery failed:", err instanceof Error ? err.message : String(err));
    // Discord failure should not block other channels
  }
}
