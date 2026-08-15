import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RequestQuoteBanner from "@/components/RequestQuoteBanner";
import FinancingBanner from "@/components/FinancingBanner";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import LeadMagnetBanner from "@/components/LeadMagnetBanner";
import Services from "@/components/Services";
import BrinksBanner from "@/components/BrinksBanner";
import FreeTools from "@/components/FreeTools";
import HowItWorks from "@/components/HowItWorks";
import PersonalStory from "@/components/PersonalStory";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <RequestQuoteBanner />
          <FinancingBanner />
          <BrinksBanner />
          <Services />
          <PersonalStory />
          <FreeTools />
          <HowItWorks />
          <LeadMagnetBanner />
          <CTA />
        </main>
        <Footer />
      </div>
      <LocalBusinessSchema />
    </>
  );
}
