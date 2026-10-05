import Link from "next/link";
import { ArrowLeft, Phone, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadCaptureForm from "@/components/LeadCaptureForm";

export default function RequestQuoteContent() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-gray-50 min-h-screen">
        {/* Hero */}
        <section className="bg-[#0D1B2A] pt-14 pb-2">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-orange-400 mb-6 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em]">Request for Quote</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 max-w-2xl">
              Tell us about your project
            </h1>
            <p className="text-gray-300 max-w-2xl">
              Fill out the form below and we&apos;ll get back to you within one business day with next steps.
              Prefer to talk? Call{" "}
              <a href="tel:+13468525540" className="text-orange-400 font-semibold hover:underline">
                (346) 852-5540
              </a>.
            </p>
          </div>
        </section>

        <LeadCaptureForm
          variant="inline"
          heading="Project details"
          subtext="Name and phone are all we need to get started. Add the building type and what's going on if you have it."
        />

        <section className="py-8">
          <div className="max-w-2xl mx-auto text-center px-4">
            <a href="tel:+13468525540" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors">
              <Phone className="w-4 h-4" />
              Or call us directly: (346) 852-5540
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
