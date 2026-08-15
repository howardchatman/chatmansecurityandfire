import type { Metadata } from "next";
import ConsultingContent from "./_content";

export const metadata: Metadata = {
  title: "Fire & Life-Safety Consulting",
  description:
    "Expert fire code consulting in Houston: compliance reviews, pre-inspection assessments, risk assessments, and fire marshal guidance for commercial and industrial properties. (832) 859-7009.",
  alternates: { canonical: "/services/consulting" },
};

export default function ConsultingPage() {
  return <ConsultingContent />;
}
