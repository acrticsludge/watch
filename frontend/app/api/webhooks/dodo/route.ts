import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "standardwebhooks";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookSecret = process.env.DODO_SIGNING_SECRET!;

  let event: Record<string, unknown>;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(rawBody, {
      "webhook-id": req.headers.get("webhook-id") ?? "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": req.headers.get("webhook-signature") ?? "",
    }) as Record<string, unknown>;
  } catch (err) {
    console.error("[dodo webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const type = event.type as string;
  const data = event.data as Record<string, unknown> | undefined;

  if (!data) {
    return NextResponse.json({ received: true });
  }

  const customer = data.customer as Record<string, unknown> | undefined;
  const customerEmail = customer?.email as string | undefined;
  const dodoSubscriptionId = data.subscription_id as string | undefined;
  const dodoCustomerId = customer?.customer_id as string | undefined;
  const productId = data.product_id as string | undefined;
  const metadata = data.metadata as Record<string, string> | undefined;

  // Prefer user_id from checkout metadata (fast, reliable)
  // Fall back to email lookup for webhooks triggered outside our checkout flow
  let userId: string | undefined = metadata?.user_id;

  if (!userId) {
    if (!customerEmail) {
      return NextResponse.json({ received: true });
    }
    const { data: userList } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    const user = userList?.users.find((u) => u.email === customerEmail);
    if (!user) {
      console.error(`[dodo webhook] no user found for email: ${customerEmail}`);
      return NextResponse.json({ received: true });
    }
    userId = user.id;
  }

  switch (type) {
    case "subscription.active": {
      // Fires on both initial subscription creation AND trial-to-paid conversion.
      // status === "pending" means a trial just started; "active" means paid/converted.
      const dodoStatus = data.status as string | undefined;
      const isPending = dodoStatus === "pending";
      const trialEndsAt = isPending
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          tier: "pro",
          status: isPending ? "trialing" : "active",
          trial_ends_at: trialEndsAt,
          dodo_subscription_id: dodoSubscriptionId,
          dodo_customer_id: dodoCustomerId,
          dodo_product_id: productId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      break;
    }

    case "subscription.updated": {
      const status = data.status as string;
      const mappedStatus =
        status === "active" ? "active"
        : status === "pending" ? "trialing"
        : status === "on_hold" || status === "failed" ? "past_due"
        : "cancelled";
      await supabase
        .from("subscriptions")
        .update({
          status: mappedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("dodo_subscription_id", dodoSubscriptionId);
      break;
    }

    case "subscription.renewed": {
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          tier: "pro",
          updated_at: new Date().toISOString(),
        })
        .eq("dodo_subscription_id", dodoSubscriptionId);
      break;
    }

    case "subscription.on_hold":
    case "subscription.failed":
    case "payment.failed": {
      await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("dodo_subscription_id", dodoSubscriptionId);
      break;
    }

    case "subscription.cancelled":
    case "subscription.expired": {
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          tier: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("dodo_subscription_id", dodoSubscriptionId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
