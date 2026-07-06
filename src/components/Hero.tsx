"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

const stats = [
  { value: "Since 2009", label: "Serving Houston" },
  { value: "New Construction", label: "& Retrofits" },
  { value: "24/7", label: "Dispatch" },
  { value: "Licensed", label: "& Insured" },
];

export default function Hero() {
  return (
    <>
      {/* Full-bleed cinematic video loop — no text over the picture */}
      <section className="relative h-[72vh] min-h-[440px] overflow-hidden bg-[#0D1B2A]">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-sprinkler-dark.png"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-loop.mp4" type="video/mp4" />
        </video>
        {/* Blend the bottom of the video into the section below */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0D1B2A] to-transparent" />
      </section>

      {/* Message below the picture */}
      <section className="relative bg-[#0D1B2A]">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-orange-500 font-semibold tracking-[0.25em] uppercase text-sm mb-5"
            >
              Houston Fire Protection Infrastructure
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-6"
            >
              From blueprint to <span className="text-orange-500">certificate of occupancy.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-xl text-gray-300 mb-9 max-w-xl"
            >
              Design, permitting, installation, and inspection — one fire
              protection partner for your entire build.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-600/30"
              >
                Request a Bid
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:+18328597009"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/25 hover:border-white/60 hover:bg-white/5 text-white font-semibold rounded-full transition-all"
              >
                <Phone className="w-5 h-5" />
                (832) 859-7009
              </a>
            </motion.div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-white/10">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * i }}
                >
                  <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
