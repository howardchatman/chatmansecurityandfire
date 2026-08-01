"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";

const points = [
  "Up to $100,000",
  "Rates as low as 4.49% APR",
  "Checking won't affect your credit",
];

export default function FinancingBanner() {
  return (
    <section className="relative bg-white py-16 border-b border-gray-100">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border-2 border-orange-200 bg-orange-50 px-8 py-12 sm:px-12 lg:px-16"
        >
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-semibold uppercase tracking-[0.2em] mb-5">
                <CreditCard className="w-3.5 h-3.5" />
                Financing Available
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0D1B2A] leading-tight mb-4">
                Do the work now. <span className="text-orange-600">Pay monthly.</span>
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Don&apos;t let budget hold up a failed inspection or an upgrade. Compare offers from
                12+ lenders and pick the monthly payment that fits.
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/financing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-600/30 text-lg"
              >
                Explore Financing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
