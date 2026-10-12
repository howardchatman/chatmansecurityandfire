import type { Metadata } from "next";
import AcademyContent from "./_content";

export const metadata: Metadata = {
  title: "Fire Protection Academy: Free Fire Sprinkler Learning Game",
  description:
    "Learn how fire sprinkler systems actually work in five quick levels. Name the parts of a sprinkler, see why only the hot head opens, follow the water from the city main, and spot fire code violations. Free, no sign-up.",
  alternates: { canonical: "/academy" },
  openGraph: {
    title: "Fire Protection Academy | Chatman Security & Fire",
    description:
      "A free game that teaches how fire sprinklers work: sprinkler anatomy, bulb colors, system water flow, and the violations fire marshals write up.",
    url: "https://www.chatmansecurityandfire.com/academy",
  },
};

export default function AcademyPage() {
  return <AcademyContent />;
}
