import type { Metadata } from "next";
import FireExtinguishersContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Extinguisher Inspection & Service in Houston, TX",
  description:
    "Annual fire extinguisher inspection, tagging, and recharging for Houston businesses. $50 trip charge + $25 per unit. Discounts for 5+ extinguishers. Compliance-ready service. Call (832) 859-7009.",
  alternates: { canonical: "/services/fire-extinguishers" },
  openGraph: {
    title: "Fire Extinguisher Inspection & Service in Houston, TX | Chatman Security & Fire",
    description: "Annual fire extinguisher inspection and tagging for Houston businesses. $50 trip + $25/unit. Call (832) 859-7009.",
    url: "https://chatmansecurityandfire.com/services/fire-extinguishers",
  },
};

export default function FireExtinguishersPage() {
  return <FireExtinguishersContent />;
}
