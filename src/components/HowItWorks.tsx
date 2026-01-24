"use client";

import { motion } from "framer-motion";
import { Phone, AlertTriangle, MessageSquare, FileSearch, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Tell Us What's Wrong",
    description: "Call us or submit details about your inspection failure, deficiency, or project needs. Include your violation notice if you have one.",
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "We Assess & Quote",
    description: "Our team reviews your situation, visits the site if needed, and provides a clear scope and quote for the work required.",
    icon: FileSearch,
  },
  {
    number: "03",
    title: "We Fix It",
    description: "Licensed technicians complete the work, coordinate with the fire marshal, and get you approved for reinspection.",
    icon: CheckCircle,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-neutral-50">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-orange-600 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            From Violation to Approval
          </h2>
          <p className="text-gray-600 text-lg">
            Every building is different. Every inspection is different.
            Here&apos;s how we get you from failed to approved.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line (hidden on mobile, shown between cards on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-orange-200" />
              )}

              <div className="bg-white rounded-2xl border border-gray-200 p-8 relative z-10">
                {/* Step Number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <step.icon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emergency Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-600 rounded-full">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need it done RIGHT NOW?
            </h3>
            <p className="text-gray-300 mb-6 max-w-lg mx-auto">
              Failed inspection. Fire marshal coming back. Opening delayed.
            </p>
            <a
              href="tel:+18324301826"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-full transition-colors"
            >
              <Phone className="w-6 h-6" />
              CALL (832) 430-1826
            </a>
            <p className="text-sm text-gray-400 mt-4">
              Emergency and time-sensitive calls are prioritized.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
