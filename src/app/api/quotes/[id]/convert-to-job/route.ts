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

// Generate job number
async function generateJobNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `JOB-${year}-`;

  const { data } = await supabase
    .from("jobs")
    .select("job_number")
    .like("job_number", `${prefix}%`)
    .order("job_number", { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].job_number.replace(prefix, ""));
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
}

// POST: Convert a quote to a job
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

    // Only admin and manager can convert quotes
    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id: quoteId } = await params;
    const body = await request.json();
    const {
      job_type = "installation",
      priority = "normal",
      scheduled_date,
      scheduled_time_start,
      scheduled_time_end,
      team_id,
      assigned_users = [],
    } = body;

    // Fetch the quote
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { success: false, error: "Quote not found" },
        { status: 404 }
      );
    }

    // Check if quote is in accepted status
    if (quote.status !== "accepted" && quote.status !== "paid") {
      return NextResponse.json(
        { success: false, error: "Quote must be accepted or paid to convert to job" },
        { status: 400 }
      );
    }

    // Check if already converted
    const { data: existingJob } = await supabase
      .from("jobs")
      .select("id, job_number")
      .eq("quote_id", quoteId)
      .single();

    if (existingJob) {
      return NextResponse.json(
        { success: false, error: `Quote already converted to job ${existingJob.job_number}` },
        { status: 400 }
      );
    }

    // Extract customer and site info from quote JSONB
    const customer = quote.customer || {};
    const site = quote.site || {};
    const totals = quote.totals || {};

    // Generate job number
    const jobNumber = await generateJobNumber();

    // Create the job
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        job_number: jobNumber,
        quote_id: quoteId,
        customer_name: customer.name || customer.company || "Unknown",
        customer_email: customer.email,
        customer_phone: customer.phone,
        contact_name: customer.contactName || customer.name,
        site_address: site.address || site.street || "",
        site_city: site.city,
        site_state: site.state || "TX",
        site_zip: site.zip || site.zipCode,
        job_type,
        priority,
        status: scheduled_date ? "scheduled" : "approved",
        description: quote.template_name || `Converted from Quote ${quote.quote_number}`,
        scope_summary: buildScopeSummary(quote.line_items),
        total_amount: totals.total || totals.grandTotal,
        scheduled_date,
        scheduled_time_start,
        scheduled_time_end,
        team_id: team_id || auth.teamId,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (jobError) {
      console.error("Error creating job:", jobError);
      return NextResponse.json(
        { success: false, error: "Failed to create job" },
        { status: 500 }
      );
    }

    // Assign users if provided
    if (assigned_users && Array.isArray(assigned_users)) {
      for (const assignment of assigned_users) {
        try {
          await supabase.from("job_assignments").insert({
            job_id: job.id,
            user_id: assignment.user_id,
            assigned_by: auth.userId,
            role: assignment.role || "technician",
          });
        } catch (err) {
          console.error("Error assigning user:", err);
        }
      }
    }

    // Create job event for the conversion
    await supabase.from("job_events").insert({
      job_id: job.id,
      event_type: "converted_from_quote",
      payload: {
        quote_id: quoteId,
        quote_number: quote.quote_number,
        total_amount: totals.total || totals.grandTotal,
      },
      created_by: auth.userId,
    });

    // Also create the initial "created" event
    await supabase.from("job_events").insert({
      job_id: job.id,
      event_type: "created",
      payload: { source: "quote_conversion" },
      created_by: auth.userId,
    });

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error converting quote to job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to convert quote to job" },
      { status: 500 }
    );
  }
}

// Helper function to build scope summary from line items
function buildScopeSummary(lineItems: unknown): string {
  if (!lineItems || !Array.isArray(lineItems)) return "";

  const items = lineItems as Array<{ description?: string; name?: string; quantity?: number }>;
  return items
    .map((item) => {
      const desc = item.description || item.name || "";
      const qty = item.quantity || 1;
      return qty > 1 ? `${qty}x ${desc}` : desc;
    })
    .filter(Boolean)
    .join("\n");
}
