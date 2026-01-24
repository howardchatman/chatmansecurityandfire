"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Fire Marshal Compliance",
    description: "Violation corrections and reinspection support.",
    href: "/services/fire-marshal-compliance",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop",
  },
  {
    title: "Fire Alarm Systems",
    description: "Installs, repairs, and troubleshooting.",
    href: "/services/fire-alarm",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  },
  {
    title: "Fire Sprinkler Systems",
    description: "Modifications, repairs, and inspections.",
    href: "/services/fire-sprinkler",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop",
  },
  {
    title: "Fire Extinguishers",
    description: "Sales, service, and tagging.",
    href: "/services/fire-extinguishers",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&h=400&fit=crop",
  },
  {
    title: "Emergency Lighting",
    description: "Exit signs and emergency lights.",
    href: "/services/emergency-lighting",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
  },
  {
    title: "Fire Lane Markings",
    description: "Striping and repainting.",
    href: "/services/fire-lane-marking",
    image: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&h=400&fit=crop",
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
