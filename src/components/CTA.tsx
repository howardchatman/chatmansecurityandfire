"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Phone, ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-28 bg-[#0D1B2A] overflow-hidden">
      {/* Embers background */}
      <div className="absolute inset-0">
        <Image
          src="/bg-embers-dark.png"
          alt=""
          fill
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A] via-transparent to-[#0D1B2A]/60" />
      </div>

      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Call us or submit a service request.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/start"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-colors shadow-lg shadow-orange-600/30"
            >
              Start Service Request
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+18328597009"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 hover:border-white/60 hover:bg-white/5 text-white font-semibold rounded-full transition-colors"
            >
              <Phone className="w-5 h-5" />
              (832) 859-7009
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
