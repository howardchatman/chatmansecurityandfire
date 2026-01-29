import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return _stripe;
}

const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ============================================
// CUSTOMERS
// ============================================

export async function createStripeCustomer(data: {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}) {
  const customer = await stripe.customers.create({
    email: data.email,
    name: data.name,
    phone: data.phone,
    metadata: data.metadata,
  });
  return customer;
}

export async function getOrCreateStripeCustomer(data: {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}) {
  // Check if customer already exists
  const existing = await stripe.customers.list({
    email: data.email,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0];
  }

  return createStripeCustomer(data);
}

// ============================================
// INVOICES
// ============================================

export interface InvoiceLineItem {
  description: string;
  amount: number; // in cents
  quantity?: number;
}

export async function createInvoice(data: {
  customerId: string;
  items: InvoiceLineItem[];
  dueDate?: Date;
  memo?: string;
  metadata?: Record<string, string>;
}) {
  // Create invoice items
  for (const item of data.items) {
    await stripe.invoiceItems.create({
      customer: data.customerId,
      amount: item.amount,
      currency: "usd",
      description: item.description,
    });
  }

  // Create the invoice
  const invoice = await stripe.invoices.create({
    customer: data.customerId,
    collection_method: "send_invoice",
    due_date: data.dueDate
      ? Math.floor(data.dueDate.getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days default
    description: data.memo,
    metadata: data.metadata,
  });

  // Finalize the invoice
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  return finalizedInvoice;
}

// ============================================
// DEPOSIT INVOICES (Split Payments)
// ============================================

export async function createDepositInvoice(data: {
  customerId: string;
  projectDescription: string;
  totalAmount: number; // in cents
  depositPercent: number; // e.g., 50 for 50%
  metadata?: Record<string, string>;
}) {
  const depositAmount = Math.round(data.totalAmount * (data.depositPercent / 100));

  // Create deposit invoice item
  await stripe.invoiceItems.create({
    customer: data.customerId,
    amount: depositAmount,
    currency: "usd",
    description: `Deposit (${data.depositPercent}%) - ${data.projectDescription}`,
  });

  // Create the deposit invoice
  const invoice = await stripe.invoices.create({
    customer: data.customerId,
    collection_method: "send_invoice",
    due_date: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days for deposit
    description: `Deposit for: ${data.projectDescription}`,
    metadata: {
      ...data.metadata,
      type: "deposit",
      total_project_amount: String(data.totalAmount),
      deposit_percent: String(data.depositPercent),
    },
  });

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  return {
    invoice: finalizedInvoice,
    depositAmount,
    balanceAmount: data.totalAmount - depositAmount,
  };
}

export async function createBalanceInvoice(data: {
  customerId: string;
  projectDescription: string;
  balanceAmount: number; // in cents
  originalInvoiceId?: string;
  metadata?: Record<string, string>;
}) {
  // Create balance invoice item
  await stripe.invoiceItems.create({
    customer: data.customerId,
    amount: data.balanceAmount,
    currency: "usd",
    description: `Balance Due - ${data.projectDescription}`,
  });

  // Create the balance invoice
  const invoice = await stripe.invoices.create({
    customer: data.customerId,
    collection_method: "send_invoice",
    due_date: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    description: `Final Balance: ${data.projectDescription}`,
    metadata: {
      ...data.metadata,
      type: "balance",
      original_deposit_invoice: data.originalInvoiceId || "",
    },
  });

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  return finalizedInvoice;
}

// ============================================
// PAYMENT LINKS (Quick Payments)
// ============================================

export async function createPaymentLink(data: {
  amount: number; // in cents
  description: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  // Create a price for this one-time payment
  const price = await stripe.prices.create({
    unit_amount: data.amount,
    currency: "usd",
    product_data: {
      name: data.description,
    },
  });

  // Create the payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: data.metadata,
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    customer_creation: "if_required",
    ...(data.customerEmail && {
      custom_fields: [],
    }),
  });

  return paymentLink;
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

export async function sendInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.sendInvoice(invoiceId);
  return invoice;
}

export async function getInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice;
}

export async function voidInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.voidInvoice(invoiceId);
  return invoice;
}

export async function listCustomerInvoices(customerId: string) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 100,
  });
  return invoices.data;
}

// ============================================
// HELPERS
// ============================================

export function formatAmount(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function centsFromDollars(dollars: number): number {
  return Math.round(dollars * 100);
}

export { stripe };
