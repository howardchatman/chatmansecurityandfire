"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ClipboardCheck,
  Phone,
  CheckCircle,
  ArrowLeft,
  XCircle,
  Search,
  FileText,
  Wrench,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIVAChat from "@/components/AIVAChat";

const failureReasons = [
  "Devices installed incorrectly",
  "Emergency lights or exit signs not functional",
  "Fire lanes missing or faded",
  "Sprinkler coverage or obstruction issues",
  "Documentation gaps",
];

const processSteps = [
  {
    icon: Search,
    step: "1",
    title: "Walk the site",
    description: "Or review plans & photos",
  },
  {
    icon: XCircle,
    step: "2",
    title: "Identify issues",
    description: "Find what inspectors will flag",
  },
  {
    icon: FileText,
    step: "3",
    title: "Correction roadmap",
    description: "Provide a clear plan of action",
  },
  {
    icon: Wrench,
    step: "4",
    title: "Perform the work",
    description: "Complete corrections if needed",
  },
];

export default function InspectionReadyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-8 transition-colors"
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
                <div className="p-3 bg-orange-100 rounded-xl">
                  <ClipboardCheck className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Get Inspection-Ready — Before the Fire Marshal Shows Up
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                Avoid failed inspections, delays, and last-minute corrections.
                We review your site, identify risks, and help you pass the first time.
              </p>

              <a
                href="tel:+18324301826"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call (832) 430-1826
              </a>

              <p className="text-sm text-gray-500 mt-4">
                Commercial fire & life-safety services only.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why Inspections Fail */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Why Inspections Fail
              </h2>

              <ul className="space-y-4">
                {failureReasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{reason}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Our Pre-Inspection Process */}
        <section className="py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Our Pre-Inspection Process
                </h2>

                <div className="grid sm:grid-cols-2 gap-6 mb-12">
                  {processSteps.map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 rounded-2xl p-8 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What to Expect
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Pre-inspection reviews and readiness projects are scoped based on
                    building size, systems, and timeline.
                  </p>
                  <p className="text-3xl font-bold text-orange-600 mb-2">
                    Typical projects start at $1,500+
                  </p>
                  <p className="text-sm text-gray-500">
                    Pricing reflects commercial systems and inspection-driven work.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-gray-900 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Don't Let an Inspection Become a Fire Drill
                  </h3>
                  <p className="text-gray-300 mb-6">
                    If an opening, reinspection, or approval is coming up,
                    we'll help you prepare the right way.
                  </p>
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
