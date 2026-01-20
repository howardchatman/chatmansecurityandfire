"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, ArrowRight, Shield, Clock, Headphones } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    text: "Free Security Assessment",
  },
  {
    icon: Clock,
    text: "Same-Day Installation Available",
  },
  {
    icon: Headphones,
    text: "24/7 Customer Support",
  },
];

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
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
            {/* Badge */}
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              Limited Time Offer
            </span>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Get a Free Quote Today
              <br />
              <span className="text-red-200">Save Up to 30%</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-red-100 max-w-2xl mx-auto mb-8">
              Join thousands of satisfied customers who trust Security Platform
              to protect their homes and businesses. Get your personalized quote
              in minutes.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {benefits.map((benefit) => (
                <div
                  key={benefit.text}
                  className="flex items-center gap-2 text-white"
                >
                  <benefit.icon className="w-5 h-5 text-red-200" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-red-700 font-semibold rounded-xl transition-colors group"
              >
                Get Free Quote
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+18005551234"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call 1-800-555-1234
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-red-200 mb-4">Trusted & Certified</p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                {["UL Listed", "BBB A+ Rating", "5-Star Reviews", "Licensed & Insured"].map(
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
