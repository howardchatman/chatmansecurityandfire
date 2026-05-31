"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Fire Marshal Compliance",
    description: "Failed an inspection? I'll review the report, fix every deficiency, and get you reinspection-ready.",
    href: "/services/fire-marshal-compliance",
    image: "/fire_marshal.png",
  },
  {
    title: "Fire Alarm Systems",
    description: "New systems, panel replacements, trouble calls. I design it to code and permit it through the state.",
    href: "/services/fire-alarm",
    image: "/fire_alarm.png",
  },
  {
    title: "Fire Sprinkler Systems",
    description: "Sprinkler installs, modifications, and inspection corrections. NFPA 13 compliant.",
    href: "/services/fire-sprinkler",
    image: "/fire_sprinkler.png",
  },
  {
    title: "Fire Extinguishers",
    description: "Sales, inspections, and annual tagging. I keep you current.",
    href: "/services/fire-extinguishers",
    image: "/fire_extinguisher.png",
  },
  {
    title: "Emergency Lighting",
    description: "Exit signs and emergency lights. These get cited on almost every inspection.",
    href: "/services/emergency-lighting",
    image: "/emergency_lights.png",
  },
  {
    title: "Fire Lane Markings",
    description: "Curb striping and repainting. Quick turnaround.",
    href: "/services/fire-lane-marking",
    image: "/fire_lane_marking.png",
  },
  {
    title: "Consulting",
    description: "Not sure what your building needs? I'll walk the property and tell you exactly what code requires.",
    href: "/services/consulting",
    image: "/consulting.png",
  },
  {
    title: "Security Alarm",
    description: "Home and business security through Brinks. Professional install, 24/7 monitoring.",
    href: "/services/security-alarm",
    image: "/brinks_logo_blue.png",
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            What I Can Help You With
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
                className="group block h-full rounded-2xl overflow-hidden relative"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${service.image})` }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Content */}
                <div className="relative z-10 p-8 h-full min-h-[280px] flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-200 mb-4">{service.description}</p>
                  <span className="inline-flex items-center gap-2 text-orange-400 font-medium group-hover:gap-3 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
