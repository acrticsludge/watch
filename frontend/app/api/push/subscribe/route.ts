import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const PushSubSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth:   z.string().min(1),
  }),
  expirationTime: z.number().nullable().optional(),
});

const BodySchema = z.object({
  subscription: PushSubSchema.nullable(),
  enabled: z.boolean(),
});

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

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { subscription: pushSub, enabled } = parsed.data;

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
      .update({ config: pushSub as unknown as import("@/lib/database.types").Json, enabled: true })
      .eq("id", existing.data.id);
  } else {
    await supabase.from("alert_channels").insert({
      user_id: user.id,
      type: "push",
      config: pushSub as unknown as import("@/lib/database.types").Json,
      enabled: true,
    });
  }

  return NextResponse.json({ ok: true });
}
