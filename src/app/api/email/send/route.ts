import { NextRequest, NextResponse } from "next/server";
import { sendQuoteEmail, sendInvoiceEmail, sendEmail } from "@/lib/email";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Unauthenticated access here would let anyone send mail from our domain.
    const auth = await verifyAuth(request);
    if (!auth || !["admin", "manager"].includes(auth.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Email type is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "quote":
        if (!data.customerEmail || !data.customerName || !data.quoteNumber || !data.total) {
          return NextResponse.json(
            { success: false, error: "Missing required fields for quote email" },
            { status: 400 }
          );
        }
        result = await sendQuoteEmail({
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          quoteNumber: data.quoteNumber,
          total: data.total,
          description: data.description || "Fire & Life Safety Services",
          viewUrl: data.viewUrl || `https://www.chatmansecurityandfire.com/c/quotes/${data.quoteNumber}`,
        });
        break;

      case "invoice":
        if (!data.customerEmail || !data.customerName || !data.invoiceNumber || !data.total || !data.dueDate) {
          return NextResponse.json(
            { success: false, error: "Missing required fields for invoice email" },
            { status: 400 }
          );
        }
        result = await sendInvoiceEmail({
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          invoiceNumber: data.invoiceNumber,
          total: data.total,
          dueDate: data.dueDate,
          description: data.description || "Fire & Life Safety Services",
          payUrl: data.payUrl || `https://www.chatmansecurityandfire.com/c/invoices/${data.invoiceNumber}`,
        });
        break;

      case "custom":
        if (!data.to || !data.subject || !data.html) {
          return NextResponse.json(
            { success: false, error: "Missing required fields for custom email (to, subject, html)" },
            { status: 400 }
          );
        }
        result = await sendEmail({
          to: data.to,
          subject: data.subject,
          html: data.html,
          replyTo: data.replyTo,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: result.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
