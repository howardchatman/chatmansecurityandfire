import { NextRequest, NextResponse } from "next/server";
import {
  getDeficiencyById,
  getInspectionById,
  createQuote,
  linkDeficienciesToQuote,
  Deficiency,
} from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

// Map deficiency categories to quote line item categories
const categoryMap: Record<string, string> = {
  emergency_lighting: "Emergency Lighting",
  duct_smoke: "Smoke Detection",
  fire_lane: "Fire Lane",
  panel_trouble: "Fire Alarm Panel",
  monitoring: "Monitoring",
  smoke_detector: "Smoke Detection",
  heat_detector: "Heat Detection",
  pull_station: "Pull Stations",
  horn_strobe: "Notification Devices",
  sprinkler_head: "Sprinkler System",
  valve: "Valves",
  signage: "Signage",
  documentation: "Documentation",
  other: "Miscellaneous",
};

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and manager can generate quotes
    if (!["admin", "manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { deficiency_ids, inspection_id } = body;

    if (!deficiency_ids || !Array.isArray(deficiency_ids) || deficiency_ids.length === 0) {
      return NextResponse.json(
        { error: "deficiency_ids array is required" },
        { status: 400 }
      );
    }

    // Get inspection details
    const inspection = await getInspectionById(inspection_id);
    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    // Get all deficiencies
    const deficiencies: Deficiency[] = [];
    for (const id of deficiency_ids) {
      const def = await getDeficiencyById(id);
      if (def) {
        deficiencies.push(def);
      }
    }

    if (deficiencies.length === 0) {
      return NextResponse.json({ error: "No valid deficiencies found" }, { status: 400 });
    }

    // Build line items from deficiencies
    const lineItems = deficiencies.map((def, index) => ({
      id: `def-${index + 1}`,
      category: categoryMap[def.category] || "Miscellaneous",
      name: `${def.category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} Repair`,
      description: def.description + (def.recommended_action ? `\n\nRecommended: ${def.recommended_action}` : ""),
      unit: "ea",
      quantity: 1,
      unitPrice: def.estimated_cost_high || def.estimated_cost_low || 0,
      laborHours: 0,
      laborRate: 0,
      allowanceLow: def.estimated_cost_low || 0,
      allowanceHigh: def.estimated_cost_high || 0,
      isAllowance: !!(def.estimated_cost_low && def.estimated_cost_high && def.estimated_cost_low !== def.estimated_cost_high),
      markup: 0,
      taxable: true,
    }));

    // Calculate totals
    const subtotalLow = lineItems.reduce((sum, item) => sum + (item.allowanceLow || item.unitPrice), 0);
    const subtotalHigh = lineItems.reduce((sum, item) => sum + (item.allowanceHigh || item.unitPrice), 0);
    const subtotal = subtotalHigh;
    const taxRate = 0.0825; // 8.25% Texas sales tax
    const tax = subtotal * taxRate;

    // Create the quote
    const quote = await createQuote({
      quote_type: "deficiency_repair",
      template_name: "Deficiency Repair Quote",
      status: "draft",
      customer: {
        name: inspection.customer_name,
        phone: inspection.contact_phone || "",
        email: inspection.contact_email,
        address: inspection.site_address,
        city: inspection.site_city,
        state: inspection.site_state,
        zip: inspection.site_zip,
      },
      site: {
        address: inspection.site_address,
        city: inspection.site_city || "",
        state: inspection.site_state,
        zip: inspection.site_zip,
      },
      line_items: lineItems,
      totals: {
        subtotal,
        subtotalLow,
        subtotalHigh,
        laborTotal: 0,
        materialsTotal: subtotal,
        tax,
        taxRate,
        total: subtotal + tax,
        totalLow: subtotalLow + (subtotalLow * taxRate),
        totalHigh: subtotalHigh + (subtotalHigh * taxRate),
      },
      terms: {
        paymentTerms: "Net 30",
        warranty: "1 Year Parts & Labor",
        validDays: 30,
        assumptions: [
          "Pricing based on inspection findings",
          "Access to all areas required during normal business hours",
          "Existing wiring and infrastructure in serviceable condition",
        ],
        disclaimers: [
          "Quote valid for 30 days",
          "Additional deficiencies may require separate quote",
          "Final pricing may vary based on site conditions",
        ],
      },
    });

    // Link deficiencies to the quote
    await linkDeficienciesToQuote(deficiency_ids, quote.id);

    // Update inspection with quote reference
    // await updateInspection(inspection_id, { quote_id: quote.id });

    return NextResponse.json({
      data: quote,
      message: `Quote generated with ${deficiencies.length} line items from deficiencies`,
    }, { status: 201 });
  } catch (error) {
    console.error("Error generating quote from deficiencies:", error);
    return NextResponse.json(
      { error: "Failed to generate quote" },
      { status: 500 }
    );
  }
}
