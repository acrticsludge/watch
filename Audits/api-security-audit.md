# AuditBuffet: API Security Audit

**Audit Slug:** `api-security`
**Version:** `1.0.3`
**Prompt Hash:** `sha256:b2acea997e813734f07b82d5239023ea`

> **This audit is configured for the project "Stackwatch".**
> If the codebase you are analyzing is not Stackwatch, STOP and tell the user
> they may have copied the prompt from the wrong project. Do not proceed
> until they confirm.

## What This Audit Does

This audit evaluates the security of your application's REST and GraphQL APIs, covering authentication, authorization, input validation, rate limiting, and protection against OWASP API Top 10 threats. For AI-built projects, APIs are often exposed with incomplete security controls, allowing attackers to access, modify, or exfiltrate user data through insecure endpoints.

This audit focuses on runtime security controls: verifying that authentication is enforced, authorization checks prevent unauthorized access, input is validated before processing, and abuse prevention measures are in place. It does not perform source code vulnerability scanning or network penetration testing — those require specialized tools and manual review.

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

**API-Specific Detection:**

- **API Types:** Examine codebase for REST endpoints (route handlers returning JSON), GraphQL resolvers (graphql-core, apollo-server, graphql-yoga dependencies), or both.
- **Auth Framework:** Check for JWT token handling (jsonwebtoken, jose dependencies), session-based auth (express-session, cookie-parser), OAuth middleware, or custom auth patterns.
- **Validation Libraries:** Look for Zod, Joi, yup, or runtime validation patterns in route handlers.

---

## How to Analyze

Examine the following in order:

1. `package.json` — API framework dependencies, auth libraries, validation libraries
2. Framework config files — middleware setup, error handling configuration
3. `tsconfig.json` — TypeScript configuration
4. API route files — Authentication checks, authorization logic, input validation
5. Middleware setup — CORS configuration, rate limiting middleware, request size limits
6. Database interaction files — Query patterns, parameterization, ORM usage
7. Environment configuration — TLS setup, token expiration settings
8. Error handling — Response formats, information leakage prevention
9. Third-party integrations — Webhook signature verification, external API calls

---

## Check Definitions

### Category: Authentication & Authorization

**Slug:** `auth`
**Weight in overall score:** 0.30

#### Check: All API endpoints require authentication

- **ID:** `api-security.auth.endpoints-authenticated`
- **Severity:** `critical`
- **What to look for:** Examine all API route handlers. Look for middleware or logic that checks for valid authentication credentials (JWT tokens, session cookies, API keys, OAuth tokens) before processing requests. Check if public endpoints are explicitly documented with comments or configuration.
- **Pass criteria:** Every API endpoint checks for valid authentication before executing business logic. Publicly accessible endpoints (if any) are explicitly marked as public and documented in code or API documentation.
- **Fail criteria:** Any API endpoint executes without checking for authentication, or unauthenticated requests receive 200 responses instead of 401 Unauthorized.
- **Skip (N/A) when:** The application has no API endpoints or does not expose any APIs to external consumers.
- **Detail on fail:** Name the unprotected endpoints. Example: `"GET /api/users, POST /api/posts accept requests without authentication tokens"` or `"No auth middleware on any API routes — all endpoints return data to unauthenticated requests"`
- **Remediation:** Implement authentication middleware that runs before route handlers. All endpoints should verify that a valid token or session exists and reject requests without one:

  ```ts
  // pages/api/users.ts (Next.js)
  import { authMiddleware } from "@/lib/auth";

  export default authMiddleware(async (req, res, user) => {
    // user is authenticated here; unauthenticated requests never reach this point
    const users = await db.user.findMany();
    res.json(users);
  });
  ```

  Or using a global middleware pattern in Express:

  ```ts
  app.use("/api", requireAuth);
  ```

  Document any intentionally public endpoints in your API schema or comments.

#### Check: Authorization enforces object-level access control

- **ID:** `api-security.auth.object-level-access-control`
- **Severity:** `critical`
- **What to look for:** Check whether API endpoints that return or modify user-specific data verify that the requesting user owns the resource. Look for patterns where a user ID is extracted from the URL or parameters, and then the endpoint checks that the authenticated user's ID matches before returning or updating data.
- **Pass criteria:** Endpoints returning user-specific data (e.g., `GET /api/users/{id}`, `PATCH /api/posts/{postId}`) verify that the authenticated user matches the resource owner before proceeding.
- **Fail criteria:** Endpoints accept any resource ID and return or modify data belonging to other users. For example, any authenticated user can call `GET /api/users/123` and receive data for user 123, even if the requesting user is user 456.
- **Skip (N/A) when:** The API only returns public data or data that all authenticated users are allowed to access (no user-specific resource isolation).
- **Detail on fail:** Describe the vulnerable endpoints. Example: `"GET /api/profile/{userId} returns user data for any user ID without verifying ownership — users can access other users' profiles"` or `"PATCH /api/orders/{orderId} allows any authenticated user to modify any order""`
- **Remediation:** Add an ownership check before returning or modifying user-specific resources:

  ```ts
  export default authMiddleware(async (req, res, user) => {
    const { id } = req.query;
    const post = await db.post.findUnique({ where: { id } });

    // Check ownership
    if (post.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(post);
  });
  ```

#### Check: Authentication tokens have a defined expiration time

- **ID:** `api-security.auth.token-expiration`
- **Severity:** `high`
- **What to look for:** Check how JWT tokens or session tokens are issued. Look for token generation code and verify that an expiration time (exp claim for JWT, maxAge for cookies) is set. Acceptable token lifetimes are typically 15 minutes to 1 hour for access tokens.
- **Pass criteria:** Tokens include an expiration time that is reasonable (not longer than 90 days). Expired tokens are rejected by the authentication middleware.
- **Fail criteria:** Tokens are issued without an expiration time, or the expiration is set to 90+ days or longer.
- **Skip (N/A) when:** The API uses session-based authentication with server-side session management and automatic session timeout, or uses API key authentication where keys are rotated via other mechanisms.
- **Detail on fail:** Specify the token lifetime. Example: `"JWT tokens are issued without an exp claim — tokens never expire"` or `"Access tokens have 180-day expiration — too long for security risk mitigation"`
- **Remediation:** Set a reasonable expiration time on tokens. For JWT, add the `exp` claim:

  ```ts
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }, // 1 hour expiration
  );
  ```

  For cookies, use maxAge:

  ```ts
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 3600000, // 1 hour in milliseconds
  });
  ```

#### Check: Refresh tokens are rotated on use

- **ID:** `api-security.auth.refresh-token-rotation`
- **Severity:** `high`
- **What to look for:** Look for refresh token handling logic. If your API issues access tokens and refresh tokens, check that when a refresh token is used to issue a new access token, the old refresh token is invalidated and a new one is issued.
- **Pass criteria:** Refresh token endpoint invalidates the old refresh token after issuing a new access token. Replayed refresh tokens are rejected.
- **Fail criteria:** The same refresh token can be used multiple times without invalidation, or no refresh token rotation is implemented.
- **Skip (N/A) when:** The API uses short-lived access tokens without refresh tokens, or relies on server-side session management with automatic timeout.
- **Detail on fail:** `"Refresh tokens are not rotated — the same refresh token can be used indefinitely to issue new access tokens"` or `"Refresh token endpoint does not invalidate old tokens after rotation"`
- **Remediation:** Implement refresh token rotation by invalidating the old token when a new one is issued:

  ```ts
  export default async (req, res) => {
    const { refreshToken } = req.body;
    const session = await db.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!session) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Delete old token
    await db.refreshToken.delete({ where: { id: session.id } });

    // Issue new tokens
    const newAccessToken = jwt.sign(
      { userId: session.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    const newRefreshToken = crypto.randomUUID();
    await db.refreshToken.create({
      data: { token: newRefreshToken, userId: session.userId },
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  };
  ```

#### Check: Role-based access control enforced

- **ID:** `api-security.auth.rbac-enforced`
- **Severity:** `high`
- **What to look for:** Check whether endpoints that should only be accessible to certain roles (admin, moderator, premium users) verify the user's role before granting access. Look for role checks in middleware or at the start of route handlers.
- **Pass criteria:** Admin-only endpoints check that the authenticated user has an admin role. Other role-restricted endpoints verify the user's role before proceeding. Role checks happen consistently across all restricted endpoints.
- **Fail criteria:** Admin-only endpoints do not check the user's role, or role checks are inconsistent (some endpoints check, others don't).
- **Skip (N/A) when:** The API does not have role-based endpoints or all authenticated users have equal access.
- **Detail on fail:** Name endpoints where role checks are missing. Example: `"DELETE /api/users endpoint does not verify admin role — any authenticated user can delete any user"` or `"PATCH /api/settings allows any authenticated user to modify system settings"`
- **Remediation:** Add role checks before executing admin logic:

  ```ts
  export default authMiddleware(async (req, res, user) => {
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Admin-only logic
    await db.user.deleteMany();
    res.json({ message: "All users deleted" });
  });
  ```

### Category: Input Validation & Injection Prevention

**Slug:** `input-validation`
**Weight in overall score:** 0.28

#### Check: Request bodies and query parameters validated against a schema

- **ID:** `api-security.input-validation.request-validation`
- **Severity:** `high`
- **What to look for:** Check whether API routes validate incoming request bodies and query parameters before using them. Look for schema validation using Zod, Joi, yup, or manual validation checks. Verify that invalid requests return 400 Bad Request.
- **Pass criteria:** All endpoints that accept user input validate the request body and query parameters against a defined schema. Invalid data is rejected with a 400 or 422 response.
- **Fail criteria:** Endpoints accept and process request data without validation, or validation is incomplete (e.g., only body is validated but not query parameters).
- **Skip (N/A) when:** The API only accepts GET requests with no user input.
- **Detail on fail:** Name endpoints without validation. Example: `"POST /api/users accepts arbitrary request bodies without schema validation"` or `"Query parameters validated but request body is not checked"`
- **Remediation:** Implement request validation using a schema library:

  ```ts
  import { z } from "zod";

  const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(0).max(150),
  });

  export default async (req, res) => {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }

    const user = result.data;
    // Process valid data
  };
  ```

#### Check: All database queries use parameterized queries or ORMs

- **ID:** `api-security.input-validation.parameterized-queries`
- **Severity:** `high`
- **What to look for:** Examine all database query code (SQL queries, NoSQL operations, ORM calls). Look for string concatenation with user input, template literals that embed variables, or direct object merging for NoSQL. Verify that parameterized queries or ORMs are used instead.
- **Pass criteria:** All database queries use parameterized placeholders or ORM methods. No user input is concatenated into query strings.
- **Fail criteria:** Any database query concatenates user input directly, such as `query('SELECT * FROM users WHERE id = ' + userId)` or NoSQL queries merge user input directly into query objects.
- **Skip (N/A) when:** The application does not use a database.
- **Detail on fail:** Show the vulnerable pattern. Example: `"SQL queries concatenate user ID directly: SELECT * FROM users WHERE id = ' + req.query.id"` or `"MongoDB queries merge user input directly: db.collection.findOne({ email: req.body.email })"`
- **Remediation:** Use parameterized queries or ORMs:

  ```ts
  // Good: Parameterized query
  const user = await db.query("SELECT * FROM users WHERE id = $1", [userId]);

  // Good: ORM
  const user = await db.user.findUnique({ where: { id: userId } });

  // Bad: String concatenation
  const user = await db.query("SELECT * FROM users WHERE id = " + userId);
  ```

#### Check: CORS headers configured with specific allowed origins

- **ID:** `api-security.input-validation.cors-configured`
- **Severity:** `medium`
- **What to look for:** Check the CORS middleware or headers configuration. Verify that `Access-Control-Allow-Origin` is set to specific, trusted domains rather than `*` (wildcard). If `Access-Control-Allow-Origin: *` is used with `Access-Control-Allow-Credentials: true`, it is insecure.
- **Pass criteria:** CORS headers specify allowed origins explicitly. If a wildcard is used, credentials are not allowed in requests. Alternatively, origins are dynamically validated against a whitelist.
- **Fail criteria:** `Access-Control-Allow-Origin: *` is combined with `Access-Control-Allow-Credentials: true`, or the allowed origin is the wildcard without credentials check.
- **Skip (N/A) when:** The API is not accessed from browsers (e.g., server-to-server API only).
- **Detail on fail:** `"CORS headers allow all origins with wildcard and credentials: Access-Control-Allow-Origin: * with Access-Control-Allow-Credentials: true"` or `"CORS not configured — requests from different origins will be blocked"`
- **Remediation:** Configure CORS to allow specific origins:

  ```ts
  import cors from "cors";

  app.use(
    cors({
      origin: ["https://example.com", "https://app.example.com"],
      credentials: true,
    }),
  );
  ```

  Or for dynamic origin validation:

  ```ts
  const allowedOrigins = ["https://example.com", "https://app.example.com"];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS not allowed"));
        }
      },
    }),
  );
  ```

#### Check: Content-Type header validated

- **ID:** `api-security.input-validation.content-type-validation`
- **Severity:** `medium`
- **What to look for:** Check middleware or route handlers for explicit Content-Type header validation. Verify that requests with unexpected content types are rejected or handled appropriately.
- **Pass criteria:** The API validates that incoming requests have the expected Content-Type header (e.g., application/json for JSON endpoints). Requests with incorrect Content-Type are rejected with a 415 Unsupported Media Type response.
- **Fail criteria:** The API does not check the Content-Type header, or invalid content types are accepted without validation.
- **Skip (N/A) when:** The API only handles GET requests or accepts all content types.
- **Detail on fail:** `"No Content-Type validation — requests with incorrect content types are accepted and processed"`
- **Remediation:** Add Content-Type validation middleware:

  ```ts
  const validateContentType = (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.includes("application/json")) {
        return res
          .status(415)
          .json({ error: "Content-Type must be application/json" });
      }
    }
    next();
  };

  app.use(validateContentType);
  ```

#### Check: Request body size limits enforced

- **ID:** `api-security.input-validation.body-size-limit`
- **Severity:** `medium`
- **What to look for:** Check JSON or body parser middleware configuration. Verify that a maximum request body size is enforced to prevent DoS attacks from oversized payloads.
- **Pass criteria:** A request body size limit is configured (typically 1-10 MB depending on API use case). Requests exceeding the limit are rejected with a 413 Payload Too Large response.
- **Fail criteria:** No body size limit is enforced, or the limit is unreasonably high (>100 MB).
- **Skip (N/A) when:** The API accepts file uploads and legitimate uploads frequently exceed typical limits.
- **Detail on fail:** `"No request body size limit configured — large payloads could cause DoS"`
- **Remediation:** Configure body size limits in middleware:

  ```ts
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb" }));

  // Next.js API routes
  export const config = {
    api: { bodyParser: { sizeLimit: "10mb" } },
  };
  ```

#### Check: Server-side request forgery prevented

- **ID:** `api-security.input-validation.ssrf-prevention`
- **Severity:** `medium`
- **What to look for:** Check for outbound HTTP requests made from the API (fetch, axios, http.request calls). If the API makes requests to URLs provided by users, verify that private IP addresses and internal hosts are blocked.
- **Pass criteria:** Outbound HTTP requests to user-provided URLs are validated to prevent requests to private IP ranges (127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) or internal hostnames. External URLs are allowlisted when possible.
- **Fail criteria:** The API makes requests to user-provided URLs without validating the target, allowing attacks on internal services.
- **Skip (N/A) when:** The API does not make outbound HTTP requests based on user input.
- **Detail on fail:** `"API accepts URLs and makes fetch requests without validating target — SSRF attacks possible"` or `"Webhook URLs or redirect URLs not validated against private IP ranges"`
- **Remediation:** Validate target URLs before making requests:

  ```ts
  import { isPrivateIp } from "is-private-ip";
  import { URL } from "url";

  const fetchUrl = async (userUrl) => {
    try {
      const url = new URL(userUrl);
      const ip = await dns.promises.resolve4(url.hostname);

      if (isPrivateIp(ip[0])) {
        throw new Error("Cannot access private IP addresses");
      }

      const response = await fetch(userUrl);
      return response;
    } catch (error) {
      throw new Error("Invalid or blocked URL");
    }
  };
  ```

### Category: Rate Limiting & Abuse Prevention

**Slug:** `abuse-prevention`
**Weight in overall score:** 0.22

#### Check: Rate limiting enforced per authenticated user

- **ID:** `api-security.abuse-prevention.rate-limiting-auth`
- **Severity:** `medium`
- **What to look for:** Check middleware or route handlers for rate limiting logic. Verify that authenticated requests are rate-limited per user (e.g., 100 requests per minute per user ID). Check that requests over the limit return 429 Too Many Requests with a Retry-After header.
- **Pass criteria:** Rate limiting is enforced on API endpoints, tracking usage per authenticated user. Exceeded requests return 429 with Retry-After header. Limits are reasonable for the API's intended use case.
- **Fail criteria:** No rate limiting is implemented on API endpoints, or rate limits are not enforced consistently.
- **Skip (N/A) when:** The API is internal-only or explicitly designed to have no rate limits.
- **Detail on fail:** `"No rate limiting on endpoints — users can make unlimited requests"` or `"Rate limiting not tracked per user — rate limit is global for all users"`
- **Remediation:** Implement per-user rate limiting using a library like express-rate-limit:

  ```ts
  import rateLimit from "express-rate-limit";

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    keyGenerator: (req) => req.user.id, // Rate limit per user
    handler: (req, res) => {
      res.status(429).json({ error: "Too many requests" });
    },
  });

  app.use("/api", limiter);
  ```

#### Check: IP-based rate limiting on unauthenticated endpoints

- **ID:** `api-security.abuse-prevention.rate-limiting-ip`
- **Severity:** `low`
- **What to look for:** Check if unauthenticated endpoints (especially login, password reset, password endpoints) have rate limiting based on IP address to prevent brute force attacks.
- **Pass criteria:** Unauthenticated endpoints like login and password reset are rate-limited by IP address. Brute force attacks are mitigated by returning 429 after repeated failed attempts.
- **Fail criteria:** Unauthenticated endpoints have no rate limiting, allowing rapid-fire login attempts or password reset spam.
- **Skip (N/A) when:** The API has no unauthenticated endpoints or uses alternative auth mechanisms like TOTP that are resistant to brute force.
- **Detail on fail:** `"Login endpoint has no rate limiting — attackers can brute force credentials"` or `"Password reset endpoint accepts unlimited requests from same IP"`
- **Remediation:** Add IP-based rate limiting to sensitive unauthenticated endpoints:

  ```ts
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    keyGenerator: (req) => req.ip, // Rate limit per IP
    message: "Too many login attempts, please try again later",
  });

  app.post("/api/login", loginLimiter, async (req, res) => {
    // Login logic
  });
  ```

#### Check: NoSQL queries use safe type-safe constructors

- **ID:** `api-security.abuse-prevention.nosql-safety`
- **Severity:** `low`
- **What to look for:** If the application uses NoSQL databases (MongoDB, DynamoDB, Firebase), check whether user input is safely merged into query objects or used with type-safe constructors. Unsafe patterns include directly merging user objects into query filters.
- **Pass criteria:** NoSQL queries use type-safe methods or construct queries safely. User input is not directly merged into query objects.
- **Fail criteria:** User input is directly merged into NoSQL query objects, allowing query injection attacks. Example: `db.find({ ...userInput })` where userInput could contain `{ $where: ... }`.
- **Skip (N/A) when:** The application does not use NoSQL databases.
- **Detail on fail:** `"MongoDB queries merge user input directly into filter objects — NoSQL injection possible"` or `"Firebase queries use unsanitized user data in filter construction"`
- **Remediation:** Construct NoSQL queries safely:

  ```ts
  // Bad: Direct merge
  const user = await db.collection("users").findOne({ ...userInput });

  // Good: Explicit field mapping
  const user = await db.collection("users").findOne({
    email: userInput.email,
    name: userInput.name,
  });

  // Good: ORM with validation
  const user = await User.findOne({
    email: userInput.email,
  });
  ```

#### Check: GraphQL introspection disabled in production

- **ID:** `api-security.abuse-prevention.graphql-introspection`
- **Severity:** `low`
- **What to look for:** If the application uses GraphQL, check whether introspection queries are allowed. Introspection exposes the entire API schema, which can aid attackers in finding vulnerabilities.
- **Pass criteria:** GraphQL introspection is disabled in production or restricted to authenticated admin users. Introspection queries return an error in production.
- **Fail criteria:** GraphQL introspection is enabled in production, allowing anyone to query the full schema.
- **Skip (N/A) when:** The application does not use GraphQL.
- **Detail on fail:** `"GraphQL introspection enabled in production — schema is fully exposed to attackers"`
- **Remediation:** Disable introspection in production:

  ```ts
  import { graphqlHTTP } from "express-graphql";

  app.use(
    "/graphql",
    graphqlHTTP({
      schema,
      graphiql: process.env.NODE_ENV === "development",
      customFormatErrorFn: (error) => {
        // Hide internal errors in production
        if (process.env.NODE_ENV === "production") {
          return { message: "Internal server error" };
        }
        return error;
      },
    }),
  );

  // Or using Apollo Server
  const server = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV === "development",
    debug: process.env.NODE_ENV === "development",
  });
  ```

#### Check: Pagination limits enforced

- **ID:** `api-security.abuse-prevention.pagination-limits`
- **Severity:** `low`
- **What to look for:** Check endpoints that return lists of data (users, posts, comments). Verify that pagination is enforced with a maximum limit, preventing requests for unlimited results.
- **Pass criteria:** List endpoints accept limit and offset/cursor parameters but cap the maximum limit (e.g., max 100 items per page). Requests for more than the max are capped or return a 400 error.
- **Fail criteria:** Endpoints allow requests for unlimited results, or the limit parameter is not enforced.
- **Skip (N/A) when:** The API does not return list data.
- **Detail on fail:** `"GET /api/posts accepts unlimited limit parameter — requests can retrieve all posts at once"` or `"No pagination implemented on list endpoints"`
- **Remediation:** Enforce pagination limits:

  ```ts
  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 20;

  export default async (req, res) => {
    let limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = parseInt(req.query.offset) || 0;

    // Cap the limit
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (limit < 1) limit = 1;

    const posts = await db.post.findMany({
      take: limit,
      skip: offset,
    });

    res.json(posts);
  };
  ```

#### Check: Batch endpoint item limits enforced

- **ID:** `api-security.abuse-prevention.batch-limits`
- **Severity:** `low`
- **What to look for:** Check if the API has batch endpoints that accept multiple items in a single request (e.g., bulk create, bulk update). Verify that a maximum batch size is enforced.
- **Pass criteria:** Batch endpoints have a maximum item count per request (e.g., max 100 items per batch). Requests exceeding the limit are rejected or truncated.
- **Fail criteria:** Batch endpoints accept unlimited items per request, allowing resource exhaustion.
- **Skip (N/A) when:** The API does not have batch endpoints.
- **Detail on fail:** `"POST /api/batch-create accepts arrays of unlimited length — can be used for resource exhaustion"`
- **Remediation:** Enforce batch size limits:

  ```ts
  const MAX_BATCH_SIZE = 100;

  export default async (req, res) => {
    const items = req.body.items;

    if (!Array.isArray(items) || items.length > MAX_BATCH_SIZE) {
      return res.status(400).json({
        error: `Batch size must be between 1 and ${MAX_BATCH_SIZE}`,
      });
    }

    const results = await Promise.all(items.map((item) => db.create(item)));

    res.json(results);
  };
  ```

#### Check: GraphQL query depth limited

- **ID:** `api-security.abuse-prevention.graphql-depth-limit`
- **Severity:** `low`
- **What to look for:** For GraphQL APIs, check whether query depth limiting is implemented. This prevents deeply nested queries that could cause denial of service or expensive database operations.
- **Pass criteria:** A query depth limit is enforced (typically 5-10 levels). Queries exceeding the depth limit are rejected.
- **Fail criteria:** No query depth limit is implemented, allowing deeply nested queries.
- **Skip (N/A) when:** The application does not use GraphQL.
- **Detail on fail:** `"GraphQL has no query depth limit — attackers can craft deeply nested queries for DoS"`
- **Remediation:** Implement depth limiting using graphql-depth-limit or equivalent:

  ```ts
  import depthLimit from "graphql-depth-limit";

  const server = new ApolloServer({
    schema,
    plugins: {
      didResolveOperation: (ctx) => {
        const {
          request: { query },
        } = ctx;
        const depth = getQueryDepth(query);
        if (depth > 10) {
          throw new Error("Query depth exceeds limit");
        }
      },
    },
  });
  ```

### Category: API Design & Documentation Security

**Slug:** `design-security`
**Weight in overall score:** 0.20

#### Check: All API traffic served over HTTPS/TLS

- **ID:** `api-security.design-security.https-enforced`
- **Severity:** `low`
- **What to look for:** Check whether the API is configured to only accept HTTPS requests. Look for server configuration, middleware that redirects HTTP to HTTPS, or HSTS (HTTP Strict-Transport-Security) headers.
- **Pass criteria:** The API only accepts HTTPS requests. HTTP requests are either rejected or redirected to HTTPS. The HSTS header is set with a reasonable max-age (at least 31536000 seconds / 1 year).
- **Fail criteria:** The API accepts HTTP requests without redirecting to HTTPS, or HSTS is not configured.
- **Skip (N/A) when:** The API is internal-only and not exposed over the network.
- **Detail on fail:** `"API accepts unencrypted HTTP requests — traffic is not protected"` or `"HSTS header not set — browsers may accept HTTP fallback"`
- **Remediation:** Enforce HTTPS and set HSTS:

  ```ts
  // Express middleware to redirect HTTP to HTTPS
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });

  // Set HSTS header
  app.use((req, res, next) => {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
    next();
  });
  ```

#### Check: Error responses do not leak stack traces or internal details

- **ID:** `api-security.design-security.error-handling`
- **Severity:** `low`
- **What to look for:** Check error handling in API routes. Look at what information is returned in error responses. Verify that stack traces, internal file paths, database query details, and system information are not exposed in responses.
- **Pass criteria:** Error responses include a user-friendly message but no technical details. Stack traces and internal information are logged server-side only.
- **Fail criteria:** Error responses include stack traces, SQL queries, internal file paths, or other sensitive system information.
- **Skip (N/A) when:** Never — error handling applies to all APIs.
- **Detail on fail:** `"Error responses include full stack traces"` or `"Failed database queries leak SQL syntax and table names"` or `"File path errors expose internal directory structure"`
- **Remediation:** Implement error handling that hides internal details:

  ```ts
  // Bad: Exposes internal details
  app.get("/api/users/:id", (req, res) => {
    try {
      const user = await db.query(
        `SELECT * FROM users WHERE id = ${req.params.id}`,
      );
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  });

  // Good: Hides internal details
  app.get("/api/users/:id", (req, res) => {
    try {
      const user = await db.query("SELECT * FROM users WHERE id = $1", [
        req.params.id,
      ]);
      res.json(user);
    } catch (error) {
      console.error(error); // Log internally
      res.status(500).json({ error: "Internal server error" });
    }
  });
  ```

#### Check: Webhook signatures verified

- **ID:** `api-security.design-security.webhook-signatures`
- **Severity:** `info`
- **What to look for:** If the API sends webhooks or receives webhooks from external services, check whether webhook payloads are signed and verified. Look for HMAC-SHA256 signature generation and verification logic.
- **Pass criteria:** All webhooks are signed using HMAC-SHA256 or equivalent. The receiving endpoint verifies the signature before processing the payload.
- **Fail criteria:** Webhooks are sent or received without signature verification.
- **Skip (N/A) when:** The API does not send or receive webhooks.
- **Detail on fail:** `"Webhooks sent without signature — recipients cannot verify payload authenticity"` or `"Webhook endpoint does not verify HMAC signature before processing payload"`
- **Remediation:** Implement webhook signing and verification:

  ```ts
  import crypto from "crypto";

  // Sending webhooks
  const sendWebhook = async (payload, webhookUrl, secret) => {
    const signature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "X-Signature": signature,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  // Receiving webhooks
  app.post("/api/webhooks/external", (req, res) => {
    const signature = req.headers["x-signature"];
    const computed = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== computed) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Process webhook
    res.json({ success: true });
  });
  ```

#### Check: API access audit-logged

- **ID:** `api-security.design-security.audit-logging`
- **Severity:** `info`
- **What to look for:** Check whether API requests are being logged with user ID, endpoint, timestamp, and response code. Verify that sensitive data (passwords, tokens, PII) are redacted from logs.
- **Pass criteria:** API requests are logged with user, endpoint, timestamp, and response code. Sensitive data is redacted. Logs are persistent and can be queried for security audits.
- **Fail criteria:** No logging of API requests, or logs include sensitive information like passwords or full request/response bodies.
- **Skip (N/A) when:** The API is internal-only and audit logging is not required.
- **Detail on fail:** `"No API request logging configured"` or `"Request logs include full request bodies with sensitive data"` or `"Logs stored in memory and cleared on restart — not persistent"`
- **Remediation:** Implement structured audit logging:

  ```ts
  const auditLog = (req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId: req.user?.id || "anonymous",
        method: req.method,
        endpoint: req.path,
        statusCode: res.statusCode,
        duration,
      };

      console.log(JSON.stringify(logEntry));
      // Store in persistent logging service (e.g., CloudWatch, ELK Stack)
    });

    next();
  };

  app.use(auditLog);
  ```

#### Check: API documentation accessible only to authorized users

- **ID:** `api-security.design-security.documentation-security`
- **Severity:** `info`
- **What to look for:** Check whether API documentation (Swagger/OpenAPI, GraphQL schema playground) is publicly accessible or restricted to authenticated users. In production, API documentation should not expose internal endpoints or schema details to unauthenticated users.
- **Pass criteria:** API documentation is either private (requires authentication), uses a whitelist of trusted IPs, or does not expose sensitive internal endpoints.
- **Fail criteria:** Full API documentation is publicly accessible, exposing all endpoints and schema details to potential attackers.
- **Skip (N/A) when:** The API is public-facing and documentation is intentionally public.
- **Detail on fail:** `"Swagger UI accessible at /api/docs with no authentication — full API schema exposed"` or `"GraphQL playground available in production — schema introspection enabled"`
- **Remediation:** Restrict documentation access:

  ```ts
  // Protect Swagger UI
  const swaggerUi = require("swagger-ui-express");

  app.use("/api/docs", authMiddleware, swaggerUi.serve);
  app.get("/api/docs", authMiddleware, swaggerUi.setup(spec));

  // Or use IP allowlist for internal networks
  const allowedIps = ["10.0.0.0/8", "172.16.0.0/12"];

  const ipWhitelist = (req, res, next) => {
    if (!isIpInRange(req.ip, allowedIps)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };

  app.use("/api/docs", ipWhitelist, swaggerUi.serve);
  ```

#### Check: TLS certificates validated for outbound connections

- **ID:** `api-security.design-security.tls-validation`
- **Severity:** `info`
- **What to look for:** Check how the application makes outbound HTTPS requests (to payment processors, external APIs, webhooks). Verify that TLS certificate validation is enabled (not disabled with rejectUnauthorized: false).
- **Pass criteria:** All outbound HTTPS requests validate TLS certificates. Certificate validation is not disabled. Critical integrations use certificate pinning.
- **Fail criteria:** Outbound HTTPS requests disable certificate validation (rejectUnauthorized: false in Node.js), or do not validate certificates.
- **Skip (N/A) when:** The application makes no outbound HTTPS requests.
- **Detail on fail:** `"Outbound HTTPS requests have certificate validation disabled (rejectUnauthorized: false)"` or `"Stripe integration disables TLS validation — vulnerable to MITM attacks"`
- **Remediation:** Enable TLS validation:

  ```ts
  // Bad: Disabled validation
  https.request(url, { rejectUnauthorized: false }, callback);

  // Good: Default (validates by default)
  https.request(url, callback);

  // Good: Explicit validation
  https.request(url, { rejectUnauthorized: true }, callback);

  // For critical integrations, use certificate pinning
  const https = require("https");
  const fs = require("fs");

  const agent = new https.Agent({
    ca: fs.readFileSync("ca-cert.pem"),
    cert: fs.readFileSync("client-cert.pem"),
    key: fs.readFileSync("client-key.pem"),
  });

  https.request(url, { agent }, callback);
  ```

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
    "slug": "api-security",
    "display_name": "API Security Audit",
    "version": "1.0.3",
    "prompt_hash": "sha256:dd741c19e26ed6ee4cad1578c1714ed6"
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
    "total_checks": 24,
    "passed": 14,
    "failed": 6,
    "skipped": 3,
    "errored": 1,
    "categories": [
      {
        "slug": "auth",
        "display_name": "Authentication & Authorization",
        "score": 72,
        "grade": "C",
        "weight": 0.3,
        "checks_passed": 3,
        "checks_failed": 2,
        "checks_skipped": 0,
        "checks_errored": 0,
        "checks_total": 5
      },
      {
        "slug": "input-validation",
        "display_name": "Input Validation & Injection Prevention",
        "score": 85,
        "grade": "B",
        "weight": 0.28,
        "checks_passed": 4,
        "checks_failed": 1,
        "checks_skipped": 1,
        "checks_errored": 0,
        "checks_total": 6
      },
      {
        "slug": "abuse-prevention",
        "display_name": "Rate Limiting & Abuse Prevention",
        "score": 82,
        "grade": "B",
        "weight": 0.22,
        "checks_passed": 5,
        "checks_failed": 1,
        "checks_skipped": 1,
        "checks_errored": 0,
        "checks_total": 7
      },
      {
        "slug": "design-security",
        "display_name": "API Design & Documentation Security",
        "score": 40,
        "grade": "D",
        "weight": 0.2,
        "checks_passed": 2,
        "checks_failed": 2,
        "checks_skipped": 1,
        "checks_errored": 1,
        "checks_total": 6
      }
    ]
  },

  "checks": [
    {
      "id": "api-security.auth.endpoints-authenticated",
      "label": "All API endpoints require authentication",
      "category_slug": "auth",
      "result": "pass",
      "severity": "critical",
      "detail": null
    },
    {
      "id": "api-security.auth.object-level-access-control",
      "label": "Authorization enforces object-level access control",
      "category_slug": "auth",
      "result": "fail",
      "severity": "critical",
      "detail": "GET /api/users/{id} returns user data without verifying ownership — any user can access any profile"
    },
    {
      "id": "api-security.auth.token-expiration",
      "label": "Authentication tokens have a defined expiration time",
      "category_slug": "auth",
      "result": "pass",
      "severity": "high",
      "detail": null
    },
    {
      "id": "api-security.auth.refresh-token-rotation",
      "label": "Refresh tokens are rotated on use",
      "category_slug": "auth",
      "result": "fail",
      "severity": "high",
      "detail": "Refresh tokens not invalidated after use — same token can be reused indefinitely"
    },
    {
      "id": "api-security.auth.rbac-enforced",
      "label": "Role-based access control enforced",
      "category_slug": "auth",
      "result": "pass",
      "severity": "high",
      "detail": null
    },
    {
      "id": "api-security.input-validation.request-validation",
      "label": "Request bodies and query parameters validated against a schema",
      "category_slug": "input-validation",
      "result": "pass",
      "severity": "high",
      "detail": null
    },
    {
      "id": "api-security.input-validation.parameterized-queries",
      "label": "All database queries use parameterized queries or ORMs",
      "category_slug": "input-validation",
      "result": "fail",
      "severity": "high",
      "detail": "Some routes concatenate user input into SQL queries instead of using parameterized queries"
    },
    {
      "id": "api-security.input-validation.cors-configured",
      "label": "CORS headers configured with specific allowed origins",
      "category_slug": "input-validation",
      "result": "pass",
      "severity": "medium",
      "detail": null
    },
    {
      "id": "api-security.input-validation.content-type-validation",
      "label": "Content-Type header validated",
      "category_slug": "input-validation",
      "result": "pass",
      "severity": "medium",
      "detail": null
    },
    {
      "id": "api-security.input-validation.body-size-limit",
      "label": "Request body size limits enforced",
      "category_slug": "input-validation",
      "result": "skip",
      "severity": "medium",
      "detail": "No request body size limits configured, but API handles file uploads so check skipped for review"
    },
    {
      "id": "api-security.input-validation.ssrf-prevention",
      "label": "Server-side request forgery prevented",
      "category_slug": "input-validation",
      "result": "pass",
      "severity": "medium",
      "detail": null
    },
    {
      "id": "api-security.abuse-prevention.rate-limiting-auth",
      "label": "Rate limiting enforced per authenticated user",
      "category_slug": "abuse-prevention",
      "result": "pass",
      "severity": "medium",
      "detail": null
    },
    {
      "id": "api-security.abuse-prevention.rate-limiting-ip",
      "label": "IP-based rate limiting on unauthenticated endpoints",
      "category_slug": "abuse-prevention",
      "result": "fail",
      "severity": "low",
      "detail": "Login endpoint has no rate limiting — no protection against credential brute force"
    },
    {
      "id": "api-security.abuse-prevention.nosql-safety",
      "label": "NoSQL queries use safe type-safe constructors",
      "category_slug": "abuse-prevention",
      "result": "skip",
      "severity": "low",
      "detail": "Application uses Postgres only, not NoSQL"
    },
    {
      "id": "api-security.abuse-prevention.graphql-introspection",
      "label": "GraphQL introspection disabled in production",
      "category_slug": "abuse-prevention",
      "result": "skip",
      "severity": "low",
      "detail": "No GraphQL API detected — REST-only architecture"
    },
    {
      "id": "api-security.abuse-prevention.pagination-limits",
      "label": "Pagination limits enforced",
      "category_slug": "abuse-prevention",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "api-security.abuse-prevention.batch-limits",
      "label": "Batch endpoint item limits enforced",
      "category_slug": "abuse-prevention",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "api-security.abuse-prevention.graphql-depth-limit",
      "label": "GraphQL query depth limited",
      "category_slug": "abuse-prevention",
      "result": "skip",
      "severity": "low",
      "detail": "No GraphQL API detected"
    },
    {
      "id": "api-security.design-security.https-enforced",
      "label": "All API traffic served over HTTPS/TLS",
      "category_slug": "design-security",
      "result": "pass",
      "severity": "low",
      "detail": null
    },
    {
      "id": "api-security.design-security.error-handling",
      "label": "Error responses do not leak stack traces or internal details",
      "category_slug": "design-security",
      "result": "fail",
      "severity": "low",
      "detail": "Error responses include full stack traces and database query details"
    },
    {
      "id": "api-security.design-security.webhook-signatures",
      "label": "Webhook signatures verified",
      "category_slug": "design-security",
      "result": "error",
      "severity": "info",
      "detail": "Could not determine if webhooks are sent — webhook configuration not found in codebase"
    },
    {
      "id": "api-security.design-security.audit-logging",
      "label": "API access audit-logged",
      "category_slug": "design-security",
      "result": "pass",
      "severity": "info",
      "detail": null
    },
    {
      "id": "api-security.design-security.documentation-security",
      "label": "API documentation accessible only to authorized users",
      "category_slug": "design-security",
      "result": "fail",
      "severity": "info",
      "detail": "Swagger UI exposed at /api/docs without authentication — full API schema visible to public"
    },
    {
      "id": "api-security.design-security.tls-validation",
      "label": "TLS certificates validated for outbound connections",
      "category_slug": "design-security",
      "result": "pass",
      "severity": "info",
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
