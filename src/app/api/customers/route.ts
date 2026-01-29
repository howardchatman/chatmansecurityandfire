import { NextRequest, NextResponse } from "next/server";
import { getCustomers, createCustomer } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    if (search) {
      // Search customers by name, email, company, or phone
      const { data, error } = await supabaseAdmin
        .from("security_customers")
        .select("*")
        .or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`)
        .order("name", { ascending: true })
        .limit(20);

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    const customers = await getCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const customer = await createCustomer({
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
      notes: body.notes,
      status: "active",
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
