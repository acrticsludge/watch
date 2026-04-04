import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireJsonBody, isAuthRateLimited } from "@/lib/api";

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(80).trim().optional(),
  slug: z.string().regex(/^[a-z0-9-]{1,40}$/, "Slug must be 1-40 lowercase letters, numbers, or hyphens").optional(),
});

async function verifyProjectOwnership(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  orgId: string,
  projectId: string,
  userId: string,
) {
  // First verify org ownership
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .eq("owner_id", userId)
    .single();

  if (!org) return null;

  // Then verify project belongs to org
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("org_id", orgId)
    .single();

  return project;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string }> },
) {
  const { orgId, projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isAuthRateLimited(user.id))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const project = await verifyProjectOwnership(supabase, orgId, projectId, user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bodyResult = await requireJsonBody(request);
  if (!bodyResult.ok) return bodyResult.error;

  const parsed = UpdateProjectSchema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("projects")
    .update(parsed.data)
    .eq("id", projectId)
    .select("id, name, slug, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A project with that slug already exists in this organization" }, { status: 409 });
    }
    console.error("[projects PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string }> },
) {
  const { orgId, projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isAuthRateLimited(user.id))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const project = await verifyProjectOwnership(supabase, orgId, projectId, user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("[projects DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
