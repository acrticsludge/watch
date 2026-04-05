import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { checkProjectLimit, TierLimitError } from "@/lib/tiers";
import { requireJsonBody, isAuthRateLimited } from "@/lib/api";

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(80).trim(),
  slug: z.string().regex(/^[a-z0-9-]{1,40}$/, "Slug must be 1-40 lowercase letters, numbers, or hyphens"),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify org ownership via RLS
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .eq("owner_id", user.id)
    .single();

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, slug, sort_order, created_at")
    .eq("org_id", orgId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[projects GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isAuthRateLimited(user.id))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // Verify org ownership
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .eq("owner_id", user.id)
    .single();

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bodyResult = await requireJsonBody(request);
  if (!bodyResult.ok) return bodyResult.error;

  const parsed = CreateProjectSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    await checkProjectLimit(supabase, user.id, orgId);
  } catch (err) {
    if (err instanceof TierLimitError) {
      return NextResponse.json(
        { error: err.message, upgradeUrl: err.upgradeUrl },
        { status: 403 },
      );
    }
    throw err;
  }

  // Assign sort_order = current count within this org (first project gets 0 = primary)
  const { count: projectCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("projects")
    .insert({ org_id: orgId, name: parsed.data.name, slug: parsed.data.slug, sort_order: projectCount ?? 0 })
    .select("id, name, slug, sort_order, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A project with that slug already exists in this organization" }, { status: 409 });
    }
    console.error("[projects POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
