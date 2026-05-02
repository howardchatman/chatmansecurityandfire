"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Shield, Phone, ArrowRight } from "lucide-react";

export default function BrinksBanner() {
  return (
    <section
      className="py-16 overflow-hidden relative"
      style={{
        backgroundImage: "url('/security_alarm_wide.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gray-900/80" />

      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Secure your Home,{" "}
              <span className="text-orange-400">Secure your Peace!</span>
            </h2>

            <p className="text-gray-300 text-lg mb-8">
              We are now an authorized Brinks Security dealer — bringing professional home and business
              security systems to Houston with expert installation and 24/7 monitoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/services/security-alarm"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+18328597009"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-colors"
              >
                <Phone className="w-4 h-4" />
                (832) 859-7009
              </a>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-xs w-full">
              <Image
                src="/brinks_logo_blue.png"
                alt="Brinks Home Security"
                width={220}
                height={80}
                className="mx-auto mb-6 h-14 w-auto object-contain"
              />
              <div className="space-y-3">
                {[
                  "24/7 Professional Monitoring",
                  "Smart Home Integration",
                  "Indoor & Outdoor Cameras",
                  "Professional Installation",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/services/security-alarm"
                className="mt-6 block text-center text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                View Equipment Lineup →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
