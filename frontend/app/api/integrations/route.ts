import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { encrypt } from "@/lib/encryption";
import { checkIntegrationLimit, TierLimitError } from "@/lib/tiers";

const CreateSchema = z.object({
  service: z.enum(["github", "vercel", "supabase", "railway"]),
  account_label: z.string().min(1).max(80),
  api_key: z.string().min(1),
  "meta.project_ref": z.string().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("integrations")
    .select("id, service, account_label, status, created_at, last_synced_at")
    .neq("status", "disconnected")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { service, account_label, "meta.project_ref": projectRef } = parsed.data;
  const rawApiKey = parsed.data.api_key;

  try {
    await checkIntegrationLimit(supabase, user.id, service);
  } catch (err) {
    if (err instanceof TierLimitError) {
      return NextResponse.json(
        { error: err.message, upgradeUrl: err.upgradeUrl },
        { status: 403 }
      );
    }
    throw err;
  }

  const encryptedKey = encrypt(rawApiKey);
  // NEVER log rawApiKey

  const meta = projectRef ? { project_ref: projectRef } : null;

  // Set sort_order to the current count so new accounts go to the end
  const { count: existingCount } = await supabase
    .from("integrations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("service", service)
    .neq("status", "disconnected");

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("integrations")
    .insert({
      user_id: user.id,
      service,
      account_label,
      api_key: encryptedKey,
      status: "connected",
      meta,
      sort_order: existingCount ?? 0,
    })
    .select("id, service, account_label, status, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
