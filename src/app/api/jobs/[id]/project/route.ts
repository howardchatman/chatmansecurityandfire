import { NextRequest, NextResponse, after } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { supabaseAdmin, getJobById } from "@/lib/supabase";
import { syncJobToCalendar, deleteEvent } from "@/lib/google-calendar";
import { blanksToNull } from "@/lib/job-input";
import { houstonToday } from "@/lib/job-dates";
import {
  loadProject,
  ProjectTrackingNotInstalled,
  templateMilestones,
  splitDraws,
  syncMilestoneToCalendar,
  syncDrawToCalendar,
  invoiceDraw,
  buildOwnerUpdate,
  sendOwnerUpdate,
  type Milestone,
  type Draw,
} from "@/lib/project-tracking";

// GET  — the project: job details, milestones, draws, daily log, sent updates.
// POST — {action, ...} to change it. Office staff can do everything; techs and
//        inspectors can read and write their own daily log entries.

type Auth = NonNullable<Awaited<ReturnType<typeof verifyAuth>>>;
const OFFICE = ["admin", "manager"];
const FIELD = ["technician", "inspector"];

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function explain(err: unknown) {
  if (err instanceof ProjectTrackingNotInstalled) return fail(err.message, 409);
  console.error("Project tracking error:", err);
  return fail(err instanceof Error ? err.message : "Something went wrong.", 500);
}

const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if (!auth || ![...OFFICE, ...FIELD].includes(auth.role)) return fail("Unauthorized", 401);
  const { id } = await params;
  try {
    const project = await loadProject(id);
    if (!project) return fail("Job not found", 404);
    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    return explain(err);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if (!auth || ![...OFFICE, ...FIELD].includes(auth.role)) return fail("Unauthorized", 401);
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action: string = body.action;
  const office = OFFICE.includes(auth.role);

  // Field staff may only touch their own daily log.
  if (!office && !["save_log", "delete_log"].includes(action)) return fail("Only the office can change that.", 403);

  try {
    const project = await loadProject(id);
    if (!project) return fail("Job not found", 404);
    const { job } = project;

    switch (action) {
      // ---- project profile (owner contact, site, schedule, money) ----
      case "update_job": {
        const allowed = [
          "customer_name", "customer_email", "customer_phone", "site_address", "site_city", "site_state", "site_zip",
          "description", "scheduled_date", "scheduled_end_date", "scheduled_time_start", "scheduled_time_end",
          "estimated_duration_hours", "percent_complete", "contract_value", "customer_id", "owner_updates_daily", "update_cc",
          "prime_contractor", "contact_name", "contact_email", "contact_phone",
        ];
        const updates: Record<string, unknown> = {};
        for (const k of allowed) if (k in (body.updates || {})) updates[k] = body.updates[k];
        const clean = blanksToNull(updates);
        for (const k of ["contract_value", "customer_id", "update_cc", "prime_contractor", "contact_name", "contact_email", "contact_phone"]) {
          if (typeof clean[k] === "string" && !(clean[k] as string).trim()) clean[k] = null;
        }
        if ("percent_complete" in clean) {
          clean.percent_complete = Math.max(0, Math.min(100, Math.round(Number(clean.percent_complete) || 0)));
        }
        if (typeof clean.customer_name === "string" && !clean.customer_name.trim()) return fail("The owner's name can't be empty.");
        const start = (clean.scheduled_date ?? job.scheduled_date) as string | null;
        const end = (clean.scheduled_end_date ?? job.scheduled_end_date) as string | null;
        if (end && (!start || end < start)) return fail("The end date must be on or after the start date.");

        const { error } = await supabaseAdmin.from("jobs").update(clean).eq("id", id);
        if (error) throw new Error(error.message);

        // Dates, site, or owner changed: keep the calendar event in step.
        after(async () => {
          try {
            const full = await getJobById(id);
            if (full) await syncJobToCalendar(full);
          } catch (e) {
            console.error("Calendar resync after project edit failed:", e);
          }
        });
        break;
      }

      // ---- milestones ----
      case "add_milestone": {
        if (!String(body.title || "").trim()) return fail("Give the milestone a name.");
        const { data, error } = await supabaseAdmin
          .from("project_milestones")
          .insert({
            job_id: id,
            title: String(body.title).trim(),
            target_date: isDay(body.target_date) ? body.target_date : null,
            sort: project.milestones.length,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        after(() => syncMilestoneToCalendar(data as Milestone, job).catch((e) => console.error(e)));
        break;
      }
      case "seed_milestones": {
        if (project.milestones.length) return fail("This project already has milestones.");
        const rows = templateMilestones(job.scheduled_date, job.scheduled_end_date).map((m) => ({ ...m, job_id: id }));
        const { data, error } = await supabaseAdmin.from("project_milestones").insert(rows).select();
        if (error) throw new Error(error.message);
        after(async () => {
          for (const m of (data || []) as Milestone[]) await syncMilestoneToCalendar(m, job).catch((e) => console.error(e));
        });
        break;
      }
      case "update_milestone": {
        const m = project.milestones.find((x) => x.id === body.id);
        if (!m) return fail("Milestone not found", 404);
        const patch: Record<string, unknown> = {};
        if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
        if ("target_date" in body) patch.target_date = isDay(body.target_date) ? body.target_date : null;
        if (typeof body.done === "boolean") {
          patch.done = body.done;
          patch.done_at = body.done ? new Date().toISOString() : null;
        }
        const { data, error } = await supabaseAdmin.from("project_milestones").update(patch).eq("id", m.id).select().single();
        if (error) throw new Error(error.message);
        after(() => syncMilestoneToCalendar(data as Milestone, job).catch((e) => console.error(e)));
        break;
      }
      case "delete_milestone": {
        const m = project.milestones.find((x) => x.id === body.id);
        if (!m) return fail("Milestone not found", 404);
        await supabaseAdmin.from("project_milestones").delete().eq("id", m.id);
        if (m.google_event_id) after(() => deleteEvent(m.google_event_id!));
        break;
      }

      // ---- payment draws ----
      case "add_draw": {
        const amount = Number(body.amount);
        if (!String(body.label || "").trim() || !(amount > 0)) return fail("A draw needs a name and an amount.");
        const { data, error } = await supabaseAdmin
          .from("project_draws")
          .insert({
            job_id: id,
            label: String(body.label).trim(),
            amount: Math.round(amount * 100) / 100,
            due_date: isDay(body.due_date) ? body.due_date : null,
            sort: project.draws.length,
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        after(() => syncDrawToCalendar(data as Draw, job).catch((e) => console.error(e)));
        break;
      }
      case "split_draws": {
        if (project.draws.length) return fail("This project already has draws. Delete them first to re-split.");
        const total = Number(body.total ?? project.totals.contract);
        const count = Math.round(Number(body.count));
        const every = Math.round(Number(body.every_days) || 7);
        if (!(total > 0)) return fail("Set the contract value first.");
        if (!(count >= 1 && count <= 52)) return fail("Choose between 1 and 52 draws.");
        const start = isDay(body.start) ? body.start : job.scheduled_date || houstonToday();
        const rows = splitDraws(total, count, start, every).map((d) => ({ ...d, job_id: id }));
        const { data, error } = await supabaseAdmin.from("project_draws").insert(rows).select();
        if (error) throw new Error(error.message);
        after(async () => {
          for (const d of (data || []) as Draw[]) await syncDrawToCalendar(d, job).catch((e) => console.error(e));
        });
        break;
      }
      case "update_draw": {
        const d = project.draws.find((x) => x.id === body.id);
        if (!d) return fail("Draw not found", 404);
        const patch: Record<string, unknown> = {};
        if (typeof body.label === "string" && body.label.trim()) patch.label = body.label.trim();
        if (body.amount !== undefined) {
          if (d.invoice_id) return fail("This draw is already invoiced; change the amount on the invoice.");
          const amount = Number(body.amount);
          if (!(amount > 0)) return fail("Enter an amount above zero.");
          patch.amount = Math.round(amount * 100) / 100;
        }
        if ("due_date" in body) patch.due_date = isDay(body.due_date) ? body.due_date : null;
        const { data, error } = await supabaseAdmin.from("project_draws").update(patch).eq("id", d.id).select().single();
        if (error) throw new Error(error.message);
        after(() => syncDrawToCalendar({ ...(data as Draw), status: d.status }, job).catch((e) => console.error(e)));
        break;
      }
      case "delete_draw": {
        const d = project.draws.find((x) => x.id === body.id);
        if (!d) return fail("Draw not found", 404);
        if (d.invoice_id) return fail("This draw has an invoice. Cancel or delete the invoice first.");
        await supabaseAdmin.from("project_draws").delete().eq("id", d.id);
        if (d.google_event_id) after(() => deleteEvent(d.google_event_id!));
        break;
      }
      case "invoice_draw": {
        const d = project.draws.find((x) => x.id === body.id);
        if (!d) return fail("Draw not found", 404);
        const invoiceId = await invoiceDraw(d, job, auth.userId);
        after(() => syncDrawToCalendar({ ...d, status: "invoiced", invoice_id: invoiceId }, job).catch((e) => console.error(e)));
        const fresh = await loadProject(id);
        return NextResponse.json({ success: true, data: fresh, invoice_id: invoiceId });
      }

      // ---- daily crew log ----
      case "save_log": {
        if (!isDay(body.log_date)) return fail("Pick the date.");
        const hours = Number(body.hours);
        if (!(hours >= 0 && hours <= 24)) return fail("Hours must be between 0 and 24.");
        // Field staff log for themselves; the office can log for anyone.
        const userId: string | null = office ? body.user_id || null : auth.userId;
        let workerName: string = office ? String(body.worker_name || "").trim() : "";
        if (userId) {
          const { data: prof } = await supabaseAdmin.from("profiles").select("full_name, email").eq("id", userId).maybeSingle();
          workerName = workerName || prof?.full_name || prof?.email || "Crew";
        }
        if (!workerName) return fail("Pick who worked.");
        const row = {
          job_id: id,
          log_date: body.log_date,
          user_id: userId,
          worker_name: workerName,
          hours: Math.round(hours * 100) / 100,
          notes: String(body.notes || "").trim() || null,
          created_by: auth.userId,
          updated_at: new Date().toISOString(),
        };
        // One entry per person per day: update theirs if it exists.
        const existing = project.logs.find((l) => l.log_date === row.log_date && l.user_id === userId && (userId || l.worker_name === workerName));
        const { error } = existing
          ? await supabaseAdmin.from("project_daily_logs").update(row).eq("id", existing.id)
          : await supabaseAdmin.from("project_daily_logs").insert(row);
        if (error) throw new Error(error.message);
        break;
      }
      case "delete_log": {
        const l = project.logs.find((x) => x.id === body.id);
        if (!l) return fail("Entry not found", 404);
        if (!office && l.user_id !== auth.userId) return fail("You can only remove your own entries.", 403);
        await supabaseAdmin.from("project_daily_logs").delete().eq("id", l.id);
        break;
      }

      // ---- owner updates ----
      case "preview_update": {
        const built = buildOwnerUpdate(project, {
          message: body.message,
          includePayments: !!body.include_payments,
          day: isDay(body.day) ? body.day : undefined,
        });
        return NextResponse.json({ success: true, data: built });
      }
      case "send_update": {
        const sent = await sendOwnerUpdate(project, {
          message: body.message,
          includePayments: !!body.include_payments,
          kind: "manual",
          sentBy: auth.userId,
          replyTo: auth.email,
        });
        const fresh = await loadProject(id);
        return NextResponse.json({ success: true, data: fresh, sent });
      }

      default:
        return fail("Unknown action");
    }

    const fresh = await loadProject(id);
    return NextResponse.json({ success: true, data: fresh });
  } catch (err) {
    return explain(err);
  }
}

export type { Auth };
