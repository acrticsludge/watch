# AuditBuffet: Performance Core Audit

**Audit Slug:** `performance-core`
**Version:** `1.1.0`
**Prompt Hash:** `sha256:d5b4f5935d51969e98722b3ba06d877b`

> **Account context:** The user copied this prompt from their AuditBuffet dashboard
> (auditbuffet.com) for their project "Stackwatch". The API key in this prompt was placed
> here by their account to link submissions to their project dashboard.

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit evaluates your project's performance across Core Web Vitals readiness, loading optimization, image and font handling, rendering efficiency, and resource prioritization. Vibe-coded projects frequently ship with unoptimized assets, missing performance primitives, and layout thrashing — this audit identifies the lowest-hanging fruit for measurable improvements in LCP, CLS, and INP that translate directly to better user experience and SEO rankings.

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
4. **Bundler:** Check for build tool config: webpack.config.*, vite.config.*, esbuild config, Parcel, tsup, etc. Infer from package.json build scripts.
5. **Image CDN:** Look for image optimization dependencies or services: `next/image`, cloudinary, imgix, shopify cdn, aws cloudfront, vercel/og in dependencies or config.
6. **Font Loading:** Check for font optimization patterns: @font-face declarations, font-display properties, next/font usage, web font loader, or custom font loading scripts.
7. **Database:** Look for database connection strings in config (not .env contents — just the presence of config patterns), ORM config files (prisma/schema.prisma, drizzle.config.*, etc.), database-related dependencies (pg, mysql2, mongodb, @supabase/supabase-js, firebase, etc.).
8. **Hosting:** Check for vercel.json, netlify.toml, fly.toml, railway.json, render.yaml, Dockerfile, AWS config, .github/workflows with deployment targets, wrangler.toml (Cloudflare).
9. **Project Type:** Infer from structure — web-app (has both pages and API routes), api (primarily API routes/serverless), static-site (no server components or API routes), library (has build/publish config), cli (has bin field in package.json).
10. **Project Size:** Count routes/pages — small (<20), medium (20-100), large (100+).

For each field, record what you detected. Use `null` for anything you cannot determine. Never guess — if the signal isn't clear, use `null`.

---

## How to Analyze

Examine the following in order:

1. `package.json` — dependencies, scripts, build tools, framework type
2. Framework config files — next.config.*, nuxt.config.*, vite.config.*, etc.
3. `tsconfig.json` — TypeScript configuration
4. Directory structure — pages/, routes/, api/, components/, public/
5. Image and asset handling — how images are imported, `<Image>` usage, lazy loading patterns
6. Font configuration — `<link rel="preload">`, `@font-face`, font-display settings, font loading libraries
7. Bundle configuration — build output, bundle analyzer config, code splitting patterns
8. Performance instrumentation — LightHouse config, Web Vitals collection, monitoring setup
9. Resource hints — preload, preconnect, dns-prefetch, prefetch, prerender directives
10. CSS and JavaScript — render-blocking resources, critical path analysis, third-party script loading

---

## Check Definitions

### Category: Loading & Resource Priority
**Slug:** `loading-resource-priority`
**Weight in overall score:** 0.30

#### Check: LCP element identified and optimized for fast delivery
- **ID:** `performance-core.loading-resource-priority.lcp-optimized`
- **Severity:** `critical`
- **What to look for:** Count all relevant instances and enumerate each. Before evaluating, extract and quote any relevant configuration or UI text found. Identify the Largest Contentful Paint element (typically a hero image or heading text). Check whether it is preloaded, inline, or served with appropriate cache headers. Look for `<link rel="preload">` tags targeting the LCP resource, or inspect image loading patterns to verify the element loads as early as possible.
- **Pass criteria:** The LCP element (typically a large image or heading) has explicit preload directives via `<link rel="preload" as="image" href="...">` or similar, OR it is inline in the initial HTML, OR it is served from a CDN with aggressive caching. Project documentation or code comments indicate awareness of LCP optimization. A partial or placeholder implementation does not count as pass. Report the count even on pass.
- **Fail criteria:** The LCP element has no preload directive, is lazy-loaded unnecessarily, or is hosted without CDN caching. Build output or performance logs show LCP exceeds 2.5 seconds.
- **Skip (N/A) when:** The project has no dynamic rendering (static site with static assets only) or no client-side rendering layer.
- **Detail on fail:** Specify the LCP element and why it's slow. Example: `"Hero image (2.5 MB) at /images/banner.jpg loaded without preload; no CDN caching configured — measured LCP 4.2s"` or `"Critical text rendered client-side after JS hydration; preload not applicable"`
- **Remediation:** The Largest Contentful Paint element typically appears in the first viewport and contributes significantly to perceived page speed. Preload critical images and ensure they're served with cache headers:

  ```html
  <!-- In your <head> -->
  <link rel="preload" as="image" href="/images/hero.jpg" imagesrcset="...sizes="...">
  ```

  For Next.js, use `next/image` with priority:
  ```tsx
  <Image src="/hero.jpg" alt="Hero" priority width={1200} height={600} />
  ```

#### Check: Time to First Byte under 800ms at 75th percentile
- **ID:** `performance-core.loading-resource-priority.ttfb-target`
- **Severity:** `critical`
- **What to look for:** Count all relevant instances and enumerate each. Before evaluating, extract and quote any relevant configuration or UI text found. Check server response time by examining framework config for SSR caching, CDN configuration, database query optimization patterns, or API latency. If using Next.js, check for `revalidate` settings on pages (ISR). Look for evidence of caching strategies (cache headers, CDN, service worker).
- **Pass criteria:** Framework is configured with caching (ISR, SSG, or edge caching), OR there is evidence of CDN usage with geographic edge servers, OR database queries are optimized with indexes and connection pooling. Project documentation indicates target TTFB monitoring. A partial or placeholder implementation does not count as pass. Report the count even on pass.
- **Fail criteria:** No caching strategy detected, server renders every request from scratch, or TTFB metrics show consistent values over 800ms. Database queries appear to lack optimization.
- **Skip (N/A) when:** The project is a pure static site (no server rendering) or has no user-facing pages.
- **Detail on fail:** Specify the measured TTFB and root cause. Example: `"All routes server-rendered without caching; 75th percentile TTFB 1.2s. No database indexes on frequently queried tables."` or `"ISR set to 3600 seconds but no CDN in front; each request hits server"`.
- **Remediation:** TTFB represents server responsiveness — the time until the first byte of the response arrives. Optimize by caching, using a CDN, or reducing server-side processing:

  For Next.js, enable Incremental Static Regeneration (ISR):
  ```ts
  export const revalidate = 60  // revalidate every 60 seconds
  ```

  Or use Static Generation for static pages:
  ```ts
  // app/page.tsx
  export const dynamic = 'force-static'  // generates at build time
  ```

  Ensure a CDN is in front of your origin, and optimize database queries with indexes and query caching.

#### Check: Critical rendering path minimized
- **ID:** `performance-core.loading-resource-priority.critical-path`
- **Severity:** `critical`
- **What to look for:** Count all relevant instances and enumerate each. Analyze the resource waterfall (via DevTools Network tab or build output). Identify resources that block rendering: CSS files without `media`, synchronous `<script>` tags in `<head>`, or JavaScript that runs before the page is interactive. Check for parallelized requests and minimal hops in the critical path.
- **Pass criteria:** Resources in the critical path are minimal: no unused CSS in the initial bundle, scripts are async/defer or loaded after the page interactive, and fonts are loaded with font-display strategies. The waterfall shows parallelized requests with short critical paths (under 3 hops). A partial or placeholder implementation does not count as pass.
- **Fail criteria:** Large CSS files block rendering, scripts run synchronously in `<head>`, or multiple sequential requests delay first paint. Waterfall shows multiple sequential hops or render-blocking resources.
- **Skip (N/A) when:** The project is static HTML with no build process or dynamic rendering.
- **Detail on fail:** Describe the blocking resources. Example: `"90KB vendor.css blocks rendering; no media attribute. app.js and analytics.js both synchronous in <head> — 3-hop critical path"` or `"Three sequential font requests before any content renders"`.
- **Remediation:** The critical rendering path is the sequence of resources required to render the first pixel. Minimize it by:

  1. Moving non-critical CSS to media queries or async loading:
     ```html
     <link rel="stylesheet" href="print.css" media="print">
     ```

  2. Making scripts non-blocking with `async` or `defer`:
     ```html
     <script defer src="app.js"></script>
     <script async src="analytics.js"></script>
     ```

  3. Inlining critical CSS for above-fold content:
     ```html
     <style>{criticalCSS}</style>
     ```

  4. Using Web Fonts with font-display strategies (see font loading checks).

#### Check: Render-blocking CSS eliminated or inlined
- **ID:** `performance-core.loading-resource-priority.render-blocking-css`
- **Severity:** `high`
- **What to look for:** Count all relevant instances and enumerate each. Check HTML source for `<link rel="stylesheet">` tags without `media` attributes or with `media="all"` or `media="screen"`. These block rendering. Also check for embedded `<style>` tags and their sizes. Look for critical CSS inlining patterns or `<link rel="preload">` with `onload` handlers for deferred styles.
- **Pass criteria:** Non-critical CSS is deferred via `media` queries or async loading patterns. Critical CSS (under 14KB) is inlined for above-fold content. `<link rel="preload" as="style" href="...">` used for async CSS loading.
- **Fail criteria:** All CSS is render-blocking (large monolithic stylesheet loaded synchronously), or no distinction between critical and non-critical CSS. Initial stylesheets exceed 20KB.
- **Skip (N/A) when:** The project has no CSS or uses CSS-in-JS that doesn't produce external stylesheets.
- **Detail on fail:** Specify the blocking stylesheet size. Example: `"main.css 145KB loaded render-blocking in <head>; media attribute not used. Critical CSS not identified or inlined"` or `"Tailwind CSS output 78KB not split; no critical/non-critical separation"`.
- **Remediation:** Non-critical CSS should not block rendering. Separate your CSS into critical (above-fold) and non-critical (below-fold):

  ```html
  <!-- Critical CSS inlined -->
  <style>{criticalCSS}</style>

  <!-- Non-critical CSS deferred -->
  <link rel="preload" as="style" href="non-critical.css" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="non-critical.css"></noscript>
  ```

  Or use `media` attributes for print or non-essential styles:
  ```html
  <link rel="stylesheet" href="print.css" media="print">
  ```

#### Check: Preload directives added for critical fonts, images, and scripts
- **ID:** `performance-core.loading-resource-priority.preload-critical`
- **Severity:** `high`
- **What to look for:** Count all relevant instances and enumerate each. Examine the `<head>` of all pages for `<link rel="preload">` tags. Identify which resources are critical for the initial render: the LCP image, primary web font files (.woff2), and any above-fold JavaScript that is needed for interactivity. Check whether these critical resources are being preloaded. Verify that `as` attributes are correct (`as="image"`, `as="font"`, `as="script"`). Look for `crossorigin` attribute on font preloads. Count how many critical resources load without a corresponding preload directive.
- **Pass criteria:** All resources required for the initial above-fold render have `<link rel="preload">` directives with correct `as` and (for fonts) `crossorigin` attributes. Preload tags appear early in `<head>` before any stylesheet links. Preloads are limited to genuinely critical resources — no more than 5-6 to avoid bandwidth contention.
- **Fail criteria:** Critical fonts, the LCP image, or above-fold scripts load without preload directives, causing the browser to discover them late in the waterfall. Preload directives are missing or incorrect (wrong `as` attribute), or preloads exceed 8+ resources creating bandwidth competition.
- **Skip (N/A) when:** The project uses only system fonts, has no above-fold images, and loads no synchronous scripts — making preload unnecessary.
- **Detail on fail:** Specify which critical resources lack preload. Example: `"Primary font Inter-Regular.woff2 discovered at 800ms — no preload directive. LCP hero image not preloaded; browser discovers it after parsing 120KB of CSS"` or `"7 preloads defined including low-priority below-fold images; bandwidth contention delays LCP resource"`.
- **Remediation:** Preloading critical resources tells the browser to fetch them at the highest priority, before it would normally discover them. Add `<link rel="preload">` in `<head>` for each critical resource:

  ```html
  <!-- Preload LCP image -->
  <link rel="preload" as="image" href="/images/hero.jpg"
        imagesrcset="/images/hero-480.jpg 480w, /images/hero-1200.jpg 1200w"
        imagesizes="(max-width: 768px) 100vw, 1200px">

  <!-- Preload critical font -->
  <link rel="preload" as="font" href="/fonts/inter-regular.woff2"
        type="font/woff2" crossorigin>

  <!-- Preload critical script -->
  <link rel="preload" as="script" href="/js/critical.js">
  ```

  With Next.js, use the `priority` prop on the LCP image and `next/font` for fonts (which auto-preloads):
  ```tsx
  import { Inter } from 'next/font/google'
  const inter = Inter({ subsets: ['latin'] })  // auto-generates preload link

  <Image src="/hero.jpg" alt="Hero" priority width={1200} height={600} />
  ```

  Verify impact in DevTools: the preloaded resources should appear at the very start of the waterfall with high priority.

#### Check: Preconnect added for third-party origins
- **ID:** `performance-core.loading-resource-priority.preconnect-third-party`
- **Severity:** `info`
- **What to look for:** Scan HTML for `<link rel="preconnect">` and `<link rel="dns-prefetch">` directives. Identify all third-party origins used by the page: font services (fonts.googleapis.com, fonts.gstatic.com), analytics (google-analytics.com, segment.io), CDN providers, and API endpoints on different domains. Check whether the most latency-sensitive third-party origins have preconnect directives. Count the total number of preconnects and verify they are limited to origins used in the first 5 seconds of page load.
- **Pass criteria:** The 3-4 most latency-sensitive third-party origins (fonts, analytics, CDN) have `<link rel="preconnect">` directives with correct `crossorigin` attribute where needed. Origins not used immediately use `dns-prefetch` instead of `preconnect` to avoid wasting TCP connections. Total preconnects do not exceed 4.
- **Fail criteria:** Pages load resources from third-party origins with no preconnect or dns-prefetch, adding 100-300ms of connection overhead per origin. More than 4 preconnect directives are present, wasting TCP connections for origins that may not be used. Critical font origin has no preconnect, delaying font rendering.
- **Skip (N/A) when:** The project serves all resources (including fonts and analytics) from its own domain with no third-party origins.
- **Detail on fail:** Name the unconnected third-party origins. Example: `"fonts.gstatic.com has no preconnect; font file discovery incurs 180ms connection overhead. Analytics endpoint on api.segment.io connected without preconnect or dns-prefetch"` or `"6 preconnect directives configured; 3 are for low-priority origins rarely used in first 5s; wasting connections"`.
- **Remediation:** Preconnect eliminates the TCP + TLS handshake latency for third-party origins. Add it to your `<head>` for the most critical origins:

  ```html
  <!-- Google Fonts: two origins needed -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Analytics: preconnect if loaded early, dns-prefetch if deferred -->
  <link rel="preconnect" href="https://www.google-analytics.com">

  <!-- Lower-priority third party: dns-prefetch instead -->
  <link rel="dns-prefetch" href="https://cdn.example.com">
  ```

  Limit `preconnect` to origins needed within the first 5 seconds. Use `dns-prefetch` for everything else — it only resolves the DNS without opening a TCP connection, so it is cheaper.

#### Check: Resource hints prefetch and prerender optimized for likely next navigations
- **ID:** `performance-core.loading-resource-priority.resource-hints`
- **Severity:** `low`
- **What to look for:** Count all relevant instances and enumerate each. Check HTML and JavaScript for `<link rel="prefetch">`, `<link rel="prerender">`, or programmatic prefetching via the Speculation Rules API (`<script type="speculationrules">`). Identify which pages or resources are being prefetched. Evaluate whether the prefetched resources align with likely next-navigation paths (e.g., prefetching the product detail page from the product list page). Check whether any prefetching wastes bandwidth on low-probability pages. Look for framework-level prefetching (Next.js `<Link>` prefetch, Nuxt prefetch directives).
- **Pass criteria:** Resources or pages that users are highly likely to navigate to next are prefetched in advance. Prefetching is triggered on hover or when the link enters the viewport — not for all links unconditionally. Speculation Rules API is used for prerender where browser support allows. No prefetch calls target pages with low navigation probability.
- **Fail criteria:** No prefetching is implemented despite having clear high-probability navigation paths (e.g., a paginated list with no prefetch of the next page). Alternatively, all links are prefetched unconditionally, wasting significant bandwidth on mobile. Prefetch resources are larger than 500KB and downloaded on every page load regardless of user intent.
- **Skip (N/A) when:** The project is a single-page app with client-side routing that already loads all route components, or the project has no multi-page navigation patterns.
- **Detail on fail:** Describe the prefetch opportunity or waste. Example: `"Product listing page has no prefetch for product detail pages; 300ms navigation delay on every click. High-probability next page identified but not prefetched"` or `"All 40 `<Link>` components use default Next.js prefetch=true unconditionally; mobile users download 2MB of unused route bundles"`.
- **Remediation:** Targeted prefetching makes navigations feel instant for predictable user flows:

  ```html
  <!-- Prefetch the next likely page -->
  <link rel="prefetch" href="/checkout" as="document">

  <!-- Speculation Rules API for prerender (Chrome 109+) -->
  <script type="speculationrules">
  {
    "prerender": [
      { "source": "list", "urls": ["/product/1", "/product/2"] }
    ],
    "prefetch": [
      { "source": "document", "where": { "href_matches": "/blog/*" } }
    ]
  }
  </script>
  ```

  With Next.js `<Link>`, prefetch on hover is automatic. For manual control:
  ```tsx
  import { useRouter } from 'next/navigation'
  const router = useRouter()

  // Prefetch on hover
  <Link href="/checkout" prefetch={true}>Checkout</Link>

  // Programmatic prefetch on hover
  <button onMouseEnter={() => router.prefetch('/checkout')}>Go to checkout</button>
  ```

  Be selective: only prefetch pages users are >50% likely to visit next. Avoid unconditional prefetch of all links — it wastes bandwidth and can overload the server.

- **Cross-reference:** For related patterns and deeper analysis, see the corresponding checks in other AuditBuffet audits covering this domain.

---

### Category: Rendering & Paint
**Slug:** `rendering-paint`
**Weight in overall score:** 0.25

#### Check: Cumulative Layout Shift sources identified and fixed
- **ID:** `performance-core.rendering-paint.cls-fixed`
- **Severity:** `high`
- **What to look for:** Examine page layout for elements that shift during load: images without dimensions, late-loading content (ads, embeds), dynamic content insertion, or font swaps. Check CSS for rules that might cause shifts (width/height changes, margin/padding adjustments during transitions). Look for CSS containment usage or size attributes on media.
- **Pass criteria:** Images and media have explicit `width` and `height` attributes or aspect-ratio CSS set, preventing layout shifts. Ads or dynamic content containers have reserved space with `min-height`. Font loading uses `font-display: swap` to prevent FOIT/FOUT layout shifts.
- **Fail criteria:** Images loaded without dimensions causing layout shifts, late-loading content (ads, embeds) has no reserved space, or font swaps cause text reflow. Measured CLS exceeds 0.1.
- **Skip (N/A) when:** The project has no images, ads, or dynamic content that could cause shifts.
- **Detail on fail:** Identify the shift sources. Example: `"Hero image loads without dimensions; 150px downward shift. Ad container has no reserved height; shifts main content 200px when loaded. Font swap FOUT causes 30px text shift"` or `"Modal overlay toggled without fixed dimensions; shifts page during open/close"`.
- **Remediation:** Layout shifts are unexpected visual changes during page load. Prevent them by reserving space for dynamic content:

  1. Set image dimensions to prevent shifts:
     ```tsx
     <Image src="/hero.jpg" alt="Hero" width={1200} height={600} />
     // or with aspect-ratio CSS
     <img src="hero.jpg" alt="Hero" style={{ aspectRatio: '16/9' }} />
     ```

  2. Reserve space for ads and embeds:
     ```html
     <div style={{ minHeight: '250px' }}> {/* ad container */} </div>
     ```

  3. Use `font-display: swap` to prevent font-based shifts (see font loading check).

#### Check: First Input Delay under 100ms and Interaction to Next Paint under 200ms
- **ID:** `performance-core.rendering-paint.inp-fid-target`
- **Severity:** `high`
- **What to look for:** Count all relevant instances and enumerate each. Check for long-running JavaScript that blocks the main thread. Look for event listeners on interactive elements (buttons, links, form inputs) that might trigger expensive operations. Examine bundle size and third-party scripts that consume main thread time. Check for indicators of optimization: Web Workers, code splitting, or main-thread monitoring.
- **Pass criteria:** Event handlers are lightweight and respond within 100ms. Heavy operations are offloaded to Web Workers or executed asynchronously. Framework has efficient event delegation (no excessive listener setup on every render). Long tasks are profiled and identified.
- **Fail criteria:** Click/input handlers perform heavy computations synchronously (data processing, parsing, encryption). Long tasks over 50ms block user interaction. Slow third-party scripts run on main thread.
- **Skip (N/A) when:** The project has no interactive elements or is a static site.
- **Detail on fail:** Identify the blocking operations. Example: `"Form submit handler parses 5MB JSON synchronously; measured delay 340ms. Three third-party scripts (analytics, widget, ads) add 200ms main thread blocking"` or `"Data table sort operation blocks UI for 150ms; no pagination or virtualization"`.
- **Remediation:** Input delay is the time between user interaction and response. Reduce it by keeping event handlers lightweight:

  1. Offload heavy work to Web Workers:
     ```ts
     const worker = new Worker('heavy-compute.worker.js')
     worker.postMessage({ data: largeArray })
     worker.onmessage = (e) => setResult(e.data)
     ```

  2. Break long tasks with `scheduler.yield()`:
     ```ts
     async function processLargeDataset() {
       for (let i = 0; i < items.length; i++) {
         processItem(items[i])
         if (i % 100 === 0) await scheduler.yield()
       }
     }
     ```

  3. Defer non-critical work:
     ```ts
     button.addEventListener('click', () => {
       performCriticalWork()  // runs immediately
       requestIdleCallback(() => performNonCriticalWork())  // deferred
     })
     ```

#### Check: Long tasks over 50ms broken up or eliminated
- **ID:** `performance-core.rendering-paint.long-tasks`
- **Severity:** `high`
- **What to look for:** Count all relevant instances and enumerate each. Profile the main thread using DevTools Performance tab or build output. Look for JavaScript execution that blocks for over 50ms continuously. Check for heavy computations, parsing, encryption, or data processing that runs synchronously. Identify third-party scripts and their execution times.
- **Pass criteria:** Long tasks are either broken up with `scheduler.yield()` or moved to Web Workers. Main thread shows consistent execution under 50ms blocks. Third-party scripts are lazy-loaded or executed asynchronously.
- **Fail criteria:** Long tasks (over 50ms) block main thread regularly. Heavy computations (parsing, encryption, sorting) run synchronously during user interactions. Profiling shows sustained main thread blocking.
- **Skip (N/A) when:** No user interaction or animations that depend on main thread performance.
- **Detail on fail:** Specify the long task and duration. Example: `"Data table initialization blocks for 180ms loading 10K rows. React reconciliation on large state change takes 120ms; component re-renders unnecessarily"` or `"Three sequential heavy computations in lifecycle: font face set load (50ms), analytics setup (40ms), widget init (35ms)"`.
- **Remediation:** Tasks over 50ms block user interaction for that duration. Break them up:

  1. Use `scheduler.yield()` to interleave with browser updates:
     ```ts
     async function processArray(items) {
       for (let i = 0; i < items.length; i++) {
         processItem(items[i])
         if (i % 50 === 0) await scheduler.yield()  // let browser paint
       }
     }
     ```

  2. Move CPU-heavy work to Web Worker:
     ```ts
     // main.js
     const worker = new Worker('processor.worker.js')
     worker.postMessage({ items })
     worker.onmessage = (e) => displayResults(e.data)
     ```

  3. Use `requestIdleCallback` for non-critical work:
     ```ts
     requestIdleCallback(() => initializeOptionalFeatures())
     ```

#### Check: will-change used sparingly and correctly
- **ID:** `performance-core.rendering-paint.will-change`
- **Severity:** `low`
- **What to look for:** Count all relevant instances and enumerate each. Search CSS files, styled-components, and inline styles for `will-change` declarations. For each occurrence, verify that the element actually animates or transforms during normal use. Check whether `will-change` is applied to many elements at once (more than 5-10), to non-animating elements, or set permanently in CSS rather than added/removed in JavaScript before and after animations. Look for `will-change: transform` or `will-change: opacity` on static containers or large layout elements that do not move.
- **Pass criteria:** `will-change` is applied only to elements that genuinely undergo GPU-compositable transforms or opacity changes (e.g., animated modals, tooltips, floating buttons). It is added in JavaScript immediately before an animation starts and removed immediately after, rather than declared permanently in CSS. No more than 3-5 elements have `will-change` active simultaneously.
- **Fail criteria:** `will-change` is declared in CSS on many elements (10+) unconditionally, including elements that never animate. Static layout containers, wrapper divs, or entire sections use `will-change: transform`. The property is treated as a blanket performance improvement applied everywhere rather than a targeted hint.
- **Skip (N/A) when:** The project has no animations, transitions, or GPU-composited effects — making `will-change` irrelevant.
- **Detail on fail:** Specify the misuse. Example: `"will-change: transform applied to 23 elements in globals.css including static headers, footers, and card wrappers that never animate. Creates 23 separate GPU layers, increasing VRAM usage and harming scroll performance"` or `"will-change set permanently on all .btn elements; buttons are clicked but not continuously animated — property should be applied on hover/focus and removed after interaction"`.
- **Remediation:** `will-change` hints to the browser that an element is about to be transformed, allowing it to create a GPU compositing layer in advance. Overuse creates too many layers and harms performance. Apply it surgically:

  CSS (permanent, acceptable for elements that always animate):
  ```css
  /* Good: single animating element promoted to GPU layer */
  .modal-overlay {
    will-change: opacity;  /* fades in/out on open/close */
  }

  /* Bad: static element with will-change */
  .page-header {
    will-change: transform;  /* never moves — remove this */
  }
  ```

  JavaScript (preferred for elements that animate occasionally):
  ```ts
  function animateElement(el: HTMLElement) {
    el.style.willChange = 'transform'  // hint before animation
    el.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(-20px)' }
    ], { duration: 300 }).finished.then(() => {
      el.style.willChange = 'auto'  // remove hint after animation
    })
  }
  ```

  Audit existing usage: `grep -r "will-change" src/` and review every result to confirm the element actually animates.

- **Cross-reference:** For related patterns and deeper analysis, see the corresponding checks in other AuditBuffet audits covering this domain.

---

### Category: Image & Media Optimization
**Slug:** `image-media-optimization`
**Weight in overall score:** 0.25

#### Check: Image lazy loading implemented for below-fold content
- **ID:** `performance-core.image-media-optimization.lazy-loading`
- **Severity:** `medium`
- **What to look for:** Count all relevant instances and enumerate each. Scan image and iframe elements for `loading="lazy"` attribute or Intersection Observer patterns. Check whether below-fold images are loaded eagerly (synchronously) or deferred. Look for lazy loading libraries in dependencies (react-lazyload, vanilla-lazyload, etc.) or custom implementations.
- **Pass criteria:** Below-fold images (not in initial viewport) use `loading="lazy"` attribute natively, or are lazy-loaded via Intersection Observer or a library. At least 1 implementation must be verified. Above-fold images use `loading="eager"` or omit the attribute (default eager).
- **Fail criteria:** All images load eagerly including those far below fold, or lazy loading is not implemented. Large below-fold images cause unnecessary initial page load delay.
- **Skip (N/A) when:** The project has no images or all images are above the fold on typical viewports.
- **Detail on fail:** Specify the below-fold images. Example: `"Product gallery images (8 images, 450KB total) all loaded eagerly. Images 500px below fold start loading immediately instead of on-demand"` or `"Hero image at 100px marked with loading='lazy' incorrectly; should be eager"`.
- **Remediation:** Lazy loading defers image loading until the image enters the viewport, reducing initial page load:

  Use native `loading="lazy"`:
  ```html
  <img src="product.jpg" alt="Product" loading="lazy" />
  ```

  Or with Next.js Image:
  ```tsx
  <Image src="/product.jpg" alt="Product" loading="lazy" width={300} height={300} />
  ```

  For more control, use Intersection Observer:
  ```tsx
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true)
    })
    observer.observe(ref.current)
  }, [])
  return isVisible ? <img src="..." /> : <div ref={ref} />
  ```

#### Check: Next-gen image formats WebP and AVIF served to modern browsers
- **ID:** `performance-core.image-media-optimization.next-gen-formats`
- **Severity:** `medium`
- **What to look for:** Count all relevant instances and enumerate each. Check image serving strategy. Look for `<picture>` elements with WebP/AVIF `<source>` tags, or image CDN configuration (next/image, cloudinary, imgix) that auto-converts formats. Examine build output or image delivery pipeline for format negotiation based on browser support.
- **Pass criteria:** Images are served in WebP or AVIF to modern browsers with fallback to JPEG/PNG. Either `<picture>` elements are used with format sources, or an image optimization service (next/image, CDN) handles format conversion automatically.
- **Fail criteria:** Only JPEG/PNG served regardless of browser support, or WebP/AVIF is available but not served to capable browsers. File sizes are not reduced relative to legacy formats.
- **Skip (N/A) when:** The project has no images or uses only SVG/vector graphics.
- **Detail on fail:** Specify the formats being served. Example: `"All JPEGs served without WebP alternative. Modern browsers capable of WebP still download 3x larger JPEG files. No image optimization service detected"` or `"next/image configured but JPEG still used instead of automatic WebP/AVIF conversion"`.
- **Remediation:** WebP and AVIF provide 20-35% better compression than JPEG/PNG. Serve them to modern browsers:

  Using `<picture>`:
  ```html
  <picture>
    <source srcset="image.avif" type="image/avif">
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="Image">
  </picture>
  ```

  Or use Next.js Image (auto-converts):
  ```tsx
  <Image src="/image.jpg" alt="Image" width={600} height={400} />
  ```

  Or configure an image CDN to auto-optimize:
  ```
  https://images.example.com/image.jpg?format=auto&w=600
  ```

#### Check: Responsive images with srcset and sizes
- **ID:** `performance-core.image-media-optimization.responsive-images`
- **Severity:** `medium`
- **What to look for:** Check `<img>` tags for `srcset` and `sizes` attributes, or next/image usage with breakpoints. Look for image variants at different resolutions (1x, 2x, or width-based srcset). Verify sizes attribute matches layout (e.g., `sizes="(max-width: 768px) 100vw, 50vw"`).
- **Pass criteria:** Images use `srcset` with multiple resolution variants (at minimum 1x and 2x), and `sizes` attribute reflects actual layout. Or next/image is used with responsive width handling. Users on low-bandwidth connections and smaller devices receive appropriately sized images.
- **Fail criteria:** No srcset or sizes attributes; same image served to all devices regardless of viewport width or device pixel ratio. High-resolution images served to mobile devices unnecessarily.
- **Skip (N/A) when:** All images are small (under 100KB) or the same aspect ratio on all viewports.
- **Detail on fail:** Specify the responsive design gaps. Example: `"Hero image 2400px wide always served; mobile users download 1.2MB image for 375px viewport. No srcset or responsive handling"` or `"srcset present but sizes attribute missing; browser can't choose optimal image"`.
- **Remediation:** Responsive images match device capabilities and layout:

  ```html
  <img
    src="image-600w.jpg"
    srcset="image-300w.jpg 300w, image-600w.jpg 600w, image-1200w.jpg 1200w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
    alt="Image"
  />
  ```

  Or with Next.js (handles automatically):
  ```tsx
  <Image
    src="/image.jpg"
    alt="Image"
    width={600}
    height={400}
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  ```

#### Check: Font-display swap configured on all web fonts
- **ID:** `performance-core.image-media-optimization.font-display`
- **Severity:** `medium`
- **What to look for:** Count all relevant instances and enumerate each. Check `@font-face` declarations for `font-display` property. Look in CSS files, font loading libraries (next/font, Google Fonts, Typekit), or `<link>` tags for web fonts. Verify all font faces have `font-display` set to `swap`, `optional`, or other non-blocking value.
- **Pass criteria:** All `@font-face` declarations include `font-display: swap` (or another non-blocking value). At least 1 implementation must be verified. Fonts are loaded asynchronously, and fallback fonts display immediately.
- **Fail criteria:** `font-display` is missing (defaults to `auto`, blocking on some browsers), or set to `block` (FOIT). Fonts block text rendering for 3+ seconds.
- **Skip (N/A) when:** The project uses only system fonts or no web fonts.
- **Detail on fail:** Specify the font loading strategy. Example: `"Five @font-face rules with no font-display; text blocks for 2.5s while font loads (FOIT). No fallback font specified"` or `"font-display: block on all fonts; poor UX on slow networks"`.
- **Remediation:** `font-display: swap` shows fallback text immediately and swaps in the web font when ready:

  ```css
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    font-display: swap;  /* show fallback immediately, swap in web font */
  }
  ```

  With next/font:
  ```tsx
  import { Inter } from 'next/font/google'
  const inter = Inter()  // already optimized with font-display: swap
  ```

  With Google Fonts link:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
  ```

#### Check: Video poster images provided and optimized
- **ID:** `performance-core.image-media-optimization.video-poster`
- **Severity:** `low`
- **What to look for:** Count all relevant instances and enumerate each. Check `<video>` elements for `poster` attribute. If present, verify the poster image is optimized (size, format) and lazy-loaded. Check whether poster images are large or small, and if they're served in next-gen formats.
- **Pass criteria:** All `<video>` elements have a `poster` attribute. Poster images are optimized (under 100KB) and lazy-loaded. Poster is served in WebP or AVIF with JPEG fallback.
- **Fail criteria:** No poster attribute on videos, causing a blank video player until user interaction. Poster images are large (over 500KB) and block rendering. Not lazy-loaded.
- **Skip (N/A) when:** The project has no `<video>` elements.
- **Detail on fail:** Specify the poster image issues. Example: `"Video elements have no poster; blank player until user clicks. If poster were added, it should be 2400x1350px optimized to 50KB WebP"` or `"poster image 1.2MB loaded eagerly without lazy loading"`.
- **Remediation:** Poster images provide visual preview and reduce perceived load time:

  ```html
  <video controls poster="/video-poster.jpg" width="800" height="600">
    <source src="video.mp4" type="video/mp4">
  </video>
  ```

  Optimize the poster:
  ```tsx
  // Use next/image for poster
  <video controls width="800" height="600">
    <source src="video.mp4" type="video/mp4">
  </video>
  <Image
    src="/poster.jpg"
    alt="Video preview"
    width={800}
    height={600}
    loading="lazy"
  />
  ```

- **Cross-reference:** For related patterns and deeper analysis, see the corresponding checks in other AuditBuffet audits covering this domain.

---

### Category: Script & Style Efficiency
**Slug:** `script-style-efficiency`
**Weight in overall score:** 0.20

#### Check: Non-critical third-party scripts defer-loaded or async
- **ID:** `performance-core.script-style-efficiency.third-party-async`
- **Severity:** `high`
- **What to look for:** Count all relevant instances and enumerate each. Identify third-party scripts in the HTML: analytics (Google Analytics, Segment), marketing (pixel trackers, conversion tags), chat widgets, A/B testing, ads, etc. Check whether they are loaded synchronously in `<head>`, or with `async` or `defer` attributes. Look for script loading libraries or custom deferred loading patterns.
- **Pass criteria:** Non-critical third-party scripts (analytics, ads, chat, tracking) use `async` or `defer`, or are loaded asynchronously after page interactive. At least 1 implementation must be verified. Critical scripts (auth, feature flags affecting core functionality) may load synchronously if necessary.
- **Fail criteria:** Multiple non-critical third-party scripts loaded synchronously in `<head>` or early in `<body>`, blocking page rendering. No `async` or `defer` attributes.
- **Skip (N/A) when:** The project has no third-party scripts.
- **Detail on fail:** Name the blocking scripts. Example: `"Google Analytics, Segment, Drift chat widget, and Intercom all loaded synchronously in <head>. Total 245KB blocks rendering. No async attribute"` or `"Facebook Pixel and TikTok pixel block initial page load for 1.5s"`.
- **Remediation:** Defer non-critical third-party scripts:

  ```html
  <!-- Good: async loading -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=..."></script>

  <!-- Or defer for sequential execution -->
  <script defer src="analytics.js"></script>
  <script defer src="widget.js"></script>

  <!-- Or load after page is interactive -->
  <script>
    window.addEventListener('load', () => {
      const script = document.createElement('script')
      script.src = 'https://cdn.example.com/widget.js'
      document.body.appendChild(script)
    })
  </script>
  ```

#### Check: CSS containment used on high-complexity components
- **ID:** `performance-core.script-style-efficiency.css-containment`
- **Severity:** `medium`
- **What to look for:** Count all relevant instances and enumerate each. Identify complex components: data tables, carousels, dashboards, dynamic feeds. Check whether they use CSS `contain` property. Look for `contain: layout` or `contain: layout paint` directives on component roots.
- **Pass criteria:** High-complexity components use `contain: layout` or `contain: paint` to scope rendering context. At least 1 implementation must be verified. Repaint performance is verified to be faster with containment than without.
- **Fail criteria:** Complex components have no containment, forcing the browser to recalculate layout and paint for the entire page on every change. Component updates are slow.
- **Skip (N/A) when:** The project has no complex or frequently-updated components.
- **Detail on fail:** Identify the slow component. Example: `"Data table with 100 rows re-renders on sort; without containment, layout recalculation affects entire page. No contain property used. Repaint takes 150ms"` or `"Dashboard with 12 widgets; updating one widget triggers global style recalculation. No containment"`.
- **Remediation:** CSS containment limits the scope of style and layout calculations:

  ```css
  .data-table {
    contain: layout paint;  /* layout and paint operations scoped to this element */
  }
  ```

  On complex, frequently-updated components:
  ```tsx
  <div style={{ contain: 'layout paint' }}>
    <DataTable data={items} />
  </div>
  ```

#### Check: Web Worker used for CPU-heavy operations
- **ID:** `performance-core.script-style-efficiency.web-worker`
- **Severity:** `low`
- **What to look for:** Count all relevant instances and enumerate each. Identify CPU-heavy operations in the codebase: JSON parsing of large payloads, cryptographic operations (hashing, encryption), image processing, data sorting or filtering over thousands of records, and complex mathematical computations. Check whether any of these operations run on the main thread (in component lifecycle methods, event handlers, or module-level code). Search for `new Worker(...)`, `worker_threads`, or libraries that abstract Web Workers (Comlink, workerize-loader, vite-plugin-worker). Verify fallback behavior when Web Workers are unavailable.
- **Pass criteria:** Identified CPU-heavy operations (those taking over 50ms to complete) are offloaded to Web Workers or handled asynchronously via the Scheduler API. A graceful fallback is provided for environments where Web Workers are not available. Worker communication is structured cleanly with typed messages.
- **Fail criteria:** Heavy computations run synchronously on the main thread during user interactions: large JSON parsing in fetch handlers, encryption in form submit handlers, or image processing that blocks the UI. No Web Worker usage detected despite the presence of computation-heavy code paths.
- **Skip (N/A) when:** The project has no CPU-heavy operations — all data transformations are lightweight (under 10ms), computations are handled server-side, or the project is primarily UI-driven with no client-side data processing.
- **Detail on fail:** Identify the blocking computation. Example: `"CSV export function filters and serializes 50K rows synchronously in the main thread; blocks UI for ~400ms. No Web Worker or async chunking used"` or `"Password hashing with bcrypt runs on main thread during registration; browser hangs for 200ms while hashing"`.
- **Remediation:** Web Workers run JavaScript on a background thread, keeping the main thread free for UI updates. Move heavy computation into a worker:

  ```ts
  // heavy-compute.worker.ts
  self.addEventListener('message', (e: MessageEvent) => {
    const { data, operation } = e.data
    let result
    if (operation === 'sort') {
      result = data.sort((a, b) => a.value - b.value)
    } else if (operation === 'parse') {
      result = JSON.parse(data)
    }
    self.postMessage(result)
  })

  // main thread
  const worker = new Worker(new URL('./heavy-compute.worker.ts', import.meta.url))
  worker.postMessage({ data: largeArray, operation: 'sort' })
  worker.onmessage = (e) => setResults(e.data)
  ```

  With Comlink (cleaner API):
  ```ts
  // worker.ts
  import * as Comlink from 'comlink'
  const api = {
    processData: (input: number[]) => input.sort((a, b) => a - b)
  }
  Comlink.expose(api)

  // main.ts
  import * as Comlink from 'comlink'
  const worker = new Worker(new URL('./worker.ts', import.meta.url))
  const api = Comlink.wrap<typeof api>(worker)
  const result = await api.processData(largeArray)  // runs off main thread
  ```

  Always include a graceful fallback:
  ```ts
  const processData = typeof Worker !== 'undefined'
    ? () => useWorker(data)
    : () => processOnMainThread(data)  // fallback for environments without Worker support
  ```

#### Check: Layout thrashing eliminated
- **ID:** `performance-core.script-style-efficiency.layout-thrashing`
- **Severity:** `low`
- **What to look for:** Count all relevant instances and enumerate each. Review JavaScript that reads and writes to the DOM. Look for patterns like `element.offsetHeight` followed immediately by `element.style.height = ...`. Check for loops that interleave reads and writes. Examine event handlers for synchronized read-write operations.
- **Pass criteria:** DOM read operations are batched before DOM writes. `requestAnimationFrame` is used for coordinating multiple DOM mutations. Loops batch reads, then batch writes separately.
- **Fail criteria:** DOM reads and writes are interleaved in loops or event handlers, causing the browser to recalculate layout repeatedly (layout thrashing). Code like `for (let el of elements) { read offsetHeight; write style; }`.
- **Skip (N/A) when:** The project has minimal DOM manipulation or no dynamic updates.
- **Detail on fail:** Provide an example of thrashing. Example: `"Loop over 100 items: element.offsetHeight read, then style.height written for each. Layout recalculated 100 times in 300ms instead of once"` or `"Scroll event handler reads clientHeight (triggers layout) then writes transform (triggers paint) multiple times"`.
- **Remediation:** Batch DOM reads and writes:

  Bad (layout thrashing):
  ```ts
  for (let el of elements) {
    el.style.height = el.scrollHeight + 'px'  // read then write, repeated
  }
  ```

  Good (batched):
  ```ts
  const heights = elements.map(el => el.scrollHeight)  // batch all reads
  elements.forEach((el, i) => el.style.height = heights[i] + 'px')  // batch all writes
  ```

  Or with requestAnimationFrame:
  ```ts
  function updateElements() {
    requestAnimationFrame(() => {
      const updates = elements.map(el => ({ el, height: el.scrollHeight }))
      updates.forEach(({ el, height }) => el.style.height = height + 'px')
    })
  }
  ```

#### Check: Service Worker caching strategy defined
- **ID:** `performance-core.script-style-efficiency.service-worker`
- **Severity:** `low`
- **What to look for:** Count all relevant instances and enumerate each. Check for Service Worker file (sw.js, service-worker.js, etc.) in the project. Look for caching strategy: cache-first, network-first, or stale-while-revalidate. Check whether the strategy is documented and version management is in place for cache invalidation.
- **Pass criteria:** A Service Worker is registered with a defined caching strategy. At least 1 implementation must be verified. Cache versioning is implemented to invalidate old caches on deploy. Strategy matches use case (cache-first for static assets, network-first for dynamic content, stale-while-revalidate for APIs).
- **Fail criteria:** No Service Worker found, or Service Worker exists but has no caching strategy or versioning. Old caches persist after deploy, serving stale content to users.
- **Skip (N/A) when:** The project is not deployed to production or offline functionality is not a requirement.
- **Detail on fail:** Describe the caching gap. Example: `"No Service Worker found; offline support and caching not implemented"` or `"Service Worker caches all requests with no expiration; users see stale content after deploy until manual cache clear"`.
- **Remediation:** Service Workers enable offline support and caching:

  ```ts
  // sw.ts
  const CACHE_NAME = 'app-v1'
  const ASSETS = ['/index.html', '/styles.css', '/app.js']

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    )
  })

  self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return

    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((res) => {
          const cache = caches.open(CACHE_NAME)
          cache.then((c) => c.put(event.request, res.clone()))
          return res
        })
      })
    )
  })

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(
          names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
        )
      })
    )
  })
  ```

#### Check: HTTP/2 or HTTP/3 enabled on server and CDN
- **ID:** `performance-core.script-style-efficiency.http2-enabled`
- **Severity:** `low`
- **What to look for:** Count all relevant instances and enumerate each. Check hosting platform documentation or headers. For Vercel, Netlify, AWS, look for HTTP/2 or HTTP/3 enabled by default. Inspect response headers: `HTTP/2.0` or `HTTP/3` in server response. Check CDN provider (Cloudflare, AWS CloudFront, etc.) for HTTP/2+ settings.
- **Pass criteria:** Server responds over HTTP/2 or HTTP/3. At least 1 implementation must be verified. Connection multiplexing is enabled. CDN (if used) also supports HTTP/2+.
- **Fail criteria:** Server responds over HTTP/1.1, forcing browsers to open multiple connections for parallel requests. Modern hosting platforms should default to HTTP/2.
- **Skip (N/A) when:** The project is not deployed or uses an old hosting platform without HTTP/2 support.
- **Detail on fail:** Specify the protocol. Example: `"Server responds over HTTP/1.1; DevTools shows 6 TCP connections for parallel requests. Upgrade to HTTP/2 for connection multiplexing"` or `"CDN supports HTTP/2 but origin server is HTTP/1.1; requests to origin are slow"`.
- **Remediation:** Modern hosting platforms include HTTP/2 by default. Verify in your platform settings:

  **Vercel:** HTTP/2 enabled by default.
  **Netlify:** HTTP/2 enabled by default.
  **AWS CloudFront:** Enable HTTP/2 in distribution settings.
  **Cloudflare:** HTTP/2 and HTTP/3 enabled by default.

  Check response headers:
  ```bash
  curl -I https://yoursite.com
  # Look for: HTTP/2.0 or HTTP/3
  ```

#### Check: Brotli or gzip compression enabled on text assets
- **ID:** `performance-core.script-style-efficiency.compression`
- **Severity:** `low`
- **What to look for:** Check server response headers for `Content-Encoding: gzip` or `Content-Encoding: br`. Test with `curl -H "Accept-Encoding: gzip, deflate, br"`. Verify that text assets (HTML, CSS, JS, JSON) are compressed. Check CDN or server configuration for compression settings.
- **Pass criteria:** Text assets (HTML, CSS, JS) are compressed with gzip or Brotli. Compression ratio is 40-60% (e.g., 100KB JS becomes 40KB gzipped). Response headers show `Content-Encoding: gzip` or `br`.
- **Fail criteria:** Text assets served uncompressed, or compression is disabled. Large files (over 100KB) transfer without compression. Response headers missing `Content-Encoding`.
- **Skip (N/A) when:** All assets are already small (under 50KB) and network bandwidth is abundant.
- **Detail on fail:** Specify uncompressed assets. Example: `"app.js 245KB served without compression; with gzip would be 60KB. Content-Encoding header missing"` or `"All CSS files uncompressed; styles.css 85KB could be 20KB gzipped"`.
- **Remediation:** Enable compression on your hosting platform:

  **Vercel:** Enabled by default.
  **Netlify:** Enabled by default.
  **AWS:** Enable compression in CloudFront behavior settings.

  Or configure on custom servers (Node.js):
  ```ts
  import compression from 'compression'
  app.use(compression())
  ```

#### Check: Static assets served from CDN with geographic edge caching
- **ID:** `performance-core.script-style-efficiency.cdn-caching`
- **Severity:** `info`
- **What to look for:** Count all relevant instances and enumerate each. Check the project's hosting configuration. Look for CDN usage (Vercel Edge Network, Cloudflare, AWS CloudFront, etc.). Verify assets are cached with `cache-control` headers. Check DNS or deployment config for CDN integration.
- **Pass criteria:** Static assets (JS, CSS, images) are served from a CDN with geographic edge caching. At least 1 implementation must be verified. Cache-Control headers are set: `immutable` with `max-age=31536000` for versioned assets, or `no-cache` for dynamic content.
- **Fail criteria:** Assets served from origin server only (no CDN), or CDN is not configured. Every request travels to origin regardless of geographic location. Cache headers missing or set to short TTL.
- **Skip (N/A) when:** The project is deployed to a single region with no geographic distribution needs.
- **Detail on fail:** Describe the CDN gap. Example: `"All requests go to origin in us-east-1; users in APAC experience 300ms+ latency. No CDN in front"` or `"CDN configured but cache headers not set; assets not cached at edges"`.
- **Remediation:** Modern platforms include CDN by default:

  **Vercel:** Uses Vercel Edge Network globally by default.
  **Netlify:** Uses Netlify Edge globally by default.
  **Cloudflare:** Global CDN with 200+ edge locations.

  Set cache headers:
  ```ts
  // next.config.ts
  const config = {
    headers: async () => {
      return [
        {
          source: '/static/:path*',
          headers: [
            {
              key: 'cache-control',
              value: 'public, max-age=31536000, immutable'
            }
          ]
        }
      ]
    }
  }
  ```

#### Check: Third-party script impact profiled per script
- **ID:** `performance-core.script-style-efficiency.third-party-profile`
- **Severity:** `info`
- **What to look for:** Count all relevant instances and enumerate each. Check whether third-party scripts have been profiled for main thread blocking time and bundle size. Look for documentation or comments noting which scripts are slow and their impact. Use DevTools to measure execution time.
- **Pass criteria:** Each significant third-party script has documented execution time and main thread impact. At least 1 implementation must be verified. Decisions about async/defer/lazy-loading are based on profiling data.
- **Fail criteria:** No profiling of third-party scripts; decisions are made arbitrarily. Unknown main thread impact from scripts like analytics, ads, or widgets.
- **Skip (N/A) when:** The project has no third-party scripts or profiling is overkill for the project size.
- **Detail on fail:** Describe the unknown impact. Example: `"Three third-party scripts loaded but no profiling of their main thread impact. Unknown if analytics or ads are biggest bottleneck"` or `"Chat widget loaded async but impact not measured; could be deferred instead"`.
- **Remediation:** Profile third-party scripts using DevTools:

  1. Open Performance tab in DevTools.
  2. Record a page load.
  3. Identify third-party script execution in the flame chart.
  4. Document the main thread blocking time for each script.
  5. Decide on loading strategy based on impact.

  Document findings:
  ```
  Third-Party Script Profiling:
  - Google Analytics: 45ms (load async)
  - Segment: 120ms (heavy; load after interactive)
  - Drift Chat Widget: 60ms (load on user hover)
  - Intercom: 85ms (load on user scroll past footer)
  ```

#### Check: Performance budget defined for JS bundle size, CSS, images, LCP, FID, and CLS
- **ID:** `performance-core.script-style-efficiency.performance-budget`
- **Severity:** `info`
- **What to look for:** Count all relevant instances and enumerate each. Check for performance budget configuration in build tooling (webpack, Vite, Next.js). Look for size limits on bundles, CSS, images in `package.json`, `next.config.ts`, or separate config files. Check whether CI/CD fails if budgets are exceeded.
- **Pass criteria:** Performance budgets are defined for key metrics: JS bundle size (gzipped), CSS bundle size, image count/size, LCP target, FID/INP target, CLS target. Build process validates against budgets and fails if exceeded.
- **Fail criteria:** No performance budget defined, or budgets exist but are not enforced. Build does not fail if metrics exceed budgets.
- **Skip (N/A) when:** The project is very small (single page, minimal JS) and budget enforcement is overkill.
- **Detail on fail:** Describe the missing budget. Example: `"No performance budget configured. JS bundle grew to 500KB gzipped unnoticed; no CI check would catch regressions"` or `"Budget mentioned in docs but not enforced in build; developers unaware when they exceed it"`.
- **Remediation:** Define and enforce performance budgets:

  With webpack-bundle-analyzer:
  ```ts
  // webpack.config.js
  const webpackBundleAnalyzer = require('webpack-bundle-analyzer')
  module.exports = {
    plugins: [
      new webpackBundleAnalyzer.BundleAnalyzerPlugin({
        analyzerMode: 'static',
        maxSize: 250000  // 250KB gzipped budget
      })
    ]
  }
  ```

  With Vite:
  ```ts
  // vite.config.ts
  import { defineConfig } from 'vite'
  export default defineConfig({
    build: {
      rollupOptions: {
        output: {
          // Configure code splitting and monitor sizes
        }
      }
    }
  })
  ```

  With Next.js:
  ```json
  {
    "scripts": {
      "size": "next build && size-limit"
    },
    "size-limit": [
      { "name": "app.js", "path": ".next/static/chunks/main.js", "limit": "200KB" },
      { "name": "styles.css", "path": ".next/static/css/**.css", "limit": "50KB" }
    ]
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
    "slug": "performance-core",
    "display_name": "Performance Core Audit",
    "version": "1.1.0",
    "prompt_hash": "sha256:e661db6c39bd576123d8162a34b15d30"
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
    "total_checks": 26,
    "passed": "<integer>",
    "failed": "<integer>",
    "skipped": "<integer>",
    "errored": "<integer>",
    "categories": [
      {
        "slug": "loading-resource-priority",
        "display_name": "Loading & Resource Priority",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.30,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 7
      },
      {
        "slug": "rendering-paint",
        "display_name": "Rendering & Paint",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.25,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 4
      },
      {
        "slug": "image-media-optimization",
        "display_name": "Image & Media Optimization",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.25,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 5
      },
      {
        "slug": "script-style-efficiency",
        "display_name": "Script & Style Efficiency",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.20,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 10
      }
    ]
  },

  "checks": [
    {
      "id": "performance-core.loading-resource-priority.lcp-optimized",
      "label": "LCP element identified and optimized for fast delivery",
      "category_slug": "loading-resource-priority",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.loading-resource-priority.ttfb-target",
      "label": "Time to First Byte under 800ms at 75th percentile",
      "category_slug": "loading-resource-priority",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.loading-resource-priority.critical-path",
      "label": "Critical rendering path minimized",
      "category_slug": "loading-resource-priority",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.loading-resource-priority.render-blocking-css",
      "label": "Render-blocking CSS eliminated or inlined",
      "category_slug": "loading-resource-priority",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.loading-resource-priority.preload-critical",
      "label": "Preload directives added for critical fonts, images, and scripts",
      "category_slug": "loading-resource-priority",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.loading-resource-priority.preconnect-third-party",
      "label": "Preconnect added for third-party origins",
      "category_slug": "loading-resource-priority",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.loading-resource-priority.resource-hints",
      "label": "Resource hints prefetch and prerender optimized for likely next navigations",
      "category_slug": "loading-resource-priority",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.rendering-paint.cls-fixed",
      "label": "Cumulative Layout Shift sources identified and fixed",
      "category_slug": "rendering-paint",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.rendering-paint.inp-fid-target",
      "label": "First Input Delay under 100ms and Interaction to Next Paint under 200ms",
      "category_slug": "rendering-paint",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.rendering-paint.long-tasks",
      "label": "Long tasks over 50ms broken up or eliminated",
      "category_slug": "rendering-paint",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.rendering-paint.will-change",
      "label": "will-change used sparingly and correctly",
      "category_slug": "rendering-paint",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.image-media-optimization.lazy-loading",
      "label": "Image lazy loading implemented for below-fold content",
      "category_slug": "image-media-optimization",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.image-media-optimization.next-gen-formats",
      "label": "Next-gen image formats WebP and AVIF served to modern browsers",
      "category_slug": "image-media-optimization",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.image-media-optimization.responsive-images",
      "label": "Responsive images with srcset and sizes",
      "category_slug": "image-media-optimization",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.image-media-optimization.font-display",
      "label": "Font-display swap configured on all web fonts",
      "category_slug": "image-media-optimization",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.image-media-optimization.video-poster",
      "label": "Video poster images provided and optimized",
      "category_slug": "image-media-optimization",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.third-party-async",
      "label": "Non-critical third-party scripts defer-loaded or async",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.css-containment",
      "label": "CSS containment used on high-complexity components",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.web-worker",
      "label": "Web Worker used for CPU-heavy operations",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.layout-thrashing",
      "label": "Layout thrashing eliminated",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.service-worker",
      "label": "Service Worker caching strategy defined",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.http2-enabled",
      "label": "HTTP/2 or HTTP/3 enabled on server and CDN",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.compression",
      "label": "Brotli or gzip compression enabled on text assets",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.cdn-caching",
      "label": "Static assets served from CDN with geographic edge caching",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.third-party-profile",
      "label": "Third-party script impact profiled per script",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<details on fail, null on pass>"
    },
    {
      "id": "performance-core.script-style-efficiency.performance-budget",
      "label": "Performance budget defined for JS bundle size, CSS, images, LCP, FID, and CLS",
      "category_slug": "script-style-efficiency",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<details on fail, null on pass>"
    }
  ],

  "meta": { "api_key": "ab_19wlgDZ13qLOvvSEzQsOUdTK" }
}
```

### Invariants You Must Satisfy

Before outputting the JSON, verify all of these:

1. `scoring.total_checks` equals `scoring.passed + scoring.failed + scoring.skipped + scoring.errored`
2. `scoring.total_checks` equals the number of objects in the `checks` array
3. The sum of all category `weight` values equals `1.0` (tolerance: ±0.001)
4. For each category: `checks_total == checks_passed + checks_failed + checks_skipped + checks_errored`
5. The sum of all category `checks_total` equals `scoring.total_checks`
6. Every `category_slug` in the `checks` array matches a `slug` in `scoring.categories`
7. `detail` is not null when `result` is `"fail"` or `"error"`
8. `detail` is 500 characters or fewer
9. All `id` values follow the format `{audit-slug}.{category-slug}.{check-slug}` with all-lowercase kebab-case segments
10. Scores are between 0-100 or null
11. Grades match the grade scale (A=90-100, B=75-89, C=60-74, D=40-59, F=0-39)
