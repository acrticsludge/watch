import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
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
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }
  if (!subscription.dodo_subscription_id) {
    return NextResponse.json(
      { error: "Subscription has no payment provider ID — please go through checkout to start a real subscription." },
      { status: 422 },
    );
  }

  try {
    await dodo.subscriptions.update(subscription.dodo_subscription_id, {
      cancel_at_next_billing_date: true,
    });
  } catch (err) {
    console.error("[cancel] dodo API failed:", err);
    return NextResponse.json({ error: "Failed to cancel subscription. Please try again or contact support." }, { status: 500 });
  }

  // Mark locally so the UI can show "access until [date]" immediately.
  // The webhook fires at period end and handles the actual tier downgrade.
  const serviceClient = createServiceClient();
  const { error: dbErr } = await serviceClient
    .from("subscriptions")
    .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (dbErr) {
    console.error("[cancel] local DB update failed:", dbErr);
    // Dodo is already cancelled — don't fail the request, just log it.
  }

  console.log(JSON.stringify({ audit: true, action: "subscription.cancel_requested", userId: user.id, dodoSubscriptionId: subscription.dodo_subscription_id, ts: new Date().toISOString() }));
  return NextResponse.json({ success: true });
}
