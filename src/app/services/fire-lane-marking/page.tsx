import type { Metadata } from "next";
import FireLaneMarkingContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Lane Marking & Striping Houston TX | Curb Painting & Compliance",
  description:
    "New fire lane striping, curb painting, and code-compliant layout corrections for Houston commercial properties. Quick turnaround. Inspection-ready fire lane markings. (832) 859-7009",
  keywords: [
    "fire lane marking Houston TX",
    "fire lane striping Houston",
    "curb painting fire lane Texas",
    "fire lane compliance Houston",
    "fire lane repainting commercial",
    "fire lane correction Houston",
    "parking lot fire lane striping",
  ],
  alternates: { canonical: "/services/fire-lane-marking" },
  openGraph: {
    title: "Fire Lane Marking & Striping Houston TX | Chatman Security & Fire",
    description:
      "New fire lane striping, curb painting, and code-compliant layout corrections for Houston commercial properties. Quick turnaround, inspection-ready.",
    url: "https://chatmansecurityandfire.com/services/fire-lane-marking",
  },
};

export default function FireLaneMarkingPage() {
  return <FireLaneMarkingContent />;
}
