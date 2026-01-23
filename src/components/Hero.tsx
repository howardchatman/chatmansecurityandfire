"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Flame,
  ClipboardCheck,
  Phone,
  FileCheck,
  Wrench,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const trustPoints = [
  "Inspection Corrections",
  "Tenant Finish-Out",
  "New Installs",
  "Service & Repairs",
  "Testing & Documentation",
];

export default function Hero() {
  return (
    <section className="relative pt-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-50" />

      {/* Decorative Elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-30" />

      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-16 lg:py-24">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6"
            >
              <Shield className="w-4 h-4" />
              <span>Licensed • Commercial Specialists • Serving Houston since 2009</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Fire & Life-Safety
              <br />
              <span className="text-gradient">Compliance</span> — Simplified.
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Chatman Security & Fire helps Houston-area businesses pass inspections,
              correct violations fast, and keep fire alarm, sprinkler, and life-safety
              systems inspection-ready year-round.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-500/30 group"
              >
                <ClipboardCheck className="w-5 h-5" />
                Start Service Request
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+18324301826"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all"
              >
                <Phone className="w-5 h-5" />
                Call Howard&apos;s Office
              </a>
            </div>

            {/* What to Have Ready */}
            <div className="bg-gray-100 rounded-2xl p-6 max-w-2xl mx-auto mb-12">
              <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                When you call, Chad will need:
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  Property address
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  Inspection report (if any)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  Deadline date
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Chad&apos;s Howard&apos;s AI operations assistant — he handles intake so nothing important gets missed.
              </p>
            </div>
          </motion.div>

          {/* Trust Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-center text-gray-600 mb-6">
              Trusted experience across retail, restaurants, warehouses, multi-tenant commercial,
              and new construction. Built on real field work — not theory.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {trustPoints.map((point, index) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100"
                >
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Problem/Solution Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 grid lg:grid-cols-2 gap-8 items-start"
          >
            {/* Problem */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Failed an inspection? Can&apos;t open?
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                When the fire marshal flags issues, time becomes money. We step in fast,
                identify exactly what&apos;s required, correct the deficiencies, and produce
                documentation that holds up during reinspections.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: FileCheck, text: "Fast issue diagnosis — what's wrong, what it affects, what it will take" },
                  { icon: ClipboardCheck, text: "Clear scope & timeline so owners and GCs can move" },
                  { icon: Shield, text: "Inspector-ready documentation to reduce back-and-forth" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Upload your inspection report.</h3>
              </div>
              <p className="text-orange-100 mb-6">
                We&apos;ll review it and tell you what needs to happen next — clearly and quickly.
              </p>
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-all"
              >
                Start Service Request
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-orange-200 mt-4 text-center">
                Preferred: PDF or photos of the report + address + deadline date.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900 py-8">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "Since 2009", label: "Serving Houston" },
              { value: "Commercial", label: "Specialists" },
              { value: "24/7", label: "Service Dispatch" },
              { value: "Licensed", label: "& Insured" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
