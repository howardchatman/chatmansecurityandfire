import type { Metadata } from "next";
import SecurityAlarmContent from "./_content";

export const metadata: Metadata = {
  title: "Brinks Security Alarm Systems — Authorized Dealer in Houston, TX",
  description:
    "Authorized Brinks security dealer in Houston, TX. Home & commercial security systems with 24/7 professional monitoring. Expert local installation. Secure your Home, Secure your Peace! Call (832) 859-7009.",
  alternates: { canonical: "/services/security-alarm" },
  openGraph: {
    title: "Brinks Security Alarm Systems — Authorized Dealer in Houston, TX | Chatman Security & Fire",
    description: "Authorized Brinks dealer in Houston, TX. Home & commercial security with 24/7 monitoring. Expert installation. (832) 859-7009.",
    url: "https://chatmansecurityandfire.com/services/security-alarm",
  },
};

export default function SecurityAlarmPage() {
  return <SecurityAlarmContent />;
}
