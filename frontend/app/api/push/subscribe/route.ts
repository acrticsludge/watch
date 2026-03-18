import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Gate to pro
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!subscription || subscription.tier === "free") {
    return NextResponse.json({ error: "Pro feature" }, { status: 403 });
  }

  const body = await req.json();
  const { subscription: pushSub, enabled } = body as {
    subscription: PushSubscriptionJSON | null;
    enabled: boolean;
  };

  if (!enabled || !pushSub) {
    // Disable — remove stored subscription
    await supabase
      .from("alert_channels")
      .update({ enabled: false })
      .eq("user_id", user.id)
      .eq("type", "push");
    return NextResponse.json({ ok: true });
  }

  // Upsert channel with push subscription object in config
  const existing = await supabase
    .from("alert_channels")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "push")
    .maybeSingle();

  if (existing.data) {
    await supabase
      .from("alert_channels")
      .update({ config: pushSub as object, enabled: true })
      .eq("id", existing.data.id);
  } else {
    await supabase.from("alert_channels").insert({
      user_id: user.id,
      type: "push",
      config: pushSub as object,
      enabled: true,
    });
  }

  return NextResponse.json({ ok: true });
}
