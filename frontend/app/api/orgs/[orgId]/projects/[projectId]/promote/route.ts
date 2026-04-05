import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orgId: string; projectId: string }> },
) {
  const { orgId, projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify org ownership
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .eq("owner_id", user.id)
    .single();

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch target project (must belong to this org)
  const { data: target } = await supabase
    .from("projects")
    .select("id, sort_order")
    .eq("id", projectId)
    .eq("org_id", orgId)
    .single();

  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.sort_order === 0) return NextResponse.json({ message: "Already primary" });

  // Find current primary project within this org
  const { data: currentPrimary } = await supabase
    .from("projects")
    .select("id, sort_order")
    .eq("org_id", orgId)
    .eq("sort_order", 0)
    .single();

  const serviceClient = createServiceClient();

  // Swap: current primary gets target's old sort_order, target gets 0
  if (currentPrimary) {
    const { error: swapErr } = await serviceClient
      .from("projects")
      .update({ sort_order: target.sort_order })
      .eq("id", currentPrimary.id);
    if (swapErr) {
      console.error("[project promote swap]", swapErr);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  const { error: promoteErr } = await serviceClient
    .from("projects")
    .update({ sort_order: 0 })
    .eq("id", projectId);
  if (promoteErr) {
    console.error("[project promote update]", promoteErr);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
