import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-min-32-chars-long!!"
);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string; teamId?: string };
  } catch {
    return null;
  }
}

// POST: Create an invoice from a job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    const { id: jobId } = await params;

    // Fetch the job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    // Check if invoice already exists for this job
    const { data: existingInvoice } = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_number")
      .eq("job_id", jobId)
      .single();

    if (existingInvoice) {
      return NextResponse.json({
        success: false,
        error: `Invoice ${existingInvoice.invoice_number} already exists for this job`,
      }, { status: 400 });
    }

    // Find or create customer
    let customerId: string | null = null;

    if (job.customer_email) {
      const { data: customer } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("email", job.customer_email)
        .single();

      if (customer) {
        customerId = customer.id;
      } else {
        // Create customer from job data
        const { data: newCustomer } = await supabaseAdmin
          .from("customers")
          .insert({
            name: job.customer_name || "Unknown",
            email: job.customer_email,
            phone: job.customer_phone || null,
            address: job.site_address || null,
            city: job.site_city || null,
            state: job.site_state || "TX",
            zip: job.site_zip || null,
            status: "active",
          })
          .select()
          .single();

        customerId = newCustomer?.id || null;
      }
    }

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: "Customer email is required to create an invoice",
      }, { status: 400 });
    }

    // Build line items from job scope or use total
    const lineItems = [];
    const totalAmount = job.total_amount || 0;

    if (job.scope_summary) {
      // Parse scope lines into line items
      const scopeLines = job.scope_summary.split("\n").filter((line: string) => line.trim());
      if (scopeLines.length > 0) {
        const perItemAmount = totalAmount / scopeLines.length;
        for (const line of scopeLines) {
          // Check for quantity prefix like "2x Description"
          const match = line.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            lineItems.push({
              description: match[2].trim(),
              quantity: parseInt(match[1]),
              unit_price: Math.round((perItemAmount / parseInt(match[1])) * 100) / 100,
              item_type: "service",
            });
          } else {
            lineItems.push({
              description: line.trim(),
              quantity: 1,
              unit_price: Math.round(perItemAmount * 100) / 100,
              item_type: "service",
            });
          }
        }
      }
    }

    // Fallback: single line item
    if (lineItems.length === 0) {
      lineItems.push({
        description: job.description || `Job ${job.job_number} - ${job.job_type}`,
        quantity: 1,
        unit_price: totalAmount,
        item_type: "service",
      });
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const taxRate = 0.0825;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .insert({
        customer_id: customerId,
        job_id: jobId,
        quote_id: job.quote_id || null,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        amount_paid: 0,
        status: "draft",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: `Generated from Job ${job.job_number}`,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
    }

    // Insert line items
    const items = lineItems.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: Math.round(item.quantity * item.unit_price * 100) / 100,
      item_type: item.item_type,
    }));

    await supabaseAdmin.from("invoice_items").insert(items);

    // Update job status to invoiced
    await supabaseAdmin
      .from("jobs")
      .update({ status: "invoiced" })
      .eq("id", jobId);

    // Log job event
    await supabaseAdmin.from("job_events").insert({
      job_id: jobId,
      event_type: "invoiced",
      payload: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        total,
      },
      created_by: auth.userId,
    });

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error creating invoice from job:", error);
    return NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
  }
}
