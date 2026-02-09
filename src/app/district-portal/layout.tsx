import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "District Compliance Portal | Chatman Security & Fire",
  description: "Interactive demo of the Chatman Security & Fire District Compliance Portal — track fire safety compliance across 70+ campuses in real time.",
};

export default function DistrictPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
