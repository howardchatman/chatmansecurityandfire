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

function headers() {
  return {
    Authorization: `Bearer ${PIT_TOKEN}`,
    Version: API_VERSION,
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
  const phone = normalizePhone(lead.phone);
  if (phone) payload.phone = phone;

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
