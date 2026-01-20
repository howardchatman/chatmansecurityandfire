"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Star, Zap, Shield } from "lucide-react";

const plans = [
  {
    name: "Essential",
    description: "Basic protection for small homes",
    monthlyPrice: 29.99,
    features: [
      "24/7 Professional Monitoring",
      "1 Control Panel",
      "3 Door/Window Sensors",
      "1 Motion Detector",
      "Mobile App Access",
      "Email & SMS Alerts",
    ],
    notIncluded: [
      "Video Surveillance",
      "Smart Home Integration",
      "Dedicated Support Line",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    description: "Complete protection for families",
    monthlyPrice: 49.99,
    features: [
      "24/7 Professional Monitoring",
      "1 Control Panel with Touchscreen",
      "6 Door/Window Sensors",
      "2 Motion Detectors",
      "1 Indoor HD Camera",
      "Mobile App with Live View",
      "Smart Home Integration",
      "Video Verification",
      "Priority Support",
    ],
    notIncluded: [],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions for businesses",
    monthlyPrice: 99.99,
    features: [
      "24/7 Professional Monitoring",
      "Multiple Control Panels",
      "Unlimited Sensors",
      "Access Control System",
      "4+ HD/4K Cameras",
      "Cloud Video Storage",
      "Employee Management",
      "Custom Integrations",
      "Dedicated Account Manager",
      "On-site Support",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-red-50 border border-red-200 rounded-full text-red-600 text-sm font-medium mb-4">
            Pricing Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-lg">
            No hidden fees. No long-term contracts. Choose the plan that fits
            your security needs.
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
                  ? "bg-white border-2 border-red-500 shadow-xl shadow-red-500/10"
                  : "bg-white border border-gray-200"
              } p-8`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 rounded-full">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-sm font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  + equipment (from $199)
                </p>
              </div>

              {/* CTA */}
              <Link
                href={
                  plan.name === "Enterprise" ? "/contact" : "/contact?plan=" + plan.name.toLowerCase()
                }
                className={`block w-full text-center py-3 rounded-xl font-medium transition-colors mb-8 ${
                  plan.popular
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-neutral-900 hover:bg-neutral-800 text-white"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  What&apos;s included
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.notIncluded.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    {plan.notIncluded.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-gray-400 mb-2"
                      >
                        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          —
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 border border-red-200 rounded-full">
            <Zap className="w-5 h-5 text-red-600" />
            <span className="text-gray-600">
              <strong className="text-gray-900">Free installation</strong> on all
              plans this month!
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
