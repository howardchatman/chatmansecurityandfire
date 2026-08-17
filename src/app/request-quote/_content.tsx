import Script from "next/script";
import Link from "next/link";
import { ArrowLeft, Phone, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RequestQuoteContent() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-gray-50 min-h-screen">
        {/* Hero */}
        <section className="bg-[#0E2148] py-14">
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
              <a href="tel:+18328597009" className="text-orange-400 font-semibold hover:underline">
                (832) 859-7009
              </a>.
            </p>
          </div>
        </section>

        {/* GoHighLevel Quote Request Form */}
        <section className="py-12">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-3 sm:p-5">
              <iframe
                src="https://api.leadconnectorhq.com/widget/form/IEl7ihLU41vm4w0mKgZ2"
                style={{ width: "100%", height: "1697px", border: "none", borderRadius: "8px" }}
                id="inline-IEl7ihLU41vm4w0mKgZ2"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Fire & Life Safety Quote Request"
                data-height="1697"
                data-layout-iframe-id="inline-IEl7ihLU41vm4w0mKgZ2"
                data-form-id="IEl7ihLU41vm4w0mKgZ2"
                title="Fire & Life Safety Quote Request"
              />
            </div>

            {/* Fallback call CTA */}
            <div className="max-w-2xl mx-auto mt-6 text-center">
              <a href="tel:+18328597009" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors">
                <Phone className="w-4 h-4" />
                Or call us directly: (832) 859-7009
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
