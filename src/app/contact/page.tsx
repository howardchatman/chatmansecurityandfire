"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  ArrowRight,
  Zap,
  Calendar,
  Building2,
  Shield,
  MessageSquare,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";

const contactMethods = [
  {
    title: "Call Us",
    description: "Speak directly with our team",
    value: "(832) 430-1826",
    href: "tel:+18324301826",
    icon: Phone,
    color: "bg-green-500",
    available: "Mon-Fri 7AM-6PM, Sat 8AM-2PM",
  },
  {
    title: "Text Us",
    description: "Quick questions via SMS",
    value: "(832) 430-1826",
    href: "sms:+18324301826",
    icon: MessageCircle,
    color: "bg-blue-500",
    available: "Responses within 30 min",
  },
  {
    title: "Email Us",
    description: "For detailed inquiries",
    value: "info@chatmansecurityandfire.com",
    href: "mailto:info@chatmansecurityandfire.com",
    icon: Mail,
    color: "bg-orange-500",
    available: "24/7 - Response within 24hrs",
  },
  {
    title: "Emergency Line",
    description: "24/7 urgent service",
    value: "(832) 430-1826",
    href: "tel:+18324301826",
    icon: Zap,
    color: "bg-red-500",
    available: "Available 24/7/365",
  },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/chatmansecurity", color: "hover:bg-blue-600" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/chatmansecurity", color: "hover:bg-pink-600" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/chatmansecurity", color: "hover:bg-blue-700" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/chatmansecurity", color: "hover:bg-sky-500" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@chatmansecurity", color: "hover:bg-red-600" },
];

const serviceAreas = [
  "Houston",
  "Dallas",
  "Fort Worth",
  "Austin",
  "San Antonio",
  "Galveston",
  "The Woodlands",
  "Sugar Land",
  "Katy",
  "Pearland",
  "League City",
  "Pasadena",
];

const businessHours = [
  { day: "Monday - Friday", hours: "7:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "8:00 AM - 2:00 PM" },
  { day: "Sunday", hours: "Emergency Only" },
  { day: "Holidays", hours: "Emergency Only" },
];

const inquiryTypes = [
  "Failed Inspection - Need Corrections",
  "Schedule Routine Inspection",
  "Fire Alarm Service",
  "Fire Sprinkler Service",
  "Fire Extinguisher Service",
  "Emergency Lighting",
  "Fire Lane Marking",
  "Consulting",
  "General Question",
  "Request a Quote",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "",
    message: "",
    preferredContact: "phone",
    urgency: "normal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          source: "contact_page",
          metadata: {
            inquiry_type: formData.inquiryType,
            message: formData.message,
            preferred_contact: formData.preferredContact,
            urgency: formData.urgency,
          },
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          inquiryType: "",
          message: "",
          preferredContact: "phone",
          urgency: "normal",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
                <MessageSquare className="w-4 h-4" />
                Get In Touch
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Let's Talk About Your{" "}
                <span className="text-orange-500">Fire Safety Needs</span>
              </h1>
              <p className="text-xl text-gray-300">
                Failed an inspection? Have questions? We're here to help. Reach out
                through any channel that works best for you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Contact Methods */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={method.title}
                  href={method.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-gray-50 hover:bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
                >
                  <div
                    className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{method.description}</p>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {method.value}
                  </p>
                  <p className="text-xs text-gray-400">{method.available}</p>
                  <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Fill out the form below and we'll get back to you within 24
                    hours (usually much faster).
                  </p>

                  {submitStatus === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Thank you for reaching out. We'll be in touch shortly.
                      </p>
                      <button
                        onClick={() => setSubmitStatus("idle")}
                        className="text-orange-600 font-medium hover:text-orange-700"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Urgency Banner */}
                      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                        {[
                          { value: "normal", label: "General Inquiry" },
                          { value: "urgent", label: "Urgent - Failed Inspection" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, urgency: option.value })
                            }
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                              formData.urgency === option.value
                                ? option.value === "urgent"
                                  ? "bg-red-500 text-white"
                                  : "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {option.value === "urgent" && (
                              <Zap className="w-4 h-4 inline mr-1" />
                            )}
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company/Property Name
                          </label>
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) =>
                              setFormData({ ...formData, company: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            placeholder="ABC Corporation"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            placeholder="john@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What do you need help with? *
                        </label>
                        <select
                          required
                          value={formData.inquiryType}
                          onChange={(e) =>
                            setFormData({ ...formData, inquiryType: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white"
                        >
                          <option value="">Select an option...</option>
                          {inquiryTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Details
                        </label>
                        <textarea
                          rows={4}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors resize-none"
                          placeholder="Tell us about your situation, property type, inspection deadline, etc..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Preferred Contact Method
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { value: "phone", label: "Phone Call", icon: Phone },
                            { value: "text", label: "Text Message", icon: MessageCircle },
                            { value: "email", label: "Email", icon: Mail },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  preferredContact: option.value,
                                })
                              }
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                                formData.preferredContact === option.value
                                  ? "border-orange-500 bg-orange-50 text-orange-700"
                                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {submitStatus === "error" && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm">
                            Something went wrong. Please try again or call us directly.
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-xl transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Business Hours */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Business Hours
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {businessHours.map((item) => (
                      <div
                        key={item.day}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">{item.day}</span>
                        <span className="font-medium text-gray-900">
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Areas */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Service Areas
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Proudly serving properties across Texas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connect With Us */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Connect With Us
                  </h3>
                  <div className="flex gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 ${social.color} hover:text-white transition-all`}
                        title={social.name}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quick Schedule */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold">Need It Fast?</h3>
                  </div>
                  <p className="text-orange-100 text-sm mb-4">
                    Call us directly to schedule same-day or next-day service for
                    urgent inspection corrections.
                  </p>
                  <a
                    href="tel:+18324301826"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    (832) 430-1826
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Serving the Greater Houston Area & Beyond
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Based in Houston, we serve commercial and residential properties
                throughout Texas. Need service outside our listed areas? Give us a
                call—we'll do our best to help.
              </p>
            </motion.div>

            <div className="bg-gray-100 rounded-3xl overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d443088.1293981498!2d-95.73659399999999!3d29.817178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640b8b4488d8501%3A0xca0d02def365053b!2sHouston%2C%20TX!5e0!3m2!1sen!2sus!4v1706000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Service Area Map"
              />
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-16 bg-neutral-900">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  How fast can you respond?
                </h3>
                <p className="text-gray-400 text-sm">
                  For urgent inspection failures, we often provide same-day or
                  next-day service. Call for availability.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  What properties do you serve?
                </h3>
                <p className="text-gray-400 text-sm">
                  Commercial, industrial, and multi-family residential. From small
                  retail to large warehouses.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Are you licensed & insured?
                </h3>
                <p className="text-gray-400 text-sm">
                  Yes. We're State Fire Marshal licensed, fully insured, and our
                  technicians are NICET certified.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
