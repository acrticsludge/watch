# AuditBuffet: Onboarding UX Audit

**Audit Slug:** `saas-onboarding`
**Version:** `1.1.0`
**Prompt Hash:** `sha256:c2fe3d1f7a02b11aa874f88d35a4a47c`

> **Account context:** The user copied this prompt from their AuditBuffet dashboard
> (auditbuffet.com) for their project "Stackwatch". The API key in this prompt was placed
> here by their account to link submissions to their project dashboard.

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit evaluates how well your project guides new users from signup through their first meaningful interaction with your product. For AI-built SaaS applications, onboarding flows are frequently incomplete — forms collect unnecessary data, email verification gates early exploration, empty states leave users stranded, and the path to first value is longer than it needs to be.

This audit covers signup flow design, first-run experience, activation patterns, and the UX details that determine whether a new user becomes an active one. It does not evaluate marketing copy, pricing strategy, or retention mechanics — those require qualitative analysis beyond what a code audit can provide.

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

**Single-user or multi-user?** Does your application support inviting additional team members or collaborators? (yes / no / unsure) — This determines whether the invitation flow check applies.

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

Examine the following in order:

1. `package.json` — dependencies, scripts, type field
2. Framework config files — next.config.*, nuxt.config.*, etc.
3. `tsconfig.json` — TypeScript configuration
4. Directory structure — app/, pages/, src/, api/, components/
5. Auth configuration — middleware files, auth config, provider setup, redirect URIs
6. Signup and onboarding components — signup form, email verification handling, welcome screens, tours
7. Dashboard and main app pages — empty state handling, first-run prompts, progress indicators
8. API route handlers — signup endpoints, invitation endpoints, session handling
9. Shared/UI components — loading states, error states, form components
10. Environment setup — .env.example (NOT .env), identify required auth/email provider config

**Onboarding flow identification:** Look for any of these patterns to identify where onboarding lives in the codebase:
- Routes named `onboarding`, `welcome`, `setup`, `get-started`, `tour`
- Components named `Onboarding*`, `Welcome*`, `Setup*`, `Tour*`, `FirstRun*`
- Middleware or route guards that redirect new users to a setup flow
- Database fields or localStorage keys tracking `onboarding_completed`, `is_new_user`, `setup_step`
- Feature flag or user state checks that show different UI to first-time users

---

## Check Definitions

### Category: Signup Flow
**Slug:** `signup-flow`
**Weight in overall score:** 0.25

#### Check: Signup form collects only essential fields
- **ID:** `saas-onboarding.signup-flow.signup-form-minimal`
- **Severity:** `medium`
- **What to look for:** Find the signup/registration form component. Count every required field the user must fill in before creating an account. Quote the field names and their required/optional status.
- **Pass criteria:** The signup form requires no more than 3 fields (e.g., email + password, or name + email + password). Social/OAuth-only signup with no form fields also passes. Report even on pass: "Signup form has N required fields: [field names]."
- **Fail criteria:** The form requires 4 or more fields before account creation (e.g., company name, phone number, job title, address, referral source are all required at signup time).
- **Do NOT pass when:** Optional fields are rendered with no visible "optional" label and look identical to required fields — users perceive them as required even if technically skippable.
- **Skip (N/A) when:** No signup form is found in the codebase — project has no user authentication or uses an embedded third-party widget where form fields are not configurable (e.g., a Clerk `<SignUp />` component with no customization).
- **Detail on fail:** List the required form fields found. Example: `"Signup form requires 5 fields: name, email, password, company name, phone number. Fields beyond email+password increase drop-off."`
- **Remediation:** Reduce the signup form to the minimum. In `src/app/(auth)/signup/page.tsx` or equivalent:

  ```tsx
  <form onSubmit={handleSignup}>
    <Input name="email" type="email" required />
    <Input name="password" type="password" required />
    <Button type="submit">Create account</Button>
  </form>
  ```

  Move additional fields to a post-registration profile setup step at `src/app/(app)/onboarding/page.tsx`.

---

#### Check: Social or OAuth signup is available
- **ID:** `saas-onboarding.signup-flow.social-signup-options`
- **Severity:** `low`
- **What to look for:** Count all OAuth provider configurations in auth setup files. Enumerate the providers found: Google, GitHub, Microsoft, Apple, or similar. Check for buttons or links to each in the signup component.
- **Pass criteria:** At least 1 social/OAuth provider is configured and a sign-in button for it exists in the signup UI. Report even on pass: "Found N OAuth providers configured: [list]."
- **Fail criteria:** No OAuth providers are configured; signup is email-and-password only with no social options.
- **Skip (N/A) when:** The application is an internal tool or enterprise product where SSO/OAuth is intentionally disabled, indicated by the absence of any social provider in auth configuration and no OAuth-related dependencies.
- **Detail on fail:** `"No OAuth providers detected. Only email+password signup is available. Social signup reduces friction and improves conversion for consumer-facing SaaS."`
- **Remediation:** In your auth configuration at `src/lib/auth.ts` or equivalent:

  ```ts
  // NextAuth example
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! }),
    GithubProvider({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),
  ]
  ```

  Even a single "Continue with Google" option can materially increase signup conversion.

---

#### Check: Email verification does not block initial access
- **ID:** `saas-onboarding.signup-flow.email-verification-nonblocking`
- **Severity:** `medium`
- **What to look for:** Trace what happens immediately after a user submits the signup form. Enumerate all middleware checks and route guards that reference email verification status. Count the routes that are gated behind verification. Quote the actual redirect logic if found.
- **Pass criteria:** After signup, the user lands in the application (or a welcome/onboarding screen) without being required to verify their email first. Email verification may be prompted or nudged but is not a hard block to accessing at least 80% of core functionality routes.
- **Fail criteria:** After signup, the user is redirected to a "check your email" page with no way to access the application until they verify. Any route guard that returns 403/redirect for unverified users on pages a new user would naturally visit.
- **Do NOT pass when:** A "soft gate" shows a full-screen modal with no dismiss button blocking the dashboard — this is functionally identical to a hard gate and is NOT a pass.
- **Skip (N/A) when:** The application handles genuinely sensitive data where verification is a regulatory or security requirement (e.g., healthcare, financial services) — detectable if the codebase contains explicit compliance references such as HIPAA, PCI, SOC2 annotations.
- **Detail on fail:** `"Post-signup middleware redirects unverified users to /verify-email. Users cannot access the dashboard or try the product without email verification, creating unnecessary friction."`
- **Remediation:** In `src/middleware.ts`, allow unverified users to access the app:

  ```ts
  // Instead of blocking unverified users:
  if (!session.user.emailVerified) {
    // Show banner, don't redirect
    return NextResponse.next();
  }
  ```

  Show a persistent but dismissible banner in `src/components/VerifyEmailBanner.tsx` rather than a hard gate.
- **Cross-reference:** For auth middleware patterns and session management, the Auth & Session Audit covers verification flow design in detail.

---

#### Check: Every signup and onboarding screen has a clear next action — no dead ends
- **ID:** `saas-onboarding.signup-flow.no-dead-ends`
- **Severity:** `critical`
- **What to look for:** Enumerate every screen in the signup and onboarding flow. For each screen, classify whether it has at least 1 actionable path forward. Count the total screens and the screens with dead ends. Check error states, edge cases (OAuth failure, email already exists, network error during signup), and terminal states (email verification sent, setup complete).
- **Pass criteria:** Every screen and state in the signup/onboarding flow presents a clear next action to the user. Error states include a retry or alternative path. The "check your email" screen includes a resend link. The final onboarding step links to the main dashboard. 0 dead-end screens found.
- **Fail criteria:** Any screen exists where the user has no obvious action available — no button, no link, no instruction on what to do next. This includes: error pages that only show an error message with no retry; confirmation screens with no "continue" link; OAuth failure states that leave the user stranded.
- **Skip (N/A) when:** No signup or onboarding flow exists in the codebase (project has no user authentication).
- **Detail on fail:** Identify the specific screen and state. Example: `"OAuth error handler at /auth/error renders only an error message with no retry button or link back to /login. Users who fail OAuth have no recovery path."`
- **Remediation:** In each error page (e.g., `src/app/(auth)/error/page.tsx`), add recovery actions:

  ```tsx
  <div className="text-center space-y-4">
    <p>Something went wrong during sign in.</p>
    <Button asChild><Link href="/login">Try again</Link></Button>
    <Button variant="outline" asChild><Link href="/signup">Create a new account</Link></Button>
  </div>
  ```

  Common fixes: add "Try again" to every error state; add "Resend verification email" to the verification waiting screen.

---

#### Check: Successful signup provides clear confirmation
- **ID:** `saas-onboarding.signup-flow.signup-success-confirmation`
- **Severity:** `medium`
- **What to look for:** Find what happens immediately after a successful account creation. Count all post-signup feedback mechanisms: redirect targets, toast/notification triggers, and confirmation screens. Quote the actual redirect path if found.
- **Pass criteria:** After successful signup, the user receives at least 1 clear confirmation mechanism that their account was created — either via a redirect to a welcome screen, a success toast/notification, or an onboarding flow that begins immediately. The user is never left wondering if signup worked.
- **Fail criteria:** After successful signup, the user is silently redirected to the main dashboard with no acknowledgment that their account was created. Or: the signup button shows a loading state indefinitely with no success or error feedback.
- **Skip (N/A) when:** No signup flow exists in the codebase.
- **Detail on fail:** `"Post-signup redirect lands directly on /dashboard with no success toast or welcome message. New users receive no confirmation their account was created and may attempt to sign up again."`
- **Remediation:** In the post-signup callback at `src/app/(auth)/signup/page.tsx`:

  ```tsx
  const onSignup = async () => {
    await createAccount(data);
    toast.success('Welcome! Your account has been created.');
    router.push('/onboarding');
  };
  ```

  Many auth libraries expose an `isNewUser` flag on the session for conditional routing.

---

### Category: First-Run Experience
**Slug:** `first-run`
**Weight in overall score:** 0.30

#### Check: New users see a welcome screen or guided orientation on first login
- **ID:** `saas-onboarding.first-run.welcome-screen-or-tour`
- **Severity:** `medium`
- **What to look for:** Enumerate all first-run detection mechanisms: checks for `isNewUser`, `onboarding_completed`, `first_login`, or similar flags in session/database. Count the total. Check for dedicated welcome routes, onboarding step components, product tours (Shepherd.js, Intro.js, driver.js, custom spotlight components), or modal overlays triggered for new users.
- **Pass criteria:** First-time users see a distinct welcome experience — either a dedicated welcome screen, an onboarding checklist, a product tour, or a modal that orients them. At least 1 first-run detection mechanism must be present that distinguishes new from returning users.
- **Fail criteria:** No first-run detection logic exists. New users and returning users land on the identical screen with no differentiation. There is no welcome screen, tour, checklist, or onboarding modal in the codebase.
- **Skip (N/A) when:** The project is a CLI tool, API-only backend, or developer library with no user-facing UI.
- **Detail on fail:** `"No first-run detection found. New users land directly on the dashboard identical to returning users. No welcome screen, onboarding tour, or setup checklist exists in the codebase."`
- **Remediation:** Add first-run detection in `src/app/(app)/dashboard/page.tsx`:

  ```tsx
  const { data: user } = await getUser();
  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }
  ```

  Create an onboarding checklist at `src/app/(app)/onboarding/page.tsx` with 3-5 key setup steps.

---

#### Check: A key action is prompted within the first session
- **ID:** `saas-onboarding.first-run.key-action-prompted-first-session`
- **Severity:** `high`
- **What to look for:** Identify the core value action of your application. Count all CTAs, prompts, and guidance elements visible to new users on first login. For each, classify whether it guides toward the core value action.
- **Pass criteria:** The UI guides new users toward the core value action within the first session — via a prompt, CTA button, empty state CTA, onboarding checklist item, or tooltip. The action is reachable within no more than 2 clicks from the landing page after signup.
- **Fail criteria:** No prompt exists to guide users toward the core value action. New users must independently discover what to do first. The core action requires navigating through menus with no guidance.
- **Skip (N/A) when:** The project is an API-only backend, a developer library, or a CLI tool with no user-facing UI.
- **Detail on fail:** `"No guided CTA toward the core value action found in first-run screens. New users land on an empty dashboard with a navigation menu but no prompt for what to do first."`
- **Remediation:** In `src/app/(app)/dashboard/page.tsx`, add a prominent empty-state CTA:

  ```tsx
  {projects.length === 0 && (
    <Card className="text-center p-12">
      <h2 className="text-xl font-semibold">Create your first project</h2>
      <p className="text-muted-foreground mt-2">Get started in under a minute.</p>
      <Button className="mt-4" asChild><Link href="/projects/new">Create project</Link></Button>
    </Card>
  )}
  ```

---

#### Check: Sample data or a starter template is available for empty states
- **ID:** `saas-onboarding.first-run.sample-data-or-template`
- **Severity:** `high`
- **What to look for:** Enumerate all seeding mechanisms: database seed scripts, "Use template" UI options, demo modes, sandbox environments, starter template galleries. Count the total number available to new users.
- **Pass criteria:** New users can access at least 1 of: pre-populated sample data, a starter template they can clone/use, or a "demo" option. At least 2 example records or templates should be available.
- **Fail criteria:** No sample data, template, or demo content mechanism exists. New users always start with a completely blank slate and must create everything from scratch to experience the product's value.
- **Skip (N/A) when:** The application's purpose is inherently personal or sensitive (e.g., a personal diary, medical records system, private file storage) where sample data would be inappropriate or confusing.
- **Detail on fail:** `"No sample data seeding or starter templates found. New users see only empty states and must create all content from scratch before experiencing product value."`
- **Remediation:** Add seeding logic in `src/lib/seed.ts` called from the post-signup flow:

  ```ts
  export async function seedUserData(userId: string) {
    await db.project.createMany({
      data: [
        { userId, name: 'Example Project', template: 'starter' },
        { userId, name: 'Demo Dashboard', template: 'demo' },
      ],
    });
  }
  ```
- **Cross-reference:** For database seeding patterns and data modeling, the Database Layer Audit covers schema design for user initialization.

---

#### Check: Empty states explain what goes here and how to add it
- **ID:** `saas-onboarding.first-run.empty-states-helpful`
- **Severity:** `high`
- **What to look for:** Count all list views, galleries, dashboards, and data tables in the application. For each, classify whether it has a proper empty state component. Enumerate: explanation text, CTA button, illustration/icon present. Report the ratio of views with proper empty states vs. those without.
- **Pass criteria:** Every major list view and data display area has an empty state that (1) explains what belongs in the space and (2) provides a direct action to add the first item. At least 90% of list views must have proper empty states.
- **Fail criteria:** Any major list view renders as a blank area, a generic "No results" message, or a table with only headers and no rows — with no explanation of what should be there or how to add it.
- **Skip (N/A) when:** The project has no list views or data display components (e.g., it is a purely content-display site with no user-generated data).
- **Detail on fail:** List the components or routes with inadequate empty states. Example: `"Dashboard main list and /projects route render blank or generic 'No data' when empty. No explanation or CTA to create the first item."`
- **Remediation:** Create a reusable empty state component at `src/components/EmptyState.tsx`:

  ```tsx
  export function EmptyState({ title, description, actionLabel, actionHref }: Props) {
    return (
      <div className="text-center py-12">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
        <Button className="mt-4" asChild><Link href={actionHref}>{actionLabel}</Link></Button>
      </div>
    );
  }
  ```

---

#### Check: Application settings have sensible defaults for new users
- **ID:** `saas-onboarding.first-run.settings-sensible-defaults`
- **Severity:** `medium`
- **What to look for:** Count all settings and configuration fields in the application. For each, classify whether a default value is set (not blank/null/undefined). Enumerate any settings that require configuration before core functionality works.
- **Pass criteria:** 100% of settings have explicit defaults. No setting requires configuration before the user can use the core functionality. Defaults are appropriate for new users (not expert-mode settings).
- **Fail criteria:** 1 or more required settings have no default value, leaving the user with a blank/broken configuration state. Or: settings page is the first thing a new user must complete before they can access the product.
- **Do NOT pass when:** Default values are set in code but the settings UI shows empty/blank fields because the defaults are not persisted to the database on account creation — visual emptiness is NOT a pass even if the backend has fallbacks.
- **Skip (N/A) when:** The application has no settings or preferences UI.
- **Detail on fail:** `"Settings page has required fields with no defaults: [field names]. New users must manually configure these before the application functions correctly."`
- **Remediation:** In your database schema (e.g., `prisma/schema.prisma`), use DEFAULT values:

  ```prisma
  model UserSettings {
    id              String  @id @default(cuid())
    userId          String  @unique
    emailNotifs     Boolean @default(true)
    theme           String  @default("system")
    timezone        String  @default("UTC")
  }
  ```

---

### Category: Activation & Value
**Slug:** `activation`
**Weight in overall score:** 0.25

#### Check: First value moment is achievable in under 5 minutes
- **ID:** `saas-onboarding.activation.first-value-under-5min`
- **Severity:** `critical`
- **What to look for:** Count every required step from signup completion to the first value moment. For each step, estimate time required. List all steps: required form fills, required configuration, required connections to external services, required content creation.
- **Pass criteria:** A new user with no prior knowledge can reach the first value moment in under 5 minutes and in fewer than 6 steps, with no steps requiring external account creation or configuration outside the application.
- **Fail criteria:** The path to first value requires more than 5 minutes of active work; requires connecting external services before showing any value; requires configuration steps not guided by the UI; requires the user to leave the application to complete setup.
- **Skip (N/A) when:** The application is inherently a long-setup product (e.g., enterprise data migration tool, hardware configuration utility) where the first value moment by design requires significant upfront data entry.
- **Detail on fail:** Describe the minimum path and the blocking steps. Example: `"Path to first value requires: (1) verify email [blocks progress], (2) complete 6-field profile, (3) connect external API with manual key entry, (4) create first item. Estimated >10 minutes with no interim value shown."`
- **Remediation:** Map the critical path in `src/app/(app)/onboarding/` and minimize steps:

  ```tsx
  // Skip non-essential steps
  const steps = [
    { id: 'welcome', required: true },
    { id: 'profile', required: false },  // Defer to settings
    { id: 'first-project', required: true },
  ];
  ```

  Remove blocking steps — offer sample data so users see value before creating content.

---

#### Check: Error states during onboarding include clear recovery guidance
- **ID:** `saas-onboarding.activation.error-states-clear-recovery`
- **Severity:** `high`
- **What to look for:** Count all error handling paths in signup, onboarding, and first-run components: try/catch blocks, error boundary components, form validation display, API error handlers. For each error path, classify whether it renders a human-readable message with a recovery action.
- **Pass criteria:** All error states display: (1) a human-readable explanation of what went wrong (not a raw error code), (2) a specific action the user can take to recover. Form validation errors are inline. 100% of error paths must have user-friendly messages.
- **Fail criteria:** Any error state during onboarding displays only: a generic "Something went wrong" message with no guidance; a raw error code or technical error string; an error message with no recovery action offered.
- **Skip (N/A) when:** No onboarding flow or signup form exists in the codebase.
- **Detail on fail:** Describe the specific error states that fail. Example: `"OAuth error handler displays raw error code from provider. Form submission errors show a generic toast with no field-level detail. Network error shows 'Error: 500' with no retry option."`
- **Remediation:** In your signup form at `src/app/(auth)/signup/page.tsx`, map error types:

  ```tsx
  const errorMessages: Record<string, string> = {
    'email-exists': 'This email is already registered — try signing in instead.',
    'invalid-password': 'Password must be at least 8 characters.',
    'rate-limited': 'Too many attempts. Please wait a moment.',
  };
  ```
- **Cross-reference:** For comprehensive error handling patterns across the full application, the SaaS Error Handling Audit covers server-side error management.

---

#### Check: Onboarding flow is functional on mobile devices
- **ID:** `saas-onboarding.activation.mobile-onboarding-functional`
- **Severity:** `medium`
- **What to look for:** Count all signup and onboarding screens. For each, check responsive CSS usage: Tailwind responsive prefixes, CSS media queries, fluid layouts. Measure touch target sizes — minimum 44px required. Count any fixed-width containers.
- **Pass criteria:** All signup and onboarding screens use responsive layout patterns. Form inputs, buttons, and interactive elements have touch-target sizes of at least 44 pixels height. No UI element overflows the viewport horizontally at 375px width.
- **Fail criteria:** Signup or onboarding screens use fixed pixel widths that overflow on small screens; form inputs or buttons are too small to tap reliably (under 32px height); modal dialogs overflow the viewport on mobile; horizontal scrolling is required on any onboarding screen.
- **Skip (N/A) when:** The application is explicitly desktop-only (documented in README or marketing copy as requiring a desktop browser, and no mobile-responsive CSS is present anywhere in the project).
- **Detail on fail:** `"Signup form uses fixed 600px width container with no responsive breakpoint. Onboarding modal exceeds viewport on screens narrower than 768px. Submit button height is 28px — below touch target minimum."`
- **Remediation:** In your auth layout at `src/app/(auth)/layout.tsx`, use responsive containers:

  ```tsx
  <div className="flex min-h-screen items-center justify-center p-4">
    <Card className="w-full max-w-md">
      {children}
    </Card>
  </div>
  ```

  Ensure all buttons use `h-11` (44px minimum).
- **Cross-reference:** For a deeper review of mobile responsiveness across the full application, the Mobile Responsiveness Audit covers this in detail.

---

#### Check: Loading states are shown during async setup operations
- **ID:** `saas-onboarding.activation.loading-states-during-setup`
- **Severity:** `low`
- **What to look for:** Count all async operations in the onboarding flow: form submission, OAuth redirect, account creation API calls, initial data loading. For each, classify whether a loading state is rendered. Report the ratio of operations with loading states.
- **Pass criteria:** 100% of async operations during onboarding have a visible loading indicator. The submit button is disabled during form submission to prevent double-submissions. Any async data fetch has a skeleton or spinner. No blank screen exceeds 500ms without a loading indicator.
- **Fail criteria:** The signup form submit button remains active and shows no loading state during submission (allowing double-clicks that create duplicate accounts); the post-signup redirect shows a blank screen for more than 500ms with no loading indicator.
- **Skip (N/A) when:** No async operations exist in the onboarding flow (static site with no backend).
- **Detail on fail:** `"Signup form submit button shows no loading state and remains clickable during submission. Post-OAuth redirect shows blank white screen for 1-2 seconds with no spinner or skeleton."`
- **Remediation:** In your signup form at `src/app/(auth)/signup/page.tsx`:

  ```tsx
  <Button type="submit" disabled={isPending} className="w-full h-11">
    {isPending ? 'Creating account...' : 'Create account'}
  </Button>
  ```

  For page transitions, add `src/app/(auth)/loading.tsx` with a spinner component.

---

### Category: Onboarding UX
**Slug:** `onboarding-ux`
**Weight in overall score:** 0.20

#### Check: Multi-step setup shows progress to the user
- **ID:** `saas-onboarding.onboarding-ux.progress-indicator`
- **Severity:** `low`
- **What to look for:** Count the total onboarding steps. If the application has more than 1 screen between signup and dashboard, look for a progress indicator — a step counter ("Step 2 of 4"), a progress bar, a checklist of steps with completion states, or numbered step labels.
- **Pass criteria:** If the onboarding has more than 1 step, a progress indicator is visible that tells the user how many steps exist and which step they are on. The indicator must update at least 1 time per step transition.
- **Fail criteria:** A multi-step onboarding flow exists with no progress indicator. Users have no way to know how many more steps remain.
- **Skip (N/A) when:** The onboarding flow is a single screen (no multi-step flow) or no onboarding flow exists.
- **Detail on fail:** `"Onboarding has [N] steps with no step counter, progress bar, or step indicator. Users cannot tell how many steps remain, increasing the likelihood of abandonment."`
- **Remediation:** In `src/app/(app)/onboarding/layout.tsx`, add a step indicator:

  ```tsx
  <div className="flex items-center gap-2 mb-6">
    {steps.map((step, i) => (
      <div key={step.id} className={cn("h-2 flex-1 rounded", i <= currentStep ? "bg-primary" : "bg-muted")} />
    ))}
    <span className="text-sm text-muted-foreground ml-2">Step {currentStep + 1} of {steps.length}</span>
  </div>
  ```

---

#### Check: Team invitation flow is clearly presented
- **ID:** `saas-onboarding.onboarding-ux.invitation-flow-clear`
- **Severity:** `medium`
- **What to look for:** Count the clicks required to reach the invitation UI from the main dashboard. Enumerate the invitation flow: invite by email, invite link generation, role assignment. Check whether the invitation acceptance flow handles non-users.
- **Pass criteria:** An invitation UI exists and is accessible within no more than 2 clicks from the main dashboard. Invitation emails include the inviter's name and the application name. Invitees without accounts are directed to create one before accepting.
- **Fail criteria:** Invitation UI requires more than 2 clicks to reach from the main dashboard; invitation links expire without warning; invitees who click an invitation link and don't have an account see an error rather than a signup prompt.
- **Skip (N/A) when:** The application is explicitly single-user only (no team, workspace, or multi-user concepts exist in the codebase — no invitation routes, no team/workspace models, no role assignment).
- **Detail on fail:** `"Invitation feature exists but is nested 3+ clicks deep in settings. Invitation link acceptance for non-users shows a 'User not found' error instead of redirecting to signup."`
- **Remediation:** In the invitation acceptance handler at `src/app/invite/[token]/page.tsx`:

  ```tsx
  const invite = await getInviteByToken(token);
  const user = await getUserByEmail(invite.email);
  if (!user) {
    redirect(`/signup?email=${invite.email}&invite=${token}`);
  }
  ```

  Add an "Invite teammates" option to `src/components/Sidebar.tsx` within 2 clicks.

---

#### Check: Help documentation is accessible from within the onboarding flow
- **ID:** `saas-onboarding.onboarding-ux.help-accessible-during-onboarding`
- **Severity:** `low`
- **What to look for:** Count all help access points on onboarding and signup screens: help icons, "?" buttons, documentation links, chat widgets (Intercom, Crisp, Chatwoot), "Need help?" links, or tooltips. Enumerate each.
- **Pass criteria:** At least 1 help access point is visible on onboarding screens — either a persistent help button, a contextual tooltip on complex steps, a "Need help?" link, or a chat widget.
- **Fail criteria:** No help access points are present anywhere on signup or onboarding screens. The only help available requires the user to navigate away from onboarding.
- **Skip (N/A) when:** The application has no documentation, help center, or support channel of any kind.
- **Detail on fail:** `"No help access points found on signup or onboarding screens. Users who encounter questions during setup have no in-context way to get help."`
- **Remediation:** In your onboarding layout at `src/app/(app)/onboarding/layout.tsx`:

  ```tsx
  <div className="fixed bottom-4 right-4">
    <Button variant="outline" size="sm" asChild>
      <Link href="/docs/getting-started" target="_blank">Need help?</Link>
    </Button>
  </div>
  ```

---

#### Check: Onboarding can be skipped and revisited later
- **ID:** `saas-onboarding.onboarding-ux.onboarding-skippable-revisitable`
- **Severity:** `low`
- **What to look for:** Count all onboarding steps and for each classify whether a skip option is present. Check whether onboarding content is accessible after completion — look for a "Setup guide" or "Get started checklist" in navigation or settings.
- **Pass criteria:** Users can skip onboarding at any step and reach the main application. Completed or skipped onboarding content is accessible again from the navigation or settings. At least 1 re-entry point to onboarding guidance must exist.
- **Fail criteria:** No skip option exists on mandatory onboarding steps; or onboarding is skippable but there is no way to return to it after skipping; or completing onboarding removes it from the UI permanently.
- **Skip (N/A) when:** The application has no multi-step onboarding flow (single signup screen directly to dashboard).
- **Detail on fail:** `"Onboarding steps have no skip option. Users must complete all onboarding steps before reaching the main application. No way to revisit onboarding guidance after initial completion."`
- **Remediation:** In each onboarding step at `src/app/(app)/onboarding/[step]/page.tsx`:

  ```tsx
  <div className="flex justify-between mt-8">
    <Button onClick={handleNext}>Continue</Button>
    <Button variant="ghost" onClick={() => router.push('/dashboard')}>Skip for now</Button>
  </div>
  ```

  Add a "Setup guide" link in `src/components/Sidebar.tsx` that remains visible.

---

#### Check: Back navigation preserves form state
- **ID:** `saas-onboarding.onboarding-ux.back-navigation-preserves-state`
- **Severity:** `low`
- **What to look for:** Count all multi-step form stages. For each, check whether navigating back preserves entered data. Enumerate state management patterns: React state, form library state, URL query params, localStorage, sessionStorage.
- **Pass criteria:** Navigating back to a previous onboarding step shows previously entered data, not a blank form. At least 1 state persistence mechanism must be present across steps.
- **Fail criteria:** Navigating back to a previous step clears the previously entered data, forcing the user to re-enter information.
- **Skip (N/A) when:** The onboarding flow is a single-step form with no back navigation, or no onboarding flow exists.
- **Detail on fail:** `"Navigating back in the multi-step onboarding form clears previously entered fields. Users who go back to correct an answer must re-enter all subsequent data."`
- **Remediation:** Use `react-hook-form` with a shared context in `src/app/(app)/onboarding/layout.tsx`:

  ```tsx
  const methods = useForm({ defaultValues: savedData });
  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
  ```

  For route-based steps, persist to `sessionStorage` and rehydrate on mount.

---

#### Check: Onboarding UI is accessible to users with disabilities
- **ID:** `saas-onboarding.onboarding-ux.accessibility-of-onboarding`
- **Severity:** `critical`
- **What to look for:** Count all form fields in signup and onboarding. For each, classify whether it has an associated `<label>` or `aria-label`. Count error messages and check for `aria-describedby` or `role="alert"`. Enumerate interactive elements and verify keyboard navigability. Check focus management in modals. Count `outline: none` usages.
- **Pass criteria:** 100% of form fields in signup have an associated `<label>` or `aria-label`. Error messages use `aria-describedby` or `role="alert"`. All interactive elements are reachable via keyboard. No `outline: none` without a visible focus replacement. Report even on pass: "Checked N form fields — all have labels. N error states use role=alert."
- **Fail criteria:** Any of: form fields without labels or `aria-label`; error messages that only appear visually with no `role="alert"`; interactive elements not reachable by keyboard; focus not trapped in modal dialogs; focus indicators removed with `outline: none` and no visible replacement.
- **Skip (N/A) when:** The project has no user-facing UI (API-only, CLI tool, or library).
- **Detail on fail:** List specific failures. Example: `"Signup form: email and password fields have no associated <label>. Error messages have no role='alert'. Modal dialog does not trap focus. Tab order skips the 'Show password' toggle."`
- **Remediation:** In your signup form at `src/app/(auth)/signup/page.tsx`:

  ```tsx
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" aria-describedby={error ? "email-error" : undefined} />
    {error && <p id="email-error" role="alert" className="text-destructive text-sm">{error}</p>}
  </div>
  ```
- **Cross-reference:** For a comprehensive accessibility review across the full application, the Accessibility Fundamentals Audit covers WCAG 2.1 AA compliance in depth.

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
    "slug": "saas-onboarding",
    "display_name": "Onboarding UX Audit",
    "version": "1.1.0",
    "prompt_hash": "sha256:5d038bca2ce197199461c864cf15e183"
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
        "slug": "signup-flow",
        "display_name": "Signup Flow",
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
        "slug": "first-run",
        "display_name": "First-Run Experience",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.30,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 5
      },
      {
        "slug": "activation",
        "display_name": "Activation & Value",
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
        "slug": "onboarding-ux",
        "display_name": "Onboarding UX",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.20,
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
      "id": "saas-onboarding.signup-flow.signup-form-minimal",
      "label": "Signup form collects only essential fields",
      "category_slug": "signup-flow",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.signup-flow.social-signup-options",
      "label": "Social or OAuth signup is available",
      "category_slug": "signup-flow",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.signup-flow.email-verification-nonblocking",
      "label": "Email verification does not block initial access",
      "category_slug": "signup-flow",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.signup-flow.no-dead-ends",
      "label": "Every signup and onboarding screen has a clear next action — no dead ends",
      "category_slug": "signup-flow",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.signup-flow.signup-success-confirmation",
      "label": "Successful signup provides clear confirmation",
      "category_slug": "signup-flow",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.first-run.welcome-screen-or-tour",
      "label": "New users see a welcome screen or guided orientation on first login",
      "category_slug": "first-run",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.first-run.key-action-prompted-first-session",
      "label": "A key action is prompted within the first session",
      "category_slug": "first-run",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.first-run.sample-data-or-template",
      "label": "Sample data or a starter template is available for empty states",
      "category_slug": "first-run",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.first-run.empty-states-helpful",
      "label": "Empty states explain what goes here and how to add it",
      "category_slug": "first-run",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.first-run.settings-sensible-defaults",
      "label": "Application settings have sensible defaults for new users",
      "category_slug": "first-run",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.activation.first-value-under-5min",
      "label": "First value moment is achievable in under 5 minutes",
      "category_slug": "activation",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.activation.error-states-clear-recovery",
      "label": "Error states during onboarding include clear recovery guidance",
      "category_slug": "activation",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.activation.mobile-onboarding-functional",
      "label": "Onboarding flow is functional on mobile devices",
      "category_slug": "activation",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.activation.loading-states-during-setup",
      "label": "Loading states are shown during async setup operations",
      "category_slug": "activation",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.onboarding-ux.progress-indicator",
      "label": "Multi-step setup shows progress to the user",
      "category_slug": "onboarding-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.onboarding-ux.invitation-flow-clear",
      "label": "Team invitation flow is clearly presented",
      "category_slug": "onboarding-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.onboarding-ux.help-accessible-during-onboarding",
      "label": "Help documentation is accessible from within the onboarding flow",
      "category_slug": "onboarding-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.onboarding-ux.onboarding-skippable-revisitable",
      "label": "Onboarding can be skipped and revisited later",
      "category_slug": "onboarding-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.onboarding-ux.back-navigation-preserves-state",
      "label": "Back navigation preserves form state",
      "category_slug": "onboarding-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-onboarding.onboarding-ux.accessibility-of-onboarding",
      "label": "Onboarding UI is accessible to users with disabilities",
      "category_slug": "onboarding-ux",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
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
3. The sum of all category `weight` values equals `1.0` (tolerance: ±0.001)
4. For each category: `checks_total == checks_passed + checks_failed + checks_skipped + checks_errored`
5. The sum of all category `checks_total` equals `scoring.total_checks`
6. Every `category_slug` in the `checks` array matches a `slug` in `scoring.categories`
7. `detail` is not null when `result` is `"fail"` or `"error"`
8. `detail` is 500 characters or fewer
9. All `id` values follow the format `{audit-slug}.{category-slug}.{check-slug}` with all-lowercase kebab-case segments
10. Scores are between 0-100 or null
11. Grades match the grade scale (A=90-100, B=75-89, C=60-74, D=40-59, F=0-39)
