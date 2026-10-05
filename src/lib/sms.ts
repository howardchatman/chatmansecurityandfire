/**
 * Outbound texts, sent through Twilio.
 *
 * The sending number is the Twilio line (TWILIO_FROM_NUMBER). Until its
 * A2P/10DLC registration is approved and the TWILIO_* vars are set, texts are
 * skipped and logged — never thrown — so a missing text can't fail the job
 * update, invoice, or lead that triggered it. Lead alerts still reach the
 * owner by email in the meantime.
 *
 * Transactional messages only: job scheduling, progress, completion, billing.
 * Marketing to contacts who never opted in is not covered by the registration
 * and risks the number.
 */

export type SmsResult = { sent: boolean; provider: string; reason?: string };

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER
  );
}

function toE164(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return trimmed;
}

async function sendViaTwilio(to: string, message: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: toE164(to), From: from, Body: message }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[SMS/twilio] ${res.status}: ${err.slice(0, 200)}`);
    return { sent: false, provider: "twilio", reason: `Twilio returned ${res.status}` };
  }

  console.log("[SMS/twilio] sent to", toE164(to));
  return { sent: true, provider: "twilio" };
}

export async function sendSms(opts: {
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
}): Promise<SmsResult> {
  if (!opts.phone) return { sent: false, provider: "none", reason: "no phone number on file" };

  if (!twilioConfigured()) {
    console.warn("[SMS] Twilio not configured — text skipped");
    return { sent: false, provider: "none", reason: "Twilio not configured" };
  }

  try {
    return await sendViaTwilio(opts.phone, opts.message);
  } catch (err) {
    console.error("[SMS/twilio] threw:", err);
    return { sent: false, provider: "twilio", reason: "send failed" };
  }
}

/**
 * Message bodies, kept together so the wording can be reviewed in one place
 * rather than hunted through route handlers.
 *
 * Deliberately short — one SMS segment is 160 characters, and anything longer
 * is billed and delivered as multiple messages.
 */
export const smsTemplates = {
  jobScheduled: (date: string) =>
    `Chatman Security & Fire: you're scheduled for ${date}. We'll text if anything changes. Questions? Call (346) 852-5540. Reply STOP to opt out.`,

  jobUpdate: (update: string) =>
    `Chatman Security & Fire update: ${update} Reply STOP to opt out.`,

  jobComplete: () =>
    `Chatman Security & Fire: your work is complete. Your invoice is on its way by email. Questions? (346) 852-5540. Reply STOP to opt out.`,

  invoiceSent: (invoiceNumber: string, total: string, payUrl: string) =>
    `Chatman Security & Fire: invoice ${invoiceNumber} for ${total} is ready. Pay here: ${payUrl} Reply STOP to opt out.`,
};

/**
 * Text the owner the moment a lead comes in.
 *
 * Email to iCloud gets spam-filtered; a text does not. Set OWNER_ALERT_PHONE to
 * change where alerts land; it defaults to the business cell.
 *
 * Fire-and-forget: a failed alert must never stop a lead being saved. Callers
 * still .catch().
 */
export async function notifyOwnerOfLead(lead: {
  name: string;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  message?: string | null;
}): Promise<SmsResult> {
  const to = process.env.OWNER_ALERT_PHONE || "+13468525540";
  const parts = [
    `New lead: ${lead.name}`,
    lead.phone ? `📞 ${lead.phone}` : "no phone",
    lead.source ? `via ${lead.source}` : null,
  ].filter(Boolean);
  let body = parts.join(" · ");
  if (lead.message) body += `\n"${lead.message.slice(0, 120)}"`;

  return sendSms({ name: "CSF Lead Alert", phone: to, message: body });
}
