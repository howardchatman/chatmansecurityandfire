import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createQuote } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";
import { createQuoteLink } from "@/lib/customer-links";
import { sendQuoteEmail } from "@/lib/email";
import type { ProposalDocument } from "@/lib/proposal-doc";

// POST {proposal_id} — sends a saved AI proposal draft to its customer:
//   1. turns it into a quote (one line per scope, the full agreement attached),
//   2. creates a review-and-sign link (which marks the quote sent),
//   3. emails the customer that link,
//   4. marks the proposal sent.
// Sending again reuses the same quote and emails a fresh link.

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

/**
 * The agreement as the customer may see it. The quote is readable by anyone
 * holding the sign link, so the internal build-up (per-part quantities and
 * unit costs) and the estimator-only gaps never leave the building.
 */
function customerCopy(doc: ProposalDocument): ProposalDocument {
  return {
    ...doc,
    scopes: doc.scopes.map((s) => ({ ...s, line_items: [] })),
    gaps: [],
  };
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth || !["admin", "manager"].includes(auth.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { proposal_id } = await request.json().catch(() => ({}));
  if (!proposal_id) {
    return NextResponse.json({ success: false, error: "Missing proposal_id" }, { status: 400 });
  }

  const { data: row } = await supabaseAdmin
    .from("proposal_history")
    .select("id, customer_id, proposal_data")
    .eq("id", proposal_id)
    .maybeSingle();
  if (!row) return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 });

  const pd = row.proposal_data || {};
  const doc = pd.document as ProposalDocument | undefined;
  if (!doc) {
    return NextResponse.json({ success: false, error: "This draft isn't finished yet." }, { status: 400 });
  }

  // An agreement with unpriced work prints "PRICING INCOMPLETE" on its face;
  // it isn't something a customer can sign.
  const unpriced = doc.scopes.flatMap((s) => s.unpriced || []);
  if (unpriced.length) {
    return NextResponse.json(
      {
        success: false,
        error: `This draft has ${unpriced.length} unpriced item${unpriced.length === 1 ? "" : "s"} (${unpriced
          .slice(0, 3)
          .join("; ")}${unpriced.length > 3 ? "; …" : ""}). Set those rates in Inventory, then draft it again before sending.`,
      },
      { status: 400 }
    );
  }
  if (!(doc.total > 0)) {
    return NextResponse.json({ success: false, error: "This draft has no total to send." }, { status: 400 });
  }

  const customerId = pd.customer_id || row.customer_id;
  if (!customerId) {
    return NextResponse.json(
      { success: false, error: "Link this draft to a customer first, then save it." },
      { status: 400 }
    );
  }
  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("name, company, email, phone, address, city, state, zip")
    .eq("id", customerId)
    .maybeSingle();
  if (!customer?.email) {
    return NextResponse.json(
      { success: false, error: "This customer has no email address. Add one on their customer page, then send." },
      { status: 400 }
    );
  }

  try {
    // Reuse the quote from an earlier send so the customer isn't left with two.
    let quoteId: string | undefined = pd.sent?.quote_id;
    let quoteNumber: string | undefined = pd.sent?.quote_number;

    if (quoteId) {
      const { data: existing } = await supabaseAdmin.from("quotes").select("status").eq("id", quoteId).maybeSingle();
      if (!existing) {
        quoteId = undefined; // the quote was deleted; make a new one
        quoteNumber = undefined;
      } else if (["accepted", "paid"].includes(existing.status)) {
        return NextResponse.json(
          { success: false, error: `The customer already signed quote ${quoteNumber}. Nothing to resend.` },
          { status: 400 }
        );
      }
    }

    if (!quoteId) {
      const total = Math.round(doc.total * 100) / 100;
      // One line per scope: the customer sees an all-inclusive price per scope.
      // unit_price/total are what the review-and-sign page reads.
      const lineItems = doc.scopes.map((s, i) => ({
        id: `scope-${i + 1}`,
        category: "Scope",
        name: s.title,
        description: s.price_qualifier ? `${s.title} (${s.price_qualifier})` : s.title,
        unit: "lump sum",
        quantity: 1,
        unitPrice: s.price,
        unit_price: s.price,
        total: s.price,
        taxable: false,
      }));
      const terms = {
        paymentTerms: "Per the attached agreement",
        warranty: "",
        validDays: doc.validity_days || 30,
        assumptions: [],
        disclaimers: doc.exclusions || [],
        // Rendered in full on the customer's review-and-sign page.
        proposal_document: customerCopy(doc),
        proposal_id: row.id,
      };
      const quote = await createQuote({
        quote_type: "proposal",
        template_name: doc.project_name,
        status: "draft",
        customer: {
          name: customer.name || customer.company || "Customer",
          company: customer.company || undefined,
          email: customer.email,
          phone: customer.phone || "",
          address: customer.address || undefined,
          city: customer.city || undefined,
          state: customer.state || undefined,
          zip: customer.zip || undefined,
        },
        site: {
          name: doc.project_name,
          address: customer.address || doc.project_address,
          city: customer.city || "",
          state: customer.state || "TX",
          zip: customer.zip || undefined,
          buildingType: doc.occupancy,
          squareFootage: doc.building_size,
        },
        line_items: lineItems,
        totals: {
          subtotal: total,
          subtotalLow: total,
          subtotalHigh: total,
          laborTotal: 0,
          materialsTotal: 0,
          tax: 0,
          taxRate: 0,
          total,
          totalLow: total,
          totalHigh: total,
        },
        terms,
        expires_at: new Date(Date.now() + (doc.validity_days || 30) * 86_400_000).toISOString(),
      });
      quoteId = quote.id;
      quoteNumber = quote.quote_number;
    }

    const { url } = await createQuoteLink({
      quoteId: quoteId!,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      createdBy: auth!.userId,
      teamId: auth!.teamId,
      expiresInDays: doc.validity_days || 30,
    });

    const result = await sendQuoteEmail({
      customerEmail: customer.email,
      customerName: customer.name || customer.company || "there",
      quoteNumber: quoteNumber!,
      total: usd(doc.total),
      description: doc.project_name,
      viewUrl: url,
    });
    const emailed = !!result?.success;

    const sent = {
      quote_id: quoteId,
      quote_number: quoteNumber,
      link_url: url,
      email: customer.email,
      sent_at: new Date().toISOString(),
      emailed,
    };
    await supabaseAdmin
      .from("proposal_history")
      .update({ status: "sent", proposal_data: { ...pd, sent } })
      .eq("id", row.id);

    return NextResponse.json({ success: true, data: sent });
  } catch (err) {
    console.error("Send proposal failed:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Couldn't send the proposal." },
      { status: 500 }
    );
  }
}
