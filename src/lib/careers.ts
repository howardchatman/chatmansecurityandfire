// Open roles at Chatman Security & Fire.
//
// Kept in code rather than a table: these change a few times a year, they need
// to be indexed by Google as real job pages, and each one carries enough
// hand-written detail that a CMS row would just be a worse editor. Add or
// remove entries here and the listing, the detail page, the sitemap and the
// JobPosting schema all follow.

export type RoleCategory = "technician" | "apprentice" | "sales";

export interface Role {
  slug: string;
  title: string;
  category: RoleCategory;
  /** Fire alarm, sprinkler, extinguisher, fiber — used to filter the listing. */
  discipline?: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR";
  payRange?: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
}

export const CATEGORY_LABELS: Record<RoleCategory, string> = {
  technician: "Technician",
  apprentice: "Apprentice",
  sales: "Sales",
};

// Shared across every field role — repeating it in each posting invites drift.
const FIELD_BASELINE = [
  "Valid Texas driver's license and a clean driving record",
  "Able to pass a background check and drug screen",
  "Comfortable on ladders and lifts, and able to lift 50 lbs",
  "Show up when you say you will — our reputation is built on it",
];

export const ROLES: Role[] = [
  {
    slug: "fire-alarm-technician",
    title: "Fire Alarm Technician",
    category: "technician",
    discipline: "Fire Alarm",
    employmentType: "FULL_TIME",
    payRange: "Based on experience and certification",
    summary:
      "Install, service, and inspect commercial fire alarm systems across the Houston metro. You'll work on everything from small tenant build-outs to full addressable systems in new construction, and you'll be the one who gets the system to pass the fire marshal.",
    responsibilities: [
      "Install and terminate addressable and conventional fire alarm systems",
      "Program panels, run point-to-point testing, and commission systems",
      "Perform annual inspections and document deficiencies",
      "Troubleshoot trouble signals and nuisance alarms on service calls",
      "Meet the fire marshal on site and walk inspections through to sign-off",
    ],
    requirements: [
      "2+ years installing or servicing commercial fire alarm systems",
      "Working knowledge of NFPA 72 and the IFC",
      "Able to read and work from architectural and MEP drawings",
      ...FIELD_BASELINE,
    ],
    niceToHave: [
      "NICET Level I or above in Fire Alarm Systems",
      "Texas FAL (Fire Alarm License) or ability to obtain one",
      "Experience with Silent Knight, Fire-Lite, Notifier, or Honeywell panels",
    ],
  },
  {
    slug: "fire-sprinkler-technician",
    title: "Fire Sprinkler Technician",
    category: "technician",
    discipline: "Fire Sprinkler",
    employmentType: "FULL_TIME",
    payRange: "Based on experience and certification",
    summary:
      "Install and service wet-pipe sprinkler systems — risers, mains, branch lines, and heads — on commercial projects around Houston. Hands-on pipe work with real responsibility for what passes inspection.",
    responsibilities: [
      "Install risers, mains, branch lines, and sprinkler heads to NFPA 13",
      "Cut, groove, and thread pipe; set hangers and seismic bracing",
      "Perform hydrostatic tests, flushes, and inspector's test assemblies",
      "Carry out annual sprinkler inspections and repairs",
      "Coordinate waterflow and tamper connections with the alarm crew",
    ],
    requirements: [
      "2+ years installing or servicing fire sprinkler systems",
      "Working knowledge of NFPA 13 and NFPA 25",
      "Confident with grooved and threaded pipe fabrication",
      ...FIELD_BASELINE,
    ],
    niceToHave: [
      "Texas RME-Sprinkler or SPCL license",
      "NICET certification in Water-Based Systems Layout",
      "Underground fire line experience (C-900, wet taps, FDCs)",
    ],
  },
  {
    slug: "fire-extinguisher-technician",
    title: "Fire Extinguisher Technician",
    category: "technician",
    discipline: "Fire Extinguisher",
    employmentType: "FULL_TIME",
    payRange: "Based on experience and certification",
    summary:
      "Service, inspect, and tag portable fire extinguishers for commercial accounts across the Houston area. Steady route work with a lot of customer contact — you're often the only person from our company they see all year.",
    responsibilities: [
      "Perform annual inspections, maintenance, and tagging per NFPA 10",
      "Hydrostatic testing, recharging, and six-year maintenance",
      "Service kitchen hood suppression systems where certified",
      "Keep accurate service records and flag deficiencies to the office",
      "Build the relationship — repeat inspection work is how we grow",
    ],
    requirements: [
      "Experience servicing portable fire extinguishers",
      "Familiarity with NFPA 10",
      ...FIELD_BASELINE,
    ],
    niceToHave: [
      "Texas Fire Extinguisher License (Type A, B, or C)",
      "Kitchen hood suppression (NFPA 17A) experience",
    ],
  },
  {
    slug: "fiber-optic-technician",
    title: "Fiber Optic Technician",
    category: "technician",
    discipline: "Fiber Optic",
    employmentType: "FULL_TIME",
    payRange: "Based on experience and certification",
    summary:
      "Install, splice, terminate, and certify fiber and structured cabling for commercial customers. Backbone runs, data drops, and the low-voltage infrastructure our security and life safety systems ride on.",
    responsibilities: [
      "Pull, splice, and terminate single-mode and multi-mode fiber",
      "Install structured cabling, racks, patch panels, and data drops",
      "Fusion splicing and OTDR testing, with certified test results",
      "Troubleshoot existing runs and document as-builts",
      "Support camera, access control, and network installations",
    ],
    requirements: [
      "2+ years of fiber and structured cabling experience",
      "Comfortable with fusion splicers, OTDRs, and power meters",
      "Understands TIA/EIA standards and proper cable management",
      ...FIELD_BASELINE,
    ],
    niceToHave: [
      "BICSI or FOA certification",
      "Experience with IP camera and access control networks",
    ],
  },
  {
    slug: "apprentice-technician",
    title: "Apprentice Technician",
    category: "apprentice",
    employmentType: "FULL_TIME",
    payRange: "Hourly, with raises as you certify",
    summary:
      "No experience required. If you show up, work hard, and want a trade, we'll teach you fire alarm, sprinkler, or extinguisher work from the ground up and help you get licensed. This is a career, not a job.",
    responsibilities: [
      "Work alongside a lead technician on installs and service calls",
      "Pull wire, mount devices, and learn the trade hands-on",
      "Help with inspections and documentation",
      "Study toward your license — we support the training",
      "Keep the truck, tools, and job site in order",
    ],
    requirements: [
      "A real willingness to learn and take direction",
      "Reliable — on time, every day",
      ...FIELD_BASELINE,
    ],
    niceToHave: [
      "Any construction, electrical, or trade experience",
      "Interest in getting NICET or a Texas license",
    ],
  },
  {
    slug: "sales-representative",
    title: "Sales Representative — Fire & Life Safety",
    category: "sales",
    employmentType: "FULL_TIME",
    payRange: "Base plus commission",
    summary:
      "Sell fire protection and low-voltage systems to building owners, property managers, and general contractors across Houston. We generate real inbound leads — fire marshal violations, GC bid invitations, and inspection renewals — and you turn them into signed agreements.",
    responsibilities: [
      "Work inbound leads and quote requests, and go see the buildings",
      "Walk properties, scope the work, and put together proposals",
      "Build relationships with GCs, property managers, and facility teams",
      "Follow up on inspection renewals and monitoring contracts",
      "Hand clean, accurate scope to the install crew",
    ],
    requirements: [
      "Experience selling a technical service, ideally in construction or life safety",
      "Comfortable walking a job site and talking to a fire marshal",
      "Organized enough to keep a pipeline honest",
      "Valid Texas driver's license",
    ],
    niceToHave: [
      "Existing relationships with Houston-area GCs or property managers",
      "Familiarity with fire codes, or the willingness to learn them properly",
    ],
  },
];

export const getRole = (slug: string) => ROLES.find((r) => r.slug === slug);

/** Specialties an applicant can claim, independent of which role they apply to. */
export const DISCIPLINES = [
  "Fire Alarm",
  "Fire Sprinkler",
  "Fire Extinguisher",
  "Fiber Optic / Low Voltage",
  "Security / Access Control",
  "Other",
];
