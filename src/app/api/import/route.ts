import { NextRequest, NextResponse } from "next/server";
import { createCustomer, createLead, supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, records } = body;

    if (!type || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { success: false, error: "type and records array are required" },
        { status: 400 }
      );
    }

    const results = { created: 0, failed: 0, errors: [] as string[] };

    if (type === "customers") {
      for (const record of records) {
        try {
          await createCustomer({
            name: record.name || record.Name || "",
            email: record.email || record.Email || "",
            phone: record.phone || record.Phone || null,
            company: record.company || record.Company || null,
            address: record.address || record.Address || null,
            city: record.city || record.City || null,
            state: record.state || record.State || null,
            zip: record.zip || record.Zip || record.ZIP || null,
            notes: record.notes || record.Notes || null,
            status: "prospect",
          });
          results.created++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Row ${results.created + results.failed}: ${err}`);
        }
      }
    } else if (type === "leads") {
      for (const record of records) {
        try {
          await createLead({
            name: record.name || record.Name || "",
            email: record.email || record.Email || "",
            phone: record.phone || record.Phone || null,
            message: record.message || record.notes || record.Notes || null,
            source: record.source || record.Source || "import",
            status: record.status || "new",
          });
          results.created++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Row ${results.created + results.failed}: ${err}`);
        }
      }
    } else if (type === "jobs") {
      for (const record of records) {
        try {
          const { error } = await supabaseAdmin.from("jobs").insert([{
            customer_name: record.customer_name || record["Customer Name"] || record.name || "",
            customer_email: record.customer_email || record.email || null,
            customer_phone: record.customer_phone || record.phone || null,
            site_address: record.address || record.site_address || record.Address || null,
            site_city: record.city || record.City || null,
            site_state: record.state || record.State || "TX",
            site_zip: record.zip || record.Zip || null,
            job_type: record.job_type || record.type || record.Type || "service",
            status: record.status || "lead",
            priority: record.priority || "normal",
            notes: record.notes || record.Notes || null,
          }]);
          if (error) throw error;
          results.created++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Row ${results.created + results.failed}: ${err}`);
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: "type must be customers, leads, or jobs" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { success: false, error: "Import failed" },
      { status: 500 }
    );
  }
}
