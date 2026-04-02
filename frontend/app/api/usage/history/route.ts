import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { TIER_LIMITS } from "@/lib/tiers";

const HistoryQuerySchema = z.object({
  integration_id: z.string().uuid(),
  metric: z.string().min(1).max(100),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = HistoryQuerySchema.safeParse({
    integration_id: searchParams.get("integration_id"),
    metric: searchParams.get("metric"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }
  const integrationId = parsed.data.integration_id;
  const metricName = parsed.data.metric;

  // Verify integration belongs to user
  const { data: integration } = await supabase
    .from("integrations")
    .select("id")
    .eq("id", integrationId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!integration) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status, past_due_since")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();

  // Enforce 3-day grace period for past_due subscriptions
  let tier: keyof typeof TIER_LIMITS = "free";
  if (subscription) {
    if (subscription.status === "past_due") {
      const gracePeriodMs = 3 * 24 * 60 * 60 * 1000;
      const since = subscription.past_due_since ? new Date(subscription.past_due_since as string).getTime() : 0;
      if (Date.now() - since <= gracePeriodMs) tier = subscription.tier as keyof typeof TIER_LIMITS;
    } else {
      tier = subscription.tier as keyof typeof TIER_LIMITS;
    }
  }
  if (tier === "free") {
    return NextResponse.json({ error: "Pro feature" }, { status: 403 });
  }

  const days = TIER_LIMITS[tier].historyDays;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  // Fetch newest-first so that PostgREST's default 1000-row cap doesn't silently
  // truncate recent data. Cap at 96 points/day (15-min intervals) × history window.
  // We reverse before returning so the chart always receives ascending order.
  const maxPoints = days * 96;

  const { data: snapshots, error } = await supabase
    .from("usage_snapshots")
    .select("recorded_at, percent_used, current_value, limit_value")
    .eq("integration_id", integrationId)
    .eq("metric_name", metricName)
    .is("entity_id", null)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: false })
    .limit(maxPoints);

  if (error) {
    console.error("[usage history GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json((snapshots ?? []).reverse());
}
