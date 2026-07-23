import type { Metadata } from "next";
import ThankYouContent from "./_content";

export const metadata: Metadata = {
  title: "Thank You | Chatman Security & Fire",
  description: "Your quote request has been received. We'll follow up within one business day.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <ThankYouContent />;
}
