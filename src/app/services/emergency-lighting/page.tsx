import type { Metadata } from "next";
import EmergencyLightingContent from "./_content";

export const metadata: Metadata = {
  title: "Emergency Lighting & Exit Sign Repairs in Houston, TX",
  description:
    "Fast emergency lighting and exit sign corrections for Houston commercial properties that failed fire marshal inspection. Battery replacements, fixture repairs. Call (832) 859-7009.",
  alternates: { canonical: "/services/emergency-lighting" },
  openGraph: {
    title: "Emergency Lighting & Exit Sign Repairs in Houston, TX | Chatman Security & Fire",
    description: "Fast emergency lighting and exit sign corrections for Houston properties that failed fire marshal inspection. (832) 859-7009.",
    url: "https://chatmansecurityandfire.com/services/emergency-lighting",
  },
};

export default function EmergencyLightingPage() {
  return <EmergencyLightingContent />;
}
