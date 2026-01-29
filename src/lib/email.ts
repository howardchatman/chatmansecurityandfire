import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "Chatman Security & Fire <notifications@chatmansecurityandfire.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "howardchatman@icloud.com";

// ============================================
// EMAIL TEMPLATES
// ============================================

export const emailTemplates = {
  // New lead notification to admin
  newLeadNotification: (lead: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
    source: string;
  }) => ({
    subject: `New Lead: ${lead.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ea580c; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Lead Received</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #111827; margin-top: 0;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <a href="mailto:${lead.email}" style="color: #ea580c;">${lead.email}</a>
              </td>
            </tr>
            ${lead.phone ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Phone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <a href="tel:${lead.phone}" style="color: #ea580c;">${lead.phone}</a>
              </td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Source:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${lead.source}</td>
            </tr>
          </table>
          ${lead.message ? `
          <h3 style="color: #111827; margin-top: 20px;">Message</h3>
          <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${lead.message}
          </div>
          ` : ""}
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://chatmansecurityandfire.com/admin/leads"
               style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View in Dashboard
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          Chatman Security & Fire | Houston, TX
        </div>
      </div>
    `,
  }),

  // Access request notification to admin
  accessRequestNotification: (request: {
    name: string;
    email: string;
    company: string;
    reason?: string;
  }) => ({
    subject: `Portal Access Request: ${request.name} (${request.company})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Portal Access Request</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #111827; margin-top: 0;">Request Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${request.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Company:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${request.company}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                <a href="mailto:${request.email}" style="color: #7c3aed;">${request.email}</a>
              </td>
            </tr>
          </table>
          ${request.reason ? `
          <h3 style="color: #111827; margin-top: 20px;">Reason for Access</h3>
          <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${request.reason}
          </div>
          ` : ""}
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://chatmansecurityandfire.com/admin/leads?source=account_request"
               style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Review Request
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          Chatman Security & Fire | Houston, TX
        </div>
      </div>
    `,
  }),

  // Quote email to customer
  quoteEmail: (data: {
    customerName: string;
    quoteNumber: string;
    total: string;
    description: string;
    viewUrl: string;
  }) => ({
    subject: `Your Quote #${data.quoteNumber} from Chatman Security & Fire`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ea580c; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Your Quote is Ready</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="color: #374151; font-size: 16px;">Hi ${data.customerName},</p>
          <p style="color: #374151; font-size: 16px;">
            Thank you for your interest in Chatman Security & Fire. We've prepared a quote for you:
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #6b7280;">Quote Number:</td>
                <td style="text-align: right; font-weight: bold;">#${data.quoteNumber}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding-top: 10px;">Description:</td>
                <td style="text-align: right; padding-top: 10px;">${data.description}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding-top: 10px; font-size: 18px;">Total:</td>
                <td style="text-align: right; padding-top: 10px; font-size: 24px; font-weight: bold; color: #ea580c;">${data.total}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center;">
            <a href="${data.viewUrl}"
               style="display: inline-block; background-color: #ea580c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View & Accept Quote
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            This quote is valid for 30 days. Questions? Reply to this email or call (832) 430-1826.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          Chatman Security & Fire | Houston, TX<br>
          (832) 430-1826 | info@chatmansecurityandfire.com
        </div>
      </div>
    `,
  }),

  // Invoice email to customer
  invoiceEmail: (data: {
    customerName: string;
    invoiceNumber: string;
    total: string;
    dueDate: string;
    description: string;
    payUrl: string;
  }) => ({
    subject: `Invoice #${data.invoiceNumber} from Chatman Security & Fire`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #111827; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Invoice</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="color: #374151; font-size: 16px;">Hi ${data.customerName},</p>
          <p style="color: #374151; font-size: 16px;">
            Please find your invoice below. Thank you for your business!
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="color: #6b7280;">Invoice Number:</td>
                <td style="text-align: right; font-weight: bold;">#${data.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding-top: 10px;">Description:</td>
                <td style="text-align: right; padding-top: 10px;">${data.description}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding-top: 10px;">Due Date:</td>
                <td style="text-align: right; padding-top: 10px; font-weight: bold; color: #dc2626;">${data.dueDate}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 15px; border-top: 2px solid #e5e7eb; margin-top: 15px;"></td>
              </tr>
              <tr>
                <td style="color: #111827; font-size: 18px; font-weight: bold;">Amount Due:</td>
                <td style="text-align: right; font-size: 28px; font-weight: bold; color: #111827;">${data.total}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center;">
            <a href="${data.payUrl}"
               style="display: inline-block; background-color: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Pay Invoice
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            Questions about this invoice? Reply to this email or call (832) 430-1826.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          Chatman Security & Fire | Houston, TX<br>
          (832) 430-1826 | info@chatmansecurityandfire.com
        </div>
      </div>
    `,
  }),

  // Customer confirmation email
  customerConfirmation: (data: {
    customerName: string;
    service?: string;
  }) => ({
    subject: `We received your request - Chatman Security & Fire`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ea580c; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Request Received</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="color: #374151; font-size: 16px;">Hi ${data.customerName},</p>
          <p style="color: #374151; font-size: 16px;">
            Thank you for reaching out to Chatman Security & Fire. We've received your request${data.service ? ` for <strong>${data.service}</strong>` : ""} and a team member will be in touch within 24 hours.
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #374151; font-size: 14px; margin: 0 0 10px 0;"><strong>Need immediate help?</strong></p>
            <p style="color: #374151; font-size: 14px; margin: 0;">
              Call us directly at <a href="tel:+18324301826" style="color: #ea580c; font-weight: bold;">(832) 430-1826</a>
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">
              We offer 24/7 emergency service for urgent fire safety needs.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://www.chatmansecurityandfire.com"
               style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Visit Our Website
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          Chatman Security & Fire | Houston, TX<br>
          (832) 430-1826 | info@chatmansecurityandfire.com
        </div>
      </div>
    `,
  }),

  // Access granted email to customer
  accessGrantedEmail: (data: {
    customerName: string;
    portalUrl: string;
  }) => ({
    subject: `Your Chatman Security & Fire Portal Access`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #16a34a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Your Customer Portal</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="color: #374151; font-size: 16px;">Hi ${data.customerName},</p>
          <p style="color: #374151; font-size: 16px;">
            Great news! Your access to the Chatman Security & Fire customer portal has been approved.
          </p>
          <p style="color: #374151; font-size: 16px;">
            You can now view your quotes, invoices, and project status online.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.portalUrl}"
               style="display: inline-block; background-color: #ea580c; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
              Access Your Portal
            </a>
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Your portal link:</strong><br>
              <a href="${data.portalUrl}" style="color: #ea580c; word-break: break-all;">${data.portalUrl}</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 10px; margin-bottom: 0;">
              Save this link - it's your personal access to the portal.
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            Questions? Reply to this email or call (832) 430-1826.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          Chatman Security & Fire | Houston, TX<br>
          (832) 430-1826 | info@chatmansecurityandfire.com
        </div>
      </div>
    `,
  }),
};

// ============================================
// SEND FUNCTIONS
// ============================================

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error("[Email] Error sending:", error);
      throw error;
    }

    console.log("[Email] Sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return { success: false, error };
  }
}

export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source: string;
}) {
  const template = emailTemplates.newLeadNotification(lead);
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
    replyTo: lead.email,
  });
}

export async function sendAccessRequestNotification(request: {
  name: string;
  email: string;
  company: string;
  reason?: string;
}) {
  const template = emailTemplates.accessRequestNotification(request);
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
    replyTo: request.email,
  });
}

export async function sendQuoteEmail(data: {
  customerEmail: string;
  customerName: string;
  quoteNumber: string;
  total: string;
  description: string;
  viewUrl: string;
}) {
  const template = emailTemplates.quoteEmail({
    customerName: data.customerName,
    quoteNumber: data.quoteNumber,
    total: data.total,
    description: data.description,
    viewUrl: data.viewUrl,
  });
  return sendEmail({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendInvoiceEmail(data: {
  customerEmail: string;
  customerName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  description: string;
  payUrl: string;
}) {
  const template = emailTemplates.invoiceEmail({
    customerName: data.customerName,
    invoiceNumber: data.invoiceNumber,
    total: data.total,
    dueDate: data.dueDate,
    description: data.description,
    payUrl: data.payUrl,
  });
  return sendEmail({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendAccessGrantedEmail(data: {
  customerEmail: string;
  customerName: string;
  portalUrl: string;
}) {
  const template = emailTemplates.accessGrantedEmail({
    customerName: data.customerName,
    portalUrl: data.portalUrl,
  });
  return sendEmail({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendCustomerConfirmation(data: {
  customerEmail: string;
  customerName: string;
  service?: string;
}) {
  const template = emailTemplates.customerConfirmation({
    customerName: data.customerName,
    service: data.service,
  });
  return sendEmail({
    to: data.customerEmail,
    subject: template.subject,
    html: template.html,
  });
}
