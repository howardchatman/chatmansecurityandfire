import type { Metadata } from "next";
import RequestQuoteContent from "./_content";

export const metadata: Metadata = {
  title: "Request a Quote | Chatman Security & Fire — Houston Fire Protection & Low-Voltage",
  description:
    "Request a free quote for commercial fire alarm, sprinkler, extinguisher, emergency lighting, security, fiber optic, or wireless work in Houston and across Texas. Response within one business day.",
  alternates: { canonical: "/request-quote" },
  openGraph: {
    title: "Request a Quote | Chatman Security & Fire",
    description:
      "Tell us about your project and get a detailed quote for fire protection and low-voltage work across Houston and Texas.",
    url: "https://chatmansecurityandfire.com/request-quote",
  },
};

export default function RequestQuotePage() {
  return <RequestQuoteContent />;
}
