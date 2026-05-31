import type { Metadata } from "next";
import FireMarshalComplianceContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Marshal Compliance & Inspection Corrections in Houston, TX",
  description:
    "Failed your Houston fire marshal inspection? Chatman Security & Fire corrects violations fast and prepares your property for reinspection. Since 2009. Licensed & insured. Call (832) 859-7009.",
  alternates: { canonical: "/services/fire-marshal-compliance" },
  openGraph: {
    title: "Fire Marshal Compliance & Inspection Corrections in Houston, TX | Chatman Security & Fire",
    description: "Failed a Houston fire marshal inspection? We correct violations and get you reinspection-ready. Since 2009. (832) 859-7009.",
    url: "https://chatmansecurityandfire.com/services/fire-marshal-compliance",
  },
};

export default function FireMarshalCompliancePage() {
  return <FireMarshalComplianceContent />;
}
