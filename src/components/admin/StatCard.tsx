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
  red: { bg: "bg-orange-50", icon: "text-orange-600", accent: "bg-orange-500" },
  green: { bg: "bg-green-50", icon: "text-green-600", accent: "bg-green-500" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", accent: "bg-blue-500" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", accent: "bg-amber-500" },
  neutral: { bg: "bg-neutral-100", icon: "text-neutral-600", accent: "bg-neutral-400" },
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
    <div className="relative bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 h-full w-1 ${colors.accent}`} />

      <div className="flex items-start justify-between pl-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{value}</p>

          <div className="mt-2 flex items-center gap-2">
            {change && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded ${
                  change.trend === "up"
                    ? "text-green-700 bg-green-50"
                    : "text-orange-700 bg-orange-50"
                }`}
              >
                {change.trend === "up" ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {change.value > 0 ? "+" : ""}
                {change.value}%
              </span>
            )}
            {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl ${colors.bg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
