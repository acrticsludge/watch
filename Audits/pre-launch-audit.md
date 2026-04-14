# AuditBuffet: Pre-Launch Checklist Audit

**Audit Slug:** `pre-launch`
**Version:** `1.1.0`
**Prompt Hash:** `sha256:30a5e648eb8e257697879654043ded62`

> **Account context:** The user copied this prompt from their AuditBuffet dashboard
> (auditbuffet.com) for their project "Stackwatch". The API key in this prompt was placed
> here by their account to link submissions to their project dashboard.

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit verifies that everything is in order before you go live. It covers the operational, legal, and technical baseline that separates a project that is ready to launch from one that merely builds and deploys. Infrastructure configuration, legal compliance, user-facing polish, monitoring readiness, and production hygiene are all examined.

This audit is intentionally broad — it surfaces gaps that other focused audits (Security Headers, SEO Fundamentals, Performance & Load Readiness) go deeper on, and it catches the process and operational concerns those audits do not cover. Use it as your final gate before flipping the switch.

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

**Next.js Route Group Shadowing:** When the detected framework is Next.js and route groups are used (e.g., `(marketing)/page.tsx`), check whether a plain `app/page.tsx` also exists at the same route level. If both exist, `app/page.tsx` takes precedence and the route group page is effectively shadowed. This commonly occurs when the create-next-app boilerplate `page.tsx` is not deleted after adding route groups. Treat the shadowing page as the actual served page for all checks targeting the `/` route.

Examine the following in order:

1. `package.json` — dependencies, scripts, name, version
2. Framework config files — next.config.*, nuxt.config.*, etc.
3. `.env.example` or `.env.local` (check for production-like values vs. placeholder strings)
4. Deployment configs — vercel.json, netlify.toml, fly.toml, render.yaml, Dockerfile
5. `middleware.ts` / `middleware.js` — redirects, auth guards
6. Error handling pages — app/not-found.tsx, app/error.tsx, pages/404.tsx, pages/500.tsx
7. `public/` directory — favicon.ico, apple-touch-icon.png, manifest.json, robots.txt
8. Legal/policy pages — pages or routes matching /privacy, /terms, /cookie-policy
9. Analytics/monitoring configuration — any tracking scripts, error monitoring initialization
10. Database seed/migration files — check for leftover seed data patterns
11. Third-party integration configs — look for staging/sandbox flags in service initializations
12. Source code files — console.log statements, TODO/FIXME patterns, test utility imports

---

## Check Definitions

### Category: Infrastructure
**Slug:** `infrastructure`
**Weight in overall score:** 0.25

#### Check: DNS is configured correctly
- **ID:** `pre-launch.infrastructure.dns-configured`
- **Severity:** `high`
- **What to look for:** Count all DNS-related configuration files and domain references. Enumerate whether A/CNAME records point to the production hosting provider. Check deployment config for custom domain settings. Look for domain configuration in vercel.json, netlify.toml, or hosting platform config files. Check for CNAME, A record, or DNS verification patterns in deployment scripts or README. Look for custom domain references in the project (not just localhost or platform subdomains).
- **Pass criteria:** A custom domain is referenced in deployment configuration or documentation, indicating intentional DNS setup. Alternatively, the project is clearly intended to run on a platform subdomain (e.g., yourapp.vercel.app) with no custom domain expectation. At least 1 DNS record must point to the production hosting provider.
- **Fail criteria:** Deployment configuration references a custom domain but no DNS configuration evidence is present, suggesting DNS setup may be incomplete. If a custom domain is referenced in the codebase as the intended production URL (e.g., in environment variables, constants, metadata configuration, or `next.config.ts`) but is NOT configured in the deployment platform (Vercel, Netlify, etc.), this is a FAIL with detail explaining that the domain is referenced in code but not yet configured for deployment. An intended-but-unconfigured domain will cause production failures (broken canonical URLs, OAuth callback mismatches, email links pointing nowhere).
- **Skip (N/A) when:** Never — every project going live has a domain, whether custom or platform-assigned.

- **Cross-reference:** For SSL/TLS validity on the configured domain, see `ssl-valid`. For www redirect, see `www-redirect`.
- **Detail on fail:** `"Custom domain referenced in deployment config but no DNS configuration evidence found — verify A/CNAME records are set at your registrar"`
- **Remediation:** DNS misconfiguration is one of the most common launch-day failures. Verify your records are set before launch day:

  ```json
  // vercel.json — domain configuration
  { "domains": ["yourdomain.com", "www.yourdomain.com"] }
  ```

  1. If using Vercel: add your domain in the Vercel dashboard under Settings > Domains, then set the CNAME record your registrar to point to `cname.vercel-dns.com`, or use A records pointing to `76.76.21.21`.
  2. If using Netlify: add the domain in Site Settings > Domain Management, then set the CNAME to your Netlify site's subdomain.
  3. DNS changes can take up to 48 hours to propagate globally. Use `dig yourdomain.com` or a tool like whatsmydns.net to verify propagation before announcing launch.

  After propagation, verify your site loads at the custom domain before going live.

#### Check: SSL certificate is valid and auto-renews
- **ID:** `pre-launch.infrastructure.ssl-valid`
- **Severity:** `critical`
- **What to look for:** Enumerate all SSL/TLS configuration signals. Count certificate references in deployment config and verify the certificate covers the production domain. Check whether the project is deployed on a platform that provides automatic SSL certificate provisioning and renewal (Vercel, Netlify, Cloudflare, Fly.io, Railway, Render all do this automatically). Check deployment configs for any manual SSL certificate configuration or certificate file references. Check for certificate expiry handling in any custom server configurations.
- **Pass criteria:** The project deploys on a platform with automatic SSL provisioning, OR there is explicit certificate management configuration in the deployment setup with renewal automation. SSL certificate must be valid for at least 30 days before expiry.
- **Fail criteria:** The project uses a custom server or self-managed hosting with no evidence of SSL certificate automation. Certificate files referenced in config with no renewal mechanism.
- **Skip (N/A) when:** Never — all public-facing web projects require SSL.

- **Cross-reference:** For DNS configuration, see `dns-configured`. For HTTPS enforcement, see the Security Headers audit.
- **Detail on fail:** `"No automatic SSL provisioning detected — custom server configuration references certificate files without renewal automation"`
- **Remediation:** An expired SSL certificate takes your site offline for all users and destroys search engine trust. Use a platform that handles this automatically:

  ```bash
  # Verify SSL validity (run from terminal)
  openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates
  ```

  - **Managed platforms** (Vercel, Netlify, Cloudflare, Fly.io, Railway, Render): SSL is provisioned and renewed automatically at no cost. No action needed beyond deploying.
  - **Self-managed servers** (VPS, bare metal): Use Certbot with Let's Encrypt and configure automatic renewal via cron: `certbot renew --quiet` runs daily.
  - **Container deployments**: Use a reverse proxy like Caddy (handles SSL automatically) or Traefik with Let's Encrypt integration.

  After setup, test your SSL configuration at https://www.ssllabs.com/ssltest/ to verify the certificate is valid and the configuration is sound.

  For a deeper analysis of transport security, the Security Headers & Basics Audit covers SSL configuration and HSTS in detail.

#### Check: www/non-www redirect is configured
- **ID:** `pre-launch.infrastructure.www-redirect`
- **Severity:** `medium`
- **What to look for:** Count all redirect rules in deployment config. Enumerate whether www-to-non-www (or vice versa) redirect is configured as a 301 permanent redirect. Check framework config for redirect rules. In Next.js, look for `redirects` in `next.config.*` that handles www-to-root or root-to-www canonicalization. Check `vercel.json` for redirect rules. Check `netlify.toml` for redirect rules. Check middleware for hostname-based redirects.
- **Pass criteria:** Either a redirect from www to non-www or non-www to www is configured (consistently — one direction), OR the hosting platform handles this automatically at the domain configuration level. Exactly 1 canonical domain form must be chosen with at least 1 permanent 301 redirect from the non-canonical form.
- **Fail criteria:** No redirect configuration found and both www and non-www versions of the domain would serve the site independently without canonicalization.
- **Skip (N/A) when:** Project uses a platform subdomain only (e.g., yourapp.vercel.app) with no custom domain configured.

- **Cross-reference:** For DNS configuration, see `dns-configured`.
- **Detail on fail:** `"No www/non-www redirect configured — both versions of the domain may serve content independently, creating duplicate content and split link equity"`
- **Remediation:** Serving the same content at both www.yoursite.com and yoursite.com dilutes SEO link equity and creates a confusing user experience. Pick one canonical form and redirect the other:

  ```json
  // vercel.json — www redirect
  { "redirects": [{ "source": "https://www.yourdomain.com/(.*)", "destination": "https://yourdomain.com/$1", "permanent": true }] }
  ```

  ```js
  // next.config.js
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.yourdomain.com' }],
        destination: 'https://yourdomain.com/:path*',
        permanent: true,
      },
    ]
  }
  ```

  Alternatively, configure this at the DNS/hosting platform level — Vercel and Netlify both offer www redirect toggles in their domain settings dashboard.

  For a deeper analysis of SEO redirect configuration, the SEO Fundamentals Audit covers canonical URLs and redirect patterns.

#### Check: Environment variables are production values
- **ID:** `pre-launch.infrastructure.env-vars-production`
- **Severity:** `critical`
- **What to look for:** Count all environment variable references in the codebase. Enumerate which are required for production vs. development-only. Examine `.env.example` for the expected environment variable names. Look for any `.env` files in the project (other than `.env.example`). Check framework config and initialization code for environment-specific branching (e.g., `if (process.env.NODE_ENV === 'development')`). Look for common staging/test value indicators: API keys with `_test_`, `_sandbox_`, `_dev_` prefixes in variable names. Check Stripe configuration for `pk_test_` vs `pk_live_` key patterns in how the env var is named or documented. Check for any hardcoded `localhost` URLs in non-dev config paths. Before evaluating, extract and quote the first 5 environment variable names referenced in the codebase (names only, not values).
- **Pass criteria:** Environment variable names follow production naming conventions, no evidence of test/sandbox service keys being used in production (e.g., Stripe test keys should not be in production env), and no localhost URLs in production-facing configuration. 100% of required production environment variables must be configured in the hosting platform.
- **Fail criteria:** Evidence of test/sandbox API keys configured for a production deployment context, or localhost/127.0.0.1 URLs in production configuration files, or environment variable documentation shows test values set as defaults.
- **Skip (N/A) when:** Never — environment variable hygiene applies to all projects.
- **Do NOT pass when:** Environment variables are set but contain development/test values (e.g., `DATABASE_URL` pointing to localhost, API keys with "test" or "dev" in the name).

- **Cross-reference:** For debug mode that depends on environment, see `debug-mode-disabled`.
- **Detail on fail:** `"Evidence of test/sandbox configuration for production deployment: Stripe test key pattern referenced in production env setup, or localhost URL in production config"`
- **Remediation:** Using test/sandbox credentials in production is a frequent vibe-coded project failure. Payments don't process, emails don't deliver, and third-party integrations silently fail:

  ```bash
  # Verify all required env vars are set in Vercel
  vercel env ls production
  ```

  1. Audit every service integration: Stripe (pk_live_ not pk_test_), email providers (production SMTP credentials), OAuth apps (production client IDs), CDN/storage buckets (production credentials).
  2. Ensure your hosting platform's environment variable configuration (Vercel dashboard, Netlify environment variables) contains production values — not values from your local `.env.local`.
  3. Check that `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, or equivalent has your real production domain, not localhost.
  4. After deploying with production credentials, trigger a test payment, registration, and email to confirm end-to-end functionality.

#### Check: Debug mode is disabled in production
- **ID:** `pre-launch.infrastructure.debug-mode-disabled`
- **Severity:** `critical`
- **What to look for:** Count all debug/development mode flags in the codebase. Enumerate occurrences of `debug: true`, `NODE_ENV !== "production"` guards, verbose logging, and source map exposure. Check framework config for debug settings. In Next.js, look for any non-standard debug configuration. Check for `DEBUG=true`, `APP_DEBUG=true`, or similar debug flags. Look for development-only middleware or error handlers that might be included in production. Check for verbose logging configuration that should not run in production. Check for any framework-specific dev tools that might be bundled (React DevTools in production builds, Vue DevTools, etc.).
- **Pass criteria:** No explicit debug mode enabled for production. `NODE_ENV` is expected to be `"production"` in the deployment context. No debug flags set in deployment configuration. Zero debug/development flags active in production configuration. No more than 0 debug flags should be enabled in production.
- **Fail criteria:** `DEBUG=true` or equivalent debug flags set in production deployment configuration. Development-only error handlers or verbose logging configured to run in production without environment guards.
- **Skip (N/A) when:** Never — debug mode discipline applies to all projects.
- **Do NOT pass when:** Debug mode is disabled in the main config but a middleware or plugin re-enables verbose logging or exposes source maps.

- **Cross-reference:** For console.log cleanup, see `console-logs-cleaned`. For environment variables, see `env-vars-production`.
- **Detail on fail:** `"Debug flag or verbose development mode configuration found that should not be active in production: check DEBUG, APP_DEBUG, or framework-specific debug settings in deployment config"`
- **Remediation:** Debug mode in production exposes internal application state, detailed error messages, and stack traces that attackers can exploit:

  ```ts
  // next.config.js — ensure production mode
  module.exports = { productionBrowserSourceMaps: false }
  ```

  1. Ensure your deployment platform sets `NODE_ENV=production` (Vercel and Netlify do this automatically).
  2. Remove any `DEBUG=true` or `APP_DEBUG=true` from production environment variable configuration.
  3. If you use custom logging levels, ensure production uses `warn` or `error` level, not `debug` or `verbose`.
  4. Verify your framework is not serving development-mode assets (Next.js will warn if you accidentally deploy in development mode).

  For a deeper analysis of information exposure through error handling, the Security Headers & Basics Audit covers this in detail.

#### Check: Custom domain email is configured
- **ID:** `pre-launch.infrastructure.custom-email`
- **Severity:** `info`
- **What to look for:** Count all email-from addresses in the codebase. Enumerate which use the custom domain vs. free email providers. Check whether the project references a custom domain email address in any contact pages, footer components, legal pages, or environment variable names (SUPPORT_EMAIL, CONTACT_EMAIL, FROM_EMAIL env vars in `.env.example`). Look for email addresses using the deployed domain rather than gmail.com, yahoo.com, or other free providers.
- **Pass criteria:** A custom domain email address is referenced in the project (e.g., hello@yourdomain.com, support@yourdomain.com), OR no contact email is surfaced to users. At least 100% of transactional emails must use the custom domain (e.g., noreply@yourdomain.com).
- **Fail criteria:** A free provider email (gmail.com, yahoo.com, hotmail.com, etc.) is used as the primary contact or from address for a project deployed to a custom domain.
- **Skip (N/A) when:** Skip if the project does not surface a contact email address to users and does not send transactional email from a user-visible address.

- **Cross-reference:** For email delivery verification, see `email-delivery`.
- **Detail on fail:** `"Project uses a free email provider address for contact/support on a custom domain — creates a less professional impression and limits email deliverability"`
- **Remediation:** Using a custom domain email (hello@yourcompany.com) instead of a free provider address builds trust and improves email deliverability:

  ```ts
  // lib/email.ts — custom domain email
  const from = "noreply@yourdomain.com"  // Not: "yourbrand@gmail.com"
  ```

  1. Set up email forwarding through your domain registrar or DNS provider (Google Domains, Cloudflare, Namecheap all offer free forwarding to your existing inbox).
  2. For sending transactional email, configure your email provider (Resend, SendGrid, Postmark) with your custom domain and complete DKIM/SPF/DMARC authentication.
  3. Update your `.env` / environment configuration to use the custom domain address as the `FROM_EMAIL`.
  4. Google Workspace or similar services provide full custom domain email with familiar interfaces if you need a managed inbox.

---

### Category: Legal & Compliance
**Slug:** `legal`
**Weight in overall score:** 0.20

#### Check: Privacy policy page exists
- **ID:** `pre-launch.legal.privacy-policy`
- **Severity:** `critical`
- **What to look for:** Count all privacy-related pages and links. Enumerate whether a privacy policy page exists and is linked from the footer or signup flow. Search for a route or page that serves a privacy policy. Look for files matching patterns like `privacy.tsx`, `privacy/page.tsx`, `privacy-policy.tsx`, `legal/privacy.tsx`. Check for navigation links to a privacy page in layout components. Check for any links in footer components pointing to a privacy URL.
- **Pass criteria:** A privacy policy page exists at a reachable route (e.g., `/privacy`, `/privacy-policy`, `/legal/privacy`). At least 1 privacy policy page must exist and be linked from the site footer.
- **Fail criteria:** No privacy policy page found anywhere in the project routes.
- **Skip (N/A) when:** Skip only if this is a purely internal tool with no external users and no data collection of any kind. Signal: project type is `api` or `cli` with no user-facing pages and no analytics or tracking dependencies.

- **Cross-reference:** For terms of service, see `terms-of-service`. For cookie consent, see `cookie-consent`.
- **Detail on fail:** `"No privacy policy page found — required for any project that collects user data, uses analytics, or processes personal information"`
- **Remediation:** A privacy policy is legally required in most jurisdictions (GDPR, CCPA, CalOPPA) for any application that collects personal data, uses cookies, or employs analytics tools. This is not optional for a public launch:

  ```tsx
  // components/footer.tsx — privacy policy link
  <Link href="/privacy">Privacy Policy</Link>
  // Ensure app/privacy/page.tsx exists
  ```

  1. Create a page at `/privacy` or `/privacy-policy`.
  2. Your privacy policy must disclose: what data you collect, why you collect it, how long you keep it, who you share it with (including third-party services like Google Analytics, Stripe, etc.), and how users can request deletion.
  3. For a SaaS in the US with EU users, you need GDPR compliance language including data processing basis and user rights.
  4. Use a service like Termly, Iubenda, or PrivacyPolicies.com to generate a policy appropriate to your stack if writing from scratch is impractical.
  5. Link the privacy policy in your site footer on every page.

#### Check: Terms of service page exists
- **ID:** `pre-launch.legal.terms-of-service`
- **Severity:** `high`
- **What to look for:** Count all terms-related pages and links. Enumerate whether a terms of service page exists and is linked from the footer or signup flow. Search for a route or page that serves terms of service. Look for files matching patterns like `terms.tsx`, `terms/page.tsx`, `tos.tsx`, `terms-of-service.tsx`, `legal/terms.tsx`. Check footer navigation components for links to terms pages.
- **Pass criteria:** A terms of service page exists at a reachable route (e.g., `/terms`, `/terms-of-service`, `/tos`, `/legal/terms`). At least 1 terms of service page must exist and be linked from the site footer.
- **Fail criteria:** No terms of service page found anywhere in the project routes.
- **Skip (N/A) when:** Skip for static informational sites or internal tools with no user accounts, transactions, or user-generated content. Signal: no auth dependencies, no payment dependencies, no user input beyond contact forms.

- **Cross-reference:** For privacy policy, see `privacy-policy`.
- **Detail on fail:** `"No terms of service page found — strongly recommended for any SaaS, marketplace, or application where users create accounts or conduct transactions"`
- **Remediation:** Terms of service define the rules of engagement between you and your users. They protect you legally and set user expectations:

  ```tsx
  // components/footer.tsx — terms link
  <Link href="/terms">Terms of Service</Link>
  // Ensure app/terms/page.tsx exists
  ```

  1. Create a page at `/terms` or `/terms-of-service`.
  2. Core sections to include: acceptable use, what the service does and doesn't guarantee, payment and refund terms (if applicable), account termination conditions, limitation of liability, and governing law.
  3. For SaaS products, also include subscription terms, data handling commitments, and API usage terms if you have an API.
  4. Link the terms in your footer, at account signup (with a "By signing up you agree to our Terms" pattern), and in any checkout flow.
  5. Use a template service (Termly, Docracy, etc.) as a starting point, but have a lawyer review if your exposure is significant.

#### Check: Cookie consent mechanism is present
- **ID:** `pre-launch.legal.cookie-consent`
- **Severity:** `high`
- **What to look for:** Count all cookie-setting mechanisms and third-party scripts that use cookies. Enumerate whether a cookie consent banner or mechanism exists. Check for cookie consent banner components or libraries. Look for dependencies like `react-cookie-consent`, `cookieyes`, `onetrust`, `osano`, `@porscheofficial/cookie-consent-banner`. Check for any cookie consent component in the UI. Check if analytics scripts (Google Analytics, Mixpanel, etc.) are loaded conditionally based on consent state. Check for cookie consent configuration in any consent management platform configs.
- **Pass criteria:** A cookie consent mechanism is present that either (a) shows a consent banner before setting non-essential cookies, or (b) the project uses only essential/functional cookies and explicitly documents this. At least 1 cookie consent mechanism must be present if the site sets non-essential cookies.
- **Fail criteria:** Analytics, tracking, or advertising scripts are loaded without any consent mechanism, and no evidence of a purely-essential-cookies architecture exists.
- **Skip (N/A) when:** Skip if no analytics, tracking, or third-party cookies are used. Signal: no analytics dependencies (google-analytics, @analytics, mixpanel, segment, hotjar, etc.) and no advertising or tracking pixel integrations. Also skip for internal tools with no external users.

- **Cross-reference:** For privacy policy that describes cookie usage, see `privacy-policy`.
- **Detail on fail:** `"Analytics or tracking scripts loaded without cookie consent mechanism — required under GDPR and ePrivacy Directive for EU users"`
- **Remediation:** Loading analytics or tracking cookies without prior consent violates GDPR for EU users and similar laws globally. The fine exposure is real:

  ```tsx
  // components/cookie-banner.tsx — consent banner
  // Use a library like cookie-consent or build a custom banner in app/layout.tsx
  ```

  1. Add a consent banner library: `react-cookie-consent` is simple for basic needs; CookieYes or Iubenda provide more comprehensive compliance tools.
  2. Wrap analytics initialization in a consent check — only load Google Analytics (or equivalent) after the user accepts.
  3. A minimal compliant approach: show a banner on first visit with Accept/Decline options. Store the preference in a first-party cookie. Load tracking scripts only when preference is `accepted`.
  4. If you genuinely only use essential cookies (session cookies for auth, CSRF tokens), document this in your privacy policy and you do not need a consent banner.

---

### Category: User-Facing Essentials
**Slug:** `user-facing`
**Weight in overall score:** 0.20

#### Check: Custom 404 page is present and helpful
- **ID:** `pre-launch.user-facing.custom-404`
- **Severity:** `medium`
- **What to look for:** Count all error page implementations. Enumerate whether a custom 404 page exists with navigation back to the site. Check for custom 404 pages: `app/not-found.tsx` in Next.js App Router, `pages/404.tsx` in Next.js Pages Router, `404.html` in static sites, or equivalent error pages in other frameworks. Evaluate whether the page provides navigation help (links back to home or main sections) rather than just displaying "404 Not Found."
- **Pass criteria:** A custom 404 page exists that provides navigation options (at minimum a link back to the homepage) and does not expose framework internals. At least 1 custom 404 page must exist with navigation links and brand styling.
- **Fail criteria:** No custom 404 page found, or the default framework 404 page is in use.
- **Skip (N/A) when:** Never — every web project served to users should have a custom 404 page.

- **Cross-reference:** For custom 500 page, see `custom-500`.
- **Detail on fail:** `"No custom 404 page found — using framework default which may expose internal details and provides no navigation help to lost users"`
- **Remediation:** Users hitting broken links or mistyped URLs should be gently redirected, not abandoned on a bare "404 Not Found" page:

  ```tsx
  // app/not-found.tsx — custom 404 page
  export default function NotFound() { return <div><h1>Page Not Found</h1><Link href="/">Go Home</Link></div> }
  ```

  ```tsx
  // app/not-found.tsx (Next.js App Router)
  import Link from 'next/link'

  export default function NotFound() {
    return (
      <main>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/">Return home</Link>
      </main>
    )
  }
  ```

  A good 404 page includes: a clear message that the page wasn't found, a link back to the homepage, optionally a search bar or links to popular sections, and your site's normal navigation header.

#### Check: Custom 500 page is present and does not expose internals
- **ID:** `pre-launch.user-facing.custom-500`
- **Severity:** `high`
- **What to look for:** Count all error boundary and error page implementations. Enumerate whether a custom 500/error page exists with user-friendly messaging. Check for custom error/500 pages: `app/error.tsx` and `app/global-error.tsx` in Next.js App Router, `pages/500.tsx` in Pages Router, or equivalent. Inspect the error page component to verify it does not render error details, stack traces, or internal paths when displayed to users. Check that the component accepts the error prop but does not render `error.message` or `error.stack` directly.
- **Pass criteria:** A custom error page exists that displays a generic user-friendly message without rendering error details, stack traces, or internal file paths. The error page must BOTH (1) hide technical details from users AND (2) capture the error for server-side observability. At minimum, the error boundary should call `console.error(error)` in a `useEffect` (for client components) or log to a monitoring service. An error page that renders a friendly message but silently discards the error object is a partial implementation — note in the detail that error capture is missing if only condition (1) is satisfied. At least 1 custom error page must exist with user-friendly messaging.
- **Fail criteria:** No custom error page found, or a custom error page exists but renders `error.message` or `error.stack` directly in the UI.
- **Skip (N/A) when:** Never — every web project should have a safe error handling page.

- **Cross-reference:** For custom 404, see `custom-404`. For error monitoring, see `error-monitoring`.
- **Detail on fail:** `"No custom error page found, relying on framework default"` or `"Custom error.tsx renders error.message directly in the UI — stack traces visible to users in production"`
- **Remediation:** The default framework error page may expose stack traces and internal paths to users. Create a custom error boundary that logs internally but shows nothing sensitive:

  ```tsx
  // app/error.tsx — custom error page
  'use client'
  export default function Error({ reset }: { reset: () => void }) { return <div><h1>Something went wrong</h1><button onClick={reset}>Try Again</button></div> }
  ```

  ```tsx
  // app/error.tsx
  'use client'
  import { useEffect } from 'react'

  export default function Error({
    error,
    reset,
  }: {
    error: Error & { digest?: string }
    reset: () => void
  }) {
    useEffect(() => {
      // Log to your error monitoring service
      console.error(error)
    }, [error])

    return (
      <main>
        <h1>Something went wrong</h1>
        <p>We've been notified and are working on a fix.</p>
        <button onClick={() => reset()}>Try again</button>
      </main>
    )
  }
  ```

  Never render `error.message` or `error.stack` in the UI — log these server-side or to your monitoring service. For a deeper analysis of error exposure, the Security Headers & Basics Audit covers information disclosure in detail.

#### Check: Favicon is present
- **ID:** `pre-launch.user-facing.favicon`
- **Severity:** `medium`
- **What to look for:** Count all favicon files and references. Enumerate which formats are present (ICO, PNG, SVG) and which sizes. Check `public/` directory for `favicon.ico`, `favicon.png`, or `favicon.svg`. Check `app/` directory for Next.js App Router favicon convention (`favicon.ico` at `app/favicon.ico`). Check `<link rel="icon">` tags in the HTML document `<head>` or layout components. Check `<link>` tags in layout.tsx or _document.tsx.
- **Pass criteria:** A favicon file exists in an expected location, or a `<link rel="icon">` tag references a valid icon file. At least 1 favicon file must exist in `public/` or `app/` with at least 2 sizes (16x16 and 32x32).
- **Fail criteria:** No favicon found — the site will show a browser default blank icon in tabs and bookmarks.
- **Skip (N/A) when:** Never — even minimal web projects benefit from a favicon.

- **Cross-reference:** For apple touch icon, see `apple-touch-icon`. For social sharing images, see `social-sharing`.
- **Detail on fail:** `"No favicon.ico, favicon.png, or <link rel='icon'> found — site will display a blank browser tab icon"`
- **Remediation:** A missing favicon makes your site look unfinished. The tab icon also appears in bookmarks, browser history, and mobile home screen shortcuts:

  ```tsx
  // app/layout.tsx — favicon metadata
  export const metadata = { icons: { icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png', sizes: '32x32' }] } }
  ```

  1. Create a 32x32 (minimum) icon as `favicon.ico` or `favicon.png`.
  2. In Next.js App Router, place `favicon.ico` directly in the `app/` directory — it's picked up automatically.
  3. For `pages/` router, add to `public/favicon.ico` and ensure the HTML `<head>` includes `<link rel="icon" href="/favicon.ico">`.
  4. For multi-size support, use a favicon generator (favicon.io or realfavicongenerator.net) to generate all required sizes.

#### Check: Apple touch icon is present
- **ID:** `pre-launch.user-facing.apple-touch-icon`
- **Severity:** `low`
- **What to look for:** Count all apple-touch-icon files and references. Enumerate whether a 180x180 PNG exists in public/ or is configured in metadata. Check `public/` directory for `apple-touch-icon.png` (standard filename) or `apple-touch-icon-precomposed.png`. Check `<head>` in layout components for `<link rel="apple-touch-icon">` tags. Check `app/` directory for icon.png or apple-icon.png (Next.js App Router convention).
- **Pass criteria:** An apple-touch-icon exists at `public/apple-touch-icon.png` or is referenced in the document head, OR the Next.js App Router icon convention provides equivalent coverage. At least 1 apple-touch-icon at 180x180 pixels must be present.
- **Fail criteria:** No apple-touch-icon found.
- **Skip (N/A) when:** Skip for API-only projects, CLI tools, or projects explicitly not targeting mobile/web-app usage. Signal: no HTML pages in the project.

- **Cross-reference:** For favicon, see `favicon`. For web manifest, see `web-manifest`.
- **Detail on fail:** `"No apple-touch-icon.png found — iOS users adding the site to their home screen will see a screenshot thumbnail instead of a proper icon"`
- **Remediation:** When users add your site to their iOS home screen, Apple uses the touch icon. Without it, iOS generates a screenshot thumbnail, which looks unprofessional:

  ```tsx
  // app/layout.tsx — apple touch icon
  export const metadata = { icons: { apple: '/apple-touch-icon.png' } }
  // Ensure public/apple-touch-icon.png exists (180x180 PNG)
  ```

  1. Create a 180x180 PNG named `apple-touch-icon.png` and place it in `public/`.
  2. Add to your HTML head: `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`.
  3. In Next.js App Router, place `apple-icon.png` in the `app/` directory for automatic handling.
  4. Use realfavicongenerator.net to generate all icon sizes simultaneously.

#### Check: Social sharing preview metadata is configured
- **ID:** `pre-launch.user-facing.social-sharing`
- **Severity:** `medium`
- **What to look for:** Count all OG (Open Graph) and Twitter Card meta tags. Enumerate which required properties are present: og:title, og:description, og:image, og:url, twitter:card. Check layout components and page metadata for Open Graph and Twitter Card tags. In Next.js App Router, look for a `metadata` export with `openGraph` and `twitter` properties in `app/layout.tsx` or key page files. In Pages Router, look for `<meta property="og:title">`, `<meta property="og:image">`, `<meta name="twitter:card">`, etc. in `_app.tsx` or individual pages. Check if an `og:image` is defined and references a real image file in `public/`. Before evaluating, extract and quote the first 3 OG meta tag values found in the codebase.
- **Pass criteria:** At minimum, `og:title`, `og:description`, and `og:image` are configured at the site level, and a valid OG image file exists or URL is provided. At least 4 of 5 required social meta tags (og:title, og:description, og:image, og:url, twitter:card) must be present.
- **Fail criteria:** No Open Graph tags found, or `og:image` is missing (the most critical OG tag for link previews), or `og:image` references a file that doesn't exist in `public/`.
- **Skip (N/A) when:** Skip for API-only projects or internal tools not meant for social sharing. Signal: project type is `api` or `cli`, no public-facing marketing pages.

- **Cross-reference:** For favicon and icons, see `favicon`.
- **Detail on fail:** `"No Open Graph metadata found — links shared on social media and messaging apps will render as plain text with no preview image"`
- **Remediation:** When your URL is shared on social media, Slack, or messaging apps, platforms read Open Graph tags to generate a rich preview with title, description, and image. Without them, your link looks bare and gets ignored:

  ```tsx
  // app/layout.tsx — social sharing metadata
  export const metadata = { openGraph: { title: '...', description: '...', images: '/og.png', url: 'https://yoursite.com' }, twitter: { card: 'summary_large_image' } }
  ```

  ```tsx
  // app/layout.tsx (Next.js App Router)
  export const metadata = {
    openGraph: {
      title: 'Your Site Name',
      description: 'A clear, compelling description of what your product does.',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Your Site Name',
      description: 'A clear, compelling description.',
      images: ['/og-image.png'],
    },
  }
  ```

  The OG image should be 1200x630 pixels for best cross-platform compatibility. Validate your tags at https://opengraph.xyz or the Twitter Card Validator. For a deeper analysis of SEO and social metadata, the SEO Fundamentals Audit covers this comprehensively.

#### Check: Mobile responsiveness is verified
- **ID:** `pre-launch.user-facing.mobile-responsive`
- **Severity:** `high`
- **What to look for:** Count all viewport meta tags and responsive CSS patterns (media queries, flexbox, grid). Enumerate whether the layout adapts to mobile screen widths (under 768px). Check that a responsive viewport meta tag is present (`<meta name="viewport" content="width=device-width, initial-scale=1">`). Check that CSS uses responsive techniques: Tailwind responsive prefixes (sm:, md:, lg:), CSS media queries, or a responsive UI framework. Check that layouts do not use fixed-width containers without responsive breakpoints. Look for evidence of mobile-specific layout handling (flex-col on mobile, flex-row on desktop patterns).
- **Pass criteria:** Viewport meta tag is present, and the CSS/layout approach demonstrates responsive design intent (responsive framework or media queries present). At least 1 viewport meta tag and at least 3 responsive CSS patterns must be present.
- **Fail criteria:** No viewport meta tag found, or all layout components use fixed-width containers with no responsive breakpoints.
- **Skip (N/A) when:** Skip for API-only projects with no HTML pages. Signal: project type is `api` with no frontend pages.

- **Cross-reference:** For cross-browser testing, see `cross-browser`.
- **Detail on fail:** `"No viewport meta tag found"` or `"All layout containers use fixed pixel widths with no responsive breakpoints — site will not render correctly on mobile devices"`
- **Remediation:** Over 60% of web traffic comes from mobile devices. A non-responsive layout loses the majority of potential users:

  ```tsx
  // app/layout.tsx — viewport meta
  export const metadata = { viewport: { width: 'device-width', initialScale: 1 } }
  ```

  1. Ensure the viewport meta tag is in your `<head>`: `<meta name="viewport" content="width=device-width, initial-scale=1">`.
  2. In Next.js App Router, add it to `app/layout.tsx` via the metadata object or directly in the head.
  3. If using Tailwind, use responsive prefixes: `flex-col sm:flex-row`, `w-full md:w-1/2`, etc.
  4. Test on real mobile devices or browser dev tools device simulator at 375px (iPhone SE) and 390px (iPhone 14) widths minimum.
  5. Pay special attention to: navigation menus collapsing correctly, forms remaining usable, tables scrolling horizontally rather than overflowing.

  For a thorough analysis of mobile responsiveness across your entire codebase, the Mobile Responsiveness Audit covers this in depth.

#### Check: Cross-browser compatibility is addressed
- **ID:** `pre-launch.user-facing.cross-browser`
- **Severity:** `medium`
- **What to look for:** Count all browser-specific CSS prefixes and polyfills. Enumerate whether CSS features used are supported across major browsers (Chrome, Firefox, Safari, Edge). Check `.browserslistrc` or `browserslist` field in `package.json` for browser target configuration. Check for any polyfills or compatibility shims in the project. Check if the project uses any cutting-edge CSS features (CSS Grid subgrid, container queries, `has()` selector) or JavaScript APIs without fallbacks. Look for postcss config with autoprefixer. Check if the framework's default browserslist config is retained or overridden.
- **Pass criteria:** A browserslist configuration targeting modern browsers is present (framework default counts), or the project uses autoprefixer/postcss for CSS compatibility, or the project documents intentional browser support decisions. At least 95% of CSS features used must be supported in the last 2 versions of major browsers.
- **Fail criteria:** No browserslist configuration and evidence of CSS features or JavaScript APIs used without browser support checks or polyfills, suggesting compatibility has not been considered.
- **Skip (N/A) when:** Skip for API-only projects with no frontend. Skip for projects explicitly targeting Chromium/Electron-only environments.

- **Cross-reference:** For mobile responsiveness, see `mobile-responsive`.
- **Detail on fail:** `"No browserslist configuration found and project uses CSS/JS features that may not be supported in all target browsers"`
- **Remediation:** Modern frameworks handle most compatibility concerns automatically, but it's worth verifying your setup:

  ```json
  // package.json — browserslist for compatibility
  { "browserslist": ["last 2 versions", "> 1%", "not dead"] }
  ```

  1. Most frameworks (Create React App, Next.js, Vite) include a default browserslist targeting modern browsers — verify yours hasn't been removed.
  2. If you use PostCSS, ensure `autoprefixer` is in your PostCSS config to handle CSS vendor prefixes.
  3. Check caniuse.com for any advanced CSS or JavaScript features you're using — particularly CSS Grid subgrid, the `has()` selector, or new Web APIs.
  4. Test in at minimum: Chrome (latest), Firefox (latest), Safari (latest — especially iOS Safari, which has the most web platform gaps), and Edge (latest).
  5. For iOS Safari specifically, be careful with: CSS `gap` in flexbox (well-supported now but verify), smooth scrolling behavior, and `position: sticky` in certain contexts.

---

### Category: Monitoring & Backup
**Slug:** `monitoring`
**Weight in overall score:** 0.20

#### Check: Error monitoring is configured
- **ID:** `pre-launch.monitoring.error-monitoring`
- **Severity:** `high`
- **What to look for:** Count all error monitoring integrations (Sentry, Bugsnag, Datadog, etc.). Enumerate which capture frontend vs. backend errors. Check dependencies for error monitoring libraries: `@sentry/nextjs`, `@sentry/react`, `@sentry/node`, `bugsnag`, `rollbar`, `datadog`, `honeybadger`, `raygun`, `trackjs`. Check for Sentry configuration files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `sentry.config.ts`). Check for error monitoring initialization in `_app.tsx`, `layout.tsx`, `instrumentation.ts`, or middleware. Check for error capture calls in API routes and error boundaries.
- **Pass criteria:** An error monitoring service is initialized in the project and configured to capture both client-side and server-side errors. At least 1 error monitoring service must be configured for production.
- **Fail criteria:** No error monitoring library found in dependencies or configuration.
- **Skip (N/A) when:** Never for production web applications — knowing when your app is broken is fundamental.
- **Report even on pass:** Report the monitoring service found: "Error monitoring configured with [service name]."

- **Cross-reference:** For uptime monitoring, see `uptime-monitoring`. For custom error pages, see `custom-500`.
- **Detail on fail:** `"No error monitoring library detected — production errors will be silent and you will only learn about failures from user reports"`
- **Remediation:** Without error monitoring, you're flying blind. Real users will hit errors you never see in development:

  ```ts
  // app/layout.tsx — Sentry initialization
  import * as Sentry from '@sentry/nextjs'
  Sentry.init({ dsn: process.env.SENTRY_DSN })
  ```

  1. **Sentry** is the most common choice and has a generous free tier: `npm install @sentry/nextjs` then run `npx @sentry/wizard@latest -i nextjs` for automatic configuration.
  2. Sentry captures unhandled exceptions, API route errors, and can track performance. Configure source map uploading so stack traces show your original code rather than minified output.
  3. Set up alert rules in Sentry to notify you (email/Slack) when new errors occur.
  4. Ensure error monitoring is initialized early in your app's lifecycle — for Next.js, use `instrumentation.ts` for server-side initialization.
  5. After setup, trigger a test error to confirm captures are working before launch.

#### Check: Uptime monitoring is configured
- **ID:** `pre-launch.monitoring.uptime-monitoring`
- **Severity:** `medium`
- **What to look for:** Count all uptime monitoring configurations or references. Enumerate whether an external uptime service monitors the production URL. Check for uptime monitoring service configuration or references. Look for: BetterUptime, UptimeRobot, Pingdom, Checkly, Freshping, or StatusPage configuration files. Check for a `/api/health` or `/api/ping` endpoint that returns a health status. Check README or documentation for uptime monitoring setup instructions. Check for monitoring-related environment variables.
- **Pass criteria:** An uptime monitoring service is configured (even if via external account setup rather than code), OR a health check endpoint exists that an uptime service could monitor. At least 1 uptime monitoring service must be configured.
- **Fail criteria:** No uptime monitoring service referenced and no health check endpoint found.
- **Skip (N/A) when:** Skip for static sites hosted on highly-available platforms (Vercel, Netlify, Cloudflare Pages) where downtime is extremely rare and the platform provides status pages. Signal: project type is `static-site` deployed to a major CDN-backed platform.
- **Report even on pass:** Report the monitoring setup: "Uptime monitoring configured with [service name] checking [frequency]."

- **Cross-reference:** For error monitoring, see `error-monitoring`.
- **Detail on fail:** `"No uptime monitoring configured and no health check endpoint found — you will not be notified if the site goes down"`
- **Remediation:** You shouldn't find out your site is down because a user complained. Uptime monitoring alerts you the moment something fails:

  ```yaml
  # .github/workflows/uptime.yml or use external service
  # Configure BetterUptime, UptimeRobot, or Vercel's built-in monitoring
  ```

  1. **UptimeRobot** has a free tier monitoring every 5 minutes — sign up and point it at your homepage URL.
  2. **BetterUptime** or **Checkly** provide more advanced options with multi-step checks and on-call scheduling.
  3. Create a health check endpoint for more reliable monitoring:

     ```ts
     // app/api/health/route.ts
     export async function GET() {
       return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
     }
     ```

  4. Point your uptime monitor at `/api/health` rather than the homepage — it's faster and avoids triggering analytics on monitor checks.
  5. Configure alert escalation: immediate notification on first failure, with reminders if the issue persists.

#### Check: Database backup strategy is defined
- **ID:** `pre-launch.monitoring.db-backup`
- **Severity:** `critical`
- **What to look for:** Count all database backup configurations and references. Enumerate whether automated backups are configured for the production database. Check for database backup configuration. For Supabase, look for backup settings references or documentation. For Prisma/PostgreSQL, look for backup scripts, cron job configurations, or backup service references (pg_dump scripts, AWS RDS automated backup config, Planetscale/Neon backup docs). Check for backup-related environment variables or scripts in `package.json`. Check README for backup procedures.
- **Pass criteria:** A database backup strategy is documented or configured: platform-managed backups (Supabase paid plan, Neon, PlanetScale, AWS RDS), a backup script that runs on a schedule, or explicit documentation of backup procedures. For Supabase specifically: pass only if there is evidence of the Pro plan (e.g., project settings referencing Pro, billing configuration), a scheduled backup script (e.g., `pg_dump` cron or GitHub Actions workflow calling `supabase db dump`), or documented backup procedures. Supabase's free plan has no automated backups — relying on the free plan without supplemental backup procedures is a FAIL. At least 1 automated backup schedule must be configured with backups retained for at least 7 days.
- **Fail criteria:** No evidence of any backup strategy for a project that has a database dependency.
- **Skip (N/A) when:** Skip if no database dependency is detected. Signal: no database-related dependencies (prisma, drizzle, typeorm, sequelize, mongoose, pg, mysql2, @supabase/supabase-js, firebase-admin, etc.) in `package.json`.

- **Cross-reference:** For rollback plan, see `rollback-plan`.
- **Detail on fail:** `"Database detected but no backup strategy found — a corrupted or accidentally deleted database would be unrecoverable"`
- **Remediation:** Without backups, a single database corruption event, accidental deletion, or infrastructure failure permanently destroys your users' data:

  ```sql
  -- Supabase: backups are automatic on Pro plan
  -- Verify in Supabase Dashboard > Settings > Database > Backups
  ```

  1. **Supabase**: Automated daily backups are available on the Pro plan ($25/month). On the free plan, use the Supabase CLI to export: `supabase db dump -f backup.sql`. Schedule this with a cron job or GitHub Actions.
  2. **Neon/PlanetScale/CockroachDB**: These services include automated backups — verify your plan level includes point-in-time recovery.
  3. **Self-managed PostgreSQL**: Use `pg_dump` on a cron schedule. Store backups in a different geographic region (S3, Backblaze B2).
  4. **Firebase/Firestore**: Use the export API to schedule regular exports to Google Cloud Storage.
  5. Test your backup by restoring to a staging environment at least once before launch. A backup you've never restored is an untested backup.

#### Check: Email delivery is tested and working
- **ID:** `pre-launch.monitoring.email-delivery`
- **Severity:** `high`
- **What to look for:** Count all email-sending functions and transactional email templates. Enumerate whether email delivery is configured with a production service (SendGrid, Resend, AWS SES). Check for email sending dependencies: `nodemailer`, `@sendgrid/mail`, `resend`, `postmark`, `@mailchimp/mailchimp_transactional`, `aws-sdk` (SES). Check for email templates or email sending utility files. Look for environment variables related to email (SMTP_HOST, SENDGRID_API_KEY, RESEND_API_KEY, etc. in .env.example). Check transactional email usage in auth flows, notification handlers, and contact form submissions.
- **Pass criteria:** An email sending library is present and configured with production credentials, OR the project has no email-sending functionality. At least 1 production email service must be configured (not localhost SMTP).
- **Fail criteria:** An email sending library is present but configured with test/sandbox credentials only, or there is evidence of email functionality that has never been end-to-end tested (e.g., commented test lines, TODO notes about email testing).
- **Skip (N/A) when:** Skip if no email sending library is detected and no email-related environment variables or templates are found. Signal: none of the above libraries in package.json and no SMTP/email API variables in .env.example.

- **Cross-reference:** For custom email domain, see `custom-email`.
- **Detail on fail:** `"Email sending library detected but only sandbox/test configuration found — transactional emails (password resets, notifications) may not deliver in production"`
- **Remediation:** Many vibe-coded projects use sandbox email credentials that silently discard messages. Users never receive password reset emails or onboarding notifications:

  ```ts
  // lib/email.ts — production email service
  import { Resend } from 'resend'
  const resend = new Resend(process.env.RESEND_API_KEY)
  ```

  1. Switch from test/sandbox to production email credentials in your hosting platform's environment configuration.
  2. For **Resend**: switch from test API key (re_test_...) to live key (re_...). Verify your sender domain in the Resend dashboard.
  3. For **SendGrid**: switch to production API key. Set up domain authentication (DKIM/SPF) to improve deliverability.
  4. After switching to production credentials, send a real test email to an address you control and verify receipt (including checking spam folder).
  5. Test all email flows: welcome email, password reset, notification emails, and any other transactional messages.

#### Check: Analytics tracking is installed
- **ID:** `pre-launch.monitoring.analytics`
- **Severity:** `medium`
- **What to look for:** Count all analytics integrations. Enumerate which analytics services are configured (Google Analytics, Plausible, PostHog, Vercel Analytics). Check for analytics library dependencies: `@vercel/analytics`, `@analytics/*`, `next-plausible`, `react-ga4`, `@google-analytics/*`, `mixpanel-browser`, `posthog-js`, `segment`, `@amplitude/analytics-browser`. Check for analytics initialization in layout components or `_app.tsx`. Check for `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, or similar analytics environment variables in `.env.example`. Check for `<Script>` components loading analytics providers.
- **Pass criteria:** An analytics library is initialized and configured in the project. The tracking ID or configuration appears to be a production value (not a placeholder like `YOUR_GA_ID`). At least 1 analytics service must be configured and active in production.
- **Fail criteria:** No analytics library found — no visibility into whether users are arriving, what they're doing, or where they're dropping off.
- **Skip (N/A) when:** Skip for internal tools, APIs, or CLI tools with no user-facing pages where analytics would be irrelevant. Skip for projects where the developer has intentionally decided not to use analytics and has documented this decision (look for a comment or note stating this).

- **Cross-reference:** For error monitoring, see `error-monitoring`.
- **Detail on fail:** `"No analytics library detected — you will have no visibility into user traffic, behavior, or conversion after launch"`
- **Remediation:** Without analytics, you're making product decisions blind. You won't know if your launch drove any traffic, where users are dropping off, or which features they actually use:

  ```tsx
  // app/layout.tsx — analytics integration
  import { Analytics } from '@vercel/analytics/react'
  <Analytics />
  ```

  1. **Vercel Analytics** is the simplest for Vercel-hosted projects: `npm install @vercel/analytics` and add `<Analytics />` to your root layout. Requires the Vercel Analytics addon.
  2. **Plausible** is a privacy-friendly option that doesn't require cookie consent: `npm install next-plausible`.
  3. **PostHog** offers both analytics and product analytics (session recording, funnel analysis) with a generous free tier.
  4. **Google Analytics 4** is free and comprehensive — use `@next/third-parties` for Next.js integration.
  5. Ensure the analytics tracking ID in your production environment variables is a real production ID, not a dev placeholder.

---

### Category: Final Verification
**Slug:** `final-verification`
**Weight in overall score:** 0.15

#### Check: Test and seed data has been removed
- **ID:** `pre-launch.final-verification.test-data-removed`
- **Severity:** `high`
- **What to look for:** Count all test/seed data references in the codebase. Enumerate any test users, sample data, or seed scripts that could execute in production. Check for database seed files that might have been run and left data: `prisma/seed.ts`, `prisma/seed.js`, `db/seed.*`, `scripts/seed.*`. Check for test user creation scripts or fixtures. Look for hardcoded test credentials in source code (test@example.com, admin@test.com, password: "test123", etc.). Check for test API calls in component files. Look for TODO comments referencing placeholder or test data left in place.
- **Pass criteria:** No active seed scripts or test data fixtures that would contaminate a production database. Any seed files present are clearly for development-only use and gated behind environment checks. No more than 0 test data files or seed scripts should be accessible in the production build.
- **Fail criteria:** Seed scripts that create test users or data without environment guards, hardcoded test credentials in source code, or TODO comments indicating test data was left intentionally for cleanup later.
- **Skip (N/A) when:** Skip if no database dependency is detected. Signal: no database-related dependencies in `package.json`.
- **Do NOT pass when:** Test data exists in the codebase but is "guarded" by an environment check that could fail open (e.g., `if (process.env.SEED_DATA)` where the variable might accidentally be set).

- **Cross-reference:** For staging URLs, see `staging-urls-removed`. For debug mode, see `debug-mode-disabled`.
- **Detail on fail:** `"Seed scripts or test data found without development-only guards — test accounts and dummy data may be present in the production database"`
- **Remediation:** Seed data in production creates security vulnerabilities (test accounts with known passwords) and data integrity issues:

  ```ts
  // scripts/seed.ts — ensure seed scripts are NOT included in production build
  // Add to .gitignore or use build exclusion in next.config.js
  ```

  1. Add environment guards to all seed scripts:
     ```ts
     // prisma/seed.ts
     if (process.env.NODE_ENV === 'production') {
       console.error('Seed script should not run in production')
       process.exit(1)
     }
     ```
  2. Remove or update package.json scripts that auto-run seed on deploy.
  3. Check your production database directly for test entries: email addresses like `test@`, `example.com`, or numeric placeholders.
  4. Revoke any test credentials or API keys that might exist in the production database.

#### Check: Console.log statements are cleaned up
- **ID:** `pre-launch.final-verification.console-logs-cleaned`
- **Severity:** `low`
- **What to look for:** Count all `console.log`, `console.warn`, `console.debug`, and `console.error` statements in production code. Enumerate which are intentional (error monitoring) vs. development leftovers. Search source code files for `console.log(`, `console.debug(`, `console.dir(` statements in production code paths. Exclude files in `__tests__`, `*.test.ts`, `*.spec.ts`, and development-only utilities. Look for console calls that might log sensitive data (user objects, API responses, form data). Check if there's an ESLint rule configured to flag console usage (`no-console` rule).
- **Pass criteria:** No significant `console.log` statements in production code paths, OR all console usage is appropriate for production (error logging via `console.error` in error handlers counts as acceptable). No more than 5 intentional console statements in production code. Zero `console.log` or `console.debug` in page/API components.
- **Fail criteria:** Multiple `console.log` statements in business logic, API handlers, or component files that would produce noise in production logs. Any console calls that appear to log sensitive user data.
- **Skip (N/A) when:** Never — this applies to all projects with JavaScript/TypeScript source code.

- **Cross-reference:** For debug mode, see `debug-mode-disabled`.
- **Detail on fail:** `"Multiple console.log statements found in production code paths — generates log noise and may expose sensitive data in browser devtools"`
- **Remediation:** Development console logs become noise in production and can accidentally expose sensitive data in browser devtools:

  ```js
  // eslint.config.js — warn on console usage
  { rules: { "no-console": ["warn", { allow: ["error"] }] } }
  ```

  1. Search for and remove debug logs: `grep -r "console.log" src/` (or your source directory).
  2. Keep only deliberate `console.error` calls in error handlers — these serve a production purpose.
  3. Add an ESLint rule to prevent future regressions:
     ```json
     // .eslintrc.json
     { "rules": { "no-console": ["warn", { "allow": ["error", "warn"] }] } }
     ```
  4. Consider using a proper logging library (Pino, Winston) for server-side logging that can be configured per environment.

#### Check: All third-party services are on production plans
- **ID:** `pre-launch.final-verification.third-party-production`
- **Severity:** `medium`
- **What to look for:** Count all third-party service integrations (Stripe, auth providers, email, storage). Enumerate which are configured with production API keys vs. test/sandbox keys. Check for common third-party service integrations and their plan/mode indicators. Look at: Stripe configuration (test mode vs live mode patterns in env var naming), email provider setup (test API keys vs production), authentication providers (development OAuth app vs production), storage configuration (development bucket vs production), feature flag services (development vs production environment), and any other third-party SaaS integrations. Check for "sandbox", "test", "dev", "staging" indicators in service-related environment variable names in `.env.example`.
- **Pass criteria:** All detected third-party service integrations appear configured for production use, or the project has no third-party service integrations. 100% of third-party integrations must use production API keys.
- **Fail criteria:** Evidence of test/sandbox/development-mode configurations for services that process real user actions (payments, communications, authentication).
- **Skip (N/A) when:** Never for projects with third-party integrations. Skip only if no third-party service integrations are detected.

- **Cross-reference:** For environment variable configuration, see `env-vars-production`.
- **Detail on fail:** `"Third-party service integrations appear to be in test/sandbox mode based on environment variable patterns — users may interact with services that do not perform real actions"`
- **Remediation:** Running production with sandbox services means payments don't charge, emails don't send, and auth flows may use test certificates:

  ```ts
  // lib/stripe.ts — ensure production mode
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)  // Must be sk_live_*, not sk_test_*
  ```

  1. **Stripe**: Verify `STRIPE_SECRET_KEY` starts with `sk_live_` (not `sk_test_`). Update webhook endpoints from Stripe dashboard to point to your production URL.
  2. **Email providers**: Ensure API keys are production keys, not sandbox keys. Verify sender domain authentication is complete.
  3. **OAuth providers (GitHub, Google, etc.)**: Ensure you're using a production OAuth app with your real domain in the authorized redirect URIs, not a development app with localhost.
  4. **Storage (S3, Cloudflare R2, etc.)**: Ensure you're using a production storage bucket, not a development one.
  5. Trigger a real end-to-end user journey after switching to production credentials to confirm all integrations work.

#### Check: Rollback plan exists
- **ID:** `pre-launch.final-verification.rollback-plan`
- **Severity:** `medium`
- **What to look for:** Count all deployment-related configurations and scripts. Enumerate whether a rollback mechanism exists (Vercel instant rollback, git revert workflow, blue-green deployment). Check for deployment history or rollback capability evidence. Check if the project uses platform deployments that support instant rollback (Vercel deployments list, Netlify deploy history). Check for git tags or release branches indicating versioned releases. Check README or documentation for rollback procedures. Check for database migration strategy that supports rollback (Prisma migration with down migrations, or documentation of rollback approach).
- **Pass criteria:** The project is deployed on a platform with instant rollback capability (Vercel, Netlify, Fly.io all support this), OR rollback procedures are documented, OR git tagging strategy enables easy rollback identification. For projects with a database, also verify whether database migrations support rollback (down migrations exist, or migration tool supports `migrate down`). A Vercel deployment rollback does not roll back database schema changes — a bad migration can cause data loss even after code revert. If the project has database migrations but no down migration or rollback procedure, note this in the detail field as a partial pass. At least 1 rollback mechanism must be documented or configured.
- **Fail criteria:** No evidence of rollback capability — a bad deploy would require manual intervention with no clear recovery path.
- **Skip (N/A) when:** Never — even simple projects benefit from knowing how to undo a bad deploy.

- **Cross-reference:** For database backups that support rollback, see `db-backup`.
- **Detail on fail:** `"No rollback plan or capability found — a bad production deploy would require manual recovery with no defined process"`
- **Remediation:** Something will go wrong after launch. Having a rollback plan means the difference between a 5-minute outage and a 2-hour panic:

  ```bash
  # Vercel — instant rollback to previous deployment
  vercel rollback
  ```

  1. **Vercel**: Every deploy is immutable and rollback is instant from the Vercel dashboard (Deployments > click any previous deployment > Promote to Production). This takes about 30 seconds.
  2. **Netlify**: Same concept — go to Site > Deploys and click "Publish deploy" on any previous successful build.
  3. **Database migrations**: Ensure your migration tool supports rollback. With Prisma, test `prisma migrate` rollback before launch. For Supabase, test that reverting a migration doesn't destroy data.
  4. **Document your rollback steps**: Even a 5-line note in your README ("To rollback: go to Vercel dashboard > previous deploy > Promote") is better than nothing.
  5. **Git tags**: Tag your pre-launch commit: `git tag v1.0.0` so you have a clear point to revert to.

#### Check: Web app manifest is present
- **ID:** `pre-launch.final-verification.web-manifest`
- **Severity:** `info`
- **What to look for:** Count all web manifest files and references. Enumerate which required fields are present (name, short_name, icons, start_url, display). Check `public/` directory for `manifest.json` or `manifest.webmanifest`. Check `app/` directory for `manifest.ts` or `manifest.js` (Next.js App Router convention). Check `<head>` in layout for `<link rel="manifest">` tag. The manifest should include at minimum: `name`, `short_name`, `icons`, and `display`.
- **Pass criteria:** A web app manifest exists and is linked in the document head, with at minimum `name`, `short_name`, and a set of icons defined. At least 4 of 5 required manifest fields (name, short_name, icons, start_url, display) must be present.
- **Fail criteria:** No web app manifest found.
- **Skip (N/A) when:** Skip for API-only projects and internal tools with no public-facing pages. Signal: project type is `api` or `cli`, or no HTML pages exist.

- **Cross-reference:** For favicon and icons, see `favicon`. For apple touch icon, see `apple-touch-icon`.
- **Detail on fail:** `"No web app manifest found — users cannot install the site as a PWA and OS integration features are unavailable"`
- **Remediation:** A web app manifest enables Progressive Web App features and improves the install experience:

  ```json
  // public/manifest.json or app/manifest.ts
  { "name": "Your App", "short_name": "App", "icons": [{ "src": "/icon-192.png", "sizes": "192x192" }], "start_url": "/", "display": "standalone" }
  ```

  ```ts
  // app/manifest.ts (Next.js App Router)
  import type { MetadataRoute } from 'next'

  export default function manifest(): MetadataRoute.Manifest {
    return {
      name: 'Your App Name',
      short_name: 'AppName',
      description: 'What your app does',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    }
  }
  ```

  Even if you're not building a full PWA, a manifest improves the mobile "Add to Home Screen" experience and is expected by modern browser quality checks.

#### Check: Performance baseline is documented
- **ID:** `pre-launch.final-verification.performance-baseline`
- **Severity:** `low`
- **What to look for:** Count all performance measurement configurations. Enumerate whether Lighthouse scores or Core Web Vitals baselines have been recorded for the production site. Check for any performance documentation: a Lighthouse report in the repo, performance metrics in README, a `performance.md` or similar document, or comments in code noting expected load times. Look for Lighthouse CI configuration (`.lighthouserc.json`, `.lighthouserc.js`) or web-vitals tracking integration (`web-vitals` in dependencies, `onCLS`, `onFID`, `onLCP` function calls).
- **Pass criteria:** Some evidence of performance measurement or baseline exists: a Lighthouse CI config, web-vitals tracking in the codebase, a performance report file, or README documentation of performance targets. At least 1 performance baseline measurement must be recorded with Lighthouse score at least 60.
- **Fail criteria:** No evidence of any performance measurement or baseline documentation.
- **Skip (N/A) when:** Skip for API-only projects with no user-facing pages. Signal: project type is `api` or `cli` with no HTML pages.

- **Cross-reference:** For error monitoring that includes performance, see `error-monitoring`. For analytics, see `analytics`.
- **Detail on fail:** `"No performance baseline documented — you will not know if a future change regresses load time without a reference point"`
- **Remediation:** Having a performance baseline before launch means you can detect regressions immediately. This doesn't require extensive tooling:

  ```bash
  # Record baseline with Lighthouse
  npx lighthouse https://yoursite.com --output=json --output-path=./lighthouse-baseline.json
  ```

  1. Run Lighthouse on your production URL after launch and save the report (export to JSON or HTML).
  2. Add Lighthouse CI to your repo for automated checks on every PR: install `@lhci/cli` and create `.lighthouserc.json` with your performance thresholds.
  3. Add `web-vitals` tracking to log Core Web Vitals (LCP, FID/INP, CLS) from real users.
  4. At minimum, document your target metrics in README: "Target: LCP < 2.5s, CLS < 0.1".

  For a comprehensive analysis of performance and load readiness, the Performance & Load Readiness Audit covers this in depth.

#### Check: Staging and test URLs are removed from codebase
- **ID:** `pre-launch.final-verification.staging-urls-removed`
- **Severity:** `info`
- **What to look for:** Count all URL references in the codebase. Enumerate any that point to staging, localhost, or development domains instead of the production domain. Search source code for localhost URLs, staging environment URLs, and test service endpoints that should not be present in production code. Look for: `http://localhost`, `127.0.0.1`, staging domain patterns (staging., dev., test., preview. subdomains), hardcoded development API endpoints, or commented-out production URL switches. Check API client initializations and service configurations for hardcoded non-production URLs.
- **Pass criteria:** No hardcoded localhost, staging, or test URLs found in production code paths. All URLs are either environment variables or relative paths. Zero staging or localhost URLs in production code (excluding development-only config files).
- **Fail criteria:** Hardcoded localhost URLs or staging domain URLs found in non-test production code files.
- **Scope:** This check evaluates source code files only (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, configuration files like `next.config.ts`). Environment variable files (`.env`, `.env.local`, `.env.production`, etc.) are the exclusive domain of the `env-vars-production` check and should NOT be evaluated here. If a staging/localhost URL appears only in `.env*` files but not in source code, this check passes — the issue will be caught by `env-vars-production` instead.
- **Skip (N/A) when:** Never — this applies to all projects.

- **Cross-reference:** For test data removal, see `test-data-removed`. For environment variables, see `env-vars-production`.
- **Detail on fail:** `"Hardcoded localhost or staging URLs found in production code — API calls may fail or route to test systems in production"`
- **Remediation:** Hardcoded localhost or staging URLs cause production API calls to fail silently or, worse, route to your development environment:

  ```ts
  // lib/config.ts — ensure production URLs
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL  // Must be https://yourdomain.com in production
  ```

  1. Search for localhost references: look for `localhost:` patterns in source files, excluding test files and comments.
  2. Replace all hardcoded URLs with environment variables:
     ```ts
     // Before (WRONG):
     const API_URL = 'http://localhost:3000/api'

     // After (CORRECT):
     const API_URL = process.env.NEXT_PUBLIC_API_URL
     ```
  3. Ensure `NEXT_PUBLIC_API_URL` (or equivalent) in your production environment configuration points to your real production API.
  4. Check third-party service initialization files for any hardcoded staging webhook URLs or test endpoints.

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

**Important:** Values in `<angle brackets>` below are placeholder descriptions, not literal strings. Replace them with the actual values — integers for scores, strings for text fields, null where appropriate. See Appendix C for the machine-readable JSON Schema with exact types.

### Template

```json
{
  "schema_version": "1.0.0",
  "payload_type": "audit_telemetry",
  "submission_id": "<generate UUID v4>",
  "generated_at": "<current UTC timestamp ISO 8601>",
  "project_id": "5c6d7e8f-9a0b-4d1c-8e2f-3a4b5c6d7e8f",

  "audit": {
    "slug": "pre-launch",
    "display_name": "Pre-Launch Checklist Audit",
    "version": "1.1.0",
    "prompt_hash": "sha256:d8af5e6cb933d56a8e620717752cd63b"
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
    "total_checks": 28,
    "passed": "<integer>",
    "failed": "<integer>",
    "skipped": "<integer>",
    "errored": "<integer>",
    "categories": [
      {
        "slug": "infrastructure",
        "display_name": "Infrastructure",
        "score": "<computed integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.25,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 6
      },
      {
        "slug": "legal",
        "display_name": "Legal & Compliance",
        "score": "<computed integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.20,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 3
      },
      {
        "slug": "user-facing",
        "display_name": "User-Facing Essentials",
        "score": "<computed integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.20,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 7
      },
      {
        "slug": "monitoring",
        "display_name": "Monitoring & Backup",
        "score": "<computed integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.20,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 5
      },
      {
        "slug": "final-verification",
        "display_name": "Final Verification",
        "score": "<computed integer or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.15,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 7
      }
    ]
  },

  "checks": [
    {
      "id": "pre-launch.infrastructure.dns-configured",
      "label": "DNS is configured correctly",
      "category_slug": "infrastructure",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.infrastructure.ssl-valid",
      "label": "SSL certificate is valid and auto-renews",
      "category_slug": "infrastructure",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.infrastructure.www-redirect",
      "label": "www/non-www redirect is configured",
      "category_slug": "infrastructure",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.infrastructure.env-vars-production",
      "label": "Environment variables are production values",
      "category_slug": "infrastructure",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.infrastructure.debug-mode-disabled",
      "label": "Debug mode is disabled in production",
      "category_slug": "infrastructure",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.infrastructure.custom-email",
      "label": "Custom domain email is configured",
      "category_slug": "infrastructure",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.legal.privacy-policy",
      "label": "Privacy policy page exists",
      "category_slug": "legal",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.legal.terms-of-service",
      "label": "Terms of service page exists",
      "category_slug": "legal",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.legal.cookie-consent",
      "label": "Cookie consent mechanism is present",
      "category_slug": "legal",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.user-facing.custom-404",
      "label": "Custom 404 page is present and helpful",
      "category_slug": "user-facing",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.user-facing.custom-500",
      "label": "Custom 500 page is present and does not expose internals",
      "category_slug": "user-facing",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.user-facing.favicon",
      "label": "Favicon is present",
      "category_slug": "user-facing",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.user-facing.apple-touch-icon",
      "label": "Apple touch icon is present",
      "category_slug": "user-facing",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.user-facing.social-sharing",
      "label": "Social sharing preview metadata is configured",
      "category_slug": "user-facing",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.user-facing.mobile-responsive",
      "label": "Mobile responsiveness is verified",
      "category_slug": "user-facing",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.user-facing.cross-browser",
      "label": "Cross-browser compatibility is addressed",
      "category_slug": "user-facing",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.monitoring.error-monitoring",
      "label": "Error monitoring is configured",
      "category_slug": "monitoring",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.monitoring.uptime-monitoring",
      "label": "Uptime monitoring is configured",
      "category_slug": "monitoring",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.monitoring.db-backup",
      "label": "Database backup strategy is defined",
      "category_slug": "monitoring",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.monitoring.email-delivery",
      "label": "Email delivery is tested and working",
      "category_slug": "monitoring",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.monitoring.analytics",
      "label": "Analytics tracking is installed",
      "category_slug": "monitoring",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.final-verification.test-data-removed",
      "label": "Test and seed data has been removed",
      "category_slug": "final-verification",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.final-verification.console-logs-cleaned",
      "label": "Console.log statements are cleaned up",
      "category_slug": "final-verification",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.final-verification.third-party-production",
      "label": "All third-party services are on production plans",
      "category_slug": "final-verification",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.final-verification.rollback-plan",
      "label": "Rollback plan exists",
      "category_slug": "final-verification",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.final-verification.web-manifest",
      "label": "Web app manifest is present",
      "category_slug": "final-verification",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.final-verification.staging-urls-removed",
      "label": "Staging and test URLs are removed from codebase",
      "category_slug": "final-verification",
      "result": "<pass|fail|skip|error>",
      "severity": "info",
      "detail": "<string for fail/error, null for pass>"
    },
    {
      "id": "pre-launch.final-verification.performance-baseline",
      "label": "Performance baseline is documented",
      "category_slug": "final-verification",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass>"
    }
  ],

  "meta": { "api_key": "ab_19wlgDZ13qLOvvSEzQsOUdTK" }
}
```

### Telemetry Count Verification

After composing the telemetry JSON, derive ALL count fields (`passed`, `failed`, `skipped`, `errored`, and per-category equivalents) by iterating over the `checks` array and counting each result value — do NOT count them independently from memory. Then verify: `passed + failed + skipped + errored == total_checks == len(checks)`. Repeat this for each category's `checks_passed + checks_failed + checks_skipped + checks_errored == checks_total`.

### Invariants You Must Satisfy

Before outputting the JSON, verify all of these:

1. `scoring.total_checks` equals `scoring.passed + scoring.failed + scoring.skipped + scoring.errored`
2. `scoring.total_checks` equals the number of objects in the `checks` array (should be 28)
3. The sum of all category `weight` values equals `1.0` (tolerance: +/-0.001)
4. For each category: `checks_total == checks_passed + checks_failed + checks_skipped + checks_errored`
5. The sum of all category `checks_total` equals `scoring.total_checks`
6. Every `category_slug` in the `checks` array matches a `slug` in `scoring.categories`
7. `detail` is not null when `result` is `"fail"` or `"error"`
8. `detail` is 500 characters or fewer
9. All `id` values follow the format `pre-launch.{category-slug}.{check-slug}` with all-lowercase kebab-case segments
10. Scores are between 0-100 or null
11. Grades match the grade scale (A=90-100, B=75-89, C=60-74, D=40-59, F=0-39)
