"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Phone, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const services = [
  "Fire code compliance reviews and gap analysis",
  "Pre-inspection assessments and preparation",
  "Fire & life-safety system design recommendations",
  "Risk assessments for commercial and industrial properties",
  "Fire safety planning for new construction and renovations",
  "Expert guidance on local and state fire marshal requirements",
];

export default function ConsultingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section
          className="relative py-16 lg:py-24"
          style={{
            backgroundColor: "#1a1a1a",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 to-transparent" />

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
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Fire & Life-Safety Consulting
              </h1>

              <p className="text-xl text-white/90 mb-8">
                Expert guidance to help you navigate fire codes, pass inspections, and protect your property and people.
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
                  Consulting Services Include
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
                <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Consulting Engagements
                  </h3>
                  <p className="text-3xl font-bold text-orange-600">
                    Contact us for a custom quote
                  </p>
                  <p className="text-gray-600 mt-2">
                    Pricing depends on property size, scope, and complexity of your needs.
                  </p>
                </div>

                {/* Note */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-12">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800 font-medium">Why Consulting?</p>
                      <p className="text-gray-600">
                        Save time and money by getting expert advice before costly mistakes happen. We help you understand exactly what's needed to stay compliant and pass inspections the first time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gray-900 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ready to talk?
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Schedule a consultation to discuss your fire & life-safety needs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="tel:+18324301826"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Call (832) 430-1826
                    </a>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 hover:border-orange-500 text-white font-semibold rounded-full transition-colors"
                    >
                      Send a Message
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
