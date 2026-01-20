"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Home,
  Building2,
  Flame,
  Camera,
  Smartphone,
  Bell,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Residential Security",
    description:
      "Complete home protection with smart sensors, cameras, and 24/7 professional monitoring.",
    features: ["Door/Window Sensors", "Motion Detection", "Glass Break Sensors"],
    href: "/services/residential",
    color: "red",
  },
  {
    icon: Building2,
    title: "Commercial Security",
    description:
      "Enterprise-grade security solutions for businesses of all sizes with access control and video surveillance.",
    features: ["Access Control", "Employee Management", "Asset Protection"],
    href: "/services/commercial",
    color: "neutral",
  },
  {
    icon: Flame,
    title: "Fire Alarm Systems",
    description:
      "Advanced fire detection and suppression systems with automatic emergency dispatch.",
    features: ["Smoke Detection", "Heat Sensors", "CO2 Monitoring"],
    href: "/services/fire-alarm",
    color: "red",
  },
  {
    icon: Camera,
    title: "Video Surveillance",
    description:
      "HD cameras with AI-powered analytics, night vision, and cloud storage for complete visibility.",
    features: ["4K Resolution", "Night Vision", "Cloud Storage"],
    href: "/services/surveillance",
    color: "neutral",
  },
  {
    icon: Smartphone,
    title: "Smart Home Integration",
    description:
      "Connect your security system with smart home devices for seamless automation and control.",
    features: ["Voice Control", "Smart Locks", "Lighting Automation"],
    href: "/services/smart-home",
    color: "red",
  },
  {
    icon: Bell,
    title: "24/7 Monitoring",
    description:
      "Professional monitoring center with rapid response times and direct police/fire dispatch.",
    features: ["< 30s Response", "Direct Dispatch", "Video Verification"],
    href: "/services/monitoring",
    color: "neutral",
  },
];

const colorClasses = {
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    hover: "group-hover:bg-red-100",
    dot: "bg-red-500",
  },
  neutral: {
    bg: "bg-neutral-100",
    border: "border-neutral-300",
    text: "text-neutral-700",
    hover: "group-hover:bg-neutral-200",
    dot: "bg-neutral-600",
  },
};

export default function Services() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-red-50 border border-red-200 rounded-full text-red-600 text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Complete Security Solutions
          </h2>
          <p className="text-gray-600 text-lg">
            From residential to commercial, we provide comprehensive security
            and fire safety solutions tailored to your needs.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const colors = colorClasses[service.color as keyof typeof colorClasses];
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={service.href}
                  className="group block h-full bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 ${colors.bg} ${colors.hover} border ${colors.border} rounded-2xl flex items-center justify-center mb-5 transition-colors`}
                  >
                    <service.icon className={`w-7 h-7 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <span className={`w-1.5 h-1.5 ${colors.dot} rounded-full`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600 group-hover:text-red-700 transition-colors mt-auto">
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
