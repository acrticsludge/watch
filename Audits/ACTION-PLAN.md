# Stackwatch SEO Action Plan

**Generated:** 2026-04-09
**Overall score:** 62/100
**Target:** 80+/100

---

## Critical — Fix Immediately

These block rich results, risk manual actions, or cause user-facing failures.

---

### C1 — Generate missing video poster image

**Impact:** LCP, CLS, VideoObject structured data, social sharing
**Files:** `frontend/public/` (missing file), `frontend/app/components/landing/HeroDemoLoader.tsx`

The file `StackwatchDemo-poster.jpg` is referenced in both the `<video poster>` attribute and the VideoObject `thumbnailUrl` in schema, but does not exist in `/public/`. This causes a 404, breaks video structured data validation, degrades LCP, and leaves the video as a blank rectangle on slow connections.

**Fix:**
```bash
cd "c:\Anubhav\Web Dev Projects\Watch\watch\frontend\public"
ffmpeg -i StackwatchDemo.mp4 -ss 0.5 -frames:v 1 -q:v 3 StackwatchDemo-poster.jpg
```
Target: under 60 KB at 1280×720. Then add a preload hint to `layout.tsx`:
```tsx
// In layout.tsx <head>
<link rel="preload" as="image" href="/StackwatchDemo-poster.jpg" />
```

---

### C2 — Remove or substantiate AggregateRating schema

**Impact:** Google manual action risk, trust signals
**File:** `frontend/app/page.tsx` lines 53–59

`ratingCount: "3"` with `ratingValue: "5"` and no linked review source. Google quality raters treat unverifiable perfect-score ratings as fabricated markup.

**Fix (immediate):** Remove the `aggregateRating` block from the `jsonLd` SoftwareApplication object in `page.tsx`.

**Fix (long-term):** After launching on Product Hunt or collecting ≥10 real reviews on G2/Capterra, restore the block with a real count and a `sameAs` link to the review source:
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": 4.8,
  "bestRating": 5,
  "worstRating": 1,
  "ratingCount": 12,
  "reviewCount": 12
}
```

---

### C3 — Fix Pro plan price in schema (both pages)

**Impact:** Rich result policy violation, pricing confusion
**Files:** `frontend/app/page.tsx`, `frontend/app/pricing/page.tsx`

Both schema blocks declare `price: "10"` but the page displays $120/year. Schema must match visible page content.

**Fix in both files — replace the Pro Offer:**
```json
{
  "@type": "Offer",
  "name": "Pro",
  "price": "120",
  "priceCurrency": "USD",
  "availability": "https://schema.org/OnlineOnly",
  "url": "https://stackwatch.pulsemonitor.dev/pricing",
  "priceSpecification": {
    "@type": "UnitPriceSpecification",
    "price": "120",
    "priceCurrency": "USD",
    "billingDuration": 1,
    "unitCode": "ANN"
  }
}
```

---

### C4 — Add HSTS header

**Impact:** Security ranking signal, browser-cached HTTPS enforcement
**File:** `frontend/next.config.ts`

`Strict-Transport-Security` is missing from the security headers block.

**Fix — add to the `securityHeaders` array:**
```ts
{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
```

---

## High — Fix Within 1 Week

---

### H1 — Fix FAQ page title (duplicate brand)

**File:** `frontend/app/faq/page.tsx` line 83

Current: `title: "FAQ — Stackwatch"` renders as "FAQ — Stackwatch | Stackwatch" via layout template.

**Fix:**
```ts
export const metadata: Metadata = {
  title: "FAQ",
  // renders as: "FAQ | Stackwatch"
```

---

### H2 — Remove FAQPage schema from homepage

**File:** `frontend/app/page.tsx`

Two pages (`/` and `/faq`) emit identical FAQPage JSON-LD blocks. Both are canonicalized to themselves. Google sees two pages claiming to be the authoritative FAQ.

**Fix:** Remove the `faqLd` const and its `<script type="application/ld+json">` injection from `page.tsx`. Keep the visible FAQ accordion HTML — remove only the structured data.

---

### H3 — Fix DynamicNav to enable edge caching

**Files:** `frontend/app/page.tsx`, `frontend/app/components/landing/LandingNav.tsx`

`DynamicNav` calls `supabase.auth.getUser()` as a server component, forcing full SSR on every request. TTFB is ~450ms. With this removed, Vercel edges the HTML globally and TTFB drops to ~50–100ms.

**Fix:** Convert auth detection to a client-side check after hydration. Render the logged-out nav statically, swap to the authenticated state client-side:
```tsx
// LandingNav — add client-side auth detection
"use client";
import { createClient } from "@/lib/supabase/client";

export function LandingNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);
  // render nav based on isLoggedIn state
}
```
Then replace `<DynamicNav>` in `page.tsx` with `<LandingNav>` directly.

---

### H4 — Fix relative OG URLs and canonicals

**Files:** `frontend/app/pricing/page.tsx`, `frontend/app/privacy/page.tsx`, `frontend/app/terms/page.tsx`

All three pages use relative `openGraph.url` and `alternates.canonical`. OG scrapers often don't resolve relative URLs against the page base.

**Fix (pricing example — repeat for privacy and terms):**
```ts
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stackwatch.pulsemonitor.dev";

export const metadata: Metadata = {
  alternates: { canonical: `${APP_URL}/pricing` },
  openGraph: {
    url: `${APP_URL}/pricing`,
    // ...rest unchanged
  },
};
```

---

### H5 — Fix Organization schema logo

**File:** `frontend/app/page.tsx` lines 102–106

`orgLd.logo` references `${APP_URL}/og` (1200×630 OG banner). Google requires near-square logos for Knowledge Panel display.

**Fix:** Create `frontend/public/logo-square.png` (512×512 or 256×256), then update:
```json
"logo": {
  "@type": "ImageObject",
  "url": "https://stackwatch.pulsemonitor.dev/logo-square.png",
  "width": 512,
  "height": 512
}
```

---

### H6 — Fix llms.txt: add MongoDB Atlas, fix Team polling, add /faq

**File:** `frontend/public/llms.txt`

Three factual gaps in the current file:

1. MongoDB Atlas is missing from "What it monitors" (it's listed on the homepage)
2. Team plan polling says "every 1 minute" but FAQ says "5 minutes" — pick one and sync both
3. `/faq` is not linked (FAQ is the most citable page on the site)

**Fix — updated `llms.txt` sections:**
```
## What it monitors

- **GitHub Actions**: minutes used vs monthly limit, broken down per repo
- **Vercel**: bandwidth, build minutes, function invocations vs plan limits
- **Supabase**: database size, row count, storage, monthly active users vs free tier limits
- **Railway**: memory and CPU usage per service
- **MongoDB Atlas**: connection count, data transfer, and storage vs Atlas free tier limits

## Polling intervals

- Free plan: every 15 minutes
- Pro plan: every 5 minutes
- Team plan: every 1 minute

## Plans

- **Free** — $0/month. 1 account per service, email alerts, 15-minute polling, 7-day usage history.
- **Pro** — $120/year ($10/month equivalent). 5 accounts per service, all alert channels, 5-minute polling, 30-day history, usage history charts.
- **Team** — $360/year ($30/month equivalent). Unlimited accounts, all alert channels, 1-minute polling, 90-day history, shared team dashboard.

## Links

- Homepage: https://stackwatch.pulsemonitor.dev
- Pricing: https://stackwatch.pulsemonitor.dev/pricing
- FAQ: https://stackwatch.pulsemonitor.dev/faq
- Privacy Policy: https://stackwatch.pulsemonitor.dev/privacy
- Terms of Service: https://stackwatch.pulsemonitor.dev/terms
- Sign up: https://stackwatch.pulsemonitor.dev/signup
```

Also add a competitor-context sentence near the top:
```
Stackwatch is designed for small teams who find Datadog, Grafana, or self-hosted monitoring too complex or too expensive for early-stage use.
```

---

### H7 — Add Team tier Offer to /pricing page schema

**File:** `frontend/app/pricing/page.tsx`

The pricing page schema only includes Free and Pro offers. Team tier exists on the page but is absent from structured data.

**Fix:** Add a third Offer to `pricingLd.offers`:
```json
{
  "@type": "Offer",
  "name": "Team",
  "description": "Everything in Pro plus team member invites, shared pooled usage dashboard, and team admin controls.",
  "price": "360",
  "priceCurrency": "USD",
  "availability": "https://schema.org/OnlineOnly",
  "url": "https://stackwatch.pulsemonitor.dev/pricing"
}
```

---

## Medium — Fix Within 1 Month

---

### M1 — Add content to pricing page

**File:** `frontend/app/pricing/page.tsx` / `PricingSection.tsx`

The pricing page is ~180 words — critically thin for a transactional page. Add a 150–200 word prose section above or below the pricing cards explaining the tier philosophy (e.g. "The free plan is designed for a solo developer with one set of services. Pro unlocks multi-account monitoring for teams running multiple staging and production environments..."). Also add a small FAQ section covering billing questions.

---

### M2 — Expand homepage body copy to 500+ words

Add at least one sentence per monitored service explaining what gets tracked and *why it matters* (consequences of hitting the limit). Example:
> "When GitHub Actions minutes run out, every workflow queues indefinitely until your next billing cycle — builds stop, deploys stop, and your team finds out when a deploy doesn't happen."

This content should live in server-rendered HTML (not inside a `"use client"` accordion).

---

### M3 — Fix FAQ answers for AI citation

**File:** `frontend/app/components/landing/FAQSection.tsx`

FAQ answers are 20–50 words each — below the 134–167 word range optimal for AI passage extraction. Expand the 3 most important answers (security, alert deduplication, GitHub orgs support) to 100–150 words with specific details.

Also: the FAQ accordion hides answer text in collapsed state. The FAQ JSON-LD compensates for this, but consider rendering answers as static visible `<p>` tags on the `/faq` page (open layout, no accordion) so answer text appears in the initial HTML.

---

### M4 — Remove GTM preload hint from `<head>`

**File:** `frontend/app/layout.tsx`

A `<link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=..." as="script">` tag competes for bandwidth with render-critical resources during page load. GTM is already deferred via `strategy="afterInteractive"` — the manual preload undermines this.

**Fix:** Remove the `<link rel="preload">` for GTM from `layout.tsx`.

---

### M5 — Dynamic sitemap `lastModified` + add `changefreq`/`priority`

**File:** `frontend/app/sitemap.ts`

All entries have static hardcoded `lastModified: "2026-03-26"`. Googlebot uses this for crawl prioritisation.

**Fix:**
```ts
return [
  {
    url: BASE_URL,
    lastModified: new Date().toISOString(), // dynamic for ISR-revalidated page
    changefreq: "weekly",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/pricing`,
    lastModified: "2026-03-26",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/faq`,
    lastModified: "2026-03-26",
    changefreq: "monthly",
    priority: 0.8,
  },
  // privacy/terms: changefreq: "yearly", priority: 0.3
];
```

---

### M6 — Add shared `@id` to SoftwareApplication blocks

**Files:** `frontend/app/page.tsx`, `frontend/app/pricing/page.tsx`

Both pages emit separate `SoftwareApplication` blocks for "Stackwatch" with no `@id`. Parsers treat them as two different entities.

**Fix:** Add `"@id": "https://stackwatch.pulsemonitor.dev/#software"` to both blocks.

---

### M7 — Replace Framer Motion scroll triggers with IntersectionObserver

**Files:** `frontend/app/components/landing/HowItWorks.tsx`, `frontend/app/components/landing/AlertChannelsSection.tsx`

Both are `"use client"` solely for `useInView` from Framer Motion. This adds ~30–50 KB of Framer Motion bundle weight to the critical path for components that are purely static below the fold.

**Fix:** Replace with native `IntersectionObserver` or `react-intersection-observer` (SSR-compatible, ~2 KB).

---

### M8 — Add social proof to homepage

Add at least one real testimonial with full name attribution (or a company name), or a modest metric ("monitoring X integrations across Y teams"). Even one verifiable social proof element meaningfully moves E-E-A-T scores and conversion.

---

### M9 — Replace Gmail support contact

**Affected:** Privacy page, any contact references

Replace `anubhavrai100@gmail.com` with a product-domain address (e.g. `support@pulsemonitor.dev` or `hello@stackwatch.pulsemonitor.dev`). B2B buyers evaluating a tool that handles API keys will not trust a personal Gmail.

---

## Low — Backlog

---

### L1 — Upload demo video to YouTube

The demo is self-hosted as `/StackwatchDemo.mp4`. YouTube is the strongest AI citation correlator (~0.737). Upload the video to a Stackwatch YouTube channel, then update the VideoObject schema:
```json
"contentUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
"embedUrl": "https://www.youtube.com/embed/VIDEO_ID"
```

---

### L2 — Implement IndexNow

Generates near-instant indexing on Bing, Yandex, and Naver for new/updated content. For a new site with low crawl budget, this is especially valuable.

1. Generate a UUID v4 key
2. Place it at `frontend/public/{key}.txt`
3. POST to `https://api.indexnow.org/indexnow` on each deploy (Vercel deploy hook or post-build script)

---

### L3 — Establish Reddit and Product Hunt presence

- Post an "I built this" thread in r/indiehackers and r/SaaS with specific problem framing
- Submit a Product Hunt listing

Both create crawlable external pages that name-check Stackwatch in context — among the strongest signals for LLM citation inclusion.

---

### L4 — Create per-page OG images

All pages currently share the same `/og` dynamic image (same headline, same subline). Add a `?page=pricing` query parameter convention to the `/og` route to vary the headline per page:
- Pricing: "Choose your plan — Stackwatch"
- FAQ: "Common questions — Stackwatch"

---

### L5 — Block training-only AI bots in robots.txt

`CCBot`, `anthropic-ai`, and `cohere-ai` (training crawlers, not inference crawlers) are not explicitly blocked. If you don't want your content used for model training:

```
User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: cohere-ai
Disallow: /
```

---

### L6 — Add VideoObject `embedUrl`

**File:** `frontend/app/page.tsx` — `videoLd` block

Until YouTube hosting is set up, set `embedUrl` equal to `contentUrl`:
```json
"embedUrl": "https://stackwatch.pulsemonitor.dev/StackwatchDemo.mp4"
```

---

### L7 — Audit all new routes for explicit canonical

The root `layout.tsx` sets `alternates: { canonical: "/" }` as a fallback. Any new route added without its own canonical will incorrectly declare itself a duplicate of the homepage. Document this as a required convention for all future routes.

---

## Summary Checklist

| # | Issue | Severity | Est. effort | Done |
|---|---|---|---|---|
| C1 | Generate poster image (`ffmpeg`) + add preload hint | Critical | 15 min | ✅ placeholder created; replace with real frame when ffmpeg available |
| C2 | Remove AggregateRating from page.tsx | Critical | 5 min | ✅ |
| C3 | Fix Pro price to $120 in both schema blocks | Critical | 15 min | ✅ Pro=$120, Team=$360, both pages, with priceSpecification |
| C4 | Add HSTS header to next.config.ts | Critical | 5 min | ✅ |
| H1 | Fix FAQ page title to "FAQ" | High | 2 min | ✅ |
| H2 | Remove FAQPage JSON-LD from homepage | High | 10 min | ✅ |
| H3 | Move nav auth to client-side (enable edge caching) | High | 1–2 hr | ✅ DynamicNav removed; LandingNav detects auth via useEffect |
| H4 | Fix relative OG/canonical URLs (pricing, privacy, terms) | High | 20 min | ✅ |
| H5 | Create logo-square.png + fix Organization logo | High | 30 min | ☐ needs manual design work |
| H6 | Update llms.txt (MongoDB, polling fix, /faq link, Team price) | High | 15 min | ✅ |
| H7 | Add Team Offer to /pricing schema | High | 10 min | ✅ |
| M1 | Add prose content to /pricing page | Medium | 1 hr | ☐ |
| M2 | Expand homepage body copy to 500+ words | Medium | 1–2 hr | ☐ |
| M3 | Expand FAQ answers for AI citation | Medium | 1 hr | ☐ |
| M4 | Remove GTM preload from layout.tsx | Medium | 5 min | ✅ no preload found — already clean |
| M5 | Dynamic sitemap lastModified + changefreq/priority | Medium | 20 min | ✅ |
| M6 | Add @id to both SoftwareApplication blocks | Medium | 10 min | ✅ |
| M7 | Replace Framer Motion with IntersectionObserver | Medium | 2 hr | ✅ HowItWorks + AlertChannelsSection |
| M8 | Add real social proof to homepage | Medium | 1 hr | ☐ |
| M9 | Replace Gmail with product-domain email | Medium | 15 min | ☐ |
| L1 | Upload demo video to YouTube | Low | 1–2 hr | ☐ |
| L2 | Implement IndexNow | Low | 30 min | ☐ |
| L3 | Reddit + Product Hunt presence | Low | 3–5 hr | ☐ |
| L4 | Per-page OG images | Low | 1 hr | ☐ |
| L5 | Block training bots in robots.txt | Low | 5 min | ☐ |
| L6 | Add VideoObject embedUrl | Low | 5 min | ✅ |
| L7 | Document canonical convention for new routes | Low | 10 min | ☐ |

**Estimated score after all Critical + High fixes:** ~75/100
**Estimated score after all fixes:** ~84/100
