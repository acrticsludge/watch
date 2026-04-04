import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch the target integration
  const { data: target } = await supabase
    .from("integrations")
    .select("id, service, sort_order, project_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!target)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.sort_order === 0)
    return NextResponse.json({ message: "Already primary" });

  // Find the current primary for the same service scoped by project (or user)
  let primaryQuery = supabase
    .from("integrations")
    .select("id, sort_order")
    .eq("service", target.service)
    .eq("sort_order", 0);

  if (target.project_id) {
    primaryQuery = primaryQuery.eq("project_id", target.project_id);
  } else {
    primaryQuery = primaryQuery.eq("user_id", user.id);
  }

  const { data: currentPrimary } = await primaryQuery.single();

  const serviceClient = createServiceClient();

  // Swap: current primary gets target's old sort_order, target gets 0
  if (currentPrimary) {
    const { error: swapErr } = await serviceClient
      .from("integrations")
      .update({ sort_order: target.sort_order })
      .eq("id", currentPrimary.id);
    if (swapErr) {
      console.error("[promote swap]", swapErr);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  const { error: promoteErr } = await serviceClient
    .from("integrations")
    .update({ sort_order: 0 })
    .eq("id", id);
  if (promoteErr) {
    console.error("[promote update]", promoteErr);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
