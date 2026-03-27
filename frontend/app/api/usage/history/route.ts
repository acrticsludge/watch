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
    .select("tier")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const tier = (subscription?.tier as keyof typeof TIER_LIMITS) ?? "free";
  if (tier === "free") {
    return NextResponse.json({ error: "Pro feature" }, { status: 403 });
  }

  const days = TIER_LIMITS[tier].historyDays;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: snapshots, error } = await supabase
    .from("usage_snapshots")
    .select("recorded_at, percent_used, current_value, limit_value")
    .eq("integration_id", integrationId)
    .eq("metric_name", metricName)
    .is("entity_id", null)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(snapshots ?? []);
}
