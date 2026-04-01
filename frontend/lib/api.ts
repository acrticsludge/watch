import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB

type JsonBodyResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: NextResponse };

/**
 * Validates Content-Type and body size, then parses JSON.
 * Returns a discriminated union — check `ok` before using `data`.
 */
export async function requireJsonBody<T = unknown>(
  request: Request,
): Promise<JsonBodyResult<T>> {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 },
      ),
    };
  }

  const cl = request.headers.get("content-length");
  if (cl !== null && parseInt(cl, 10) > MAX_BODY_BYTES) {
    return {
      ok: false,
      error: NextResponse.json({ error: "Request body too large" }, { status: 413 }),
    };
  }

  try {
    const data = (await request.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}

// ── Per-user rate limiter for authenticated mutation endpoints ────────────────
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_MAX = 30;

const authHits = new Map<string, { count: number; resetAt: number }>();

/** Returns true if the user has exceeded RATE_MAX requests in RATE_WINDOW_MS. */
export function isAuthRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = authHits.get(userId);

  if (!entry || now > entry.resetAt) {
    authHits.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_MAX;
}
