import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWelcomeEmail } from "@/lib/onboarding/emails";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawRedirect = searchParams.get("redirectTo") ?? "/dashboard";
  // Only allow relative paths; reject protocol-relative URLs like //evil.com
  const redirectTo = /^\/(?!\/)/.test(rawRedirect) ? rawRedirect : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Auto-provision an enabled email alert channel for new users
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
