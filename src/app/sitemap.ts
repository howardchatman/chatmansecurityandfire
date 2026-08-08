import { MetadataRoute } from "next";
import { cities } from "@/lib/cities-data";
import { catalogServiceSlugs } from "@/lib/service-catalog";
import { ROLES } from "@/lib/careers";

// Must match the canonical host in layout.tsx. A sitemap listing the non-www
// host while every page canonicalises to www splits the ranking signals across
// what Google treats as two separate sites.
const BASE_URL = "https://www.chatmansecurityandfire.com";

const serviceSlugs = [
  "fire-marshal-compliance",
  "fire-alarm",
  "fire-sprinkler",
  "fire-extinguishers",
  "emergency-lighting",
  "fire-lane-marking",
  "security-alarm",
  "consulting",
  "fiber-optics",
  "wireless-internet",
  "video-surveillance",
  "access-control",
  "pa-systems",
  "nurse-call",
  "gate-entry",
  "fire-department-access",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/service-areas`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/for-contractors`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/analyze`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/recommend`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/start`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/checklist`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/request-quote`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/financing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/sell-your-accounts`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/careers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Job pages get indexed individually so Google can surface them in the jobs
  // panel, which is where trade candidates actually search.
  const careerPages: MetadataRoute.Sitemap = ROLES.map((r) => ({
    url: `${BASE_URL}/careers/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const servicePages: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/service-areas/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // Service × City local landing pages (Houston-metro cities only)
  const serviceCityPages: MetadataRoute.Sitemap = cities
    .filter((c) => c.metro)
    .flatMap((city) =>
      catalogServiceSlugs.map((slug) => ({
        url: `${BASE_URL}/service-areas/${city.slug}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
    );

  return [...staticPages, ...careerPages, ...servicePages, ...cityPages, ...serviceCityPages];
}
