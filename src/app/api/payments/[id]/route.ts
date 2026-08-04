import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAuth } from "@/lib/auth";

// DELETE: Remove a recorded payment (admin only) and roll back the amount that
// was applied to its invoice, so invoice balances stay correct.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only admins can delete payments" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data: payment, error: fetchError } = await supabaseAdmin
      .from("payments")
      .select("id, amount, invoice_id")
      .eq("id", id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin.from("payments").delete().eq("id", id);
    if (error) {
      console.error("Error deleting payment:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Un-apply it from the invoice.
    if (payment.invoice_id) {
      const { data: invoice } = await supabaseAdmin
        .from("invoices")
        .select("total, amount_paid")
        .eq("id", payment.invoice_id)
        .single();

      if (invoice) {
        const amountPaid = Math.max(0, (invoice.amount_paid || 0) - (payment.amount || 0));
        await supabaseAdmin
          .from("invoices")
          .update({
            amount_paid: amountPaid,
            status: amountPaid <= 0 ? "sent" : amountPaid < invoice.total ? "partial" : "paid",
          })
          .eq("id", payment.invoice_id);
      }
    }

    return NextResponse.json({ success: true, message: "Payment deleted" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}
