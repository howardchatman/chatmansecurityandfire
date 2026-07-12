import type { Metadata } from "next";
import FiberOpticsContent from "./_content";

export const metadata: Metadata = {
  title: "Fiber Optic Cabling & Installation Houston TX | Structured Cabling Contractor",
  description:
    "Commercial fiber optic installation, splicing, and structured cabling in Houston and across Texas. Single-mode and multimode fiber, network cabling, low-voltage infrastructure for new construction and retrofits. (832) 859-7009",
  keywords: [
    "fiber optic installation Houston",
    "structured cabling Houston TX",
    "fiber optic contractor Texas",
    "commercial network cabling Houston",
    "low voltage cabling contractor",
    "fiber splicing Houston",
    "data cabling installation Texas",
  ],
  alternates: { canonical: "/services/fiber-optics" },
  openGraph: {
    title: "Fiber Optic Cabling & Installation | Chatman Security & Fire",
    description:
      "Commercial fiber optic and structured cabling installation for buildings across Houston and Texas. New construction, retrofits, and low-voltage infrastructure.",
    url: "https://chatmansecurityandfire.com/services/fiber-optics",
  },
};

export default function FiberOpticsPage() {
  return <FiberOpticsContent />;
}
