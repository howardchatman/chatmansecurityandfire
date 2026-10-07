import type { Metadata } from "next";
import ForContractorsContent from "./_content";

export const metadata: Metadata = {
  title: "Houston Fire Alarm Subcontractor for General Contractors",
  description:
    "Fire alarm subcontracting for Houston general contractors on commercial, school, and public projects. Bids back in 24–48 hours, NICET-certified crew, prevailing wage, and we pull our own permits. (346) 852-5540.",
  alternates: { canonical: "/for-contractors" },
};

export default function ForContractorsPage() {
  return <ForContractorsContent />;
}
