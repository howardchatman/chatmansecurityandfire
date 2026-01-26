"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  Phone,
  CheckCircle,
  ArrowLeft,
  Bell,
  Droplets,
  Lightbulb,
  PaintBucket,
  FileText,
  ClipboardCheck,
  Wrench,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const failureReasons = [
  {
    icon: Bell,
    title: "Fire Alarm Issues",
    description: "Troubles, supervisory signals, or missing devices",
  },
  {
    icon: Droplets,
    title: "Sprinkler Problems",
    description: "Coverage gaps, obstructions, or head issues",
  },
  {
    icon: Lightbulb,
    title: "Emergency Lighting Failures",
    description: "Dead batteries, non-functioning fixtures, or missing signs",
  },
  {
    icon: PaintBucket,
    title: "Fire Lane Violations",
    description: "Faded or missing fire lane markings",
  },
  {
    icon: FileText,
    title: "Documentation Gaps",
    description: "Missing inspection records or compliance certificates",
  },
];

const howWeHelp = [
  {
    icon: ClipboardCheck,
    step: "1",
    title: "Review Your Report",
    description: "We analyze your inspection report to understand every deficiency",
  },
  {
    icon: Wrench,
    step: "2",
    title: "Complete Corrections",
    description: "Our team fixes all issues flagged by the fire marshal",
  },
  {
    icon: Calendar,
    step: "3",
    title: "Schedule Reinspection",
    description: "We coordinate timing to meet your deadline",
  },
  {
    icon: ShieldCheck,
    step: "4",
    title: "Pass Reinspection",
    description: "You get your approval and move forward",
  },
];

export default function FailedInspectionPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-b from-red-50 to-white py-16 lg:py-24">
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
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Failed a Fire Inspection?
              </h1>

              <p className="text-xl text-gray-600 mb-4">
                We fix the issues and get you ready for reinspection.
              </p>

              <p className="text-lg text-gray-500 mb-8">
                You don't need guesswork — you need corrections done right the first time.
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

        {/* Common Failure Reasons */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Common Reasons Inspections Fail
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {failureReasons.map((reason) => (
                  <div
                    key={reason.title}
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <div className="p-2 bg-orange-100 rounded-lg w-fit mb-4">
                      <reason.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{reason.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How We Help */}
        <section className="py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  How We Help
                </h2>

                <div className="grid sm:grid-cols-2 gap-6 mb-12">
                  {howWeHelp.map((item) => (
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
                <div className="bg-gray-50 rounded-2xl p-8 mb-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Typical Project Range
                  </h3>
                  <p className="text-3xl font-bold text-orange-600 mb-2">
                    $2,500 – $10,000+
                  </p>
                  <p className="text-gray-600">
                    Depends on scope of corrections needed
                  </p>
                </div>

                {/* Urgent CTA */}
                <div className="bg-red-600 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Need this handled immediately?
                  </h3>
                  <p className="text-red-100 mb-6">
                    We understand deadlines. Call now and we'll get started right away.
                  </p>
                  <a
                    href="tel:+18324301826"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-red-600 font-semibold rounded-full transition-colors"
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
