import type { AlertPayload } from "./types";
import { METRIC_LABELS } from "../utils";

export async function sendSlackAlert(
  webhookUrl: string,
  alert: AlertPayload
): Promise<void> {
  try {
    const metricLabel = METRIC_LABELS[alert.metricName] ?? alert.metricName;
    const isSpike = alert.alertKind === "spike";
    const isCostDrift = alert.alertKind === "cost_drift";

    let color: string;
    let text: string;
    if (isCostDrift) {
      const ctx = alert.costContext!;
      const sign = ctx.currentCostPerUnit > ctx.previousCostPerUnit ? "+" : "-";
      color = "#f59e0b";
      text = `*💰 Price Change: ${alert.service} — ${metricLabel}*\n${alert.accountLabel}: unit rate changed ${sign}${Math.abs(ctx.deltaPct).toFixed(1)}% ($${ctx.previousCostPerUnit.toFixed(6)} → $${ctx.currentCostPerUnit.toFixed(6)})`;
    } else if (isSpike) {
      color = "#f97316";
      const multiplier = alert.spikeContext?.multiplier.toFixed(1) ?? "?";
      const baseline = alert.spikeContext?.baseline.toLocaleString() ?? "?";
      text = `*⚡ Spike Detected: ${alert.service} — ${metricLabel}*\n${alert.accountLabel}: current value *${alert.currentValue.toLocaleString()}* is ${multiplier}× above baseline of ${baseline}`;
    } else {
      const pct = alert.percentUsed ?? 0;
      color = pct >= 90 ? "#ef4444" : pct >= 80 ? "#eab308" : "#22c55e";
      text = `*Usage Alert: ${alert.service} — ${metricLabel}*\n${alert.accountLabel} is at *${Math.round(pct)}%* of limit (${alert.currentValue.toLocaleString()} / ${alert.limitValue?.toLocaleString() ?? "—"})`;
    }

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
                text: { type: "mrkdwn", text },
              },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    console.error("[slack alert] delivery failed:", err instanceof Error ? err.message : String(err));
    // Slack failure should not block other channels
  }
}
