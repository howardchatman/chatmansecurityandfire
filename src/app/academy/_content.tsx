"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AcademyGame from "@/components/academy/AcademyGame";

export default function AcademyContent() {
  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="pt-20 print:pt-0">
        <AcademyGame />
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
