"use client";

import { motion } from "framer-motion";
import { Check, Star, Phone, AlertTriangle } from "lucide-react";

const plans = [
  {
    name: "Small Corrections & Service",
    price: "$750 – $2,500",
    subtitle: "Minor issues, fast turnaround",
    features: [
      "Emergency light & exit sign repairs",
      "Batteries, devices, and small replacements",
      "Minor fire alarm corrections",
      "Documentation support",
    ],
    popular: false,
  },
  {
    name: "Inspection Failure Resolution",
    price: "$2,500 – $10,000+",
    subtitle: "Most common engagement",
    features: [
      "Failed fire inspection corrections",
      "Fire alarm & sprinkler deficiencies",
      "Fire lane layout & marking",
      "Coordination with owners & GCs",
      "Reinspection readiness & documentation",
    ],
    popular: true,
  },
  {
    name: "New Construction & Tenant Finish-Out",
    price: "Quoted Per Project",
    subtitle: "Commercial-only work",
    features: [
      "Fire alarm & sprinkler installs",
      "System modifications",
      "Final inspection support",
      "As-builts & closeout coordination",
    ],
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-neutral-50">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-orange-600 text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Project-Based Fire & Life-Safety Services
          </h2>
          <p className="text-gray-600 text-lg">
            Every building is different. Every inspection is different.
            We price based on scope, urgency, and what it takes to get you approved.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl ${
                plan.popular
                  ? "bg-white border-2 border-orange-500 shadow-xl shadow-orange-500/10"
                  : "bg-white border border-gray-200"
              } p-8`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 rounded-full">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-sm font-medium text-white">
                      Most Common
                    </span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-500 text-sm">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm"
                  >
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
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
