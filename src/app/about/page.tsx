"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Award,
  Users,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Building2,
  Target,
  Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const stats = [
  { label: "Years in Business", value: "15+", icon: Clock },
  { label: "Properties Protected", value: "2,500+", icon: Building2 },
  { label: "Inspections Passed", value: "10,000+", icon: CheckCircle },
  { label: "5-Star Reviews", value: "500+", icon: Star },
];

const values = [
  {
    title: "Integrity First",
    description:
      "We never recommend services you don't need. Our reputation is built on honest assessments and fair pricing.",
    icon: Shield,
  },
  {
    title: "Rapid Response",
    description:
      "Failed inspection? We understand the urgency. Our team mobilizes quickly to get you back in compliance.",
    icon: Clock,
  },
  {
    title: "Expert Knowledge",
    description:
      "Our technicians are certified and continuously trained on the latest fire codes and safety standards.",
    icon: Award,
  },
  {
    title: "Customer Focus",
    description:
      "Your success is our success. We work around your schedule and communicate clearly every step of the way.",
    icon: Heart,
  },
];

const certifications = [
  "State Fire Marshal Licensed",
  "NICET Certified Technicians",
  "Factory Trained & Authorized",
  "Fully Insured & Bonded",
  "24/7 Emergency Service",
  "BBB Accredited Business",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                About Chatman Security & Fire
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Protecting Texas Properties{" "}
                <span className="text-orange-500">Since 2009</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                We're a family-owned fire protection company dedicated to keeping
                your property compliant and your people safe. When you fail an
                inspection, we're the team that gets you back on track—fast.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-50 rounded-2xl mb-4">
                    <stat.icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Chatman Security & Fire was founded with a simple mission: help
                    property owners navigate the complex world of fire safety
                    compliance without the stress and confusion.
                  </p>
                  <p>
                    After seeing too many business owners blindsided by failed
                    inspections and unclear requirements, we built a company
                    focused on clarity, speed, and results. We don't just fix
                    problems—we explain them, prevent them, and make sure you're
                    always prepared.
                  </p>
                  <p>
                    Today, we serve commercial and residential properties across
                    Texas, from small retail shops to large industrial facilities.
                    Our team of certified technicians brings decades of combined
                    experience to every job.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Our Mission
                      </h3>
                      <p className="text-gray-500">What drives us every day</p>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    "To be the most trusted fire protection partner in Texas—where
                    every property owner knows exactly what they need, why they
                    need it, and can count on us to deliver it right the first
                    time."
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-100 rounded-3xl -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-gray-600 text-lg">
                These principles guide every interaction, every service call, and
                every recommendation we make.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="py-20 bg-neutral-900">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Credentials You Can Trust
              </h2>
              <p className="text-gray-400 text-lg">
                We maintain the highest industry standards and certifications.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3"
                >
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-white text-sm font-medium">{cert}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-orange-600">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Work With Us?
              </h2>
              <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                Whether you've failed an inspection or want to prevent one, we're
                here to help. Get in touch today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                >
                  Contact Us
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:+18324301826"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-700 text-white font-semibold rounded-full hover:bg-orange-800 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  (832) 430-1826
                </a>
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
