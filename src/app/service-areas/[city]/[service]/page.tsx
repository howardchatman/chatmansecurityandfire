import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, ArrowRight, ArrowLeft, CheckCircle2, MapPin, ScrollText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cities } from "@/lib/cities-data";
import { catalogServices, getCatalogService } from "@/lib/service-catalog";

const metroCities = cities.filter((c) => c.metro);

export function generateStaticParams() {
  const params: { city: string; service: string }[] = [];
  for (const c of metroCities) {
    for (const s of catalogServices) {
      params.push({ city: c.slug, service: s.slug });
    }
  }
  return params;
}

function resolve(citySlug: string, serviceSlug: string) {
  const city = metroCities.find((c) => c.slug === citySlug);
  const service = getCatalogService(serviceSlug);
  return { city, service };
}

const fill = (s: string, cityName: string, county: string) =>
  s.replace(/\{city\}/g, cityName).replace(/\{county\}/g, county);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const { city, service } = resolve(citySlug, serviceSlug);
  if (!city || !service) return {};
  const title = `${service.metaTitle} in ${city.name}, TX | Chatman Security & Fire`;
  const description = fill(service.blurb, city.name, city.county).slice(0, 200);
  return {
    title,
    description,
    alternates: { canonical: `/service-areas/${city.slug}/${service.slug}` },
    openGraph: {
      title: `${service.metaTitle} in ${city.name}, TX`,
      description,
      url: `https://www.chatmansecurityandfire.com/service-areas/${city.slug}/${service.slug}`,
    },
  };
}

export default async function ServiceCityPage({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}) {
  const { city: citySlug, service: serviceSlug } = await params;
  const { city, service } = resolve(citySlug, serviceSlug);
  if (!city || !service) notFound();

  const cityName = city.name;
  const county = city.county;
  const ahj = city.fireMarshal || `${county} Fire Marshal`;
  const f = (s: string) => fill(s, cityName, county);

  const faqs = [
    {
      question: `Do you provide ${service.noun} in ${cityName}, TX?`,
      answer: `Yes. Chatman Security & Fire provides ${service.noun} for commercial properties throughout ${cityName} and the greater Houston metro. We coordinate with ${ahj} on permitting, inspection, and sign-off. Call (832) 859-7009 for a free assessment.`,
    },
    {
      question: `Who is the fire marshal / AHJ for ${cityName}?`,
      answer: `Fire code in ${cityName} is enforced by ${ahj}, applying the International Fire Code with local amendments. We work directly with this authority having jurisdiction so your ${service.noun} passes inspection the first time.`,
    },
    {
      question: `How do I get started with ${service.noun} in ${cityName}?`,
      answer: `Call (832) 859-7009 or request a quote online. We schedule a free on-site assessment of your ${cityName} property, provide a written scope and price, and complete the work on your timeline.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
  };
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    provider: { "@type": "LocalBusiness", name: "Chatman Security & Fire", telephone: "+18328597009" },
    areaServed: { "@type": "City", name: `${cityName}, TX` },
    description: f(service.blurb),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.chatmansecurityandfire.com/" },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: "https://www.chatmansecurityandfire.com/service-areas" },
      { "@type": "ListItem", position: 3, name: cityName, item: `https://www.chatmansecurityandfire.com/service-areas/${city.slug}` },
      { "@type": "ListItem", position: 4, name: service.name, item: `https://www.chatmansecurityandfire.com/service-areas/${city.slug}/${service.slug}` },
    ],
  };

  const otherServices = catalogServices.filter((s) => s.slug !== service.slug);
  const nearbyCities = metroCities.filter((c) => c.slug !== city.slug).slice(0, 6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-16 bg-[#0D1B2A]">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/50 mb-6 flex-wrap">
              <Link href="/" className="hover:text-orange-400">Home</Link>
              <span>/</span>
              <Link href="/service-areas" className="hover:text-orange-400">Service Areas</Link>
              <span>/</span>
              <Link href={`/service-areas/${city.slug}`} className="hover:text-orange-400">{cityName}</Link>
              <span>/</span>
              <span className="text-white/80">{service.name}</span>
            </nav>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                <MapPin className="w-4 h-4" /> Serving {cityName}, TX
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
                {service.name} in {cityName}, TX
              </h1>
              <p className="text-lg text-gray-300 mb-8">{f(service.blurb)}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="tel:+18328597009" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-colors">
                  <Phone className="w-5 h-5" /> Call (832) 859-7009
                </a>
                <Link href="/request-quote" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/25 hover:border-white/60 text-white font-semibold rounded-full transition-colors">
                  Request a Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl py-14 space-y-14">
            {/* What we do */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                {service.name} for {cityName} Businesses
              </h2>
              <ul className="space-y-3">
                {service.whatWeDo.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 leading-relaxed">{f(item)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 leading-relaxed mt-5">{f(service.priceLine)}</p>
            </section>

            {/* Codes / local context */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ScrollText className="w-6 h-6 text-orange-500" /> Codes &amp; Compliance in {cityName}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">{city.localContext}</p>
              <ul className="space-y-2">
                {service.codes.map((c) => (
                  <li key={c} className="flex gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    <span className="text-gray-600 leading-relaxed">{f(c)}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                {service.name} in {cityName} — FAQ
              </h2>
              <div className="space-y-5">
                {faqs.map((q) => (
                  <div key={q.question}>
                    <h3 className="font-semibold text-gray-900 mb-1.5">{q.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{q.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Other services in this city */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Other services in {cityName}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {otherServices.map((s) => (
                  <Link key={s.slug} href={`/service-areas/${city.slug}/${s.slug}`} className="group flex items-center justify-between gap-3 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-xl p-4 transition-all">
                    <span className="font-medium text-gray-900 group-hover:text-orange-700">{s.name} in {cityName}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-sm">
                <Link href={`/service-areas/${city.slug}`} className="text-orange-600 hover:underline font-medium">
                  See all fire protection services in {cityName} →
                </Link>{" "}
                or{" "}
                <Link href={`/services/${service.slug}`} className="text-orange-600 hover:underline font-medium">
                  learn more about {service.name} →
                </Link>
              </p>
            </section>

            {/* Same service in nearby cities */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{service.name} in nearby areas</h2>
              <div className="flex flex-wrap gap-2 text-sm">
                {nearbyCities.map((c) => (
                  <Link key={c.slug} href={`/service-areas/${c.slug}/${service.slug}`} className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 hover:text-orange-700 rounded-full transition-colors text-gray-700 font-medium">
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* CTA */}
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Need {service.name.toLowerCase()} in {cityName}?
            </h2>
            <p className="text-gray-600 mb-7 max-w-xl mx-auto">
              Free on-site assessment. Fast, code-compliant work. Call now or request a quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+18328597009" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-colors">
                <Phone className="w-5 h-5" /> (832) 859-7009
              </a>
              <Link href="/request-quote" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0D1B2A] hover:bg-[#1a2f45] text-white font-semibold rounded-full transition-colors">
                Request a Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-8">
              <Link href="/service-areas" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> All service areas
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
