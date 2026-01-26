"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Phone, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background Elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-30" />

      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
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
            <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
              Fast corrections. Clear communication. Reinspection-ready.
            </p>

            {/* Two CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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

          {/* Right: Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/landing_page_wide.png"
                alt="Fire Marshal posting FAIL notice on building - Chatman Security & Fire fixes inspection failures"
                width={800}
                height={533}
                className="w-full h-auto object-cover"
                priority
              />
              {/* Overlay gradient for text contrast if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">Don&apos;t let this be you</p>
              <p className="text-xs text-gray-500">We get you back in compliance</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Simple Stats */}
      <div className="mt-20 lg:mt-24 border-t border-gray-200 pt-12">
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
