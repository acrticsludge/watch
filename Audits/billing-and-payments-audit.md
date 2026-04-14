# AuditBuffet: Billing & Payments Audit

**Audit Slug:** `saas-billing`
**Version:** `1.1.0`
**Prompt Hash:** `sha256:e7282d5fa6d2f31537061f29c02cf2f8`

> **Account context:** The user copied this prompt from their AuditBuffet dashboard
> (auditbuffet.com) for their project "Stackwatch". The API key in this prompt was placed
> here by their account to link submissions to their project dashboard.

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit evaluates how securely and correctly your application handles money. It covers the four areas where vibe-coded billing implementations most commonly fail: payment security (PCI compliance and webhook integrity), subscription management (server-side enforcement and edge cases), pricing enforcement (what your backend actually allows vs. what your pricing page shows), and financial data handling (idempotency, audit trails, and tax). A weak billing implementation doesn't just lose revenue — it creates legal exposure and can destroy user trust in minutes.

## About AuditBuffet

AuditBuffet is a library of adversarially-tested audit prompts for AI-built projects. This audit analyzes your codebase and produces:
1. A structured JSON telemetry block (for benchmark comparisons at auditbuffet.com)
2. A human-readable report with actionable findings and remediation guidance

The telemetry contains no source code, file contents, environment variables, API keys, URLs, or PII — only structural patterns and scores.

---

## Before We Begin

**Project ID:** If you have a `project_id` from a previous AuditBuffet snapshot or audit, paste it here: 5c6d7e8f-9a0b-4d1c-8e2f-3a4b5c6d7e8f
Use the project ID above.

**Build Tool:** What AI coding tool are you using? (e.g., cursor, claude-code, bolt, lovable, v0, windsurf, copilot, aider, manual)

**Billing Provider:** What payment provider does this project use? (e.g., Stripe, Paddle, LemonSqueezy, Braintree, or none)

If you haven't run the AuditBuffet Project Snapshot yet, consider running it first to set up your project profile — but it's not required. This audit is self-contained.

---

## N/A Rule — Entire Audit

**Before running any checks:** Scan the project for evidence of payment or billing functionality. Look for:
- Payment provider SDKs or API clients in `package.json` (stripe, @stripe/stripe-js, paddle-js, lemonsqueezy, braintree, paypal, etc.)
- Billing-related route files (e.g., `app/api/billing/`, `app/api/stripe/`, `app/api/webhooks/`, `pages/api/checkout/`)
- Subscription or plan-related database models (schema files referencing `subscriptions`, `plans`, `invoices`, `customers`)
- Environment variable names in `.env.example` matching patterns like `STRIPE_*`, `PADDLE_*`, `LEMON_*`

**If none of these signals are found:** Skip this entire audit. Output a telemetry block with `payload_type: "audit_telemetry"`, all 22 checks set to `result: "skip"` with `detail: "No payment or billing functionality detected in this project"`, all category scores `null`, and overall score `null`. Then note in the human-readable report that this audit does not apply.

---

## Stack Detection

Before running checks, detect the project's technology stack by examining these signals:

1. **Framework:** Check `package.json` dependencies for next, react, vue, nuxt, svelte, sveltekit, astro, remix, angular, gatsby, express, fastify, hono, etc. Check for framework config files (next.config.*, nuxt.config.*, svelte.config.*, astro.config.*, vite.config.*, etc.).
2. **Framework Version:** Read from `package.json` dependencies or lock file.
3. **Language:** Check for `tsconfig.json` (TypeScript) or absence thereof (JavaScript). Check file extensions (.ts, .tsx, .js, .jsx, .py, .go, .rs, etc.).
4. **Database:** Look for database connection strings in config (not .env contents — just the presence of config patterns), ORM config files (prisma/schema.prisma, drizzle.config.*, etc.), database-related dependencies (pg, mysql2, mongodb, @supabase/supabase-js, firebase, etc.).
5. **ORM:** Check for prisma, drizzle, typeorm, sequelize, mongoose, knex, kysely in dependencies.
6. **Auth:** Look for next-auth/authjs, clerk, lucia, supabase auth, firebase auth, auth0, kinde, better-auth in dependencies or config.
7. **Hosting:** Check for vercel.json, netlify.toml, fly.toml, railway.json, render.yaml, Dockerfile, AWS config, .github/workflows with deployment targets, wrangler.toml (Cloudflare).
8. **UI Library:** Check for shadcn-ui (components.json), radix-ui, chakra-ui, mantine, material-ui, ant-design, headless-ui in dependencies. Check for tailwindcss, css-modules, styled-components, emotion in config/dependencies.
9. **Project Type:** Infer from structure — web-app (has both pages and API routes), api (primarily API routes/serverless), static-site (no server components or API routes), library (has build/publish config), cli (has bin field in package.json).
10. **Project Size:** Count routes/pages — small (<20), medium (20-100), large (100+).

For each field, record what you detected. Use `null` for anything you cannot determine. Never guess — if the signal isn't clear, use `null`.

---

## How to Analyze

Examine the following in order:

1. `package.json` — billing provider SDKs, dependencies, scripts
2. Framework config files — next.config.*, nuxt.config.*, etc.
3. `tsconfig.json` — TypeScript configuration
4. Webhook handler files — look in `app/api/webhooks/`, `app/api/stripe/`, `pages/api/webhooks/`, or similar
5. Subscription gating middleware or route guards — look in `middleware.ts`, `middleware.js`, and layout files
6. Database schema files — `prisma/schema.prisma`, `drizzle/schema.ts`, migrations, or similar
7. Checkout and billing API routes — look in `app/api/billing/`, `app/api/checkout/`, `app/api/subscription/`, or similar
8. Pricing page or component files — look for `pricing`, `plans`, `subscribe` in component or page filenames
9. Environment variable templates — `.env.example`, `.env.local.example`
10. `vercel.json`, `netlify.toml`, or serverless function configs

---

## Check Definitions

### Category: Payment Security
**Slug:** `payment-security`
**Weight in overall score:** 0.35

This category covers the controls that prevent your payment integration from being a direct security liability. All four checks are critical because failure in any one of them creates a condition that can be exploited immediately.

#### Check: Payment processing uses a PCI-compliant provider
- **ID:** `saas-billing.payment-security.pci-compliant-provider`
- **Severity:** `critical`
- **What to look for:** Examine how payment information is collected and processed. Look for Stripe.js / Stripe Elements / Stripe Checkout, PaymentElement, Paddle.js, LemonSqueezy embedded checkout, Braintree hosted fields, or similar SDK-based payment collection. The critical signal is whether raw card data ever passes through your server. Check all form components, API routes, and checkout flows for direct card number fields (`type="tel"` or `type="number"` inputs named `card`, `cardNumber`, `cvv`, `cvc`, `expiry`) that are submitted to your own backend. Beyond package presence, verify that Stripe Elements or Checkout is actually imported and used: look for imports of `Elements`, `CardElement`, or `PaymentElement` from `@stripe/react-stripe-js`, or server-side calls to `stripe.checkout.sessions.create()` / `redirectToCheckout` in API routes.
- **Pass criteria:** Count every payment form and checkout flow in the codebase. Payment collection uses an SDK-hosted element (Stripe Elements, Stripe Checkout, Paddle overlay, LemonSqueezy checkout) that handles card data entirely on the provider's side, AND there is evidence of actual usage — imports of `Elements`, `CardElement`, or `PaymentElement` from `@stripe/react-stripe-js`, or server-side calls to `stripe.checkout.sessions.create()` or `redirectToCheckout` in API routes. Your server never receives raw card data — only payment intent IDs, session IDs, or tokens. At least 1 import of Elements, CardElement, or PaymentElement must be present. Having `@stripe/stripe-js` in `package.json` alone is not sufficient to pass.
- **Fail criteria:** Your application collects raw card numbers, CVV, or expiry dates in a form that submits to your own server, even if you then forward to a payment provider. Any server-side handling of raw card data fails this check. Do NOT pass if a hosted element is present alongside a custom card form — the custom form is the vulnerability.
- **Skip (N/A) when:** No payment functionality detected in this project. Signal: no payment provider SDK in `package.json` and no billing-related API routes.
- **Cross-reference:** For API security beyond payment handling, the API Security audit covers authentication, authorization, and input validation across all endpoints.
- **Detail on fail:** Describe what was found. Example: `"Custom payment form in components/checkout/CardForm.tsx collects card number and CVV fields submitted to /api/billing/charge — raw card data passes through application server"`
- **Remediation:** Handling raw card data yourself requires PCI DSS compliance, which is a significant ongoing audit burden. Use your payment provider's hosted elements instead:

  For Stripe, replace custom card inputs with Stripe Elements or Stripe Checkout:
  ```ts
  // Use Stripe's hosted PaymentElement — card data never touches your server
  import { PaymentElement } from '@stripe/react-stripe-js'
  // Your server only receives a paymentIntentId, never card data
  ```

  For other providers, use their equivalent hosted checkout or embedded payment widgets. Verify by checking your network tab during checkout — you should see card data going directly to the provider's domain (stripe.com, paddle.com, etc.), not to your own API.

#### Check: No credit card data stored in application database
- **ID:** `saas-billing.payment-security.no-cc-data-stored`
- **Severity:** `critical`
- **What to look for:** Search database schema files and migration files for fields that could contain raw card data. Look for column names like `card_number`, `card_num`, `cc_number`, `cvv`, `cvc`, `card_cvv`, `expiry`, `expiration_date`, `pan`, `full_card`. Also examine model definitions and any ORM query code that might write raw card strings to the database. Check API route handlers that process payment-related POST requests for any `db.insert` or similar calls that include card-like data. Examine any logging code near payment flows for accidental card data capture.
- **Pass criteria:** Enumerate all database schema columns related to payments — at least 0 PCI-sensitive columns expected. 0 columns contain raw card data. The schema may legitimately store provider-side tokens (`stripe_customer_id`, `stripe_payment_method_id`, `stripe_subscription_id`) — these are fine. Only raw card numbers, CVV, or magnetic stripe data fail this check.
- **Fail criteria:** Database schema or migration files contain columns for raw card data, OR API route code stores raw card-like strings to the database.
- **Skip (N/A) when:** No database detected (no ORM or database dependency in `package.json`, no schema files).
- **Detail on fail:** `"prisma/schema.prisma contains a 'card_number' field on the PaymentMethod model"` or `"API route stores raw card data to users table: found INSERT with 'card_number' field"`
- **Remediation:** Storing raw card data is a PCI DSS violation and creates catastrophic breach liability. Use your payment provider's customer and payment method objects instead:

  ```ts
  // Store only the provider's opaque identifiers
  await db.user.update({
    where: { id: userId },
    data: {
      stripe_customer_id: customer.id,       // OK
      stripe_default_payment_method: pm.id,  // OK
      // card_number: '4111...' — NEVER do this
    }
  })
  ```

  If you need to display partial card info to users (last 4 digits, card brand), retrieve it from the provider's API at display time rather than storing it yourself.

#### Check: Webhook signature verification is implemented
- **ID:** `saas-billing.payment-security.webhook-signature-verification`
- **Severity:** `critical`
- **What to look for:** Locate webhook handler files for your payment provider. For Stripe, look for `stripe.webhooks.constructEvent()` in the webhook handler. For Paddle, look for signature verification using the Paddle SDK or manual HMAC comparison. For LemonSqueezy, look for `crypto.timingSafeEqual()` or the LemonSqueezy SDK's webhook verification. The handler must read the raw request body (not parsed JSON) and the provider's signature header before verifying. Check that the webhook endpoint does not skip verification based on environment conditions.
- **Pass criteria:** Count every webhook handler endpoint. Every webhook handler for the payment provider calls the provider's official signature verification method with the raw request body and the signing secret before processing any webhook event. The raw body must be captured before any JSON parsing (e.g., using `req.text()` not `req.json()` in Next.js Route Handlers, or a `rawBody` middleware in Express). For Next.js App Router: the webhook route handler must export `export const dynamic = 'force-dynamic'` (or equivalent runtime configuration). Without this, Next.js may attempt to statically optimize the route, which would break signature verification by not reading the raw request body correctly. If the project uses Next.js App Router and the webhook handler lacks this export, note it in the detail as a secondary finding (not a standalone fail, but a required element of a correct implementation).
- **Fail criteria:** No signature verification found in at least 1 webhook handler. Verification is present but uses parsed JSON body instead of raw body (breaks HMAC). Verification is conditionally skipped in production-like environments. Do not pass if verification is wrapped in a try/catch that swallows the error and continues processing.
- **Cross-reference:** For webhook endpoint security beyond signature verification, the API Security audit covers request validation and rate limiting.
- **Skip (N/A) when:** No webhook endpoint detected. Signal: no route file matching `webhook`, `webhooks`, or provider-specific patterns (`stripe`, `paddle`, `lemon`) in API route directories.
- **Detail on fail:** `"Webhook handler at app/api/webhooks/stripe/route.ts processes events without calling stripe.webhooks.constructEvent()"` or `"Webhook handler parses body with req.json() before verification — HMAC will always fail or is not being checked"`
- **Remediation:** Unverified webhooks allow anyone to send fake payment events to your application — triggering subscription upgrades, cancellations, or refunds without real payments. Always verify:

  ```ts
  // app/api/webhooks/stripe/route.ts
  export async function POST(req: Request) {
    const body = await req.text() // raw body BEFORE parsing
    const sig = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      return new Response('Invalid signature', { status: 400 })
    }

    // Only process event after successful verification
    switch (event.type) { ... }
  }
  ```

  In Next.js App Router, add `export const dynamic = 'force-dynamic'` and ensure no body parser middleware runs before this handler.

#### Check: No way to bypass payment via API
- **ID:** `saas-billing.payment-security.no-payment-bypass-api`
- **Severity:** `critical`
- **What to look for:** Look for API routes or server actions that upgrade a user's subscription tier, grant premium feature access, or activate a paid plan. Verify that these routes require proof of payment (a valid Stripe Payment Intent ID, a confirmed subscription ID retrieved from Stripe's API, or a webhook event) rather than trusting client-supplied plan names or subscription statuses. Look for routes that accept a `plan`, `tier`, `subscription_status`, or `is_premium` field in the request body. Quote the actual route path and field name for any bypass found and write it directly to the database without server-side verification against the payment provider.
- **Pass criteria:** Enumerate all API routes that modify subscription or plan fields — no more than 0 should allow a client to directly set subscription status or plan tier without server-side verification of a corresponding payment record from the provider's API. Subscription upgrades must be triggered by verified webhook events or by server-side confirmation of a successful payment intent.
- **Fail criteria:** An API route accepts a client-supplied `plan` or `subscription_status` and writes it directly to the database. A route exists that grants premium access without verifying a payment on the server side.
- **Skip (N/A) when:** No subscription tiers or premium features detected — the project has no paid plans.
- **Detail on fail:** `"POST /api/user/upgrade accepts 'plan: premium' in request body and updates user plan without verifying payment with Stripe"` or `"Server action upgradePlan() trusts client-supplied subscriptionStatus parameter"`
- **Remediation:** Never trust the client about its own subscription status. The flow must be: client initiates → Stripe confirms → your webhook receives a verified event → your server updates the database:

  ```ts
  // In your Stripe webhook handler (already signature-verified):
  case 'customer.subscription.updated': {
    const subscription = event.data.object
    await db.user.update({
      where: { stripe_customer_id: subscription.customer as string },
      data: {
        plan: subscription.items.data[0]?.price.lookup_key ?? 'free',
        subscription_status: subscription.status
      }
    })
    break
  }
  ```

  Your upgrade API route should only create a Stripe Checkout Session or Payment Intent and return the client secret — never set the user's plan directly.

---

### Category: Subscription Management
**Slug:** `subscription-mgmt`
**Weight in overall score:** 0.30

This category evaluates whether your subscription lifecycle is enforced correctly on the server side and handles the edge cases that AI-built implementations typically miss.

#### Check: Subscription status is verified server-side
- **ID:** `saas-billing.subscription-mgmt.subscription-server-verified`
- **Severity:** `high`
- **What to look for:** Examine how feature access decisions are made. Look at middleware, API route guards, server components that fetch user data, and any `isSubscribed()` or `hasAccess()` utility functions. The critical question is: does the access check read subscription status from your own database (which is updated by verified webhooks), or does it trust a JWT claim, cookie value, or client-supplied header? Also check whether your database subscription status is re-synced with the provider's API periodically or at key checkpoints.
- **Pass criteria:** Count every server-side access control checkpoint — at least 1 per protected route. All server-side access control decisions read subscription status from the application database (which is populated by verified webhook events or server-side API calls to the payment provider). No access decision trusts a client-supplied value for subscription status. Additionally, verify that subscription status condition logic (e.g., which statuses grant Pro access: `active`, `trialing`, `past_due`) is consistent across ALL Pro-gated entry points — UI components, API route handlers, middleware, and Server Actions. If the UI treats `trialing` as Pro but an API route only checks for `active`, this is a FAIL. The subscription gate logic should be defined once and referenced everywhere, not duplicated with inconsistent conditions.
- **Fail criteria:** Access decisions read subscription status from a JWT claim or cookie that is set at login and not refreshed from the database. Subscription status is trusted from client-supplied parameters. Access checks run only on the client side with no server-side enforcement. Subscription status condition logic (which statuses grant access) is duplicated across entry points with inconsistent conditions — e.g., the UI grants access for `trialing` but an API route only checks for `active`.
- **Skip (N/A) when:** No subscription tiers or gated features detected.
- **Detail on fail:** `"Middleware reads subscription_status from JWT without re-checking database — expired subscriptions retain access until token refresh"` or `"Feature gate in app/dashboard/page.tsx checks client-side context only, no server-side verification"`
- **Remediation:** JWTs have expiry windows — if a subscription lapses between token issuances, the user keeps access until their next login. Read subscription status from the database on every protected request:

  ```ts
  // In middleware or a server-side access check
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { subscription_status: true, plan: true }
  })

  if (user?.subscription_status !== 'active') {
    redirect('/billing/upgrade')
  }
  ```

  For performance, cache this result in a short-lived server-side cache (e.g., 60 seconds) rather than caching in the JWT.

#### Check: Feature access is gated on subscription status
- **ID:** `saas-billing.subscription-mgmt.feature-access-gated`
- **Severity:** `high`
- **What to look for:** Identify the premium or paid features in the application (look for references to plans, tiers, or feature flags in route files, component files, and API routes). For each premium feature, verify that access is controlled by a server-side check that reads subscription status. Look for API routes that serve premium data, actions, or capabilities without checking subscription. Also look for UI-only gating (feature visible in UI to paid users only) without corresponding API-level enforcement — the API endpoint must also enforce the gate.
- **Pass criteria:** Enumerate all premium features — at least 1 server-side gate per feature. Every premium feature has both a UI gate (so free users see an upgrade prompt) AND an API/server-side gate (so even direct API calls from free users are rejected with a 402 or 403). The server-side gate reads from a subscription check that is itself server-side verified. Report even on pass: "N premium features identified, all N have both UI and API gates."
- **Fail criteria:** Premium features are gated in the UI but the underlying API routes accept requests from any authenticated user. Subscription status is checked only in client components without server-side enforcement. A premium feature is not gated at all. Do NOT pass if even 1 premium API endpoint lacks server-side enforcement.
- **Skip (N/A) when:** No subscription tiers or premium features detected — the project has no paid plans.
- **Detail on fail:** `"API route /api/reports/export serves CSV data without checking subscription — only the UI button is hidden from free users"` or `"Premium AI feature at /api/ai/generate has no subscription check"`
- **Remediation:** UI-only gating is security theater — any user can call the API directly. Add server-side enforcement at the API layer:

  ```ts
  // app/api/reports/export/route.ts
  export async function GET(req: Request) {
    const session = await getServerSession()
    const user = await db.user.findUnique({ where: { id: session.userId } })

    if (user?.plan !== 'pro' || user?.subscription_status !== 'active') {
      return Response.json({ error: 'Upgrade required' }, { status: 402 })
    }

    // ... serve the premium content
  }
  ```

#### Check: Trial period enforces feature limits
- **ID:** `saas-billing.subscription-mgmt.trial-enforces-limits`
- **Severity:** `high`
- **What to look for:** Determine whether the application has a trial period (look for `trial`, `trial_end`, `trialing` in schema files, subscription status checks, or Stripe trial period configuration). If a trial exists, examine whether it enforces the same limits as the paid tier it represents, or whether it provides unlimited access during the trial. Also check for trial extension vulnerabilities: can a user create a new account to restart the trial? Is trial status stored only in the JWT?
- **Pass criteria:** Count every trial-related code path — at least 1 server-side expiry check must exist. Trial users have access to paid features for the trial duration, AND the trial period is enforced server-side (cannot be extended by client manipulation). When the trial ends, access is revoked the same way a subscription cancellation would be. If no trial exists, this check passes.
- **Fail criteria:** Trial status is stored in a cookie or localStorage and can be manipulated. Trial period can be restarted by creating a new account with no friction. Trial end is not enforced — access continues indefinitely after trial expiry.
- **Skip (N/A) when:** No trial period detected in the application. Signal: no `trial`, `trial_end`, or `trialing` references in schema or subscription handling code, and no Stripe trial period configuration.
- **Detail on fail:** `"Trial end date stored in localStorage and read client-side — can be manipulated"` or `"Stripe subscription shows trialing status but application grants full paid access after trial_end without re-verification"`
- **Remediation:** Treat trial status the same way you treat paid subscription status — managed entirely by your payment provider and enforced server-side. Let Stripe manage the trial:

  ```ts
  // When creating a subscription with trial
  await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: 14,
  })
  // Stripe sends customer.subscription.trial_will_end webhook 3 days before
  // and customer.subscription.updated when trial ends (status changes to active or past_due)
  ```

  Store `subscription.status === 'trialing'` from the webhook in your database. On trial end, Stripe sends another webhook — your handler updates the database to require payment.

#### Check: Downgrade removes access to premium features
- **ID:** `saas-billing.subscription-mgmt.downgrade-removes-access`
- **Severity:** `high`
- **What to look for:** Trace the downgrade flow — what happens when a customer moves from a higher tier to a lower tier, either by canceling a plan in Stripe's customer portal or through a UI downgrade action in your application. Look for webhook handlers for `customer.subscription.updated` events and check whether the handler updates the user's plan in the database. Look for "access until end of period" logic — this is acceptable (prorated access), but verify that access actually ends at period end, not persists indefinitely. Check whether the downgrade is applied immediately or at renewal, and whether the code correctly handles both cases.
- **Pass criteria:** Count every webhook event type handled — at least 2 event types (updated + deleted) must be covered. When a subscription is downgraded or canceled, access to higher-tier features is revoked either immediately or at the end of the billing period (both are acceptable), AND a webhook handler correctly processes `customer.subscription.updated` and `customer.subscription.deleted` events to update the database. The access revocation is enforced server-side.
- **Fail criteria:** Subscription cancellation does not update the database — users retain premium access indefinitely after canceling. Do not pass if only `customer.subscription.deleted` is handled but `cancel_at_period_end` scenario of `customer.subscription.updated` is missed. The webhook handler does not process downgrade events. Plan tier in the database is not updated when subscription changes.
- **Skip (N/A) when:** No subscription tiers detected.
- **Detail on fail:** `"No handler for customer.subscription.updated event — plan tier in database is never updated on downgrade"` or `"customer.subscription.deleted handler sets status to 'canceled' but does not update plan field — premium features remain accessible"`
- **Remediation:** Handle both subscription update and deletion webhooks:

  ```ts
  case 'customer.subscription.updated':
  case 'customer.subscription.deleted': {
    const subscription = event.data.object
    const status = subscription.status // active, past_due, canceled, etc.
    const planKey = subscription.items.data[0]?.price.lookup_key ?? 'free'

    await db.user.update({
      where: { stripe_customer_id: subscription.customer as string },
      data: {
        plan: status === 'active' || status === 'trialing' ? planKey : 'free',
        subscription_status: status,
        subscription_ends_at: new Date(subscription.current_period_end * 1000)
      }
    })
    break
  }
  ```

#### Check: Payment failure handling with grace period
- **ID:** `saas-billing.subscription-mgmt.payment-failure-grace`
- **Severity:** `medium`
- **What to look for:** Look for handling of Stripe's `invoice.payment_failed` or `customer.subscription.updated` events where `status` changes to `past_due`. Check whether the application handles the grace period between first payment failure and final subscription cancellation. Look for user notifications (email triggers, in-app banners) when payment fails. Examine whether the application immediately locks out users on first payment failure or allows continued access during Stripe's retry window.
- **Pass criteria:** Count every payment failure notification channel. The application handles `invoice.payment_failed` (or equivalent) webhook events AND notifies users of payment failure through at least one channel: email (via Stripe email settings or custom webhook-triggered email), in-app notification/banner, or a visual indicator on the billing page showing payment status. Access continues during Stripe's configured retry window (typically 4 attempts over 7-28 days) and is revoked only when the subscription status moves to `past_due` → `canceled`.
- **Fail criteria:** No handling of payment failure events — users are either permanently locked out on first failure or retain access after final cancellation because the event is never processed. Relying solely on Stripe Smart Retries without any user notification mechanism is also a FAIL. A grace period that silently retries without ever informing the user does not satisfy this check.
- **Skip (N/A) when:** No payment integration or no subscription billing (one-time payments only do not have this lifecycle).
- **Detail on fail:** `"No handler for invoice.payment_failed — users are not notified of failed payments"` or `"customer.subscription.updated handler for past_due status immediately revokes access without allowing Stripe's retry window"`
- **Remediation:** Handle the payment failure lifecycle gracefully:

  ```ts
  case 'invoice.payment_failed': {
    const invoice = event.data.object
    // Notify user their payment failed — send email, set in-app flag
    await db.user.update({
      where: { stripe_customer_id: invoice.customer as string },
      data: { payment_failed_at: new Date() }
    })
    // Don't revoke access yet — Stripe will retry
    // Access revokes when subscription status moves to 'past_due' or 'canceled'
    break
  }
  ```

  Configure Stripe's automatic collection settings (Smart Retries + dunning emails) in your Stripe Dashboard to handle the retry cadence.

#### Check: Invoice generation and retrieval is implemented
- **ID:** `saas-billing.subscription-mgmt.invoice-generation`
- **Severity:** `medium`
- **What to look for:** Determine whether users can access their billing history and download invoices. Look for a billing history page, a customer portal integration, or an API endpoint that retrieves invoices from Stripe. Check for Stripe Customer Portal integration (`stripe.billingPortal.sessions.create()`), or a custom invoice listing that calls `stripe.invoices.list({ customer: customerId })`. Also look for whether invoices are stored locally or fetched from Stripe on demand.
- **Pass criteria:** Count every invoice access mechanism. Users can access their invoice history through at least 1 of: Stripe Customer Portal (which handles this automatically), a custom billing page that fetches invoices from Stripe's API, or a webhook-triggered local store of invoice data. Invoices must be accessible to the user without manual intervention.
- **Fail criteria:** No invoice access mechanism exists — users have no way to see or download their billing history. Invoice data is stored locally but never populated (no webhook handler for `invoice.paid`).
- **Skip (N/A) when:** One-time purchases only (no subscription billing where ongoing invoices are generated). Signal: subscription-related dependencies and schema fields are absent.
- **Detail on fail:** `"No billing history page or Stripe Customer Portal integration — users cannot access invoices"` or `"Invoice page exists but fetches from local DB that is never populated — no invoice.paid webhook handler"`
- **Remediation:** The simplest approach is Stripe Customer Portal, which handles invoices, payment method updates, and cancellation without custom code:

  ```ts
  // app/api/billing/portal/route.ts
  export async function POST(req: Request) {
    const session = await getServerSession()
    const user = await db.user.findUnique({ where: { id: session.userId } })

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    })

    return Response.json({ url: portalSession.url })
  }
  ```

#### Check: Refund flow is implemented
- **ID:** `saas-billing.subscription-mgmt.refund-flow`
- **Severity:** `medium`
- **What to look for:** Determine whether refund handling exists in the application. Look for Stripe Customer Portal (which includes refund-adjacent self-service features), admin interface for initiating refunds (`stripe.refunds.create()`), or documented support process. Check whether the application handles the `charge.refunded` webhook to update any local state (like reverting premium access or crediting usage). For most small SaaS applications, refunds are processed manually via Stripe Dashboard — this is acceptable if it's intentional.
- **Pass criteria:** Count every refund-related handler and interface. At least 1 of: (a) Stripe Customer Portal is configured and users can manage subscriptions there, (b) there is an admin interface or support workflow for processing refunds, OR (c) the refund policy is documented and refunds are processed manually through Stripe Dashboard. The `charge.refunded` webhook is handled if it affects application state (e.g., reverting access).
- **Fail criteria:** No refund mechanism exists and the application has no documented refund process. `charge.refunded` webhook events are not handled but should affect application state (e.g., access should be revoked on refund but isn't).
- **Skip (N/A) when:** No payment processing detected.
- **Detail on fail:** `"No refund handling in webhook handlers and no admin refund interface — charge.refunded events are ignored despite affecting subscription state"` or `"Refund reverts payment in Stripe but application continues to grant premium access because charge.refunded is unhandled"`
- **Remediation:** At minimum, handle `charge.refunded` to update application state:

  ```ts
  case 'charge.refunded': {
    const charge = event.data.object
    // If fully refunded, consider revoking access
    if (charge.refunded && charge.amount_refunded === charge.amount) {
      await db.user.update({
        where: { stripe_customer_id: charge.customer as string },
        data: { plan: 'free', subscription_status: 'canceled' }
      })
    }
    break
  }
  ```

  For a complete self-service experience, integrate Stripe Customer Portal — it handles cancellations and gives users a managed refund request flow.

#### Check: Webhook retry handling for payment events
- **ID:** `saas-billing.subscription-mgmt.webhook-retry-handling`
- **Severity:** `medium`
- **What to look for:** Stripe (and other providers) will retry failed webhook deliveries multiple times. Check whether your webhook handler is idempotent — can it safely process the same event twice without corrupting state? Look for duplicate event protection mechanisms: checking whether an event ID has already been processed (storing processed event IDs), or using upsert operations instead of insert operations so re-processing has no harmful effect. Also check the webhook handler's response time — handlers that take too long will cause Stripe to time out and retry.
- **Pass criteria:** Count every database write operation in webhook handlers. Webhook handler uses upsert operations (not pure inserts) for 100% of database writes, OR stores processed event IDs to prevent duplicate processing. The handler returns a 200 response quickly (before lengthy processing completes), using background processing for slow operations if needed.
- **Fail criteria:** Webhook handler uses plain inserts that will fail or duplicate data on retry. Handler performs long-running synchronous operations that may time out before responding. No mechanism to handle duplicate event delivery.
- **Skip (N/A) when:** No webhook endpoint detected.
- **Detail on fail:** `"Webhook handler uses db.create() — duplicate event delivery will fail with unique constraint or create duplicate records"` or `"Webhook handler performs 30s email send synchronously before responding — Stripe may time out and retry"`
- **Remediation:** Make webhook handlers idempotent with upserts and fast responses:

  ```ts
  case 'customer.subscription.updated': {
    const subscription = event.data.object

    // Upsert is safe to call multiple times
    await db.user.upsert({
      where: { stripe_customer_id: subscription.customer as string },
      update: { subscription_status: subscription.status },
      create: { /* ... */ }
    })

    // Queue slow operations (emails, etc.) for background processing
    await queue.enqueue('subscription-updated-email', { customerId: subscription.customer })

    // Return 200 quickly
    return new Response('OK', { status: 200 })
  }
  ```

---

### Category: Pricing Enforcement
**Slug:** `pricing-enforcement`
**Weight in overall score:** 0.20

This category verifies that what your pricing page promises is what your backend actually enforces — and that paid tiers cannot be circumvented.

#### Check: Pricing page matches backend enforcement
- **ID:** `saas-billing.pricing-enforcement.pricing-page-matches-backend`
- **Severity:** `high`
- **What to look for:** Compare the pricing page or pricing component against the actual backend enforcement logic. Look for plan feature lists in the pricing page (often a constants file like `lib/plans.ts`, `config/pricing.ts`, or hardcoded in the pricing component). Compare those feature lists against the actual server-side checks in API routes and middleware. Quote the actual feature names from the pricing page and verify each has a server-side gate. Look for discrepancies: features listed as "Pro only" on the pricing page that are actually served to all authenticated users, or features listed as available on a plan that the backend checks don't enforce for that plan tier.
- **Pass criteria:** Enumerate all features listed on the pricing page. At least 1 feature must have enforcement. Every feature listed as plan-specific has a corresponding server-side access check that enforces that restriction. The plan names, feature names, and price IDs referenced in the pricing page match those used in the backend logic. No feature listed as paid-only is freely accessible via API.
- **Fail criteria:** Features listed as paid-only on the pricing page are not enforced in the backend. Plan names or feature flags in the pricing component are inconsistent with those used in server-side checks. A significant feature is absent from enforcement logic.
- **Skip (N/A) when:** No pricing page or pricing differentiation detected — the application has a single flat plan.
- **Detail on fail:** `"Pricing page lists 'Advanced Analytics' as Pro feature but /api/analytics/advanced has no plan check"` or `"Pricing component references plan IDs 'basic'/'pro' but backend checks use 'free'/'premium' — mismatch may cause enforcement gaps"`
- **Remediation:** Centralize your plan configuration in a single source of truth:

  ```ts
  // lib/plans.ts — used by BOTH the pricing page and backend checks
  export const PLANS = {
    free: {
      name: 'Free',
      features: ['up_to_3_projects', 'basic_analytics'],
      stripePriceId: null,
    },
    pro: {
      name: 'Pro',
      features: ['unlimited_projects', 'advanced_analytics', 'exports'],
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    },
  } as const

  export type PlanFeature = typeof PLANS[keyof typeof PLANS]['features'][number]

  // Then in API routes:
  // if (!PLANS[user.plan].features.includes('advanced_analytics')) return 402
  ```

  This ensures the pricing page and backend always reference the same feature list.

#### Check: Free tier limits are enforced
- **ID:** `saas-billing.pricing-enforcement.free-tier-limits-enforced`
- **Severity:** `high`
- **What to look for:** Identify the free tier limits (project count, record count, API call limits, seat limits, etc.) from the pricing page or plan configuration. Then look for server-side enforcement of those limits. Check API routes that create resources (projects, records, team members, etc.) for checks against the user's current usage count before allowing creation. Look for database queries that count existing resources and compare against plan limits before allowing new resource creation.
- **Pass criteria:** Count every quantitative limit advertised for the free tier — at least 1 must be server-enforced. Every quantitative limit listed (project count, seat count, record limits, etc.) is enforced at the API layer before allowing new resource creation. The limit values match what the pricing page advertises. Report even on pass: "N quantitative limits found, all N enforced at API layer." Display-based and access-based quantitative limits (e.g., "show last N results," "access last N days of history") are real feature gates that must be server-enforced. A UI that advertises a limit (e.g., "last 5 submissions") while the API returns unlimited data is a FAIL — the limit must be enforced in the query or API layer, not just in the UI rendering.
- **Fail criteria:** Free tier limits exist in the pricing page but are not enforced in API routes — free users can create unlimited resources. Resource creation endpoints do not check current usage before allowing creation.
- **Skip (N/A) when:** Skip when no quantitative limits of any kind (creation, access, display, or usage) differentiate free and paid tiers. Signal: pricing page shows no free plan, no `free` tier in plan configuration, no trial-without-payment-method flow.
- **Detail on fail:** `"Pricing page shows 3-project limit for free tier but POST /api/projects has no count check — free users can create unlimited projects"` or `"Free tier seat limit is documented but POST /api/team/invite has no team member count enforcement"`
- **Remediation:** Add usage checks to resource creation endpoints:

  ```ts
  // app/api/projects/route.ts
  export async function POST(req: Request) {
    const session = await getServerSession()
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { _count: { select: { projects: true } } }
    })

    const limit = PLANS[user.plan].limits.projects
    if (user._count.projects >= limit) {
      return Response.json(
        { error: 'Project limit reached. Upgrade to create more projects.' },
        { status: 402 }
      )
    }

    // ... create the project
  }
  ```

#### Check: Usage-based billing tracks metrics accurately
- **ID:** `saas-billing.pricing-enforcement.usage-billing-accurate`
- **Severity:** `high`
- **What to look for:** Determine whether the application uses usage-based billing (metered billing — charging per API call, per seat, per GB, per message, etc.). Look for Stripe metered billing setup (`billing_scheme: 'tiered'` or `aggregate_usage`), usage reporting calls (`stripe.subscriptionItems.createUsageRecord()`), or manual usage tracking in the database. Verify that usage is recorded at the time of the action (not retroactively), that usage records are sent to Stripe before invoice generation, and that usage counts cannot be manipulated by the client.
- **Pass criteria:** Count every metered action endpoint — at least 1 must report usage to Stripe. Usage metrics are recorded server-side at the time of the metered action. Usage records are reported to Stripe (or equivalent) in a way that ensures they are captured before the billing cycle closes. The usage tracking cannot be bypassed by the client.
- **Fail criteria:** Usage is tracked only in client-side state and not recorded server-side. Usage records are sent to Stripe on a schedule that might miss the billing cycle cutoff. Usage tracking can be bypassed by calling the API in a way that doesn't trigger the meter.
- **Skip (N/A) when:** No usage-based billing detected — the application uses flat-rate subscription pricing only. Signal: no metered billing configuration, no usage record API calls, no `usage_type: 'metered'` in Stripe price configuration.
- **Detail on fail:** `"Usage tracking for AI credits is stored in localStorage and reported to Stripe on logout — can be cleared by user"` or `"API endpoint /api/ai/generate does not record usage — metered billing will never report"`
- **Remediation:** Record usage server-side at the point of action:

  ```ts
  // app/api/ai/generate/route.ts
  export async function POST(req: Request) {
    const session = await getServerSession()
    const user = await db.user.findUnique({ where: { id: session.userId } })

    // ... run AI generation

    // Record usage AFTER successful action
    await stripe.subscriptionItems.createUsageRecord(
      user.stripe_metered_item_id,
      { quantity: 1, timestamp: 'now', action: 'increment' }
    )

    // Also track locally for display purposes
    await db.usageRecord.create({
      data: { userId: user.id, action: 'ai_generation', quantity: 1 }
    })

    return Response.json({ result })
  }
  ```

#### Check: Cancellation flow is complete
- **ID:** `saas-billing.pricing-enforcement.cancellation-flow-complete`
- **Severity:** `high`
- **What to look for:** Trace the cancellation flow from user intent to access revocation. Look for a cancellation UI (a cancel button in billing settings or Stripe Customer Portal). Check whether cancellation calls `stripe.subscriptions.cancel()` or `stripe.subscriptions.update({ cancel_at_period_end: true })`. Verify the webhook handler for `customer.subscription.deleted` (immediate cancel) and `customer.subscription.updated` where `cancel_at_period_end: true` (end-of-period cancel). Confirm the database is updated and access is revoked at the right time.
- **Pass criteria:** Count every cancellation entry point. At least 1 cancellation flow exists (UI or Customer Portal). Cancellation calls the Stripe API to cancel or schedule cancellation. Webhook handlers for `customer.subscription.deleted` and the `cancel_at_period_end` case of `customer.subscription.updated` both correctly update the database and revoke access.
- **Fail criteria:** 0 cancellation entry points exist and Stripe Customer Portal is not configured. Do NOT pass if a cancellation button exists in the UI but does not call the Stripe API. Cancellation UI calls the Stripe API but no webhook handler processes the resulting events. Subscription is marked as canceled in the database immediately but access revocation logic is missing.
- **Skip (N/A) when:** No subscription billing detected.
- **Detail on fail:** `"No cancel subscription endpoint or Customer Portal integration — users cannot self-serve cancel"` or `"Cancel button calls Stripe API but customer.subscription.deleted webhook is not handled — database retains active status"`
- **Remediation:** Implement cancellation with end-of-period access (the most user-friendly approach):

  ```ts
  // app/api/billing/cancel/route.ts
  export async function POST(req: Request) {
    const user = await getCurrentUser()

    // Cancel at end of current billing period
    await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    await db.user.update({
      where: { id: user.id },
      data: { cancel_at_period_end: true }
    })

    return Response.json({ message: 'Subscription will cancel at period end' })
  }
  ```

  Then handle `customer.subscription.deleted` in your webhook to set `plan: 'free'` when the period actually ends.

---

### Category: Financial Data Handling
**Slug:** `financial-data`
**Weight in overall score:** 0.15

This category covers the operational maturity of your billing implementation — idempotency, auditability, tax handling, currency consistency, customer self-service, and the accessibility of billing information.

#### Check: Payment operations are idempotent
- **ID:** `saas-billing.financial-data.payment-idempotency`
- **Severity:** `medium`
- **What to look for:** Check API routes that initiate payments, create checkout sessions, or create subscriptions. Look for Stripe idempotency key usage (`idempotencyKey` option on Stripe API calls). Idempotency keys prevent duplicate charges when a network error causes a client to retry a request. Check whether checkout session creation or payment intent creation endpoints can be safely called multiple times without creating duplicate charges.
- **Pass criteria:** Count every payment initiation endpoint — at least 1 must have idempotency protection. Payment initiation endpoints use Stripe idempotency keys, OR use Stripe Checkout Sessions in a way that naturally prevents duplicates (creating a session returns the same session if called again with the same parameters). Checkout session IDs stored in the database prevent duplicate session creation for the same purchase intent.
- **Fail criteria:** Payment intent or charge creation endpoints can be called multiple times without idempotency protection, creating the risk of duplicate charges on network retry.
- **Skip (N/A) when:** No payment initiation code detected (application uses only webhooks to receive payment events, not to initiate payments).
- **Detail on fail:** `"POST /api/billing/checkout creates a new Stripe Payment Intent on every call without idempotency key — network retries can cause duplicate charges"` or `"No idempotency keys used on any Stripe API calls in payment flow"`
- **Remediation:** Use Stripe idempotency keys tied to the user's intent:

  ```ts
  // Generate a stable idempotency key tied to this specific purchase intent
  const idempotencyKey = `checkout-${userId}-${priceId}-${Date.now().toString().slice(0, -3)}`
  // (truncate to minute-level to allow retries within the same minute but prevent
  //  accidental reuse across different purchase intents)

  const session = await stripe.checkout.sessions.create(
    { customer: customerId, line_items: [...], mode: 'subscription' },
    { idempotencyKey }
  )
  ```

  Alternatively, check for an existing incomplete checkout session before creating a new one, and return the existing session URL if found.

#### Check: Billing audit trail exists
- **ID:** `saas-billing.financial-data.billing-audit-trail`
- **Severity:** `low`
- **What to look for:** Look for logging or event recording in the billing flow. Check whether significant billing events (subscription created, subscription canceled, plan changed, payment failed, refund issued) are logged to an application log, stored in a database events/audit table, or sent to an observability platform. Look for structured logging in webhook handlers and billing API routes.
- **Pass criteria:** Count every webhook handler case — at least 2 event types must be logged. BOTH success events (e.g., subscription created, payment received) AND failure events (e.g., payment failed, invoice overdue) are logged with enough context to reconstruct what happened (event type, user ID, plan, amount, timestamp). Logging only failures — such as `console.error` on payment failure but no log on subscription creation — does not pass. This can be application logs (console.log with structure), a dedicated audit log table in the database, or an observability service (Sentry, Datadog, etc.). Stripe's own event log counts as a partial audit trail but application-level logging is required for a pass.
- **Fail criteria:** Webhook handlers log only failure events (e.g., only `console.error` on failures) but silently process successes. Or webhook handlers process all events with no logging at all. Billing state changes (plan upgrades, subscription creation, successful payments) are invisible in application logs.
- **Skip (N/A) when:** No billing integration detected.
- **Detail on fail:** `"Webhook handler processes customer.subscription.updated and customer.subscription.deleted events with no logging — state changes are invisible"` or `"No billing event logging found — only Stripe Dashboard provides any audit history"`
- **Remediation:** Add structured logging to your webhook handler:

  ```ts
  case 'customer.subscription.updated': {
    const subscription = event.data.object
    console.log(JSON.stringify({
      event: 'subscription.updated',
      stripe_event_id: event.id,
      customer_id: subscription.customer,
      status: subscription.status,
      plan: subscription.items.data[0]?.price.lookup_key,
      timestamp: new Date().toISOString()
    }))
    // ... handle the event
  }
  ```

  For more durable audit trails, insert a row into an `audit_log` or `billing_events` table on each significant event.

#### Check: Customer self-service billing portal is accessible
- **ID:** `saas-billing.financial-data.customer-portal`
- **Severity:** `low`
- **What to look for:** Look for Stripe Customer Portal integration (`stripe.billingPortal.sessions.create()`), a link to the billing portal in the user's account settings, or a custom billing management page where users can update payment methods, view invoices, and manage their subscription. Check that the portal link is accessible without requiring a support ticket.
- **Pass criteria:** Count every billing self-service mechanism. Users can access billing self-service through at least 1 of: Stripe Customer Portal, a custom billing page with equivalent capabilities, or a clearly documented process for managing billing.
- **Fail criteria:** No billing self-service exists — users must contact support to update payment methods or access invoices.
- **Skip (N/A) when:** No subscription billing detected.
- **Detail on fail:** `"No billing portal or self-service billing management found — users cannot update payment methods without support intervention"` or `"Billing settings page exists in UI but links to a dead route"`
- **Remediation:** Integrate Stripe Customer Portal — it requires minimal code and provides payment method management, invoice history, and subscription management out of the box:

  ```ts
  // app/api/billing/portal/route.ts
  export async function POST(req: Request) {
    const user = await getCurrentUser()
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    })
    redirect(session.url)
  }
  ```

  Add a "Manage Billing" button in your account settings that calls this endpoint.

#### Check: Currency handling is consistent
- **ID:** `saas-billing.financial-data.currency-handling`
- **Severity:** `low`
- **What to look for:** Check how currency amounts are handled throughout the codebase. Look for: (a) amounts stored as integers in the smallest unit (cents for USD, pence for GBP) vs. floats or decimals, (b) currency display formatting (is `Intl.NumberFormat` or a formatting library used, or are amounts formatted with string concatenation), (c) whether the currency is hardcoded or configurable, (d) any arithmetic on monetary amounts (addition, multiplication for tax, etc.) that could introduce floating-point precision errors.
- **Pass criteria:** Count every location where monetary amounts are stored or displayed — at least 1 must use integer storage. Monetary amounts are stored as integers (smallest currency unit), displayed using a proper currency formatter (`Intl.NumberFormat` with `style: 'currency'`), and arithmetic on amounts uses integer math or a decimal library. The currency code is consistent throughout the codebase.
- **Fail criteria:** Monetary amounts are stored or processed as floats/decimals (risk of floating-point errors). Currency amounts are formatted with string concatenation (`"$" + amount`). Different currency codes or amount units are used inconsistently.
- **Skip (N/A) when:** No monetary amounts displayed or calculated in the application code (amounts are displayed exclusively through Stripe-hosted UI elements).
- **Detail on fail:** `"Amount stored as float in database — floating-point arithmetic may cause rounding errors in tax or discount calculations"` or `"Currency formatted as '$ ' + (amount / 100) without locale-aware formatting"`
- **Remediation:** Handle currency correctly from the start:

  ```ts
  // Store amounts in cents (integer)
  const amountCents = 2999 // $29.99

  // Display using Intl.NumberFormat
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountCents / 100) // "$29.99"

  // For arithmetic, keep everything in integer cents
  const tax = Math.round(amountCents * 0.08) // 240 cents = $2.40
  const total = amountCents + tax // 3239 cents = $32.39
  ```

  Never use floating-point arithmetic directly on dollar amounts.

#### Check: Tax calculation is handled
- **ID:** `saas-billing.financial-data.tax-calculation`
- **Severity:** `info`
- **What to look for:** Determine whether the application collects and remits sales tax or VAT. Look for Stripe Tax integration (`automatic_tax: { enabled: true }` in checkout sessions or subscription creation), TaxJar or Avalara integration, manual tax rate configuration in Stripe, or a documented decision to not collect tax. Also look for whether the pricing page shows tax-inclusive or tax-exclusive pricing.
- **Pass criteria:** Count every checkout session and subscription creation call. At least 1 of: (a) Stripe Tax is enabled on checkout sessions and subscription creation, (b) a third-party tax service is integrated, (c) tax rates are manually configured in Stripe for applicable regions, or (d) there is evidence that the team has consciously decided not to collect tax (documented, or a market where this is legally acceptable for the product type). This is an informational check — tax obligations vary significantly by jurisdiction.
- **Fail criteria:** No tax configuration of any kind exists, there is no indication the team has addressed this question, and the product is likely subject to tax collection obligations (SaaS sold to consumers or businesses in applicable jurisdictions).
- **Skip (N/A) when:** No billing integration detected.
- **Detail on fail:** `"No tax configuration found — Stripe Tax not enabled, no third-party tax service, no tax rates configured. Depending on your markets, you may have tax collection obligations."` (Note: this is informational — flag it for review, not as a definitive compliance failure)
- **Remediation:** Stripe Tax is the simplest path to automated tax calculation and is included in Stripe's standard pricing:

  ```ts
  // Enable automatic tax in checkout sessions
  const session = await stripe.checkout.sessions.create({
    automatic_tax: { enabled: true },
    customer: customerId,
    // ... other options
  })
  ```

  For subscriptions, enable it in the subscription creation as well. Note that Stripe Tax requires your business address to be configured in Stripe Dashboard and may require additional setup for some jurisdictions.

#### Check: Billing information is accessible in account settings
- **ID:** `saas-billing.financial-data.billing-page-accessible`
- **Severity:** `info`
- **What to look for:** Check whether a billing or subscription settings page exists in the application's account settings area. Look for routes like `settings/billing`, `account/billing`, `dashboard/billing`, or similar. Verify the page exists and is linked from the main settings navigation. Check that the page shows the user's current plan, next billing date, and payment method information (or links to the Customer Portal where this is available).
- **Pass criteria:** Count every billing-related page or route. At least 1 billing settings page or equivalent exists, is reachable from the main settings navigation, and shows meaningful billing information or links to the Customer Portal.
- **Fail criteria:** No billing settings page exists. The billing page exists but is not linked from settings navigation (unreachable without knowing the URL). The billing page is a dead route that renders an error.
- **Skip (N/A) when:** No subscription billing detected.
- **Cross-reference:** For frontend accessibility and navigation patterns for settings pages, the Accessibility Fundamentals audit covers keyboard navigation and ARIA patterns.
- **Detail on fail:** `"No billing settings page found in app/settings/ or account/ routes"` or `"Billing page route exists but is not linked in settings navigation"` or `"Billing settings page throws an error when visited"`
- **Remediation:** Create a billing settings page that shows the current plan and links to the Customer Portal:

  ```tsx
  // app/settings/billing/page.tsx
  export default async function BillingPage() {
    const user = await getCurrentUser()

    return (
      <div>
        <h2>Billing</h2>
        <p>Current plan: {user.plan}</p>
        <p>Status: {user.subscription_status}</p>
        <form action="/api/billing/portal" method="POST">
          <button type="submit">Manage Billing</button>
        </form>
      </div>
    )
  }
  ```

---

## Scoring

### Severity-to-Weight Mapping

| Telemetry Severity | Scoring Weight | Weight Value |
|-------------------|----------------|-------------|
| `critical`        | Critical       | **10**      |
| `high`            | Warning        | **3**       |
| `medium`          | Warning        | **3**       |
| `low`             | Info           | **1**       |
| `info`            | Info           | **1**       |

### Category Score Formula

For each category, compute:

**Category Score = ( sum of weights of passing checks ) / ( sum of weights of all applicable checks ) × 100**

- Only include checks with result `"pass"` or `"fail"` in the calculation.
- Exclude checks with result `"skip"` or `"error"` from BOTH numerator and denominator.
- Round to the nearest integer (0.5 rounds up).
- If all checks in a category are skip/error, the category score is `null`.

### Overall Score Formula

**Overall Score = ( sum of weights of passing checks across ALL categories ) / ( sum of weights of all applicable checks across ALL categories ) x 100**

- Pool every check from every category into one list. Category boundaries do not matter for this calculation.
- Only include checks with result "pass" or "fail". Exclude "skip" or "error" from both numerator and denominator.
- Category weights (`weight` field in the categories array) do NOT affect this calculation.
- Round to the nearest integer.
- If all checks are skip/error, overall score is `null`.

Do NOT compute the overall score as a weighted average of category scores.

### Grade Scale

| Grade | Score Range |
|-------|------------|
| A     | 90–100     |
| B     | 75–89      |
| C     | 60–74      |
| D     | 40–59      |
| F     | 0–39       |

Apply the grade to each category score and to the overall score. If a score is `null`, the grade is also `null`.

### Edge Cases

| Scenario | Rule |
|----------|------|
| All checks pass | Score = 100 |
| All checks fail | Score = 0 |
| All checks skip/error | Score = null, Grade = null |
| Fewer than 50% of checks applicable | Include a low-applicability warning in the report noting that the score may not be representative |

---

## Output Format

### Step 1: Generate Telemetry JSON

Output the telemetry JSON block FIRST, inside a fenced code block with the language tag `json`. This is critical — if output is truncated, the telemetry must survive.

Generate a fresh UUID v4 for `submission_id`.
Use the current UTC timestamp for `generated_at`.
Use the `project_id` provided by the user, or generate a new UUID v4 if none was provided.

### Step 2: Generate Human-Readable Report

After the telemetry JSON, produce the audit report with this structure:

#### Report Structure

1. **Score Summary** — Overall score, grade, and category breakdown in a quick-glance table.
2. **Critical Findings** — Failed checks with severity `critical`, each with:
   - What was found
   - Why it matters
   - How to fix it (step-by-step remediation)
3. **Warnings** — Failed checks with severity `high` or `medium`, same format.
4. **Minor Issues** — Failed checks with severity `low` or `info`, same format.
5. **What You're Doing Well** — Brief summary of passed checks (2-3 sentences, not a full list).
6. **Skipped Checks** — Any checks that were not applicable, with brief reasons.
7. **Next Steps** — Top 3 priorities to improve the score, plus natural cross-references to other AuditBuffet audits where relevant.

#### Report Tone

Write as a knowledgeable friend looking out for the reader. Not a compliance officer. Not a condescending senior developer.
- State findings clearly and directly without being alarming or judgmental.
- Remediation guidance assumes the reader is smart but may not have domain expertise.
- No emojis. No hype language. Professional, calm, and warm.
- Cross-references to other AuditBuffet audits are informational: "For a deeper analysis of [topic], the [Audit Name] covers this in detail." Never salesy or urgent.

#### Report Formatting

- Use markdown headers, bold for emphasis, code blocks for file paths and code snippets.
- Group findings by severity, not by category. Users care about "what's most important to fix" more than "which category it belongs to."
- Keep remediation guidance concise but complete. Include the specific file to edit and the change to make when possible.


### Step 3: Submit Your Results

<!-- AB:CURL_SUBMIT -->
Copy the JSON telemetry block from Step 1 and submit it at:

**https://auditbuffet.com/submit/telemetry**

The JSON contains only check IDs and pass/fail results — no source code, secrets, or personal data.

**Automatic submission (if your tool can run shell commands):**

```bash
cat > /tmp/audit-result.json << 'AUDIT_EOF'
<paste the telemetry JSON from Step 1 here>
AUDIT_EOF
curl -sS -L -X POST https://auditbuffet.com/api/v1/submit \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer ab_19wlgDZ13qLOvvSEzQsOUdTK' \
  -d @/tmp/audit-result.json
rm /tmp/audit-result.json
```

After the response comes back:
- If the response contains `"status": "ok"`, show the user their score and grade.
- If the response includes `"dashboard_url"`, mention they can view their project at auditbuffet.com.
- If it fails, show the user the error message. Common fixes: ensure Content-Type is application/json, check the JSON is complete (not truncated), and verify all required fields are present.
- If the curl command is not available (chat interface, browser-based builder), tell the user to copy the complete JSON block and paste it at https://auditbuffet.com/submit/telemetry
<!-- /AB:CURL_SUBMIT -->

---

## Telemetry JSON Schema

Generate the following JSON structure. Every field is required. Use `null` where a value cannot be determined, never omit a field.

**Important:** Values in `<angle brackets>` below are placeholder descriptions, not literal strings. Replace them with the actual values — integers for scores, strings for text fields, null where appropriate.

### Template

```json
{
  "schema_version": "1.0.0",
  "payload_type": "audit_telemetry",
  "submission_id": "<generate UUID v4>",
  "generated_at": "<current UTC timestamp ISO 8601>",
  "project_id": "5c6d7e8f-9a0b-4d1c-8e2f-3a4b5c6d7e8f",

  "audit": {
    "slug": "saas-billing",
    "display_name": "Billing & Payments Audit",
    "version": "1.1.0",
    "prompt_hash": "sha256:3cce2e8050c2023b60b225d3a75105b6"
  },

  "build_tool": {
    "name": "<user-reported build tool>",
    "version": null
  },

  "stack_summary": {
    "framework": "<detected or null>",
    "framework_version": "<detected or null>",
    "language": "<detected or null>",
    "database": "<detected or null>",
    "orm": "<detected or null>",
    "auth": "<detected or null>",
    "hosting": "<detected or null>",
    "ui": "<detected or null>",
    "project_type": "<detected or null>",
    "project_size": "<detected or null>"
  },

  "scoring": {
    "overall_score": "<computed integer 0-100 or null>",
    "overall_grade": "<A|B|C|D|F or null>",
    "total_checks": 22,
    "passed": "<integer>",
    "failed": "<integer>",
    "skipped": "<integer>",
    "errored": "<integer>",
    "categories": [
      {
        "slug": "payment-security",
        "display_name": "Payment Security",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.35,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 4
      },
      {
        "slug": "subscription-mgmt",
        "display_name": "Subscription Management",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.30,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 8
      },
      {
        "slug": "pricing-enforcement",
        "display_name": "Pricing Enforcement",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.20,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 4
      },
      {
        "slug": "financial-data",
        "display_name": "Financial Data Handling",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.15,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 6
      }
    ]
  },

  "checks": [
    {
      "id": "saas-billing.payment-security.pci-compliant-provider",
      "label": "Payment processing uses a PCI-compliant provider",
      "category_slug": "payment-security",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.payment-security.no-cc-data-stored",
      "label": "No credit card data stored in application database",
      "category_slug": "payment-security",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.payment-security.webhook-signature-verification",
      "label": "Webhook signature verification is implemented",
      "category_slug": "payment-security",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.payment-security.no-payment-bypass-api",
      "label": "No way to bypass payment via API",
      "category_slug": "payment-security",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.subscription-mgmt.subscription-server-verified",
      "label": "Subscription status is verified server-side",
      "category_slug": "subscription-mgmt",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.subscription-mgmt.feature-access-gated",
      "label": "Feature access is gated on subscription status",
      "category_slug": "subscription-mgmt",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.subscription-mgmt.trial-enforces-limits",
      "label": "Trial period enforces feature limits",
      "category_slug": "subscription-mgmt",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.subscription-mgmt.downgrade-removes-access",
      "label": "Downgrade removes access to premium features",
      "category_slug": "subscription-mgmt",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.subscription-mgmt.payment-failure-grace",
      "label": "Payment failure handling with grace period",
      "category_slug": "subscription-mgmt",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.subscription-mgmt.invoice-generation",
      "label": "Invoice generation and retrieval is implemented",
      "category_slug": "subscription-mgmt",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.subscription-mgmt.refund-flow",
      "label": "Refund flow is implemented",
      "category_slug": "subscription-mgmt",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.subscription-mgmt.webhook-retry-handling",
      "label": "Webhook retry handling for payment events",
      "category_slug": "subscription-mgmt",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.pricing-enforcement.pricing-page-matches-backend",
      "label": "Pricing page matches backend enforcement",
      "category_slug": "pricing-enforcement",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.pricing-enforcement.free-tier-limits-enforced",
      "label": "Free tier limits are enforced",
      "category_slug": "pricing-enforcement",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.pricing-enforcement.usage-billing-accurate",
      "label": "Usage-based billing tracks metrics accurately",
      "category_slug": "pricing-enforcement",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.pricing-enforcement.cancellation-flow-complete",
      "label": "Cancellation flow is complete",
      "category_slug": "pricing-enforcement",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.financial-data.payment-idempotency",
      "label": "Payment operations are idempotent",
      "category_slug": "financial-data",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.financial-data.billing-audit-trail",
      "label": "Billing audit trail exists",
      "category_slug": "financial-data",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.financial-data.customer-portal",
      "label": "Customer self-service billing portal is accessible",
      "category_slug": "financial-data",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.financial-data.currency-handling",
      "label": "Currency handling is consistent",
      "category_slug": "financial-data",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.financial-data.tax-calculation",
      "label": "Tax calculation is handled",
      "category_slug": "financial-data",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-billing.financial-data.billing-page-accessible",
      "label": "Billing information is accessible in account settings",
      "category_slug": "financial-data",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    }
  ],

  "meta": { "api_key": "ab_19wlgDZ13qLOvvSEzQsOUdTK" }
}
```

### Invariants You Must Satisfy

Before outputting the JSON, verify all of these:

1. `scoring.total_checks` equals `scoring.passed + scoring.failed + scoring.skipped + scoring.errored`
2. `scoring.total_checks` equals the number of objects in the `checks` array
3. The sum of all category `weight` values equals `1.0` (tolerance: ±0.001) — verify: 0.35 + 0.30 + 0.20 + 0.15 = 1.00
4. For each category: `checks_total == checks_passed + checks_failed + checks_skipped + checks_errored`
5. The sum of all category `checks_total` equals `scoring.total_checks` — verify: 4 + 8 + 4 + 6 = 22
6. Every `category_slug` in the `checks` array matches a `slug` in `scoring.categories`
7. `detail` is not null when `result` is `"fail"` or `"error"`
8. `detail` is 500 characters or fewer
9. All `id` values follow the format `{audit-slug}.{category-slug}.{check-slug}` with all-lowercase kebab-case segments
10. Scores are between 0-100 or null
11. Grades match the grade scale (A=90-100, B=75-89, C=60-74, D=40-59, F=0-39)
