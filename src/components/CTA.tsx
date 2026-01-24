"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 bg-orange-600">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-orange-100 mb-10">
            Call us or submit a service request.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-orange-600 font-semibold rounded-full transition-colors"
            >
              Start Service Request
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+18324301826"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-700 hover:bg-orange-800 text-white font-semibold rounded-full transition-colors"
            >
              <Phone className="w-5 h-5" />
              (832) 430-1826
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
