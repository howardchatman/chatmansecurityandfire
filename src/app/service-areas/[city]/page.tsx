import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";
import { cities } from "@/lib/cities-data";
import {
  MapPin, Phone, ArrowLeft, ChevronDown, CheckCircle,
  Bell, Droplets, Shield, Zap, ArrowRight, MessageSquare,
  Building2, AlertTriangle,
} from "lucide-react";

export async function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) return {};
  return {
    title: `Fire Protection Services in ${city.name}, TX | Chatman Security & Fire`,
    description: `Fire alarm, sprinkler, extinguisher, and life safety services in ${city.name}, TX. Chatman Security & Fire answers your fire protection questions and handles compliance. Call (832) 859-7009.`,
  };
}

const serviceIcons: Record<string, React.ElementType> = {
  "Fire Alarm": Bell,
  "Sprinkler": Droplets,
  "Security": Shield,
  "Emergency": Zap,
  "default": Building2,
};

function getIcon(title: string) {
  const key = Object.keys(serviceIcons).find((k) => title.includes(k));
  return serviceIcons[key || "default"];
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-gray-200 rounded-xl overflow-hidden">
      <summary className="flex items-start justify-between gap-4 p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm leading-snug pr-2">{question}</span>
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform mt-0.5" />
      </summary>
      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
        {answer}
      </div>
    </details>
  );
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-16 lg:py-24 bg-neutral-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(234,88,12,0.18)_0%,_transparent_55%)]" />
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              href="/service-areas"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-orange-400 text-sm mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Service Areas
            </Link>

            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4">
                <MapPin className="w-4 h-4" />
                {city.county} · Texas
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                Fire Protection Services in<br />
                <span className="text-orange-500">{city.name}, TX</span>
              </h1>
              <p className="text-lg text-neutral-300 mb-8">
                {city.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+18328597009"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call (832) 859-7009
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-700 hover:border-orange-500 text-white font-semibold rounded-full transition-colors"
                >
                  Free Estimate
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About this market */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-gray-600 leading-relaxed text-base">{city.description}</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Common Questions</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Fire Protection Questions for {city.name}
              </h2>
              <p className="text-gray-500 mb-8">
                Straight answers to what {city.name} business owners and property managers search for most.
              </p>
              <div className="space-y-3">
                {city.faqs.map((faq, i) => (
                  <FAQItem key={i} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Our Services in {city.name}
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Full-service fire protection and life safety — installed, inspected, and serviced by our own licensed technicians.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {city.services.map((service) => {
                const Icon = getIcon(service.title);
                return (
                  <div
                    key={service.title}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Local Authority Context */}
        <section className="py-12 bg-amber-50 border-y border-amber-100">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto flex gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  {city.name} Local AHJ &amp; Code Notes
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">{city.localContext}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Chatman */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why {city.name} Businesses Choose Chatman
                </h2>
                <p className="text-gray-600 mb-6">
                  We're a Houston-based contractor that travels to serve {city.name} — not a franchise, not a call center. Your project is handled by our own licensed team from estimate through inspection sign-off.
                </p>
                <ul className="space-y-3">
                  {[
                    `Free on-site estimates throughout ${city.name} and ${city.county}`,
                    "NFPA 72 & NFPA 13 certified fire alarm and sprinkler work",
                    "We represent your project through AHJ plan review and inspection",
                    "24/7 emergency response — not just Monday–Friday",
                    "One contractor for alarms, sprinklers, extinguishers, and security",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-neutral-950 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-2">
                  Get a Free {city.name} Estimate
                </h3>
                <p className="text-neutral-400 text-sm mb-6">
                  Tell us your property type and we'll schedule a no-cost site walk in {city.name}. No obligation, no pressure.
                </p>
                <a
                  href="tel:+18328597009"
                  className="block w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors text-center mb-3"
                >
                  Call (832) 859-7009
                </a>
                <a
                  href="/contact"
                  className="block w-full py-3 border border-neutral-700 hover:border-orange-500 text-white font-medium rounded-xl transition-colors text-center text-sm"
                >
                  Submit Online Request
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Areas */}
        {city.nearbyAreas.length > 0 && (
          <section className="py-12 bg-gray-50 border-t border-gray-100">
            <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Also Serving Near {city.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {city.nearbyAreas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600"
                    >
                      {area}, TX
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Cross-links to other cities */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="font-semibold text-gray-900 mb-4">Other Texas Service Areas</h3>
            <div className="flex flex-wrap gap-3">
              {cities
                .filter((c) => c.slug !== city.slug)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/service-areas/${c.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 text-sm text-gray-700 hover:text-orange-700 rounded-full transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {c.name}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
