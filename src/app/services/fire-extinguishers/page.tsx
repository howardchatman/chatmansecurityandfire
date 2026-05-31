import type { Metadata } from "next";
import FireExtinguishersContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Extinguisher Service Houston TX | Inspection, Sales & Tagging",
  description:
    "Annual fire extinguisher inspection, tagging, sales, and recharging for Houston commercial properties. $50 trip + $25/unit. Discounts for 5+ extinguishers. Compliance-ready service. (832) 859-7009",
  keywords: [
    "fire extinguisher inspection Houston",
    "fire extinguisher service Texas",
    "fire extinguisher tagging Houston",
    "annual fire extinguisher inspection",
    "fire extinguisher recharging Houston TX",
    "commercial fire extinguisher service",
    "fire extinguisher compliance Houston",
  ],
  alternates: { canonical: "/services/fire-extinguishers" },
  openGraph: {
    title: "Fire Extinguisher Service Houston TX | Chatman Security & Fire",
    description:
      "Annual fire extinguisher inspection, tagging, and sales for Houston businesses. Compliance-ready service. $50 trip + $25/unit. (832) 859-7009",
    url: "https://chatmansecurityandfire.com/services/fire-extinguishers",
  },
};

export default function FireExtinguishersPage() {
  return <FireExtinguishersContent />;
}
