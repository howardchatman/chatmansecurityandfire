import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string; teamId?: string };
  } catch {
    return null;
  }
}

// GET: Get notes for a job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    let query = supabase
      .from("job_notes")
      .select(`
        *,
        author:profiles(id, full_name, email)
      `)
      .eq("job_id", id)
      .order("created_at", { ascending: false });

    // Filter visibility based on role
    if (auth.role === "technician" || auth.role === "inspector") {
      query = query.in("visibility", ["tech", "customer"]);
    }

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
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { note, visibility = "internal" } = body;

    if (!note || !note.trim()) {
      return NextResponse.json(
        { success: false, error: "Note text is required" },
        { status: 400 }
      );
    }

    // Techs can only create tech-visible or customer-visible notes
    let finalVisibility = visibility;
    if (["technician", "inspector"].includes(auth.role)) {
      if (visibility === "internal") {
        finalVisibility = "tech";
      }
    }

    const { data, error } = await supabase
      .from("job_notes")
      .insert({
        job_id: id,
        note: note.trim(),
        visibility: finalVisibility,
        author_id: auth.userId,
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
    await supabase.from("job_events").insert({
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
