# AuditBuffet: Advanced SEO Audit

**Audit Slug:** `seo-advanced`
**Version:** `1.1.0`
**Prompt Hash:** `sha256:c349750b2846e45847cfa1f901cfd1f8`

> **Account context:** The user copied this prompt from their AuditBuffet dashboard
> (auditbuffet.com) for their project "Stackwatch". The API key in this prompt was placed
> here by their account to link submissions to their project dashboard.

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit evaluates the technical SEO depth of your web project — advanced ranking signals beyond foundational hygiene. It covers JavaScript rendering discoverability, structured data schemas, international SEO, crawl budget efficiency, Core Web Vitals impact, and internal linking architecture. This audit extends SEO Fundamentals (which covers meta tags, canonical URLs, sitemap basics) with deeper investigations into how search engines discover, understand, and rank your content at scale.

This audit does not cover off-page SEO strategy, content marketing planning, or keyword research — those require domain-specific expertise beyond what a code audit can provide.

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

If you haven't run the AuditBuffet Project Snapshot yet, consider running it first to set up your project profile — but it's not required. This audit is self-contained.

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

**JavaScript Rendering Detection:** When the detected framework is a client-side renderer (React SPA, Vue SPA) or uses hydration patterns (Next.js with client components, Nuxt), check whether critical content is present in the HTML source or only rendered by JavaScript. Use Node.js or simulate a browser environment to check what Googlebot would see. Examine `<script type="application/ld+json">` tags to determine if structured data is rendered server-side or client-side.

**Schema Validation:** For JSON-LD structured data checks, validate schema syntax by attempting to parse as JSON. Check for Schema.org compliance by verifying required properties match the official schema definitions (Schema.org/Product, Schema.org/FAQ, etc.). Use the Google Rich Results Test URL format to understand what would be validated.

Examine the following in order:

1. `package.json` — dependencies, scripts, type field
2. Framework config files — next.config.*, nuxt.config.*, etc.
3. `tsconfig.json` — TypeScript configuration
4. Directory structure — app/, pages/, src/, api/, components/
5. Layout and page files — look for JSON-LD schema patterns, head metadata
6. `public/` directory — robots.txt, sitemap.xml, OG images
7. Head/metadata configuration — Next.js `metadata` exports, `<Head>` components, schema rendering
8. Component files — structured data usage, Core Web Vitals optimization patterns, internal linking
9. Page content and structure — semantic HTML, heading hierarchy, link architecture

---

## Check Definitions

### Category: Structured Data & Schema
**Slug:** `structured-data`
**Weight in overall score:** 0.30

#### Check: Home page, product/service pages, and blog posts include valid JSON-LD structured data
- **ID:** `seo-advanced.structured-data.jsonld-present`
- **Severity:** `critical`
- **What to look for:** Count all `<script type="application/ld+json">` tags across the home page, every product/service listing page, and every blog post or article page. For each tag found, parse the JSON content and verify it contains both a `@context` and `@type` field. If using a client-side SPA, verify schema is rendered server-side by inspecting the raw HTML source before JavaScript execution.
- **Pass criteria:** At least 3 page types (home, product/service, blog) each contain at least 1 valid JSON-LD block with `@context` set to `https://schema.org` and a non-empty `@type` field. Report: "X of Y page types have valid JSON-LD."
- **Fail criteria:** Any of the 3 page types lacks JSON-LD schema, or the JSON-LD present is syntactically invalid (JSON parse error), or `@context` or `@type` is missing.
- **Do NOT pass when:** JSON-LD blocks exist but contain only empty objects `{}` or placeholder values like `"TODO"` or `"Your Company"`.
- **Skip (N/A) when:** The project has no pages matching these categories (e.g., API-only project with no public pages, or a portfolio site with no products, services, or blog).
- **Cross-reference:** For foundational meta tags and canonical URLs that complement structured data, the SEO Fundamentals audit covers these in detail. For schema validation depth, see the `structured-data-valid` check in the Crawlability category.
- **Detail on fail:** Specify which page types lack JSON-LD. Example: `"2 of 3 page types have JSON-LD — product pages lack structured data"` or `"Home page JSON-LD is syntactically invalid (missing closing brace)"`.
- **Remediation:** JSON-LD helps search engines understand your content structure and eligibility for Rich Results. Add `<script type="application/ld+json">` tags to your page `<head>` or body. For Next.js in `app/page.tsx`:

  ```tsx
  // app/page.tsx
  import { Metadata } from 'next'

  export const metadata: Metadata = {
    other: {
      'ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Your Company',
        url: 'https://yoursite.com',
        logo: 'https://yoursite.com/logo.png',
      }),
    },
  }
  ```

  Or use a dedicated schema library like `next-seo` or manually render `<script>` tags in your `app/layout.tsx`.

#### Check: All JSON-LD Schema.org types match page content with critical properties present
- **ID:** `seo-advanced.structured-data.schema-completeness`
- **Severity:** `high`
- **What to look for:** Enumerate every JSON-LD block found across the site. For each block, verify the `@type` is appropriate for the page content (e.g., Product for product pages, BlogPosting for blog posts, Organization for home page). Count the critical properties present: `name`, `description`, and `url` must exist for most schema types. Check that no generic `Thing` type is used where a more specific type (Product, BlogPosting, Article) would apply.
- **Pass criteria:** All JSON-LD schema types are content-appropriate for their pages, and at least 3 critical properties (`name`, `description`, `url`) are present in every schema object. No generic `Thing` types where a more specific type applies. Report: "X of Y schema blocks have complete critical properties."
- **Fail criteria:** Schema type is generic or mismatched (e.g., Product schema on a blog post), or fewer than 3 critical properties are present in any schema object.
- **Do NOT pass when:** Schema types technically match but required sub-properties are empty strings or contain only whitespace.
- **Skip (N/A) when:** No JSON-LD schema is present on any page (covered by the `jsonld-present` check).
- **Cross-reference:** For schema syntax validation and parsing errors, see the `structured-data-valid` check in the Crawlability category.
- **Detail on fail:** Name the pages and issues. Example: `"Blog post uses generic 'Thing' type instead of 'BlogPosting'; 'description' property missing from Product schema on /products/item1"`.
- **Remediation:** Each schema type has required and recommended properties per the Schema.org specification. Update your JSON-LD blocks in `app/page.tsx` or the relevant page component. For BlogPosting:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Article Title",
    "description": "A brief summary of the article",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "image": "https://yoursite.com/image.jpg"
  }
  ```

#### Check: BreadcrumbList schema present on hierarchical pages
- **ID:** `seo-advanced.structured-data.breadcrumb-list`
- **Severity:** `high`
- **What to look for:** Count all pages with hierarchical URLs containing at least 2 path segments (e.g., `/products/category/item`). For each, check for BreadcrumbList schema with an `itemListElement` array where every level includes `position`, `name`, and `item` (URL). Verify at least 3 properties per ListItem element and that the breadcrumb hierarchy matches the URL structure.
- **Pass criteria:** At least 90% of pages with hierarchical URL structures include BreadcrumbList schema with complete `itemListElement` arrays containing `position`, `name`, and `item` for each level. Report: "X of Y hierarchical pages have BreadcrumbList schema."
- **Fail criteria:** Fewer than 90% of hierarchical pages have BreadcrumbList schema, or the breadcrumb list is incomplete (missing `position`, `name`, or `item` on any level).
- **Skip (N/A) when:** The site has a flat structure with no hierarchical URLs (all pages at one level, e.g., `/about`, `/blog`, `/contact`).
- **Cross-reference:** For overall site navigation structure and link depth, see the `page-reachability` check in the Link Architecture category.
- **Detail on fail:** `"3 of 8 hierarchical pages lack BreadcrumbList schema"` or `"BreadcrumbList present but itemListElement array missing 'item' property on level 2"`.
- **Remediation:** BreadcrumbList schema helps search engines understand your site structure and enables breadcrumb Rich Results. Add it to hierarchical page components or in `app/[category]/[item]/page.tsx`:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://yoursite.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://yoursite.com/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Current Item",
        "item": "https://yoursite.com/products/item"
      }
    ]
  }
  ```

#### Check: FAQ pages include FAQPage schema with questions and answers
- **ID:** `seo-advanced.structured-data.faq-schema`
- **Severity:** `medium`
- **What to look for:** Count all FAQ pages or sections that display question-and-answer content. For each, check for FAQPage schema with a `mainEntity` array of Question objects containing at least `name` (question text) and `acceptedAnswer` (answer text). Before evaluating, extract and quote the first 2 visible FAQ questions from the page, then verify they appear in the schema `mainEntity` array.
- **Pass criteria:** Every FAQ page or section with at least 1 visible Q&A pair includes FAQPage schema where at least 90% of visible questions have matching `mainEntity` entries with `name` and `acceptedAnswer` properties that match the visible page content.
- **Fail criteria:** FAQ pages lack FAQPage schema entirely, or the schema exists but fewer than 90% of visible questions have matching `mainEntity` entries.
- **Skip (N/A) when:** The project has no dedicated FAQ page or section with visible question-and-answer content.
- **Detail on fail:** `"FAQ page has 8 visible questions but FAQPage schema contains only 3"` or `"FAQPage schema present but answer text differs from visible content"`.
- **Remediation:** FAQPage schema enables FAQ Rich Results in search. Add it to FAQ page components or in `app/faq/page.tsx`:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is your return policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer 30-day returns with original receipt."
        }
      }
    ]
  }
  ```

#### Check: Review and rating pages include Review or AggregateRating schema
- **ID:** `seo-advanced.structured-data.review-schema`
- **Severity:** `medium`
- **What to look for:** Count all pages that display visible reviews, star ratings, or numeric ratings. For each page, check for Review or AggregateRating schema. Enumerate the required properties: `author`, `ratingValue` (numeric), `bestRating`, and `reviewBody` (for Review) or `ratingCount` and `ratingValue` (for AggregateRating).
- **Pass criteria:** At least 90% of pages displaying visible reviews or ratings include Review or AggregateRating schema with at least 3 required properties present (`author`, `ratingValue`, and `reviewBody` for Review; or `ratingValue`, `ratingCount`, and `bestRating` for AggregateRating). Report: "X of Y review pages have complete schema."
- **Fail criteria:** Fewer than 90% of review pages have schema, or schema is missing more than 1 required property.
- **Skip (N/A) when:** The project has no user reviews or ratings displayed on any page.
- **Detail on fail:** `"2 of 5 product pages with star ratings lack AggregateRating schema"` or `"Review schema missing 'author' property on 3 pages"`.
- **Remediation:** Review and rating schemas enable star ratings in search results. Add to product page components in `app/products/[slug]/page.tsx`:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": "Jane Reviewer"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": "Great product, highly recommend!",
    "itemReviewed": {
      "@type": "Product",
      "name": "Product Name"
    }
  }
  ```

#### Check: Organization schema on home page with contact and social profiles
- **ID:** `seo-advanced.structured-data.organization-schema`
- **Severity:** `low`
- **What to look for:** Count the Organization schema properties on the home page. Enumerate which of these 4 required properties are present: `name`, `url`, `logo`, and `sameAs` (social profile links array with at least 1 entry).
- **Pass criteria:** Home page includes Organization schema with all 4 required properties (`name`, `url`, `logo`, `sameAs`) present and non-empty, and `sameAs` contains at least 1 valid social profile URL.
- **Fail criteria:** Organization schema is missing entirely, or fewer than 4 required properties are present, or `sameAs` array is empty.
- **Skip (N/A) when:** The project is a personal/portfolio site without organizational identity, or an API-only project with no public home page.
- **Detail on fail:** `"Organization schema on home page has 2 of 4 required properties — missing 'logo' and 'sameAs'"`.
- **Remediation:** Organization schema helps search engines associate your business identity. Add to `app/page.tsx` or `app/layout.tsx`:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Your Company",
    "url": "https://yoursite.com",
    "logo": "https://yoursite.com/logo.png",
    "sameAs": [
      "https://twitter.com/yourcompany",
      "https://linkedin.com/company/yourcompany"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+1-555-123-4567",
      "email": "support@yoursite.com"
    }
  }
  ```

#### Check: LocalBusiness schema on local business pages with address and hours
- **ID:** `seo-advanced.structured-data.local-business-schema`
- **Severity:** `low`
- **What to look for:** Count all location or business pages. For each, enumerate the LocalBusiness schema properties present: `name`, `address` (with `streetAddress`, `addressLocality`, `addressRegion`, `postalCode`), `telephone`, and `openingHoursSpecification`. At least 3 top-level properties must be present.
- **Pass criteria:** Every local business or location page includes LocalBusiness schema with at least 3 of the 4 required properties (`name`, `address`, `telephone`, `openingHoursSpecification`) present and non-empty. Report: "X of Y location pages have LocalBusiness schema."
- **Fail criteria:** LocalBusiness schema is missing entirely, or fewer than 3 required properties are present on any location page.
- **Skip (N/A) when:** The project is not a local business or has no location-specific pages (e.g., SaaS product, online-only service).
- **Detail on fail:** `"Location pages have LocalBusiness schema with 2 of 4 required properties — missing 'openingHoursSpecification' and 'telephone'"`.
- **Remediation:** LocalBusiness schema enables local search results and knowledge panel features. Add to location page components in `app/locations/[slug]/page.tsx`:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Your Business",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main St",
      "addressLocality": "Springfield",
      "addressRegion": "IL",
      "postalCode": "62701"
    },
    "telephone": "+1-555-123-4567",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Monday",
        "opens": "09:00",
        "closes": "17:00"
      }
    ]
  }
  ```

#### Check: VideoObject schema on pages with embedded videos
- **ID:** `seo-advanced.structured-data.video-schema`
- **Severity:** `low`
- **What to look for:** Count all pages containing `<video>` tags, `<iframe>` embeds to YouTube/Vimeo, or other embedded video players. For each page with video content, check for VideoObject schema and enumerate these 5 required properties: `name`, `description`, `thumbnailUrl`, `uploadDate`, and `duration` (ISO 8601 format).
- **Pass criteria:** At least 90% of pages with embedded videos include VideoObject schema with at least 4 of 5 required properties (`name`, `description`, `thumbnailUrl`, `uploadDate`, `duration`) present and non-empty. Report: "X of Y video pages have VideoObject schema."
- **Fail criteria:** Fewer than 90% of video pages have VideoObject schema, or schema has fewer than 4 required properties.
- **Skip (N/A) when:** The project has no embedded videos on any page.
- **Detail on fail:** `"2 of 4 video pages lack VideoObject schema"` or `"Schema present but missing 'thumbnailUrl' and 'duration' on 3 pages"`.
- **Remediation:** VideoObject schema enables video Rich Results and video sitemaps. Add to video page components or in `app/videos/[slug]/page.tsx`:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Video Title",
    "description": "Brief description of the video",
    "thumbnailUrl": "https://yoursite.com/video-thumb.jpg",
    "uploadDate": "2024-01-15T10:00:00Z",
    "duration": "PT5M30S",
    "contentUrl": "https://yoursite.com/video.mp4"
  }
  ```

---

### Category: Crawlability & Indexation
**Slug:** `crawlability`
**Weight in overall score:** 0.25

#### Check: Critical content accessible to Googlebot; no cloaking between bot and users
- **ID:** `seo-advanced.crawlability.no-cloaking`
- **Severity:** `critical`
- **What to look for:** Enumerate all pages that render critical content (product descriptions, article text, pricing information). For each page, check whether the content is present in the raw HTML source before JavaScript execution. Count all instances of user-agent detection patterns (e.g., `navigator.userAgent`, `req.headers['user-agent']` comparisons, bot-detection middleware) and any conditional rendering that serves different content to bots vs. users.
- **Pass criteria:** At least 90% of critical content is present in server-rendered HTML source or uses SSR/SSG rendering that Googlebot can index. Zero user-agent detection patterns that serve different content to bots and users. Report: "X of Y critical pages have server-rendered content; 0 cloaking patterns found."
- **Fail criteria:** More than 10% of critical content is only rendered client-side with JavaScript that Googlebot may not execute, or at least 1 user-agent-based cloaking pattern detected.
- **Do NOT pass when:** Content appears server-rendered but uses `display:none` or `visibility:hidden` CSS that hides it from users while showing it to crawlers — this is reverse cloaking.
- **Skip (N/A) when:** The project is a fully static site (no JavaScript-heavy content) generated at build time.
- **Cross-reference:** For JavaScript bundle optimization that affects crawler rendering, the Performance Deep Dive audit covers bundle analysis in detail.
- **Detail on fail:** `"Product description rendered only after JavaScript loads — not present in HTML source for Googlebot"` or `"1 user-agent detection pattern in middleware serves minimal content to search engines"`.
- **Remediation:** Googlebot can execute JavaScript, but cloaking violates search engine guidelines. Render critical content server-side in `app/products/[slug]/page.tsx`:

  ```tsx
  // Server Component — content is in HTML source
  export default function ProductPage() {
    return (
      <div>
        <h1>Product Name</h1>
        <p>This description is in the HTML source.</p>
      </div>
    )
  }
  ```

#### Check: Crawl budget managed; no infinite scroll or session IDs in URLs
- **ID:** `seo-advanced.crawlability.crawl-budget`
- **Severity:** `high`
- **What to look for:** Count all infinite scroll implementations, faceted navigation patterns, and URL parameters containing session IDs (JSESSIONID, sid, PHPSESSID, etc.). Enumerate every route that could generate duplicate crawlable URLs. Check whether faceted pages use `noindex`, `canonical`, or URL parameter handling to prevent crawl waste.
- **Pass criteria:** Zero infinite scroll patterns that create duplicate crawlable URLs. All faceted navigation routes use `noindex` or `canonical` tags. Zero session IDs appear in any URL query parameters. Report even on pass: "X faceted routes found, all with crawl controls; 0 session ID patterns detected."
- **Fail criteria:** At least 1 infinite scroll creates duplicate URLs, or at least 1 session ID in URLs, or faceted pages crawlable as separate URLs without `noindex`/`canonical` controls.
- **Skip (N/A) when:** The project has no pagination, infinite scroll, or faceted navigation patterns.
- **Detail on fail:** `"Search results page uses faceted filters; 12 filter combinations crawlable as separate URLs without noindex"` or `"Session ID (JSESSIONID) appears in URL query parameters on 3 routes"`.
- **Remediation:** Crawl budget is finite. Manage faceted navigation with canonicals or noindex in `app/products/page.tsx`:

  ```tsx
  // For faceted navigation, noindex filter combinations:
  export const metadata = {
    robots: {
      index: !hasActiveFilters,  // noindex if filters active
    },
  }

  // Use rel=next/prev for pagination in app/products/page.tsx:
  export const metadata = {
    other: {
      'rel-next': 'https://yoursite.com/products?page=2',
      'rel-prev': 'https://yoursite.com/products?page=1',
    },
  }
  ```

#### Check: Paginated content uses rel=next/prev or canonicalizes to page 1
- **ID:** `seo-advanced.crawlability.pagination`
- **Severity:** `high`
- **What to look for:** Count all paginated routes (pages with `?page=2`, `?page=3`, etc. or `/page/2`, `/page/3` patterns). For each paginated route, check for `<link rel="next">` and `<link rel="prev">` tags, or canonical URLs pointing to page 1 for consolidation. Enumerate which strategy is used on each route.
- **Pass criteria:** At least 90% of paginated routes use a consistent pagination strategy (either rel=next/prev links or canonical to page 1). Users can navigate through all pages and crawlers understand the pagination structure. Report: "X of Y paginated routes have pagination markup."
- **Fail criteria:** Fewer than 90% of paginated routes have rel=next/prev or canonical strategy, or paginated pages are treated as separate indexable content without consolidation.
- **Skip (N/A) when:** The project has no paginated content (no routes with page parameters or pagination UI).
- **Detail on fail:** `"3 of 5 paginated routes lack rel=next/prev — /products?page=2, /products?page=3, /blog?page=2 are canonicalized separately"`.
- **Remediation:** Use pagination markup in `app/products/page.tsx` or whichever route handles pagination:

  ```tsx
  export const metadata = {
    other: {
      'rel-next': page < totalPages ? `https://yoursite.com/products?page=${page + 1}` : undefined,
      'rel-prev': page > 1 ? `https://yoursite.com/products?page=${page - 1}` : undefined,
    },
  }
  ```

#### Check: No redirect chains longer than one hop
- **ID:** `seo-advanced.crawlability.redirect-chains`
- **Severity:** `high`
- **What to look for:** Count all redirect rules defined in framework config (`next.config.js` `redirects()`, `vercel.json`, `.htaccess`, middleware). For each redirect, follow the chain and count the number of hops. Enumerate every redirect that uses temporary status codes (302, 307) instead of permanent (301, 308). Verify no more than 1 hop exists in any chain.
- **Pass criteria:** Zero redirect chains with more than 1 hop. At least 90% of redirects use permanent status codes (301 or 308). All redirect destinations return a 200 response. Report: "X redirects found, 0 chains, Y of X use permanent codes."
- **Fail criteria:** At least 1 redirect chain with more than 1 hop exists, or more than 10% of redirects use temporary codes (302, 307), or any redirect destination returns an error.
- **Skip (N/A) when:** The project has no redirects defined (fresh project without URL migrations).
- **Detail on fail:** `"Old URL redirects through 2 hops: /old-product -> /product -> /products/item"` or `"3 of 8 redirects use 302 (temporary) instead of 301 (permanent)"`.
- **Remediation:** Minimize redirects and use permanent codes. In `next.config.js`:

  ```tsx
  // next.config.js
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true, // 301
      },
    ]
  }
  ```

#### Check: Structured data validated; no syntax errors or missing required properties
- **ID:** `seo-advanced.crawlability.structured-data-valid`
- **Severity:** `high`
- **What to look for:** Count all JSON-LD blocks across the site. For each block, attempt to parse as JSON and enumerate any syntax errors found. For each valid block, count the required properties per Schema.org type and verify no generic fallback types (e.g., `Thing`) are used where specific types apply.
- **Pass criteria:** 100% of JSON-LD blocks are syntactically valid JSON with zero parse errors. Required properties are present per type for at least 90% of blocks. No generic `Thing` types where specific types apply. Report: "X JSON-LD blocks validated, 0 syntax errors, Y of X have complete required properties."
- **Fail criteria:** At least 1 JSON syntax error in any block, or more than 10% of blocks missing required properties, or generic `Thing` type used on a page with identifiable specific content type.
- **Skip (N/A) when:** No JSON-LD schema present on any page.
- **Detail on fail:** `"Product schema JSON on /products/item1 is missing 'url' property"` or `"Invalid JSON in BlogPosting schema on /blog/post-3 (unterminated string)"`.
- **Remediation:** Validate schema using the Google Rich Results Test or schema.org validator. Fix syntax errors in the JSON-LD blocks in your page components (e.g., `app/blog/[slug]/page.tsx`).

#### Check: XML sitemap includes all indexable pages; noindex pages excluded
- **ID:** `seo-advanced.crawlability.sitemap-completeness`
- **Severity:** `medium`
- **What to look for:** Count all indexable public pages by scanning the route structure. Count all URLs in `sitemap.xml` (or sitemap index). Compare the two lists: enumerate pages missing from the sitemap and pages in the sitemap that have `noindex` meta tags. At least 95% coverage is required.
- **Pass criteria:** Sitemap includes at least 95% of indexable public pages. Zero noindex pages appear in the sitemap. Sitemap is valid XML with no parsing errors. Report: "Sitemap contains X of Y indexable pages (Z% coverage)."
- **Fail criteria:** Sitemap covers fewer than 95% of indexable pages, or at least 1 noindex page is included in the sitemap, or sitemap has XML parsing errors.
- **Skip (N/A) when:** No `sitemap.xml` or `app/sitemap.ts` exists (sitemap presence is covered by SEO Fundamentals).
- **Detail on fail:** `"Sitemap contains 50 of 65 indexable pages (77% coverage) — missing /blog, /pricing, and 13 product pages"` or `"Sitemap includes 2 /admin pages which have noindex meta tags"`.
- **Remediation:** Regenerate sitemap to include all public routes. Use a dynamic sitemap in `app/sitemap.ts`:

  ```ts
  // app/sitemap.ts
  export default function sitemap() {
    return [
      { url: 'https://yoursite.com', lastModified: new Date() },
      { url: 'https://yoursite.com/about', lastModified: new Date() },
      // ... dynamically generated from your pages
    ]
  }
  ```

#### Check: Robots.txt accessible and doesn't block Googlebot from content, CSS, or JS
- **ID:** `seo-advanced.crawlability.robots-txt-open`
- **Severity:** `medium`
- **What to look for:** Read the `public/robots.txt` file. Count all `Disallow` rules. For each rule, verify it does not block content paths, CSS files, JavaScript files, or images needed for rendering. Enumerate any rules that block Googlebot specifically (via `User-agent: Googlebot` sections).
- **Pass criteria:** robots.txt exists in `public/robots.txt`, is parseable, has no more than 20 `Disallow` rules total, and zero of those rules block Googlebot from indexable content, CSS (`/_next/static/`), or JavaScript paths. Report: "robots.txt has X Disallow rules; 0 block essential resources."
- **Fail criteria:** Googlebot is blocked from indexable content, CSS, or JS by any `Disallow` rule, or robots.txt is missing or unparseable.
- **Skip (N/A) when:** No `public/robots.txt` file exists and no `app/robots.ts` generates one.
- **Detail on fail:** `"robots.txt has 4 Disallow rules; 1 blocks /assets/ path, preventing CSS and JS rendering"`.
- **Remediation:** Ensure `public/robots.txt` allows crawling of essential resources:

  ```
  User-agent: *
  Allow: /
  Disallow: /admin
  Disallow: /private

  Allow: /assets/
  Allow: /scripts/

  Sitemap: https://yoursite.com/sitemap.xml
  ```

#### Check: No unintended noindex tags or X-Robots-Tag headers on indexable pages
- **ID:** `seo-advanced.crawlability.no-unintended-noindex`
- **Severity:** `medium`
- **What to look for:** Count all occurrences of `robots: { index: false }`, `<meta name="robots" content="noindex">`, and `X-Robots-Tag: noindex` across every page component and middleware. For each occurrence, check whether it is guarded by an environment check (e.g., `process.env.NODE_ENV !== 'production'`). Enumerate any noindex directives on production public pages.
- **Pass criteria:** Zero `noindex` directives exist on production public pages. Any `noindex` usage is guarded by environment checks or applies only to legitimately non-indexable pages (admin, auth). Report: "X noindex directives found; 0 affect production public pages."
- **Fail criteria:** At least 1 unintended `noindex` directive on a production public page without an environment guard.
- **Do NOT pass when:** A `noindex` directive is present in a shared layout component (e.g., `app/layout.tsx`) that applies to all pages, even if individual pages don't explicitly set it.
- **Skip (N/A) when:** Never — accidental noindex is a critical indexation issue that must always be checked.
- **Detail on fail:** `"Blog listing page in app/blog/page.tsx has robots: { index: false } without environment check"`.
- **Remediation:** Remove unintended noindex and add environment checks. In `app/blog/page.tsx` or the affected page component, ensure noindex is conditional on environment.

#### Check: International SEO hreflang tags implemented correctly
- **ID:** `seo-advanced.crawlability.hreflang-implementation`
- **Severity:** `info`
- **What to look for:** Count all language or region variants served by the site (e.g., `/en/`, `/fr/`, `/de/` routes or locale subdomains). For each page with language variants, check for `<link rel="alternate" hreflang="...">` tags or hreflang attributes in the XML sitemap. Verify `x-default` is specified for the default language version. Enumerate the hreflang tags found per page.
- **Pass criteria:** For multilingual/multi-regional sites, at least 90% of pages with language variants include hreflang tags listing all available languages, plus an `x-default` tag for the default version. Report: "X language variants detected; Y of Z pages have complete hreflang tags."
- **Fail criteria:** Fewer than 90% of multilingual pages have hreflang tags, or `x-default` is missing from any page with hreflang tags.
- **Skip (N/A) when:** Site serves only 1 language and 1 geographic region (no locale routes, no language subdomains).
- **Detail on fail:** `"Site has /en and /fr versions; 5 of 12 pages lack hreflang tags"` or `"hreflang tags present on all pages but x-default not specified on 3 pages"`.
- **Remediation:** Add hreflang tags to multilingual pages in `app/[locale]/layout.tsx`:

  ```tsx
  export const metadata = {
    alternates: {
      languages: {
        en: 'https://yoursite.com/en/page',
        fr: 'https://yoursite.com/fr/page',
        'x-default': 'https://yoursite.com/page',
      },
    },
  }
  ```

#### Check: Structured data Rich Results previews verified
- **ID:** `seo-advanced.crawlability.rich-results-verified`
- **Severity:** `info`
- **What to look for:** Count all pages with Rich Results-eligible schema types (FAQPage, Review, AggregateRating, Product, HowTo, BreadcrumbList). For each eligible page, validate that the schema structure meets Google Rich Results requirements by checking all required properties are present and values are non-empty. Enumerate which pages pass and which fail validation.
- **Pass criteria:** At least 90% of pages with Rich Results-eligible schema types pass structural validation with all required properties present and non-empty. Report: "X of Y Rich Results-eligible pages pass validation."
- **Fail criteria:** Fewer than 90% of eligible schema pages pass Rich Results validation, or schema syntax errors prevent rendering.
- **Skip (N/A) when:** Site has no eligible schema types — no FAQPage, Review, AggregateRating, Product, HowTo, or BreadcrumbList schema.
- **Detail on fail:** `"2 of 5 Rich Results-eligible pages fail validation — FAQPage schema on /faq missing 'acceptedAnswer' property"`.
- **Remediation:** Validate schema using the Google Rich Results Test tool (https://search.google.com/test/rich-results) or Google Search Console. Fix any validation errors in the JSON-LD blocks in your page components (e.g., `app/products/[slug]/page.tsx` or `app/faq/page.tsx`).

---

### Category: Technical SEO Signals
**Slug:** `technical-seo`
**Weight in overall score:** 0.25

#### Check: Key pages meet Core Web Vitals thresholds
- **ID:** `seo-advanced.technical-seo.core-web-vitals`
- **Severity:** `critical`
- **What to look for:** Enumerate at least 3 key page types for testing: home page, a product/service page, and a blog post (if exists). For each page, measure or estimate these 3 Core Web Vitals metrics: LCP (Largest Contentful Paint, threshold no more than 2.5s), INP (Interaction to Next Paint, threshold no more than 200ms), CLS (Cumulative Layout Shift, threshold no more than 0.1). Count how many pages pass all 3 thresholds.
- **Pass criteria:** At least 90% of sampled pages meet all 3 Core Web Vitals thresholds: LCP no more than 2.5s, INP no more than 200ms, CLS no more than 0.1. Report even on pass: "X of Y sampled pages pass all Core Web Vitals — LCP: Zs, INP: Wms, CLS: V."
- **Fail criteria:** More than 10% of sampled pages fail at least 1 Core Web Vitals threshold.
- **Skip (N/A) when:** Unable to run Lighthouse or measure performance metrics (e.g., dev environment only, no staging URL, CLI tool without browser access).
- **Cross-reference:** For deeper performance analysis including bundle size and load waterfall, the Performance Deep Dive audit covers these in detail.
- **Detail on fail:** `"1 of 3 sampled pages fails — home page LCP 3.2s (exceeds 2.5s threshold); blog posts meet targets"`.
- **Remediation:** Core Web Vitals are ranking factors. Optimize in your page components:
  - **LCP:** Use `priority` prop on `next/image` for above-the-fold images in `app/page.tsx`, optimize font loading, cache static assets
  - **INP:** Break up long JavaScript tasks, defer non-critical code with `dynamic(() => import(...), { ssr: false })`
  - **CLS:** Reserve space for images/ads with explicit `width`/`height`, avoid inserting content above existing content

#### Check: Page speed metrics meet thresholds
- **ID:** `seo-advanced.technical-seo.page-speed`
- **Severity:** `medium`
- **What to look for:** For each sampled page, enumerate these 3 metrics: Lighthouse Performance score (target at least 80 desktop, at least 60 mobile), FCP (First Contentful Paint, target under 1.8s), and TBT (Total Blocking Time, target under 300ms). Count how many metrics pass their thresholds across all sampled pages.
- **Pass criteria:** Lighthouse Performance at least 80 on desktop and at least 60 on mobile. FCP under 1.8s and TBT under 300ms on all sampled pages. Report: "Desktop Lighthouse: X, Mobile: Y, FCP: Zs, TBT: Wms."
- **Fail criteria:** Any metric falls below its target threshold on any sampled page.
- **Skip (N/A) when:** Unable to run Lighthouse or measure page speed (dev environment, no browser access).
- **Detail on fail:** `"Desktop Lighthouse 72 (below 80 threshold); mobile 54 (below 60 threshold); TBT 450ms (exceeds 300ms limit)"`.
- **Remediation:** Reduce JavaScript payload in `next.config.js` or component files. Optimize images with `next/image` in `app/page.tsx`. Enable compression and use CDN for static assets:

  ```js
  // next.config.js — enable compression and optimize output
  module.exports = {
    compress: true,
    images: { formats: ['image/avif', 'image/webp'] },
  }
  ```

#### Check: All images have descriptive alt text, semantic filenames, and optimized weight
- **ID:** `seo-advanced.technical-seo.image-optimization`
- **Severity:** `low`
- **What to look for:** Count all `<img>` and `<Image>` components across the codebase. For each, check: (1) alt text is present and descriptive (not empty, not just the filename), (2) filename is semantic (descriptive, not `IMG_1234.jpg` or `screenshot-2024.png`), (3) individual file weight under 1 MB per image. Enumerate the total image weight per page; target no more than 5 MB per page.
- **Pass criteria:** At least 90% of content images have descriptive alt text (minimum 3 words) and semantic filenames. Total page image weight under 5 MB per page. No single image exceeds 1 MB without being optimized. Report: "X of Y images have descriptive alt text; total page weight Z MB."
- **Fail criteria:** More than 10% of images lack alt text or have non-semantic filenames, or total page image weight exceeds 5 MB.
- **Skip (N/A) when:** No images present in any page component.
- **Detail on fail:** `"8 of 24 images lack alt text; 'banner.png' weighs 3.2 MB; total page image weight 6.8 MB (exceeds 5 MB limit)"`.
- **Remediation:** Optimize images with `next/image` in your page components (e.g., `app/page.tsx`), use next-gen formats (WebP/AVIF), add descriptive alt text, and compress.

#### Check: Content Security Policy header present and allows essential resources
- **ID:** `seo-advanced.technical-seo.content-security-policy`
- **Severity:** `low`
- **What to look for:** Count all locations where Content-Security-Policy could be configured: `next.config.js` headers, middleware, `<meta http-equiv="Content-Security-Policy">` tags, and deployment config (`vercel.json`, `netlify.toml`). Enumerate the CSP directives found (e.g., `default-src`, `script-src`, `style-src`). Verify the policy does not block analytics scripts, monitoring tools, or other essential resources.
- **Pass criteria:** CSP header is present in at least 1 configuration location with at least 3 directives defined, and the policy does not block essential external resources (analytics, CDN assets, font providers). Report: "CSP configured with X directives; 0 essential resources blocked."
- **Fail criteria:** No CSP header found in any configuration, or CSP blocks at least 1 essential resource (analytics, CDN, fonts).
- **Skip (N/A) when:** No external resources are loaded by the application (no analytics, no external scripts, no CDN assets).
- **Detail on fail:** `"No Content-Security-Policy header found in next.config.js, middleware, or deployment config"` or `"CSP script-src blocks Google Analytics (*.google-analytics.com not in allowlist)"`.
- **Remediation:** Add CSP header in `next.config.js` headers configuration:

  ```js
  // next.config.js
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' *.google-analytics.com; style-src 'self' 'unsafe-inline'"
      }]
    }]
  }
  ```

#### Check: Google Search Console linked and verified with healthy crawl stats
- **ID:** `seo-advanced.technical-seo.search-console`
- **Severity:** `low`
- **What to look for:** Count all Search Console verification methods present: verification HTML file in `public/` directory (e.g., `public/google*.html`), `google-site-verification` meta tag in `app/layout.tsx` or page metadata, DNS TXT record reference in documentation, or Google Analytics linkage. At least 1 verification method must be present.
- **Pass criteria:** At least 1 Google Search Console verification method is configured in the codebase — either a verification file in `public/`, a `google-site-verification` meta tag, or a documented DNS verification. Report: "X verification methods found."
- **Fail criteria:** Zero Search Console verification methods found in the codebase.
- **Skip (N/A) when:** Project is in development/pre-launch and not yet deployed to a live URL.
- **Detail on fail:** `"No Google Search Console verification meta tag in app/layout.tsx and no verification file in public/"`.
- **Remediation:** Verify site in Google Search Console by adding a meta tag in `app/layout.tsx`:

  ```tsx
  export const metadata = {
    other: {
      'google-site-verification': 'YOUR_VERIFICATION_CODE',
    },
  }
  ```

  Or upload the verification HTML file to `public/googleXXXXXXXXXX.html`.

#### Check: External backlink profile from relevant domains
- **ID:** `seo-advanced.technical-seo.backlink-profile`
- **Severity:** `info`
- **What to look for:** Before evaluating, extract and quote any backlink-related configuration found in the codebase (e.g., disavow files, link monitoring scripts, outreach documentation). Count all external link references pointing to the site if available via tools or user reporting. Evaluate domain relevance, anchor text distribution (natural and keyword-varied), and absence of suspicious spikes from low-quality sources.
- **Pass criteria:** Backlinks come from at least 3 relevant domains with natural anchor text distribution and no suspicious spikes detected in the last 90 days. Report: "X referring domains found; anchor text distribution appears natural."
- **Fail criteria:** Zero backlinks found, or backlinks from irrelevant/low-quality sources, or unnatural anchor text patterns, or sudden spikes (more than 50% increase in a single week).
- **Skip (N/A) when:** Unable to analyze backlinks (no tool access, no user-reported data, or fresh site with no backlinks yet and no `public/disavow.txt` file).
- **Detail on fail:** `"No external backlinks detected from any referring domain"` or `"1000 backlinks added in one week from link farms — unnatural spike"`.
- **Remediation:** Build backlinks organically by creating valuable content. Consider adding a disavow file at `src/config/disavow-domains.txt` for known spam domains:

  ```txt
  # src/config/disavow-domains.txt
  domain:spam-farm-1.com
  domain:link-directory-spam.net
  ```

  Reach out to relevant websites and industry directories to build high-quality backlinks.

#### Check: All images optimized with next-gen formats and fallbacks
- **ID:** `seo-advanced.technical-seo.image-formats`
- **Severity:** `low`
- **What to look for:** Count all image references across the codebase. Enumerate how many use `next/image` (automatic format optimization), `<picture>` elements with `<source>` for format variants, or `srcset` attributes. Count how many use raw `<img>` tags with only legacy formats (JPEG, PNG, GIF). At least 80% should use modern format delivery.
- **Pass criteria:** At least 80% of images use `next/image`, `<picture>` with WebP/AVIF `<source>`, or an image CDN that auto-optimizes formats. No single image exceeds 1 MB without optimization. Report: "X of Y images use modern format delivery."
- **Fail criteria:** Fewer than 80% of images use modern format delivery, or at least 1 image exceeds 1 MB without optimization.
- **Skip (N/A) when:** No images present in any page component.
- **Detail on fail:** `"5 of 20 images use next/image (25%); remaining 15 are raw <img> with JPEG/PNG only"` or `"Banner image 5.2 MB uncompressed without optimization"`.
- **Remediation:** Use `next/image` in your components or a tool like Cloudinary to serve next-gen formats with fallbacks:

  ```tsx
  import Image from 'next/image'

  <Image
    src="/image.webp"
    alt="Description"
    width={800}
    height={600}
    priority
  />
  ```

---

### Category: Content & Link Architecture
**Slug:** `link-architecture`
**Weight in overall score:** 0.20

#### Check: Internal linking hub-and-cluster structure with bidirectional links
- **ID:** `seo-advanced.link-architecture.hub-cluster`
- **Severity:** `high`
- **What to look for:** Count all internal links across hub pages (home, category, main topic pages) and cluster pages (detail pages, blog posts, product pages). For each hub page, count outbound links to cluster pages. For each cluster page, count back-links to hub pages. Enumerate all generic anchor text instances (e.g., "click here", "read more", "learn more", "here") vs. descriptive anchors.
- **Pass criteria:** At least 80% of hub pages link to at least 3 cluster pages. At least 80% of cluster pages link back to at least 1 hub page. No more than 10% of internal links use generic anchor text. Report: "X hub pages link to clusters; Y of Z cluster pages link back; W% generic anchors."
- **Fail criteria:** Fewer than 80% of clusters link back to hubs, or more than 10% of internal links use generic anchor text, or hub pages link to fewer than 3 clusters on average.
- **Skip (N/A) when:** Site is a single-page application with only 1 route.
- **Detail on fail:** `"4 of 12 product pages lack links back to category hubs; 15% of anchor text is generic ('click here', 'more')"`.
- **Remediation:** Design internal linking strategically in your page components:

  ```tsx
  // app/page.tsx — Home page links to category hubs
  <Link href="/products">Browse Our Products</Link>

  // app/products/[slug]/page.tsx — Product page links back with descriptive anchor
  <Link href="/products">Back to Products</Link>
  <Link href="/products/category">View More in This Category</Link>
  ```

#### Check: Blog posts and articles have datePublished and dateModified in schema
- **ID:** `seo-advanced.link-architecture.content-dating`
- **Severity:** `low`
- **What to look for:** Count all blog post and article pages. For each, check the JSON-LD schema or page metadata for `datePublished` and `dateModified` fields. Verify dates are in ISO 8601 format and that `dateModified` is not earlier than `datePublished`. Enumerate which posts have both fields, which have only `datePublished`, and which have neither.
- **Pass criteria:** At least 90% of blog posts include `datePublished` in ISO 8601 format, and at least 50% of posts updated after initial publication include `dateModified`. Dates are chronologically consistent (`dateModified` >= `datePublished`). Report: "X of Y blog posts have datePublished; Z of W updated posts have dateModified."
- **Fail criteria:** Fewer than 90% of blog posts have `datePublished`, or dates are not in ISO 8601 format, or `dateModified` is earlier than `datePublished`.
- **Skip (N/A) when:** Project has no blog or article pages.
- **Detail on fail:** `"3 of 10 blog posts lack datePublished in schema"` or `"dateModified on /blog/post-5 is 2023-01-01, earlier than datePublished 2024-06-15"`.
- **Remediation:** Add date schema to blog post components in `app/blog/[slug]/page.tsx`:

  ```tsx
  export const metadata = {
    other: {
      'ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        datePublished: '2024-01-15T10:00:00Z',
        dateModified: '2024-02-20T15:30:00Z',
      }),
    },
  }
  ```

#### Check: All indexable pages have at least 300 words of original substantive content
- **ID:** `seo-advanced.link-architecture.content-depth`
- **Severity:** `low`
- **What to look for:** Count all indexable public pages. For each page, estimate the word count of the main content area (excluding navigation, header, footer, and sidebar boilerplate). Check for duplicate content by comparing text blocks across pages. Enumerate pages with fewer than 300 words of original substantive content.
- **Pass criteria:** At least 90% of public indexable pages have at least 300 words of original substantive content in the main content area. No more than 10% of content is duplicated verbatim across multiple pages. Report: "X of Y indexable pages have 300+ words of original content."
- **Fail criteria:** More than 10% of indexable pages have fewer than 300 words of original content, or more than 10% of content is duplicated across pages.
- **Skip (N/A) when:** Never — content depth applies to all indexable pages.
- **Detail on fail:** `"5 of 20 product detail pages have only 150 words of unique content"` or `"Same FAQ boilerplate (250 words) copied across 20 pages without variation"`.
- **Remediation:** Expand page content to at least 300 words with unique, valuable information for each page. In product page components (`app/products/[slug]/page.tsx`), add unique descriptions, use cases, and details. Avoid duplicating identical content across multiple pages.

#### Check: No two indexable pages target the same primary keyword
- **ID:** `seo-advanced.link-architecture.keyword-cannibalization`
- **Severity:** `low`
- **What to look for:** Before evaluating, extract and quote the `<title>` tag and first `<h1>` from every indexable page. Count all pages and list their primary keyword/intent (derived from title, meta description, and h1). Enumerate any pages that share the same primary keyword or overlapping search intent.
- **Pass criteria:** Zero pairs of indexable pages target the same primary keyword or search intent. Each page has a distinct primary keyword visible in its title and h1. Report: "X indexable pages analyzed; 0 keyword cannibalization pairs found."
- **Fail criteria:** At least 1 pair of pages targets the same primary keyword or overlapping search intent.
- **Skip (N/A) when:** Never — keyword cannibalization is a common issue that must always be checked.
- **Detail on fail:** `"2 cannibalization pairs found — /resources/seo-guide and /blog/seo-tips both target 'best SEO practices'"`.
- **Remediation:** Consolidate cannibalized pages or give them distinct keywords and intents. In the affected page components, update the `title` and `h1` to target distinct keywords. Use canonical tags in `app/[page]/page.tsx` if consolidation isn't possible.

#### Check: Orphan pages addressed; all indexable pages reachable within 3 clicks from home
- **ID:** `seo-advanced.link-architecture.page-reachability`
- **Severity:** `low`
- **What to look for:** Count all public indexable pages. Map the site's link structure by tracing internal links from the home page. For each page, count the minimum number of clicks required to reach it from home. Enumerate all orphan pages (zero inbound internal links from navigation or content). Target: no more than 3 clicks to reach any page.
- **Pass criteria:** At least 95% of public pages are reachable within 3 clicks from the home page. Zero orphan pages with no inbound internal links. Report: "X of Y pages reachable in 3 clicks or fewer; 0 orphan pages."
- **Fail criteria:** More than 5% of pages require more than 3 clicks to reach, or at least 1 orphan page has zero inbound internal links.
- **Skip (N/A) when:** Never — link structure and reachability applies to all sites with more than 1 page.
- **Detail on fail:** `"5 of 40 pages are orphaned (no navigation links, no internal references); /support/faq requires 4 clicks from home"`.
- **Remediation:** Add navigation links to orphan pages. Restructure navigation in `app/layout.tsx` or `components/nav.tsx` to reduce click depth. Use breadcrumb navigation components for deep hierarchies.

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

**Category Score = ( sum of weights of passing checks ) / ( sum of weights of all applicable checks ) x 100**

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
| A     | 90-100     |
| B     | 75-89      |
| C     | 60-74      |
| D     | 40-59      |
| F     | 0-39       |

Apply the grade to each category score and to the overall score. If a score is `null`, the grade is also `null`.

### Edge Cases

| Scenario | Rule |
|----------|------|
| All checks pass | Score = 100 |
| All checks fail | Score = 0 |
| All checks skip/error | Score = null, Grade = null |
| Fewer than 50% of checks applicable | Include a low-applicability warning in the report noting that the score may not be representative |

### Telemetry Count Verification

After composing the telemetry JSON, derive ALL count fields (`passed`, `failed`, `skipped`, `errored`, and per-category equivalents) by iterating over the `checks` array and counting each result value — do NOT count them independently from memory. Then verify: `passed + failed + skipped + errored == total_checks == len(checks)`.

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
    "slug": "seo-advanced",
    "display_name": "Advanced SEO Audit",
    "version": "1.1.0",
    "prompt_hash": "sha256:995d09708cc204736f80d0a7953c3cba"
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
    "overall_score": 71,
    "overall_grade": "C",
    "total_checks": 30,
    "passed": 16,
    "failed": 8,
    "skipped": 6,
    "errored": 0,
    "categories": [
      {
        "slug": "structured-data",
        "display_name": "Structured Data & Schema",
        "score": 75,
        "grade": "C",
        "weight": 0.30,
        "checks_passed": 5,
        "checks_failed": 2,
        "checks_skipped": 1,
        "checks_errored": 0,
        "checks_total": 8
      },
      {
        "slug": "crawlability",
        "display_name": "Crawlability & Indexation",
        "score": 68,
        "grade": "D",
        "weight": 0.25,
        "checks_passed": 6,
        "checks_failed": 3,
        "checks_skipped": 1,
        "checks_errored": 0,
        "checks_total": 10
      },
      {
        "slug": "technical-seo",
        "display_name": "Technical SEO Signals",
        "score": 72,
        "grade": "C",
        "weight": 0.25,
        "checks_passed": 4,
        "checks_failed": 2,
        "checks_skipped": 1,
        "checks_errored": 0,
        "checks_total": 7
      },
      {
        "slug": "link-architecture",
        "display_name": "Content & Link Architecture",
        "score": 70,
        "grade": "C",
        "weight": 0.20,
        "checks_passed": 4,
        "checks_failed": 1,
        "checks_skipped": 0,
        "checks_errored": 0,
        "checks_total": 5
      }
    ]
  },

  "checks": [
    {
      "id": "seo-advanced.structured-data.jsonld-present",
      "label": "Home page, product/service pages, and blog posts include valid JSON-LD structured data",
      "category_slug": "structured-data",
      "result": "pass",
      "severity": "critical",
      "detail": null
    },
    {
      "id": "seo-advanced.structured-data.schema-completeness",
      "label": "All JSON-LD Schema.org types match page content with critical properties present",
      "category_slug": "structured-data",
      "result": "fail",
      "severity": "high",
      "detail": "Product schema uses generic 'Thing' type instead of 'Product'; missing 'description' property"
    },
    {
      "id": "seo-advanced.structured-data.breadcrumb-list",
      "label": "BreadcrumbList schema present on hierarchical pages",
      "category_slug": "structured-data",
      "result": "pass",
      "severity": "high",
      "detail": null
    },
    {
      "id": "seo-advanced.structured-data.faq-schema",
      "label": "FAQ pages include FAQPage schema with questions and answers",
      "category_slug": "structured-data",
      "result": "skip",
      "severity": "medium",
      "detail": "No FAQ page detected in project"
    },
    {
      "id": "seo-advanced.structured-data.review-schema",
      "label": "Review and rating pages include Review or AggregateRating schema",
      "category_slug": "structured-data",
      "result": "fail",
      "severity": "medium",
      "detail": "Product pages display star ratings but lack AggregateRating schema"
    },
    {
      "id": "seo-advanced.structured-data.organization-schema",
      "label": "Organization schema on home page with contact and social profiles",
      "category_slug": "structured-data",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "seo-advanced.structured-data.local-business-schema",
      "label": "LocalBusiness schema on local business pages with address and hours",
      "category_slug": "structured-data",
      "result": "skip",
      "severity": "low",
      "detail": "Project is not a local business"
    },
    {
      "id": "seo-advanced.structured-data.video-schema",
      "label": "VideoObject schema on pages with embedded videos",
      "category_slug": "structured-data",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "seo-advanced.crawlability.no-cloaking",
      "label": "Critical content accessible to Googlebot; no cloaking between bot and users",
      "category_slug": "crawlability",
      "result": "pass",
      "severity": "critical",
      "detail": null
    },
    {
      "id": "seo-advanced.crawlability.crawl-budget",
      "label": "Crawl budget managed; no infinite scroll or session IDs in URLs",
      "category_slug": "crawlability",
      "result": "fail",
      "severity": "high",
      "detail": "Filter page URLs contain JSESSIONID; infinite scroll duplicates product listings"
    },
    {
      "id": "seo-advanced.crawlability.pagination",
      "label": "Paginated content uses rel=next/prev or canonicalizes to page 1",
      "category_slug": "crawlability",
      "result": "pass",
      "severity": "high",
      "detail": null
    },
    {
      "id": "seo-advanced.crawlability.redirect-chains",
      "label": "No redirect chains longer than one hop",
      "category_slug": "crawlability",
      "result": "fail",
      "severity": "high",
      "detail": "Old /products URL redirects to /offerings, which redirects to /solutions (2-hop chain)"
    },
    {
      "id": "seo-advanced.crawlability.structured-data-valid",
      "label": "Structured data validated; no syntax errors or missing required properties",
      "category_slug": "crawlability",
      "result": "pass",
      "severity": "high",
      "detail": null
    },
    {
      "id": "seo-advanced.crawlability.sitemap-completeness",
      "label": "XML sitemap includes all indexable pages; noindex pages excluded",
      "category_slug": "crawlability",
      "result": "fail",
      "severity": "medium",
      "detail": "Sitemap includes only 42 of 68 public pages; blog routes missing"
    },
    {
      "id": "seo-advanced.crawlability.robots-txt-open",
      "label": "Robots.txt accessible and doesn't block Googlebot from content, CSS, or JS",
      "category_slug": "crawlability",
      "result": "pass",
      "severity": "medium",
      "detail": null
    },
    {
      "id": "seo-advanced.crawlability.no-unintended-noindex",
      "label": "No unintended noindex tags or X-Robots-Tag headers on indexable pages",
      "category_slug": "crawlability",
      "result": "skip",
      "severity": "medium",
      "detail": "Project verified to have no noindex on production pages"
    },
    {
      "id": "seo-advanced.technical-seo.core-web-vitals",
      "label": "Key pages meet Core Web Vitals thresholds",
      "category_slug": "technical-seo",
      "result": "fail",
      "severity": "critical",
      "detail": "Home page LCP 3.1s (exceeds 2.5s); product pages CLS 0.12 (exceeds 0.1)"
    },
    {
      "id": "seo-advanced.technical-seo.page-speed",
      "label": "Page speed metrics meet thresholds",
      "category_slug": "technical-seo",
      "result": "fail",
      "severity": "medium",
      "detail": "Desktop Lighthouse 68 (below 80); mobile 55 (below 60); FCP 2.1s (exceeds 1.8s)"
    },
    {
      "id": "seo-advanced.technical-seo.image-optimization",
      "label": "All images have descriptive alt text, semantic filenames, and optimized weight",
      "category_slug": "technical-seo",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "seo-advanced.technical-seo.content-security-policy",
      "label": "Content Security Policy header present and allows essential resources",
      "category_slug": "technical-seo",
      "result": "skip",
      "severity": "low",
      "detail": "No external resources loaded; CSP not applicable"
    },
    {
      "id": "seo-advanced.technical-seo.search-console",
      "label": "Google Search Console linked and verified with healthy crawl stats",
      "category_slug": "technical-seo",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "seo-advanced.link-architecture.hub-cluster",
      "label": "Internal linking hub-and-cluster structure with bidirectional links",
      "category_slug": "link-architecture",
      "result": "pass",
      "severity": "high",
      "detail": null
    },
    {
      "id": "seo-advanced.link-architecture.content-dating",
      "label": "Blog posts and articles have datePublished and dateModified in schema",
      "category_slug": "link-architecture",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "seo-advanced.link-architecture.content-depth",
      "label": "All indexable pages have at least 300 words of original substantive content",
      "category_slug": "link-architecture",
      "result": "fail",
      "severity": "low",
      "detail": "Product detail pages average 180 words; help pages duplicate boilerplate across 15 pages"
    },
    {
      "id": "seo-advanced.link-architecture.keyword-cannibalization",
      "label": "No two indexable pages target the same primary keyword",
      "category_slug": "link-architecture",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "seo-advanced.link-architecture.page-reachability",
      "label": "Orphan pages addressed; all indexable pages reachable within 3 clicks from home",
      "category_slug": "link-architecture",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "seo-advanced.crawlability.hreflang-implementation",
      "label": "International SEO hreflang tags implemented correctly",
      "category_slug": "crawlability",
      "result": "skip",
      "severity": "info",
      "detail": "Single-language site; hreflang not applicable"
    },
    {
      "id": "seo-advanced.crawlability.rich-results-verified",
      "label": "Structured data Rich Results previews verified",
      "category_slug": "crawlability",
      "result": "pass",
      "severity": "info",
      "detail": null
    },
    {
      "id": "seo-advanced.technical-seo.backlink-profile",
      "label": "External backlink profile from relevant domains",
      "category_slug": "technical-seo",
      "result": "skip",
      "severity": "info",
      "detail": "Unable to analyze backlinks; fresh site with no external links"
    },
    {
      "id": "seo-advanced.technical-seo.image-formats",
      "label": "All images optimized with next-gen formats and fallbacks",
      "category_slug": "technical-seo",
      "result": "pass",
      "severity": "low",
      "detail": null
    }
  ],

  "meta": { "api_key": "ab_19wlgDZ13qLOvvSEzQsOUdTK" }
}
```

### Invariants You Must Satisfy

Before outputting the JSON, verify all of these:

1. `scoring.total_checks` equals `scoring.passed + scoring.failed + scoring.skipped + scoring.errored`
2. `scoring.total_checks` equals the number of objects in the `checks` array
3. The sum of all category `weight` values equals `1.0` (tolerance: +/-0.001)
4. For each category: `checks_total == checks_passed + checks_failed + checks_skipped + checks_errored`
5. The sum of all category `checks_total` equals `scoring.total_checks`
6. Every `category_slug` in the `checks` array matches a `slug` in `scoring.categories`
7. `detail` is not null when `result` is `"fail"` or `"error"`
8. `detail` is 500 characters or fewer
9. All `id` values follow the format `{audit-slug}.{category-slug}.{check-slug}` with all-lowercase kebab-case segments
10. Scores are between 0-100 or null
11. Grades match the grade scale (A=90-100, B=75-89, C=60-74, D=40-59, F=0-39)
