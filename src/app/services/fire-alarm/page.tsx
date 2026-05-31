import type { Metadata } from "next";
import FireAlarmContent from "./_content";

export const metadata: Metadata = {
  title: "Commercial Fire Alarm Systems Houston TX | Installation, Repair & Inspection Corrections",
  description:
    "Licensed commercial fire alarm contractor serving Houston and Greater Texas. New system installation, NFPA 72 inspection corrections, trouble diagnostics, and panel replacements. 24/7 emergency service. (832) 859-7009",
  keywords: [
    "commercial fire alarm Houston",
    "fire alarm installation Texas",
    "fire alarm repair Houston",
    "NFPA 72 inspection",
    "fire alarm system cost",
    "fire marshal correction",
    "fire alarm contractor Houston TX",
  ],
  alternates: { canonical: "/services/fire-alarm" },
  openGraph: {
    title: "Commercial Fire Alarm Systems | Chatman Security & Fire",
    description:
      "Licensed fire alarm installation, repair, and inspection correction for commercial properties across Houston and Texas. Available 24/7.",
    url: "https://chatmansecurityandfire.com/services/fire-alarm",
  },
};

export default function FireAlarmPage() {
  return <FireAlarmContent />;
}
