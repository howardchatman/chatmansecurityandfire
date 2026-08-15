import type { Metadata } from "next";
import StartContent from "./_content";

export const metadata: Metadata = {
  title: "Get Fire Compliance Help Fast",
  description:
    "Failed inspection? Life-safety deficiencies delaying your opening? Tell us what's going on and our team will review — or call (832) 859-7009 now for urgent issues.",
  alternates: { canonical: "/start" },
};

export default function StartPage() {
  return <StartContent />;
}
