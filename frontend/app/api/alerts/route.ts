import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireJsonBody, isAuthRateLimited } from "@/lib/api";

const UpsertSchema = z.object({
  integration_id: z.string().uuid(),
  metric_name: z.string().min(1),
  threshold_percent: z.number().min(1).max(100).default(80),
  enabled: z.boolean().default(true),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("alert_configs")
    .select("*")
    .eq("user_id", user.id)
    .limit(500);

  if (error) {
    console.error("[alerts GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isAuthRateLimited(user.id))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const bodyResult = await requireJsonBody(request);
  if (!bodyResult.ok) return bodyResult.error;

  const parsed = UpsertSchema.safeParse(bodyResult.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Verify integration belongs to user
  const { data: intg } = await supabase
    .from("integrations")
    .select("id")
    .eq("id", parsed.data.integration_id)
    .eq("user_id", user.id)
    .single();

  if (!intg) return NextResponse.json({ error: "Integration not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("alert_configs")
    .upsert(
      {
        user_id: user.id,
        integration_id: parsed.data.integration_id,
        metric_name: parsed.data.metric_name,
        threshold_percent: parsed.data.threshold_percent,
        enabled: parsed.data.enabled,
      },
      { onConflict: "integration_id,metric_name" }
    )
    .select()
    .single();

  if (error) {
    console.error("[alerts POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
