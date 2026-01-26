"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileSearch, Building2, ArrowRight, Sparkles } from "lucide-react";

const tools = [
  {
    name: "Inspection Report Analyzer",
    description: "Upload your failed inspection report and get a plain-English breakdown of every deficiency, plus recommendations for getting back in compliance.",
    href: "/analyze",
    icon: FileSearch,
    cta: "Analyze My Report",
    badge: "Most Popular",
  },
  {
    name: "Service Recommender",
    description: "Tell us about your building and get personalized recommendations for fire safety services based on your building type, size, and local codes.",
    href: "/recommend",
    icon: Building2,
    cta: "Get Recommendations",
    badge: null,
  },
];

export default function FreeTools() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Free AI-Powered Tools
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Not Sure Where to Start?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use our free tools to understand your fire safety needs - no obligation, no sales pitch.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={tool.href}
                className="block h-full bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-orange-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                    <tool.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  {tool.badge && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {tool.description}
                </p>
                <div className="flex items-center gap-2 text-orange-600 font-semibold">
                  {tool.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
