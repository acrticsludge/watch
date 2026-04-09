# Stackwatch — Full SEO Audit Report

**Site:** https://stackwatch.pulsemonitor.dev
**Audit date:** 2026-04-09
**Framework:** Next.js 15 App Router · Hosted on Vercel

---

## SEO Health Score: 62 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 74/100 | 16.3 |
| Content Quality / E-E-A-T | 23% | 54/100 | 12.4 |
| On-Page SEO | 20% | 65/100 | 13.0 |
| Schema / Structured Data | 10% | 58/100 | 5.8 |
| Performance (Core Web Vitals) | 10% | 62/100 | 6.2 |
| AI Search Readiness (GEO) | 10% | 58/100 | 5.8 |
| Images | 5% | 50/100 | 2.5 |
| **Total** | 100% | | **62.0** |

---

## Executive Summary

### Business type detected
B2B SaaS — developer tooling, usage/quota monitoring. Competing on low-volume, high-intent queries: "GitHub Actions usage alerts", "Vercel quota monitoring", "Supabase usage alerts".

### Top 5 critical issues

1. **Missing `StackwatchDemo-poster.jpg`** — 404 on both the `<video poster>` attribute and the VideoObject schema `thumbnailUrl`. Breaks structured data validation, degrades LCP, and leaves the video as a blank rectangle on slow connections.
2. **Unverifiable `aggregateRating` (5/5 from 3 reviews)** — No linked review source. Google's quality raters treat this as fabricated markup and it is a material manual action risk.
3. **Pro plan price mismatch in schema** — Both `page.tsx` and `pricing/page.tsx` schema declare `price: "10"` but the page displays $120/year. Schema contradicting visible page content is a Google rich-result policy violation.
4. **HSTS header missing** — `Strict-Transport-Security` is absent from `next.config.ts`. Vercel enforces HTTPS at the edge but browsers won't cache the upgrade instruction, and HTTPS enforcement is a confirmed Google ranking signal.
5. **HTML not CDN-cached** — `DynamicNav` calls `supabase.auth.getUser()` on every request, forcing full SSR and overriding `revalidate = 3600`. Every visitor waits ~450ms for a Supabase round-trip before receiving any HTML.

### Top 5 quick wins

1. Run `ffmpeg` to extract a poster frame → fix LCP, VideoObject, and CLS in one commit
2. Change FAQ page `title` from `"FAQ — Stackwatch"` → `"FAQ"` → fixes doubled brand in SERP title
3. Add HSTS header to `next.config.ts` → one line, critical security signal
4. Remove `aggregateRating` block from homepage schema → eliminates manual action risk immediately
5. Fix Pro `price` in both schema blocks to `"120"` with annual `priceSpecification` → fixes policy violation

---

## Technical SEO — 74/100

### Crawlability — 95/100 ✅

- robots.txt correctly allows all search and AI crawlers at root
- Sensitive routes (`/api/`, `/dashboard/`, `/settings/`, `/integrations/`, `/alerts/`, `/team/`) correctly disallowed
- Sitemap declared at `/sitemap.xml`
- No redirect chains detected
- HTTP → HTTPS enforced at Vercel edge; www → apex handled natively

**Note:** AI crawler rules (GPTBot, ClaudeBot, PerplexityBot) are listed explicitly in robots.ts before the wildcard rule, which already allows them. The explicit rule is redundant but harmless.

### Indexability — 75/100 ⚠️

All 5 sitemap pages are indexable with `robots: { index: true, follow: true }`. No noindex issues.

**Risk:** The root layout sets `alternates: { canonical: "/" }` as a fallback. Any new route added without an explicit canonical override will incorrectly declare itself a duplicate of the homepage. This is a maintenance trap.

### Canonical status

| Page | Canonical | Status |
|---|---|---|
| `/` | `https://stackwatch.pulsemonitor.dev` (absolute) | ✅ |
| `/pricing` | `"/pricing"` (relative) | ⚠️ Fragile |
| `/faq` | `https://stackwatch.pulsemonitor.dev/faq` (absolute) | ✅ |
| `/privacy` | `"/privacy"` (relative) | ⚠️ Fragile |
| `/terms` | `"/terms"` (relative) | ⚠️ Fragile |

Relative canonicals work in production via `metadataBase` but break during preview deployments and confuse some OG scrapers. The `openGraph.url` fields on these pages are also relative — OG scrapers often don't resolve relative URLs.

### Security headers — 70/100 ⚠️

| Header | Status | Value |
|---|---|---|
| HTTPS | ✅ | Vercel edge enforced |
| **Strict-Transport-Security** | ❌ | **Missing** |
| X-Frame-Options | ✅ | DENY |
| X-Content-Type-Options | ✅ | nosniff |
| Referrer-Policy | ✅ | strict-origin-when-cross-origin |
| Permissions-Policy | ✅ | camera/microphone/geolocation off |
| Content-Security-Policy | ⚠️ | Present but uses `unsafe-inline` (required for JSON-LD) |

### URL structure — 90/100 ✅

Clean, flat URL structure. All public pages are single-depth (`/pricing`, `/faq`). Auth and app routes are correctly separated and disallowed from crawling.

### Mobile-friendliness — 85/100 ✅

- Viewport correctly declared with no `user-scalable=no` restrictions
- Tailwind responsive breakpoints used throughout
- Touch target concern: nav `.h-8` (32px) login button is below Google's 48px recommendation

### JavaScript rendering — 80/100 ✅

All critical page content (H1, JSON-LD, pricing, footer) is server-rendered and present in initial HTML. `"use client"` components still receive SSR HTML from Next.js — content is not hidden behind JS execution. `DynamicNav` is wrapped in `<Suspense>` so auth streaming doesn't block hero content.

---

## Content Quality / E-E-A-T — 54/100

### Experience — 28/100 ❌

Zero first-hand experience signals. No founder story, no origin narrative, no customer testimonials with real attribution. The three homepage testimonials use initials only (Marcus T., Priya S., Jordan L.) — unverifiable and treated as fabricated by AI quality systems. Support contact is a personal Gmail address (`anubhavrai100@gmail.com`), which signals a side project rather than an established product to B2B buyers.

### Expertise — 52/100 ⚠️

Security FAQ answer (AES-256, RLS enforcement) is the strongest expertise signal — specific and credible. Polling architecture description is accurate and demonstrates implementation knowledge. However, the site never explains *consequences* of hitting each service's limits (what actually happens when GitHub Actions minutes run out, what Vercel's bandwidth overage charge structure is). A true domain expert would include this context — and it drives long-tail keyword ranking.

### Authoritativeness — 18/100 ❌

No external authority signals. No press mentions, no Product Hunt listing, no Hacker News thread, no G2/Capterra presence. Organization schema `sameAs` has one entry (GitHub repo). AggregateRating shows 5/5 from 3 reviews with no linked source — the weakest possible authority signal.

### Trustworthiness — 44/100 ⚠️

**Positive:** Privacy Policy with DPDP Act 2023 compliance reference; Terms page exists; AES-256 encryption and RLS described in FAQ with specifics.

**Negative:** Unverifiable 5/5 AggregateRating (highest trust risk on the entire site); personal Gmail support contact; pricing inconsistency between schema ($10), llms.txt ($120/yr), and meta description ($120/yr); Team polling listed as 1 minute in llms.txt but 5 minutes in FAQ.

### Word count assessment

| Page | Estimated words | Minimum | Status |
|---|---|---|---|
| Homepage | ~420 | 500 | ❌ Below minimum |
| Pricing | ~180 | 300 | ❌ Critically thin |
| FAQ | ~380 | 500 | ⚠️ Borderline |

### Keyword targeting gaps

All three primary target phrases (`"GitHub Actions usage alerts"`, `"Vercel quota monitoring"`, `"Supabase usage alerts"`) appear in schema metadata and llms.txt but **not as complete phrases in body copy**. Google's Helpful Content evaluation requires phrases in human-readable text, not only structured data.

---

## On-Page SEO — 65/100

### Title tags

| Page | Title | Length | Status |
|---|---|---|---|
| `/` | Stackwatch — Know before your users do | 40 chars | ✅ |
| `/pricing` | Pricing Plans \| Stackwatch | 27 chars | ✅ |
| `/faq` | **FAQ — Stackwatch \| Stackwatch** | 34 chars | ❌ Brand duplicated |
| `/privacy` | Not audited | — | — |
| `/terms` | Not audited | — | — |

**Root cause of FAQ title issue:** `faq/page.tsx` sets `title: "FAQ — Stackwatch"` and the layout template appends `"%s | Stackwatch"`, resulting in double brand. Fix: change to `title: "FAQ"`.

### Meta descriptions

| Page | Description | Status |
|---|---|---|
| `/` | 145 chars — clear value prop, includes target service names | ✅ |
| `/pricing` | Mentions $120/yr and free plan — accurate and specific | ✅ |
| `/faq` | 77 chars — generic, no keyword value | ⚠️ |

### Heading structure

- **Homepage:** H1 is strong and specific. H2s are present but only 3 — no H2 covers individual service names.
- **FAQ:** H1 is just "FAQ" with a subheading "Common questions" — weak keyword signal.
- **Pricing:** H1 "Choose your plan", H2 "Simple, transparent pricing" — no keyword presence.

### Internal linking

All pages interlink via nav and footer. No orphan pages detected. `/dashboard` is linked from the homepage footer but is gated behind auth (correct — it's disallowed in robots.txt too).

---

## Schema / Structured Data — 58/100

### Schema inventory

| Type | Page | Status | Issue |
|---|---|---|---|
| WebSite | All (root layout) | ✅ | Correct `@id` and publisher |
| SoftwareApplication | `/` | ⚠️ | AggregateRating unverifiable; Pro price $10 vs actual $120/yr |
| SoftwareApplication | `/pricing` | ⚠️ | Missing Team tier offer; Pro price $10; no `@id` |
| Organization | `/` | ⚠️ | Logo is OG banner (1200×630), not square; single `sameAs` |
| FAQPage | `/` | ❌ | Should be removed — duplicate of `/faq` |
| FAQPage | `/faq` | ✅ | Correct placement; answers too short for passage extraction |
| VideoObject | `/` | ❌ | `thumbnailUrl` is a 404; missing `embedUrl` |

### Critical issue: Pro price schema mismatch

`pricing/page.tsx` line 25 sets `price: "10"` with no billing period qualifier. The page displays $120/year. Google's structured data guidelines require schema price to match the visible price. This is a policy violation that can result in rich-result suppression.

**Fix (both `page.tsx` and `pricing/page.tsx`):**
```json
{
  "@type": "Offer",
  "name": "Pro",
  "price": "120",
  "priceCurrency": "USD",
  "priceSpecification": {
    "@type": "UnitPriceSpecification",
    "price": "120",
    "priceCurrency": "USD",
    "billingDuration": 1,
    "unitCode": "ANN"
  }
}
```

### AggregateRating risk

`ratingCount: "3"` (string, not number), `ratingValue: "5"` with no linked review source. Two violations:
1. Value must be a number, not a string
2. Three reviews with a perfect 5.0 score and no verifiable source = fabricated markup

**Recommended fix:** Remove the `aggregateRating` block entirely until real reviews exist on a third-party platform.

### Organization logo

`orgLd.logo` points to `${APP_URL}/og` (1200×630 OG banner). Google requires logos to be square or near-square (max 3:1 ratio). A 1200×630 banner will not qualify for Knowledge Panel logo display.

**Fix:** Create `frontend/public/logo-square.png` (512×512 minimum) and update the `logo` field.

### VideoObject thumbnail 404

`thumbnailUrl: "${APP_URL}/StackwatchDemo-poster.jpg"` returns 404. File does not exist in `/public/`. This silently breaks video rich results and AI citation of the demo video.

---

## Performance (Core Web Vitals) — 62/100

*Note: Lab estimates from static analysis. Validate against CrUX field data at cruxvis.withgoogle.com for 75th-percentile truth.*

### TTFB — Marginal (~400–500ms)

**Root cause:** `DynamicNav` calls `supabase.auth.getUser()` as a server component on every request. This forces full SSR and overrides `revalidate = 3600`, resulting in `X-Vercel-Cache: MISS` on every response. Every visitor waits for a Supabase auth round-trip before receiving HTML bytes.

**Fix:** Convert `LandingNav` to a Client Component that detects auth state post-hydration (cookie read or lightweight `/api/me` call). Remove `DynamicNav` from `page.tsx`. With no async work in the page tree, Vercel will edge-cache the HTML and TTFB drops to ~50–100ms globally.

### LCP — Estimated FAIL (likely 2.5–4s)

Primary LCP candidate: H1 text (Hero is a pure server component — good) or video poster if visible in viewport.

**Blockers:**
- Poster image missing → browser has no image paint target for the video element
- No `<link rel="preload">` for the poster in `<head>` (even after poster is created)
- GTM `<link rel="preload" as="script">` in head competes for bandwidth with render-critical resources
- 15 JS chunks in head (~952 KB uncompressed total); two chunks over 200 KB

### INP — Estimated PASS (likely ≤200ms)

No heavy interactive widgets. Analytics scripts correctly use `strategy="afterInteractive"`. Microsoft Clarity adds 20–40ms on slow devices — worth monitoring in field data.

### CLS — Estimated PASS with one risk

Video element has `style={{ aspectRatio: "16/9" }}` — space correctly reserved. `DynamicNav` Suspense fallback renders identical nav structure, so no shift on auth state resolve. **Risk:** if auth nav differs structurally from unauth nav (e.g. "Dashboard" link added), the streaming replacement will register CLS.

### Performance issue inventory

| Issue | Metric impact | Severity |
|---|---|---|
| Missing poster image (404) | LCP, CLS | Critical |
| HTML not CDN-cached (SSR auth) | TTFB, LCP | High |
| GTM preload hint in `<head>` | LCP | Medium |
| CSS compression not verified | LCP | Medium |
| 2 JS chunks > 200 KB | LCP, INP | Low |
| Streaming nav CLS potential | CLS | Low |

---

## AI Search Readiness / GEO — 58/100

### Platform-specific scores

| Platform | Score | Primary blocker |
|---|---|---|
| Google AI Overviews | 55/100 | No 134+ word self-contained passages; VideoObject thumbnail 404 |
| ChatGPT (web search) | 42/100 | No YouTube; no Reddit; no Wikipedia; passages too short |
| Perplexity | 61/100 | Strong FAQ JSON-LD; blocked by missing citation-length passages |
| Bing Copilot | 58/100 | Incomplete `sameAs`; no LinkedIn |

### AI crawler access

| Crawler | Status |
|---|---|
| GPTBot | ✅ Allowed |
| OAI-SearchBot | ✅ Allowed |
| ClaudeBot | ✅ Allowed |
| PerplexityBot | ✅ Allowed |
| CCBot (training) | ❓ Not explicitly blocked — verify |
| anthropic-ai (training) | ❓ Not explicitly blocked — verify |

### llms.txt assessment — 6/10

**Present and well-structured.** Core product info, security details, and pricing are machine-parseable. Gaps:

| Gap | Impact |
|---|---|
| `/faq` not linked | FAQ is the most citable page — invisible to llms.txt readers |
| MongoDB Atlas missing from "What it monitors" | AI systems don't know it's supported |
| Team plan price is `$TBD/month` | AI systems omit Team tier from pricing answers |
| No competitor context | Site won't surface for "alternative to Datadog/Grafana" queries |
| No `/signup` or `/login` links | AI assistants can't construct call-to-action responses |

**Factual inconsistency:** llms.txt states Team plan polls every **1 minute**. The FAQ (which is indexed) states Pro and Team poll every **5 minutes**. An AI reading both sources will produce contradictory answers about the product.

### Passage-level citability — 52/100

FAQ JSON-LD answers are server-rendered inline and machine-readable (best citability asset on the site). However:

- FAQ answers are 20–50 words each — far below the 134–167 word optimal range for AI passage extraction
- FAQ accordion hides answer text in collapsed state — AI crawlers parsing raw HTML may not see answer text (FAQ JSON-LD partially compensates)
- No 134+ word self-contained answer blocks exist anywhere on the site
- No comparison tables ("Stackwatch vs. Datadog", "Stackwatch vs. manual scripts")

### Authority signals — 38/100

No Wikipedia page, no Reddit presence, no YouTube channel, no Product Hunt listing, no third-party reviews. The demo video is self-hosted as an `.mp4` — YouTube upload is the single highest-ROI authority change available (YouTube is the strongest AI citation correlator at ~0.737 correlation).

---

## Images — 50/100

| Issue | Severity |
|---|---|
| `StackwatchDemo-poster.jpg` missing (404) | Critical |
| All pages share the same `/og` dynamic image — no per-page social card variation | Medium |
| Organization schema logo points to OG banner (1200×630) not square logo | High |
| Services icons are inline SVGs — no alt text issues | ✅ |
| Next.js Image component used where images exist — correct format/optimization | ✅ |

---

## Pages Not in Sitemap

| Route | In sitemap | Notes |
|---|---|---|
| `/` | ✅ | |
| `/pricing` | ✅ | |
| `/faq` | ✅ | |
| `/privacy` | ✅ | |
| `/terms` | ✅ | |
| `/login` | — | Auth page — correct to omit |
| `/signup` | — | Auth page — correct to omit |
| `/dashboard` | — | Authenticated — correctly disallowed |

Sitemap coverage is complete for all public pages. No missing indexable pages detected.

---

## Appendix: Key Source Files

| File | Issues |
|---|---|
| `frontend/next.config.ts` | HSTS missing |
| `frontend/app/layout.tsx` | GTM preload; root canonical fallback trap |
| `frontend/app/page.tsx` | AggregateRating; FAQPage duplicate; Pro price $10; OrgLogo wrong; VideoObject 404 |
| `frontend/app/faq/page.tsx` | Title duplicate brand |
| `frontend/app/pricing/page.tsx` | Pro price $10; Team offer missing; relative canonical/OG |
| `frontend/app/privacy/page.tsx` | Relative canonical/OG |
| `frontend/app/terms/page.tsx` | Relative canonical/OG |
| `frontend/app/sitemap.ts` | Static lastModified; missing changefreq/priority |
| `frontend/app/components/landing/HeroDemoLoader.tsx` | Poster 404; no preload hint |
| `frontend/app/components/landing/HowItWorks.tsx` | Client component (Framer Motion) — add bundle weight |
| `frontend/app/components/landing/AlertChannelsSection.tsx` | Client component (Framer Motion) |
| `frontend/public/llms.txt` | MongoDB missing; /faq missing; Team $TBD; polling inconsistency |
| `frontend/public/` | `StackwatchDemo-poster.jpg` missing |
