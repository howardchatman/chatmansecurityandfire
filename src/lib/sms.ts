import { sendGhlSms } from "@/lib/gohighlevel";

/**
 * One way to send a text, two possible carriers behind it.
 *
 * Today the number's A2P/10DLC registration lives with GoHighLevel, so GHL is
 * the sender. If the number is ported back to Twilio, set the TWILIO_* vars and
 * this switches over — no route handler changes, and both can be configured at
 * once while a port is verified.
 *
 * Transactional messages only: job scheduling, progress, completion, billing.
 * Those are covered by the existing registration. Marketing to contacts who
 * never opted in is not, and risks the number.
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

  if (twilioConfigured()) {
    try {
      return await sendViaTwilio(opts.phone, opts.message);
    } catch (err) {
      console.error("[SMS/twilio] threw:", err);
      return { sent: false, provider: "twilio", reason: "send failed" };
    }
  }

  const r = await sendGhlSms(opts);
  return { ...r, provider: "gohighlevel" };
}

export { smsTemplates } from "@/lib/gohighlevel";
