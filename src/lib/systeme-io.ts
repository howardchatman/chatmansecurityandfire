const API_KEY = process.env.SYSTEME_IO_API_KEY;
const CAMPAIGN_ID = process.env.SYSTEME_IO_CAMPAIGN_ID;
const BASE_URL = "https://api.systeme.io/api";

interface SystemeIoContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
}

export async function addContactToSystemeIo(contact: SystemeIoContact) {
  if (!API_KEY) {
    console.warn("[Systeme.io] SYSTEME_IO_API_KEY not set — skipping");
    return;
  }

  // 1. Create or update the contact
  const contactRes = await fetch(`${BASE_URL}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": API_KEY,
    },
    body: JSON.stringify({
      email: contact.email,
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      phoneNumber: contact.phone || "",
      fields: [],
      tags: contact.tags?.filter(Boolean).map((tag) => ({ name: tag })) ?? [],
    }),
  });

  if (!contactRes.ok) {
    const err = await contactRes.text();
    throw new Error(`Systeme.io create contact failed: ${contactRes.status} ${err}`);
  }

  const { id: contactId } = await contactRes.json();
  console.log("[Systeme.io] Contact created/updated:", contactId);

  // 2. Enroll in automation campaign (if configured)
  if (CAMPAIGN_ID && contactId) {
    const enrollRes = await fetch(
      `${BASE_URL}/contacts/${contactId}/campaigns/${CAMPAIGN_ID}/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": API_KEY,
        },
      }
    );

    if (!enrollRes.ok) {
      const err = await enrollRes.text();
      throw new Error(`Systeme.io campaign enroll failed: ${enrollRes.status} ${err}`);
    }

    console.log("[Systeme.io] Enrolled in campaign:", CAMPAIGN_ID);
  }
}
