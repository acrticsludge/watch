import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { encrypt } from "@/lib/encryption";
import { requireJsonBody } from "@/lib/api";

const UpdateSchema = z.object({
  account_label: z.string().min(1).max(80).trim().optional(),
  api_key: z.string().min(1).trim().optional(),
  status: z.enum(["connected", "error", "disconnected"]).optional(),
  "meta.project_ref": z.string().min(1).optional(),
  "meta.public_key": z.string().min(1).optional(),
  "meta.project_id": z.string().min(1).regex(/^[a-f0-9]{24}$/i, "Project ID must be a 24-character hex string").optional(),
  "meta.connection_string": z.string().min(1).refine(
    (cs) => cs.startsWith("mongodb+srv://") || cs.startsWith("mongodb://"),
    "Connection string must start with mongodb+srv:// or mongodb://"
  ).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: existing } = await supabase
    .from("integrations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bodyResult = await requireJsonBody(request);
  if (!bodyResult.ok) return bodyResult.error;

  const parsed = UpdateSchema.safeParse(bodyResult.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (parsed.data.account_label) updates.account_label = parsed.data.account_label;
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.api_key) {
    updates.api_key = encrypt(parsed.data.api_key);
    // NEVER log the raw api_key
  }

  const serviceClient = createServiceClient();

  // Merge meta fields into existing meta to avoid wiping fields not sent in this request
  const hasMetaUpdate =
    parsed.data["meta.project_ref"] ||
    parsed.data["meta.public_key"] ||
    parsed.data["meta.project_id"] ||
    parsed.data["meta.connection_string"];

  if (hasMetaUpdate) {
    const { data: existingRow } = await serviceClient
      .from("integrations")
      .select("meta")
      .eq("id", id)
      .single();
    const existingMeta =
      existingRow?.meta && typeof existingRow.meta === "object" && !Array.isArray(existingRow.meta)
        ? (existingRow.meta as Record<string, unknown>)
        : {};

    if (parsed.data["meta.project_ref"])  existingMeta.project_ref = parsed.data["meta.project_ref"];
    if (parsed.data["meta.public_key"])   existingMeta.public_key  = parsed.data["meta.public_key"];
    if (parsed.data["meta.project_id"])   existingMeta.project_id  = parsed.data["meta.project_id"];
    if (parsed.data["meta.connection_string"]) {
      // Encrypt before storing — NEVER store plaintext connection string
      existingMeta.connection_string_enc = encrypt(parsed.data["meta.connection_string"]);
    }

    updates.meta = existingMeta;
  }
  const { data, error } = await serviceClient
    .from("integrations")
    .update(updates)
    .eq("id", id)
    .select("id, service, account_label, status")
    .single();

  if (error) {
    console.error("[integrations PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership before deleting
  const { data: existing } = await supabase
    .from("integrations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const serviceClient = createServiceClient();

  // Cascade deletes: alert_configs and usage_snapshots cascade via FK in schema
  const { error } = await serviceClient
    .from("integrations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[integrations DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  console.log(JSON.stringify({ audit: true, action: "integration.delete", userId: user.id, integrationId: id, ts: new Date().toISOString() }));
  return new NextResponse(null, { status: 204 });
}
