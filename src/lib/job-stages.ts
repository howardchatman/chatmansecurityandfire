// Internal job statuses are granular (lead, quoted, approved, pending,
// scheduled, in_progress, awaiting_inspection, corrections_required, passed,
// completed, invoiced, paid, closed, on_hold, cancelled). A customer doesn't
// need — or want — that vocabulary. Collapse it into five plain stages, and
// keep the mapping in one place so the portal and any future status screen
// can't disagree about what "in progress" means.

export const CUSTOMER_STAGES = [
  { key: "quote", label: "Quote", blurb: "We're pricing your work, or your quote is waiting on you." },
  { key: "scheduled", label: "Scheduled", blurb: "We've got your work booked in." },
  { key: "in_progress", label: "In Progress", blurb: "Our crew is on the job." },
  { key: "inspection", label: "Inspection", blurb: "Awaiting inspection and sign-off." },
  { key: "complete", label: "Complete", blurb: "Work finished." },
] as const;

type StageKey = (typeof CUSTOMER_STAGES)[number]["key"];

interface Stage {
  key: StageKey;
  label: string;
  index: number;
  progress: number; // 0-100, for the bar
  isComplete: boolean;
  isOnHold: boolean;
  note: string | null;
  isWaitingOnPermit: boolean;
}

// A few statuses read better to a customer under their own name than under the
// generic stage label — most importantly the permit wait, which is where a job
// can legitimately sit for two weeks with nothing visible happening. Saying so
// plainly is what stops the "what's going on with my job?" phone call.
const STATUS_LABEL_OVERRIDE: Record<string, string> = {
  consultation_scheduled: "Consultation Scheduled",
  lead: "Request Received",
  quoted: "Quote Sent",
  agreement_sent: "Agreement Sent",
  approved: "Approved",
  permit_submitted: "Awaiting Permit",
  permit_approved: "Permit Approved",
  on_hold: "On Hold",
};

// Extra context shown under the stage for the states where a customer would
// otherwise wonder why nothing is moving.
export const STATUS_NOTE: Record<string, string> = {
  lead: "We've got your request and are putting your quote together.",
  consultation_scheduled: "We'll walk the site with you, then send your quote.",
  quoted: "Your quote is ready for review. Sign it to get on the schedule.",
  approved: "Quote approved. We're getting you on the schedule.",
  agreement_sent: "We've sent your agreement — work is booked once it's signed.",
  permit_submitted:
    "Plans are with the city for review. Permit approval typically takes 1–2 weeks, and we'll schedule as soon as it clears.",
  permit_approved: "Permit approved — we're getting you on the schedule.",
  corrections_required: "We're finishing up a few items from the inspection.",
  on_hold: "This job is paused. Call us and we'll bring you up to date.",
};

const STATUS_TO_STAGE: Record<string, { key: StageKey; progress: number }> = {
  // Quoting — nothing is booked until the customer signs.
  lead: { key: "quote", progress: 3 },
  consultation_scheduled: { key: "quote", progress: 6 },
  quoted: { key: "quote", progress: 10 },
  agreement_sent: { key: "quote", progress: 14 },

  // Signed and heading for the calendar.
  approved: { key: "scheduled", progress: 22 },
  // Permitting sits inside the first stage rather than adding a fifth one that
  // would be meaningless on the many jobs that need no permit at all.
  permit_submitted: { key: "scheduled", progress: 25 },
  permit_approved: { key: "scheduled", progress: 28 },
  pending: { key: "scheduled", progress: 22 },
  scheduled: { key: "scheduled", progress: 32 },

  in_progress: { key: "in_progress", progress: 55 },

  awaiting_inspection: { key: "inspection", progress: 75 },
  corrections_required: { key: "inspection", progress: 70 },
  passed: { key: "inspection", progress: 88 },

  completed: { key: "complete", progress: 100 },
  invoiced: { key: "complete", progress: 100 },
  paid: { key: "complete", progress: 100 },
  closed: { key: "complete", progress: 100 },

  on_hold: { key: "in_progress", progress: 45 },
  cancelled: { key: "complete", progress: 100 },
};

export function stageForStatus(status: string): Stage {
  const mapped = STATUS_TO_STAGE[status] || { key: "scheduled" as StageKey, progress: 25 };
  const index = CUSTOMER_STAGES.findIndex((s) => s.key === mapped.key);
  const def = CUSTOMER_STAGES[index];
  return {
    key: mapped.key,
    label: STATUS_LABEL_OVERRIDE[status] || def.label,
    index,
    progress: mapped.progress,
    isComplete: ["completed", "invoiced", "paid", "closed"].includes(status),
    isOnHold: status === "on_hold",
    note: STATUS_NOTE[status] || null,
    isWaitingOnPermit: status === "permit_submitted",
  };
}

/**
 * A quote that hasn't become a job yet, on the same tracker as jobs. Drafts
 * never reach the customer; everything else sits in the Quote stage until it
 * is signed, when it moves to Scheduled.
 */
export function stageForQuote(status: string): Stage & { needsSignature: boolean; isClosed: boolean } {
  const quoteIndex = CUSTOMER_STAGES.findIndex((s) => s.key === "quote");
  const scheduledIndex = CUSTOMER_STAGES.findIndex((s) => s.key === "scheduled");
  const base = {
    isComplete: false,
    isOnHold: false,
    isWaitingOnPermit: false,
    needsSignature: false,
    isClosed: false,
  };
  switch (status) {
    case "sent":
      return {
        ...base,
        key: "quote",
        label: "Quote Ready",
        index: quoteIndex,
        progress: 10,
        note: "Your quote is ready. Review it and sign to get on the schedule.",
        needsSignature: true,
      };
    case "viewed":
      return {
        ...base,
        key: "quote",
        label: "Awaiting Your Signature",
        index: quoteIndex,
        progress: 14,
        note: "You've opened your quote. Sign it whenever you're ready and we'll book the work.",
        needsSignature: true,
      };
    case "accepted":
    case "paid":
      return {
        ...base,
        key: "scheduled",
        label: "Approved",
        index: scheduledIndex,
        progress: 22,
        note: "Quote signed. We're getting you on the schedule.",
      };
    case "declined":
      return {
        ...base,
        key: "quote",
        label: "Declined",
        index: quoteIndex,
        progress: 10,
        note: "This quote was declined. Call us if you'd like to revisit it.",
        isClosed: true,
      };
    case "expired":
      return {
        ...base,
        key: "quote",
        label: "Expired",
        index: quoteIndex,
        progress: 10,
        note: "This quote has expired. Call us and we'll refresh the pricing.",
        isClosed: true,
      };
    default:
      return {
        ...base,
        key: "quote",
        label: "Preparing Quote",
        index: quoteIndex,
        progress: 5,
        note: "We're putting your quote together.",
      };
  }
}
