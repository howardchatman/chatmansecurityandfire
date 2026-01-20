import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
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
          <Pricing />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
      <AIVAChat />
    </>
  );
}
