import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { houstonToday, runsOn } from "@/lib/job-dates";
import { loadProject, buildOwnerUpdate, sendOwnerUpdate, ProjectTrackingNotInstalled } from "@/lib/project-tracking";

// Weekday-evening owner updates (vercel.json cron). For every job with
// "email the owner daily" on and running today: if the crew logged something
// today and no update has gone out today, send one. Nothing logged means no
// email; an empty "nothing happened" update every day is noise.

export const maxDuration = 300;

const CLOSED = ["completed", "invoiced", "paid", "closed", "cancelled"];

async function authorized(request: NextRequest): Promise<boolean> {
  // Vercel cron sends Authorization: Bearer CRON_SECRET. A signed-in admin can
  // also run it by hand.
  const header = request.headers.get("authorization");
  if (process.env.CRON_SECRET && header === `Bearer ${process.env.CRON_SECRET}`) return true;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return !!payload && ["admin", "manager"].includes((payload as { role: string }).role);
}

export async function GET(request: NextRequest) {
  if (!(await authorized(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const today = houstonToday();
  const { data: jobs, error } = await supabaseAdmin
    .from("jobs")
    .select("id, status, scheduled_date, scheduled_end_date")
    .eq("owner_updates_daily", true);
  if (error) {
    // Before the project-tracking migration the column doesn't exist; nothing to do.
    return NextResponse.json({ success: true, sent: 0, note: error.message });
  }

  const results: { job_id: string; outcome: string }[] = [];
  for (const j of jobs || []) {
    if (CLOSED.includes(j.status) || !runsOn(j, today)) {
      results.push({ job_id: j.id, outcome: "not running today" });
      continue;
    }
    try {
      const project = await loadProject(j.id);
      if (!project) continue;
      if (project.updates.some((u) => u.update_date === today)) {
        results.push({ job_id: j.id, outcome: "already sent today" });
        continue;
      }
      if (!buildOwnerUpdate(project, { day: today }).hasActivity) {
        results.push({ job_id: j.id, outcome: "nothing logged today" });
        continue;
      }
      const sent = await sendOwnerUpdate(project, { kind: "auto" });
      results.push({ job_id: j.id, outcome: `sent to ${sent.to.join(", ")}` });
    } catch (err) {
      results.push({
        job_id: j.id,
        outcome: err instanceof ProjectTrackingNotInstalled ? "tracking not installed" : `failed: ${err instanceof Error ? err.message : err}`,
      });
    }
  }

  return NextResponse.json({
    success: true,
    day: today,
    sent: results.filter((r) => r.outcome.startsWith("sent")).length,
    results,
  });
}
