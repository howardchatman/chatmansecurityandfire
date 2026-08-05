import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { getCustomerIdForUser } from "@/lib/customer";
import { CUSTOMER_STAGES, stageForStatus } from "@/lib/job-stages";

// A customer's view of the work we're doing for them.
//
// Only what they should see: the stage, the schedule, and updates the crew
// explicitly marked customer-visible. Internal notes, cost, margin, who is
// assigned and every raw job_event stay out of this response entirely — the
// filtering is done in the query, not in the UI, so it can't be undone by a
// front-end change.

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "customer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerIdForUser(auth);
    if (!customerId) return NextResponse.json({ success: true, data: [], stages: CUSTOMER_STAGES });

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("email")
      .eq("id", customerId)
      .maybeSingle();

    const email = customer?.email || auth.email;

    const { data: jobs, error } = await supabaseAdmin
      .from("jobs")
      .select(
        "id, job_number, job_type, status, description, scope_summary, site_address, site_city, scheduled_date, actual_start_time, completed_at, created_at"
      )
      .eq("customer_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading customer projects:", error);
      return NextResponse.json({ success: false, error: "Failed to load your projects" }, { status: 500 });
    }

    const jobIds = (jobs || []).map((j) => j.id);
    let notesByJob: Record<string, { id: string; note: string; created_at: string }[]> = {};

    if (jobIds.length) {
      const { data: notes } = await supabaseAdmin
        .from("job_notes")
        .select("id, job_id, note, created_at")
        .in("job_id", jobIds)
        .eq("is_customer_visible", true)
        .order("created_at", { ascending: false });

      notesByJob = (notes || []).reduce((acc, n) => {
        (acc[n.job_id] ||= []).push({ id: n.id, note: n.note, created_at: n.created_at });
        return acc;
      }, {} as Record<string, { id: string; note: string; created_at: string }[]>);
    }

    const data = (jobs || []).map((jb) => {
      const stage = stageForStatus(jb.status);
      return {
        id: jb.id,
        job_number: jb.job_number,
        job_type: jb.job_type,
        title: jb.description || jb.job_type || "Service work",
        scope: jb.scope_summary,
        site: [jb.site_address, jb.site_city].filter(Boolean).join(", "),
        scheduled_date: jb.scheduled_date,
        started_at: jb.actual_start_time,
        completed_at: jb.completed_at,
        created_at: jb.created_at,
        stage: stage.key,
        stage_label: stage.label,
        stage_index: stage.index,
        progress: stage.progress,
        is_complete: stage.isComplete,
        is_on_hold: stage.isOnHold,
        updates: notesByJob[jb.id] || [],
      };
    });

    return NextResponse.json({ success: true, data, stages: CUSTOMER_STAGES });
  } catch (error) {
    console.error("Error loading customer projects:", error);
    return NextResponse.json({ success: false, error: "Failed to load your projects" }, { status: 500 });
  }
}
