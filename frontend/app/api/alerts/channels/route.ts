import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAlertChannelLimit, TierLimitError } from "@/lib/tiers";

const CreateSchema = z.object({
  type: z.enum(["email", "slack", "discord", "push"]),
  config: z.record(z.unknown()),
  enabled: z.boolean().default(true),
});

const UpdateSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("alert_channels")
    .select("id, type, config, enabled, created_at")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mask webhook URLs — only show last 8 chars
  const masked = (data ?? []).map((ch) => {
    const cfg = ch.config as Record<string, unknown>;
    if (cfg.webhook_url && typeof cfg.webhook_url === "string") {
      return {
        ...ch,
        config: { ...cfg, webhook_url: `***${cfg.webhook_url.slice(-8)}` },
      };
    }
    return ch;
  });

  return NextResponse.json(masked);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    await checkAlertChannelLimit(supabase, user.id, parsed.data.type);
  } catch (err) {
    if (err instanceof TierLimitError) {
      return NextResponse.json({ error: err.message, upgradeUrl: err.upgradeUrl }, { status: 403 });
    }
    throw err;
  }

  const { data, error } = await supabase
    .from("alert_channels")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      config: parsed.data.config as import("@/lib/database.types").Json,
      enabled: parsed.data.enabled,
    })
    .select("id, type, enabled")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updatePayload: {
    enabled?: boolean;
    config?: import("@/lib/database.types").Json;
  } = {};
  if (parsed.data.enabled !== undefined) updatePayload.enabled = parsed.data.enabled;
  if (parsed.data.config !== undefined) updatePayload.config = parsed.data.config as import("@/lib/database.types").Json;

  const { data, error } = await supabase
    .from("alert_channels")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, type, enabled")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("alert_channels")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
