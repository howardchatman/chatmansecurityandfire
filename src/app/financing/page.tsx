import type { Metadata } from "next";
import FinancingContent from "./_content";

export const metadata: Metadata = {
  title: "Financing for Fire & Security Projects | Chatman Security & Fire",
  description:
    "Get your fire alarm, sprinkler, security, or low-voltage project done now and pay monthly. Through Acorn Finance, compare offers from 12+ lenders — up to $100,000, rates as low as 4.49% APR, funding in 1–2 business days. Checking your rate won't affect your credit.",
  keywords: [
    "fire protection financing",
    "security system financing Houston",
    "fire alarm financing",
    "commercial fire project financing Texas",
    "monthly payment fire sprinkler",
    "Acorn Finance contractor",
  ],
  alternates: { canonical: "/financing" },
  openGraph: {
    title: "Financing for Fire & Security Projects | Chatman Security & Fire",
    description:
      "Do the work now, pay monthly. Compare offers from 12+ lenders — up to $100,000, rates as low as 4.49% APR. Checking your rate won't affect your credit.",
    url: "https://chatmansecurityandfire.com/financing",
  },
};

export default function FinancingPage() {
  return <FinancingContent />;
}
