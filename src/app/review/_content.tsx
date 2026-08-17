"use client";

import { motion } from "framer-motion";
import { Star, ArrowRight, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// TODO: paste Chatman's Google review link here. Get it from Google Business
// Profile → "Ask for reviews" → copy link (a g.page/r/... URL), or search the
// business on Google → "Write a review" → copy the URL.
const GOOGLE_REVIEW_URL = "https://g.page/r/REPLACE_WITH_YOUR_GOOGLE_REVIEW_LINK/review";

export default function ReviewContent() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-gray-50 min-h-screen flex items-center">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto text-center bg-white rounded-3xl border border-gray-200 shadow-sm p-10 sm:p-14"
          >
            <img src="/logo_only.png" alt="Chatman Security & Fire" className="w-16 h-16 mx-auto mb-6" />

            <div className="flex justify-center gap-1 mb-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 260, damping: 14 }}
                >
                  <Star className="w-9 h-9 text-yellow-400 fill-yellow-400" />
                </motion.span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#0E2148] mb-4">
              How did we do?
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for trusting Chatman Security &amp; Fire. If we did great work, a quick
              Google review means the world to a small Houston business — and helps your neighbors
              find help they can count on.
            </p>

            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors text-lg w-full sm:w-auto"
            >
              Leave a Google Review
              <ArrowRight className="w-5 h-5" />
            </a>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Something wasn&apos;t right? We want to make it right.</p>
              <a
                href="tel:+18328597009"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call us directly: (832) 859-7009
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
