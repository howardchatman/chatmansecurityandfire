"use client";

import { motion } from "framer-motion";
import { Phone, AlertTriangle } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Tell us what's wrong",
    description: "Call or submit your inspection report.",
  },
  {
    number: "2",
    title: "We assess & quote",
    description: "Clear scope. No surprises.",
  },
  {
    number: "3",
    title: "We fix it",
    description: "Done right. Reinspection-ready.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-orange-600 font-medium mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Three simple steps
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Emergency CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gray-900 rounded-2xl p-10 md:p-14 text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-orange-600 rounded-full">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Need it done now?
            </h3>
            <p className="text-gray-400 mb-8">
              Failed inspection. Deadline looming. We prioritize urgent calls.
            </p>
            <a
              href="tel:+18324301826"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-full transition-colors"
            >
              <Phone className="w-6 h-6" />
              (832) 430-1826
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
