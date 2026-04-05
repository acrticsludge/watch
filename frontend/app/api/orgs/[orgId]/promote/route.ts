import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch target org (RLS + explicit ownership check)
  const { data: target } = await supabase
    .from("organizations")
    .select("id, sort_order")
    .eq("id", orgId)
    .eq("owner_id", user.id)
    .single();

  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.sort_order === 0) return NextResponse.json({ message: "Already primary" });

  // Find current primary org for this user
  const { data: currentPrimary } = await supabase
    .from("organizations")
    .select("id, sort_order")
    .eq("owner_id", user.id)
    .eq("sort_order", 0)
    .single();

  const serviceClient = createServiceClient();

  // Swap: current primary gets target's old sort_order, target gets 0
  if (currentPrimary) {
    const { error: swapErr } = await serviceClient
      .from("organizations")
      .update({ sort_order: target.sort_order })
      .eq("id", currentPrimary.id);
    if (swapErr) {
      console.error("[org promote swap]", swapErr);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  const { error: promoteErr } = await serviceClient
    .from("organizations")
    .update({ sort_order: 0 })
    .eq("id", orgId);
  if (promoteErr) {
    console.error("[org promote update]", promoteErr);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
