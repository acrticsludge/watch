# AuditBuffet: Error Handling Audit

**Audit Slug:** `saas-error-handling`
**Version:** `1.0.3`
**Prompt Hash:** `sha256:f2eb9779eb8b1c53597f8d4339247c27`

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit evaluates how your project handles failures — from uncaught exceptions and unhandled promise rejections to user-facing error messages and graceful degradation when services are unavailable. AI-built projects frequently ship with default or missing error handling, leaving users stranded at blank screens or cryptic technical messages when something goes wrong.

This audit covers four dimensions: error boundary coverage (how well errors are contained), error reporting (whether errors surface to your monitoring tools), user-facing error communication (whether error messages help users recover), and graceful degradation (whether partial failures stay partial instead of cascading). It does not cover the root causes of the errors themselves — for deeper analysis of input validation and API security, the SaaS API Design Audit covers those areas.

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
4. **Database:** Look for database connection strings in config (not .env contents — just the presence of config patterns), ORM config files (prisma/schema.prisma, drizzle.config.\*, etc.), database-related dependencies (pg, mysql2, mongodb, @supabase/supabase-js, firebase, etc.).
5. **ORM:** Check for prisma, drizzle, typeorm, sequelize, mongoose, knex, kysely in dependencies.
6. **Auth:** Look for next-auth/authjs, clerk, lucia, supabase auth, firebase auth, auth0, kinde, better-auth in dependencies or config.
7. **Hosting:** Check for vercel.json, netlify.toml, fly.toml, railway.json, render.yaml, Dockerfile, AWS config, .github/workflows with deployment targets, wrangler.toml (Cloudflare).
8. **UI Library:** Check for shadcn-ui (components.json), radix-ui, chakra-ui, mantine, material-ui, ant-design, headless-ui in dependencies. Check for tailwindcss, css-modules, styled-components, emotion in config/dependencies.
9. **Project Type:** Infer from structure — web-app (has both pages and API routes), api (primarily API routes/serverless), static-site (no server components or API routes), library (has build/publish config), cli (has bin field in package.json).
10. **Project Size:** Count routes/pages — small (<20), medium (20-100), large (100+).

For each field, record what you detected. Use `null` for anything you cannot determine. Never guess — if the signal isn't clear, use `null`.

**React detection:** A project is considered React-based if `react` appears in `package.json` dependencies or devDependencies, or if `.jsx`/`.tsx` files are present in the source tree. Next.js, Remix, Gatsby, and similar frameworks are React-based.

---

## How to Analyze

Examine the following in order:

1. `package.json` — dependencies (react, error monitoring SDKs like @sentry/nextjs, @bugsnag/js, etc.), scripts
2. Framework config files — next.config._, nuxt.config._, etc. (look for error handler hooks, Sentry integration)
3. `src/app/error.tsx` / `src/app/global-error.tsx` (Next.js App Router error boundaries)
4. `src/pages/_error.tsx` / `src/pages/404.tsx` / `src/pages/500.tsx` (Next.js Pages Router)
5. `src/app/not-found.tsx` (Next.js App Router 404)
6. Component files — search for `ErrorBoundary` class components or `react-error-boundary` usage
7. API route handlers — `app/api/**/route.ts`, `pages/api/**/*.ts`, `server/routes/**`, etc.
8. Service/utility files — async functions, fetch wrappers, data-fetching utilities
9. Entry point files — `main.tsx`, `index.tsx`, `_app.tsx` — for global unhandled rejection handlers
10. Background job or queue files — cron handlers, webhook processors, job workers

---

## Check Definitions

### Category: Error Boundaries

**Slug:** `error-boundaries`
**Weight in overall score:** 0.30

**Note on middleware errors:** Uncaught errors in Next.js middleware (`middleware.ts`) break ALL routes — there is no `error.tsx` fallback for middleware errors. If the project has a `middleware.ts`, verify it wraps its logic in try/catch. Middleware error handling is not a separate scored check but should be noted in the detail field if the project has unprotected middleware.

#### Check: React error boundary wraps main application

- **ID:** `saas-error-handling.error-boundaries.react-error-boundary`
- **Severity:** `critical`
- **What to look for:** Examine whether the application has a top-level error boundary covering the main component tree. For Next.js App Router: check for `src/app/error.tsx` or `app/error.tsx` (the route-level error boundary) AND `src/app/global-error.tsx` or `app/global-error.tsx` (the root layout error boundary). For Next.js Pages Router: check for `pages/_error.tsx`. For other React apps (Vite/CRA/Remix/Gatsby): look for a component that extends `React.Component` and implements `componentDidCatch`/`getDerivedStateFromError`, or imports from `react-error-boundary`. Check whether the boundary wraps the root render point (e.g., `<App />` in `main.tsx` or equivalent).
- **Pass criteria:** Pass if a root-level error boundary exists and wraps the primary application tree. For Next.js App Router, pass if both `error.tsx` (for route errors) and `global-error.tsx` (for root layout errors) are present. For Pages Router, pass if `pages/_error.tsx` exists. For other React apps, pass if an `ErrorBoundary` component wraps `<App />` or the equivalent root component.
- **Fail criteria:** Fail if no error boundary exists at the application root. For Next.js App Router, fail if `global-error.tsx` is absent (route-level `error.tsx` alone is insufficient — it doesn't catch errors in the root layout). For other React apps, fail if no class component with `componentDidCatch` or `react-error-boundary` usage is found, or if it's scoped only to a small subtree rather than the application root.
- **Skip (N/A) when:** The project has no React dependency. Signal: `react` absent from `package.json` dependencies/devDependencies, no `.jsx`/`.tsx` files present, and framework is not Next.js/Remix/Gatsby/Vite-React.
- **Detail on fail:** Identify which boundary type is missing (e.g., "global-error.tsx not found; route-level error.tsx exists but does not catch root layout errors" or "No ErrorBoundary wrapping root component in main.tsx"). Max 500 chars.
- **Remediation:** Your application has no safety net for unexpected rendering errors. When any component throws, the entire page goes blank with no user feedback.

  For Next.js App Router, create both files:

  ```tsx
  // app/global-error.tsx
  "use client";
  export default function GlobalError({
    error,
    reset,
  }: {
    error: Error;
    reset: () => void;
  }) {
    return (
      <html>
        <body>
          <h2>Something went wrong</h2>
          <button onClick={() => reset()}>Try again</button>
        </body>
      </html>
    );
  }
  ```

  ```tsx
  // app/error.tsx
  "use client";
  export default function Error({
    error,
    reset,
  }: {
    error: Error;
    reset: () => void;
  }) {
    return (
      <div>
        <h2>Something went wrong</h2>
        <button onClick={() => reset()}>Try again</button>
      </div>
    );
  }
  ```

  For non-Next.js React apps, wrap your root render with `react-error-boundary`:

  ```tsx
  import { ErrorBoundary } from "react-error-boundary";
  <ErrorBoundary
    fallback={
      <div>
        Something went wrong.{" "}
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    }
  >
    <App />
  </ErrorBoundary>;
  ```

  Verify by intentionally throwing in a component and confirming the fallback UI renders instead of a blank page.

---

#### Check: No unhandled promise rejections in production

- **ID:** `saas-error-handling.error-boundaries.unhandled-promise-rejections`
- **Severity:** `critical`
- **What to look for:** Focus analysis on these specific high-risk locations: (1) all event handler functions attached to UI elements (onClick, onSubmit, onChange handlers that are async or call async functions); (2) all `useEffect` callbacks that contain async operations or floating promises (async functions called without `await` inside useEffect); (3) all async functions in client components (`components/` and `app/` directories with 'use client'). Server components and Server Actions have framework-level error boundaries and are lower priority for this check. Also check for: a global `unhandledrejection` event listener in the app entry point (`main.tsx`, `_app.tsx`, root layout, or equivalent); `Promise.all()` / `Promise.allSettled()` calls without error handling in the above locations. Note: error boundaries do not catch async errors — they only catch synchronous render errors, so async errors need separate handling.
- **Pass criteria:** Pass if ALL of the following are true: (a) async functions in event handlers, useEffect callbacks, and client component async functions consistently use `try/catch` or `.catch()`, OR (b) a global `window.addEventListener('unhandledrejection', ...)` handler is present in the entry point AND captures/reports the error. A small number of genuinely fire-and-forget async calls (with no recovery needed) may be acceptable if they're clearly intentional.
- **Fail criteria:** Fail if event handler functions (onClick, onSubmit, etc.) contain `await` calls without `try/catch`. Fail if data-fetching utilities throw without callers handling the rejection. Fail if no global unhandled rejection listener is present and there are more than two or three unguarded async calls in user-interaction paths.
- **Skip (N/A) when:** Never — all JavaScript runtimes (Node.js and browser) emit unhandled rejection events, making this applicable to every project regardless of framework.
- **Detail on fail:** Name specific files/functions where unguarded async calls were found (e.g., "handleSubmit in components/auth/login-form.tsx calls signIn() without try/catch; no global unhandledrejection listener found"). Max 500 chars.
- **Remediation:** Unhandled promise rejections crash server processes in Node.js and produce silent failures in browsers. Users see nothing; errors disappear.

  The simplest global safety net is a listener in your entry point:

  ```ts
  // In _app.tsx, main.tsx, or root layout.tsx (client component)
  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled rejection:", event.reason);
      // Report to your error monitoring service here
    });
  }
  ```

  For individual async event handlers, always wrap with try/catch:

  ```ts
  async function handleSubmit() {
    try {
      await submitForm(data);
    } catch (error) {
      setErrorMessage("Submission failed. Please try again.");
      reportError(error); // send to monitoring
    }
  }
  ```

  After adding handlers, verify by triggering a deliberate rejection in development and confirming it's caught.

---

#### Check: 500 pages do not expose internal details

- **ID:** `saas-error-handling.error-boundaries.five-hundred-page-no-internals`
- **Severity:** `critical`
- **What to look for:** Examine the server error page(s): `app/error.tsx`, `app/global-error.tsx`, `pages/_error.tsx`, `pages/500.tsx`, or equivalent custom error pages for non-Next.js frameworks. Check whether the error object's properties (`error.message`, `error.stack`, `error.cause`) are rendered to the DOM. Check for conditional logic that might expose stack traces in production (e.g., `process.env.NODE_ENV === 'development'` checks that render the full error). Also check API route error handlers — do they return the raw `error.message` or stack in JSON responses?
- **Pass criteria:** Pass if error pages and API error responses do not render or return the `error.stack`, raw `error.message`, database error details, or file system paths to end users. A generic "Something went wrong" message with a request ID or support code is acceptable and good practice.
- **Fail criteria:** Fail if `{error.message}` or `{error.stack}` is rendered in JSX. Fail if API routes return `{ error: error.message }` or `{ stack: error.stack }` directly. Fail if database error messages (which often contain table names, column names, or query fragments) are passed through to API responses.
- **Skip (N/A) when:** Never — every web application can encounter a 500 condition and must handle it safely.
- **Detail on fail:** Identify the exact location where internals are exposed (e.g., "app/error.tsx renders {error.message} directly; api/users/route.ts returns raw error.message in catch block"). Max 500 chars.
- **Remediation:** Exposing stack traces and internal error messages in production gives attackers a roadmap to your application's internals — framework versions, file paths, database schemas, and third-party service names are all visible in unfiltered error output.

  Replace internal error details with user-safe messages:

  ```tsx
  // app/error.tsx — safe version
  "use client";
  export default function Error({
    error,
    reset,
  }: {
    error: Error;
    reset: () => void;
  }) {
    // Log internally, never render error.message or error.stack to the DOM
    useEffect(() => {
      reportError(error);
    }, [error]);
    return (
      <div>
        <h2>Something went wrong</h2>
        <p>We've been notified and are looking into it. Please try again.</p>
        <button onClick={() => reset()}>Try again</button>
      </div>
    );
  }
  ```

  For API routes:

  ```ts
  } catch (error) {
    console.error('[API Error]', error) // server-side only
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  ```

  Verification: trigger a deliberate error in production mode (`NODE_ENV=production`) and inspect the response body and rendered DOM for any technical details.

---

#### Check: Error boundaries have meaningful fallback UI

- **ID:** `saas-error-handling.error-boundaries.error-boundaries-fallback-ui`
- **Severity:** `high`
- **What to look for:** Examine error boundary components for the quality of their fallback UI. Look at `app/error.tsx`, `app/global-error.tsx`, `pages/_error.tsx`, and any component-level error boundaries. Evaluate: (1) Does the fallback render any visible UI at all (not a null/empty return)? (2) Does it communicate that something went wrong in plain language? (3) Does it offer a recovery action — a "Try again" button that calls `reset()`, a link back to the home page, or a support contact? (4) Is the fallback visually coherent (not a raw HTML dump or unstyled text on a white screen)?
- **Pass criteria:** Pass if error boundaries render a fallback that: is not null/empty, includes a human-readable explanation of the failure, and provides at least one recovery action (reset button, home link, or support contact).
- **Fail criteria:** Fail if error boundaries return `null` or an empty fragment. Fail if the fallback is only a technical error dump (renders `error.message` verbatim). Fail if there is no recovery mechanism — no button, no link, no suggested next step. Fail if the fallback is a bare string with no wrapping element (likely to render invisibly on some pages).
- **Skip (N/A) when:** The project has no React dependency. Signal: same as `react-error-boundary` check above.
- **Detail on fail:** Describe the specific deficiency (e.g., "global-error.tsx returns null for fallback; route error.tsx has a message but no reset() button or home link"). Max 500 chars.
- **Remediation:** An error boundary with a poor fallback is nearly as bad as no boundary — users still see a broken experience and have no path forward.

  A good fallback answers three questions: What happened? Is it my fault? What can I do?

  ```tsx
  "use client";
  export default function Error({
    reset,
  }: {
    error: Error;
    reset: () => void;
  }) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex gap-3">
          <button onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <a href="/" className="btn-secondary">
            Go home
          </a>
        </div>
      </div>
    );
  }
  ```

  For segment-level boundaries (individual page sections), consider offering a fallback that keeps the rest of the page functional rather than replacing the whole viewport.

---

### Category: Error Reporting

**Slug:** `error-reporting`
**Weight in overall score:** 0.25

#### Check: Error reporting service is configured

- **ID:** `saas-error-handling.error-reporting.error-reporting-service`
- **Severity:** `high`
- **What to look for:** Check `package.json` for error monitoring dependencies: `@sentry/nextjs`, `@sentry/react`, `@sentry/node`, `@bugsnag/js`, `@bugsnag/plugin-react`, `@datadog/browser-logs`, `newrelic`, `rollbar`, `honeybadger-js`, `@highlight-run/next`, `highlight.run`, or similar. If a dependency is found, verify it's actually initialized: look for `Sentry.init()`, `Bugsnag.start()`, or equivalent initialization calls in the app entry point, instrumentation file (`instrumentation.ts` for Next.js), or framework config. Check that the initialization references a DSN or API key via environment variable (e.g., `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`).
- **Pass criteria:** Pass if a recognized error monitoring package is installed AND an initialization call is present with a DSN/API key referenced via environment variable (not hardcoded). For Next.js, also pass if `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts` or `instrumentation.ts` contain valid Sentry init calls.
- **Fail criteria:** Fail if no error monitoring package is present. Fail if a package is installed but no initialization call is found (dependency declared but never used). Fail if the DSN/API key is hardcoded in source rather than read from an environment variable.
- **Skip (N/A) when:** Never — error reporting is applicable to all production web applications regardless of framework or size.
- **Detail on fail:** Specify whether the package is entirely absent, installed but not initialized, or initialized with a hardcoded credential (e.g., "No Sentry/Bugsnag/similar dependency in package.json" or "@sentry/nextjs installed but no Sentry.init() call found in instrumentation.ts or sentry.\*.config.ts"). Max 500 chars.
- **Remediation:** Without an error reporting service, production errors are invisible. You only learn about failures when users report them — and most users don't.

  Sentry is the most common choice for Next.js. Install it with their wizard for automatic configuration:

  ```bash
  npx @sentry/wizard@latest -i nextjs
  ```

  This creates `sentry.client.config.ts`, `sentry.server.config.ts`, and updates `next.config.ts` automatically. Store your DSN in `.env.local`:

  ```
  NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
  ```

  After setup, verify by triggering a deliberate error in production mode and confirming it appears in your Sentry dashboard within 60 seconds.

  For the AuditBuffet Logging & Monitoring Audit, a deeper analysis of your observability stack — alerting thresholds, log retention, and uptime monitoring — is available separately.

---

#### Check: Errors include context without PII

- **ID:** `saas-error-handling.error-reporting.errors-include-context-no-pii`
- **Severity:** `medium`
- **What to look for:** Examine error reporting initialization and error capture calls. Look for: (1) whether user context is attached (Sentry's `setUser()`, Bugsnag's `setUser()`, or custom tags with user ID, session ID, or role); (2) whether route/page context is attached (URL, route params, feature area); (3) whether action context is attached (what the user was doing when the error occurred); (4) critically, whether any of this context includes PII — full names, email addresses, phone numbers, passwords, or raw user input. User IDs (non-identifiable UUIDs or numeric IDs) are acceptable; email addresses are not.
- **Pass criteria:** Pass if errors are captured with at least one contextual field (user ID, route, or action label) and none of the captured fields contain email addresses, full names, or other PII. A bare `captureException(error)` with no context is a fail; a `captureException(error)` with `{ userId: session.userId, route: pathname }` is a pass.
- **Fail criteria:** Fail if errors are captured with no context at all (pure `captureException(error)` calls everywhere). Fail if context includes PII fields (email, name, phone, raw form values). Fail if user data is passed directly from form state into error context without filtering.
- **Skip (N/A) when:** No error reporting service is configured (the `error-reporting-service` check already surfaces this). Skip this check if that check resulted in `fail` or `skip`.
- **Detail on fail:** Describe what context is missing or what PII was found (e.g., "captureException called without user/route context in 8 locations" or "Sentry setUser() includes email field — replace with userId only"). Max 500 chars.
- **Remediation:** Errors without context are debugging nightmares — you see what crashed but not who, where, or when. Errors with too much context create privacy liability.

  Set up context once at the session level:

  ```ts
  // After user authenticates
  Sentry.setUser({ id: session.userId }); // ID only, never email or name
  Sentry.setTag("plan", session.planTier);
  ```

  For individual error captures, add action context:

  ```ts
  Sentry.withScope((scope) => {
    scope.setTag("action", "checkout.submit");
    scope.setContext("cart", { itemCount: cart.items.length }); // aggregate data, not raw items
    Sentry.captureException(error);
  });
  ```

  Review your Sentry/Bugsnag user context configuration and remove any fields containing email, name, or other PII.

---

#### Check: API errors are logged server-side

- **ID:** `saas-error-handling.error-reporting.api-errors-logged-server`
- **Severity:** `high`
- **What to look for:** Examine API route handlers (`app/api/**/route.ts`, `pages/api/**/*.ts`, server actions, tRPC procedures, or equivalent). For each catch block or error handler: (1) Is there a `console.error()`, `logger.error()`, or equivalent server-side logging call before returning the error response? (2) Does the log call include the error object (stack trace) and any available context (route, method, user ID if available)? Look for patterns where errors are silently swallowed — `catch (error) { return NextResponse.json({ error: 'Failed' }) }` with no logging. Also check for global API error middleware or tRPC error formatters. **Server actions:** Next.js server actions (`'use server'` files and inline `async function` calls in server components) are mutation handlers — examine these separately from API routes. A server action that throws without a `try/catch` will cause Next.js to swallow the error into a digest hash in production, producing no useful log. Check server action files for try/catch with logging.
- **Pass criteria:** Pass if all catch blocks in API routes include a server-side log call that captures the error object. A centralized error handler that logs for all routes is also acceptable. Pass if a logging library (pino, winston, etc.) or Sentry's `captureException` is called on the server before returning the error response. Server actions with try/catch and logging also satisfy this check.
- **Fail criteria:** Fail if any catch blocks return an error response without logging. Fail if the only logging is a `console.log` that doesn't include the error object (and thus loses the stack trace). Fail if errors are returned to the client without any server-side record. Fail if server actions throw without try/catch (Next.js will swallow these into opaque digest errors in production). FAIL if any API route handler (`route.ts`, `route.js`) or Server Action has no try/catch wrapping at all. A route with zero error handling is strictly worse than a route with incomplete error handling — unhandled throws produce opaque 500 responses with no server-side log entry. Both missing catch blocks AND catch blocks without logging are fail conditions.
- **Skip (N/A) when:** The project has no API routes and no server-side code. Signal: no `app/api/` directory, no `pages/api/` directory, no server actions file (`'use server'` directive absent from all files), no backend framework entry point.
- **Detail on fail:** Name specific API route files where errors are swallowed without logging (e.g., "catch blocks in app/api/stripe/webhook/route.ts and app/api/users/[id]/route.ts return errors without console.error or logger call"). Max 500 chars.
- **Remediation:** Silent API errors make production debugging impossible. You need a server-side record of what failed before it becomes a user complaint.

  A consistent error logging pattern for Next.js API routes:

  ```ts
  export async function POST(request: Request) {
    try {
      // ... handler logic
    } catch (error) {
      console.error("[POST /api/your-route]", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }
  ```

  For tRPC, configure a global error formatter:

  ```ts
  export const t = initTRPC.create({
    errorFormatter({ shape, error }) {
      console.error("[tRPC Error]", error);
      return shape;
    },
  });
  ```

  For a deeper analysis of your overall logging and observability setup, the SaaS Logging & Monitoring Audit examines structured logging, log levels, and alerting in detail.

---

#### Check: Client-side errors are reported to monitoring

- **ID:** `saas-error-handling.error-reporting.client-errors-reported`
- **Severity:** `low`
- **What to look for:** Check whether the error reporting SDK is initialized on the client side (not just server side). For Sentry on Next.js: look for `sentry.client.config.ts` with `Sentry.init()`. For other frameworks: look for SDK initialization in the browser entry point. Check error boundary components — do they call `Sentry.captureException(error)` or equivalent in `componentDidCatch` or in the `onError` prop of `react-error-boundary`? Check for a global `window.addEventListener('error', ...)` handler as a fallback.
- **Pass criteria:** Pass if the error monitoring SDK is initialized in the browser context AND at least one of these is true: error boundaries report caught errors to the SDK, a global `window.onerror` or `addEventListener('error', ...)` handler reports uncaught errors to the SDK.
- **Fail criteria:** Fail if the error reporting SDK is only initialized on the server (client errors go unreported). Fail if error boundaries catch errors but don't forward them to any monitoring service. Fail if there is no client-side error capture mechanism at all.
- **Skip (N/A) when:** No error reporting service is installed (the `error-reporting-service` check already surfaces this). Skip if that check resulted in `fail`.
- **Detail on fail:** Describe the gap (e.g., "Sentry initialized server-side only; sentry.client.config.ts absent; error boundaries do not call captureException"). Max 500 chars.
- **Remediation:** Server-side error reporting only catches API and SSR errors. Rendering crashes, JavaScript exceptions, and network failures that occur in the browser are invisible without client-side capture.

  For Next.js with Sentry, add `sentry.client.config.ts`:

  ```ts
  import * as Sentry from "@sentry/nextjs";
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
  ```

  In your error boundary, forward caught errors:

  ```tsx
  import { ErrorBoundary } from "react-error-boundary";
  import * as Sentry from "@sentry/nextjs";

  <ErrorBoundary
    onError={(error, info) => Sentry.captureException(error, { extra: info })}
    fallbackRender={({ resetErrorBoundary }) => (
      <div>
        Something went wrong.{" "}
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    )}
  >
    <App />
  </ErrorBoundary>;
  ```

---

### Category: User-Facing Errors

**Slug:** `user-errors`
**Weight in overall score:** 0.25

#### Check: API responses use a consistent error format

- **ID:** `saas-error-handling.user-errors.api-consistent-error-format`
- **Severity:** `high`
- **What to look for:** Examine all API route error responses across the project. Look for consistency in the shape of error JSON responses. Check for: a common envelope (e.g., always `{ error: string }`, always `{ message: string }`, always `{ error: { code: string, message: string } }`, or always tRPC's standard error shape). Look for inconsistencies: some routes returning `{ error: '...' }`, others returning `{ message: '...' }`, others returning plain strings, others returning `{ success: false, reason: '...' }`. Also check HTTP status codes — are 4xx codes used for client errors and 5xx for server errors, or is everything returning 200? **Server actions:** If the project uses Next.js server actions instead of API routes for mutations, check whether server actions return a consistent shape for error states (e.g., always `{ error: string } | { success: true }`) or whether each action returns different shapes. Server actions that `throw` rather than `return` errors are also inconsistent — they produce Next.js digest errors in production which are opaque to callers.
- **Pass criteria:** Pass if all API routes (or a clear majority — 90%+) return error responses in the same JSON shape, and HTTP status codes correctly distinguish client errors (4xx) from server errors (5xx). A centralized error response helper function is a strong positive signal. For server-action-only apps, pass if actions consistently `return` (not `throw`) errors in a uniform shape.
- **Fail criteria:** Fail if error response shapes vary significantly across routes (two or more distinct shapes in active use). Fail if 4xx and 5xx errors are not distinguished (everything returns 200 with an error flag). Fail if some routes return raw error strings and others return JSON objects. Fail if server actions mix `throw` and `return { error }` patterns inconsistently.
- **Skip (N/A) when:** The project has no API routes and no server actions. Signal: no `app/api/` directory, no `pages/api/` directory, no serverless functions, no `'use server'` directives.
- **Detail on fail:** Describe the inconsistency found (e.g., "3 distinct error shapes found: {error: string} in auth routes, {message: string} in user routes, {success: false} in payment routes; some routes return 200 for all errors"). Max 500 chars.
- **Remediation:** Inconsistent error formats force frontend code to handle multiple shapes, leading to missed error states and confusing UX. Clients can't build reliable error handling when the shape is unpredictable.

  Create a single error response helper and use it everywhere:

  ```ts
  // lib/api-response.ts
  export function errorResponse(message: string, status: number = 500) {
    return NextResponse.json({ error: message }, { status });
  }

  export function validationErrorResponse(errors: Record<string, string>) {
    return NextResponse.json(
      { error: "Validation failed", fields: errors },
      { status: 422 },
    );
  }
  ```

  Then in every route:

  ```ts
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
  ```

  Standard HTTP status codes to follow: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 429 Too Many Requests, 500 Internal Server Error.

---

#### Check: 404 pages are custom and helpful

- **ID:** `saas-error-handling.user-errors.not-found-custom-helpful`
- **Severity:** `medium`
- **What to look for:** For Next.js App Router: check for `app/not-found.tsx`. For Next.js Pages Router: check for `pages/404.tsx`. For other frameworks: check for the equivalent custom 404 page file. Evaluate the content: (1) Does it clearly communicate that the page wasn't found (in plain language, not HTTP jargon)? (2) Does it provide navigation options — a link to the home page, a search field, or a list of popular pages? (3) Does it match the site's design (not a bare-bones default)? Check that a custom 404 file actually exists — framework defaults are acceptable fallbacks but are a fail for this check.
- **Pass criteria:** Pass if a custom 404 file exists AND it contains both an explanation of the error and at least one navigation option (home link, search, or suggested pages).
- **Fail criteria:** Fail if no custom 404 file exists (relying on framework default). Fail if the custom 404 exists but contains only a message with no navigation options. Fail if the 404 page uses technical jargon ("404 Not Found") as its primary heading without a plain-language explanation.
- **Skip (N/A) when:** Never — all web applications serve routes and can encounter 404 conditions.
- **Detail on fail:** Specify what is absent (e.g., "No app/not-found.tsx found; using Next.js default 404" or "pages/404.tsx exists but contains only 'Page not found' with no navigation links"). Max 500 chars.
- **Remediation:** Default 404 pages strand users with no path forward. A helpful 404 keeps users in your application instead of bouncing them to the browser's back button.

  For Next.js App Router:

  ```tsx
  // app/not-found.tsx
  import Link from "next/link";

  export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">
          We couldn't find what you were looking for.
        </p>
        <Link href="/" className="btn-primary">
          Go to homepage
        </Link>
      </div>
    );
  }
  ```

  Consider adding a search input or links to your most important pages (dashboard, docs, support) so users can self-navigate to where they intended to go.

---

#### Check: Form validation errors are inline and specific

- **ID:** `saas-error-handling.user-errors.form-validation-inline`
- **Severity:** `high`
- **What to look for:** Examine form components throughout the codebase. Look for: (1) how validation errors are displayed — are they shown next to the specific field that failed, or in a single alert at the top/bottom of the form? (2) Are error messages specific ("Password must be at least 8 characters") or generic ("Invalid input")? (3) Are errors shown while the user is filling out the form (on blur or on change) or only after submit? Check for form libraries: react-hook-form, formik, Zod-based validation with react-hook-form, zod-form-data, valibot. Look for aria-describedby and aria-invalid attributes for accessibility. Check server-side validation responses — do they return field-specific errors or a single string?
- **Pass criteria:** Pass if forms display validation errors adjacent to the specific field that failed AND error messages are specific enough to guide correction (not just "Invalid" or "Required"). Using a form library that handles inline field errors (react-hook-form + Zod resolver is the gold standard) is a strong positive signal.
- **Fail criteria:** Fail if all validation errors are shown in a single toast or alert at the top of the form without identifying the specific field. Fail if error messages are generic and non-actionable ("Something is wrong", "Invalid value"). Fail if validation only occurs after form submission with no intermediate feedback. Fail if server validation errors are not mapped back to specific form fields.
- **Skip (N/A) when:** The project has no user-facing forms. Signal: no `<form>` elements, no form library dependencies, no form handler functions found in component files. This would be unusual for a SaaS application.
- **Detail on fail:** Describe the validation pattern found (e.g., "Login and signup forms use a single error state shown above the form; no per-field error display; error messages are generic strings"). Max 500 chars.
- **Remediation:** Generic or global validation errors require users to guess which field is wrong. Specific inline errors reduce friction and form abandonment.

  With react-hook-form and Zod:

  ```tsx
  const schema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })

  const { register, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  // In JSX:
  <input {...register('email')} aria-invalid={!!errors.email} />
  {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
  ```

  For server-side validation errors, return field-level error details:

  ```ts
  return NextResponse.json(
    {
      error: "Validation failed",
      fields: { email: "This email is already registered" },
    },
    { status: 422 },
  );
  ```

  Then map these back to form state on the client.

  For a deeper analysis of your accessibility implementation including form labels and ARIA patterns, the Accessibility Fundamentals Audit covers this in detail.

---

#### Check: Network errors show a retry option

- **ID:** `saas-error-handling.user-errors.network-errors-retry`
- **Severity:** `medium`
- **What to look for:** Search for data-fetching code — `fetch()` calls, SWR/React Query/TanStack Query hooks, Axios calls, tRPC client calls. Look for error handling around network requests: (1) Is there a UI state for network failures (connection refused, fetch failed)? (2) Does the error UI include a retry button or automatic retry logic? (3) For React Query/SWR: are `retry` options configured? (4) For manual fetch calls: is there a retry mechanism or at least a "Try again" button that re-triggers the request? Also look for offline detection (`navigator.onLine`) or network status handling.
- **Pass criteria:** Pass if data-fetching error states include a retry mechanism — either a manual "Try again" button that re-runs the query/fetch, or automatic retry configured in the fetching library (e.g., React Query's default 3 retries on failure). Pass if SWR or React Query is used with default retry behavior and error UI is displayed. A form or action button that returns to its ready/enabled state after a network error is functionally equivalent to a "Try again" button for this check's purposes — the user can retry by clicking the same button. This counts as a pass if the error state is clearly communicated (the user knows something went wrong and can see the button is available to try again).
- **Fail criteria:** Fail if network errors show an error message with no way for the user to retry without refreshing the page. Fail if loading states and success states are handled but error states are missing entirely (the component just shows nothing or stays in a loading spinner). Fail if retry logic exists but the error state is never shown to the user (silent failure).
- **Skip (N/A) when:** The project makes no client-side data fetching (fully server-rendered with no client-side data loading). Signal: no `fetch()` calls in client components, no SWR/React Query/TanStack Query in dependencies, all data loaded server-side only.
- **Detail on fail:** Describe the gap (e.g., "React Query used for all data fetching but error states render null; no retry button found in any data-dependent component"). Max 500 chars.
- **Remediation:** Network failures are not edge cases — they happen regularly on mobile connections, during deployments, and when third-party services hiccup. A retry button is the minimum acceptable response.

  With React Query (TanStack Query):

  ```tsx
  const { data, error, refetch, isError } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  if (isError)
    return (
      <div>
        <p>Failed to load items. Check your connection.</p>
        <button onClick={() => refetch()}>Try again</button>
      </div>
    );
  ```

  React Query retries failed requests 3 times by default. For critical requests, you can configure exponential backoff:

  ```ts
  useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  ```

---

#### Check: Timeout errors have appropriate messaging

- **ID:** `saas-error-handling.user-errors.timeout-messaging`
- **Severity:** `medium`
- **What to look for:** Look for long-running operations in the codebase: AI API calls, file uploads, report generation, email sending, large data exports. Check whether these operations: (1) have a timeout configured (AbortController with timeout, fetch with `signal`, server function with timeout headers); (2) display a loading indicator while waiting; (3) show a specific "This is taking longer than expected" or "Request timed out" message when the timeout elapses rather than a generic error or permanent spinner. Also check Vercel/serverless function timeout limits — if the project deploys to Vercel's Hobby tier (10s timeout) or Pro tier (60s/300s), are there operations that might exceed these limits?
- **Pass criteria:** Pass if long-running operations (>3 seconds expected duration) show a loading state AND handle timeout conditions with a specific, actionable message that distinguishes a timeout from other errors. A message like "This is taking longer than expected. You can wait or try again." is acceptable.
- **Fail criteria:** Fail if long-running operations have no timeout configured and could spin indefinitely. Fail if timeout errors produce the same generic error message as other failures with no indication that the issue is time-related. Fail if operations that hit serverless function limits (Vercel 10s/60s) are not acknowledged with a timeout-specific error.
- **Skip (N/A) when:** The project has no operations expected to take more than 2 seconds (trivial CRUD apps with no AI, file processing, or data exports). Evaluate this by examining API routes and async functions for calls to external APIs, file I/O, or data aggregation that could be slow.
- **Detail on fail:** Name the specific operations lacking timeout handling (e.g., "AI generation endpoint at api/generate/route.ts has no AbortController or timeout; shows generic error on Vercel 10s limit"). Max 500 chars.
- **Remediation:** A permanent spinner is one of the most frustrating user experiences. Timeout-specific messaging lets users know the system is responsive — it just needs more time, or they should try again later.

  For fetch requests, use AbortController:

  ```ts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch("/api/generate", {
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      setError("This request timed out. Please try again.");
    } else {
      setError("Something went wrong. Please try again.");
    }
  } finally {
    clearTimeout(timeoutId);
  }
  ```

  For long-running tasks, consider moving them to background jobs (see the `background-job-retry` check) and polling for completion instead of blocking.

---

#### Check: Rate limit errors explain when to retry

- **ID:** `saas-error-handling.user-errors.rate-limit-retry-explain`
- **Severity:** `low`
- **What to look for:** Check if the project implements rate limiting (look for rate limiting middleware, libraries like `@upstash/ratelimit`, `express-rate-limit`, or custom Redis-based rate limiting). If rate limiting is implemented, examine the 429 response and the client-side handling: (1) Does the 429 response include a `Retry-After` header or a `retryAfter` field in the response body? (2) Does the client display a message telling the user when they can try again? A message like "You've made too many requests. Please wait 30 seconds." is ideal.
- **Pass criteria:** Pass if rate limiting is implemented AND either: the 429 response includes a `Retry-After` header or body field, OR the client displays a message explaining the rate limit and when to retry.
- **Fail criteria:** Fail if rate limiting returns 429 with a generic "Too many requests" message with no timing information. Fail if the client shows the same error UI for 429s as for 500s (indistinguishable to the user).
- **Skip (N/A) when:** The project does not implement rate limiting. Signal: no rate limiting middleware or library in `package.json`, no rate limit logic in API routes. Note: the absence of rate limiting itself is a concern addressed in the SaaS API Design Audit.
- **Detail on fail:** Describe the gap (e.g., "Rate limiting returns 429 but response body is {error: 'Too many requests'} with no Retry-After header; client shows generic error message"). Max 500 chars.
- **Remediation:** Rate limit errors without timing information force users to guess how long to wait. A specific wait time reduces frustration and prevents retry storms.

  In your rate limit response:

  ```ts
  return NextResponse.json(
    { error: "Too many requests", retryAfter: 60 },
    { status: 429, headers: { "Retry-After": "60" } },
  );
  ```

  On the client, detect 429s and show the timing:

  ```ts
  if (response.status === 429) {
    const { retryAfter } = await response.json();
    setError(
      `You've hit the rate limit. Please wait ${retryAfter} seconds before trying again.`,
    );
  }
  ```

---

### Category: Graceful Degradation

**Slug:** `graceful-degradation`
**Weight in overall score:** 0.20

#### Check: Partial page failures do not crash the entire page

- **ID:** `saas-error-handling.graceful-degradation.partial-failures-dont-crash`
- **Severity:** `high`
- **What to look for:** Examine page components that render multiple independent data-fetching sections or widgets. Look for: (1) whether each data-dependent section has its own error boundary rather than sharing a single top-level boundary; (2) whether React Suspense boundaries are placed at a granular level (around individual sections rather than the whole page); (3) whether a failure in one section (e.g., an activity feed widget) prevents the rest of the page from loading. In Next.js App Router, look for `loading.tsx` and `error.tsx` files at sub-route levels, not just the root. Check dashboard-style pages and pages with multiple API calls.
- **Pass criteria:** Pass if the application has component-level or section-level error boundaries on pages with multiple independent data sources, such that a failure in one section allows the rest of the page to render. Using multiple React Suspense boundaries at the section level (rather than page level) is a strong positive signal.
- **Fail criteria:** Fail if the entire page component is wrapped in a single top-level boundary with no granular boundaries, and a failure in any section crashes the full page. Fail if dashboard pages make multiple API calls and any single failure causes the whole dashboard to show an error state. Fail if there are no component-level boundaries anywhere in the application (only page-level or route-level).
- **Skip (N/A) when:** The application is a simple single-purpose page with only one data source per view. Signal: all pages fetch a single data set; no dashboard-style layouts with multiple independent widgets or sections.
- **Detail on fail:** Describe the scope of the problem (e.g., "Dashboard page fetches user profile, recent activity, and billing status in parallel; single error boundary at the route level; any individual failure crashes the entire dashboard"). Max 500 chars.
- **Remediation:** A single top-level error boundary is better than nothing, but it's a blunt instrument. When possible, isolate failures to the section that failed.

  Wrap independent sections in their own boundaries:

  ```tsx
  // dashboard/page.tsx
  <div className="grid grid-cols-3 gap-4">
    <ErrorBoundary fallback={<WidgetError name="Profile" />}>
      <Suspense fallback={<Skeleton />}>
        <ProfileWidget />
      </Suspense>
    </ErrorBoundary>
    <ErrorBoundary fallback={<WidgetError name="Activity" />}>
      <Suspense fallback={<Skeleton />}>
        <ActivityFeed />
      </Suspense>
    </ErrorBoundary>
    <ErrorBoundary fallback={<WidgetError name="Billing" />}>
      <Suspense fallback={<Skeleton />}>
        <BillingSummary />
      </Suspense>
    </ErrorBoundary>
  </div>
  ```

  This way, if the activity feed fails, the profile and billing widgets still render.

---

#### Check: Error recovery does not lose user data

- **ID:** `saas-error-handling.graceful-degradation.error-recovery-no-data-loss`
- **Severity:** `high`
- **What to look for:** Focus on forms and multi-step workflows. When an error occurs (network failure, server error, validation rejection): (1) Does the form preserve the user's input in state, or does the error state reset the form fields? (2) Do multi-step wizards or onboarding flows preserve progress across errors? (3) Do "Try again" buttons re-submit with the same data, or do they clear state and require the user to re-enter everything? Look for patterns where `catch` blocks call `resetForm()` or `setState({})` — these likely clear user data on error. Also check whether long-form inputs (rich text editors, file uploads) survive error conditions.
- **Pass criteria:** Pass if form state is preserved on error (input fields retain their values after a failed submission), and retry mechanisms re-submit with the preserved data. Pass if multi-step flows preserve all prior-step data when a later step fails.
- **Fail criteria:** Fail if form fields are cleared on error (user must re-type their input). Fail if error boundaries' `reset()` function causes parent state to reset, clearing form data. Fail if file upload state is lost on network errors requiring re-selection. Fail if multi-step form progress is lost on any individual step error.
- **Skip (N/A) when:** The application has no forms and no multi-step workflows. Signal: no `<form>` elements, no form library, no wizard or stepper components.
- **Detail on fail:** Describe the data loss scenario (e.g., "Signup form's catch block calls form.reset() on API error — user loses all typed input; file attachment is cleared from state on upload failure"). Max 500 chars.
- **Remediation:** Losing user data on error is the most frustrating failure mode. Users who have to re-enter a long form after a server error often abandon entirely.

  Ensure error handling preserves form state:

  ```ts
  // Wrong — clears user data on error
  } catch (error) {
    form.reset()
    setError('Submission failed')
  }

  // Right — preserves user data, only sets error state
  } catch (error) {
    setSubmitError('Submission failed. Your data is preserved — please try again.')
    setIsSubmitting(false)
  }
  ```

  For multi-step flows, store state in a parent component or context that persists across step re-renders, not in individual step components that unmount on error.

  For file uploads, store the File object reference in state so users don't need to re-select after a failed upload:

  ```ts
  // Keep the File in state; only clear after confirmed server-side success
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  ```

---

#### Check: Background job failures are logged and retried

- **ID:** `saas-error-handling.graceful-degradation.background-job-retry`
- **Severity:** `low`
- **Note:** While this check is severity `low` for general background jobs, cron jobs that process payments, send notifications, or affect shared data (e.g., benchmark snapshots) represent higher risk when they fail silently. The detail field should call out payment/notification cron jobs specifically when they lack retry logic.
- **What to look for:** Search for background job processing: queue consumers, cron job handlers, webhook processors, event handlers (Inngest, QStash, BullMQ, Trigger.dev, Vercel Cron + API routes). For each: (1) Is there a try/catch wrapping the job handler body? (2) Is the error logged with enough context to identify which job failed and why? (3) Does the job framework support automatic retry on failure, and is retry configured (not left at the default "no retry")? (4) For Vercel Cron routes: are failures logged since there is no automatic retry?
- **Pass criteria:** Pass if background jobs have try/catch error handling with logging AND either: the framework provides automatic retry (Inngest, Trigger.dev, BullMQ all retry by default), or explicit retry logic is configured. Pass if a dead-letter queue or failure notification is set up for jobs that exhaust retries.
- **Fail criteria:** Fail if job handlers have no error handling and let exceptions propagate silently. Fail if errors are caught but not logged. Fail if the project uses Vercel Cron routes with no error handling (silent failures with no retry path). Fail if retry is available in the framework but explicitly disabled or left at 0.
- **Skip (N/A) when:** The project has no background jobs, cron jobs, or async job queues. Signal: no job queue dependencies (Inngest, BullMQ, QStash, Trigger.dev, Upstash, etc.) in `package.json`, no cron configuration in `vercel.json`, no webhook consumers.
- **Detail on fail:** Describe which jobs lack retry/logging (e.g., "Vercel cron route at app/api/cron/digest/route.ts has no try/catch; sendWeeklyDigest() failures are silent with no retry path"). Max 500 chars.
- **Remediation:** Background jobs that fail silently are invisible time bombs. A job that sends billing notifications, processes payments, or syncs data may fail for hours before anyone notices.

  For Vercel Cron routes (which have no automatic retry), wrap in try/catch with logging:

  ```ts
  // app/api/cron/digest/route.ts
  export async function GET() {
    try {
      await sendWeeklyDigest();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[Cron: digest] Failed:", error);
      // Optionally alert your monitoring service
      return NextResponse.json({ error: "Digest failed" }, { status: 500 });
    }
  }
  ```

  For higher-reliability needs, use Inngest or Trigger.dev which provide automatic retry with exponential backoff and a UI for monitoring failed jobs.

---

#### Check: No console.error in production without boundary

- **ID:** `saas-error-handling.graceful-degradation.no-console-error-without-boundary`
- **Severity:** `low`
- **What to look for:** Search for `console.error()` calls throughout the codebase. For each one found: (1) Is it inside a catch block that also handles the error (shows UI, retries, reports to monitoring)? (2) Or is it a bare `console.error()` that logs the error but takes no further action — essentially swallowing the error after logging it? Look specifically for patterns where `console.error` is the only thing in a catch block, with no user-facing feedback, no error reporting service call, and no state update. These represent errors that are noticed by developers (who look at logs) but never surface to users or monitoring services.
- **Pass criteria:** Pass if `console.error()` calls are always accompanied by either: error reporting service capture, user-facing error state update, or both. A `console.error` that also calls `Sentry.captureException()` is acceptable. Pass if `console.error` is only used in development-mode guards (`if (process.env.NODE_ENV !== 'production')`).
- **Fail criteria:** Fail if `console.error()` calls exist in catch blocks that take no further action (no user feedback, no monitoring service call). These are errors that disappear in production. Fail if `console.error` is used as a replacement for proper error monitoring rather than in addition to it.
- **Skip (N/A) when:** No `console.error()` calls exist in the codebase (the check passes trivially — no issues found).
- **Detail on fail:** Count and describe the pattern (e.g., "7 catch blocks across API utilities and auth handlers use console.error() as sole error handling with no Sentry capture or user state update"). Max 500 chars.
- **Remediation:** `console.error()` in production is a forest-falling-in-the-woods problem — the error happened, but no one will see it unless someone is actively tailing server logs. Most production environments don't expose raw logs to developers in real time.

  Replace bare console.error calls with proper error handling:

  ```ts
  // Before — error disappears in production
  } catch (error) {
    console.error('Failed to fetch user:', error)
  }

  // After — error is visible to both developer and monitoring
  } catch (error) {
    console.error('Failed to fetch user:', error) // keep for dev context
    Sentry.captureException(error, { extra: { context: 'fetchUser' } })
    setError('Unable to load your profile. Please refresh.')
  }
  ```

---

#### Check: Async error handling is consistent across the codebase

- **ID:** `saas-error-handling.graceful-degradation.async-error-handling-consistent`
- **Severity:** `low`
- **What to look for:** Survey the async error handling patterns across the codebase. Look for: (1) Are most async functions using try/catch, or `.catch()`, or a mix? (2) Is there a shared error handling utility (e.g., a `tryCatch()` wrapper, a `withErrorHandling()` HOF, or a `Result` type pattern) used consistently, or is error handling written ad hoc in every file? (3) In Next.js: are server actions consistently wrapped with error handling, or is each server action a different pattern? (4) Are there helper files that centralize error handling logic, or is the same boilerplate duplicated everywhere?
- **Pass criteria:** Pass if the codebase demonstrates a consistent error handling pattern — either all try/catch, a shared wrapper utility, or a Result/Either pattern used project-wide. Consistency is the signal; the specific pattern matters less. Pass if a shared utility handles the repetitive error handling boilerplate.
- **Fail criteria:** Fail if error handling is ad hoc and inconsistent — some functions use try/catch, others use `.catch()`, others have no error handling, with no apparent deliberate pattern. Fail if the same error handling boilerplate is copy-pasted across 10+ locations rather than centralized. Fail if server actions have widely varying error handling approaches with no shared pattern.
- **Skip (N/A) when:** The project is small enough (under 10 async functions total) that consistency is moot — each can be individually inspected.
- **Detail on fail:** Describe the inconsistency (e.g., "Mix of try/catch and .catch() patterns; 12 server actions have 6 different error handling approaches; no shared error utility found"). Max 500 chars.
- **Remediation:** Inconsistent error handling means each developer adds error handling differently, making it hard to review, audit, or improve systematically. A shared utility makes the right pattern easy and the wrong pattern obvious.

  A simple try/catch wrapper that works well for server actions and API helpers:

  ```ts
  // lib/try-catch.ts
  export async function tryCatch<T>(
    fn: () => Promise<T>,
  ): Promise<[T, null] | [null, Error]> {
    try {
      const result = await fn();
      return [result, null];
    } catch (error) {
      return [null, error instanceof Error ? error : new Error(String(error))];
    }
  }

  // Usage in server action:
  const [result, error] = await tryCatch(() =>
    db.users.findUnique({ where: { id } }),
  );
  if (error) {
    return { error: "User not found" };
  }
  ```

  Standardizing on one pattern also makes it easier to add cross-cutting concerns (logging, monitoring) in a single place later.

---

#### Check: Error states have a reset mechanism

- **ID:** `saas-error-handling.graceful-degradation.error-state-reset-mechanism`
- **Severity:** `low`
- **What to look for:** Look at error state management throughout the application. Examine: (1) When an error state is set (e.g., `setError('Failed to load')`), is there a mechanism to clear that state — either automatically on the next successful action, or via a user dismiss/close action? (2) Do error banners/toasts auto-dismiss, or do they persist indefinitely? (3) When a user retries an action that previously failed, is the previous error message cleared before the retry? (4) Do modal dialogs with error states allow dismissal? Look for error state variables that are set on failure but never cleared to `null`.
- **Pass criteria:** Pass if error states are cleared either automatically (on successful retry, on user navigation, or after a timeout) or via an explicit dismiss mechanism (close button, "Try again" button that resets error state before re-submitting). React Query and SWR handle this automatically by clearing error state when a query succeeds — this is a pass.
- **Fail criteria:** Fail if error messages persist indefinitely with no way to dismiss them. Fail if retrying an action shows both the previous error message and the new loading/error state simultaneously. Fail if error state variables are set in multiple places but never reset, leading to stale errors shown on subsequent visits to the same view.
- **Skip (N/A) when:** The project uses React Query or SWR for all data fetching (these libraries manage error state lifecycle automatically) and has no manual error state variables. Evaluate by checking for `useState` for error management alongside these libraries.
- **Detail on fail:** Describe the stale error scenario (e.g., "Error state in useAuthStore is set on login failure but never cleared on successful navigation; logging in on a different device shows the previous session's error"). Max 500 chars.
- **Remediation:** Persistent error states confuse users who have already resolved the issue, or who encounter a stale error from a previous session.

  Clear error state before retry actions:

  ```ts
  async function handleRetry() {
    setError(null); // always clear before retry
    setLoading(true);
    try {
      await fetchData();
    } catch (err) {
      setError("Still failing. Please try again later.");
    } finally {
      setLoading(false);
    }
  }
  ```

  For global error state in a store (Zustand, Redux), add a reset action:

  ```ts
  clearError: () => set({ error: null }),
  ```

  Call `clearError()` on route changes and at the start of any action that might have previously failed.

---

## Scoring

### Severity-to-Weight Mapping

| Telemetry Severity | Scoring Weight | Weight Value |
| ------------------ | -------------- | ------------ |
| `critical`         | Critical       | **10**       |
| `high`             | Warning        | **3**        |
| `medium`           | Warning        | **3**        |
| `low`              | Info           | **1**        |
| `info`             | Info           | **1**        |

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
| ----- | ----------- |
| A     | 90–100      |
| B     | 75–89       |
| C     | 60–74       |
| D     | 40–59       |
| F     | 0–39        |

Apply the grade to each category score and to the overall score. If a score is `null`, the grade is also `null`.

### Edge Cases

| Scenario                            | Rule                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| All checks pass                     | Score = 100                                                                                       |
| All checks fail                     | Score = 0                                                                                         |
| All checks skip/error               | Score = null, Grade = null                                                                        |
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
    "slug": "saas-error-handling",
    "display_name": "Error Handling Audit",
    "version": "1.0.3",
    "prompt_hash": "sha256:40e509f76fb359f93189883d47468836"
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
        "slug": "error-boundaries",
        "display_name": "Error Boundaries",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.3,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 4
      },
      {
        "slug": "error-reporting",
        "display_name": "Error Reporting",
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
        "slug": "user-errors",
        "display_name": "User-Facing Errors",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.25,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 6
      },
      {
        "slug": "graceful-degradation",
        "display_name": "Graceful Degradation",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.2,
        "checks_total": 6,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>"
      }
    ]
  },

  "checks": [
    {
      "id": "saas-error-handling.error-boundaries.react-error-boundary",
      "label": "React error boundary wraps main application",
      "category_slug": "error-boundaries",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.error-boundaries.unhandled-promise-rejections",
      "label": "No unhandled promise rejections in production",
      "category_slug": "error-boundaries",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.error-boundaries.five-hundred-page-no-internals",
      "label": "500 pages do not expose internal details",
      "category_slug": "error-boundaries",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.error-boundaries.error-boundaries-fallback-ui",
      "label": "Error boundaries have meaningful fallback UI",
      "category_slug": "error-boundaries",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.error-reporting.error-reporting-service",
      "label": "Error reporting service is configured",
      "category_slug": "error-reporting",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.error-reporting.errors-include-context-no-pii",
      "label": "Errors include context without PII",
      "category_slug": "error-reporting",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.error-reporting.api-errors-logged-server",
      "label": "API errors are logged server-side",
      "category_slug": "error-reporting",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.error-reporting.client-errors-reported",
      "label": "Client-side errors are reported to monitoring",
      "category_slug": "error-reporting",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.user-errors.api-consistent-error-format",
      "label": "API responses use a consistent error format",
      "category_slug": "user-errors",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.user-errors.not-found-custom-helpful",
      "label": "404 pages are custom and helpful",
      "category_slug": "user-errors",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.user-errors.form-validation-inline",
      "label": "Form validation errors are inline and specific",
      "category_slug": "user-errors",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.user-errors.network-errors-retry",
      "label": "Network errors show a retry option",
      "category_slug": "user-errors",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.user-errors.timeout-messaging",
      "label": "Timeout errors have appropriate messaging",
      "category_slug": "user-errors",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.user-errors.rate-limit-retry-explain",
      "label": "Rate limit errors explain when to retry",
      "category_slug": "user-errors",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.graceful-degradation.partial-failures-dont-crash",
      "label": "Partial page failures do not crash the entire page",
      "category_slug": "graceful-degradation",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.graceful-degradation.error-recovery-no-data-loss",
      "label": "Error recovery does not lose user data",
      "category_slug": "graceful-degradation",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.graceful-degradation.background-job-retry",
      "label": "Background job failures are logged and retried",
      "category_slug": "graceful-degradation",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.graceful-degradation.no-console-error-without-boundary",
      "label": "No console.error in production without boundary",
      "category_slug": "graceful-degradation",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.graceful-degradation.async-error-handling-consistent",
      "label": "Async error handling is consistent across the codebase",
      "category_slug": "graceful-degradation",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-error-handling.graceful-degradation.error-state-reset-mechanism",
      "label": "Error states have a reset mechanism",
      "category_slug": "graceful-degradation",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
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
3. The sum of all category `weight` values equals `1.0` (tolerance: ±0.001) — verify: 0.30 + 0.25 + 0.25 + 0.20 = 1.00
4. For each category: `checks_total == checks_passed + checks_failed + checks_skipped + checks_errored`
5. The sum of all category `checks_total` equals `scoring.total_checks` — verify: 4 + 4 + 6 + 6 = 20
6. Every `category_slug` in the `checks` array matches a `slug` in `scoring.categories`
7. `detail` is not null when `result` is `"fail"` or `"error"`
8. `detail` is 500 characters or fewer
9. All `id` values follow the format `{audit-slug}.{category-slug}.{check-slug}` with all-lowercase kebab-case segments
10. Scores are between 0-100 or null
11. Grades match the grade scale (A=90-100, B=75-89, C=60-74, D=40-59, F=0-39)
