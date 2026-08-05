import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import {
  normalizeSystemType,
  normalizeFrequency,
  normalizeStatus,
  computeNextDue,
} from "@/lib/customer-systems";

// Equipment and services a customer has on site. Staff-only: this is the record
// of what we installed and what we bill monthly for.

function buildRow(body: Record<string, unknown>) {
  const frequency = normalizeFrequency(body.inspection_frequency);
  const lastInspection = (body.last_inspection_date as string) || null;

  return {
    system_type: normalizeSystemType(body.system_type),
    description: (body.description as string)?.trim() || null,
    location: (body.location as string)?.trim() || null,
    quantity: Math.max(1, parseInt(String(body.quantity ?? 1), 10) || 1),
    manufacturer: (body.manufacturer as string)?.trim() || null,
    model: (body.model as string)?.trim() || null,
    serial_number: (body.serial_number as string)?.trim() || null,
    install_date: (body.install_date as string) || null,
    last_inspection_date: lastInspection,
    inspection_frequency: frequency,
    // Recomputed from the last inspection every write, so the reminder date can
    // never drift away from the inspection history it is derived from.
    next_inspection_due: computeNextDue(lastInspection, frequency),
    monitored: Boolean(body.monitored),
    monthly_rate:
      body.monthly_rate === "" || body.monthly_rate == null
        ? null
        : Number(body.monthly_rate),
    status: normalizeStatus(body.status),
    notes: (body.notes as string)?.trim() || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer_id");
    const dueWithin = searchParams.get("due_within_days");

    let query = supabaseAdmin
      .from("customer_systems")
      .select("*, customer:customers(id, name, company, email, phone)")
      .order("next_inspection_due", { ascending: true, nullsFirst: false });

    if (customerId) query = query.eq("customer_id", customerId);

    if (dueWithin) {
      const days = parseInt(dueWithin, 10);
      if (!Number.isNaN(days)) {
        const cutoff = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
        query = query
          .not("next_inspection_due", "is", null)
          .lte("next_inspection_due", cutoff)
          .neq("status", "inactive");
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching customer systems:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const rows = data || [];
    const rmr = rows
      .filter((r) => r.monitored && r.status !== "inactive")
      .reduce((sum, r) => sum + Number(r.monthly_rate || 0), 0);

    return NextResponse.json({
      success: true,
      data: rows,
      summary: { count: rows.length, monthlyRecurringRevenue: Math.round(rmr * 100) / 100 },
    });
  } catch (error) {
    console.error("Error fetching customer systems:", error);
    return NextResponse.json({ success: false, error: "Failed to load systems" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.customer_id) {
      return NextResponse.json({ success: false, error: "customer_id is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("customer_systems")
      .insert({ customer_id: body.customer_id, ...buildRow(body) })
      .select()
      .single();

    if (error) {
      console.error("Error creating customer system:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error creating customer system:", error);
    return NextResponse.json({ success: false, error: "Failed to add system" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    // Merge over the existing row rather than rebuilding from the body alone.
    // buildRow fills every column, so a partial update — "mark inspected today"
    // sends only id and a date — would otherwise blank out make, model,
    // location, monitoring rate and everything else.
    const { data: current, error: readError } = await supabaseAdmin
      .from("customer_systems")
      .select("*")
      .eq("id", body.id)
      .single();

    if (readError || !current) {
      return NextResponse.json({ success: false, error: "System not found" }, { status: 404 });
    }

    const merged = buildRow({ ...current, ...body });

    const { data, error } = await supabaseAdmin
      .from("customer_systems")
      .update({ ...merged, updated_at: new Date().toISOString() })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer system:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating customer system:", error);
    return NextResponse.json({ success: false, error: "Failed to update system" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("customer_systems").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "System removed" });
  } catch (error) {
    console.error("Error deleting customer system:", error);
    return NextResponse.json({ success: false, error: "Failed to remove system" }, { status: 500 });
  }
}
