"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FlameKindling, Phone, CheckCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const services = [
  "Replacement and mounting",
  "Tagging and service",
  "Inspection-related corrections",
];

export default function FireExtinguishersPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero with Background Image */}
        <section
          className="relative py-16 lg:py-24"
          style={{
            backgroundImage: "url('/ext_wide.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#1a1a1a"
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />

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
                  <FlameKindling className="w-8 h-8 text-white" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Fire Extinguishers — Service & Compliance
              </h1>

              <p className="text-xl text-white/90 mb-8">
                Proper extinguisher placement, tagging, and condition matter during inspections.
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
                  We Provide
                </h2>

                <ul className="space-y-4 mb-12">
                  {services.map((service) => (
                    <li key={service} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{service}</span>
                    </li>
                  ))}
                </ul>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {/* Compliance Project Card */}
                  <div className="bg-gray-50 rounded-2xl p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Typical Project Range
                    </h3>
                    <p className="text-3xl font-bold text-orange-600 mb-2">
                      $750+
                    </p>
                    <p className="text-gray-600">
                      when part of a compliance project
                    </p>
                  </div>

                  {/* Annual Inspection Card */}
                  <div className="bg-gray-50 rounded-2xl p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Annual Inspection Rates
                    </h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-700">
                        <span className="text-2xl font-bold text-orange-600">$50</span>{" "}
                        <span className="text-gray-600">trip charge</span>
                      </p>
                      <p className="text-gray-700">
                        <span className="text-2xl font-bold text-orange-600">$25</span>{" "}
                        <span className="text-gray-600">per extinguisher</span>
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Discounts available for 5+ extinguishers
                    </p>
                    <p className="text-gray-700 font-medium mb-4">
                      Ready to schedule? Give Chad a call or book online.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href="tel:+18324301826"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Call Chad
                      </a>
                      <Link
                        href="/start"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-colors text-sm"
                      >
                        Book Online
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gray-900 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Need extinguisher service?
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
      <ChadChat />
    </>
  );
}
