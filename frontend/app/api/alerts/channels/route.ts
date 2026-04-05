import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAlertChannelLimit, TierLimitError } from "@/lib/tiers";
import { requireJsonBody, isAuthRateLimited } from "@/lib/api";

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
  z.object({ type: z.literal("slack"),   config: httpsWebhookConfig,                                             enabled: z.boolean().default(true), project_id: z.string().uuid().optional() }),
  z.object({ type: z.literal("discord"), config: httpsWebhookConfig,                                             enabled: z.boolean().default(true), project_id: z.string().uuid().optional() }),
  z.object({ type: z.literal("email"),   config: z.object({ email: z.string().email().optional() }),             enabled: z.boolean().default(true), project_id: z.string().uuid().optional() }),
  z.object({ type: z.literal("push"),    config: z.record(z.string(), z.unknown()),                              enabled: z.boolean().default(true), project_id: z.string().uuid().optional() }),
]);

const UpdateSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");

  let query = supabase
    .from("alert_channels")
    .select("id, type, config, enabled, created_at")
    .eq("user_id", user.id)
    .limit(20);

  if (projectId) {
    query = query.eq("project_id", projectId);
  } else {
    query = query.is("project_id", null);
  }

  const { data, error } = await query;

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

  if (isAuthRateLimited(user.id))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const bodyResult = await requireJsonBody(request);
  if (!bodyResult.ok) return bodyResult.error;

  const parsed = CreateSchema.safeParse(bodyResult.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    await checkAlertChannelLimit(supabase, user.id, parsed.data.type, parsed.data.project_id);
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
      project_id: parsed.data.project_id ?? null,
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
  console.log(JSON.stringify({ audit: true, action: "channel.create", userId: user.id, channelId: data.id, type: data.type, ts: new Date().toISOString() }));
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const bodyResult = await requireJsonBody(request);
  if (!bodyResult.ok) return bodyResult.error;

  const parsed = UpdateSchema.safeParse(bodyResult.data);
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
  console.log(JSON.stringify({ audit: true, action: "channel.delete", userId: user.id, channelId: id, ts: new Date().toISOString() }));
  return new NextResponse(null, { status: 204 });
}
