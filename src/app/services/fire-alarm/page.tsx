"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bell, Phone, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const services = [
  "Device replacement and rewiring",
  "Trouble & supervisory diagnostics",
  "Panel issues affecting inspection approval",
  "Corrections required by inspection reports",
];

export default function FireAlarmPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero with Background Image */}
        <section
          className="relative py-16 lg:py-24"
          style={{
            backgroundImage: "url('/fire_alarm_wide.png')",
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
                  <Bell className="w-8 h-8 text-white" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Commercial Fire Alarm Systems — Service, Repairs & Corrections
              </h1>

              <p className="text-xl text-white/90 mb-8">
                We service and correct commercial fire alarm systems that impact inspections, occupancy, and operations.
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
                  Services Include
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
                    Typical Project Range
                  </h3>
                  <p className="text-3xl font-bold text-orange-600">
                    $750 – $5,000+
                  </p>
                </div>

                {/* Note */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-12">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800 font-medium">Note</p>
                      <p className="text-gray-600">
                        We do not offer DIY monitoring packages. All work is commercial-grade and inspection-focused.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gray-900 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Need fire alarm service?
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
