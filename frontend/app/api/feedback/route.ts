import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "alerts@pulsemonitor.dev";
const TO = process.env.FEEDBACK_EMAIL ?? "alerts@pulsemonitor.dev";

const FeedbackSchema = z.object({
  signedup: z.boolean().nullable().optional(),
  reason:   z.string().max(2000).optional(),
  general:  z.string().max(2000).optional(),
});

// ── In-memory IP rate limiter ───────────────────────────────────────────────
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 3;

const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_PER_WINDOW;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json().catch(() => null);
    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: true }); // best-effort; don't leak errors
    const { signedup, reason, general } = parsed.data;

    const lines: string[] = [];
    if (signedup === true) lines.push("<b>Signed up:</b> Yes");
    if (signedup === false) lines.push("<b>Signed up:</b> No");
    if (reason)  lines.push(`<b>What stopped them:</b><br>${escapeHtml(reason)}`);
    if (general) lines.push(`<b>Other thoughts:</b><br>${escapeHtml(general)}`);

    if (lines.length === 0) {
      return NextResponse.json({ ok: true }); // nothing to send
    }

    await resend.emails.send({
      from: FROM,
      to: TO,
      subject: `[Stackwatch] New feedback`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;padding:24px">
          <h2 style="margin:0 0 16px;font-size:18px">New visitor feedback</h2>
          <div style="font-size:14px;line-height:1.8;color:#374151">
            ${lines.join("<br><br>")}
          </div>
          <p style="margin-top:24px;font-size:12px;color:#9ca3af">Sent from the Stackwatch feedback widget</p>
        </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("feedback route error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
