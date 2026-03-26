import { Resend } from "resend";
import { SERVICE_LABELS } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "alerts@pulsemonitor.dev";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";
const WIKI_BASE = "https://github.com/acrticsludge/Stackwatch/wiki";
const WIKI_URLS: Record<string, string> = {
  github: `${WIKI_BASE}/Connecting-GitHub-Actions`,
  vercel: `${WIKI_BASE}/Connecting-Vercel`,
  supabase: `${WIKI_BASE}/Connecting-Supabase`,
  railway: `${WIKI_BASE}/Connecting-Railway`,
};

// ── Welcome ────────────────────────────────────────────────────────────────
// Sent once when a new user completes auth (OAuth callback or email confirm).

export async function sendWelcomeEmail(to: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Stackwatch",
    html: welcomeHtml(APP_URL),
  });
}

// ── First integration connected ────────────────────────────────────────────
// Sent once when the user connects their very first service.

export async function sendFirstIntegrationEmail(
  to: string,
  service: string
): Promise<void> {
  const label = SERVICE_LABELS[service] ?? service;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${label} is now being monitored`,
    html: firstIntegrationHtml(label, WIKI_URLS[service] ?? WIKI_BASE, APP_URL),
  });
}

// ── Templates ──────────────────────────────────────────────────────────────

function base(headerColor: string, headerTitle: string, headerSub: string, body: string, appUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;padding:40px 20px;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:${headerColor};padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">${headerTitle}</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${headerSub}</p>
    </div>
    <div style="padding:32px;">${body}</div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">You received this because you have a Stackwatch account. <a href="${appUrl}/settings" style="color:#6b7280;">Manage account</a></p>
    </div>
  </div>
</body>
</html>`;
}

function btn(href: string, color: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:500;">${label}</a>`;
}

function row(label: string, value: string): string {
  return `<tr style="border-bottom:1px solid #e5e7eb;">
    <td style="padding:10px 0;color:#6b7280;font-size:14px;">${label}</td>
    <td style="padding:10px 0;text-align:right;font-weight:600;color:#111827;font-size:14px;">${value}</td>
  </tr>`;
}

function welcomeHtml(appUrl: string): string {
  const body = `
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
      Stackwatch monitors your GitHub Actions, Vercel, Supabase, and Railway usage — and alerts you before you hit limits.
    </p>
    <p style="margin:0 0 10px;color:#111827;font-size:14px;font-weight:600;">Get started in 3 steps:</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      ${row("1. Connect a service", "Add your API tokens on the Integrations page")}
      ${row("2. Set your threshold", "Default is 80% — change it in Settings")}
      ${row("3. Get alerted", "Email alerts are on by default. Add Slack or Discord in Settings")}
    </table>
    ${btn(`${appUrl}/integrations`, "#2563eb", "Connect your first service →")}
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">
      Not sure where to find your API tokens? See the setup guides:
      <a href="${WIKI_BASE}/Connecting-GitHub-Actions" style="color:#2563eb;">GitHub Actions</a>,
      <a href="${WIKI_BASE}/Connecting-Vercel" style="color:#2563eb;">Vercel</a>,
      <a href="${WIKI_BASE}/Connecting-Supabase" style="color:#2563eb;">Supabase</a>,
      <a href="${WIKI_BASE}/Connecting-Railway" style="color:#2563eb;">Railway</a>
    </p>`;
  return base("#2563eb", "Welcome to Stackwatch", "Usage monitoring for dev teams", body, appUrl);
}

function firstIntegrationHtml(serviceLabel: string, wikiUrl: string, appUrl: string): string {
  const body = `
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
      Your first usage data will appear on the dashboard after the next sync. Polling runs automatically — no action needed.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      ${row("Poll interval", "Every 15 min (free) · 5 min (Pro)")}
      ${row("Alert threshold", "80% — adjust in Settings")}
      ${row("Alert channels", "Email enabled · add Slack/Discord in Settings")}
    </table>
    ${btn(`${appUrl}/dashboard`, "#059669", "View dashboard →")}
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">
      Need help? See the <a href="${wikiUrl}" style="color:#2563eb;">${serviceLabel} setup guide</a>.
    </p>`;
  return base("#059669", `${serviceLabel} is now connected`, "Stackwatch is now monitoring your usage", body, appUrl);
}
