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
    title: "Fire Marshal Compliance & Corrections",
    description: "Violation corrections, reinspection readiness, and problem-solving for delayed openings.",
    features: [
      "Failed inspection fixes",
      "Deficiency corrections & documentation",
      "Owner / GC coordination",
      "Pre-walk + reinspection prep",
    ],
    href: "/services/fire-marshal-compliance",
  },
  {
    icon: Bell,
    title: "Fire Alarm Systems",
    description: "New installs, troubleshooting, repairs, and ongoing readiness for commercial buildings.",
    features: [
      "Device replacements & rewires",
      "Trouble & supervisory diagnostics",
      "Panel programming support",
      "Testing support & records",
    ],
    href: "/services/fire-alarm",
  },
  {
    icon: Droplets,
    title: "Fire Sprinkler Systems",
    description: "Service, modifications, and inspection support—especially for tenant build-outs and changes.",
    features: [
      "Tenant finish-out modifications",
      "Obstruction & coverage issues",
      "Repairs & corrective actions",
      "Inspection coordination",
    ],
    href: "/services/fire-sprinkler",
  },
  {
    icon: FlameKindling,
    title: "Fire Extinguishers",
    description: "Sales, replacements, and service to keep you covered and properly tagged.",
    features: [
      "Replacements & mounting",
      "Tagging & maintenance",
      "Compliance guidance",
    ],
    href: "/services/fire-extinguishers",
  },
  {
    icon: Lightbulb,
    title: "Emergency Lights & Exit Signs",
    description: "Battery swaps, fixture replacements, and functional readiness checks.",
    features: [
      "Battery replacements",
      "Fixture replacements",
      "Operational checks",
    ],
    href: "/services/emergency-lighting",
  },
  {
    icon: PaintBucket,
    title: "Fire Lane Markings",
    description: "Professional fire lane layout and repainting to meet local requirements.",
    features: [
      "New fire lane striping",
      "Repaint / refresh",
      "Coordination with site constraints",
    ],
    href: "/services/fire-lane-marking",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-orange-50 text-orange-700 text-sm font-semibold rounded-full mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Services Built Around Outcomes
          </h2>
          <p className="text-lg text-gray-600">
            We don&apos;t just &quot;install equipment.&quot; We deliver compliance, uptime,
            and accountability across your life-safety systems.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <service.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Link */}
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors group/link"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
