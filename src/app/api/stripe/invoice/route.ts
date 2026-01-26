import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateStripeCustomer,
  createInvoice,
  createDepositInvoice,
  createBalanceInvoice,
  sendInvoice,
  centsFromDollars,
  formatAmount,
} from "@/lib/stripe";
import { sendInvoiceEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = "full", // "full", "deposit", "balance"
      customerEmail,
      customerName,
      customerPhone,
      description,
      amount, // in dollars
      depositPercent = 50, // for deposit invoices
      originalInvoiceId, // for balance invoices
      sendEmail = true,
      customerId, // optional - if customer already exists in Stripe
    } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !description || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: customerEmail, customerName, description, amount" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = customerId;
    if (!stripeCustomerId) {
      const customer = await getOrCreateStripeCustomer({
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
      });
      stripeCustomerId = customer.id;
    }

    const amountInCents = centsFromDollars(amount);
    let invoice;
    let invoiceData: {
      invoiceId: string;
      invoiceNumber: string;
      hostedUrl: string;
      pdfUrl: string;
      amountDue: number;
      amountDueFormatted: string;
      type: string;
      depositAmount?: number;
      balanceAmount?: number;
    };

    switch (type) {
      case "deposit": {
        const result = await createDepositInvoice({
          customerId: stripeCustomerId,
          projectDescription: description,
          totalAmount: amountInCents,
          depositPercent,
        });
        invoice = result.invoice;
        invoiceData = {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number || invoice.id,
          hostedUrl: invoice.hosted_invoice_url || "",
          pdfUrl: invoice.invoice_pdf || "",
          amountDue: result.depositAmount,
          amountDueFormatted: formatAmount(result.depositAmount),
          type: "deposit",
          depositAmount: result.depositAmount,
          balanceAmount: result.balanceAmount,
        };
        break;
      }

      case "balance": {
        if (!originalInvoiceId) {
          return NextResponse.json(
            { success: false, error: "originalInvoiceId required for balance invoices" },
            { status: 400 }
          );
        }
        invoice = await createBalanceInvoice({
          customerId: stripeCustomerId,
          projectDescription: description,
          balanceAmount: amountInCents,
          originalInvoiceId,
        });
        invoiceData = {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number || invoice.id,
          hostedUrl: invoice.hosted_invoice_url || "",
          pdfUrl: invoice.invoice_pdf || "",
          amountDue: amountInCents,
          amountDueFormatted: formatAmount(amountInCents),
          type: "balance",
        };
        break;
      }

      default: {
        // Full invoice
        invoice = await createInvoice({
          customerId: stripeCustomerId,
          items: [
            {
              description,
              amount: amountInCents,
            },
          ],
        });
        invoiceData = {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number || invoice.id,
          hostedUrl: invoice.hosted_invoice_url || "",
          pdfUrl: invoice.invoice_pdf || "",
          amountDue: amountInCents,
          amountDueFormatted: formatAmount(amountInCents),
          type: "full",
        };
      }
    }

    // Send invoice via Stripe
    await sendInvoice(invoice.id);

    // Also send via our email system if requested
    if (sendEmail && invoice.hosted_invoice_url) {
      const dueDate = invoice.due_date
        ? new Date(invoice.due_date * 1000).toLocaleDateString()
        : "Upon Receipt";

      sendInvoiceEmail({
        customerEmail,
        customerName,
        invoiceNumber: invoiceData.invoiceNumber,
        total: invoiceData.amountDueFormatted,
        dueDate,
        description: type === "deposit"
          ? `Deposit (${depositPercent}%) - ${description}`
          : description,
        payUrl: invoice.hosted_invoice_url,
      }).catch((err) => console.error("Failed to send invoice email:", err));
    }

    return NextResponse.json({
      success: true,
      data: {
        ...invoiceData,
        stripeCustomerId,
      },
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create invoice" },
      { status: 500 }
    );
  }
}
