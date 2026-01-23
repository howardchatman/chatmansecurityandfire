"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, ArrowRight, ClipboardCheck, Clock, FileCheck } from "lucide-react";

const benefits = [
  {
    icon: ClipboardCheck,
    text: "Compliance Review",
  },
  {
    icon: Clock,
    text: "Fast Correction Work",
  },
  {
    icon: FileCheck,
    text: "Inspector-Ready Documentation",
  },
];

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Get Inspection-Ready.
            </h2>

            {/* Description */}
            <p className="text-lg text-orange-100 max-w-2xl mx-auto mb-8">
              If you&apos;re facing an inspection deadline, a failed report, or recurring
              system issues, we&apos;ll help you correct it fast and get back to business.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {benefits.map((benefit) => (
                <div
                  key={benefit.text}
                  className="flex items-center gap-2 text-white"
                >
                  <benefit.icon className="w-5 h-5 text-orange-200" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-orange-700 font-semibold rounded-xl transition-colors group"
              >
                Start Service Request
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+18324301826"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-colors"
              >
                <Phone className="w-5 h-5" />
                Speak With Our Team
              </a>
            </div>

            {/* Micro copy */}
            <p className="text-sm text-orange-200 mt-6">
              Please have ready: property address, inspection deadline, and any reports you have.
            </p>

            {/* Trust Badges */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-wrap justify-center items-center gap-8">
                {["Licensed", "Commercial Specialists", "Houston Area", "Since 2009"].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="text-white/80 text-sm font-medium"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
