import type { Metadata } from "next";
import ForContractorsContent from "./_content";

export const metadata: Metadata = {
  title: "Houston Fire Alarm Subcontractor for General Contractors",
  description:
    "Fire alarm subcontracting for Houston general contractors. Bids back in 24–48 hours, NICET-certified crew, and we pull our own permits and handle the fire marshal. (832) 859-7009.",
  alternates: { canonical: "/for-contractors" },
};

export default function ForContractorsPage() {
  return <ForContractorsContent />;
}
