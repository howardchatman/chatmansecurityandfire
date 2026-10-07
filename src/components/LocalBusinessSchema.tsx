import { cities } from "@/lib/cities-data";
import { siteServices, SITE_URL } from "@/lib/site-services";

// The business's identity card for search engines and AI assistants
// (Google, Bing/Copilot, ChatGPT, Siri, Alexa, Perplexity…). Rendered on every
// public page from the root layout, so whichever page an AI crawler lands on,
// it can resolve "who is this business, where do they work, what do they do".
//
// areaServed and the offer catalog are built from the same data as the site's
// pages. The previous hand-written version listed 9 of 19 cities and 7 of 16
// services — to an AI reading it, Chatman didn't serve Katy or do access
// control. Now a new city or service page is described here automatically.

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: "Chatman Security & Fire",
    description:
      "Commercial fire protection, life safety, and security contractor based in Houston, Texas, serving Houston and cities across Texas. Fire alarm and fire sprinkler installation and inspection, fire marshal violation corrections, fire extinguishers, emergency lighting, fire lane marking, access control, security cameras, and Brinks security systems.",
    url: SITE_URL,
    telephone: "+13468525540",
    email: "info@chatmansecurityandfire.com",
    foundingDate: "2009",
    priceRange: "$$",
    image: `${SITE_URL}/csf_wide_logo.png`,
    logo: `${SITE_URL}/logo_only.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "3403 West TC Jester Blvd, #1112",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77018",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.8043,
      longitude: -95.4363,
    },
    areaServed: [
      { "@type": "State", name: "Texas" },
      ...cities.map((c) => ({
        "@type": "City",
        name: c.name,
        url: `${SITE_URL}/service-areas/${c.slug}`,
        containedInPlace: { "@type": "State", name: "Texas" },
      })),
    ],
    knowsAbout: [
      "NFPA 72 fire alarm code",
      "NFPA 13 fire sprinkler code",
      "NFPA 10 portable fire extinguishers",
      "NFPA 25 sprinkler inspection, testing and maintenance",
      "International Fire Code (IFC)",
      "Fire marshal inspections and violation corrections",
      "Fire and security contracting for school districts",
      "Fire and security contracting for cities, municipalities, and government facilities",
      "Fire alarm and security subcontracting for prime contractors on public projects",
      "Prevailing wage and certified payroll for public works",
      ...siteServices.map((s) => s.name),
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
        description: "24/7 emergency dispatch available",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Fire Protection, Life Safety & Security Services",
      itemListElement: siteServices.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.summary,
          url: `${SITE_URL}/services/${s.slug}`,
          areaServed: { "@type": "State", name: "Texas" },
        },
      })),
    },
    sameAs: [
      "https://www.facebook.com/chatmansecurityandfire",
      "https://www.linkedin.com/company/chatman-security-and-fire",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
