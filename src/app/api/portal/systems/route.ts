import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { getCustomerIdForUser } from "@/lib/customer";

// The customer's own equipment, for the portal Services page.
//
// Deliberately narrower than the admin view: internal notes, serial numbers and
// the monthly rate we charge are staff information and are not selected here.
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "customer") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getCustomerIdForUser(auth);
    if (!customerId) return NextResponse.json({ success: true, data: [] });

    const { data, error } = await supabaseAdmin
      .from("customer_systems")
      .select(
        "id, system_type, description, location, quantity, manufacturer, model, install_date, last_inspection_date, inspection_frequency, next_inspection_due, monitored, status"
      )
      .eq("customer_id", customerId)
      .neq("status", "inactive")
      .order("system_type", { ascending: true });

    if (error) {
      console.error("Error loading customer systems:", error);
      return NextResponse.json({ success: false, error: "Failed to load your systems" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Error loading customer systems:", error);
    return NextResponse.json({ success: false, error: "Failed to load your systems" }, { status: 500 });
  }
}
