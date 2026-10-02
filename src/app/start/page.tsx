import type { Metadata } from "next";
import StartContent from "./_content";

export const metadata: Metadata = {
  title: "Get Fire Compliance Help Fast",
  description:
    "Failed inspection? Life-safety deficiencies delaying your opening? Tell us what's going on and our team will review — or call (346) 852-5540 now for urgent issues.",
  alternates: { canonical: "/start" },
};

export default function StartPage() {
  return <StartContent />;
}
