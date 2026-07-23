"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, ArrowRight, CheckCircle2 } from "lucide-react";

const points = [
  "New construction & retrofits",
  "Free, no-obligation estimate",
  "Response within one business day",
];

export default function RequestQuoteBanner() {
  return (
    <section className="relative bg-white py-16 border-b border-gray-100">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-[#0D1B2A] px-8 py-12 sm:px-12 lg:px-16"
        >
          {/* Accent glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-600/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/15 text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
                <FileText className="w-3.5 h-3.5" />
                Request for Quote
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                Have a project? <span className="text-orange-500">Get a quote.</span>
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Tell us about your building and scope — fire alarm, sprinkler, low-voltage,
                security, or a full multi-service package. We&apos;ll review it and send you a
                detailed quote.
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/request-quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-600/30 text-lg"
              >
                Request a Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
