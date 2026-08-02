// Service catalog for Service × City local landing pages.
// Each service combines with a city's local details (county, fire marshal /
// AHJ, nearby areas) to produce unique, genuinely useful local pages — not
// thin duplicates.

export interface CatalogService {
  slug: string;
  name: string;        // short label, e.g. "Fire Alarm Systems"
  noun: string;        // used in sentences, e.g. "fire alarm system"
  metaTitle: string;   // "{name} in {city}, TX | ..." built at page level
  blurb: string;       // 1–2 sentence intro (city name interpolated at render)
  whatWeDo: string[];
  codes: string[];
  priceLine: string;
}

// {city} and {county} are replaced at render time.
export const catalogServices: CatalogService[] = [
  {
    slug: "fire-marshal-compliance",
    name: "Fire Marshal Compliance",
    noun: "fire marshal compliance",
    metaTitle: "Fire Marshal Compliance",
    blurb:
      "Failed a fire marshal inspection in {city}? We review the deficiency report, correct every violation, and get your {city} property back into compliance before re-inspection.",
    whatWeDo: [
      "Line-by-line review of your {city} fire marshal deficiency report",
      "Correction of fire alarm, sprinkler, extinguisher, and exit/egress violations",
      "Coordination with the {county} authority having jurisdiction (AHJ)",
      "Documentation and re-inspection support to close out the violation",
    ],
    codes: [
      "International Fire Code (IFC) as adopted locally in {county}",
      "NFPA 72, NFPA 25, and NFPA 10 for alarm, sprinkler, and extinguisher work",
      "Certificate of occupancy and change-of-use requirements",
    ],
    priceLine: "Most correction jobs are completed in one to two visits. Pricing depends on the number and type of violations — we quote after reviewing your report.",
  },
  {
    slug: "fire-alarm",
    name: "Fire Alarm Systems",
    noun: "fire alarm system",
    metaTitle: "Commercial Fire Alarm Systems",
    blurb:
      "Design, installation, inspection, and repair of commercial fire alarm systems for {city}, TX businesses — built to NFPA 72 and permitted through the state.",
    whatWeDo: [
      "New addressable and conventional fire alarm design & installation in {city}",
      "Annual NFPA 72 inspection and testing with a report for your records",
      "Panel replacements, trouble/supervisory diagnostics, and device upgrades",
      "Monitoring setup and integration with security where needed",
    ],
    codes: [
      "NFPA 72 National Fire Alarm and Signaling Code",
      "IFC Section 907 (when a system is required)",
      "Texas State Fire Marshal (TSFM) permitting",
    ],
    priceLine: "A small tenant space can start around $8,000; larger addressable systems run $15,000–$35,000+. We provide an exact quote after an on-site assessment in {city}.",
  },
  {
    slug: "fire-sprinkler",
    name: "Fire Sprinkler Systems",
    noun: "fire sprinkler system",
    metaTitle: "Fire Sprinkler Systems & Inspection",
    blurb:
      "Fire sprinkler installation, modification, and NFPA 25 inspection for commercial properties in {city}, TX.",
    whatWeDo: [
      "Sprinkler installs and tenant-improvement modifications in {city}",
      "NFPA 25 inspection, testing, and maintenance (ITM)",
      "Inspection corrections and deficiency repairs",
      "Coordination with the {county} AHJ on plan review and sign-off",
    ],
    codes: [
      "NFPA 13 (installation) and NFPA 25 (inspection, testing, maintenance)",
      "IFC sprinkler thresholds as amended in {county}",
      "Backflow and water-supply requirements",
    ],
    priceLine: "Sprinkler pricing varies widely by system size and scope. We assess your {city} property and quote the exact work required.",
  },
  {
    slug: "fire-extinguishers",
    name: "Fire Extinguishers",
    noun: "fire extinguisher service",
    metaTitle: "Fire Extinguisher Inspection & Service",
    blurb:
      "Fire extinguisher sales, annual inspection, recharging, and tagging for {city}, TX businesses — keeping you current and inspection-ready.",
    whatWeDo: [
      "Annual inspection and tagging per NFPA 10 across {city}",
      "Recharging, hydrostatic testing, and replacement",
      "New extinguisher sales sized to your occupancy",
      "Service routes for multi-location {city}-area businesses",
    ],
    codes: [
      "NFPA 10 Standard for Portable Fire Extinguishers",
      "Monthly visual checks + annual licensed service",
      "Hydrostatic testing intervals by extinguisher type",
    ],
    priceLine: "Annual inspection and tagging is affordable per unit, with volume pricing for larger {city} properties. Call for a quote.",
  },
  {
    slug: "emergency-lighting",
    name: "Emergency & Exit Lighting",
    noun: "emergency and exit lighting",
    metaTitle: "Emergency Lighting & Exit Signs",
    blurb:
      "Exit signs and emergency lighting installation, testing, and repair for {city}, TX — the items cited on nearly every fire inspection.",
    whatWeDo: [
      "Exit sign and emergency light installation and replacement in {city}",
      "Monthly and annual 90-minute battery testing",
      "Inspection-correction work for cited egress lighting",
      "Illumination-level verification along the means of egress",
    ],
    codes: [
      "IFC / IBC means-of-egress illumination requirements",
      "NFPA 101 Life Safety Code",
      "90-minute emergency power test standards",
    ],
    priceLine: "Emergency lighting corrections are quick and low-cost. We assess your {city} property and quote per fixture or per project.",
  },
];

export const catalogServiceSlugs = catalogServices.map((s) => s.slug);
export const getCatalogService = (slug: string) =>
  catalogServices.find((s) => s.slug === slug);
