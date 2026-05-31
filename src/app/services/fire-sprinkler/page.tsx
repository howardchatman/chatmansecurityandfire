import type { Metadata } from "next";
import FireSprinklerContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Sprinkler Systems Houston TX | Installation, Repair & NFPA 13 Compliance",
  description:
    "Licensed fire sprinkler contractor serving Houston and Greater Texas. New system installation, modifications, obstruction corrections, and NFPA 13 compliance for commercial properties. 24/7 emergency service. (832) 859-7009",
  keywords: [
    "fire sprinkler system Houston",
    "fire sprinkler installation Texas",
    "NFPA 13 compliance Houston",
    "fire sprinkler repair Houston",
    "sprinkler obstruction correction",
    "commercial fire sprinkler contractor",
    "fire sprinkler inspection Texas",
  ],
  alternates: { canonical: "/services/fire-sprinkler" },
  openGraph: {
    title: "Fire Sprinkler Systems Houston TX | Chatman Security & Fire",
    description:
      "Licensed fire sprinkler installation, repair, and NFPA 13 compliance for commercial properties across Houston and Texas. Available 24/7.",
    url: "https://chatmansecurityandfire.com/services/fire-sprinkler",
  },
};

export default function FireSprinklerPage() {
  return <FireSprinklerContent />;
}
