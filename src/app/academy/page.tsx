import type { Metadata } from "next";
import AcademyContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Protection Academy: Free Fire Safety Learning Games",
  description:
    "Free games that teach how fire sprinklers, fire alarms, and fire extinguishers work. Three courses: sprinkler anatomy and water flow, alarm panels and detectors, classes of fire and the P.A.S.S. method. No sign-up.",
  alternates: { canonical: "/academy" },
  openGraph: {
    title: "Fire Protection Academy | Chatman Security & Fire",
    description:
      "Learn fire sprinklers, fire alarms, and fire extinguishers through quick games, then spot the violations a fire marshal would write up.",
    url: "https://www.chatmansecurityandfire.com/academy",
  },
};

export default function AcademyPage() {
  return <AcademyContent />;
}
