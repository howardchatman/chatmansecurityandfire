"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Wifi,
  Smartphone,
  Camera,
  Bell,
  Lock,
  ArrowRight,
} from "lucide-react";

const features = [
  { icon: Wifi, label: "Smart Connectivity" },
  { icon: Camera, label: "HD Surveillance" },
  { icon: Bell, label: "Instant Alerts" },
  { icon: Lock, label: "Access Control" },
  { icon: Smartphone, label: "Mobile App" },
  { icon: Shield, label: "24/7 Protection" },
];

export default function Hero() {
  return (
    <section className="relative pt-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-50" />

      {/* Decorative Elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-neutral-200 rounded-full blur-3xl opacity-30" />

      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-16 lg:py-24">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full text-red-700 text-sm font-medium mb-6"
            >
              <Shield className="w-4 h-4" />
              <span>Trusted by 50,000+ Customers</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Take Ultimate
              <br />
              <span className="text-gradient">Control</span> of Your
              <br />
              Home Security
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 max-w-xl mb-8">
              Advanced smart security systems with professional monitoring,
              video surveillance, and fire protection. Control everything
              from your smartphone.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-red-500/30 group"
              >
                Get Free Quote
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-full transition-all"
              >
                View Products
              </Link>
            </div>

            {/* Feature Icons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:shadow-lg group-hover:scale-110 transition-all border border-gray-100">
                    <feature.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-xs text-gray-500 text-center">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main Product Image */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-200 to-neutral-300 rounded-3xl blur-3xl opacity-40 scale-90" />

              {/* Product Display */}
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                {/* Camera/Panel Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600&fit=crop"
                    alt="Security Camera"
                    width={400}
                    height={400}
                    className="object-cover rounded-2xl"
                  />

                  {/* Overlay Stats */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Live Status</p>
                        <p className="font-semibold text-gray-900">All Systems Active</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-600">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900">Smart Security Camera</h3>
                  <p className="text-gray-500 mt-1">4K Ultra HD • Night Vision • AI Detection</p>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <span className="text-2xl font-bold text-red-600">$199</span>
                    <span className="text-sm text-gray-400 line-through">$299</span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                      SAVE 33%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Product Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Motion Sensor</p>
                  <p className="text-sm text-gray-500">$49</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-neutral-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Smart Lock</p>
                  <p className="text-sm text-gray-500">$149</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-neutral-900 py-8">
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50,000+", label: "Protected Homes" },
              { value: "99.9%", label: "System Uptime" },
              { value: "< 30s", label: "Response Time" },
              { value: "4.9★", label: "Customer Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
