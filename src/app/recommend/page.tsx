import type { Metadata } from "next";
import RecommendContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Safety Service Recommendations — Free Tool",
  description:
    "Tell us about your building and get personalized fire safety service recommendations for staying compliant and protected. Free, instant, and no obligation.",
  alternates: { canonical: "/recommend" },
};

export default function RecommendPage() {
  return <RecommendContent />;
}
