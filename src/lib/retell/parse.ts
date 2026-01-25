/**
 * Retell Webhook Parsing Utilities
 * Defensive parsing for various Retell payload formats
 */

// ============================================
// TYPES
// ============================================

export interface ParsedRetellPayload {
  callId: string;
  fromNumber: string | null;
  toNumber: string | null;
  status: string;
  transcript: string | null;
  summary: string | null;
  durationSeconds: number | null;
  startedAt: string | null;
  endedAt: string | null;
  extracted: ExtractedFields;
  rawPayload: Record<string, unknown>;
}

export interface ExtractedFields {
  callerName: string | null;
  callerEmail: string | null;
  callerPhone: string | null;
  company: string | null;
  propertyAddress: string | null;
  urgency: "high" | "normal" | "low";
  intent: "inspection" | "service" | "quote" | "callback" | "other";
  sentiment: "positive" | "neutral" | "negative";
  callbackRequested: boolean;
  transferRequested: boolean;
  notes: string | null;
}

// ============================================
// PHONE NORMALIZATION
// ============================================

/**
 * Normalize phone numbers to a consistent format
 * Strips spaces, dashes, parentheses; keeps +1 prefix
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, "");

  // If it's a 10-digit US number, add +1
  if (normalized.length === 10 && !normalized.startsWith("+")) {
    normalized = `+1${normalized}`;
  }

  // If it's 11 digits starting with 1, add +
  if (normalized.length === 11 && normalized.startsWith("1")) {
    normalized = `+${normalized}`;
  }

  // Return null if invalid
  if (normalized.length < 10) {
    return null;
  }

  return normalized;
}

// ============================================
// HIGH URGENCY DETECTION
// ============================================

const HIGH_URGENCY_KEYWORDS = [
  "fire marshal",
  "failed inspection",
  "red tag",
  "red tagged",
  "violation",
  "shut down",
  "shutdown",
  "emergency",
  "urgent",
  "immediately",
  "today",
  "asap",
  "deadline",
  "reinspection",
  "citation",
  "fire department",
  "condemned",
  "close",
  "closing",
  "certificate of occupancy",
  "co inspection",
  "cant open",
  "can't open",
  "cannot open",
];

/**
 * Check if text contains high urgency keywords
 */
export function detectHighUrgency(text: string | null | undefined): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return HIGH_URGENCY_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// ============================================
// INTENT DETECTION
// ============================================

const INTENT_PATTERNS: Record<string, string[]> = {
  inspection: [
    "inspection",
    "inspect",
    "fire marshal",
    "reinspection",
    "failed",
    "pass",
    "certificate",
    "code violation",
  ],
  service: [
    "service",
    "repair",
    "fix",
    "broken",
    "not working",
    "maintenance",
    "annual",
    "replace",
    "extinguisher",
  ],
  quote: [
    "quote",
    "estimate",
    "price",
    "cost",
    "how much",
    "pricing",
    "proposal",
    "bid",
  ],
  callback: [
    "call back",
    "callback",
    "call me back",
    "return call",
    "reach me",
    "contact me",
  ],
};

/**
 * Detect intent from text
 */
export function detectIntent(text: string | null | undefined): ExtractedFields["intent"] {
  if (!text) return "other";
  const lower = text.toLowerCase();

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some((pattern) => lower.includes(pattern))) {
      return intent as ExtractedFields["intent"];
    }
  }

  return "other";
}

// ============================================
// SENTIMENT DETECTION
// ============================================

const POSITIVE_WORDS = ["great", "thank", "thanks", "appreciate", "wonderful", "excellent", "good", "happy", "pleased"];
const NEGATIVE_WORDS = ["angry", "upset", "frustrated", "terrible", "awful", "worst", "disappointed", "unhappy", "mad"];

/**
 * Simple sentiment detection from text
 */
export function detectSentiment(text: string | null | undefined): ExtractedFields["sentiment"] {
  if (!text) return "neutral";
  const lower = text.toLowerCase();

  const positiveCount = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
  const negativeCount = NEGATIVE_WORDS.filter((w) => lower.includes(w)).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

// ============================================
// MAIN PARSER
// ============================================

/**
 * Defensively parse Retell webhook payload
 * Handles various payload formats and structures
 */
export function parseRetellPayload(body: Record<string, unknown>): ParsedRetellPayload {
  // Extract call ID (try multiple paths)
  const callId =
    (body.call_id as string) ||
    (body.call as Record<string, unknown>)?.id as string ||
    (body.id as string) ||
    `unknown_${Date.now()}`;

  // Extract phone numbers
  const fromNumber = normalizePhone(
    (body.from_number as string) ||
    (body.from as string) ||
    (body.caller as Record<string, unknown>)?.phone as string ||
    (body.call as Record<string, unknown>)?.from_number as string ||
    (body.call as Record<string, unknown>)?.from as string
  );

  const toNumber = normalizePhone(
    (body.to_number as string) ||
    (body.to as string) ||
    (body.call as Record<string, unknown>)?.to_number as string ||
    (body.call as Record<string, unknown>)?.to as string
  );

  // Extract status
  const status =
    (body.status as string) ||
    (body.call_status as string) ||
    (body.call as Record<string, unknown>)?.status as string ||
    (body.event as string) ||
    "in_progress";

  // Extract transcript
  const transcript =
    (body.transcript as string) ||
    (body.call as Record<string, unknown>)?.transcript as string ||
    (body.conversation as Record<string, unknown>)?.transcript as string ||
    null;

  // Extract summary
  const summary =
    (body.summary as string) ||
    (body.call as Record<string, unknown>)?.summary as string ||
    (body.call_analysis as Record<string, unknown>)?.summary as string ||
    null;

  // Extract duration
  const durationMs =
    (body.duration_ms as number) ||
    (body.call as Record<string, unknown>)?.duration_ms as number ||
    null;
  const durationSeconds = durationMs ? Math.round(durationMs / 1000) : null;

  // Extract timestamps
  const startedAt =
    (body.start_timestamp as string) ||
    (body.started_at as string) ||
    (body.call as Record<string, unknown>)?.start_timestamp as string ||
    null;

  const endedAt =
    (body.end_timestamp as string) ||
    (body.ended_at as string) ||
    (body.call as Record<string, unknown>)?.end_timestamp as string ||
    null;

  // Extract variables/fields (multiple possible locations)
  const extractedRaw =
    (body.extracted as Record<string, unknown>) ||
    (body.variables as Record<string, unknown>) ||
    (body.fields as Record<string, unknown>) ||
    (body.call as Record<string, unknown>)?.extracted as Record<string, unknown> ||
    (body.call as Record<string, unknown>)?.variables as Record<string, unknown> ||
    (body.call_analysis as Record<string, unknown>)?.custom_analysis as Record<string, unknown> ||
    {};

  // Parse extracted fields
  const callerName =
    (extractedRaw.caller_name as string) ||
    (extractedRaw.name as string) ||
    (extractedRaw.customer_name as string) ||
    null;

  const callerEmail =
    (extractedRaw.caller_email as string) ||
    (extractedRaw.email as string) ||
    (extractedRaw.customer_email as string) ||
    null;

  const callerPhone =
    normalizePhone(
      (extractedRaw.caller_phone as string) ||
      (extractedRaw.phone as string) ||
      (extractedRaw.customer_phone as string)
    ) || fromNumber;

  const company =
    (extractedRaw.company as string) ||
    (extractedRaw.company_name as string) ||
    (extractedRaw.business_name as string) ||
    null;

  const propertyAddress =
    (extractedRaw.property_address as string) ||
    (extractedRaw.address as string) ||
    (extractedRaw.site_address as string) ||
    (extractedRaw.location as string) ||
    null;

  // Detect urgency (from explicit field or keywords)
  let urgency: ExtractedFields["urgency"] = "normal";
  if (extractedRaw.urgency === "high" || detectHighUrgency(transcript) || detectHighUrgency(summary)) {
    urgency = "high";
  } else if (extractedRaw.urgency === "low") {
    urgency = "low";
  }

  // Detect intent
  const intent =
    (extractedRaw.intent as ExtractedFields["intent"]) ||
    detectIntent(transcript) ||
    detectIntent(summary);

  // Detect sentiment
  const sentimentRaw =
    (extractedRaw.sentiment as string) ||
    (body.call_analysis as Record<string, unknown>)?.sentiment as string;
  const sentiment =
    sentimentRaw === "positive" || sentimentRaw === "negative"
      ? sentimentRaw
      : detectSentiment(transcript);

  // Callback/transfer requested
  const callbackRequested =
    (extractedRaw.callback_requested as boolean) ||
    (extractedRaw.schedule_callback as boolean) ||
    (body.event === "callback_requested") ||
    false;

  const transferRequested =
    (extractedRaw.transfer_requested as boolean) ||
    (extractedRaw.transfer_to_human as boolean) ||
    (body.event === "transfer_requested") ||
    false;

  // Notes
  const notes =
    (extractedRaw.notes as string) ||
    (extractedRaw.additional_notes as string) ||
    (extractedRaw.caller_notes as string) ||
    null;

  return {
    callId,
    fromNumber,
    toNumber,
    status: normalizeStatus(status),
    transcript,
    summary,
    durationSeconds,
    startedAt: startedAt ? new Date(Number(startedAt) || startedAt).toISOString() : null,
    endedAt: endedAt ? new Date(Number(endedAt) || endedAt).toISOString() : null,
    extracted: {
      callerName,
      callerEmail,
      callerPhone,
      company,
      propertyAddress,
      urgency,
      intent,
      sentiment,
      callbackRequested,
      transferRequested,
      notes,
    },
    rawPayload: body,
  };
}

/**
 * Normalize status to our standard values
 */
function normalizeStatus(status: string): string {
  const lower = status.toLowerCase();

  if (lower.includes("start") || lower === "call_started") return "started";
  if (lower.includes("progress") || lower === "in_progress") return "in_progress";
  if (lower.includes("end") || lower === "call_ended" || lower === "completed") return "ended";
  if (lower.includes("fail") || lower === "error") return "failed";

  return lower;
}

/**
 * Determine event type from payload
 */
export function determineEventType(body: Record<string, unknown>, parsedStatus: string): string {
  // Check explicit event field
  const event = body.event as string;
  if (event) {
    if (event === "call_started") return "call_started";
    if (event === "call_ended" || event === "call_analyzed") return "call_ended";
    if (event === "callback_requested") return "callback_requested";
    if (event === "transfer_requested") return "transfer_requested";
    return event;
  }

  // Infer from status
  if (parsedStatus === "started") return "call_started";
  if (parsedStatus === "ended") return "call_ended";
  if (parsedStatus === "failed") return "error";

  // Check for extraction data
  if (body.extracted || body.variables || body.fields) return "extraction";

  return "update";
}
