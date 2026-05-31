import type { Metadata } from "next";
import SecurityAlarmContent from "./_content";

export const metadata: Metadata = {
  title: "Brinks Home Security Houston TX | Authorized Dealer | Chatman Security & Fire",
  description:
    "Authorized Brinks security dealer in Houston, TX. Home and commercial security systems with 24/7 professional monitoring. Expert local installation by licensed technicians. (832) 859-7009",
  keywords: [
    "Brinks security Houston TX",
    "authorized Brinks dealer Houston",
    "home security system Houston",
    "commercial security alarm Houston",
    "Brinks monitoring Houston",
    "security system installation Texas",
    "Brinks authorized dealer Texas",
  ],
  alternates: { canonical: "/services/security-alarm" },
  openGraph: {
    title: "Brinks Home Security Houston TX | Chatman Security & Fire",
    description:
      "Authorized Brinks dealer in Houston, TX. Home and commercial security with 24/7 professional monitoring. Expert local installation.",
    url: "https://chatmansecurityandfire.com/services/security-alarm",
  },
};

export default function SecurityAlarmPage() {
  return <SecurityAlarmContent />;
}
