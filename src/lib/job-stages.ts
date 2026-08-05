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
}

const STATUS_TO_STAGE: Record<string, { key: StageKey; progress: number }> = {
  // Pre-work — the customer still reads this as "booked with us"
  lead: { key: "scheduled", progress: 5 },
  quoted: { key: "scheduled", progress: 10 },
  approved: { key: "scheduled", progress: 15 },
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
    label: status === "on_hold" ? "On Hold" : def.label,
    index,
    progress: mapped.progress,
    isComplete: ["completed", "invoiced", "paid", "closed"].includes(status),
    isOnHold: status === "on_hold",
  };
}
