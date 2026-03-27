import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { encrypt } from "@/lib/encryption";

const UpdateSchema = z.object({
  account_label: z.string().min(1).max(80).optional(),
  api_key: z.string().min(1).optional(),
  status: z.enum(["connected", "error", "disconnected"]).optional(),
  "meta.project_ref": z.string().min(1).optional(),
  "meta.public_key": z.string().min(1).optional(),
  "meta.project_id": z.string().min(1).optional(),
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

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (parsed.data.account_label) updates.account_label = parsed.data.account_label;
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.api_key) {
    updates.api_key = encrypt(parsed.data.api_key);
    // NEVER log the raw api_key
  }
  if (parsed.data["meta.project_ref"]) {
    updates.meta = { project_ref: parsed.data["meta.project_ref"] };
  }
  if (parsed.data["meta.public_key"] || parsed.data["meta.project_id"]) {
    updates.meta = {
      ...(typeof updates.meta === "object" && updates.meta !== null ? updates.meta : {}),
      ...(parsed.data["meta.public_key"] ? { public_key: parsed.data["meta.public_key"] } : {}),
      ...(parsed.data["meta.project_id"] ? { project_id: parsed.data["meta.project_id"] } : {}),
    };
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("integrations")
    .update(updates)
    .eq("id", id)
    .select("id, service, account_label, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
