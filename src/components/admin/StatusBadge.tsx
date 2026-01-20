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
  | "low";

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
  overdue: { bg: "bg-red-100", text: "text-red-700", label: "Overdue" },

  // General statuses
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  inactive: { bg: "bg-gray-100", text: "text-gray-500", label: "Inactive" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },

  // Priority levels
  emergency: { bg: "bg-red-100", text: "text-red-700", label: "Emergency" },
  urgent: { bg: "bg-orange-100", text: "text-orange-700", label: "Urgent" },
  normal: { bg: "bg-blue-100", text: "text-blue-700", label: "Normal" },
  low: { bg: "bg-gray-100", text: "text-gray-600", label: "Low" },
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
