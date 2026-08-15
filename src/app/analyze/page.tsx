import type { Metadata } from "next";
import AnalyzeContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Inspection Report Analyzer — Free AI Tool",
  description:
    "Upload your failed fire inspection report and get a free plain-English breakdown of every deficiency, plus recommendations for getting back in compliance.",
  alternates: { canonical: "/analyze" },
};

export default function AnalyzePage() {
  return <AnalyzeContent />;
}
