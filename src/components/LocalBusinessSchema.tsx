export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://chatmansecurityandfire.com/#business",
    name: "Chatman Security & Fire",
    description:
      "Commercial fire protection and security services in Houston, TX and throughout Texas. Fire alarms, sprinkler systems, extinguishers, fire marshal compliance, emergency lighting, fire lane markings, and Brinks security systems.",
    url: "https://chatmansecurityandfire.com",
    telephone: "+18328597009",
    email: "info@chatmansecurityandfire.com",
    foundingDate: "2009",
    priceRange: "$$",
    image: "https://chatmansecurityandfire.com/csf_wide_logo.png",
    logo: "https://chatmansecurityandfire.com/logo_only.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: "849 Mansfield St., Unit F",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77091",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.8173,
      longitude: -95.4088,
    },
    areaServed: [
      { "@type": "City", name: "Houston", containedInPlace: { "@type": "State", name: "Texas" } },
      { "@type": "City", name: "Dallas", containedInPlace: { "@type": "State", name: "Texas" } },
      { "@type": "City", name: "San Antonio", containedInPlace: { "@type": "State", name: "Texas" } },
      { "@type": "City", name: "Austin", containedInPlace: { "@type": "State", name: "Texas" } },
      { "@type": "City", name: "Fort Worth", containedInPlace: { "@type": "State", name: "Texas" } },
      { "@type": "City", name: "Waco", containedInPlace: { "@type": "State", name: "Texas" } },
      { "@type": "City", name: "Denton", containedInPlace: { "@type": "State", name: "Texas" } },
      { "@type": "City", name: "College Station", containedInPlace: { "@type": "State", name: "Texas" } },
      { "@type": "City", name: "Lufkin", containedInPlace: { "@type": "State", name: "Texas" } },
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
      name: "Fire Protection Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fire Alarm System Installation & Inspection" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fire Sprinkler Service & Modifications" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fire Extinguisher Inspection & Service" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fire Marshal Compliance & Corrections" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Emergency Lighting & Exit Sign Repairs" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fire Lane Striping & Markings" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Brinks Security Alarm Systems" } },
      ],
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
