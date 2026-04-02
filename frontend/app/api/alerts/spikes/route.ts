import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserTier } from "@/lib/tiers";

const UpsertSchema = z.object({
  integration_id: z.string().uuid(),
  metric_name: z.string().min(1).max(100),
  enabled: z.boolean().default(true),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("spike_configs")
      .select("integration_id, metric_name, enabled")
      .eq("user_id", user.id)
      .limit(500);

    if (error) {
      console.error("[GET /api/alerts/spikes]", error.message);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[GET /api/alerts/spikes] unexpected:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tier = await getUserTier(supabase, user.id);
    if (tier === "free") {
      return NextResponse.json({ error: "Pro feature" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = UpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { integration_id, metric_name, enabled } = parsed.data;

    // Verify integration belongs to this user
    const { data: integration } = await supabase
      .from("integrations")
      .select("id")
      .eq("id", integration_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const { error } = await supabase.from("spike_configs").upsert(
      {
        user_id: user.id,
        integration_id,
        metric_name,
        enabled,
      },
      { onConflict: "integration_id,metric_name" }
    );

    if (error) {
      console.error("[POST /api/alerts/spikes]", error.message);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/alerts/spikes] unexpected:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
