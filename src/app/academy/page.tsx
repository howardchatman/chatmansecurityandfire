import type { Metadata } from "next";
import AcademyContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Protection Academy: Free Fire Safety & NFPA Learning Games",
  description:
    "Free games that teach how fire sprinklers, fire alarms, and fire extinguishers work, and the NFPA codes behind them. Four courses, a final exam, and a printable certificate. No sign-up.",
  alternates: { canonical: "/academy" },
  openGraph: {
    title: "Fire Protection Academy | Chatman Security & Fire",
    description:
      "Learn sprinklers, fire alarms, extinguishers, and NFPA codes through quick games, then spot the violations a fire marshal would write up.",
    url: "https://www.chatmansecurityandfire.com/academy",
  },
};

export default function AcademyPage() {
  return <AcademyContent />;
}
