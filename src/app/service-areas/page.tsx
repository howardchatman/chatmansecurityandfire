import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChadChat from "@/components/ChadChat";
import { cities } from "@/lib/cities-data";
import { MapPin, Phone, ArrowRight, Shield, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Fire Protection Service Areas in Texas | Chatman Security & Fire",
  description:
    "Chatman Security & Fire serves fire alarm, sprinkler, extinguisher, and life safety needs across Houston, Dallas, San Antonio, Austin, Fort Worth, Waco, Denton, College Station, and Lufkin, TX.",
};

const whyUs = [
  "Licensed fire protection contractor — commercial & industrial",
  "NFPA 72 & NFPA 13 compliant systems",
  "Same technicians, statewide — no franchise hand-offs",
  "Free on-site estimates for all Texas service areas",
  "24/7 emergency response available",
  "Authorized Brinks Security dealer",
];

export default function ServiceAreasPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-16 lg:py-24 bg-neutral-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(234,88,12,0.15)_0%,_transparent_60%)]" />
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold uppercase tracking-wider mb-4">
                <MapPin className="w-4 h-4" />
                Texas Statewide Coverage
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Fire Protection Services<br />
                <span className="text-orange-500">Across Texas</span>
              </h1>
              <p className="text-xl text-neutral-300 mb-8">
                From Houston to Fort Worth, College Station to Lufkin — Chatman Security & Fire brings code-compliant fire alarm, sprinkler, extinguisher, and life safety solutions to commercial properties across the state.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+18328597009"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  (832) 859-7009
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-700 hover:border-orange-500 text-white font-semibold rounded-full transition-colors"
                >
                  Request a Free Estimate
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* City Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Cities We Serve
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Select your city for fire protection answers specific to your local fire marshal, AHJ requirements, and common compliance questions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/service-areas/${city.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {city.name}, TX
                      </h3>
                      <p className="text-sm text-gray-400">{city.county}</p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {city.heroSubtitle}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {city.services.slice(0, 3).map((s) => (
                      <span
                        key={s.title}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                      >
                        {s.title.split(" ").slice(0, 3).join(" ")}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-orange-600 group-hover:gap-2 transition-all">
                    View {city.name} Services
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Chatman */}
        <section className="py-16 bg-white">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Why Texas Businesses Choose Chatman
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We're not a franchise or a call center. Every job is handled by our own licensed technicians who know Texas fire codes, work directly with local AHJs, and get your property compliant the first time.
                  </p>
                  <ul className="space-y-3">
                    {whyUs.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-neutral-950 rounded-2xl p-8 text-center">
                  <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Compliant?</h3>
                  <p className="text-neutral-400 mb-6 text-sm">
                    Free on-site assessments for all Texas locations. We'll tell you exactly what your property needs before you spend a dollar.
                  </p>
                  <a
                    href="tel:+18328597009"
                    className="block w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors mb-3"
                  >
                    Call (832) 859-7009
                  </a>
                  <a
                    href="/contact"
                    className="block w-full py-3 border border-neutral-700 hover:border-orange-500 text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    Submit a Service Request
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChadChat />
    </>
  );
}
