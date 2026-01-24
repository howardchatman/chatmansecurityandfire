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

// GET: Get checklists for a job
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
      .from("job_checklists")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching checklists:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch checklists" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching checklists:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch checklists" },
      { status: 500 }
    );
  }
}

// POST: Add a checklist to a job (from template or custom)
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
    const { template_id, name, checklist_type, items } = body;

    let checklistData;

    if (template_id) {
      // Create from template
      const { data: template, error: templateError } = await supabase
        .from("job_checklist_templates")
        .select("*")
        .eq("id", template_id)
        .single();

      if (templateError || !template) {
        return NextResponse.json(
          { success: false, error: "Template not found" },
          { status: 404 }
        );
      }

      // Transform template items to checklist items with status
      const checklistItems = template.items.map((item: { id: string; label: string; description?: string }) => ({
        id: item.id,
        label: item.label,
        description: item.description,
        status: "pending",
        note: "",
      }));

      checklistData = {
        job_id: id,
        checklist_type: template.checklist_type,
        name: template.name,
        items: checklistItems,
      };
    } else {
      // Create custom checklist
      if (!name || !checklist_type || !items) {
        return NextResponse.json(
          { success: false, error: "Name, checklist_type, and items are required" },
          { status: 400 }
        );
      }

      checklistData = {
        job_id: id,
        checklist_type,
        name,
        items: items.map((item: { id?: string; label: string }) => ({
          id: item.id || crypto.randomUUID(),
          label: item.label,
          status: "pending",
          note: "",
        })),
      };
    }

    const { data, error } = await supabase
      .from("job_checklists")
      .insert(checklistData)
      .select()
      .single();

    if (error) {
      console.error("Error creating checklist:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create checklist" },
        { status: 500 }
      );
    }

    // Create job event
    await supabase.from("job_events").insert({
      job_id: id,
      event_type: "checklist_updated",
      payload: { checklist_id: data.id, checklist_name: data.name, action: "created" },
      created_by: auth.userId,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checklist" },
      { status: 500 }
    );
  }
}

// PATCH: Update a checklist (items status/notes)
export async function PATCH(
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

    const { id: jobId } = await params;
    const body = await request.json();
    const { checklist_id, items } = body;

    if (!checklist_id || !items) {
      return NextResponse.json(
        { success: false, error: "Checklist ID and items are required" },
        { status: 400 }
      );
    }

    // Check if all items are completed (passed, failed, or na)
    const allCompleted = items.every(
      (item: { status: string }) => item.status !== "pending"
    );

    const updateData: {
      items: unknown[];
      completed_at?: string;
      completed_by?: string;
    } = { items };

    if (allCompleted) {
      updateData.completed_at = new Date().toISOString();
      updateData.completed_by = auth.userId;
    }

    const { data, error } = await supabase
      .from("job_checklists")
      .update(updateData)
      .eq("id", checklist_id)
      .eq("job_id", jobId)
      .select()
      .single();

    if (error) {
      console.error("Error updating checklist:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update checklist" },
        { status: 500 }
      );
    }

    // Create job event for completion
    if (allCompleted) {
      await supabase.from("job_events").insert({
        job_id: jobId,
        event_type: "checklist_completed",
        payload: { checklist_id, checklist_name: data.name },
        created_by: auth.userId,
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error updating checklist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update checklist" },
      { status: 500 }
    );
  }
}
