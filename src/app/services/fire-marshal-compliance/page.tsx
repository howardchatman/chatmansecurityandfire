import type { Metadata } from "next";
import FireMarshalComplianceContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Marshal Inspection Corrections Houston TX | Violation Repair & Reinspection",
  description:
    "Failed a Houston fire marshal inspection? We review your deficiency report, correct every violation, and get you reinspection-ready fast. Licensed commercial contractor since 2009. (832) 859-7009",
  keywords: [
    "fire marshal inspection correction Houston",
    "fire marshal violation repair Texas",
    "failed fire inspection Houston",
    "fire marshal reinspection Houston TX",
    "fire code violation correction",
    "fire marshal compliance contractor",
    "fire inspection deficiency repair",
  ],
  alternates: { canonical: "/services/fire-marshal-compliance" },
  openGraph: {
    title: "Fire Marshal Inspection Corrections Houston TX | Chatman Security & Fire",
    description:
      "Failed a fire marshal inspection? We correct violations and get you reinspection-ready. Licensed commercial contractor serving Houston and Texas since 2009.",
    url: "https://chatmansecurityandfire.com/services/fire-marshal-compliance",
  },
};

export default function FireMarshalCompliancePage() {
  return <FireMarshalComplianceContent />;
}
