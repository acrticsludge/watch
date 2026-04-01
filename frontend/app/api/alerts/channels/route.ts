import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAlertChannelLimit, TierLimitError } from "@/lib/tiers";

// Block private/internal IP ranges to prevent SSRF from the alert worker
const PRIVATE_IP_RE =
  /^https?:\/\/(localhost|127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|169\.254\.|0\.0\.0\.0)/i;

const httpsWebhookConfig = z.object({
  webhook_url: z
    .string()
    .url()
    .refine((u) => u.startsWith("https://"), {
      message: "Webhook URL must use HTTPS",
    })
    .refine((u) => !PRIVATE_IP_RE.test(u), {
      message: "Webhook URL cannot target private or internal addresses",
    }),
});

const CreateSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("slack"),   config: httpsWebhookConfig,                                             enabled: z.boolean().default(true) }),
  z.object({ type: z.literal("discord"), config: httpsWebhookConfig,                                             enabled: z.boolean().default(true) }),
  z.object({ type: z.literal("email"),   config: z.object({ email: z.string().email().optional() }),             enabled: z.boolean().default(true) }),
  z.object({ type: z.literal("push"),    config: z.record(z.string(), z.unknown()),                              enabled: z.boolean().default(true) }),
]);

const UpdateSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("alert_channels")
    .select("id, type, config, enabled, created_at")
    .eq("user_id", user.id);

  if (error) {
    console.error("[channels GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

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

  if (error) {
    console.error("[channels POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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

  if (error) {
    console.error("[channels PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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

  if (error) {
    console.error("[channels DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
