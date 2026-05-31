import type { Metadata } from "next";
import FireLaneMarkingContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Lane Striping & Markings in Houston, TX",
  description:
    "New fire lane striping, repainting, and code-compliant layout corrections for Houston commercial properties. Inspection-ready fire lane markings. Call (832) 859-7009.",
  alternates: { canonical: "/services/fire-lane-marking" },
  openGraph: {
    title: "Fire Lane Striping & Markings in Houston, TX | Chatman Security & Fire",
    description: "New fire lane striping and repainting for Houston commercial properties. Code-compliant, inspection-ready. (832) 859-7009.",
    url: "https://chatmansecurityandfire.com/services/fire-lane-marking",
  },
};

export default function FireLaneMarkingPage() {
  return <FireLaneMarkingContent />;
}
