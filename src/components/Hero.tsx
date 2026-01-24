"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background Elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-30" />

      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Simple Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-orange-600 font-medium mb-6"
          >
            Commercial Fire & Life-Safety — Houston
          </motion.p>

          {/* Clean Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
            Failed inspection?
            <br />
            <span className="text-orange-600">We fix it.</span>
          </h1>

          {/* Simple Description */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Fast corrections. Clear communication. Reinspection-ready.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-500/25"
            >
              Start Service Request
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+18324301826"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all"
            >
              <Phone className="w-5 h-5" />
              (832) 430-1826
            </a>
          </div>
        </motion.div>
      </div>

      {/* Simple Stats */}
      <div className="mt-24 border-t border-gray-200 pt-12">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">Since 2009</p>
              <p className="text-gray-500 mt-1">Serving Houston</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">Commercial</p>
              <p className="text-gray-500 mt-1">Specialists</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">24/7</p>
              <p className="text-gray-500 mt-1">Dispatch</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">Licensed</p>
              <p className="text-gray-500 mt-1">& Insured</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
