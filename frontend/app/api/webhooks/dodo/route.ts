import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "standardwebhooks";
import { isWebhookRateLimited } from "@/lib/api";

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

  // IP-based rate limit — defense-in-depth after signature verification
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isWebhookRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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
  const nextBillingDate = data.next_billing_date as string | undefined;

  // Prefer user_id from checkout metadata (fast, reliable)
  // Fall back to email lookup for webhooks triggered outside our checkout flow
  let userId: string | undefined = metadata?.user_id;

  if (!userId) {
    if (!customerEmail) {
      return NextResponse.json({ received: true });
    }
    // Paginate through all users to find by email — perPage 1000 cap means a
    // single page lookup silently misses users beyond the first 1000.
    const PER_PAGE = 1000;
    let found: { id: string } | undefined;
    let page = 1;
    while (!found) {
      const { data: userList } = await supabase.auth.admin.listUsers({
        page,
        perPage: PER_PAGE,
      });
      if (!userList?.users.length) break;
      found = userList.users.find((u) => u.email === customerEmail);
      if (userList.users.length < PER_PAGE) break; // last page
      page++;
    }
    if (!found) {
      console.error(`[dodo webhook] no user found for email: ${customerEmail}`);
      return NextResponse.json({ received: true });
    }
    userId = found.id;
  }

  switch (type) {
    case "subscription.active": {
      // Dodo always sends status:"active" — detect trial via trial_period_days > 0.
      // trial-to-paid conversion is handled by subscription.renewed below.
      const trialPeriodDays = data.trial_period_days as number | undefined;
      const isTrial = typeof trialPeriodDays === "number" && trialPeriodDays > 0;
      const trialEndsAt = isTrial
        ? new Date(Date.now() + trialPeriodDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error: upsertErr } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          tier: "pro",
          status: isTrial ? "trialing" : "active",
          trial_ends_at: trialEndsAt,
          next_billing_at: nextBillingDate ?? null,
          dodo_subscription_id: dodoSubscriptionId,
          dodo_customer_id: dodoCustomerId,
          dodo_product_id: productId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (upsertErr) {
        console.error("[dodo webhook] subscription.active upsert failed:", upsertErr);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
      console.log(JSON.stringify({ event: type, userId, dodoSubscriptionId, status: isTrial ? "trialing" : "active", ts: new Date().toISOString() }));
      break;
    }

    case "subscription.updated": {
      const status = data.status as string;
      const trialPeriodDays = data.trial_period_days as number | undefined;
      const isTrial = typeof trialPeriodDays === "number" && trialPeriodDays > 0;
      const mappedStatus =
        status === "active" && isTrial ? "trialing"
        : status === "active" ? "active"
        : status === "on_hold" || status === "failed" ? "past_due"
        : "canceled";
      const updatePayload: Record<string, unknown> = {
        status: mappedStatus,
        updated_at: new Date().toISOString(),
      };
      if (mappedStatus === "active" || mappedStatus === "trialing") {
        updatePayload.past_due_since = null;
      }
      await supabase
        .from("subscriptions")
        .update(updatePayload)
        .eq("dodo_subscription_id", dodoSubscriptionId);
      break;
    }

    case "subscription.renewed": {
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          tier: "pro",
          next_billing_at: nextBillingDate ?? null,
          past_due_since: null,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq("dodo_subscription_id", dodoSubscriptionId);
      console.log(JSON.stringify({ event: type, userId, dodoSubscriptionId, status: "active", ts: new Date().toISOString() }));
      break;
    }

    case "subscription.on_hold":
    case "subscription.failed":
    case "payment.failed": {
      const now = new Date().toISOString();
      await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: now })
        .eq("dodo_subscription_id", dodoSubscriptionId);
      // Only stamp past_due_since on the first occurrence — retries must not reset the clock.
      await supabase
        .from("subscriptions")
        .update({ past_due_since: now })
        .eq("dodo_subscription_id", dodoSubscriptionId)
        .is("past_due_since", null);
      break;
    }

    case "subscription.cancelled":
    case "subscription.expired": {
      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          tier: "free",
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq("dodo_subscription_id", dodoSubscriptionId);
      console.log(JSON.stringify({ event: type, userId, dodoSubscriptionId, status: "canceled", ts: new Date().toISOString() }));
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
