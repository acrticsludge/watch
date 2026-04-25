import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWelcomeEmail } from "@/lib/onboarding/emails";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";
import { NextResponse } from "next/server";

const GitHubUserSchema = z.object({ login: z.string(), id: z.number() });
type GitHubOAuthError = "missing_token" | "github_api_failed" | "db_insert_failed";

function githubOAuthErrorRedirect(origin: string, code: GitHubOAuthError) {
  return NextResponse.redirect(`${origin}/integrations?github_oauth_error=${code}`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const intent = searchParams.get("intent");
  const rawRedirect = searchParams.get("redirectTo") ?? "/dashboard";
  // Only allow relative paths; reject protocol-relative URLs like //evil.com
  const redirectTo = /^\/(?!\/)/.test(rawRedirect) ? rawRedirect : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Connect-GitHub intent: capture provider_token and create integration
      if (intent === "connect-github") {
        const { data: sessionData } = await supabase.auth.getSession();
        const providerToken = sessionData.session?.provider_token;
        if (!providerToken) {
          return githubOAuthErrorRedirect(origin, "missing_token");
        }

        let githubLogin: string;
        try {
          const ghRes = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${providerToken}`,
              "X-GitHub-Api-Version": "2022-11-28",
            },
          });
          if (!ghRes.ok) throw new Error(`GitHub API responded with ${ghRes.status}`);
          const parsed = GitHubUserSchema.safeParse(await ghRes.json());
          if (!parsed.success) throw new Error("Unexpected GitHub user response shape");
          githubLogin = parsed.data.login;
        } catch (err) {
          console.error("[auth/callback] GitHub user fetch failed:", err);
          return githubOAuthErrorRedirect(origin, "github_api_failed");
        }

        const encryptedKey = encrypt(providerToken);
        const serviceClient = createServiceClient();
        try {
          const { data: existing } = await serviceClient
            .from("integrations")
            .select("id")
            .eq("user_id", data.user.id)
            .eq("service", "github")
            .eq("account_label", githubLogin)
            .maybeSingle();

          if (existing) {
            await serviceClient
              .from("integrations")
              .update({ api_key: encryptedKey, status: "connected", meta: { auth_type: "oauth" } })
              .eq("id", existing.id);
          } else {
            const { count: existingCount } = await serviceClient
              .from("integrations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", data.user.id)
              .eq("service", "github")
              .neq("status", "disconnected");

            await serviceClient.from("integrations").insert({
              user_id: data.user.id,
              project_id: null,
              service: "github",
              account_label: githubLogin,
              api_key: encryptedKey,
              status: "connected",
              meta: { auth_type: "oauth" },
              sort_order: existingCount ?? 0,
            });
          }
        } catch (err) {
          console.error("[auth/callback] GitHub integration DB error:", err);
          return githubOAuthErrorRedirect(origin, "db_insert_failed");
        }

        return NextResponse.redirect(
          `${origin}/integrations?github_oauth_connected=${encodeURIComponent(githubLogin)}`
        );
      }

      // Standard login / signup flow — auto-provision email alert channel for new users
      const userId = data.user.id;
      const { data: existing } = await supabase
        .from("alert_channels")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "email")
        .maybeSingle();

      if (!existing) {
        const serviceClient = createServiceClient();
        await Promise.all([
          // Provision email alert channel
          supabase.from("alert_channels").insert({
            user_id: userId,
            type: "email",
            config: { email: data.user.email },
            enabled: true,
          }),
          // Send welcome email and record it (unique constraint prevents duplicates)
          serviceClient
            .from("onboarding_emails")
            .insert({ user_id: userId, type: "welcome" })
            .then(({ error }) => {
              if (!error || error.code === "23505") {
                // Only send if this is truly the first time
                if (!error) {
                  sendWelcomeEmail(data.user.email!).catch((e) =>
                    console.error("[onboarding] Welcome email failed:", e)
                  );
                }
              }
            }),
        ]);
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
