import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("dodo_subscription_id, dodo_customer_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription?.dodo_customer_id) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  // Fetch customer portal URL from Dodo
  const res = await fetch(
    `https://api.dodopayments.com/subscriptions/${subscription.dodo_subscription_id}/customer-portal`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to get portal URL" }, { status: 500 });
  }

  const body = await res.json();
  return NextResponse.json({ url: body.url ?? body.portal_url });
}
