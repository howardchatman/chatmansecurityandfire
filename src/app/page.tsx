import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import LeadMagnetBanner from "@/components/LeadMagnetBanner";
import Services from "@/components/Services";
import BrinksBanner from "@/components/BrinksBanner";
import FreeTools from "@/components/FreeTools";
import HowItWorks from "@/components/HowItWorks";
import PersonalStory from "@/components/PersonalStory";
import LeadCaptureForm from "@/components/LeadCaptureForm";
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
          <BrinksBanner />
          <Services />
          <PersonalStory />
          <FreeTools />
          <HowItWorks />
          <LeadMagnetBanner />
          <LeadCaptureForm
            variant="inline"
            heading="Let's Talk About Your Building"
            subtext="Tell me about your project. I'll get back to you within one business day."
          />
          <CTA />
        </main>
        <Footer />
      </div>
      <ChadChat />
      <LeadCapture />
      <LocalBusinessSchema />
    </>
  );
}
