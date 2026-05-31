import type { Metadata } from "next";
import ChecklistContent from "./_content";

export const metadata: Metadata = {
  title: "Commercial Fire Safety Self-Inspection Checklist — Houston, TX",
  description:
    "Free commercial fire safety checklist covering the 10 most common fire marshal violations. Fire alarms, sprinklers, extinguishers, exit signs, and fire lanes. Download or print free.",
  alternates: { canonical: "/checklist" },
  openGraph: {
    title: "Free Commercial Fire Safety Self-Inspection Checklist | Chatman Security & Fire",
    description: "Catch the most common fire marshal violations before your inspection. Free checklist covering alarms, sprinklers, extinguishers, exit signs, and more.",
    url: "https://chatmansecurityandfire.com/checklist",
  },
};

export default function ChecklistPage() {
  return <ChecklistContent />;
}
