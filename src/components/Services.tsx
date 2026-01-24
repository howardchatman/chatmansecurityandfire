"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Bell,
  Droplets,
  FlameKindling,
  Lightbulb,
  PaintBucket,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Shield,
    title: "Fire Marshal Compliance",
    description: "Violation corrections and reinspection support.",
    href: "/services/fire-marshal-compliance",
  },
  {
    icon: Bell,
    title: "Fire Alarm Systems",
    description: "Installs, repairs, and troubleshooting.",
    href: "/services/fire-alarm",
  },
  {
    icon: Droplets,
    title: "Fire Sprinkler Systems",
    description: "Modifications, repairs, and inspections.",
    href: "/services/fire-sprinkler",
  },
  {
    icon: FlameKindling,
    title: "Fire Extinguishers",
    description: "Sales, service, and tagging.",
    href: "/services/fire-extinguishers",
  },
  {
    icon: Lightbulb,
    title: "Emergency Lighting",
    description: "Exit signs and emergency lights.",
    href: "/services/emergency-lighting",
  },
  {
    icon: PaintBucket,
    title: "Fire Lane Markings",
    description: "Striping and repainting.",
    href: "/services/fire-lane-marking",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-orange-600 font-medium mb-4">What We Do</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Full-service fire & life-safety
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={service.href}
                className="group block h-full p-8 bg-gray-50 hover:bg-orange-50 rounded-2xl transition-colors"
              >
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <span className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
