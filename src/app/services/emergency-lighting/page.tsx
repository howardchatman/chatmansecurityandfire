import type { Metadata } from "next";
import EmergencyLightingContent from "./_content";

export const metadata: Metadata = {
  title: "Emergency Lighting & Exit Signs Houston TX | Installation & Inspection Corrections",
  description:
    "Emergency lighting and exit sign installation, repair, and inspection corrections for Houston commercial properties. Battery replacements, fixture upgrades, code compliance. Fast turnaround. (832) 859-7009",
  keywords: [
    "emergency lighting Houston TX",
    "exit sign repair Houston",
    "emergency lighting inspection correction",
    "exit sign installation Texas",
    "emergency lighting compliance Houston",
    "exit sign battery replacement",
    "commercial emergency lighting service",
  ],
  alternates: { canonical: "/services/emergency-lighting" },
  openGraph: {
    title: "Emergency Lighting & Exit Signs Houston TX | Chatman Security & Fire",
    description:
      "Emergency lighting and exit sign installation, repair, and inspection corrections for Houston commercial properties. Fast turnaround on compliance corrections.",
    url: "https://chatmansecurityandfire.com/services/emergency-lighting",
  },
};

export default function EmergencyLightingPage() {
  return <EmergencyLightingContent />;
}
