// Internal job statuses are granular (lead, quoted, approved, pending,
// scheduled, in_progress, awaiting_inspection, corrections_required, passed,
// completed, invoiced, paid, closed, on_hold, cancelled). A customer doesn't
// need — or want — that vocabulary. Collapse it into four plain stages, and
// keep the mapping in one place so the portal and any future status screen
// can't disagree about what "in progress" means.

export const CUSTOMER_STAGES = [
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
  quoted: "Quote Sent",
  agreement_sent: "Agreement Sent",
  permit_submitted: "Awaiting Permit",
  permit_approved: "Permit Approved",
  on_hold: "On Hold",
};

// Extra context shown under the stage for the states where a customer would
// otherwise wonder why nothing is moving.
export const STATUS_NOTE: Record<string, string> = {
  agreement_sent: "We've sent your agreement — work is booked once it's signed.",
  permit_submitted:
    "Plans are with the city for review. Permit approval typically takes 1–2 weeks, and we'll schedule as soon as it clears.",
  permit_approved: "Permit approved — we're getting you on the schedule.",
  corrections_required: "We're finishing up a few items from the inspection.",
  on_hold: "This job is paused. Call us and we'll bring you up to date.",
};

const STATUS_TO_STAGE: Record<string, { key: StageKey; progress: number }> = {
  // Pre-work — the customer still reads this as "booked with us"
  lead: { key: "scheduled", progress: 5 },
  consultation_scheduled: { key: "scheduled", progress: 8 },
  quoted: { key: "scheduled", progress: 10 },
  agreement_sent: { key: "scheduled", progress: 12 },
  approved: { key: "scheduled", progress: 15 },
  // Permitting sits inside the first stage rather than adding a fifth one that
  // would be meaningless on the many jobs that need no permit at all.
  permit_submitted: { key: "scheduled", progress: 18 },
  permit_approved: { key: "scheduled", progress: 22 },
  pending: { key: "scheduled", progress: 15 },
  scheduled: { key: "scheduled", progress: 25 },

  in_progress: { key: "in_progress", progress: 50 },

  awaiting_inspection: { key: "inspection", progress: 70 },
  corrections_required: { key: "inspection", progress: 65 },
  passed: { key: "inspection", progress: 85 },

  completed: { key: "complete", progress: 100 },
  invoiced: { key: "complete", progress: 100 },
  paid: { key: "complete", progress: 100 },
  closed: { key: "complete", progress: 100 },

  on_hold: { key: "in_progress", progress: 40 },
  cancelled: { key: "complete", progress: 100 },
};

export function stageForStatus(status: string): Stage {
  const mapped = STATUS_TO_STAGE[status] || { key: "scheduled" as StageKey, progress: 10 };
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
