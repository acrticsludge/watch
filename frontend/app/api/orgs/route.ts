import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { checkOrgLimit, TierLimitError } from "@/lib/tiers";
import { requireJsonBody, isAuthRateLimited } from "@/lib/api";

const CreateOrgSchema = z.object({
  name: z.string().min(1).max(80).trim(),
  slug: z.string().regex(/^[a-z0-9-]{1,40}$/, "Slug must be 1-40 lowercase letters, numbers, or hyphens"),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[orgs GET]", error);
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

  const parsed = CreateOrgSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    await checkOrgLimit(supabase, user.id);
  } catch (err) {
    if (err instanceof TierLimitError) {
      return NextResponse.json(
        { error: err.message, upgradeUrl: err.upgradeUrl },
        { status: 403 },
      );
    }
    throw err;
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("organizations")
    .insert({ owner_id: user.id, name: parsed.data.name, slug: parsed.data.slug })
    .select("id, name, slug, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "An organization with that slug already exists" }, { status: 409 });
    }
    console.error("[orgs POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
