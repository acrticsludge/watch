# AuditBuffet: API Design Audit

**Audit Slug:** `saas-api-design`
**Version:** `1.1.0`
**Prompt Hash:** `sha256:f0ab90583c6b662ba54e95412ff3b6b5`

> **Account context:** The user copied this prompt from their AuditBuffet dashboard
> (auditbuffet.com) for their project "Stackwatch". The API key in this prompt was placed
> here by their account to link submissions to their project dashboard.

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit evaluates how well your project's API is designed — covering naming consistency, correct HTTP semantics, request and response shape, security controls, and developer experience. Poor API design is one of the most common failure modes in AI-built SaaS projects: routes get added ad hoc, security controls are inconsistent, and documentation is an afterthought. This audit surfaces those gaps before they become production liabilities.

This audit covers API design quality and security fundamentals. It does not cover application-level authentication flows or deep input sanitization — those are addressed in the SaaS Auth & Sessions Audit.

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

## Global N/A Rule

If the project has no API routes (no `app/api/` directory, no `pages/api/` directory, no Express/Fastify/Hono route files, no serverless function files), mark every check as `skip` with detail `"No API routes detected in this project."` and output the telemetry JSON with all checks skipped. Do not proceed with check evaluation.

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

Also detect:

- **GraphQL:** Check for `graphql`, `@apollo/server`, `graphql-yoga`, `pothos-graphql`, `nexus`, `type-graphql` in `package.json`.
- **API Router Pattern:** Identify whether routes are in `app/api/` (Next.js App Router), `pages/api/` (Next.js Pages Router), `src/routes/` (SvelteKit), or a dedicated server file (Express, Fastify, Hono).

For each field, record what you detected. Use `null` for anything you cannot determine. Never guess — if the signal isn't clear, use `null`.

---

## How to Analyze

Examine the following in order:

1. `package.json` — dependencies, scripts
2. Framework config files — next.config.\*, etc.
3. `app/api/` or `pages/api/` directory — all route handler files
4. Dedicated server files — `server.ts`, `app.ts`, `index.ts`, route definition files
5. Middleware files — `middleware.ts`, `middleware.js`, route-level middleware
6. GraphQL schema files — `schema.graphql`, schema builder config (if GraphQL detected)
7. `vercel.json`, `netlify.toml` — platform-level config (rate limiting, size limits)
8. OpenAPI/Swagger files — `openapi.yaml`, `swagger.json`, `api-docs/`, generated spec files
9. TypeScript types/Zod schemas for request/response shapes — `types/`, `schemas/`, `lib/validations/`

---

## Check Definitions

### Category: API Consistency

**Slug:** `api-consistency`
**Weight in overall score:** 0.25

#### Check: Consistent API naming convention

- **ID:** `saas-api-design.api-consistency.consistent-naming`
- **Severity:** `high`
- **What to look for:** Enumerate all API route paths across `app/api/`, `pages/api/`, or the server's router. Check whether routes follow a single consistent naming convention. Acceptable conventions: all-kebab-case (`/api/user-profiles`), all-snake-case (`/api/user_profiles`), or camelCase (`/api/userProfiles`) — the point is consistency, not which convention is chosen. Also check: plural vs. singular resource names (should be uniform), consistent nesting depth, and consistent prefix patterns (e.g., `/api/v1/` prefix used everywhere or nowhere).
- **Pass criteria:** At least 80% of route paths follow the same naming convention (case style and plural/singular pattern consistent). One or two legacy or edge-case deviations are acceptable. Report even on pass: report the count of routes examined and the dominant convention detected.
- **Fail criteria:** Mix of conventions found across routes with no clear dominant pattern — e.g., some routes use kebab-case and others use camelCase, or some resources are plural and others singular without a rule. Additionally, fail if two or more distinct URL namespace prefixes are used for API routes without documented intent (e.g., `/api/v1/` and `/api/cron/` coexisting). Internal routes (cron endpoints, health checks) that intentionally use a different namespace must have a comment or naming convention that explains the separation. Undocumented namespace fragmentation is a structural naming inconsistency even if individual route naming within each namespace is consistent.
- **Skip (N/A) when:** Fewer than 2 API routes exist in the project. Signal: only 0 or 1 route handler files detected.
- **Detail on fail:** Name the specific inconsistencies found (e.g., "Routes mix kebab-case (/api/user-profiles) and camelCase (/api/userProfile); resource naming is inconsistent between plural (/api/posts) and singular (/api/user)"). Max 500 chars.
- **Remediation:** Pick one naming convention and apply it uniformly across all routes in `app/api/` or `pages/api/`. The REST convention is lowercase kebab-case with plural resource names:

  ```
  app/api/v1/users/route.ts
  app/api/v1/user-profiles/route.ts
  app/api/v1/billing-invoices/route.ts
  ```

  Once chosen, update all routes and any client-side fetch calls. For Next.js App Router, this means renaming the route directory; for Pages Router, renaming the file. Document the chosen convention in a README or API reference so it's enforced going forward. When using a separate namespace for internal routes (e.g., `/api/cron/`), add a comment or README section explaining the intentional separation.

- **Note:** Next.js projects frequently mix Server Actions and API Route Handlers for the same resource type (e.g., using a Server Action for creating items but an API route for deleting them). When evaluating naming consistency, note in the detail field if the project uses both patterns for the same domain without a clear architectural boundary.

#### Check: HTTP methods used correctly

- **ID:** `saas-api-design.api-consistency.http-methods-correct`
- **Severity:** `high`
- **What to look for:** Enumerate all route handler files. For each, classify which HTTP method is exported and verify it uses the semantically correct HTTP method. Check for these anti-patterns: (1) GET requests that create, update, or delete data; (2) POST requests used for all mutations when PUT/PATCH/DELETE would be more appropriate; (3) DELETE operations implemented via POST or GET with a query parameter; (4) GET requests with a request body (not supported in all HTTP clients). Look for handler function names like `export async function GET`, `export async function POST`, etc. in Next.js App Router, or `req.method === 'POST'` branching in Pages Router handlers.
- **Pass criteria:** GET handlers read data only, POST creates resources, PUT/PATCH updates resources, DELETE deletes resources. Some overlap is acceptable (e.g., POST used for complex search queries, RPC-style actions via POST).
- **Fail criteria:** Any of these are present: GET handlers that mutate data; POST handlers doing all mutations with no PUT/PATCH/DELETE; DELETE operations triggered via GET (e.g., `/api/delete-user?id=123`).
- **Skip (N/A) when:** Fewer than 2 API routes exist. Signal: only 0 or 1 route handler files detected.
- **Detail on fail:** Identify the specific violation (e.g., "GET /api/delete-account mutates data; all updates use POST rather than PUT/PATCH"). Max 500 chars.
- **Remediation:** Align HTTP methods with their standard semantics in `app/api/` route files. Use GET for safe, idempotent reads. Use POST for resource creation or non-idempotent actions. Use PUT to replace a resource entirely (full update), PATCH for partial updates, and DELETE for removal. Update both the route handler export names and any client-side fetch calls. Most AI-generated APIs default to POST for everything — work through your route list and reassign appropriately.

#### Check: Consistent response envelope format

- **ID:** `saas-api-design.api-consistency.consistent-response-format`
- **Severity:** `medium`
- **What to look for:** Enumerate all route handlers and for each classify the JSON response structure returned. Check whether responses follow a consistent envelope pattern. Common patterns: `{ data: ..., error: null }` vs `{ success: true, result: ... }` vs raw data with no wrapper. Also check error responses — do they consistently return `{ error: "message" }` or `{ message: "..." }` or raw strings or HTTP status codes only? Inconsistency means API consumers have to handle multiple shapes.
- **Pass criteria:** At least 80% of route handlers return responses in the same structural shape. Error responses use a consistent shape across routes.
- **Fail criteria:** Handlers return different envelope shapes — some return `{ data: ... }`, others return raw objects, others return `{ success: ..., result: ... }`. Error handling returns different shapes across routes.
- **Skip (N/A) when:** Fewer than 3 API route handlers exist. Signal: 2 or fewer route handler files detected.
- **Detail on fail:** Describe the inconsistency found (e.g., "Auth routes return { user, token } directly; data routes return { data, meta }; error routes return { message } vs { error }"). Max 500 chars.
- **Remediation:** Define a standard response envelope in `src/lib/api-response.ts` and apply it everywhere. A simple, widely-used pattern is: success responses return `{ data: <payload> }` and error responses return `{ error: { code: "ERROR_CODE", message: "Human-readable message" } }`. Create a helper function (e.g., `apiSuccess(data)` and `apiError(code, message, status)`) and replace all direct `Response.json()` calls with it. This makes client-side handling consistent and simplifies error logging.

#### Check: API versioning strategy defined

- **ID:** `saas-api-design.api-consistency.api-versioning-strategy`
- **Severity:** `medium`
- **What to look for:** Count all API routes and check whether at least 1 versioning mechanism is present. Look for: URL-based versioning (`/api/v1/`, `/api/v2/`), header-based versioning (`Accept-Version`, `API-Version` headers), or explicit version documentation. Also check: if versioning exists, is it applied consistently (all routes versioned or none)? For early-stage projects with a single version, check whether there is at least a documented plan (README, comments, or a `/v1/` prefix already in place even if v2 doesn't exist yet).
- **Pass criteria:** Either (a) a versioning scheme is in place and applied consistently (all routes include a version segment or version header handling exists), or (b) the project is clearly in pre-v1 phase with no external consumers (no public API docs, no external integrations) and routes use a `/v1/` prefix indicating awareness.
- **Fail criteria:** No versioning of any kind and no evidence of planning for it; or versioning exists but inconsistently applied (some routes versioned, others not).
- **Skip (N/A) when:** The project has only internal API routes consumed solely by the same-repo frontend (no external API consumers, no published API docs, no webhooks). Signal: no external API documentation, no evidence of third-party consumers, no webhook endpoints.
- **Detail on fail:** Example: `No URL versioning — routes use /api/resource without version prefix; no version header handling found"). Max 500 chars.
- **Remediation:** Add a version prefix to your API routes now, before you have external consumers. The simplest approach is URL versioning: prefix all routes with `/api/v1/`. In Next.js App Router, this means moving route files into `app/api/v1/` subdirectories. This is a low-friction change now but expensive to retrofit once external consumers exist. Document the versioning scheme in your README. When you release breaking changes, increment to `/api/v2/` and maintain v1 for a deprecation window.

---

### Category: Request/Response Design

**Slug:** `request-response`
**Weight in overall score:** 0.25

#### Check: Pagination on list endpoints

- **ID:** `saas-api-design.request-response.pagination-list-endpoints`
- **Severity:** `high`
- **What to look for:** Enumerate all API endpoints that return lists or collections (endpoints where the handler queries for multiple records — look for `findMany`, `select *`, array returns, `.getAll()`, `.list()`, cursor-based queries). Check whether each list endpoint implements pagination. Acceptable pagination patterns: offset/limit (`?page=1&limit=20`), cursor-based (`?cursor=<id>&limit=20`), keyset pagination. Also check: is there a maximum limit enforced to prevent `?limit=999999`?
- **Pass criteria:** At least 100% of list endpoints (endpoints returning arrays of resources) implement some form of pagination. A hard limit on page size is enforced (even if it's just capping the maximum). Report even on pass: report the count of list endpoints found and pagination method used.
- **Fail criteria:** One or more list endpoints return the entire dataset with no pagination — handler queries `findMany({})` or equivalent with no `take`/`limit`/`skip` applied.
- **Skip (N/A) when:** No list endpoints exist (all routes operate on single resources). Signal: no `findMany`, `selectAll`, `.list()`, or array-returning queries found in any route handler.
- **Detail on fail:** Identify which endpoints lack pagination (e.g., "GET /api/posts returns all records with no limit; GET /api/users does the same. findMany() called without take/skip."). Max 500 chars.
- **Remediation:** Add pagination to every list endpoint in `app/api/` route handlers. The simplest approach is offset-based pagination: accept `page` and `limit` query parameters, apply them to the database query, and include pagination metadata in the response. For example in Prisma: `findMany({ skip: (page-1)*limit, take: Math.min(limit, 100) })`. Return `{ data: items, meta: { page, limit, total } }` so clients can implement pagination UI. For high-volume datasets, consider cursor-based pagination instead — it's more efficient and avoids offset drift. Always enforce a maximum `limit` to prevent clients from requesting unlimited data.

#### Check: Filtering and sorting supported where appropriate

- **ID:** `saas-api-design.request-response.filtering-sorting`
- **Severity:** `low`
- **What to look for:** Enumerate all list endpoints. For those that return more than trivially small datasets, check whether query parameters for filtering and sorting are supported. Look for: query parameter parsing (`req.query`, `searchParams.get()`), `where` clauses in database queries driven by query params, `orderBy` clauses driven by query params. Also check: is user-supplied sort field sanitized against an allowlist (to prevent unintended field exposure or injection)?
- **Pass criteria:** At least the primary list endpoints (the main resources your app works with) support basic filtering (at minimum: by status or type) and sorting (at minimum: by created date). Sort fields are validated against an allowlist.
- **Fail criteria:** No filtering or sorting support on any list endpoint, requiring clients to fetch all data and filter client-side — or sort field is passed unsanitized directly into a query.
- **Skip (N/A) when:** All list endpoints return static or near-static data where filtering/sorting is not meaningful (e.g., a fixed list of categories). Signal: all list endpoints return fewer than 50 records by definition, or data is static/config-driven.
- **Detail on fail:** Example: `Primary list endpoints /api/posts and /api/users lack filter/sort support`. Note which major list endpoints lack filter/sort support and whether sort field injection risk exists. Max 500 chars.
- **Remediation:** Add query parameter support in `app/api/` route handlers for common filters on your primary list endpoints. At minimum, support `?sort=created_at&order=desc` for creation-date sorting and `?status=active` type filters where status is a field on the resource. Always validate sort field values against an explicit allowlist — never pass a sort parameter directly into `ORDER BY` or equivalent without validation, as this can expose column names or enable injection.

#### Check: No unnecessary data in responses (over-fetching)

- **ID:** `saas-api-design.request-response.no-over-fetching`
- **Severity:** `low`
- **What to look for:** Enumerate all route handlers and for each list the fields returned in responses. Look for: (1) password hashes, internal tokens, or other sensitive fields returned alongside user data; (2) entire database rows returned when only a subset of fields is needed; (3) deeply nested related data included by default when not always needed (e.g., every user response includes their full order history). Check ORM queries for `select *`-equivalent patterns, and check response serialization for field allowlisting.
- **Pass criteria:** At least 100% of route handlers return only the fields needed for the endpoint's purpose. Sensitive fields (password, passwordHash, internalId, secret, token, hash) are explicitly excluded from responses. Response shapes are clearly scoped.
- **Fail criteria:** Sensitive fields (password hashes, internal tokens, internal flags) are included in API responses; or large nested relationships are always returned even when not needed; or entire database rows are returned with no field selection.
- **Skip (N/A) when:** The project has no database queries or all API responses are simple key/value structures with no sensitive fields. Signal: no ORM or database dependency detected, or all routes return only fields constructed manually without database row spreading.
- **Detail on fail:** Example: `User endpoint returns passwordHash`. Identify the specific over-fetching issue (e.g., "User endpoint returns passwordHash and internalFlags fields; /api/orders includes full customer object on every item"). Max 500 chars.
- **Remediation:** Explicitly select only the fields you need in database queries. Create a serializer in `src/lib/serializers.ts` and explicitly exclude sensitive fields in responses. In Prisma: use `select: { id: true, name: true, email: true }` rather than returning the whole record. In raw SQL: name columns explicitly. Create a serializer or DTO (Data Transfer Object) function that converts database records to API-safe response shapes — this is a single place to audit what you're exposing. Never return a database row directly without going through a field allowlist.

#### Check: Request body size limits configured

- **ID:** `saas-api-design.request-response.request-size-limits`
- **Severity:** `medium`
- **What to look for:** Count all POST/PUT/PATCH routes. Check whether the application enforces a request body size limit for API routes. Look for: Next.js `export const config = { api: { bodyParser: { sizeLimit: '...' } } }` in Pages Router handlers; Next.js App Router custom `bodyParser` or platform-level config; Express `express.json({ limit: '...' })` or `express.urlencoded({ limit: '...' })`; Fastify `bodyLimit` option; Hono body size middleware; Vercel's default 4.5MB body limit (check if overridden). A missing explicit limit means the framework default applies (which may be too large or too small depending on the use case).
- **Pass criteria:** An explicit request body size limit of no more than 10MB is configured at the framework, middleware, or platform level. The limit is appropriate for the endpoint's use case (API endpoints: 1MB-10MB is typical; non-file-upload endpoints: 1MB or less).
- **Fail criteria:** No explicit size limit is configured anywhere for API routes (relying solely on implicit defaults), AND the application accepts large bodies or has upload endpoints without any guardrails.
- **Skip (N/A) when:** Skip when no POST, PUT, or PATCH routes that read the request body exist. Specifically, look for routes that call `.json()`, `.text()`, `.formData()`, or `.arrayBuffer()` on the request object. POST routes that never parse the request body (e.g., routes that use only session/cookie data or URL parameters) do not need body size limits and should be excluded from this check's evaluation.
- **Detail on fail:** Example: `No bodyParser size limit configured`. Note where the limit is missing (e.g., "No bodyParser size limit found in Next.js Pages Router API config; no platform-level limit in vercel.json"). Max 500 chars.
- **Remediation:** Set explicit body size limits in `app/api/` or `pages/api/` route handlers appropriate to your use case. For Next.js Pages Router, add to each route that needs a non-default limit: `export const config = { api: { bodyParser: { sizeLimit: '1mb' } } }`. For Next.js App Router, configure via middleware or handle via streaming. For Express: `app.use(express.json({ limit: '1mb' }))`. For Vercel, the default is 4.5MB per request — document this and add explicit in-code limits for sensitive endpoints. Do not accept unbounded request bodies on endpoints that don't need them; this leaves you open to memory exhaustion attacks.

#### Check: Bulk operations available where needed

- **ID:** `saas-api-design.request-response.bulk-operations`
- **Severity:** `low`
- **What to look for:** Enumerate all resource types in the codebase. Identify use cases where multiple records of the same type are likely to be created, updated, or deleted together — look at the app's domain (e.g., a todo app would need bulk complete, a CMS would need bulk publish, an e-commerce app would need bulk price updates). Check whether bulk operation endpoints exist for those use cases. Also check: if bulk ops exist, do they have appropriate limits on the number of records per request?
- **Pass criteria:** Either (a) at least 1 bulk operation endpoint exists for primary resource types where batch operations are meaningful, or (b) the application domain genuinely does not require batch operations (single-record operations cover all use cases).
- **Fail criteria:** Client code or UI patterns suggest bulk operations are needed (e.g., "select all and delete" UI exists) but the API requires N individual requests; or bulk operations exist but have no limit on batch size.
- **Skip (N/A) when:** The application clearly operates on single records by design (e.g., a single-user personal tool, a single-item workflow). Signal: no UI patterns or business logic suggesting multi-record batch operations.
- **Detail on fail:** Example: `UI supports bulk delete but API requires N individual requests`. Describe the gap (e.g., "UI supports bulk delete of messages but API only has DELETE /api/messages/:id, requiring N separate requests"). Max 500 chars.
- **Remediation:** Add bulk operation endpoints in `app/api/` for high-value use cases. A practical pattern is a batch endpoint that accepts an array of IDs and an operation: `POST /api/messages/bulk { action: "delete", ids: ["id1", "id2"] }`. Validate and enforce a maximum batch size (e.g., 100 records per request) to prevent abuse. Wrap bulk operations in a database transaction so they succeed or fail atomically — partial success states are a common source of data integrity issues.

---

### Category: API Security

**Slug:** `api-security`
**Weight in overall score:** 0.25

#### Check: Rate limiting implemented

- **ID:** `saas-api-design.api-security.rate-limiting`
- **Severity:** `critical`
- **What to look for:** Enumerate all API routes and check for rate limiting on each. Look for: rate limiting middleware (upstash/ratelimit, express-rate-limit, rate-limiter-flexible, slow-down); platform-level rate limiting config (Vercel Edge Middleware with rate limiting, Cloudflare rate limiting rules, API Gateway throttling); manual rate limiting implementation using Redis or a key-value store. Pay particular attention to high-risk endpoints: authentication (login, signup, password reset), payment operations, email-sending endpoints, and any endpoint that is expensive to compute or that exposes sensitive data. Implementation correctness matters: If rate limiting uses a database count query followed by a conditional insert (check-then-act pattern), flag this as a race condition vulnerability — concurrent requests can bypass the limit. Atomic operations are required for correctness: Redis INCR, PostgreSQL advisory locks, database upsert with conflict handling, or a dedicated rate limit library (e.g., @upstash/ratelimit, rate-limiter-flexible). A check-then-act implementation is a FAIL even if the intent is correct.
- **Pass criteria:** Rate limiting is implemented with no more than 100 requests per minute per IP on at least authentication endpoints, expensive operations, and any public-facing API endpoints. The implementation is tied to a persistent store (Redis, Upstash, etc.), not in-memory (which resets on cold start). Limits are reasonable (e.g., not 10,000 req/min per IP).
- **Fail criteria:** No rate limiting of any kind found on any API route. Do not pass when rate limiting exists only in-memory (no persistent store) — this is ineffective in serverless environments. Or authentication endpoints have no rate limiting.
- **Skip (N/A) when:** The project has no API routes accessible without prior authentication AND sits behind an API gateway or proxy that enforces rate limiting. Signal: all routes require auth AND vercel.json or other config shows edge-level rate limiting enforced upstream. (This is rare — default behavior is to fail if no evidence of rate limiting.)
- **Detail on fail:** Example: `No rate limiting on POST /api/auth/login`. Identify which high-risk endpoints lack rate limiting (e.g., "No rate limiting found on POST /api/auth/login, POST /api/auth/register, or POST /api/contact; no rate limit middleware in dependencies"). Max 500 chars.
- **Remediation:** Add rate limiting in `src/middleware.ts` or route handlers to your API immediately, starting with authentication endpoints. For Next.js on Vercel, the easiest approach is Upstash Rate Limit with their `@upstash/ratelimit` package and a Redis database: it works in Edge Middleware and Serverless Functions. Implement a sliding window or fixed window limit (e.g., 10 login attempts per IP per 15 minutes). For self-hosted Express/Fastify, use `express-rate-limit` with a Redis store. Apply rate limiting in middleware rather than per-route to avoid forgetting routes. Log rate limit hits so you can tune the limits.
- **Cross-reference:** For a deeper analysis of authentication security, the SaaS Auth & Sessions Audit covers session management and auth flow security in detail.

#### Check: Input validation on all endpoints

- **ID:** `saas-api-design.api-security.input-validation-all`
- **Severity:** `critical`
- **What to look for:** Enumerate all POST/PUT/PATCH route handlers. Count the ratio of validated routes to total. Check each for input validation before the data reaches business logic or database queries. Look for: Zod `parse()` or `safeParse()`, Yup `validate()`, Joi `validate()`, class-validator `validate()`, custom validation functions, or TypeScript type assertions used in place of runtime validation. Also check: are query parameters validated (not just body)? Are path parameters validated (e.g., is an ID checked to be a valid UUID before use)? Look specifically for handlers that use `req.body.fieldName` or `params.id` directly without any validation step.
- **Pass criteria:** At least 100% of routes that accept user input (request body, query params, path params) runs that input through a validation library or explicit validation logic before using it. Validation errors return 400 responses with clear error messages.
- **Fail criteria:** Any route handler that uses `req.body`, `req.query`, or `req.params` directly in database queries or business logic without validation. Even a single unvalidated endpoint constitutes a failure. Must not pass when validation exists on most routes but even 1 endpoint accepts raw input.
- **Skip (N/A) when:** The project has no routes that accept any user input (read-only GET endpoints only with no parameters). Signal: all routes are GET with no query parameters and no path parameters.
- **Detail on fail:** Name the specific unvalidated routes (e.g., "POST /api/users uses req.body.email directly in DB query without Zod or other validation; PATCH /api/posts/:id uses req.params.id without UUID validation"). Max 500 chars.
- **Remediation:** Add runtime validation in `app/api/` route files to every endpoint that accepts input. The recommended approach for TypeScript projects is Zod: define a schema for each request shape, then call `schema.safeParse(req.body)` and return a 400 if parsing fails. Keep schemas in a dedicated `lib/validations/` or `schemas/` directory and import them into route handlers. Also validate path parameters — check that IDs are valid UUIDs before querying the database. Input validation is your first defense against injection attacks, data corruption, and application errors from unexpected input.
- **Cross-reference:** For a deeper look at injection and injection-adjacent vulnerabilities, the SaaS Security Hardening Audit covers SQL injection, XSS, and command injection in detail.

#### Check: Authentication required on non-public endpoints

- **ID:** `saas-api-design.api-security.auth-required-non-public`
- **Severity:** `critical`
- **What to look for:** Enumerate all API route handlers. For each route, classify whether it should require authentication (routes that access user-specific data, mutate state, charge money, or expose private information). Then check whether authentication is actually enforced. Look for: session/token checks at the top of the handler, middleware that gates all routes (Next.js middleware matchers, Express middleware), auth library checks (e.g., `getServerSession()`, `auth()`, `verifyToken()`). Also look for: routes that check auth but only return different data rather than returning 401/403 — these are often a design mistake where auth is present but not enforced.
- **Pass criteria:** At least 100% of routes that handle private data or mutations check for a valid authentication token or session before proceeding. Unauthenticated requests receive 401. Unauthorized requests (authenticated but wrong role/ownership) receive 403. Public endpoints are explicitly designed as public.
- **Fail criteria:** Any route that accesses user-specific data or performs mutations without verifying authentication. Do not pass when auth is checked in the frontend but not enforced server-side. Routes that read a user ID from the request body instead of from the verified session token (this is a common AI-generated pattern that allows horizontal privilege escalation).
- **Skip (N/A) when:** The project has only fully public endpoints with no user-specific data (e.g., a public content API, a public pricing API). Signal: no auth library detected AND no user-specific data in any route response.
- **Detail on fail:** Example: `GET /api/user/profile accessible without auth`. Name the specific unprotected routes (e.g., "GET /api/user/profile and GET /api/billing/invoices accessible without authentication; /api/admin routes have no auth check"). Max 500 chars.
- **Remediation:** Apply authentication checks in `src/middleware.ts` to all non-public routes. The safest pattern is to use middleware that runs before any route handler — in Next.js, use `middleware.ts` with a route matcher that gates your `/api/` paths. Within handlers, always derive the user identity from the verified session/token (e.g., `const { userId } = await getServerSession()`) rather than trusting a user-supplied ID in the request body. If a handler receives a `userId` from the request body and uses it to look up data, replace that with the session-derived ID.
- **Cross-reference:** The SaaS Auth & Sessions Audit covers session management, token rotation, and privilege escalation patterns in detail.

#### Check: CORS properly configured

- **ID:** `saas-api-design.api-security.cors-configured`
- **Severity:** `high`
- **What to look for:** Enumerate all CORS configuration locations. Quote the actual `Access-Control-Allow-Origin` header value found. Check the CORS configuration for API routes. Look for: `Access-Control-Allow-Origin` header settings in framework config, middleware, or individual route handlers; use of `cors` npm package with an `origin` allowlist; Vercel/Netlify header config; wildcard `*` on routes that require authentication (this is a security issue — authenticated endpoints should never use `*`). Also check: `Access-Control-Allow-Credentials` — if this is `true`, `Access-Control-Allow-Origin` must not be `*`. Explicit signals for cross-origin consumers include: comments describing external callers or integrations in route handlers, CORS headers already set, `Access-Control-*` headers in middleware, a separate `/api/public/` or `/api/external/` route namespace, or documentation referencing third-party integrations calling your API.
- **Pass criteria:** CORS is explicitly configured with at least 1 specific domain in the allowlist. Authenticated routes use a specific domain allowlist (not `*`). Unauthenticated public API routes may use `*` if intentional. `Allow-Credentials: true` is never paired with `Allow-Origin: *`.
- **Fail criteria:** No CORS configuration (relying on browser defaults, which may fail for cross-origin clients); or wildcard `*` on authenticated routes; or `Allow-Credentials: true` paired with `Allow-Origin: *`.
- **Skip (N/A) when:** The API is only called from the same origin (no cross-origin clients, no mobile app, no third-party integrations). Signal: no CORS headers configured anywhere AND no evidence of cross-origin clients (all API calls are server-side or same-origin fetch).
- **Detail on fail:** Describe the CORS issue (e.g., "No CORS configuration found for /api/ routes; Access-Control-Allow-Origin: \* set on authenticated /api/user routes"). Max 500 chars.
- **Remediation:** Configure CORS explicitly in `next.config.ts` or `src/middleware.ts` rather than relying on defaults. For Next.js, add CORS headers in `next.config.ts` via the `headers()` function, or use a middleware wrapper. Specify the exact origin(s) that should be allowed: `Access-Control-Allow-Origin: https://yourapp.com`. If you have multiple environments (staging, production), use an environment variable for the origin. Never use wildcard `*` on routes that read or write authenticated user data. If you need to support credentials (cookies) cross-origin, use a specific origin allowlist.

#### Check: File upload endpoints have size and type restrictions

- **ID:** `saas-api-design.api-security.file-upload-restrictions`
- **Severity:** `high`
- **What to look for:** Enumerate all API routes that handle file uploads (look for `multipart/form-data` handling, `FormData`, `multer`, `formidable`, `busboy`, direct file buffer handling, or Next.js `formData()` calls). For each upload endpoint, check: (1) Is there a maximum file size limit enforced? (2) Is there a file type allowlist (MIME type check and/or file extension check)? (3) Is the MIME type validated from the actual file content, not just the filename or Content-Type header (which can be spoofed)?
- **Pass criteria:** At least 100% of file upload endpoints enforce: an explicit maximum file size of no more than 10MB, a file type allowlist based on MIME type inspection (not just extension or Content-Type header alone), and rejection of disallowed types with a clear error response.
- **Fail criteria:** Any upload endpoint without a size limit; or type validation based only on file extension or Content-Type header (easily spoofed); or no type validation at all.
- **Skip (N/A) when:** No file upload functionality exists in the project. Signal: no `multipart/form-data` handling, no `multer`/`formidable`/`busboy` dependencies, no `FormData` processing in any route handler.
- **Detail on fail:** Example: `POST /api/upload has no file size limit`. Identify which upload routes lack restrictions (e.g., "POST /api/upload has no file size limit; type is validated only by extension, not MIME content"). Max 500 chars.
- **Remediation:** Harden every file upload endpoint in `app/api/` with three controls. First, enforce a maximum file size at the parser level (e.g., `multer({ limits: { fileSize: 5 * 1024 * 1024 } })` for 5MB). Second, validate the MIME type from the actual file content — use the `file-type` npm package which reads the file's magic bytes rather than trusting the declared Content-Type. Third, maintain an explicit allowlist of permitted types (e.g., `['image/jpeg', 'image/png', 'image/webp', 'application/pdf']`) and reject anything not on it. Store uploaded files in cloud object storage (S3, Supabase Storage, Cloudflare R2) rather than the local filesystem, and give them random names (not user-supplied names) to prevent path traversal.

#### Check: Idempotency keys for payment and mutation endpoints

- **ID:** `saas-api-design.api-security.idempotency-keys`
- **Severity:** `high`
- **What to look for:** Enumerate all API routes that perform irreversible or expensive operations: payment processing, subscription management, sending emails, sending notifications, creating orders, or other mutations where duplicate execution would cause problems. Check whether these endpoints support or require an `Idempotency-Key` header (or equivalent). Also check: if using Stripe, are `idempotencyKey` options passed to Stripe API calls? Are idempotency keys stored and checked to prevent replay?
- **Pass criteria:** At least 100% of payment endpoints and critical mutation endpoints either (a) implement idempotency key checking with a persistent store to deduplicate duplicate requests, or (b) use a payment provider's built-in idempotency (e.g., Stripe's `idempotencyKey` parameter) consistently.
- **Fail criteria:** Payment endpoints or email-sending endpoints have no idempotency protection — a network retry or double-click could trigger duplicate charges, duplicate emails, or duplicate resource creation.
- **Skip (N/A) when:** No payment processing and no expensive/irreversible mutation endpoints exist. Signal: no Stripe, PayPal, or other payment library detected; no email-sending library detected; no endpoint logic that creates orders or triggers financial operations.
- **Detail on fail:** Example: `POST /api/billing/subscribe has no idempotency key`. Identify the unprotected endpoints (e.g., "POST /api/billing/subscribe has no idempotency key; Stripe createSubscription call lacks idempotencyKey parameter"). Max 500 chars.
- **Remediation:** Add idempotency protection in `app/api/` route handlers to payment and critical mutation endpoints. For Stripe API calls, always pass an `idempotencyKey`: `stripe.subscriptions.create(params, { idempotencyKey: clientSuppliedKey || crypto.randomUUID() })`. For your own endpoints, accept an `Idempotency-Key` header, store it in Redis or your database with the request result, and on duplicate requests return the cached response. The client should generate and store the key before making the request, and retry with the same key on network failures. Stripe's own documentation has a clear idempotency implementation guide.

#### Check: Webhook endpoints validate payloads

- **ID:** `saas-api-design.api-security.webhook-validates-payloads`
- **Severity:** `medium`
- **What to look for:** Enumerate all webhook receiver endpoints (routes that receive callbacks from Stripe, GitHub, Clerk, Twilio, SendGrid, or other external services). For each webhook endpoint, check: (1) Is the webhook signature verified before processing? (2) Is raw body available for signature verification (JSON parsing before signature check breaks it)? (3) Is the verification step the very first thing in the handler, before any business logic runs?
- **Pass criteria:** At least 100% of webhook endpoints verify the signature of incoming payloads using the service's SDK or documented verification method (e.g., `stripe.webhooks.constructEvent(rawBody, sig, secret)`, `svix.verify()`, etc.) before executing any business logic.
- **Fail criteria:** Any webhook endpoint that processes the payload before or without signature verification; or that verifies an already-parsed JSON body (which breaks HMAC verification since the raw bytes matter).
- **Skip (N/A) when:** No webhook receiver endpoints exist. Signal: no Stripe `webhooks` handling, no webhook route files, no references to webhook signature headers in any route handler.
- **Detail on fail:** Example: `POST /api/webhooks/stripe processes events without signature verification`. Name the unverified webhook endpoints (e.g., "POST /api/webhooks/stripe processes events without calling stripe.webhooks.constructEvent(); raw body not preserved"). Max 500 chars.
- **Remediation:** Always verify webhook signatures in `app/api/webhooks/` route handlers before trusting incoming payload data. For Stripe: disable Next.js body parsing for the webhook route (`export const config = { api: { bodyParser: false } }`), read the raw body, then call `stripe.webhooks.constructEvent(rawBody, request.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET)`. If this throws, return a 400 immediately without processing. For other services, use their official SDK verification methods. Never process a webhook payload based solely on the URL it arrived at — any attacker can POST to your webhook URL.

#### Check: GraphQL query depth and complexity limits

- **ID:** `saas-api-design.api-security.graphql-depth-limits`
- **Severity:** `high`
- **What to look for:** If GraphQL is detected, enumerate all GraphQL server configurations and check whether query depth limits and complexity limits are enforced. Look for: `graphql-depth-limit` package usage, `graphql-query-complexity` package, Apollo Server `validationRules` with depth/complexity plugins, Yoga/Pothos built-in complexity config, or manual depth checking. Without these limits, a malicious query can nest deeply enough to exhaust server resources.
- **Pass criteria:** At least one of: query depth limit (e.g., max depth of 5-10) OR query complexity limit is enforced at the GraphQL server layer before execution.
- **Fail criteria:** GraphQL server accepts arbitrarily deep or complex queries with no validation rules applied.
- **Skip (N/A) when:** GraphQL is not used in the project. Signal: no `graphql`, `@apollo/server`, `graphql-yoga`, `pothos-graphql`, `nexus`, or `type-graphql` in `package.json`; no `.graphql` schema files; no GraphQL endpoint in routes.
- **Detail on fail:** Example: `Apollo Server configured with no validation rules`. Note what's missing (e.g., "Apollo Server configured with no validation rules; graphql-depth-limit and graphql-query-complexity not in dependencies"). Max 500 chars.
- **Remediation:** Add query depth and complexity limits to your GraphQL server configuration in `src/` or `app/api/graphql/`. For Apollo Server, use the `graphql-depth-limit` package: `validationRules: [depthLimit(5)]`. For complexity limiting, use `graphql-query-complexity` with a max complexity threshold appropriate to your schema. For GraphQL Yoga, use the built-in `useDepthLimit()` and `useQueryComplexity()` plugins. A reasonable starting point is max depth of 5-7 and a complexity limit that allows your most complex legitimate query with 20-30% headroom. Also consider disabling introspection in production if your API is not public.

---

### Category: Documentation & DX

**Slug:** `api-docs`
**Weight in overall score:** 0.25

#### Check: Error responses include codes and messages

- **ID:** `saas-api-design.api-docs.error-responses-codes-messages`
- **Severity:** `high`
- **What to look for:** Enumerate all route handlers and for each classify the error response shape. Quote the actual error response structure found in representative routes. Check: (1) Do error responses include a machine-readable error code (not just an HTTP status code)? (2) Do they include a human-readable message? (3) Is the error response shape consistent (same structure for all errors)? (4) Do 4xx errors include enough detail for the API consumer to take corrective action, without leaking internal details? Look for patterns like returning just `{ message: "Internal Server Error" }` with no code, or bare HTTP status codes with no body.
- **Pass criteria:** At least 100% of error responses include: an HTTP status code appropriate to the error type (400 for validation, 401 for unauthenticated, 403 for unauthorized, 404 for not found, 429 for rate limited, 500 for server errors), a machine-readable error code string (e.g., `"VALIDATION_ERROR"`, `"NOT_FOUND"`, `"RATE_LIMITED"`), and a human-readable message. Shape is consistent across routes.
- **Fail criteria:** Error responses return only an HTTP status code with no body; or return only a string message with no error code; or leak internal implementation details (stack traces, SQL query fragments) in error messages; or use inconsistent shapes across routes.
- **Skip (N/A) when:** The project has no API routes. Signal: no route handlers detected.
- **Detail on fail:** Example: `POST /api/users returns 500 with no body`. Describe the error handling gaps (e.g., "POST /api/users returns 500 with no body on validation error; stack traces returned in production error responses; no machine-readable error codes in any route"). Max 500 chars.
- **Remediation:** Standardize your error responses in a helper at `src/lib/api-errors.ts`. Define a fixed error response shape: `{ error: { code: "ERROR_CODE", message: "Human-readable message", details: {} } }`. Create a centralized error handler or utility function that formats all errors into this shape. Use appropriate HTTP status codes — do not return 200 with `{ success: false }` in the body (this breaks HTTP semantics and client error handling). Never return stack traces or internal error details in production — log them server-side instead. Common codes to define: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`, `INTERNAL_ERROR`.

#### Check: API responses include appropriate cache headers

- **ID:** `saas-api-design.api-docs.api-cache-headers`
- **Severity:** `low`
- **What to look for:** Enumerate all API route handlers. For each, count whether cache-control headers are present. Look for: `Cache-Control` headers in route responses, Next.js `revalidate` config on API routes, platform-level caching config. Specifically check: (1) Do mutation endpoints (POST/PUT/PATCH/DELETE) include `Cache-Control: no-store` or equivalent to prevent caching? (2) Do cacheable GET endpoints (e.g., public config, static lists) include appropriate cache directives? (3) Do authenticated user-specific endpoints include `Cache-Control: private` or `no-store`?
- **Pass criteria:** At least 100% of mutation endpoints have explicit `no-store` or `no-cache` headers. Ideally, GET endpoints that return public static data use appropriate `max-age` or `stale-while-revalidate` headers.
- **Fail criteria:** Mutation endpoints have no cache headers and are accidentally cached by CDN or browser; or authenticated endpoints use `public` cache directives (exposing user data to shared caches).
- **Skip (N/A) when:** The project has no API routes, or the API is entirely behind an auth gateway that sets cache headers uniformly. Signal: all routes are authenticated and middleware sets `Cache-Control: no-store` on all `/api/` routes.
- **Detail on fail:** Note the cache header issues (e.g., "POST /api/user/update has no Cache-Control header; authenticated GET /api/dashboard/stats returns public cache directives"). Max 500 chars.
- **Remediation:** Add explicit cache headers in `app/api/` route responses based on their characteristics. For any route that mutates data: `Cache-Control: no-store`. For any route returning user-specific data: `Cache-Control: private, no-store`. For public GET endpoints with static or infrequently changing data: `Cache-Control: public, max-age=300, stale-while-revalidate=600`. In Next.js App Router, set these in the route handler response: `return new Response(JSON.stringify(data), { headers: { 'Cache-Control': 'no-store' } })`. Incorrect caching of authenticated endpoints can cause user data leakage through shared CDN caches.

#### Check: OpenAPI / Swagger documentation exists

- **ID:** `saas-api-design.api-docs.openapi-docs`
- **Severity:** `low`
- **What to look for:** Count all API routes. Check whether any OpenAPI or Swagger documentation exists. Look for: `openapi.yaml`, `openapi.json`, `swagger.yaml`, `swagger.json` files; packages like `swagger-ui-express`, `@fastify/swagger`, `swagger-jsdoc`, `next-swagger-doc`, `@anatine/zod-openapi`, `zod-to-openapi`, `ts-rest`; a `/api/docs` or `/api/swagger` endpoint; JSDoc `@swagger` annotations in route files.
- **Pass criteria:** At least 1 OpenAPI spec exists (generated or hand-authored) that covers the primary API endpoints. The spec is accessible (served at a URL or committed to the repository).
- **Fail criteria:** No OpenAPI/Swagger documentation of any kind exists.
- **Skip (N/A) when:** The API is entirely internal (only called by the same-repo frontend, no external consumers, no published API). Signal: no evidence of external API consumers, no third-party integrations calling the API, no published API documentation anywhere.
- **Detail on fail:** Example: `No openapi.yaml or swagger.json found`. Note what was found (e.g., "No openapi.yaml, swagger.json, or OpenAPI generation library detected; no /api/docs endpoint"). Max 500 chars.
- **Remediation:** Generate an OpenAPI spec at `src/openapi.yaml` or equivalent from your existing code rather than writing it by hand. If you are using Zod for validation (recommended), use `zod-to-openapi` or `@anatine/zod-openapi` to generate schemas from your existing Zod definitions. For Next.js, `next-swagger-doc` can generate a spec from JSDoc annotations. For `ts-rest`, the spec is generated automatically from your contract definitions. At minimum, commit an OpenAPI YAML file to the repo and serve it at `/api/docs` in development. Even an imperfect spec is better than none — it helps your future self and any collaborators understand what endpoints exist and what they expect.

#### Check: API timeout handling configured

- **ID:** `saas-api-design.api-docs.api-timeout-handling`
- **Severity:** `low`
- **What to look for:** Enumerate all API routes that call external services. Count those with and without timeout handling. Look for: Next.js `maxDuration` export in route handlers (`export const maxDuration = 30`), Vercel function timeout config in `vercel.json`, Express/Fastify server timeout settings, `AbortController` usage in fetch calls within handlers, explicit timeout wrappers around slow operations (database queries, external API calls). Also check: do handlers that call external services have per-call timeouts, or could a slow downstream service cause handlers to hang indefinitely?
- **Pass criteria:** At least 100% of API routes that may perform slow operations (database queries, external API calls, file processing) either declare an explicit timeout limit or use timeout-aware patterns (AbortController, per-call timeouts on external calls).
- **Fail criteria:** Handlers that call external services or run potentially slow operations have no timeout configuration and could hang indefinitely until the platform's default timeout (which may be 30+ seconds, creating a poor user experience and resource waste).
- **Skip (N/A) when:** All API routes are trivial (simple database reads with no external calls) and the platform enforces a short default timeout. Signal: no external API calls in route handlers and hosting platform imposes a hard timeout per the detected config.
- **Detail on fail:** Example: `POST /api/ai/generate has no timeout handling`. Note which handlers lack timeout handling (e.g., "POST /api/ai/generate calls external AI API with no AbortController timeout; no maxDuration export on any route handler"). Max 500 chars.
- **Remediation:** Add timeout handling in `app/api/` route files to routes that perform slow operations. In Next.js App Router, set `export const maxDuration = 30` (seconds) at the top of route files that need extended time, and use `export const runtime = 'nodejs'` for routes that need longer than 25 seconds on Vercel's hobby plan. For external API calls within handlers, wrap them with an AbortController timeout: `const controller = new AbortController(); setTimeout(() => controller.abort(), 5000); await fetch(url, { signal: controller.signal })`. For database queries, use query-level timeouts if your ORM supports them. Return a 504 status code when a timeout occurs rather than letting the connection hang.

#### Check: API deprecation strategy defined

- **ID:** `saas-api-design.api-docs.api-deprecation-strategy`
- **Severity:** `low`
- **What to look for:** Enumerate all API versions present. Check whether the project has any mechanism for communicating API deprecation to consumers. Look for: `Deprecation` response headers on older endpoints, `Sunset` headers with a date when the endpoint will be removed, deprecation notices in OpenAPI spec (`deprecated: true` on endpoints), changelog or migration guide documentation, middleware that logs or counts requests to deprecated endpoints.
- **Pass criteria:** At least one of: a documented deprecation policy (in README or API docs), `Deprecation` and `Sunset` headers on any endpoints flagged for removal, or OpenAPI `deprecated: true` markers used consistently.
- **Fail criteria:** No deprecation mechanism of any kind, and multiple API versions or superseded endpoints exist with no signaling to consumers.
- **Skip (N/A) when:** The API is in v1 with no deprecated endpoints and no versioning history. Signal: all routes are in v1, no parallel versions exist, no endpoints marked as old or superseded.
- **Detail on fail:** Example: `Old /api/v1/user exists alongside /api/v2/user with no Deprecation header`. Note the gap (e.g., "Old /api/v1/user endpoint exists alongside /api/v2/user with no Deprecation header; no sunset date communicated"). Max 500 chars.
- **Remediation:** Establish a lightweight deprecation signaling mechanism in `src/middleware.ts` or route handlers. The standard approach uses two HTTP response headers:

  ```ts
  // src/middleware.ts — add to deprecated routes
  response.headers.set("Deprecation", "true");
  response.headers.set("Sunset", "Sat, 01 Jan 2027 00:00:00 GMT");
  response.headers.set("Link", '</api/v2/users>; rel="successor-version"');
  ```

  Log requests to deprecated endpoints so you can see whether any clients are still using them before the sunset date. Document the deprecation in your changelog or API reference. This gives consumers time to migrate without surprises.

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

### This Audit's Weight Distribution (Reference)

With all 22 checks applicable:

- Critical checks: 3 × 10 = 30 pts (41.1% of 73 total)
- Warning checks (high + medium): 12 × 3 = 36 pts (49.3% of 73 total)
- Info checks (low): 7 × 1 = 7 pts (9.6% of 73 total)
- Total weight: 73

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
    "slug": "saas-api-design",
    "display_name": "API Design Audit",
    "version": "1.1.0",
    "prompt_hash": "sha256:92ed0ef8d59338611033ae92ba638878"
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
        "slug": "api-consistency",
        "display_name": "API Consistency",
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
        "slug": "request-response",
        "display_name": "Request/Response Design",
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
        "slug": "api-security",
        "display_name": "API Security",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.25,
        "checks_passed": "<integer>",
        "checks_failed": "<integer>",
        "checks_skipped": "<integer>",
        "checks_errored": "<integer>",
        "checks_total": 8
      },
      {
        "slug": "api-docs",
        "display_name": "Documentation & DX",
        "score": "<computed integer 0-100 or null>",
        "grade": "<A|B|C|D|F or null>",
        "weight": 0.25,
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
      "id": "saas-api-design.api-consistency.consistent-naming",
      "label": "API routes follow consistent naming convention",
      "category_slug": "api-consistency",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-consistency.http-methods-correct",
      "label": "HTTP methods used correctly",
      "category_slug": "api-consistency",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-consistency.consistent-response-format",
      "label": "Response format consistent across endpoints",
      "category_slug": "api-consistency",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-consistency.api-versioning-strategy",
      "label": "API versioning strategy defined",
      "category_slug": "api-consistency",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.request-response.pagination-list-endpoints",
      "label": "Pagination implemented on list endpoints",
      "category_slug": "request-response",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.request-response.filtering-sorting",
      "label": "Filtering and sorting supported on list endpoints",
      "category_slug": "request-response",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.request-response.no-over-fetching",
      "label": "Responses do not include unnecessary or sensitive data",
      "category_slug": "request-response",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.request-response.request-size-limits",
      "label": "Request body size limits configured",
      "category_slug": "request-response",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.request-response.bulk-operations",
      "label": "Bulk operations available where appropriate",
      "category_slug": "request-response",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-security.rate-limiting",
      "label": "Rate limiting implemented on API endpoints",
      "category_slug": "api-security",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-security.input-validation-all",
      "label": "Input validation on all endpoints accepting user input",
      "category_slug": "api-security",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-security.auth-required-non-public",
      "label": "Authentication enforced on all non-public endpoints",
      "category_slug": "api-security",
      "result": "<pass|fail|skip|error>",
      "severity": "critical",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-security.cors-configured",
      "label": "CORS properly configured",
      "category_slug": "api-security",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-security.file-upload-restrictions",
      "label": "File upload endpoints enforce size and type restrictions",
      "category_slug": "api-security",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-security.idempotency-keys",
      "label": "Idempotency keys used for payment and mutation endpoints",
      "category_slug": "api-security",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-security.webhook-validates-payloads",
      "label": "Webhook endpoints validate payload signatures",
      "category_slug": "api-security",
      "result": "<pass|fail|skip|error>",
      "severity": "medium",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-security.graphql-depth-limits",
      "label": "GraphQL query depth and complexity limits configured",
      "category_slug": "api-security",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-docs.error-responses-codes-messages",
      "label": "Error responses include machine-readable codes and messages",
      "category_slug": "api-docs",
      "result": "<pass|fail|skip|error>",
      "severity": "high",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-docs.api-cache-headers",
      "label": "API responses include appropriate cache headers",
      "category_slug": "api-docs",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-docs.openapi-docs",
      "label": "OpenAPI or Swagger documentation exists",
      "category_slug": "api-docs",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-docs.api-timeout-handling",
      "label": "Timeout handling configured for slow operations",
      "category_slug": "api-docs",
      "result": "<pass|fail|skip|error>",
      "severity": "low",
      "detail": "<string for fail/error, null for pass, optional for skip>"
    },
    {
      "id": "saas-api-design.api-docs.api-deprecation-strategy",
      "label": "API deprecation strategy defined",
      "category_slug": "api-docs",
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
3. The sum of all category `weight` values equals `1.0` (tolerance: ±0.001)
4. For each category: `checks_total == checks_passed + checks_failed + checks_skipped + checks_errored`
5. The sum of all category `checks_total` equals `scoring.total_checks`
6. Every `category_slug` in the `checks` array matches a `slug` in `scoring.categories`
7. `detail` is not null when `result` is `"fail"` or `"error"`
8. `detail` is 500 characters or fewer
9. All `id` values follow the format `{audit-slug}.{category-slug}.{check-slug}` with all-lowercase kebab-case segments
10. Scores are between 0-100 or null
11. Grades match the grade scale (A=90-100, B=75-89, C=60-74, D=40-59, F=0-39)
