import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import FreeTools from "@/components/FreeTools";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";
import LeadCapture from "@/components/LeadCapture";

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Services />
          <FreeTools />
          <HowItWorks />
          <CTA />
        </main>
        <Footer />
      </div>
      <ChadChat />
      <LeadCapture />
    </>
  );
}
