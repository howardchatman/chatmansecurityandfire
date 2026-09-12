// Everything the printed inspection report needs that isn't the inspection
// row itself: type labels, the per-device equipment rows, the standards
// paragraph for each inspection type, and who we are.
//
// One file so the tech screen, the admin screen, and the report all agree on
// what a "fire extinguisher inspection" is called and what a device row holds.

/** Labels for every inspection type, in the order they appear in menus. */
export const INSPECTION_TYPE_LABELS: Record<string, string> = {
  fire_alarm: "Fire Alarm Inspection",
  sprinkler_monitoring: "Sprinkler Monitoring Inspection",
  fire_extinguisher: "Fire Extinguisher Inspection",
  kitchen_hood: "Kitchen Hood Suppression Inspection",
  reinspection: "Reinspection",
  fire_marshal_pre: "Fire Marshal Pre-Inspection",
};

export const INSPECTION_TYPE_OPTIONS = Object.entries(INSPECTION_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

/** Company details printed on every report. */
export const COMPANY = {
  name: "Chatman Security & Fire",
  address: "3403 West TC Jester Blvd, #1112",
  city: "Houston",
  state: "TX",
  zip: "77018",
  phone: "(346) 852-5540",
  phoneHref: "tel:3468525540",
  email: "info@chatmansecurityandfire.com",
  website: "chatmansecurityandfire.com",
  /** Texas State Fire Marshal license — fill in when known. */
  license: "",
};

/**
 * One extinguisher (or one suppression system) on the report. Every field is
 * a string so a half-filled row saves and prints without fuss; "" prints as
 * a dash, exactly like the paper form.
 */
export interface EquipmentRow {
  /** Stable key for React and for matching photos by device_tag. */
  id: string;
  /** Tag number, "1", "2", … — what's written on the extinguisher tag. */
  number: string;
  /** "2nd floor / Room 201 / under sink" */
  location: string;
  make_model: string;
  serial: string;
  /** "10" (lb), "2.5", "5" */
  size: string;
  /** "ABC", "BC", "K", "CO2", "Water" */
  type: string;
  mfg_date: string;
  last_hydro: string;
  next_hydro: string;
  next_six_year: string;
  /** What was done this visit: "Recharged", "Replaced tag", "" */
  serviced: string;
  parts_required: string;
  /** "" until inspected. */
  result: "" | "pass" | "fail";
  notes: string;
}

export const EXTINGUISHER_TYPES = ["ABC", "BC", "K", "CO2", "Water", "Clean Agent", "Other"];
export const EXTINGUISHER_SIZES = ["2.5", "5", "6", "10", "15", "20", "1.5 gal", "2.5 gal"];

export function emptyEquipmentRow(number: string): EquipmentRow {
  return {
    id: `eq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    number,
    location: "",
    make_model: "",
    serial: "",
    size: "",
    type: "ABC",
    mfg_date: "",
    last_hydro: "",
    next_hydro: "",
    next_six_year: "",
    serviced: "",
    parts_required: "",
    result: "",
    notes: "",
  };
}

/** Rows come back from jsonb as unknown; coerce so a stray null never crashes the report. */
export function hydrateEquipment(raw: unknown): EquipmentRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r, i) => {
    const o = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
    const s = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
    const result = o.result === "pass" || o.result === "fail" ? o.result : "";
    return {
      ...emptyEquipmentRow(String(i + 1)),
      ...Object.fromEntries(
        Object.keys(emptyEquipmentRow("")).map((k) => [k, s(k)])
      ),
      id: s("id") || `eq-${i}`,
      number: s("number") || String(i + 1),
      type: s("type"),
      result,
    } as EquipmentRow;
  });
}

/** Whether this inspection type is built around per-device rows. */
export function usesEquipmentLog(type: string): boolean {
  return type === "fire_extinguisher";
}

/**
 * The standards paragraph and headings for each type — the block on the
 * Testing Summary page and the opening line of the Conclusion.
 */
export interface ReportStandard {
  /** "Fire Extinguisher" — the equipment type on the summary table. */
  equipment: string;
  /** "NFPA 10" — the standard the work was done to. */
  standard: string;
  /** "NFPA 10 Fire Extinguisher Inspection" — named in the conclusion. */
  serviceName: string;
  /** Extra clause after the standard, e.g. the manufacturer's manual. */
  alsoPer?: string;
}

export const REPORT_STANDARDS: Record<string, ReportStandard> = {
  fire_extinguisher: {
    equipment: "Fire Extinguisher",
    standard: "NFPA 10",
    serviceName: "NFPA 10 Fire Extinguisher Inspection",
  },
  kitchen_hood: {
    equipment: "Service & Inspection Report",
    standard: "NFPA 17 or 17A, 96",
    serviceName: "Pre-Engineered Restaurant Fire Suppression Systems Inspection",
    alsoPer: "the manufacturer's manual",
  },
  fire_alarm: {
    equipment: "Fire Alarm System",
    standard: "NFPA 72",
    serviceName: "NFPA 72 Fire Alarm Inspection & Testing",
  },
  sprinkler_monitoring: {
    equipment: "Sprinkler Monitoring",
    standard: "NFPA 72 and NFPA 25",
    serviceName: "Sprinkler Monitoring Inspection",
  },
  reinspection: {
    equipment: "Reinspection",
    standard: "applicable NFPA",
    serviceName: "Reinspection of Previously Noted Deficiencies",
  },
  fire_marshal_pre: {
    equipment: "Fire Marshal Pre-Inspection",
    standard: "applicable NFPA and International Fire Code",
    serviceName: "Fire Marshal Pre-Inspection",
  },
};

export function reportStandard(type: string): ReportStandard {
  return (
    REPORT_STANDARDS[type] || {
      equipment: INSPECTION_TYPE_LABELS[type] || "Inspection",
      standard: "applicable NFPA",
      serviceName: INSPECTION_TYPE_LABELS[type] || "Inspection",
    }
  );
}

/** "2218 Bluewater Hwy, Surfside Beach, TX 77541" */
export function fullSiteAddress(i: {
  site_address?: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
}): string {
  const cityLine = [i.site_city, [i.site_state, i.site_zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [i.site_address, cityLine].filter(Boolean).join(", ");
}
