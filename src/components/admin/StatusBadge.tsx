"use client";

type StatusType =
  | "new"
  | "open"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost"
  | "assigned"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "draft"
  | "sent"
  | "paid"
  | "partial"
  | "overdue"
  | "active"
  | "inactive"
  | "pending"
  | "emergency"
  | "urgent"
  | "normal"
  | "low"
  // Job lifecycle statuses
  | "lead"
  | "quoted"
  | "approved"
  | "awaiting_inspection"
  | "corrections_required"
  | "passed"
  | "on_hold"
  | "invoiced"
  | "closed";

interface StatusBadgeProps {
  status: StatusType | string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  // Lead statuses
  new: { bg: "bg-blue-100", text: "text-blue-700", label: "New" },
  contacted: { bg: "bg-purple-100", text: "text-purple-700", label: "Contacted" },
  qualified: { bg: "bg-amber-100", text: "text-amber-700", label: "Qualified" },
  proposal: { bg: "bg-orange-100", text: "text-orange-700", label: "Proposal" },
  won: { bg: "bg-green-100", text: "text-green-700", label: "Won" },
  lost: { bg: "bg-gray-100", text: "text-gray-600", label: "Lost" },

  // Ticket statuses
  open: { bg: "bg-blue-100", text: "text-blue-700", label: "Open" },
  assigned: { bg: "bg-purple-100", text: "text-purple-700", label: "Assigned" },
  scheduled: { bg: "bg-amber-100", text: "text-amber-700", label: "Scheduled" },
  in_progress: { bg: "bg-orange-100", text: "text-orange-700", label: "In Progress" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },

  // Invoice statuses
  draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
  sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Sent" },
  paid: { bg: "bg-green-100", text: "text-green-700", label: "Paid" },
  partial: { bg: "bg-amber-100", text: "text-amber-700", label: "Partial" },
  overdue: { bg: "bg-orange-100", text: "text-orange-700", label: "Overdue" },

  // General statuses
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  inactive: { bg: "bg-gray-100", text: "text-gray-500", label: "Inactive" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },

  // Priority levels
  emergency: { bg: "bg-orange-100", text: "text-orange-700", label: "Emergency" },
  urgent: { bg: "bg-orange-100", text: "text-orange-700", label: "Urgent" },
  normal: { bg: "bg-blue-100", text: "text-blue-700", label: "Normal" },
  low: { bg: "bg-gray-100", text: "text-gray-600", label: "Low" },

  // Job lifecycle statuses
  lead: { bg: "bg-slate-100", text: "text-slate-700", label: "Lead" },
  quoted: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Quoted" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Approved" },
  awaiting_inspection: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Awaiting Inspection" },
  corrections_required: { bg: "bg-rose-100", text: "text-rose-700", label: "Corrections Required" },
  passed: { bg: "bg-teal-100", text: "text-teal-700", label: "Passed" },
  on_hold: { bg: "bg-yellow-100", text: "text-yellow-700", label: "On Hold" },
  invoiced: { bg: "bg-violet-100", text: "text-violet-700", label: "Invoiced" },
  closed: { bg: "bg-gray-100", text: "text-gray-700", label: "Closed" },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: status,
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeClasses}`}
    >
      {config.label || status}
    </span>
  );
}
