"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Phone,
  CheckCircle,
  ArrowLeft,
  Star,
  Lock,
  Wifi,
  Camera,
  Bell,
  FileText,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const features = [
  {
    icon: Shield,
    title: "24/7 Professional Monitoring",
    description: "Round-the-clock monitoring by Brinks certified professionals who respond immediately to alerts.",
  },
  {
    icon: Bell,
    title: "Intrusion Detection",
    description: "Door, window, and motion sensors that detect unauthorized entry and trigger instant alerts.",
  },
  {
    icon: Camera,
    title: "Security Cameras",
    description: "Indoor and outdoor cameras with live streaming and recorded footage accessible from your phone.",
  },
  {
    icon: Wifi,
    title: "Smart Home Integration",
    description: "Control locks, lights, and your security system from the Brinks Home app — anywhere, anytime.",
  },
  {
    icon: Lock,
    title: "Smart Door Locks",
    description: "Keyless entry with real-time access control — lock and unlock remotely from your smartphone.",
  },
  {
    icon: Bell,
    title: "Fire & CO Detection",
    description: "Smoke, heat, and carbon monoxide detectors integrated into your complete security system.",
  },
];

const equipment = [
  "Control panel & keypad",
  "Door & window sensors",
  "Motion detectors",
  "Indoor & outdoor cameras",
  "Smart door locks",
  "Smoke & CO detectors",
  "Glass break sensors",
  "Yard signs & window decals",
];

export default function SecurityAlarmPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          </div>

          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-orange-400 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Authorized Dealer Badge */}
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                  <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span className="text-white text-sm font-semibold">Authorized Brinks Security Dealer</span>
                </div>

                {/* Slogan */}
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                  Secure your Home,
                  <br />
                  <span className="text-orange-400">Secure your Peace!</span>
                </h1>

                <p className="text-xl text-white/80 mb-8">
                  As an authorized Brinks dealer, we bring professional-grade home and business security
                  to the Houston area — with expert installation and ongoing support.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="tel:+18328597009"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Call (832) 859-7009
                  </a>
                  <a
                    href="/Equipment Lineup.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    View Equipment Lineup
                  </a>
                </div>
              </motion.div>

              {/* Brinks Logo Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">
                  <Image
                    src="/brinks_logo_blue.png"
                    alt="Brinks Home Security"
                    width={260}
                    height={100}
                    className="mx-auto mb-6 h-16 w-auto object-contain"
                  />
                  <div className="border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-500 mb-1">Your local Brinks dealer</p>
                    <p className="text-lg font-bold text-gray-900">Chatman Security & Fire</p>
                    <p className="text-sm text-gray-500 mt-1">Houston, TX & Surrounding Areas</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <User className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Sales: Ecko Steadman</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <p className="text-orange-600 font-medium mb-4">Complete Protection</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Everything you need to stay safe
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-orange-50 rounded-xl w-fit mb-4">
                    <feature.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Equipment List */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-orange-600 font-medium mb-4">Brinks Equipment</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Professional-grade gear, expertly installed
                </h2>
                <p className="text-gray-600 mb-8">
                  Every system uses genuine Brinks equipment — the same trusted hardware
                  protecting millions of homes and businesses nationwide.
                </p>

                <ul className="space-y-3 mb-8">
                  {equipment.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/Equipment Lineup.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Download Full Equipment Lineup (PDF)
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Image
                    src="/brinks_logo_blue.png"
                    alt="Brinks"
                    width={140}
                    height={50}
                    className="h-10 w-auto object-contain"
                  />
                  <span className="text-gray-400">×</span>
                  <Image
                    src="/csf_wide_logo.png"
                    alt="Chatman Security & Fire"
                    width={140}
                    height={50}
                    className="h-10 w-auto object-contain"
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Why choose us as your Brinks dealer?
                </h3>
                <ul className="space-y-4">
                  {[
                    "Local Houston experts who know your neighborhood",
                    "Professional installation — no DIY hassle",
                    "Fire & life-safety expertise built in",
                    "Ongoing service & support after install",
                    "Combined fire + security = one trusted partner",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact / CTA */}
        <section className="py-20 bg-gray-900">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to secure your home?
              </h2>
              <p className="text-xl text-gray-300 mb-3">
                Talk to our Brinks sales representative today.
              </p>
              <div className="flex items-center justify-center gap-2 mb-8">
                <User className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-semibold text-lg">Ecko Steadman — Brinks Sales</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+18328597009"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call (832) 859-7009
                </a>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-full transition-colors"
                >
                  Request a Quote
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
