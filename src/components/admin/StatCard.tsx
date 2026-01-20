"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  icon: LucideIcon;
  color: "red" | "green" | "blue" | "amber" | "neutral";
  subtitle?: string;
}

const colorClasses = {
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    border: "border-red-100",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    border: "border-green-100",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-100",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    border: "border-amber-100",
  },
  neutral: {
    bg: "bg-neutral-100",
    icon: "text-neutral-600",
    border: "border-neutral-200",
  },
};

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  subtitle,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

          {/* Change indicator or subtitle */}
          <div className="mt-2 flex items-center gap-2">
            {change && (
              <span
                className={`inline-flex items-center gap-1 text-sm font-medium ${
                  change.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {change.value > 0 ? "+" : ""}
                {change.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
