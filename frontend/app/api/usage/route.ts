import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const integrationId = searchParams.get("integrationId");

  let query = supabase
    .from("integrations")
    .select("id, service, account_label, status, last_synced_at")
    .eq("user_id", user.id)
    .neq("status", "disconnected");

  if (integrationId) {
    query = query.eq("id", integrationId) as typeof query;
  }

  const { data: integrations, error: intgError } = await query;
  if (intgError) return NextResponse.json({ error: intgError.message }, { status: 500 });

  if (!integrations || integrations.length === 0) {
    return NextResponse.json([]);
  }

  const ids = integrations.map((i) => i.id);

  const { data: snapshots, error: snapError } = await supabase
    .from("usage_snapshots")
    .select("integration_id, metric_name, current_value, limit_value, percent_used, recorded_at")
    .in("integration_id", ids)
    .order("recorded_at", { ascending: false });

  if (snapError) return NextResponse.json({ error: snapError.message }, { status: 500 });

  // Get latest per (integration_id, metric_name)
  const latestMap = new Map<string, typeof snapshots[0]>();
  for (const s of snapshots ?? []) {
    const key = `${s.integration_id}::${s.metric_name}`;
    if (!latestMap.has(key)) latestMap.set(key, s);
  }

  const result = integrations.map((intg) => ({
    integrationId: intg.id,
    service: intg.service,
    accountLabel: intg.account_label,
    status: intg.status,
    lastSyncedAt: intg.last_synced_at,
    metrics: Array.from(latestMap.values())
      .filter((s) => s.integration_id === intg.id)
      .map((s) => ({
        metricName: s.metric_name,
        currentValue: s.current_value,
        limitValue: s.limit_value,
        percentUsed: s.percent_used,
        recordedAt: s.recorded_at,
      })),
  }));

  return NextResponse.json(result);
}
