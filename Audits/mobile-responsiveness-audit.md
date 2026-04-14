# AuditBuffet: Mobile Responsiveness Audit

**Audit Slug:** `mobile-responsiveness`
**Version:** `1.2.0`
**Prompt Hash:** `sha256:f4b85598d4b4945d1556071e08cee501`

> **Account context:** The user copied this prompt from their AuditBuffet dashboard
> (auditbuffet.com) for their project "Stackwatch". The API key in this prompt was placed
> here by their account to link submissions to their project dashboard.

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit evaluates your project's mobile responsiveness — how well it works on phones, tablets, and different screen sizes. It covers the essential patterns that AI-built projects commonly miss: viewport configuration, responsive layouts, touch-friendly interface sizing, and common mobile UX problems.

This audit focuses on structural and configuration-level responsiveness issues. It does not include full visual testing across all device sizes (that requires browser-based testing) or detailed mobile performance optimization — those are covered in the Performance & Load Readiness Audit.

This audit covers viewport and configuration, layout and scaling, touch and interaction, and mobile UX fundamentals. It does not cover mobile performance (payload size, image optimization, Core Web Vitals) — those are addressed in the Performance & Load Readiness Audit. Touch target sizing in the context of accessibility is also covered in the Accessibility Fundamentals Audit.

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

1. **Framework:** Check `package.json` dependencies for next, react, vue, nuxt, svelte, sveltekit, astro, remix, angular, gatsby, express, fastify, hono, etc. Check for framework config files (next.config._, nuxt.config._, svelte.config._, astro.config._, vite.config.\*, etc.).
2. **Framework Version:** Read from `package.json` dependencies or lock file.
3. **Language:** Check for `tsconfig.json` (TypeScript) or absence thereof (JavaScript). Check file extensions (.ts, .tsx, .js, .jsx, .py, .go, .rs, etc.).
4. **Database:** Look for database connection patterns in config files, ORM config files (prisma/schema.prisma, drizzle.config.\*, etc.), database-related dependencies (pg, mysql2, mongodb, @supabase/supabase-js, firebase, etc.).
5. **ORM:** Check for prisma, drizzle, typeorm, sequelize, mongoose, knex, kysely in dependencies.
6. **Auth:** Look for next-auth/authjs, clerk, lucia, supabase auth, firebase auth, auth0, kinde, better-auth in dependencies or config.
7. **Hosting:** Check for vercel.json, netlify.toml, fly.toml, railway.json, render.yaml, Dockerfile, .github/workflows with deployment targets, wrangler.toml (Cloudflare).
8. **UI Library:** Check for shadcn-ui (components.json), radix-ui, chakra-ui, mantine, material-ui, ant-design, headless-ui in dependencies. Check for tailwindcss, css-modules, styled-components, emotion in config/dependencies.
9. **Project Type:** Infer from structure — web-app (has both pages and API routes), api (primarily API routes/serverless), static-site (no server components or API routes), library (has build/publish config), cli (has bin field in package.json).
10. **Project Size:** Count routes/pages — small (<20), medium (20-100), large (100+).

For each field, record what you detected. Use `null` for anything you cannot determine. Never guess — if the signal isn't clear, use `null`.

---

## How to Analyze

**Next.js Route Group Shadowing:** When the detected framework is Next.js and route groups are used (e.g., `(marketing)/page.tsx`), check whether a plain `app/page.tsx` also exists at the same route level. If both exist, `app/page.tsx` takes precedence and the route group page is effectively shadowed. This commonly occurs when the create-next-app boilerplate `page.tsx` is not deleted after adding route groups. Treat the shadowing page as the actual served page for all checks targeting the `/` route.

Examine the following in order:

1. `<head>` section of root layout or HTML template — viewport meta tag configuration
2. Global CSS files and Tailwind config — base font size, responsive breakpoints, overflow rules
3. Layout components — check for fixed-width containers with pixel values exceeding 640
4. Image components — max-width, responsive sizing, width/height attributes
5. Navigation component — mobile menu implementation (hamburger, bottom nav, or equivalent pattern)
6. Form components — input sizing, label placement, touch target sizing
7. Modal and dialog components — viewport constraints, overflow handling on small screens
8. CSS media queries across the codebase — breakpoint coverage for phone (<=640px) and tablet (<=1024px)
9. Interactive elements — hover-only states, touch target dimensions, event handler types
10. Flex and Grid layouts — wrap behavior on narrow viewports, overflow direction

---

## Check Definitions

### Category: Viewport & Config

**Slug:** `viewport`
**Weight in overall score:** 0.25

#### Check: Viewport meta tag is present and correctly configured

- **ID:** `mobile-responsiveness.viewport.viewport-meta`
- **Severity:** `critical`
- **What to look for:** Check the root layout or HTML template for a `<meta name="viewport">` tag. Verify the content attribute includes `width=device-width` and `initial-scale=1`. Watch for `user-scalable=no` or `maximum-scale=1` which prevent user zooming (this is a separate accessibility concern but should be noted).
- **Pass criteria:** Before evaluating, extract and quote the exact viewport meta tag content string from the root layout or HTML template. Count all viewport meta tag declarations across all layout files. At least 1 declaration must exist with both required properties: `width=device-width` and `initial-scale=1`. The tag must contain at least 2 required properties. Report: "X viewport meta declarations found across Y layout files." Do NOT pass when the tag is present but missing either `width=device-width` or `initial-scale=1`.
- **Fail criteria:** No viewport meta tag found in any layout file, or the tag is missing `width=device-width` or `initial-scale=1`. Report even on pass: "Viewport meta content: '[exact content string]'."
- **Skip (N/A) when:** Never — every web project that renders HTML needs a viewport meta tag.
- **Detail on fail:** Describe specifically what is wrong. For example: `"No viewport meta tag found in root layout — mobile browsers will render at desktop width by default"` or `"Viewport meta tag present but missing initial-scale=1 — only 1 of 2 required properties found"`.
- **Cross-reference:** Disabling user zoom (`user-scalable=no`) is an accessibility violation — see the Accessibility Fundamentals Audit for WCAG 1.4.4 guidance.
- **Remediation:** Without a correctly configured viewport meta tag, mobile browsers render the page at a desktop width (typically 980px) and then scale it down, making text unreadably small. Add this to your root `<head>`:

  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ```

  In Next.js App Router, set this in your root `layout.tsx`:

  ```tsx
  export function generateViewport() {
    return { width: "device-width", initialScale: 1 };
  }
  ```

---

#### Check: No fixed-width containers that exceed mobile viewport

- **ID:** `mobile-responsiveness.viewport.no-fixed-width`
- **Severity:** `critical`
- **What to look for:** Search layout and page components for fixed pixel widths applied to containers that are intended to fill the viewport. Look for inline styles like `width: 800px`, Tailwind classes like `w-[900px]`, or CSS rules like `width: 1200px` on wrapper elements. Distinguish between fixed-width containers with a `max-width` + centering pattern (fine) versus those that force the page to be wider than the viewport.
- **Pass criteria:** Count all layout and page container elements that declare a fixed pixel width. For each container with a fixed width above 640px, verify it is accompanied by a `max-width` constraint or percentage-based alternative. Report: "X containers checked; 0 of X use uncontrolled fixed widths above 640px." Do NOT pass when any container has a fixed width exceeding 640px without a `max-width`, percentage, or `min()` constraint.

  Pass patterns: `max-width: 1200px` with `width: 100%`; `width: min(1200px, 100%)`; `max-width: 80rem` with no fixed width; Tailwind `max-w-7xl w-full`.

- **Fail criteria:** Any layout container uses a fixed width exceeding 640px without `max-width` constraints, causing the page content to be wider than the viewport on mobile. At least 1 uncontrolled fixed-width container is sufficient to fail.

  Fail patterns: `width: 1200px` without `max-width` or percentage constraint; `min-width: 1024px` forcing a minimum wider than mobile viewports; any fixed pixel width above 640px without a responsive constraint.

- **Skip (N/A) when:** Never — this applies to all web projects.
- **Detail on fail:** `"Layout wrapper in app/layout.tsx has fixed width of 1200px with no max-width constraint — 1 of 5 containers causes horizontal overflow on mobile"` or `"Hero section uses inline style width: 900px without responsive override"`.
- **Remediation:** Replace fixed widths with responsive patterns:

  ```css
  /* Instead of: */
  .wrapper {
    width: 1200px;
  }

  /* Use: */
  .wrapper {
    max-width: 1200px;
    width: 100%;
  }
  ```

  In Tailwind:

  ```html
  <!-- Instead of: -->
  <div class="w-[1200px]">
    <!-- Use: -->
    <div class="max-w-6xl w-full mx-auto"></div>
  </div>
  ```

---

#### Check: CSS framework or responsive utility is configured

- **ID:** `mobile-responsiveness.viewport.responsive-framework`
- **Severity:** `medium`
- **What to look for:** Check for the presence of a responsive CSS approach: Tailwind CSS configuration, CSS Grid or Flexbox usage in layout files, media queries in global CSS, or a UI component library that provides responsive utilities (Chakra UI, Mantine, Material UI, etc.). Presence of the library as a dependency is sufficient if it appears to be used in components.
- **Pass criteria:** Count all responsive CSS approaches detected: Tailwind CSS configuration, CSS Grid or Flexbox usage in layout files, media queries in global CSS, or a UI component library with responsive utilities. At least 1 responsive CSS approach must be present. Report even on pass: "Responsive approaches detected: [list each approach found, e.g., 'Tailwind CSS, CSS Grid in 3 layout files, 2 media queries in globals.css']."
- **Fail criteria:** No responsive CSS framework, utility, or media queries detected — 0 responsive CSS approaches found, layout appears to rely entirely on static positioning.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"0 responsive CSS approaches found — no Tailwind CSS, CSS Grid/Flex usage, or media queries detected in layout files"`.
- **Remediation:** Without a responsive layout system, making a site work on mobile requires significant manual effort. Consider adding Tailwind CSS:

  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

  At minimum, use CSS media queries for critical layout breakpoints:

  ```css
  @media (max-width: 640px) {
    .layout {
      flex-direction: column;
    }
  }
  ```

---

#### Check: Base font size is at least 16px

- **ID:** `mobile-responsiveness.viewport.text-readable-mobile`
- **Severity:** `medium`
- **What to look for:** Check global CSS for the base font size on `html`, `body`, or `:root`. In Tailwind, the default base font size is 16px (1rem). Check if the default has been overridden to a smaller value. Also check form input font sizes — iOS Safari auto-zooms the page when inputs have a font-size below 16px.
- **Pass criteria:** Before evaluating, extract and quote the exact `font-size` declarations on `html`, `body`, and `:root` selectors, plus any global input/select/textarea font-size rules. Base font size must be at least 16px (or 1rem, which defaults to 16px in all major browsers). Count all form input font-size declarations. No more than 0 form input font-size declarations may be below 16px.
- **Fail criteria:** Base font size is explicitly set below 16px (e.g., `font-size: 14px` on `html` or `body`), or at least 1 form input font-size declaration is 14px or smaller.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"html element has font-size: 14px (below 16px minimum) — iOS Safari will auto-zoom the page when any text input is focused"` or `"2 of 5 input font-size declarations are below 16px"`.
- **Remediation:** Keep base font sizes at 16px or above:

  ```css
  html {
    font-size: 16px;
  }

  /* For inputs specifically */
  input,
  select,
  textarea {
    font-size: 16px;
  }
  ```

  In Tailwind, the default `text-base` class sets 16px. Avoid `text-xs` or `text-sm` on inputs.

---

### Category: Layout & Scaling

**Slug:** `layout`
**Weight in overall score:** 0.35

#### Check: No unintended horizontal scrolling at mobile widths

- **ID:** `mobile-responsiveness.layout.no-horizontal-scroll`
- **Severity:** `critical`
- **What to look for:** Search for CSS properties that commonly cause horizontal overflow: elements with `width` values that exceed the viewport, elements using `position: absolute` or `position: fixed` with offsets that push content off-screen, long unbreakable strings without `word-break` or `overflow-wrap`, `white-space: nowrap` on wide content. Check whether the body uses `overflow-x: hidden` (which hides the symptom rather than fixing the cause).
- **Pass criteria:** Count all elements with fixed widths exceeding 640px, absolute/fixed positioned elements with offsets, and `white-space: nowrap` declarations on wide content. No more than 0 uncontrolled horizontal overflow sources may exist. The body must not use `overflow-x: hidden` to mask overflow from fixed-width children. Do NOT pass when `overflow-x: hidden` is applied to `body` or `html` as a workaround for an underlying layout problem.
- **Fail criteria:** At least 1 element with a fixed width exceeding 640px without containing overflow, or `overflow-x: hidden` on the body masking an unfixed underlying problem.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"Body has overflow-x: hidden which is masking overflow from a fixed-width child container — 1 horizontal overflow source found"` or `"Absolute-positioned element in hero section extends beyond right viewport edge at mobile widths"`.
- **Remediation:** Common fixes for horizontal overflow:

  ```css
  /* Prevent width overflow globally */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  body {
    max-width: 100vw;
    overflow-x: clip;
  }

  /* Fix absolute positioned elements */
  .container {
    position: relative;
    overflow: hidden;
  }
  ```

  In Tailwind, use `w-full` instead of fixed widths and `overflow-x-clip` on the outermost wrapper.

---

#### Check: Images scale to container width on mobile

- **ID:** `mobile-responsiveness.layout.responsive-images-mobile`
- **Severity:** `high`
- **What to look for:** Check image elements and image component usage. Look for `<img>` tags with fixed `width` attributes exceeding mobile viewport widths and no `max-width: 100%`. In Next.js, check `<Image>` component usage — verify `sizes` prop is used for responsive behavior, or `fill` layout with a responsive container. Look for `max-width: 100%` in global CSS (a good sign).
- **Pass criteria:** Count all `<img>` tags and `<Image>` components in the project. For each, verify it has `max-width: 100%` applied (via global CSS, Tailwind `max-w-full`, or framework responsive defaults), or uses responsive configuration (`sizes` prop, `fill` layout). Report: "X of Y images have responsive sizing." No more than 0 images may have fixed pixel widths exceeding 640px without a `max-width: 100%` constraint.
- **Fail criteria:** At least 1 image has a fixed pixel width exceeding 640px without `max-width: 100%`, causing it to overflow its container on mobile.
- **Skip (N/A) when:** Never — images are present in virtually all web projects.
- **Detail on fail:** `"Hero image in components/hero.tsx has fixed width of 800px with no max-width constraint — 1 of 12 images overflows on mobile"` or `"Global CSS does not include max-width: 100% for img elements — 12 images lack responsive sizing"`.
- **Cross-reference:** Image performance (lazy loading, format optimization, payload size) is covered in the Performance & Load Readiness Audit.
- **Remediation:**

  ```css
  /* Global CSS */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  ```

  For Next.js Image component:

  ```tsx
  <Image
    src="/hero.jpg"
    alt="Hero image"
    width={1200}
    height={600}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="w-full h-auto"
  />
  ```

---

#### Check: Tables are scrollable or reformatted on mobile

- **ID:** `mobile-responsiveness.layout.responsive-tables`
- **Severity:** `medium`
- **What to look for:** Search for `<table>` elements in components. Check whether they are wrapped in a scrollable container (`overflow-x: auto` on a parent div), reformatted using media queries, or implemented using a responsive table pattern.
- **Pass criteria:** Count all `<table>` elements in the codebase. For each table, verify it is wrapped in a horizontally-scrollable container (`overflow-x: auto` on a parent div) or CSS reformats it for mobile display. Report: "X of Y tables have a mobile-responsive strategy (scroll wrapper or reformat)." All tables (100%) must have at least 1 responsive strategy.
- **Fail criteria:** At least 1 table exists without a horizontal scroll wrapper or mobile reformatting strategy, and table content is wide enough to cause overflow on mobile.
- **Skip (N/A) when:** No `<table>` elements detected in the codebase — 0 tables found.
- **Detail on fail:** `"1 of 3 tables lacks a responsive strategy — data table in components/dashboard/users-table.tsx has no overflow wrapper and will cause horizontal scroll on mobile"`.
- **Remediation:**

  ```html
  <div class="overflow-x-auto">
    <table class="min-w-full">
      ...
    </table>
  </div>
  ```

  For data-heavy tables, consider a stacked mobile layout:

  ```css
  @media (max-width: 640px) {
    table,
    thead,
    tbody,
    tr,
    th,
    td {
      display: block;
    }
    tr {
      margin-bottom: 1rem;
    }
  }
  ```

---

#### Check: Form inputs are full-width or appropriately sized on mobile

- **ID:** `mobile-responsiveness.layout.responsive-forms`
- **Severity:** `high`
- **What to look for:** Check form components for input sizing. Look for fixed-width inputs (e.g., `width: 300px`) that would be too wide or too narrow on mobile. Check whether inputs use full-width styling (`width: 100%`) or responsive sizing classes. Look for multi-column form layouts that may collapse poorly on mobile.
- **Pass criteria:** Count all form input elements (`<input>`, `<select>`, `<textarea>`) across the project. For each, verify it uses `width: 100%`, responsive sizing classes (Tailwind `w-full`), or is contained within a responsive form layout. Report: "X of Y form inputs use responsive sizing." No more than 0 form inputs may use fixed pixel widths exceeding 320px without a responsive constraint. Multi-column form layouts must have at least 1 mobile breakpoint that stacks columns.
- **Fail criteria:** At least 1 form input has a fixed pixel width that would render poorly on mobile (exceeding 320px without responsive override), or at least 1 multi-column form layout has no mobile breakpoint and forces horizontal scroll.

  When evaluating form input sizing, assess it relative to the viewport, not just the immediate container. If the container itself has a fixed width that causes horizontal overflow (caught by `no-horizontal-scroll` and `no-fixed-width`), form inputs that are full-width within that broken container are still effectively inaccessible on mobile. Note in detail if forms appear correct within their container but the container itself overflows the viewport.

- **Skip (N/A) when:** Never — virtually all web projects have at least one form.
- **Detail on fail:** `"2 of 8 form inputs have fixed widths — contact form inputs have fixed width of 400px, exceeding 320px limit, and will overflow on screens narrower than 420px"`.
- **Remediation:**

  ```css
  input,
  select,
  textarea {
    width: 100%;
    box-sizing: border-box;
  }
  ```

  In Tailwind:

  ```html
  <input class="w-full px-3 py-2 border rounded-md" type="text" />
  ```

  For multi-column forms, use responsive grid:

  ```html
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <input class="w-full" ... />
    <input class="w-full" ... />
  </div>
  ```

---

#### Check: Layout has breakpoints for phone and tablet

- **ID:** `mobile-responsiveness.layout.breakpoint-coverage`
- **Severity:** `medium`
- **What to look for:** Check for media query breakpoints targeting phone-sized viewports (<=640px) and tablet-sized viewports (<=1024px). In Tailwind, look for `sm:`, `md:`, `lg:` responsive prefixes on layout-affecting classes. In plain CSS, look for `@media` rules at or near 640px and 1024px thresholds.
- **Pass criteria:** Count all distinct breakpoint values used in the project (media queries and Tailwind responsive prefixes). The project must use breakpoints targeting at least 2 viewport ranges: phone (<=640px or Tailwind `sm:`) and tablet (<=1024px or Tailwind `md:`/`lg:`). Report even on pass: "Breakpoints found: [list each breakpoint value and count of usages, e.g., 'sm: (23 usages), md: (15 usages), lg: (8 usages)']."
- **Fail criteria:** Fewer than 2 viewport ranges covered — no breakpoints at the phone size range, or breakpoints exist only for tablet and not phone.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"Only 1 of 2 required viewport ranges covered — no media queries or Tailwind sm: prefixes found for phone-sized breakpoints"`.
- **Remediation:** Two breakpoints cover the essential range:

  ```css
  @media (max-width: 640px) {
    /* phone */
  }
  @media (min-width: 641px) and (max-width: 1024px) {
    /* tablet */
  }
  ```

  In Tailwind (mobile-first — no prefix = mobile base):

  ```html
  <div class="flex flex-col sm:flex-row md:grid md:grid-cols-3"></div>
  ```

---

#### Check: Flex layouts wrap appropriately on narrow screens

- **ID:** `mobile-responsiveness.layout.flex-wrap`
- **Severity:** `low`
- **What to look for:** Check flex container declarations. Look for `display: flex` without `flex-wrap: wrap` on containers holding multiple items that would overflow on narrow screens. In Tailwind, check for `flex` without `flex-wrap` (which defaults to `nowrap`). Identify flex containers holding navigation items, card grids, or horizontally-arranged elements.
- **Pass criteria:** Count all flex containers (`display: flex` or Tailwind `flex`) that hold 3 or more child items. For each, verify it uses `flex-wrap: wrap` (Tailwind `flex-wrap`), or has a responsive breakpoint that changes layout direction on mobile (e.g., `flex-col sm:flex-row`). No more than 0 multi-item flex containers may lack a wrap or direction-change strategy. Do NOT pass when any flex container with 3 or more items uses the default `nowrap` without a mobile breakpoint override.
- **Fail criteria:** At least 1 flex container without `flex-wrap: wrap` holds 3 or more items that cannot fit in a 320px-wide viewport and has no mobile breakpoint override.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"Navigation flex container has flex-wrap: nowrap with 6 items — 1 of 4 flex containers will overflow on phone widths below 320px"`.
- **Remediation:**

  ```css
  .card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .card {
    flex: 1 1 280px;
  }
  ```

  In Tailwind:

  ```html
  <div class="flex flex-wrap gap-4">
    <div class="flex-1 min-w-[280px]">...</div>
  </div>
  ```

  For navigation, switch direction on mobile:

  ```html
  <nav class="flex flex-col sm:flex-row gap-2"></nav>
  ```

---

#### Check: Layout adapts when device is rotated to landscape

- **ID:** `mobile-responsiveness.layout.landscape-support`
- **Severity:** `info`
- **What to look for:** Check for landscape-specific media queries (`@media (orientation: landscape)` or `@media (max-height: 500px)`) in CSS. In Tailwind, look for `landscape:` variant usage. Examine whether fixed-height elements (hero sections with `height: 100vh`, modals, full-screen overlays) would become unusably cramped in landscape orientation on phones where viewport height drops to 300-500px.
- **Pass criteria:** Count all `height: 100vh` and `h-screen` declarations in the project. For each, classify as "content element" (renders text/interactive content) or "background wrapper" (purely decorative). No more than 0 content elements may use `height: 100vh` without a landscape media query override or `min-height: 100dvh` alternative. Report even on pass: "Found X instances of height: 100vh/h-screen; Y are content elements, Z have landscape overrides."
- **Fail criteria:** At least 1 content element uses `height: 100vh` (or Tailwind `h-screen`) without a landscape media query override or `min-height: 100dvh` alternative — content becomes cramped at approximately 350px height in landscape on phones.

  Pass when: No `height: 100vh` usage found, OR `height: 100vh` is accompanied by landscape adjustments, OR `min-height: 100dvh` is used instead.

- **Skip (N/A) when:** Never — check for landscape media queries in the codebase. Full visual verification across device rotations requires live URL testing.
- **Detail on fail:** `"Hero section uses height: 100vh (or h-screen) with no landscape override — 1 of 3 content elements becomes approximately 350px tall in landscape on phones"`.
- **Remediation:**

  ```css
  .hero {
    min-height: 100dvh; /* dynamic viewport height */
  }

  @media (orientation: landscape) and (max-height: 500px) {
    .hero {
      min-height: auto;
      padding: 3rem 0;
    }
  }
  ```

  In Tailwind:

  ```html
  <section class="min-h-screen landscape:min-h-0 landscape:py-12"></section>
  ```

---

### Category: Touch & Interaction

**Slug:** `touch`
**Weight in overall score:** 0.25

#### Check: Interactive elements meet minimum touch target size (44x44px)

- **ID:** `mobile-responsiveness.touch.touch-target-size`
- **Severity:** `high`
- **What to look for:** Examine interactive elements — buttons, links, icon buttons, form controls, toggle switches, checkboxes. Check their declared or computed sizes. Buttons with small font and no padding, icon-only buttons without padding, and small checkbox/radio elements are common failure points. Look for explicit sizing (`width`, `height`, `padding`) on these elements.
- **Pass criteria:** Count all interactive elements in the project: buttons, links, icon buttons, form controls, toggle switches, checkboxes. For each, estimate the rendered tap target size based on declared dimensions, padding, and min-height/min-width. All interactive elements must meet the minimum 44x44px touch target size (WCAG 2.5.5 AAA / 2.5.8 AA). Report: "X of Y interactive elements meet the 44x44px minimum." No more than 0 interactive elements may be smaller than 44x44px without padding compensation.
- **Fail criteria:** At least 1 interactive element — particularly icon-only buttons, close buttons, or small text links — is smaller than 44x44px with no padding compensation.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"Close button in modal uses a 16px icon with no padding — actual tap target is approximately 16x16px, below 44x44px minimum — 1 of 15 interactive elements fails"`.
- **Cross-reference:** Touch target sizing is also an accessibility concern — see the Accessibility Fundamentals Audit for WCAG 2.5.5 / 2.5.8 guidance.
- **Remediation:** Add padding to small interactive elements:

  ```css
  .icon-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  nav a {
    padding: 0.75rem 1rem;
    display: block;
  }
  ```

  In Tailwind:

  ```html
  <button class="w-11 h-11 flex items-center justify-center rounded-md">
    <XIcon class="w-5 h-5" />
  </button>
  ```

---

#### Check: No functionality is accessible only via hover

- **ID:** `mobile-responsiveness.touch.no-hover-only`
- **Severity:** `high`
- **What to look for:** Search for hover-dependent interactions: dropdown menus that reveal only on `:hover`, tooltips shown only on mouseover, content hidden by default and revealed only on hover, and action buttons that appear only when hovering a card or list item. Look for CSS using `:hover` to toggle visibility with no corresponding touch or click alternative.
- **Pass criteria:** Count all CSS `:hover` rules that toggle visibility, opacity, or display of interactive content (dropdown menus, tooltips, action buttons, submenus). For each hover-dependent interaction, verify it has a click/tap alternative, a keyboard alternative, or a CSS media query that makes the content always visible at mobile widths (<=640px). Report: "X hover-dependent interactions found; X of X have touch/mobile alternatives." Do NOT pass when any hover-dependent interaction lacks both a click/tap handler and a mobile visibility media query. The CSS-only media query approach is a valid solution — no click handler required if the content is always visible on touch devices.
- **Fail criteria:** At least 1 dropdown menu, tooltip, or action is only exposed via CSS `:hover` with no touch/click equivalent and no CSS media query that makes the content always visible at mobile widths.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"Dropdown navigation in components/navbar.tsx uses CSS :hover to show submenus with no JavaScript click handler or mobile fallback — 1 of 4 hover interactions inaccessible on touch"`.
- **Remediation:** Pair hover states with click/tap handlers:

  ```tsx
  const [open, setOpen] = useState(false);
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(!open)}
    >
      {/* ... */}
    </div>
  );
  ```

  For card actions, make them always visible on mobile:

  ```css
  .card-actions {
    opacity: 0;
  }
  .card:hover .card-actions {
    opacity: 1;
  }
  @media (max-width: 640px) {
    .card-actions {
      opacity: 1;
    }
  }
  ```

---

#### Check: Form inputs use appropriate types for mobile keyboards

- **ID:** `mobile-responsiveness.touch.input-types`
- **Severity:** `medium`
- **What to look for:** Examine form input elements. Check the `type` attribute on `<input>` elements. Look for inputs collecting email addresses using `type="text"`, phone numbers using `type="text"`, numeric values using `type="text"`, and URLs using `type="text"`. Also check for `inputmode` attribute usage where `type="text"` is intentionally retained.
- **Pass criteria:** Count all `<input>` elements that collect email addresses, phone numbers, numeric values, or URLs. For each, verify the `type` attribute matches the input purpose: `type="email"` for email, `type="tel"` for phone, `type="number"` for numeric, `type="url"` for URLs. An `inputmode` attribute is an acceptable alternative when `type="text"` must be retained. Report: "X of Y specialized inputs use the correct type or inputmode." No more than 0 specialized inputs may use `type="text"` without an appropriate `inputmode`.
- **Fail criteria:** At least 1 email, phone, number, or URL input uses `type="text"` without an appropriate `inputmode` attribute — mobile users will not get the optimized keyboard.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"Email input in sign-up form uses type='text' instead of type='email' — 1 of 4 specialized inputs lacks correct type, mobile users won't get the email keyboard"`.
- **Remediation:**

  ```html
  <input type="email" />
  <!-- @ symbol on keyboard -->
  <input type="tel" />
  <!-- numeric keypad -->
  <input type="number" />
  <!-- number keyboard -->
  <input type="url" />
  <!-- .com key and slash -->

  <!-- For formatted inputs where type='number' causes issues: -->
  <input type="text" inputmode="numeric" pattern="[0-9]*" />
  ```

---

#### Check: No 300ms tap delay

- **ID:** `mobile-responsiveness.touch.tap-delay`
- **Severity:** `low`
- **What to look for:** Check for `touch-action: manipulation` CSS rule applied globally (e.g., on `html` or `*` selector) OR proper viewport meta tag with `width=device-width`. Modern browsers eliminate the 300ms tap delay when either condition is met. If the viewport meta tag is missing (caught by the `viewport-meta` check), this check should specifically look for `touch-action: manipulation` as an independent mitigation.
- **Pass criteria:** At least 1 of the following 2 tap-delay mitigations must be present: (1) the `viewport-meta` check passes (meaning `width=device-width` is set, which eliminates the delay in all modern browsers), or (2) `touch-action: manipulation` is set on interactive elements or globally via a CSS rule. Count all `touch-action: manipulation` declarations if present.
- **Fail criteria:** Neither of the 2 mitigations is present — no `width=device-width` viewport meta tag AND no `touch-action: manipulation` CSS on interactive elements.
- **Skip (N/A) when:** Skip if the `viewport-meta` check passes — a correct viewport meta tag already eliminates the tap delay on modern browsers, so this check adds no independent signal in that scenario.

  Design note: This check is skipped when `viewport-meta` passes because a correct viewport meta tag eliminates the 300ms tap delay in modern browsers. The skip means this check does not contribute to the score for well-configured projects — this is intentional, as the viewport meta tag is the primary mitigation. The `touch-action: manipulation` CSS approach provides additional protection for older browsers but is not required when viewport is correctly configured.

- **Detail on fail:** `"0 of 2 tap-delay mitigations present — no width=device-width viewport meta tag and no touch-action: manipulation declarations found"`.
- **Remediation:** Modern browsers eliminate this delay automatically when `width=device-width` is set in the viewport meta tag. For older browser coverage, add:

  ```css
  button,
  a,
  [role="button"] {
    touch-action: manipulation;
  }
  ```

---

### Category: Mobile UX

**Slug:** `mobile-ux`
**Weight in overall score:** 0.15

#### Check: Navigation is usable on mobile

- **ID:** `mobile-responsiveness.mobile-ux.mobile-navigation`
- **Severity:** `high`
- **What to look for:** Examine the navigation component. Check if the desktop navigation (horizontal menu with all items visible) is replaced or supplemented with a mobile-appropriate pattern at small screen widths: a hamburger menu that toggles a mobile nav, a bottom navigation bar, or a simplified navigation approach. Look for CSS that hides the desktop nav and shows a mobile alternative at breakpoints.
- **Pass criteria:** Count all navigation items in the primary navigation component. If the navigation has 4 or more items, it must have a mobile alternative: hamburger menu with functional toggle, bottom navigation bar, or a responsive breakpoint that collapses items. Navigation with no more than 3 items may display horizontally at all screen sizes without a mobile alternative. At least 1 mobile navigation strategy must be present when item count exceeds 3.
- **Fail criteria:** A full horizontal desktop navigation with 4 or more items has no mobile alternative and would overflow or become too small to use on phone widths below 640px.
- **Skip (N/A) when:** Site is a single-page app with no navigation, or has no navigation component at all — 0 navigation components found.
- **Detail on fail:** `"Desktop navigation shows 7 items horizontally with no mobile hamburger menu or breakpoint that collapses the nav — exceeds 3-item threshold for horizontal-only display"`.
- **Remediation:**

  ```tsx
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav>
      <ul className="hidden md:flex gap-6">
        {navItems.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>

      <button
        className="md:hidden w-11 h-11 flex items-center justify-center"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {mobileMenuOpen && (
        <ul className="md:hidden flex flex-col">
          {navItems.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
  ```

---

#### Check: Fixed/sticky elements don't obscure content on small screens

- **ID:** `mobile-responsiveness.mobile-ux.no-fixed-elements-overlap`
- **Severity:** `medium`
- **What to look for:** Check for fixed or sticky positioned elements: headers, footers, cookie banners, chat widgets, CTA bars. Verify that the main content has adequate top/bottom padding or margin to account for these elements on small screens. Check that fixed footers or bottom bars don't overlap scrollable content.
- **Pass criteria:** Count all fixed or sticky positioned elements (`position: fixed`, `position: sticky`, Tailwind `fixed`, `sticky`). For each, measure its declared height and verify the adjacent content area has matching padding or margin of at least the element's height. Report: "X fixed/sticky elements found; X of X have matching content offsets." No more than 0 fixed/sticky elements may lack a corresponding content offset.
- **Fail criteria:** At least 1 fixed header, footer, or bottom bar obscures content with no padding offset, making portions of the page permanently inaccessible on mobile.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"Fixed header is 64px tall but main content has no top padding — first 64px of content is obscured on scroll, 1 of 2 fixed elements lacks offset"`.
- **Remediation:**

  ```css
  :root {
    --header-height: 64px;
  }
  main {
    padding-top: var(--header-height);
  }
  ```

  In Tailwind:

  ```html
  <header class="fixed top-0 left-0 right-0 h-16 z-50">...</header>
  <main class="pt-16">...</main>
  ```

---

#### Check: Content is readable without pinch-to-zoom

- **ID:** `mobile-responsiveness.mobile-ux.readable-without-zoom`
- **Severity:** `low`
- **What to look for:** Examine text sizing in main content areas. Check for very small font sizes used for body text: below 16px for paragraph text, below 12px for secondary text. Look for text rendered inside images (which pixelate without zoom). Check line lengths — excessively wide text columns on tablet widths can be hard to read.
- **Pass criteria:** Count all body text font-size declarations in production styles. Main body text must be at least 16px. Count all text-in-image instances (text rendered inside `<img>` or `<svg>` without text alternatives). No more than 0 content text-in-image instances may lack text alternatives. Line lengths must be controlled with `max-width` of no more than 75ch on text containers.
- **Fail criteria:** Body text is set below 16px in production styles, or at least 1 significant text content element is rendered inside images without text alternatives. The 16px threshold is used because: (1) iOS Safari auto-zooms form inputs below 16px, and (2) WCAG recommends 16px as minimum for body text on mobile. This aligns with the `text-readable-mobile` check threshold.
- **Skip (N/A) when:** Never.
- **Detail on fail:** `"Article body text uses font-size: 14px (below 16px minimum) — body text below 16px can be difficult to read on mobile and may trigger iOS auto-zoom"`.
- **Cross-reference:** Text contrast and readability accessibility is covered in the Accessibility Fundamentals Audit. Text-in-image accessibility is covered under WCAG 1.4.5.
- **Remediation:**

  ```css
  body {
    font-size: 1rem;
    line-height: 1.6;
  } /* 1rem = 16px */
  .secondary {
    font-size: 0.875rem; /* 14px — acceptable for secondary/caption text */
  }

  .prose {
    max-width: 65ch;
    margin: 0 auto;
  }
  ```

  In Tailwind:

  ```html
  <p class="text-base leading-relaxed max-w-prose"></p>
  ```

---

#### Check: Modals and dialogs are usable on mobile screens

- **ID:** `mobile-responsiveness.mobile-ux.mobile-modals`
- **Severity:** `low`
- **What to look for:** Examine modal and dialog components. Check their sizing: fixed pixel widths larger than typical phone viewports (>640px), fixed heights that exceed phone viewport heights, or lack of `overflow-y: auto` on modal content. Check whether modals have a close mechanism that works on touch. Look for modals that position content off-center on mobile due to centering patterns without `max-width: calc(100vw - 2rem)` constraints.
- **Pass criteria:** Count all modal, dialog, and overlay components in the codebase (`<dialog>`, modal library components, elements with `position: fixed` or `position: absolute` covering the viewport). For each, verify 3 requirements: (1) responsive sizing (`max-width: 90vw` or `max-width: calc(100vw - 2rem)` or similar), (2) content scrolls if needed (`overflow-y: auto`), (3) touch-accessible close mechanism (visible close button of at least 44x44px). Report: "X of Y modals meet all 3 mobile requirements."
- **Fail criteria:** At least 1 modal has a fixed width exceeding 640px without a responsive `max-width` constraint, or is positioned such that it extends off-screen on phones below 640px width.
- **Skip (N/A) when:** No modal, dialog, or overlay components detected in the codebase — 0 modals found (no `<dialog>`, no modal libraries, no elements with `position: fixed` or `position: absolute` covering the viewport).
- **Detail on fail:** `"Modal in components/ui/modal.tsx has fixed width of 600px with no max-width constraint — 1 of 3 modals will overflow phone viewports below 640px"`.
- **Remediation:**

  ```css
  .modal {
    width: 90vw;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    margin: auto;
  }
  ```

  In Tailwind with shadcn/ui:

  ```tsx
  <DialogContent className="w-[90vw] max-w-lg max-h-[90vh] overflow-y-auto">
  ```

---

#### Check: Print stylesheet or print-friendly layout is available

- **ID:** `mobile-responsiveness.mobile-ux.print-stylesheet`
- **Severity:** `info`
- **Note:** Print stylesheets are included in this audit because `@media print` is part of the CSS media query landscape. Projects that handle responsive breakpoints with media queries should also consider print media. This check is severity `info` to reflect its supplementary nature.
- **What to look for:** Check for `@media print` rules in CSS files, a linked print stylesheet (`<link rel="stylesheet" media="print">`), or print-specific Tailwind classes (`print:` variant). Check if navigation, sidebars, and interactive elements would be hidden in print mode.
- **Pass criteria:** Count all `@media print` rule blocks and `<link rel="stylesheet" media="print">` references in the project. At least 1 print CSS mechanism must exist. The print styles must hide at least 2 non-content element types (navigation, buttons, sidebars, footers, or decorative elements). Count all Tailwind `print:` variant usages if present.
- **Fail criteria:** 0 print CSS mechanisms found — no `@media print` rules, no print stylesheet link, and no Tailwind `print:` variants. Printing the page would include navigation, buttons, and all interactive UI chrome.
- **Skip (N/A) when:** Project is clearly a web application (SaaS dashboard, admin panel, interactive tool) where printing is not a reasonable use case. Skip if there are no content-focused pages (blog, documentation, invoice, report) that users would reasonably want to print — 0 printable content pages found.
- **Detail on fail:** `"0 print CSS mechanisms found — no @media print rules, no print stylesheet link, and no Tailwind print: variants — printing will include all UI chrome"`.
- **Remediation:**

  ```css
  @media print {
    nav,
    header,
    footer,
    .sidebar,
    button,
    .no-print {
      display: none !important;
    }
    body {
      font-size: 12pt;
      color: #000;
      background: #fff;
    }
    a[href]::after {
      content: " (" attr(href) ")";
    }
  }
  ```

  In Tailwind:

  ```html
  <nav class="print:hidden">...</nav>
  ```

---

## Scoring

### Severity-to-Weight Mapping

| Telemetry Severity | Weight Value |
| ------------------ | ------------ |
| `critical`         | **10**       |
| `high`             | **3**        |
| `medium`           | **3**        |
| `low`              | **1**        |
| `info`             | **1**        |

### Category Score Formula

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
| ----- | ----------- |
| A     | 90-100      |
| B     | 75-89       |
| C     | 60-74       |
| D     | 40-59       |
| F     | 0-39        |

### Edge Cases

| Scenario                            | Rule                                |
| ----------------------------------- | ----------------------------------- |
| All checks pass                     | Score = 100                         |
| All checks fail                     | Score = 0                           |
| All checks skip/error               | Score = null, Grade = null          |
| Fewer than 50% of checks applicable | Include a low-applicability warning |

---

## Output Format

### Step 1: Generate Telemetry JSON

Output the telemetry JSON block FIRST, inside a fenced code block with the language tag `json`. This is critical — if output is truncated, the telemetry must survive.

Generate a fresh UUID v4 for `submission_id`. Use the current UTC timestamp for `generated_at`. Use the `project_id` provided by the user, or generate a new UUID v4 if none was provided.

### Step 2: Generate Human-Readable Report

After the telemetry JSON, produce the audit report:

1. **Score Summary** — Overall score, grade, and category breakdown table
2. **Critical Findings** — Failed critical checks with what was found, why it matters, how to fix it
3. **Warnings** — Failed high/medium checks, same format
4. **Minor Issues** — Failed low/info checks
5. **What You're Doing Well** — Brief summary of passed checks (2-3 sentences)
6. **Skipped Checks** — N/A checks with brief reasons
7. **Next Steps** — Top 3 priorities, plus cross-references:
   - For touch target accessibility (WCAG 2.5.5), the Accessibility Fundamentals Audit covers this in detail.
   - For mobile performance (payload size, image optimization, Core Web Vitals), the Performance & Load Readiness Audit covers this in detail.
   - For mobile conversion optimization, the Marketing Site Pack: Conversion Optimization Audit covers this in detail.

**Tone:** Knowledgeable friend. No emojis. No hype. Professional, calm, warm. Group findings by severity, not category.

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

```json
{
  "schema_version": "1.0.0",
  "payload_type": "audit_telemetry",
  "submission_id": "<generate UUID v4>",
  "generated_at": "<current UTC timestamp ISO 8601>",
  "project_id": "5c6d7e8f-9a0b-4d1c-8e2f-3a4b5c6d7e8f",

  "audit": {
    "slug": "mobile-responsiveness",
    "display_name": "Mobile Responsiveness Audit",
    "version": "1.2.0",
    "prompt_hash": "sha256:a8aabd13ef51deb79972c42712486abd"
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
    "total_checks": 20,
    "passed": "<integer>",
    "failed": "<integer>",
    "skipped": "<integer>",
    "errored": "<integer>",
    "categories": [
      {
        "slug": "viewport",
        "display_name": "Viewport & Config",
        "score": "<integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.25,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 4
      },
      {
        "slug": "layout",
        "display_name": "Layout & Scaling",
        "score": "<integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.35,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 7
      },
      {
        "slug": "touch",
        "display_name": "Touch & Interaction",
        "score": "<integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.25,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 4
      },
      {
        "slug": "mobile-ux",
        "display_name": "Mobile UX",
        "score": "<integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.15,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 5
      }
    ]
  },

  "checks": [
    {
      "id": "mobile-responsiveness.viewport.viewport-meta",
      "label": "Viewport meta tag is present and correctly configured",
      "category_slug": "viewport",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.viewport.no-fixed-width",
      "label": "No fixed-width containers that exceed mobile viewport",
      "category_slug": "viewport",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.viewport.responsive-framework",
      "label": "CSS framework or responsive utility is configured (Tailwind, CSS Grid, media queries)",
      "category_slug": "viewport",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.viewport.text-readable-mobile",
      "label": "Base font size is at least 16px (prevents iOS zoom on input focus)",
      "category_slug": "viewport",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.layout.no-horizontal-scroll",
      "label": "No unintended horizontal scrolling at mobile widths",
      "category_slug": "layout",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.layout.responsive-images-mobile",
      "label": "Images scale to container width on mobile",
      "category_slug": "layout",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.layout.responsive-tables",
      "label": "Tables are scrollable or reformatted on mobile",
      "category_slug": "layout",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.layout.responsive-forms",
      "label": "Form inputs are full-width or appropriately sized on mobile",
      "category_slug": "layout",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.layout.breakpoint-coverage",
      "label": "Layout has breakpoints for phone (<=640px) and tablet (<=1024px)",
      "category_slug": "layout",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.layout.flex-wrap",
      "label": "Flex layouts wrap appropriately on narrow screens",
      "category_slug": "layout",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.layout.landscape-support",
      "label": "Layout adapts when device is rotated to landscape",
      "category_slug": "layout",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.touch.touch-target-size",
      "label": "Interactive elements meet minimum touch target size (44x44px)",
      "category_slug": "touch",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.touch.no-hover-only",
      "label": "No functionality is accessible only via hover (inaccessible on touch devices)",
      "category_slug": "touch",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.touch.input-types",
      "label": "Form inputs use appropriate types for mobile keyboards (email, tel, number, url)",
      "category_slug": "touch",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.touch.tap-delay",
      "label": "No 300ms tap delay (handled by viewport meta or touch-action CSS)",
      "category_slug": "touch",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.mobile-ux.mobile-navigation",
      "label": "Navigation is usable on mobile (hamburger menu, bottom nav, or similar pattern)",
      "category_slug": "mobile-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.mobile-ux.no-fixed-elements-overlap",
      "label": "Fixed/sticky elements don't obscure content on small screens",
      "category_slug": "mobile-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.mobile-ux.readable-without-zoom",
      "label": "Content is readable without pinch-to-zoom",
      "category_slug": "mobile-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.mobile-ux.mobile-modals",
      "label": "Modals and dialogs are usable on mobile screens",
      "category_slug": "mobile-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "mobile-responsiveness.mobile-ux.print-stylesheet",
      "label": "Print stylesheet or print-friendly layout is available",
      "category_slug": "mobile-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<string for fail/error, null for pass>"
    }
  ],

  "meta": { "api_key": "ab_19wlgDZ13qLOvvSEzQsOUdTK" }
}
```

### Telemetry Count Verification

After composing the telemetry JSON, derive ALL count fields (`passed`, `failed`, `skipped`, `errored`, and per-category equivalents) by iterating over the `checks` array and counting each result value — do NOT count them independently from memory. Then verify: `passed + failed + skipped + errored == total_checks == len(checks)`.

### Invariants You Must Satisfy

1. `scoring.total_checks` equals `scoring.passed + scoring.failed + scoring.skipped + scoring.errored`
2. `scoring.total_checks` equals the number of objects in the `checks` array (20)
3. The sum of all category `weight` values equals `1.0` (tolerance: +/-0.001)
4. For each category: `checks_total == checks_passed + checks_failed + checks_skipped + checks_errored`
5. The sum of all category `checks_total` equals `scoring.total_checks`
6. Every `category_slug` in the `checks` array matches a `slug` in `scoring.categories`
7. `detail` is not null when `result` is `"fail"` or `"error"`
8. `detail` is 500 characters or fewer
9. All `id` values follow the format `mobile-responsiveness.{category-slug}.{check-slug}` with all-lowercase kebab-case segments
10. Scores are between 0-100 or null
11. Grades match the grade scale (A=90-100, B=75-89, C=60-74, D=40-59, F=0-39)
