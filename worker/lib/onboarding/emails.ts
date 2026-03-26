import { Resend } from "resend";
import { SERVICE_LABELS } from "../utils";

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

// ── Activation nudge ───────────────────────────────────────────────────────
// Sent ~24 hours after signup if the user has not connected any integration.

export async function sendActivationNudgeEmail(to: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "You haven't connected any services yet",
    html: activationNudgeHtml(APP_URL),
  });
}

// ── First sync complete ────────────────────────────────────────────────────
// Sent once when the worker successfully syncs data for the first time.

export async function sendFirstSyncEmail(
  to: string,
  service: string
): Promise<void> {
  const label = (SERVICE_LABELS as Record<string, string>)[service] ?? service;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${label} usage data is in`,
    html: firstSyncHtml(label, WIKI_URLS[service] ?? WIKI_BASE, APP_URL),
  });
}

// ── Templates ──────────────────────────────────────────────────────────────

function base(
  headerColor: string,
  headerTitle: string,
  headerSub: string,
  body: string,
  appUrl: string
): string {
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

function activationNudgeHtml(appUrl: string): string {
  const body = `
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
      You signed up for Stackwatch but haven't connected any services yet. Without a connected service, you won't receive any usage alerts.
    </p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
      It takes about 2 minutes to connect GitHub Actions, Vercel, Supabase, or Railway — just paste your API token and you're done.
    </p>
    ${btn(`${appUrl}/integrations`, "#d97706", "Connect a service now →")}
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">
      Need help? See the <a href="https://github.com/acrticsludge/Stackwatch/wiki" style="color:#2563eb;">setup guide</a> for step-by-step instructions for each service.
    </p>`;
  return base("#d97706", "Finish setting up Stackwatch", "Your account is ready — services are not connected yet", body, appUrl);
}

function firstSyncHtml(serviceLabel: string, wikiUrl: string, appUrl: string): string {
  const body = `
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
      Your first <strong>${serviceLabel}</strong> usage snapshot is now on your dashboard. Stackwatch will keep polling and alert you if usage crosses your threshold.
    </p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
      Alerts fire at <strong>80%</strong> by default. You can adjust the threshold per metric in Settings.
    </p>
    ${btn(`${appUrl}/dashboard`, "#2563eb", "View your dashboard →")}
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">
      Need help? See the <a href="${wikiUrl}" style="color:#2563eb;">${serviceLabel} setup guide</a>.
    </p>`;
  return base("#2563eb", "Your first usage data is in", `${serviceLabel} is syncing successfully`, body, appUrl);
}
