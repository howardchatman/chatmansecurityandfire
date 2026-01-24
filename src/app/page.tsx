import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AIVAChat from "@/components/AIVAChat";

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Services />
          <HowItWorks />
          <CTA />
        </main>
        <Footer />
      </div>
      <AIVAChat />
    </>
  );
}
