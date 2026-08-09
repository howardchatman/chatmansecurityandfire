import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { hydrateNfpa72Form, emptyNfpa72Form } from "@/lib/nfpa72";

// The NFPA 72 Inspection and Testing Form lives in a jsonb column on the
// inspection rather than its own table. It is one document per inspection,
// always read and written whole, and never queried field-by-field — a table of
// two hundred columns would buy nothing.

/** Everyone on the crew can fill out a report. Customers read, never write. */
const CAN_EDIT = ["admin", "manager", "technician", "inspector"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const BASE =
    "id, inspection_number, customer_name, site_address, site_city, site_state, site_zip, contact_name, contact_phone, scheduled_date, status";

  const read = (cols: string) =>
    supabaseAdmin.from("inspections").select(cols).eq("id", id).single();

  type Row = Record<string, unknown> & { nfpa72_form?: unknown };

  let { data, error } = (await read(`${BASE}, nfpa72_form`)) as {
    data: Row | null;
    error: { message: string } | null;
  };

  // Before the migration runs, the column simply isn't there. Rather than 404
  // on a real inspection, fall back to reading without it — the form still
  // fills in and prints; only saving needs the column.
  let migrationRequired = false;
  if (error && /nfpa72_form/.test(error.message)) {
    migrationRequired = true;
    ({ data, error } = (await read(BASE)) as {
      data: Row | null;
      error: { message: string } | null;
    });
  }

  if (error || !data) {
    return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
  }

  // A customer may only see the report for their own site, and only once it is
  // finished — a half-filled form is a working document, not a record.
  if (user.role === "customer") {
    if (data.status !== "completed") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const site = [data.site_address, data.site_city, data.site_state, data.site_zip]
    .map(str)
    .filter(Boolean)
    .join(", ");

  const form = data.nfpa72_form
    ? hydrateNfpa72Form(data.nfpa72_form)
    : emptyNfpa72Form({
        date: str(data.scheduled_date),
        property_name: str(data.customer_name),
        property_address: site,
        owner_contact: str(data.contact_name),
        owner_telephone: str(data.contact_phone),
      });

  return NextResponse.json({
    data: {
      form,
      /** False means nothing has been saved yet — the form above is a fresh blank. */
      saved: !!data.nfpa72_form,
      migration_required: migrationRequired,
      inspection: {
        id: data.id,
        inspection_number: str(data.inspection_number),
        customer_name: str(data.customer_name),
        site,
        status: str(data.status),
      },
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!CAN_EDIT.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (!body?.form || typeof body.form !== "object") {
    return NextResponse.json({ error: "Missing form" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("inspections")
    .update({ nfpa72_form: body.form, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    console.error("[nfpa72] save failed:", error);
    // The column is added by migration; say so plainly rather than "500".
    if (error.code === "PGRST204" || /nfpa72_form/.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "The nfpa72_form column is missing on the inspections table. Run the migration in supabase/migrations before saving reports.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
