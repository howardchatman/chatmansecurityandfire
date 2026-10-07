import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HardHat,
  Landmark,
  LayoutDashboard,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import { SITE_URL } from "@/lib/site-services";

export const metadata: Metadata = {
  title: "Government, School District & Municipal Fire and Security Contractor | Houston, TX",
  description:
    "Fire alarm, sprinkler, extinguisher, and security contractor for Texas school districts, cities, counties, and government facilities. We work as the prime contractor or as a subcontractor on public projects. (346) 852-5540",
  keywords: [
    "government fire alarm contractor Texas",
    "school district fire alarm contractor Houston",
    "ISD fire alarm inspection",
    "municipal fire protection contractor",
    "fire alarm subcontractor government contracts",
    "public sector security systems contractor",
    "school security access control Houston",
    "prevailing wage fire alarm contractor",
  ],
  alternates: { canonical: "/government" },
  openGraph: {
    title: "Fire & Security for Government, School Districts & Municipalities | Chatman Security & Fire",
    description:
      "Prime contractor or subcontractor for fire alarm, sprinkler, extinguisher, and security work on public facilities across Houston and Texas.",
    url: `${SITE_URL}/government`,
  },
};

const sectors = [
  {
    icon: GraduationCap,
    title: "School Districts",
    text: "Campus fire alarm and mass notification, sprinkler and extinguisher service, access control, and cameras for ISDs and charter schools, scheduled around the school day.",
  },
  {
    icon: Landmark,
    title: "Cities & Municipalities",
    text: "City halls, police and fire stations, libraries, recreation centers, and utility facilities: new systems, upgrades, and annual inspections.",
  },
  {
    icon: Building2,
    title: "Counties & State Agencies",
    text: "Courthouses, administrative buildings, and public facilities that need code-compliant fire and life safety systems with complete documentation.",
  },
  {
    icon: ShieldCheck,
    title: "Federal Facilities",
    text: "Fire alarm, security, and life safety work on federal buildings, directly or as a subcontractor to the prime contractor.",
  },
];

const services = [
  { name: "Fire alarm & mass notification", href: "/services/fire-alarm" },
  { name: "Fire sprinkler systems", href: "/services/fire-sprinkler" },
  { name: "Fire extinguisher inspection & service", href: "/services/fire-extinguishers" },
  { name: "Emergency & exit lighting", href: "/services/emergency-lighting" },
  { name: "PA, intercom & paging", href: "/services/pa-systems" },
  { name: "Access control", href: "/services/access-control" },
  { name: "Video surveillance", href: "/services/video-surveillance" },
  { name: "Knox Box & fire department access", href: "/services/fire-department-access" },
  { name: "Fire lane marking", href: "/services/fire-lane-marking" },
  { name: "Fiber & network cabling", href: "/services/fiber-optics" },
];

const publicWork = [
  {
    icon: ClipboardCheck,
    title: "Prevailing wage & certified payroll",
    text: "We price to the wage determination in your solicitation and provide certified payroll when the contract requires it.",
  },
  {
    icon: Users,
    title: "Background checks & badging",
    text: "Our crews complete the background checks, badging, and check-in procedures your district or facility requires.",
  },
  {
    icon: CalendarClock,
    title: "Work around your schedule",
    text: "Disruptive work happens after hours, on weekends, or during school breaks, so classes and public services keep running.",
  },
  {
    icon: FileText,
    title: "Documentation that closes out",
    text: "NFPA inspection and test reports, deficiency lists, as-builts, and closeout packages your facilities team and the fire marshal can use.",
  },
  {
    icon: BadgeCheck,
    title: "Licensed, insured, small business",
    text: "Licensed Texas fire protection contractor with NICET-certified technicians. Certificates of insurance are available on request.",
  },
  {
    icon: HardHat,
    title: "Permits through acceptance",
    text: "We pull our own permits, coordinate with the authority having jurisdiction, and run the acceptance test through sign-off.",
  },
];

const naics = [
  ["238210", "Electrical & low-voltage contractors: fire alarm, security, access control, cameras, cabling"],
  ["561621", "Security systems services: installation, inspection, testing, and monitoring"],
  ["238220", "Fire sprinkler installation and repair"],
  ["811310", "Fire extinguisher inspection and service"],
  ["238990", "Fire lane striping and other specialty trade work"],
];

const faqs = [
  {
    question: "Can you work as a subcontractor on our government contract?",
    answer:
      "Yes. We support prime contractors and general contractors on public projects, covering the fire alarm, sprinkler, extinguisher, and security scopes. We provide our own permits, documentation, and acceptance testing, and we can supply pricing, insurance certificates, and references for your proposal.",
  },
  {
    question: "Do you work with school districts?",
    answer:
      "Yes. We work with school districts and city municipalities on installations, upgrades, inspections, and code corrections. Crews complete district background checks and badging, and we schedule disruptive work after hours, on weekends, or during school breaks.",
  },
  {
    question: "Do you handle prevailing wage and certified payroll?",
    answer:
      "Yes. We build the wage determination in your solicitation into our pricing and submit certified payroll when the contract requires it.",
  },
  {
    question: "Can you inspect fire systems across many buildings or campuses?",
    answer:
      "Yes. We schedule annual NFPA 72 fire alarm inspections, extinguisher service, and emergency lighting tests across multiple sites and deliver a written report for every building, with deficiencies prioritized so you can plan corrections and budget.",
  },
  {
    question: "Are you a small business?",
    answer:
      "Yes. We are a small business under the SBA size standards for the fire alarm, security, sprinkler, and extinguisher codes we work under.",
  },
];

// JSON-LD goes inside a <script>; escape "<" so no string can close the tag.
const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Fire and security contracting for government, school districts, and municipalities",
  serviceType: "Fire protection and security systems for public-sector facilities",
  url: `${SITE_URL}/government`,
  provider: { "@id": `${SITE_URL}/#business` },
  areaServed: { "@type": "State", name: "Texas" },
  audience: {
    "@type": "Audience",
    audienceType: "School districts, city and county governments, state agencies, federal facilities, and prime contractors",
  },
  description:
    "Fire alarm, fire sprinkler, fire extinguisher, emergency lighting, access control, video surveillance, and mass notification work on public facilities, as a prime contractor or subcontractor.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function GovernmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(serviceSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />
      <Navbar />
      <main className="pt-20 bg-white">
        {/* Hero */}
        <section className="bg-[#0D1B2A] py-16 sm:py-20">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              Government &amp; Public Sector
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight max-w-4xl mb-5">
              Fire &amp; security for school districts, cities, and government facilities
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mb-8">
              We work with school districts and city municipalities across the Houston area and Texas, as the prime
              contractor or as a subcontractor on your public project. Fire alarm, sprinklers, extinguishers, access
              control, and cameras, with the documentation public work requires.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#request"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#E85D04] hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
              >
                Request a quote
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:+13468525540"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
                (346) 852-5540
              </a>
            </div>
          </div>
        </section>

        {/* Who we serve */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-3">Who we serve</h2>
            <p className="text-gray-600 max-w-2xl mb-10">
              Public buildings carry more people, more inspections, and less room for downtime. We build our work
              around that.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {sectors.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-[#0D1B2A] mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prime or sub */}
        <section className="py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-10">Prime contractor or subcontractor</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border-2 border-gray-200 p-8">
                <h3 className="text-xl font-bold text-[#0D1B2A] mb-3">Hire us directly</h3>
                <p className="text-gray-600 mb-5">
                  For agencies, districts, and cities buying fire and security work. We respond to RFQs, RFPs, and
                  bid invitations, and invoice against your purchase order.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    "New installations, upgrades, and panel replacements",
                    "Annual inspection, testing, and maintenance contracts",
                    "Fire marshal violation corrections",
                    "Multi-building and multi-campus programs",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <BadgeCheck className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-8">
                <h3 className="text-xl font-bold text-[#0D1B2A] mb-3">Bring us on as your subcontractor</h3>
                <p className="text-gray-600 mb-5">
                  For prime contractors and general contractors on school bond projects, municipal capital projects,
                  and federal facility contracts. We self-perform the fire and security scopes.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    "Pricing and scope letters for your proposal",
                    "Our own permits, AHJ coordination, and acceptance testing",
                    "Prevailing wage and certified payroll",
                    "Closeout: test reports, as-builts, and O&M manuals",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <BadgeCheck className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/for-contractors"
                  className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-orange-700 hover:text-orange-800"
                >
                  More for general contractors <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Built for public work */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-10">Built for public work</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publicWork.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <Icon className="w-6 h-6 text-orange-600 mb-3" />
                  <h3 className="font-bold text-[#0D1B2A] mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-3">What we install, inspect, and maintain</h2>
            <p className="text-gray-600 max-w-2xl mb-8">The full fire and life safety scope, from one licensed contractor.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-5 py-4 text-[#0D1B2A] font-medium hover:border-orange-300 hover:bg-orange-50 transition"
                >
                  {s.name}
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* District dashboard demo */}
        <section className="py-16 bg-[#0D1B2A]">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                <LayoutDashboard className="w-4 h-4" />
                For districts with many campuses
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">See every campus&apos;s fire safety status in one place</h2>
              <p className="text-gray-300">
                Our district compliance dashboard tracks inspections, deficiencies, and corrections across every
                building, so facilities leaders know what needs attention before the fire marshal does.
              </p>
            </div>
            <Link
              href="/district-portal"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-[#0D1B2A] hover:bg-orange-50 font-semibold rounded-full transition-colors flex-shrink-0"
            >
              View the demo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Capabilities at a glance */}
        <section className="py-16">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-3">Capabilities at a glance</h2>
            <p className="text-gray-600 max-w-2xl mb-8">For procurement officers and prime contractors.</p>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                  NAICS codes
                </div>
                <dl className="divide-y divide-gray-100">
                  {naics.map(([code, desc]) => (
                    <div key={code} className="flex gap-4 px-5 py-3 text-sm">
                      <dt className="font-mono font-semibold text-[#0D1B2A] w-16 flex-shrink-0">{code}</dt>
                      <dd className="text-gray-600">{desc}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-2xl border border-gray-200 p-6 text-sm text-gray-700 space-y-3">
                <p className="font-semibold text-[#0D1B2A]">Chatman Security &amp; Fire</p>
                <p>
                  3403 West TC Jester Blvd, #1112
                  <br />
                  Houston, TX 77018
                </p>
                <p>
                  <a href="tel:+13468525540" className="text-orange-600 font-medium hover:underline">
                    (346) 852-5540
                  </a>
                  <br />
                  <a href="mailto:info@chatmansecurityandfire.com" className="text-orange-600 font-medium hover:underline">
                    info@chatmansecurityandfire.com
                  </a>
                </p>
                <p>Small business · Licensed Texas fire protection contractor · Serving Houston and statewide</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-[#0D1B2A] mb-8">Frequently asked questions</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.question}>
                  <h3 className="font-semibold text-[#0D1B2A] mb-1.5">{f.question}</h3>
                  <p className="text-gray-700 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div id="request">
          <LeadCaptureForm
            variant="inline"
            heading="Request a quote or our capability statement"
            subtext="Tell us about your facility, project, or solicitation. We'll respond within one business day."
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
