// GoHighLevel is the single source of truth for CRM / leads / sales pipeline.
// Every lead captured by a site form (contact, service pages, /start,
// sell-your-accounts, etc.) is pushed here so it lands in GHL alongside the
// leads that come from the embedded GHL RFQ form and the chat widget.
//
// Uses a Private Integration Token (PIT). Requires two env vars:
//   GHL_PIT_TOKEN    e.g. pit-xxxxxxxx-...
//   GHL_LOCATION_ID  the sub-account (location) id

const PIT_TOKEN = process.env.GHL_PIT_TOKEN;
const LOCATION_ID = process.env.GHL_LOCATION_ID;
const BASE_URL = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

interface GhlLead {
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string;
  tags?: (string | undefined | null)[];
  note?: string;
}

// The conversations endpoints are pinned to a different API version than the
// contacts endpoints; sending with the contacts version is rejected.
const CONVERSATIONS_VERSION = "2021-04-15";

function headers(version: string = API_VERSION) {
  return {
    Authorization: `Bearer ${PIT_TOKEN}`,
    Version: version,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// GHL prefers E.164. Normalize simple US 10-digit input to +1XXXXXXXXXX;
// leave anything already prefixed / non-standard untouched.
function normalizePhone(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return trimmed;
}


/**
 * The phone already stored against this email, if any.
 * Used so an upsert never replaces a working number with a worse one.
 */
async function findExistingPhone(email: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/contacts/?locationId=${LOCATION_ID}&query=${encodeURIComponent(email)}&limit=5`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const match = (json?.contacts ?? []).find(
      (c: { email?: string; phone?: string }) =>
        (c.email || "").toLowerCase() === email.toLowerCase() && c.phone
    );
    return match?.phone ?? null;
  } catch (err) {
    // A lookup failure must not stop the contact being saved; fall back to the
    // previous behaviour of just writing what we have.
    console.error("[GHL] phone lookup failed:", err);
    return null;
  }
}

/**
 * Create or update a contact in GoHighLevel and (optionally) attach a note
 * with the lead's message. Dedupes on email/phone via the upsert endpoint.
 * Never throws in a way that blocks the caller — callers should still .catch().
 */
export async function upsertGhlContact(lead: GhlLead): Promise<string | null> {
  if (!PIT_TOKEN || !LOCATION_ID) {
    console.warn("[GHL] GHL_PIT_TOKEN or GHL_LOCATION_ID not set — skipping");
    return null;
  }

  const [firstName, ...rest] = lead.name.trim().split(" ");
  const lastName = rest.join(" ") || undefined;
  const tags = ["Website Lead", ...(lead.tags ?? [])].filter(Boolean) as string[];

  const payload: Record<string, unknown> = {
    locationId: LOCATION_ID,
    firstName,
    lastName,
    name: lead.name,
    source: lead.source || "website",
    tags,
  };
  if (lead.email) payload.email = lead.email;

  // Only set the phone when the contact doesn't already have one.
  //
  // The upsert matches on email, and GHL overwrites whatever it is given — so a
  // later form submission with a typo, or a test with a placeholder, replaces a
  // good mobile we already had. Worse, an unreachable number makes the carrier
  // reject the send and GHL then flags the contact SMS Do-Not-Disturb, silently
  // cutting off every future text to that customer.
  const phone = normalizePhone(lead.phone);
  if (phone) {
    const existingPhone = lead.email ? await findExistingPhone(lead.email) : null;
    if (!existingPhone) {
      payload.phone = phone;
    } else if (existingPhone !== phone) {
      console.log(
        `[GHL] keeping the phone already on ${lead.email} (${existingPhone}) rather than overwriting with ${phone}`
      );
    }
  }

  const res = await fetch(`${BASE_URL}/contacts/upsert`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GHL upsert contact failed: ${res.status} ${err}`);
  }

  const json = await res.json();
  const contactId: string | undefined = json?.contact?.id || json?.id;
  console.log("[GHL] Contact upserted:", contactId, json?.new ? "(new)" : "(existing)");

  // Attach the lead's message as a note so Howard sees the details in GHL.
  if (contactId && lead.note) {
    const noteRes = await fetch(`${BASE_URL}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ body: lead.note }),
    });
    if (!noteRes.ok) {
      const err = await noteRes.text();
      console.error(`[GHL] add note failed: ${noteRes.status} ${err}`);
    } else {
      console.log("[GHL] Note added to contact:", contactId);
    }
  }

  return contactId ?? null;
}

/**
 * Send a transactional SMS through GoHighLevel.
 *
 * GHL is the sender because the business's number is already A2P/TCR
 * registered and approved there — going direct to a carrier would mean a new
 * number and weeks of re-registration.
 *
 * Only ever call this for job and billing updates to an existing customer.
 * Those are transactional and covered by the registration; marketing blasts to
 * imported contacts who never opted in are not, and would put the number at
 * risk.
 *
 * Never throws in a way that blocks the caller — a failed text must not stop an
 * invoice going out. Callers should still .catch().
 */
export async function sendGhlSms(opts: {
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!PIT_TOKEN || !LOCATION_ID) {
    return { sent: false, reason: "GHL not configured" };
  }
  if (!opts.phone) {
    return { sent: false, reason: "no phone number on file" };
  }

  // Upserting resolves the contact id and is idempotent, so the same call works
  // whether or not this person is already in the CRM.
  let contactId: string | null;
  try {
    contactId = await upsertGhlContact({
      name: opts.name,
      phone: opts.phone,
      email: opts.email,
      source: "job_update",
    });
  } catch (err) {
    console.error("[GHL SMS] could not resolve contact:", err);
    return { sent: false, reason: "could not resolve contact" };
  }

  if (!contactId) return { sent: false, reason: "no contact id" };

  const res = await fetch(`${BASE_URL}/conversations/messages`, {
    method: "POST",
    headers: headers(CONVERSATIONS_VERSION),
    body: JSON.stringify({
      type: "SMS",
      contactId,
      message: opts.message,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[GHL SMS] send failed ${res.status}: ${err.slice(0, 200)}`);
    return { sent: false, reason: `GHL returned ${res.status}` };
  }

  console.log("[GHL SMS] sent to", contactId);
  return { sent: true };
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
    `Chatman Security & Fire: you're scheduled for ${date}. We'll text if anything changes. Questions? Call (832) 859-7009. Reply STOP to opt out.`,

  jobUpdate: (update: string) =>
    `Chatman Security & Fire update: ${update} Reply STOP to opt out.`,

  jobComplete: () =>
    `Chatman Security & Fire: your work is complete. Your invoice is on its way by email. Questions? (832) 859-7009. Reply STOP to opt out.`,

  invoiceSent: (invoiceNumber: string, total: string, payUrl: string) =>
    `Chatman Security & Fire: invoice ${invoiceNumber} for ${total} is ready. Pay here: ${payUrl} Reply STOP to opt out.`,
};
