import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dodo } from "@/lib/dodo";

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
    .select("dodo_customer_id")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();

  if (!subscription?.dodo_customer_id) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 404 },
    );
  }

  try {
    const portal = await dodo.customers.customerPortal.create(
      subscription.dodo_customer_id,
    );

    return NextResponse.json({ url: portal.link });
  } catch (err) {
    console.error("[portal] failed:", err);
    return NextResponse.json(
      { error: "Failed to get portal URL" },
      { status: 500 },
    );
  }
}
