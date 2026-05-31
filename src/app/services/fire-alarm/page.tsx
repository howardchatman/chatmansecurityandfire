import type { Metadata } from "next";
import FireAlarmContent from "./_content";

export const metadata: Metadata = {
  title: "Commercial Fire Alarm Systems — Service & Inspection in Houston, TX",
  description:
    "NFPA 72 fire alarm inspection, repairs, device replacement, and corrections for Houston commercial properties. Failed inspection? Chatman Security & Fire gets you reinspection-ready. Call (832) 859-7009.",
  alternates: { canonical: "/services/fire-alarm" },
  openGraph: {
    title: "Commercial Fire Alarm Systems — Service & Inspection in Houston, TX | Chatman Security & Fire",
    description: "NFPA 72 fire alarm inspection, repairs, and device replacement for Houston commercial properties. Fast corrections for failed inspections. (832) 859-7009.",
    url: "https://chatmansecurityandfire.com/services/fire-alarm",
  },
};

export default function FireAlarmPage() {
  return <FireAlarmContent />;
}
