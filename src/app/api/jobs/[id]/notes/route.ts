import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";


// GET: Get notes for a job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    let query = supabaseAdmin
      .from("job_notes")
      .select(`
        *,
        author:profiles(id, full_name, email)
      `)
      .eq("job_id", id)
      .order("created_at", { ascending: false });

    // job_notes has no "visibility" column — it has a boolean
    // is_customer_visible. Querying the old name errored out, which made this
    // endpoint fail for everyone. Techs and inspectors see all notes on a job
    // they are assigned to; the customer-visible flag governs the portal, not
    // internal staff.

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notes:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch notes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST: Add a note to a job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { note, is_customer_visible = false, note_type = "general" } = body;

    if (!note || !note.trim()) {
      return NextResponse.json(
        { success: false, error: "Note text is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("job_notes")
      .insert({
        job_id: id,
        note: note.trim(),
        note_type,
        is_customer_visible: Boolean(is_customer_visible),
        user_id: auth.id,
      })
      .select(`
        *,
        author:profiles(id, full_name, email)
      `)
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create note" },
        { status: 500 }
      );
    }

    // Also create a job event
    await supabaseAdmin.from("job_events").insert({
      job_id: id,
      event_type: "note_added",
      payload: { note_id: data.id, preview: note.substring(0, 100) },
      created_by: auth.userId,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}
