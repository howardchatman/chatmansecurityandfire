import type { Metadata } from "next";
import FireSprinklerContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Sprinkler Service & Inspection Support in Houston, TX",
  description:
    "Fire sprinkler obstruction corrections, modifications, and NFPA 13 compliance for Houston commercial and multi-family properties. Fast response for failed inspections. Call (832) 859-7009.",
  alternates: { canonical: "/services/fire-sprinkler" },
  openGraph: {
    title: "Fire Sprinkler Service & Inspection Support in Houston, TX | Chatman Security & Fire",
    description: "Sprinkler obstruction corrections and NFPA 13 compliance for Houston commercial properties. Reinspection-ready work. (832) 859-7009.",
    url: "https://chatmansecurityandfire.com/services/fire-sprinkler",
  },
};

export default function FireSprinklerPage() {
  return <FireSprinklerContent />;
}
