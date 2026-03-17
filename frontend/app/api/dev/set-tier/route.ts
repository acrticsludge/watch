import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// DEV-ONLY endpoint to set your own subscription tier for testing.
// Remove or gate behind env check before going to production.
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tier } = await request.json() as { tier: string };
  if (!["free", "pro", "team"].includes(tier)) {
    return NextResponse.json({ error: "tier must be free | pro | team" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("subscriptions")
    .upsert({ user_id: user.id, tier, status: "active" }, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, tier });
}
