"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Phone, ArrowLeft, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ThankYouContent() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-gray-50 min-h-screen flex items-center">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto text-center bg-white rounded-3xl border border-gray-200 shadow-sm p-10 sm:p-14"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-11 h-11 text-green-600" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#0D1B2A] mb-4">
              Thank you — request received!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              We&apos;ve got your project details and <span className="font-semibold text-gray-900">we&apos;ll follow up soon</span>.
            </p>
            <p className="inline-flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Clock className="w-4 h-4 text-orange-500" />
              Expect to hear from us within one business day.
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-8">
              <p className="text-sm text-gray-600 mb-3">Need something urgent? Reach us directly:</p>
              <a
                href="tel:+18328597009"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
                (832) 859-7009
              </a>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
