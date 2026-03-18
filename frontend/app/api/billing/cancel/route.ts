import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dodo } from "@/lib/dodo";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("dodo_subscription_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription?.dodo_subscription_id) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 },
    );
  }

  try {
    await dodo.subscriptions.cancel(subscription.dodo_subscription_id);
    // Don't downgrade locally — the webhook fires at end of billing period
    // and handles the tier/status update then.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cancel] failed:", err);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
