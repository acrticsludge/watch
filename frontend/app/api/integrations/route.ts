import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { encrypt } from "@/lib/encryption";
import { checkIntegrationLimit, TierLimitError } from "@/lib/tiers";
import { sendFirstIntegrationEmail } from "@/lib/onboarding/emails";
import { requireJsonBody, isAuthRateLimited } from "@/lib/api";

const CreateSchema = z.object({
  service: z.enum(["github", "vercel", "supabase", "railway", "mongodb"]),
  account_label: z.string().min(1).max(80).trim(),
  api_key: z.string().min(1).trim(),
  project_id: z.string().uuid().optional().nullable(),
  "meta.project_ref": z.string().optional(),
  "meta.public_key": z.string().optional(),
  "meta.project_id": z.string().optional(),
  "meta.connection_string": z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.service === "mongodb") {
    if (!data["meta.public_key"]) {
      ctx.addIssue({ code: "custom", message: "Atlas Public Key is required", path: ["meta.public_key"] });
    }
    if (!data["meta.project_id"]) {
      ctx.addIssue({ code: "custom", message: "Project ID is required", path: ["meta.project_id"] });
    }
    if (data["meta.project_id"] && !/^[a-f0-9]{24}$/i.test(data["meta.project_id"])) {
      ctx.addIssue({ code: "custom", message: "Project ID must be a 24-character hex string", path: ["meta.project_id"] });
    }
    if (data["meta.connection_string"]) {
      const cs = data["meta.connection_string"];
      if (!cs.startsWith("mongodb+srv://") && !cs.startsWith("mongodb://")) {
        ctx.addIssue({ code: "custom", message: "Connection string must start with mongodb+srv:// or mongodb://", path: ["meta.connection_string"] });
      }
    }
  }
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("integrations")
    .select("id, service, account_label, status, created_at, last_synced_at")
    .neq("status", "disconnected")
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[integrations GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isAuthRateLimited(user.id))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const bodyResult = await requireJsonBody(request);
  if (!bodyResult.ok) return bodyResult.error;

  const parsed = CreateSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const {
    service,
    account_label,
    project_id: integrationProjectId,
    "meta.project_ref": projectRef,
    "meta.public_key": publicKey,
    "meta.project_id": projectId,
    "meta.connection_string": rawConnStr,
  } = parsed.data;
  const rawApiKey = parsed.data.api_key;

  // If project_id provided, verify ownership before limit check
  if (integrationProjectId) {
    const { data: proj } = await supabase
      .from("projects")
      .select("id")
      .eq("id", integrationProjectId)
      .single();
    if (!proj) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }
  }

  try {
    await checkIntegrationLimit(supabase, user.id, service, integrationProjectId);
  } catch (err) {
    if (err instanceof TierLimitError) {
      return NextResponse.json(
        { error: err.message, upgradeUrl: err.upgradeUrl },
        { status: 403 },
      );
    }
    throw err;
  }

  const encryptedKey = encrypt(rawApiKey);
  // NEVER log rawApiKey

  // Encrypt connection string before storing — NEVER store plaintext
  const encryptedConnStr = rawConnStr ? encrypt(rawConnStr) : undefined;

  const meta =
    projectRef || publicKey || projectId || encryptedConnStr
      ? {
          ...(projectRef       ? { project_ref: projectRef } : {}),
          ...(publicKey        ? { public_key: publicKey } : {}),
          ...(projectId        ? { project_id: projectId } : {}),
          ...(encryptedConnStr ? { connection_string_enc: encryptedConnStr } : {}),
        }
      : null;

  // Set sort_order to the current count so new accounts go to the end
  // Scope sort_order by project if provided, otherwise by user
  let sortOrderQuery = supabase
    .from("integrations")
    .select("id", { count: "exact", head: true })
    .eq("service", service)
    .neq("status", "disconnected");
  if (integrationProjectId) {
    sortOrderQuery = sortOrderQuery.eq("project_id", integrationProjectId);
  } else {
    sortOrderQuery = sortOrderQuery.eq("user_id", user.id);
  }
  const { count: existingCount } = await sortOrderQuery;

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("integrations")
    .insert({
      user_id: user.id,
      project_id: integrationProjectId ?? null,
      service,
      account_label,
      api_key: encryptedKey,
      status: "connected",
      meta,
      sort_order: existingCount ?? 0,
    })
    .select("id, service, account_label, status, created_at")
    .single();

  if (error) {
    console.error("[integrations POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Fire first-integration onboarding email if this is the user's first ever integration.
  // Non-blocking: failure here must not affect the API response.
  if (user.email) {
    (async () => {
      try {
        const { error: insertError } = await serviceClient
          .from("onboarding_emails")
          .insert({ user_id: user.id, type: "first_integration" });
        // insert succeeds → first time ever; unique constraint violation (23505) → already sent
        if (!insertError) {
          await sendFirstIntegrationEmail(user.email!, service);
        }
      } catch (e) {
        console.error("[onboarding] First integration email failed:", e);
      }
    })();
  }

  console.log(JSON.stringify({ audit: true, action: "integration.create", userId: user.id, service, integrationId: data.id, ts: new Date().toISOString() }));
  return NextResponse.json(data, { status: 201 });
}
