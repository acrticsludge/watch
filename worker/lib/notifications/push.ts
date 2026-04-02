import webpush from "web-push";
import type { AlertPayload } from "./types";
import { METRIC_LABELS, SERVICE_LABELS } from "../utils";

webpush.setVapidDetails(
  "mailto:alerts@pulsemonitor.dev",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushAlert(
  pushSubscription: webpush.PushSubscription,
  alert: AlertPayload
): Promise<void> {
  const serviceLabel = SERVICE_LABELS[alert.service] ?? alert.service;
  const metricLabel = METRIC_LABELS[alert.metricName] ?? alert.metricName;

  let title: string;
  let body: string;
  if (alert.alertKind === "spike") {
    const multiplier = alert.spikeContext?.multiplier.toFixed(1) ?? "?";
    title = `⚡ Spike — ${serviceLabel} ${metricLabel}`;
    body = `${alert.accountLabel}: ${metricLabel} is ${multiplier}× above normal (${alert.currentValue.toLocaleString()}).`;
  } else {
    const pct = Math.round(alert.percentUsed ?? 0);
    title = `${serviceLabel} — ${pct}% used`;
    body = `${metricLabel} on ${alert.accountLabel} has reached ${pct}% of its limit.`;
  }

  await webpush.sendNotification(
    pushSubscription,
    JSON.stringify({ title, body, url: "/dashboard" })
  );
}
