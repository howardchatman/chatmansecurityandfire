"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bell, Phone, ArrowLeft, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";
import LeadCaptureForm from "@/components/LeadCaptureForm";

const faqs = [
  {
    question: "How much does a commercial fire alarm system cost in Houston?",
    answer:
      "It depends on the building size, occupancy type, and whether you need a conventional or addressable system. A basic conventional system for a small commercial space starts around $8,000. Larger buildings with addressable panels and voice evacuation can run $25,000 to $35,000 or more. We provide exact pricing after a free on-site assessment.",
  },
  {
    question: "Do I need a fire alarm system in my commercial building?",
    answer:
      "It depends on your building's occupancy classification under the International Fire Code (IFC) Section 907. Most commercial buildings over a certain size or occupant load require a fire alarm system. Some occupancy types like daycares (Group E), assembly spaces (Group A), and healthcare facilities (Group I) have stricter requirements. We can assess your building and tell you exactly what's required.",
  },
  {
    question: "What happens if I fail a fire marshal inspection?",
    answer:
      "You'll receive a deficiency report listing each violation. You typically have a set number of days to make corrections and schedule a reinspection. We review deficiency reports, make all required corrections, and coordinate with the fire marshal for reinspection. Most correction jobs are completed in one to two visits.",
  },
  {
    question: "How often does a fire alarm system need to be inspected?",
    answer:
      "NFPA 72 requires annual inspections for most fire alarm systems, with some devices requiring semi-annual or quarterly testing. Your local fire marshal may conduct their own inspections as well.",
  },
  {
    question: "Do I need a permit for fire alarm work in Texas?",
    answer:
      "Yes. The Texas State Fire Marshal (TSFM) requires a permit for all fire alarm installations and alterations. If your previous contractor did work without pulling a TSFM permit, your system may not be recognized as code-compliant.",
  },
  {
    question: "What's the difference between a conventional and addressable fire alarm system?",
    answer:
      "A conventional system groups devices into zones — when a device activates, the panel identifies the zone but not the specific device. An addressable system gives every device a unique address, so the panel reports exactly which device activated and where. Addressable systems cost more upfront but provide faster response, easier troubleshooting, and are required in larger or more complex buildings.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && <p className="pb-5 text-gray-600 leading-relaxed">{answer}</p>}
    </div>
  );
}

const pricingRows = [
  { scope: "Single device replacement or trouble call", range: "$750 – $1,500" },
  { scope: "Inspection correction (3–5 deficiencies)", range: "$1,500 – $3,500" },
  { scope: "Panel replacement (conventional)", range: "$3,000 – $6,000" },
  { scope: "New conventional system (under 5,000 SF)", range: "$8,000 – $15,000" },
  { scope: "New addressable system (5,000–10,000 SF)", range: "$15,000 – $30,000" },
  { scope: "Voice evacuation system (add-on)", range: "$5,000 – $12,000+" },
];

const relatedServices = [
  {
    title: "Fire Marshal Compliance",
    href: "/services/fire-marshal-compliance",
    description: "Failed your inspection? We correct deficiencies and get you reinspection-ready.",
  },
  {
    title: "Fire Sprinkler Systems",
    href: "/services/fire-sprinkler",
    description: "Many buildings require both fire alarm and sprinkler systems. We install and coordinate both.",
  },
  {
    title: "Emergency Lighting",
    href: "/services/emergency-lighting",
    description: "Exit signs and emergency lights are often cited alongside fire alarm deficiencies.",
  },
  {
    title: "Consulting",
    href: "/services/consulting",
    description: "Not sure what your building requires? We provide code compliance assessments.",
  },
];

export default function FireAlarmContent() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section
          className="relative py-16 lg:py-24"
          style={{
            backgroundImage: "url('/fire_alarm_wide.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#1a1a1a",
          }}
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-orange-400 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Bell className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Commercial Fire Alarm Systems in Houston, TX
              </h1>
              <p className="text-lg text-white/90 mb-4 max-w-3xl">
                We install, service, and correct commercial fire alarm systems for properties across Houston and Greater Texas. Whether you need a brand new addressable system designed from the ground up, a panel swap on an aging conventional setup, or corrections to pass a fire marshal reinspection, we handle it start to finish. Every system we touch is built to NFPA 72 and local fire code requirements, permitted through the Texas State Fire Marshal, and ready for inspection the day we walk off the job.
              </p>
              <p className="text-base text-white/75 mb-8 max-w-3xl">
                We are a licensed fire alarm contractor. We do not sell residential monitoring packages or DIY kits. All work is commercial-grade and inspection-focused.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+18328597009"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call (832) 859-7009
                </a>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full transition-colors"
                >
                  Request a Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl py-16 space-y-16">

            {/* What We Do */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">What We Do</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">New Fire Alarm System Design and Installation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Full system design for new construction, tenant buildouts, and occupancy changes. We size the system to your building's square footage, occupancy classification, and AHJ requirements. We work with conventional panels (Fire-Lite MS series), addressable panels (Edwards EST, Fire-Lite ES-200X), and voice evacuation systems for buildings that require them under NFPA 72 Section 24.4.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Inspection Corrections and Reinspection Support</h3>
                  <p className="text-gray-600 leading-relaxed">
                    If your building failed a fire marshal inspection, we review the deficiency report, identify every item that needs correction, and get you back into compliance. Common corrections include replacing missing or expired smoke detectors, repairing trouble conditions on the panel, adding pull stations at required exit locations, and fixing notification appliance coverage gaps.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Trouble and Supervisory Diagnostics</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Panel showing a trouble light? Supervisory condition you can't clear? We diagnose and resolve ground faults, open circuits, device failures, and communication issues. Most trouble calls are resolved in a single visit.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Panel Replacement and Upgrades</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Aging panels eventually hit end-of-life. Parts become unavailable, the AHJ stops accepting them, or the building changes use and the old panel can't support the new device count. We remove the old panel and install a current, code-compliant replacement — new panel, device remapping, programming, and permit.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fire Alarm Monitoring and Communication</h3>
                  <p className="text-gray-600 leading-relaxed">
                    NFPA 72 requires supervised signal transmission to a listed monitoring station. We install and program communicators (cellular CLSS, IP, or dual-path) and coordinate monitoring setup so your alarm signals reach the right central station and dispatch.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                Need sprinkler monitoring tied into your fire alarm?{" "}
                <Link href="/services/fire-sprinkler" className="text-orange-600 hover:underline font-medium">
                  See our fire sprinkler services →
                </Link>
              </p>
            </motion.section>

            {/* How a Project Works */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">How a Project Works</h2>
              <ol className="space-y-6">
                {[
                  {
                    step: "Assessment",
                    detail: "We visit the property, review the existing system (if any), check the building's occupancy classification, and identify what the applicable fire code requires. If you have a failed inspection report, we review it line by line.",
                  },
                  {
                    step: "Proposal",
                    detail: "You get a written scope of work with category-level pricing, the devices and equipment included, the applicable code references, and a clear timeline. No surprises, no open-ended change orders.",
                  },
                  {
                    step: "Permitting",
                    detail: "We pull the required Texas State Fire Marshal (TSFM) permit for fire alarm installation or alteration. This is required by state law for any fire alarm work in Texas. If your previous contractor skipped this step, that's a compliance problem we can help you fix.",
                  },
                  {
                    step: "Installation",
                    detail: "Our crew installs the system. Wiring, devices, panels, programming, and testing. We document everything and leave the system in a testable, inspection-ready state.",
                  },
                  {
                    step: "Final Inspection",
                    detail: "We coordinate with your local AHJ (fire marshal) for final inspection. We are on-site for the inspection and handle any punch list items on the spot.",
                  },
                ].map((item, i) => (
                  <li key={item.step} className="flex gap-5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{item.step}</p>
                      <p className="text-gray-600 leading-relaxed">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-sm text-gray-500">
                Not sure what your building needs?{" "}
                <Link href="/recommend" className="text-orange-600 hover:underline font-medium">
                  Use our free Service Recommender →
                </Link>
              </p>
            </motion.section>

            {/* Codes */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Applicable Codes and Standards</h2>
              <p className="text-gray-600 mb-6">Every fire alarm system we design and install is governed by a specific set of codes. Here's what applies in Texas:</p>
              <ul className="space-y-4 mb-6">
                {[
                  {
                    code: "NFPA 72 (National Fire Alarm and Signaling Code)",
                    detail: "Governs system design, device placement, spacing, notification appliance coverage, and inspection/testing/maintenance requirements. Most Texas jurisdictions have adopted either the 2019 or 2022 edition.",
                  },
                  {
                    code: "2021 International Fire Code (IFC) Section 907",
                    detail: "Establishes which occupancy types require fire alarm systems and what type of initiating and notification devices are required. This is where the answer to 'do I even need a fire alarm?' comes from.",
                  },
                  {
                    code: "2021 International Building Code (IBC)",
                    detail: "Works alongside the IFC to define occupancy classifications, means of egress requirements (which affect pull station placement), and construction type thresholds.",
                  },
                  {
                    code: "2020 National Electrical Code (NEC) / NFPA 70",
                    detail: "Governs the electrical installation, circuit integrity, and wiring methods for fire alarm circuits.",
                  },
                  {
                    code: "Texas State Fire Marshal (TSFM) permits",
                    detail: "Required for all fire alarm installations and alterations in Texas, regardless of the local jurisdiction.",
                  },
                ].map(({ code, detail }) => (
                  <li key={code} className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <p className="text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">{code}</strong> — {detail}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 rounded-xl p-4">
                Understanding how these codes interact is part of the job. For example, a recent daycare project required us to apply an IBC code exception that eliminated the need for pull stations at certain exits — saving the client over $1,000 in device and wiring costs.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Need help interpreting a fire marshal deficiency report?{" "}
                <Link href="/services/fire-marshal-compliance" className="text-orange-600 hover:underline font-medium">
                  See our compliance services →
                </Link>
              </p>
            </motion.section>

            {/* System Types */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">System Types We Install</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    type: "Conventional",
                    desc: "Zone-based systems where devices are grouped by circuit. Best suited for smaller buildings under 10,000 square feet with straightforward layouts.",
                  },
                  {
                    type: "Addressable",
                    desc: "Every device has a unique address on the panel, allowing precise identification of which device activated. Required for larger buildings and recommended for any multi-zone installation.",
                  },
                  {
                    type: "Voice Evacuation",
                    desc: "Buildings with certain occupancy types or high occupant loads require voice evacuation instead of standard horn/strobes. The system delivers pre-recorded or live voice messages through speaker/strobes.",
                  },
                ].map(({ type, desc }) => (
                  <div key={type} className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{type}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Pricing */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Pricing</h2>
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Scope</th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-700">Typical Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pricingRows.map(({ scope, range }) => (
                      <tr key={scope} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-gray-700">{scope}</td>
                        <td className="px-5 py-4 text-right font-semibold text-orange-600">{range}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                These are general ranges. Every building is different. We provide exact pricing after an on-site assessment.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Payment: 30% at signing, 30% at crew mobilization, 30% at substantial completion, 10% after passing final inspection. We accept Zelle, Square, and check.
              </p>
              <div className="mt-5">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full text-sm transition-colors"
                >
                  Get an exact quote for your building
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.section>

            {/* Service Areas */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Service Areas</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We install and service fire alarm systems across Texas, with primary coverage in Houston, Missouri City, Sugar Land, Pearland, The Woodlands, and surrounding areas. We also travel to Dallas, Austin, San Antonio, Fort Worth, College Station, Waco, Denton, and Lufkin for larger projects.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                {[
                  { label: "Houston", slug: "houston" },
                  { label: "Dallas", slug: "dallas" },
                  { label: "Austin", slug: "austin" },
                  { label: "San Antonio", slug: "san-antonio" },
                  { label: "Fort Worth", slug: "fort-worth" },
                ].map(({ label, slug }) => (
                  <Link
                    key={slug}
                    href={`/service-areas/${slug}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 hover:text-orange-700 rounded-full transition-colors text-gray-700 font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* FAQ */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              <div className="bg-white rounded-2xl border border-gray-200 px-6">
                {faqs.map((faq) => (
                  <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </motion.section>

            {/* Related Services */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Related Services</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedServices.map(({ title, href, description }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group block bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-2xl p-5 transition-all"
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-orange-700 mb-1">
                      {title} <ArrowRight className="inline w-3.5 h-3.5 ml-1" />
                    </p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </Link>
                ))}
              </div>
            </motion.section>

          </div>
        </div>

        <LeadCaptureForm
          variant="inline"
          heading="Request a Fire Alarm Quote"
          subtext="Tell me about your building. I'll get back to you within one business day."
          service="Fire Alarm Systems"
        />
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
