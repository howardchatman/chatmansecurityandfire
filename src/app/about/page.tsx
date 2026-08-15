import type { Metadata } from "next";
import AboutContent from "./_content";

export const metadata: Metadata = {
  title: "About Us — Protecting Texas Properties Since 2009",
  description:
    "Family-owned Houston fire protection company since 2009. Fire alarms, sprinklers, extinguishers, and compliance — when you fail an inspection, we get you back on track fast.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutContent />;
}
