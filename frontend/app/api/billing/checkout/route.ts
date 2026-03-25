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

  try {
    // Only grant a trial to users who have never had a subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    const trialDays = existingSub ? 0 : 14;

    const session = await dodo.checkoutSessions.create({
      product_cart: [
        { product_id: process.env.DODO_PRO_PRODUCT_ID!, quantity: 1 },
      ],
      customer: { email: user.email! },
      metadata: { user_id: user.id },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
      ...(trialDays > 0 && {
        subscription_data: { trial_period_days: trialDays },
      }),
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (err) {
    console.error("[checkout] failed:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
