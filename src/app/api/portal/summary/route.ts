import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { getCustomerIdForUser } from "@/lib/customer";

// Everything the portal dashboard and alerts pages need, in one customer-scoped
// call. Alerts are derived from real records rather than stored: an overdue
// invoice, an inspection coming up, an open service request. Keeping the
// derivation here means both pages agree on what counts as an alert.

const DAY = 24 * 60 * 60 * 1000;

type Alert = {
  id: string;
  type: "invoice" | "inspection" | "request" | "job";
  severity: "high" | "medium" | "info";
  title: string;
  message: string;
  date: string | null;
  href: string;
};

const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / DAY);
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "customer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerIdForUser(auth);
    const empty = {
      customer: null,
      stats: { amountDue: 0, openInvoices: 0, openRequests: 0, upcomingJobs: 0 },
      invoices: [],
      requests: [],
      jobs: [],
      alerts: [] as Alert[],
    };
    // An unlinked login has nothing of its own — never fall through to everything.
    if (!customerId) return NextResponse.json({ success: true, data: empty });

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, name, company, email, phone, address, city")
      .eq("id", customerId)
      .maybeSingle();

    const email = customer?.email || auth.email;

    // jobs and service_tickets key off the customer's email; invoices and
    // inspections key off the customer id.
    const [invRes, tickRes, jobRes, inspRes] = await Promise.all([
      supabaseAdmin
        .from("invoices")
        .select("id, invoice_number, status, total, amount_paid, due_date, created_at")
        .eq("customer_id", customerId)
        .neq("status", "draft")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("service_tickets")
        .select("id, ticket_number, title, status, priority, created_at, scheduled_date")
        .eq("customer_email", email)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("jobs")
        .select("id, job_number, job_type, status, scheduled_date, site_address, description")
        .eq("customer_email", email)
        .order("scheduled_date", { ascending: true })
        .limit(20),
      supabaseAdmin
        .from("inspections")
        .select("id, inspection_type, status, scheduled_date, site_address")
        .eq("customer_id", customerId)
        .order("scheduled_date", { ascending: true })
        .limit(20),
    ]);

    const invoices = invRes.data || [];
    const requests = tickRes.data || [];
    const jobs = jobRes.data || [];
    const inspections = inspRes.data || [];

    const settled = ["paid", "cancelled", "refunded"];
    const openInvoices = invoices.filter((i) => !settled.includes(i.status));
    const amountDue = openInvoices.reduce(
      (sum, i) => sum + ((i.total || 0) - (i.amount_paid || 0)),
      0
    );

    const openRequests = requests.filter((t) => !["resolved", "closed"].includes(t.status));
    const upcomingJobs = jobs.filter(
      (j) => j.scheduled_date && new Date(j.scheduled_date) >= new Date(Date.now() - DAY)
    );

    // ---- derive alerts ----
    const alerts: Alert[] = [];

    for (const inv of openInvoices) {
      if (!inv.due_date) continue;
      const d = daysUntil(inv.due_date);
      const balance = (inv.total || 0) - (inv.amount_paid || 0);
      if (d < 0) {
        alerts.push({
          id: `inv-${inv.id}`,
          type: "invoice",
          severity: "high",
          title: `Invoice ${inv.invoice_number} is overdue`,
          message: `${money(balance)} was due ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} ago.`,
          date: inv.due_date,
          href: "/portal/invoices",
        });
      } else if (d <= 7) {
        alerts.push({
          id: `inv-${inv.id}`,
          type: "invoice",
          severity: "medium",
          title: `Invoice ${inv.invoice_number} is due soon`,
          message: `${money(balance)} due in ${d} day${d === 1 ? "" : "s"}.`,
          date: inv.due_date,
          href: "/portal/invoices",
        });
      }
    }

    for (const insp of inspections) {
      if (!insp.scheduled_date || insp.status === "completed") continue;
      const d = daysUntil(insp.scheduled_date);
      if (d < 0 || d > 45) continue;
      alerts.push({
        id: `insp-${insp.id}`,
        type: "inspection",
        severity: d <= 7 ? "medium" : "info",
        title: `${insp.inspection_type || "Inspection"} scheduled`,
        message:
          d === 0
            ? `Today at ${insp.site_address || "your site"}.`
            : `In ${d} day${d === 1 ? "" : "s"} at ${insp.site_address || "your site"}.`,
        date: insp.scheduled_date,
        href: "/portal/services",
      });
    }

    for (const job of upcomingJobs) {
      const d = job.scheduled_date ? daysUntil(job.scheduled_date) : null;
      if (d === null || d > 30) continue;
      alerts.push({
        id: `job-${job.id}`,
        type: "job",
        severity: "info",
        title: `${job.job_type || "Work"} scheduled — ${job.job_number}`,
        message:
          d <= 0
            ? `Our crew is scheduled today at ${job.site_address || "your site"}.`
            : `In ${d} day${d === 1 ? "" : "s"} at ${job.site_address || "your site"}.`,
        date: job.scheduled_date,
        href: "/portal/dashboard",
      });
    }

    for (const t of openRequests) {
      alerts.push({
        id: `req-${t.id}`,
        type: "request",
        severity: t.priority === "emergency" || t.priority === "urgent" ? "medium" : "info",
        title: `Request ${t.ticket_number} is ${t.status.replace(/_/g, " ")}`,
        message: t.scheduled_date
          ? `${t.title} — scheduled ${new Date(t.scheduled_date).toLocaleDateString()}.`
          : t.title,
        date: t.created_at,
        href: "/portal/support",
      });
    }

    const rank = { high: 0, medium: 1, info: 2 };
    alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);

    return NextResponse.json({
      success: true,
      data: {
        customer,
        stats: {
          amountDue,
          openInvoices: openInvoices.length,
          openRequests: openRequests.length,
          upcomingJobs: upcomingJobs.length,
        },
        invoices: invoices.slice(0, 5),
        requests: requests.slice(0, 5),
        jobs: upcomingJobs.slice(0, 5),
        alerts,
      },
    });
  } catch (error) {
    console.error("Error building portal summary:", error);
    return NextResponse.json({ success: false, error: "Failed to load your account" }, { status: 500 });
  }
}
