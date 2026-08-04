import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { getCustomerIdForUser } from "@/lib/customer";
import { sendEmail } from "@/lib/email";
import { upsertGhlContact } from "@/lib/gohighlevel";
import { normalizePriority, normalizeServiceType } from "@/lib/service-tickets";

// Customer-facing service requests. The admin /api/tickets endpoint is staff
// only; this lets a signed-in customer raise a request against their own
// account and see the ones they've raised. Their identity comes from the
// session — never from the request body.

function generateTicketNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `TKT-${stamp}-${Math.floor(Math.random() * 9000) + 1000}`;
}

async function requireCustomer(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth || auth.role !== "customer") return { auth: null, customerId: null };
  const customerId = await getCustomerIdForUser(auth);
  return { auth, customerId };
}

export async function GET(request: NextRequest) {
  try {
    const { auth, customerId } = await requireCustomer(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    // No linked customer record means nothing of theirs to show — never
    // fall through to "everything".
    if (!customerId) return NextResponse.json({ success: true, data: [] });

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("email")
      .eq("id", customerId)
      .maybeSingle();

    const { data, error } = await supabaseAdmin
      .from("service_tickets")
      .select("id, ticket_number, title, description, service_type, priority, status, created_at, scheduled_date")
      .eq("customer_email", customer?.email || auth.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching service requests:", error);
      return NextResponse.json({ success: false, error: "Failed to load requests" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error fetching service requests:", error);
    return NextResponse.json({ success: false, error: "Failed to load requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { auth, customerId } = await requireCustomer(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Please describe what you need help with." },
        { status: 400 }
      );
    }

    const { data: customer } = customerId
      ? await supabaseAdmin
          .from("customers")
          .select("name, email, phone, company, address, city")
          .eq("id", customerId)
          .maybeSingle()
      : { data: null };

    const customerName = customer?.company || customer?.name || auth.name || auth.email;
    const customerEmail = customer?.email || auth.email;

    // service_tickets has CHECK constraints on these; an unrecognised value
    // fails the insert, so clamp rather than trust the client.
    const priority = normalizePriority(body.priority);
    const serviceType = normalizeServiceType(body.service_type);

    const { data, error } = await supabaseAdmin
      .from("service_tickets")
      .insert({
        ticket_number: generateTicketNumber(),
        title,
        description: body.description || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customer?.phone || null,
        site_address: customer?.address || null,
        site_city: customer?.city || null,
        service_type: serviceType,
        priority,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating service request:", error);
      return NextResponse.json({ success: false, error: "Failed to submit request" }, { status: 500 });
    }

    // Tell Howard, and put it in the CRM so it lands in the pipeline like any
    // other inbound work. Neither should block the customer's submission.
    sendEmail({
      to: process.env.ADMIN_EMAIL || "howardchatman@icloud.com",
      subject: `Portal service request: ${title} — ${customerName}`,
      html: `
        <h2>New service request from the customer portal</h2>
        <p><strong>Customer:</strong> ${customerName}<br/>
           <strong>Email:</strong> ${customerEmail}<br/>
           <strong>Phone:</strong> ${customer?.phone || "—"}<br/>
           <strong>Site:</strong> ${customer?.address || "—"} ${customer?.city || ""}</p>
        <p><strong>Ticket:</strong> ${data.ticket_number}<br/>
           <strong>Type:</strong> ${data.service_type}<br/>
           <strong>Priority:</strong> ${data.priority}</p>
        <p><strong>${title}</strong></p>
        <p>${(body.description || "").replace(/\n/g, "<br/>")}</p>
      `,
    }).catch((err) => console.error("Service request email failed:", err));

    upsertGhlContact({
      name: customerName,
      email: customerEmail,
      phone: customer?.phone,
      source: "portal_service_request",
      tags: ["Service Request", data.service_type],
      note: `Portal service request ${data.ticket_number} (${data.priority})\n${title}\n${body.description || ""}`,
    }).catch((err) => console.error("Service request GHL push failed:", err));

    return NextResponse.json({
      success: true,
      data,
      message: `Request ${data.ticket_number} submitted. We'll be in touch shortly.`,
    });
  } catch (error) {
    console.error("Error creating service request:", error);
    return NextResponse.json({ success: false, error: "Failed to submit request" }, { status: 500 });
  }
}
