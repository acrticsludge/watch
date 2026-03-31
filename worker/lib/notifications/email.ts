import { Resend } from "resend";
import type { AlertPayload } from "./types";
import { METRIC_LABELS, METRIC_UNITS } from "../utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "alerts@pulsemonitor.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

export async function sendAlertEmail(
  to: string,
  alert: AlertPayload
): Promise<void> {
  const metricLabel = METRIC_LABELS[alert.metricName] ?? alert.metricName;
  const unit = METRIC_UNITS[alert.metricName] ?? "";
  const pct = alert.percentUsed ?? 0;
  const severity = pct >= 90 ? "critical" : "warning";
  const color = severity === "critical" ? "#ef4444" : "#eab308";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `[${severity === "critical" ? "🔴 Critical" : "🟡 Warning"}] ${alert.service} ${metricLabel} at ${Math.round(pct)}%`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: ${color}; padding: 24px 32px;">
      <h1 style="margin: 0; color: #fff; font-size: 20px; font-weight: 600;">Usage Alert</h1>
      <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${alert.accountLabel} · ${alert.service}</p>
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
        <strong>${metricLabel}</strong> has reached <strong style="color: ${color};">${Math.round(pct)}%</strong> of your limit.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Current usage</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #111827; font-size: 14px;">${alert.currentValue.toLocaleString()} ${unit}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Limit</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #111827; font-size: 14px;">${alert.limitValue?.toLocaleString() ?? "—"} ${unit}</td>
        </tr>
        <tr${alert.topEntity ? "" : ' style="border-bottom: none;"'}>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Recorded at</td>
          <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 14px;">${new Date(alert.recordedAt).toLocaleString()}</td>
        </tr>
        ${alert.topEntity
          ? `<tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Top database</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #111827; font-size: 14px;">${alert.topEntity.label} &mdash; ${alert.topEntity.valueMb.toLocaleString()} MB</td>
        </tr>`
          : ""}
      </table>
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">View Dashboard</a>
    </div>
    <div style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">You received this because you have email alerts enabled on Stackwatch. <a href="${APP_URL}/settings" style="color: #6b7280;">Manage alerts</a></p>
    </div>
  </div>
</body>
</html>`,
  });
}
