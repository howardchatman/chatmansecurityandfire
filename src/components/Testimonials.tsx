"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    location: "Houston, TX",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    rating: 5,
    text: "After our neighborhood had a series of break-ins, we decided to get Security Platform. The installation was quick, and the app makes it so easy to monitor everything. We finally feel safe.",
  },
  {
    name: "Michael Chen",
    role: "Business Owner",
    location: "Dallas, TX",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    rating: 5,
    text: "Managing security for three store locations used to be a nightmare. Now I can see everything from one dashboard. The access control feature has been a game-changer for employee management.",
  },
  {
    name: "Emily Rodriguez",
    role: "Property Manager",
    location: "Austin, TX",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    rating: 5,
    text: "I manage 50+ rental units and Security Platform has made my job so much easier. The tenant portal is intuitive, and the 24/7 support is genuinely helpful. Highly recommend!",
  },
  {
    name: "David Thompson",
    role: "Homeowner",
    location: "San Antonio, TX",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    rating: 5,
    text: "The response time is incredible. When we accidentally triggered the alarm, dispatch called within 20 seconds. It's reassuring to know they're always watching.",
  },
  {
    name: "Jennifer Williams",
    role: "Restaurant Owner",
    location: "Fort Worth, TX",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    rating: 5,
    text: "We had a fire scare last year that could have been devastating. The early detection system alerted us and the fire department immediately. Worth every penny.",
  },
  {
    name: "Robert Martinez",
    role: "IT Director",
    location: "Houston, TX",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    rating: 5,
    text: "From a technical standpoint, Security Platform's integration capabilities are impressive. The API is well-documented, and their team was incredibly helpful during our custom setup.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-red-50 border border-red-200 rounded-full text-red-600 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-gray-600 text-lg">
            Don&apos;t just take our word for it. Here&apos;s what our customers have to say
            about their experience with Security Platform.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-red-100" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-red-500 fill-red-500"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-neutral-900 rounded-2xl"
        >
          {[
            { value: "4.9/5", label: "Average Rating" },
            { value: "50,000+", label: "Protected Properties" },
            { value: "15+", label: "Years Experience" },
            { value: "99.9%", label: "Customer Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
