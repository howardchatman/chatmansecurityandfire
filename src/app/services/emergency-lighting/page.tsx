"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Lightbulb, Phone, CheckCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIVAChat from "@/components/AIVAChat";

const services = [
  "Battery failures",
  "Fixture replacements",
  "Operational deficiencies",
];

export default function EmergencyLightingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero with Background Image */}
        <section
          className="relative py-16 lg:py-24"
          style={{
            backgroundImage: "url('/exit_sign_wide.png')",
            backgroundSize: "100% auto",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#1a1a1a"
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-orange-400 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Emergency Lighting & Exit Sign Corrections
              </h1>

              <p className="text-xl text-white/90 mb-8">
                Non-working emergency lights and exit signs are fast inspection failures.
              </p>

              <a
                href="tel:+18324301826"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call (832) 430-1826
              </a>
            </motion.div>
          </div>
        </section>

        {/* Body */}
        <section className="py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  We Correct
                </h2>

                <ul className="space-y-4 mb-12">
                  {services.map((service) => (
                    <li key={service} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{service}</span>
                    </li>
                  ))}
                </ul>

                {/* Pricing */}
                <div className="bg-gray-50 rounded-2xl p-8 mb-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Typical Project Range
                  </h3>
                  <p className="text-3xl font-bold text-orange-600">
                    $750 – $2,500
                  </p>
                </div>

                {/* CTA */}
                <div className="bg-gray-900 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Need emergency lighting fixed?
                  </h3>
                  <a
                    href="tel:+18324301826"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Call (832) 430-1826
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AIVAChat />
    </>
  );
}
