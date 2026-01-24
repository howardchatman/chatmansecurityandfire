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

// GET: Get assignments for a job
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

    const { data, error } = await supabase
      .from("job_assignments")
      .select(`
        *,
        user:profiles(id, full_name, email, phone, role)
      `)
      .eq("job_id", id)
      .order("assigned_at", { ascending: true });

    if (error) {
      console.error("Error fetching assignments:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch assignments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST: Assign a user to a job
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

    // Only admin and manager can assign users
    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { user_id, role = "technician" } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from("job_assignments")
      .select("id")
      .eq("job_id", id)
      .eq("user_id", user_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "User is already assigned to this job" },
        { status: 400 }
      );
    }

    // Get user name for the event
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user_id)
      .single();

    const { data, error } = await supabase
      .from("job_assignments")
      .insert({
        job_id: id,
        user_id,
        role,
        assigned_by: auth.userId,
      })
      .select(`
        *,
        user:profiles(id, full_name, email, phone, role)
      `)
      .single();

    if (error) {
      console.error("Error creating assignment:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create assignment" },
        { status: 500 }
      );
    }

    // Create job event
    await supabase.from("job_events").insert({
      job_id: id,
      event_type: "assignment_added",
      payload: {
        user_id,
        user_name: userProfile?.full_name || "Unknown",
        role,
      },
      created_by: auth.userId,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
