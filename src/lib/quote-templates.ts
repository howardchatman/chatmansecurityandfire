// Quote Builder Template Catalog
// Contains all presets for Quick Templates

export type QuoteType =
  | "install"
  | "retrofit"
  | "service"
  | "inspection"
  | "monitoring"
  | "compliance";

export type TemplateName =
  | "daycare"
  | "school"
  | "retail"
  | "restaurant"
  | "warehouse"
  | "office"
  | "inspection";

export interface LineItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  laborHours?: number;
  laborRate?: number;
  allowanceLow?: number;
  allowanceHigh?: number;
  isAllowance?: boolean;
  markup?: number;
  taxable?: boolean;
  optional?: boolean;
  notes?: string;
}

export interface TemplatePreset {
  name: TemplateName;
  label: string;
  description: string;
  icon: string;
  defaultQuoteType: QuoteType;
  lineItems: Omit<LineItem, "id">[];
  assumptions: string[];
  disclaimers: string[];
  paymentTerms: string;
  warranty: string;
  addOns: {
    id: string;
    name: string;
    description: string;
    defaultEnabled: boolean;
    lineItems: Omit<LineItem, "id">[];
  }[];
}

// Generate unique IDs for line items
let itemIdCounter = 0;
export const generateItemId = () => `item_${++itemIdCounter}_${Date.now()}`;

// Default labor rate
export const DEFAULT_LABOR_RATE = 95;
export const DEFAULT_MARKUP = 0.25; // 25%

// ============================================
// FIRE LANE DEFAULTS (System-Wide)
// ============================================
// Non-negotiable starting values for fire lane quotes
export const FIRE_LANE_DEFAULTS = {
  stripingPerLF: 15,
  signInstalled: 125,
  defaultSignQty: 2,
  paint: "traffic-grade red with white lettering",
  lettering: "FIRE LANE – NO PARKING",
};

// Global Fire Lane add-on (available in all templates)
export const FIRE_LANE_ADDON = {
  id: "fire_lane",
  name: "Fire Lane Marking",
  description: "Fire lane striping and signage per AHJ requirements",
  defaultEnabled: false,
  lineItems: [
    {
      category: "Site Life Safety / Fire Access",
      name: "Fire Lane Striping",
      description: `Traffic-grade red paint with white "${FIRE_LANE_DEFAULTS.lettering}" lettering`,
      unit: "LF",
      quantity: 100, // Default linear footage, user editable
      unitPrice: FIRE_LANE_DEFAULTS.stripingPerLF,
      taxable: true,
      notes: "Measure actual fire lane length on site",
    },
    {
      category: "Site Life Safety / Fire Access",
      name: "Fire Lane Sign (Installed)",
      description: "Metal fire lane sign with post, installed",
      unit: "ea",
      quantity: FIRE_LANE_DEFAULTS.defaultSignQty, // 2 for front-only, editable if AHJ requires more
      unitPrice: FIRE_LANE_DEFAULTS.signInstalled,
      markup: 0,
      taxable: true,
      notes: "2 signs standard for front-only fire lane; adjust quantity per AHJ requirements",
    },
  ],
};

// ============================================
// TEMPLATE PRESETS
// ============================================

export const TEMPLATE_PRESETS: Record<TemplateName, TemplatePreset> = {
  daycare: {
    name: "daycare",
    label: "Daycare",
    description: "Fire alarm system for childcare facilities",
    icon: "Baby",
    defaultQuoteType: "install",
    lineItems: [
      {
        category: "Fire Alarm Panel",
        name: "Fire Alarm Control Panel",
        description: "Addressable FACP with remote monitoring capability",
        unit: "ea",
        quantity: 1,
        unitPrice: 2800,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Smoke Detector - Addressable",
        description: "Photoelectric smoke detector",
        unit: "ea",
        quantity: 8,
        unitPrice: 145,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Heat Detector - Addressable",
        description: "Fixed temperature heat detector for kitchen areas",
        unit: "ea",
        quantity: 2,
        unitPrice: 125,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Manual Pull Station",
        description: "Single-action pull station",
        unit: "ea",
        quantity: 2,
        unitPrice: 85,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Notification Devices",
        name: "Horn/Strobe Combination",
        description: "Wall-mount horn/strobe, red, 15/75cd",
        unit: "ea",
        quantity: 6,
        unitPrice: 165,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Wiring & Materials",
        name: "Fire Alarm Wiring & Materials",
        description: "Includes conduit, wire, boxes, and miscellaneous materials",
        unit: "allowance",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 800,
        allowanceHigh: 1200,
        isAllowance: true,
        taxable: true,
      },
      {
        category: "Labor",
        name: "Installation Labor",
        description: "Installation of all fire alarm components",
        unit: "hrs",
        quantity: 24,
        unitPrice: 0,
        laborHours: 24,
        laborRate: DEFAULT_LABOR_RATE,
        taxable: false,
      },
      {
        category: "Services",
        name: "System Programming",
        description: "Panel programming and device mapping",
        unit: "ea",
        quantity: 1,
        unitPrice: 450,
        taxable: false,
      },
      {
        category: "Services",
        name: "Inspection Coordination",
        description: "Scheduling and attendance at fire marshal inspection",
        unit: "ea",
        quantity: 1,
        unitPrice: 350,
        taxable: false,
      },
      {
        category: "Permits",
        name: "Permit Fees",
        description: "City/county permit fees (pass-through)",
        unit: "ea",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 150,
        allowanceHigh: 350,
        isAllowance: true,
        taxable: false,
      },
    ],
    assumptions: [
      "Building is single-story with standard ceiling heights (8-10 ft)",
      "Adequate electrical power available at panel location",
      "Standard construction (no special fire-rated assemblies requiring penetration seals)",
      "No asbestos or hazardous materials present",
      "Work performed during normal business hours",
    ],
    disclaimers: [
      "Final compliance requirements determined by AHJ (Authority Having Jurisdiction)",
      "Additional devices may be required based on final inspection",
      "Permit fees are estimates and will be billed at actual cost",
    ],
    paymentTerms: "50% deposit due upon acceptance, balance due upon completion and inspection approval",
    warranty: "1-year parts and labor warranty on all installed equipment",
    addOns: [
      FIRE_LANE_ADDON,
      {
        id: "cameras",
        name: "Security Cameras",
        description: "Add IP camera system for parent portal viewing",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Cameras",
            name: "IP Camera - Dome",
            description: "4MP dome camera with night vision",
            unit: "ea",
            quantity: 4,
            unitPrice: 285,
            markup: 0.25,
            taxable: true,
          },
          {
            category: "Cameras",
            name: "NVR System",
            description: "8-channel NVR with 2TB storage",
            unit: "ea",
            quantity: 1,
            unitPrice: 650,
            markup: 0.25,
            taxable: true,
          },
        ],
      },
      {
        id: "monitoring",
        name: "24/7 Monitoring",
        description: "Add central station monitoring service",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Monitoring",
            name: "Communicator Module",
            description: "Dual-path cellular/IP communicator",
            unit: "ea",
            quantity: 1,
            unitPrice: 385,
            markup: 0.25,
            taxable: true,
          },
          {
            category: "Monitoring",
            name: "Monitoring Service (Annual)",
            description: "24/7 central station monitoring",
            unit: "yr",
            quantity: 1,
            unitPrice: 420,
            taxable: false,
          },
        ],
      },
    ],
  },

  school: {
    name: "school",
    label: "School",
    description: "Voice evacuation fire alarm for educational facilities",
    icon: "GraduationCap",
    defaultQuoteType: "install",
    lineItems: [
      {
        category: "Fire Alarm Panel",
        name: "Fire Alarm Control Panel with Voice",
        description: "Addressable FACP with integrated voice evacuation",
        unit: "ea",
        quantity: 1,
        unitPrice: 6500,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Fire Alarm Panel",
        name: "Remote Annunciator",
        description: "LCD annunciator panel for main office",
        unit: "ea",
        quantity: 1,
        unitPrice: 850,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Smoke Detector - Addressable",
        description: "Photoelectric smoke detector",
        unit: "ea",
        quantity: 24,
        unitPrice: 145,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Duct Smoke Detector",
        description: "Duct smoke detector with housing",
        unit: "ea",
        quantity: 4,
        unitPrice: 285,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Heat Detector - Addressable",
        description: "Fixed temperature heat detector",
        unit: "ea",
        quantity: 4,
        unitPrice: 125,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Manual Pull Station",
        description: "Dual-action pull station",
        unit: "ea",
        quantity: 8,
        unitPrice: 95,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Notification Devices",
        name: "Speaker/Strobe Combination",
        description: "Wall-mount speaker/strobe, 25/70V",
        unit: "ea",
        quantity: 20,
        unitPrice: 195,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Notification Devices",
        name: "Strobe Only",
        description: "Wall-mount strobe for restrooms",
        unit: "ea",
        quantity: 8,
        unitPrice: 125,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Wiring & Materials",
        name: "Fire Alarm Wiring & Materials",
        description: "Includes conduit, wire, boxes, and miscellaneous materials",
        unit: "allowance",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 3500,
        allowanceHigh: 5000,
        isAllowance: true,
        taxable: true,
      },
      {
        category: "Labor",
        name: "Installation Labor",
        description: "Installation of all fire alarm components",
        unit: "hrs",
        quantity: 80,
        unitPrice: 0,
        laborHours: 80,
        laborRate: DEFAULT_LABOR_RATE,
        taxable: false,
      },
      {
        category: "Services",
        name: "System Programming",
        description: "Panel programming, voice messages, and device mapping",
        unit: "ea",
        quantity: 1,
        unitPrice: 950,
        taxable: false,
      },
      {
        category: "Services",
        name: "Inspection Coordination",
        description: "Scheduling and attendance at fire marshal inspection",
        unit: "ea",
        quantity: 1,
        unitPrice: 450,
        taxable: false,
      },
      {
        category: "Permits",
        name: "Permit Fees",
        description: "City/county permit fees (pass-through)",
        unit: "ea",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 350,
        allowanceHigh: 650,
        isAllowance: true,
        taxable: false,
      },
    ],
    assumptions: [
      "Building has adequate infrastructure for voice system wiring",
      "Existing electrical service adequate for system requirements",
      "Work can be performed during off-hours/summer break",
      "Standard construction materials",
      "Network infrastructure available for IP components",
    ],
    disclaimers: [
      "Voice evacuation messaging requires approval by AHJ",
      "Final device count may vary based on code compliance review",
      "Coordination with school IT required for network integration",
    ],
    paymentTerms: "40% deposit, 40% at rough-in, 20% upon final inspection",
    warranty: "1-year parts and labor warranty on all installed equipment",
    addOns: [
      FIRE_LANE_ADDON,
      {
        id: "lockdown",
        name: "Lockdown Integration",
        description: "Add lockdown button integration with access control",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Access Control",
            name: "Lockdown Button",
            description: "Emergency lockdown activation button",
            unit: "ea",
            quantity: 3,
            unitPrice: 245,
            markup: 0.25,
            taxable: true,
          },
          {
            category: "Services",
            name: "Lockdown Programming",
            description: "Programming and integration with fire alarm",
            unit: "ea",
            quantity: 1,
            unitPrice: 650,
            taxable: false,
          },
        ],
      },
    ],
  },

  retail: {
    name: "retail",
    label: "Retail",
    description: "Fire alarm system for retail spaces",
    icon: "ShoppingBag",
    defaultQuoteType: "install",
    lineItems: [
      {
        category: "Fire Alarm Panel",
        name: "Fire Alarm Control Panel",
        description: "Addressable FACP",
        unit: "ea",
        quantity: 1,
        unitPrice: 2400,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Smoke Detector - Addressable",
        description: "Photoelectric smoke detector",
        unit: "ea",
        quantity: 12,
        unitPrice: 145,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Heat Detector - Addressable",
        description: "Rate-of-rise/fixed temperature heat detector",
        unit: "ea",
        quantity: 2,
        unitPrice: 135,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Manual Pull Station",
        description: "Single-action pull station at exits",
        unit: "ea",
        quantity: 3,
        unitPrice: 85,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Notification Devices",
        name: "Horn/Strobe Combination",
        description: "Wall-mount horn/strobe, red",
        unit: "ea",
        quantity: 8,
        unitPrice: 165,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Wiring & Materials",
        name: "Fire Alarm Wiring & Materials",
        description: "Includes conduit, wire, boxes, and miscellaneous materials",
        unit: "allowance",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 1200,
        allowanceHigh: 1800,
        isAllowance: true,
        taxable: true,
      },
      {
        category: "Labor",
        name: "Installation Labor",
        description: "Installation of all fire alarm components",
        unit: "hrs",
        quantity: 32,
        unitPrice: 0,
        laborHours: 32,
        laborRate: DEFAULT_LABOR_RATE,
        taxable: false,
      },
      {
        category: "Services",
        name: "System Programming",
        description: "Panel programming and device mapping",
        unit: "ea",
        quantity: 1,
        unitPrice: 450,
        taxable: false,
      },
      {
        category: "Services",
        name: "Inspection Coordination",
        description: "Scheduling and attendance at fire marshal inspection",
        unit: "ea",
        quantity: 1,
        unitPrice: 350,
        taxable: false,
      },
      {
        category: "Permits",
        name: "Permit Fees",
        description: "City/county permit fees (pass-through)",
        unit: "ea",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 150,
        allowanceHigh: 300,
        isAllowance: true,
        taxable: false,
      },
    ],
    assumptions: [
      "Standard retail ceiling height (10-14 ft)",
      "Drop ceiling or accessible structure for device mounting",
      "Adequate electrical power available",
      "No high-rack storage requiring additional detection",
    ],
    disclaimers: [
      "Final compliance requirements determined by AHJ",
      "Tenant improvement requirements may affect scope",
    ],
    paymentTerms: "50% deposit due upon acceptance, balance due upon completion",
    warranty: "1-year parts and labor warranty on all installed equipment",
    addOns: [
      FIRE_LANE_ADDON,
      {
        id: "duct_smoke",
        name: "Duct Smoke Detection",
        description: "Add duct smoke detectors for HVAC systems",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Initiating Devices",
            name: "Duct Smoke Detector",
            description: "Duct smoke detector with housing",
            unit: "ea",
            quantity: 2,
            unitPrice: 285,
            markup: 0.25,
            taxable: true,
          },
        ],
      },
      {
        id: "monitoring",
        name: "24/7 Monitoring",
        description: "Add central station monitoring service",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Monitoring",
            name: "Communicator Module",
            description: "Dual-path cellular/IP communicator",
            unit: "ea",
            quantity: 1,
            unitPrice: 385,
            markup: 0.25,
            taxable: true,
          },
          {
            category: "Monitoring",
            name: "Monitoring Service (Annual)",
            description: "24/7 central station monitoring",
            unit: "yr",
            quantity: 1,
            unitPrice: 420,
            taxable: false,
          },
        ],
      },
    ],
  },

  restaurant: {
    name: "restaurant",
    label: "Restaurant",
    description: "Fire alarm with kitchen hood system integration",
    icon: "UtensilsCrossed",
    defaultQuoteType: "install",
    lineItems: [
      {
        category: "Fire Alarm Panel",
        name: "Fire Alarm Control Panel",
        description: "Addressable FACP with hood system interface",
        unit: "ea",
        quantity: 1,
        unitPrice: 2600,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Smoke Detector - Addressable",
        description: "Photoelectric smoke detector (dining/hallways)",
        unit: "ea",
        quantity: 6,
        unitPrice: 145,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Heat Detector - Addressable",
        description: "High-temp heat detector for kitchen areas",
        unit: "ea",
        quantity: 3,
        unitPrice: 145,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Manual Pull Station",
        description: "Single-action pull station at exits",
        unit: "ea",
        quantity: 2,
        unitPrice: 85,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Notification Devices",
        name: "Horn/Strobe Combination",
        description: "Wall-mount horn/strobe, red",
        unit: "ea",
        quantity: 6,
        unitPrice: 165,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Integration",
        name: "Hood Suppression Interface",
        description: "Interface module for kitchen hood suppression system",
        unit: "ea",
        quantity: 1,
        unitPrice: 285,
        markup: 0.25,
        taxable: true,
        notes: "Requires existing Ansul/Kidde hood system with shunt trip",
      },
      {
        category: "Wiring & Materials",
        name: "Fire Alarm Wiring & Materials",
        description: "Includes conduit, wire, boxes, and miscellaneous materials",
        unit: "allowance",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 900,
        allowanceHigh: 1400,
        isAllowance: true,
        taxable: true,
      },
      {
        category: "Labor",
        name: "Installation Labor",
        description: "Installation of all fire alarm components",
        unit: "hrs",
        quantity: 24,
        unitPrice: 0,
        laborHours: 24,
        laborRate: DEFAULT_LABOR_RATE,
        taxable: false,
      },
      {
        category: "Services",
        name: "System Programming",
        description: "Panel programming and device mapping",
        unit: "ea",
        quantity: 1,
        unitPrice: 450,
        taxable: false,
      },
      {
        category: "Services",
        name: "Inspection Coordination",
        description: "Scheduling and attendance at fire marshal inspection",
        unit: "ea",
        quantity: 1,
        unitPrice: 350,
        taxable: false,
      },
      {
        category: "Permits",
        name: "Permit Fees",
        description: "City/county permit fees (pass-through)",
        unit: "ea",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 150,
        allowanceHigh: 300,
        isAllowance: true,
        taxable: false,
      },
    ],
    assumptions: [
      "Existing kitchen hood suppression system is operational",
      "Hood system has shunt trip capability for FA interface",
      "Standard ceiling heights",
      "No duct smoke detectors required (verify with AHJ)",
    ],
    disclaimers: [
      "Kitchen hood suppression system service by others",
      "Final compliance requirements determined by AHJ",
      "Duct smoke detection may be required for large HVAC units",
    ],
    paymentTerms: "50% deposit due upon acceptance, balance due upon completion",
    warranty: "1-year parts and labor warranty on all installed equipment",
    addOns: [
      FIRE_LANE_ADDON,
      {
        id: "rtu_package",
        name: "RTU/Duct Smoke Package",
        description: "Duct smoke detection for rooftop units",
        defaultEnabled: false,
        lineItems: [], // Populated dynamically via RTU modal
      },
      {
        id: "monitoring",
        name: "24/7 Monitoring",
        description: "Add central station monitoring service",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Monitoring",
            name: "Communicator Module",
            description: "Dual-path cellular/IP communicator",
            unit: "ea",
            quantity: 1,
            unitPrice: 385,
            markup: 0.25,
            taxable: true,
          },
          {
            category: "Monitoring",
            name: "Monitoring Service (Annual)",
            description: "24/7 central station monitoring",
            unit: "yr",
            quantity: 1,
            unitPrice: 420,
            taxable: false,
          },
        ],
      },
    ],
  },

  warehouse: {
    name: "warehouse",
    label: "Warehouse",
    description: "Fire alarm for high-ceiling warehouse spaces",
    icon: "Warehouse",
    defaultQuoteType: "install",
    lineItems: [
      {
        category: "Fire Alarm Panel",
        name: "Fire Alarm Control Panel",
        description: "Addressable FACP",
        unit: "ea",
        quantity: 1,
        unitPrice: 2800,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Smoke Detector - Addressable",
        description: "Photoelectric smoke detector (office/break areas)",
        unit: "ea",
        quantity: 6,
        unitPrice: 145,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Heat Detector - Addressable",
        description: "Fixed temperature heat detector (warehouse floor)",
        unit: "ea",
        quantity: 12,
        unitPrice: 125,
        markup: 0.25,
        taxable: true,
        notes: "High-ceiling mounting may require beam detection - verify coverage",
      },
      {
        category: "Initiating Devices",
        name: "Manual Pull Station",
        description: "Single-action pull station at exits",
        unit: "ea",
        quantity: 4,
        unitPrice: 85,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Notification Devices",
        name: "Horn/Strobe Combination",
        description: "Wall-mount horn/strobe, high-candela for large space",
        unit: "ea",
        quantity: 8,
        unitPrice: 185,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Wiring & Materials",
        name: "Fire Alarm Wiring & Materials",
        description: "Includes conduit, wire, boxes, and miscellaneous materials",
        unit: "allowance",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 2000,
        allowanceHigh: 3500,
        isAllowance: true,
        taxable: true,
        notes: "High-ceiling installation may require lift rental",
      },
      {
        category: "Labor",
        name: "Installation Labor",
        description: "Installation of all fire alarm components",
        unit: "hrs",
        quantity: 40,
        unitPrice: 0,
        laborHours: 40,
        laborRate: DEFAULT_LABOR_RATE,
        taxable: false,
      },
      {
        category: "Services",
        name: "System Programming",
        description: "Panel programming and device mapping",
        unit: "ea",
        quantity: 1,
        unitPrice: 450,
        taxable: false,
      },
      {
        category: "Services",
        name: "Inspection Coordination",
        description: "Scheduling and attendance at fire marshal inspection",
        unit: "ea",
        quantity: 1,
        unitPrice: 350,
        taxable: false,
      },
      {
        category: "Permits",
        name: "Permit Fees",
        description: "City/county permit fees (pass-through)",
        unit: "ea",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 200,
        allowanceHigh: 400,
        isAllowance: true,
        taxable: false,
      },
    ],
    assumptions: [
      "Ceiling height 20-30 ft (heat detection coverage verified)",
      "No high-rack storage obstructions",
      "Lift equipment available or rental included",
      "Standard construction materials",
    ],
    disclaimers: [
      "Beam smoke detection may be required for ceilings over 30 ft",
      "Sprinkler system monitoring by others unless specified",
      "Final device placement based on code compliance review",
    ],
    paymentTerms: "50% deposit due upon acceptance, balance due upon completion",
    warranty: "1-year parts and labor warranty on all installed equipment",
    addOns: [
      FIRE_LANE_ADDON,
      {
        id: "beam_smoke",
        name: "Beam Smoke Detection",
        description: "Add beam smoke detectors for high-ceiling areas",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Initiating Devices",
            name: "Beam Smoke Detector",
            description: "Projected beam smoke detector pair",
            unit: "ea",
            quantity: 2,
            unitPrice: 1450,
            markup: 0.25,
            taxable: true,
          },
        ],
      },
      {
        id: "monitoring",
        name: "24/7 Monitoring",
        description: "Add central station monitoring service",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Monitoring",
            name: "Communicator Module",
            description: "Dual-path cellular/IP communicator",
            unit: "ea",
            quantity: 1,
            unitPrice: 385,
            markup: 0.25,
            taxable: true,
          },
          {
            category: "Monitoring",
            name: "Monitoring Service (Annual)",
            description: "24/7 central station monitoring",
            unit: "yr",
            quantity: 1,
            unitPrice: 420,
            taxable: false,
          },
        ],
      },
    ],
  },

  office: {
    name: "office",
    label: "Office",
    description: "Standard fire alarm for office buildings",
    icon: "Building2",
    defaultQuoteType: "install",
    lineItems: [
      {
        category: "Fire Alarm Panel",
        name: "Fire Alarm Control Panel",
        description: "Addressable FACP",
        unit: "ea",
        quantity: 1,
        unitPrice: 2400,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Smoke Detector - Addressable",
        description: "Photoelectric smoke detector",
        unit: "ea",
        quantity: 15,
        unitPrice: 145,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Initiating Devices",
        name: "Manual Pull Station",
        description: "Single-action pull station at exits",
        unit: "ea",
        quantity: 3,
        unitPrice: 85,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Notification Devices",
        name: "Horn/Strobe Combination",
        description: "Wall-mount horn/strobe, red",
        unit: "ea",
        quantity: 10,
        unitPrice: 165,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Notification Devices",
        name: "Strobe Only",
        description: "Strobe for restrooms",
        unit: "ea",
        quantity: 4,
        unitPrice: 125,
        markup: 0.25,
        taxable: true,
      },
      {
        category: "Wiring & Materials",
        name: "Fire Alarm Wiring & Materials",
        description: "Includes conduit, wire, boxes, and miscellaneous materials",
        unit: "allowance",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 1500,
        allowanceHigh: 2200,
        isAllowance: true,
        taxable: true,
      },
      {
        category: "Labor",
        name: "Installation Labor",
        description: "Installation of all fire alarm components",
        unit: "hrs",
        quantity: 36,
        unitPrice: 0,
        laborHours: 36,
        laborRate: DEFAULT_LABOR_RATE,
        taxable: false,
      },
      {
        category: "Services",
        name: "System Programming",
        description: "Panel programming and device mapping",
        unit: "ea",
        quantity: 1,
        unitPrice: 450,
        taxable: false,
      },
      {
        category: "Services",
        name: "Inspection Coordination",
        description: "Scheduling and attendance at fire marshal inspection",
        unit: "ea",
        quantity: 1,
        unitPrice: 350,
        taxable: false,
      },
      {
        category: "Permits",
        name: "Permit Fees",
        description: "City/county permit fees (pass-through)",
        unit: "ea",
        quantity: 1,
        unitPrice: 0,
        allowanceLow: 150,
        allowanceHigh: 300,
        isAllowance: true,
        taxable: false,
      },
    ],
    assumptions: [
      "Standard drop ceiling construction",
      "Standard ceiling heights (8-10 ft)",
      "Adequate electrical power available",
      "Normal business hours installation",
    ],
    disclaimers: [
      "Final compliance requirements determined by AHJ",
      "Corridor smoke detection may be required based on occupancy type",
    ],
    paymentTerms: "50% deposit due upon acceptance, balance due upon completion",
    warranty: "1-year parts and labor warranty on all installed equipment",
    addOns: [
      FIRE_LANE_ADDON,
      {
        id: "duct_smoke",
        name: "Duct Smoke Detection",
        description: "Add duct smoke detectors for HVAC systems",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Initiating Devices",
            name: "Duct Smoke Detector",
            description: "Duct smoke detector with housing",
            unit: "ea",
            quantity: 2,
            unitPrice: 285,
            markup: 0.25,
            taxable: true,
          },
        ],
      },
      {
        id: "monitoring",
        name: "24/7 Monitoring",
        description: "Add central station monitoring service",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Monitoring",
            name: "Communicator Module",
            description: "Dual-path cellular/IP communicator",
            unit: "ea",
            quantity: 1,
            unitPrice: 385,
            markup: 0.25,
            taxable: true,
          },
          {
            category: "Monitoring",
            name: "Monitoring Service (Annual)",
            description: "24/7 central station monitoring",
            unit: "yr",
            quantity: 1,
            unitPrice: 420,
            taxable: false,
          },
        ],
      },
    ],
  },

  inspection: {
    name: "inspection",
    label: "Inspection",
    description: "Annual fire alarm inspection (NFPA 72)",
    icon: "ClipboardCheck",
    defaultQuoteType: "inspection",
    lineItems: [
      {
        category: "Inspection & Testing",
        name: "Annual Fire Alarm Inspection",
        description: "NFPA 72 compliant annual inspection and testing",
        unit: "ea",
        quantity: 1,
        unitPrice: 450,
        taxable: false,
      },
      {
        category: "Inspection & Testing",
        name: "Initiating Device Testing",
        description: "Test all smoke detectors, heat detectors, pull stations",
        unit: "device",
        quantity: 20,
        unitPrice: 8,
        taxable: false,
      },
      {
        category: "Inspection & Testing",
        name: "Notification Device Testing",
        description: "Test all horns, strobes, speakers",
        unit: "device",
        quantity: 15,
        unitPrice: 6,
        taxable: false,
      },
      {
        category: "Inspection & Testing",
        name: "Duct Detector Testing",
        description: "Functional test of duct smoke detectors",
        unit: "device",
        quantity: 2,
        unitPrice: 35,
        taxable: false,
      },
      {
        category: "Inspection & Testing",
        name: "Battery Load Test",
        description: "24-hour standby and 5-minute alarm load test",
        unit: "ea",
        quantity: 1,
        unitPrice: 125,
        taxable: false,
      },
      {
        category: "Documentation",
        name: "Record of Completion",
        description: "NFPA 72 inspection report and documentation",
        unit: "ea",
        quantity: 1,
        unitPrice: 95,
        taxable: false,
      },
    ],
    assumptions: [
      "System is operational and accessible",
      "Customer will provide access to all areas",
      "No repairs or corrections included (quoted separately)",
      "Testing performed during normal business hours",
    ],
    disclaimers: [
      "Deficiencies discovered during inspection will be documented and quoted separately",
      "This quote covers inspection and testing only, not repairs",
      "Fire watch may be required if system must be taken offline for repairs",
    ],
    paymentTerms: "Payment due upon completion of inspection",
    warranty: "N/A - Inspection service only",
    addOns: [
      FIRE_LANE_ADDON,
      {
        id: "sprinkler_visual",
        name: "Sprinkler Visual Inspection",
        description: "Add visual inspection of fire sprinkler system",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Inspection & Testing",
            name: "Sprinkler Visual Inspection",
            description: "Visual inspection of sprinkler heads and piping",
            unit: "ea",
            quantity: 1,
            unitPrice: 275,
            taxable: false,
          },
          {
            category: "Inspection & Testing",
            name: "Valve Inspection",
            description: "Inspect and exercise control valves",
            unit: "valve",
            quantity: 3,
            unitPrice: 45,
            taxable: false,
          },
        ],
      },
      {
        id: "deficiency_repairs",
        name: "Deficiency Repairs (T&M)",
        description: "Pre-authorize repairs at T&M rates",
        defaultEnabled: false,
        lineItems: [
          {
            category: "Deficiency Repairs",
            name: "Repair Labor (T&M)",
            description: "Technician labor for deficiency repairs",
            unit: "hr",
            quantity: 0,
            unitPrice: 0,
            laborHours: 0,
            laborRate: DEFAULT_LABOR_RATE,
            taxable: false,
            notes: "Billed at actual time spent, materials at cost + 25%",
          },
          {
            category: "Deficiency Repairs",
            name: "Materials Allowance",
            description: "Parts and materials for repairs",
            unit: "allowance",
            quantity: 1,
            unitPrice: 0,
            allowanceLow: 0,
            allowanceHigh: 500,
            isAllowance: true,
            taxable: true,
            notes: "Not-to-exceed amount, billed at actual cost + 25%",
          },
        ],
      },
    ],
  },
};

// ============================================
// RTU/DUCT SMOKE PACKAGE TYPES
// ============================================

export type RTUStatus =
  | "working"
  | "not_working"
  | "wiring_cut"
  | "needs_new_duct_smoke"
  | "needs_shutdown_wiring"
  | "unknown";

export interface RTUUnit {
  id: string;
  location: string;
  status: RTUStatus;
  troubleshootingHours: number;
  replaceDuctSmoke: boolean;
  notes: string;
}

export const RTU_STATUS_OPTIONS: { value: RTUStatus; label: string }[] = [
  { value: "working", label: "Working" },
  { value: "not_working", label: "Not working" },
  { value: "wiring_cut", label: "Wiring cut" },
  { value: "needs_new_duct_smoke", label: "Needs new duct smoke" },
  { value: "needs_shutdown_wiring", label: "Needs shutdown wiring" },
  { value: "unknown", label: "Unknown" },
];

// Generate line items from RTU configuration
export function generateRTULineItems(units: RTUUnit[]): Omit<LineItem, "id">[] {
  const items: Omit<LineItem, "id">[] = [];

  let totalTroubleshootingHours = 0;
  let totalReplacements = 0;
  let needsShutdownWiring = false;

  units.forEach((unit) => {
    totalTroubleshootingHours += unit.troubleshootingHours;
    if (unit.replaceDuctSmoke || unit.status === "needs_new_duct_smoke") {
      totalReplacements++;
    }
    if (unit.status === "needs_shutdown_wiring") {
      needsShutdownWiring = true;
    }
  });

  // Troubleshooting labor
  if (totalTroubleshootingHours > 0) {
    items.push({
      category: "RTU/Duct Smoke",
      name: "RTU Duct Smoke Troubleshooting",
      description: `Troubleshooting for ${units.length} RTU(s)`,
      unit: "hrs",
      quantity: totalTroubleshootingHours,
      unitPrice: 0,
      laborHours: totalTroubleshootingHours,
      laborRate: DEFAULT_LABOR_RATE,
      taxable: false,
    });
  }

  // Duct smoke replacements
  if (totalReplacements > 0) {
    items.push({
      category: "RTU/Duct Smoke",
      name: "Duct Smoke Detector Replacement",
      description: "Replace duct smoke detector with housing",
      unit: "ea",
      quantity: totalReplacements,
      unitPrice: 285,
      markup: 0.25,
      taxable: true,
    });
  }

  // Shutdown wiring
  if (needsShutdownWiring) {
    items.push({
      category: "RTU/Duct Smoke",
      name: "RTU Shutdown Interlock Wiring",
      description: "Wiring for RTU shutdown on duct smoke alarm",
      unit: "allowance",
      quantity: 1,
      unitPrice: 0,
      allowanceLow: 350,
      allowanceHigh: 650,
      isAllowance: true,
      taxable: true,
    });
  }

  // Functional test (always include if any RTUs)
  if (units.length > 0) {
    items.push({
      category: "RTU/Duct Smoke",
      name: "Functional Test & Documentation",
      description: "Test duct smoke shutdown and document",
      unit: "ea",
      quantity: 1,
      unitPrice: 195,
      taxable: false,
    });
  }

  return items;
}

// ============================================
// QUOTE TYPE OPTIONS
// ============================================

export const QUOTE_TYPE_OPTIONS: { value: QuoteType; label: string; description: string }[] = [
  { value: "install", label: "New Installation", description: "Complete new fire alarm system installation" },
  { value: "retrofit", label: "Retrofit/Upgrade", description: "Upgrade or replace existing system" },
  { value: "service", label: "Service/Repair", description: "Repair or service existing equipment" },
  { value: "inspection", label: "Inspection", description: "Annual inspection and testing" },
  { value: "monitoring", label: "Monitoring", description: "Central station monitoring service" },
  { value: "compliance", label: "Compliance", description: "Fire marshal deficiency corrections" },
];

// ============================================
// PRICING CALCULATIONS
// ============================================

export interface QuoteTotals {
  subtotal: number;
  subtotalLow: number;
  subtotalHigh: number;
  laborTotal: number;
  materialsTotal: number;
  tax: number;
  taxRate: number;
  total: number;
  totalLow: number;
  totalHigh: number;
}

export function calculateLineItemTotal(item: LineItem): {
  amount: number;
  amountLow: number;
  amountHigh: number;
} {
  if (item.isAllowance) {
    return {
      amount: (item.allowanceLow! + item.allowanceHigh!) / 2,
      amountLow: item.allowanceLow!,
      amountHigh: item.allowanceHigh!,
    };
  }

  if (item.laborHours && item.laborRate) {
    const amount = item.laborHours * item.laborRate;
    return { amount, amountLow: amount, amountHigh: amount };
  }

  let amount = item.quantity * item.unitPrice;
  if (item.markup) {
    amount = amount * (1 + item.markup);
  }

  return { amount, amountLow: amount, amountHigh: amount };
}

export function calculateQuoteTotals(
  lineItems: LineItem[],
  taxRate: number = 0.0825 // 8.25% Texas sales tax
): QuoteTotals {
  let subtotal = 0;
  let subtotalLow = 0;
  let subtotalHigh = 0;
  let laborTotal = 0;
  let materialsTotal = 0;
  let taxableAmount = 0;

  lineItems.forEach((item) => {
    const { amount, amountLow, amountHigh } = calculateLineItemTotal(item);

    subtotal += amount;
    subtotalLow += amountLow;
    subtotalHigh += amountHigh;

    if (item.laborHours && item.laborRate) {
      laborTotal += amount;
    } else {
      materialsTotal += amount;
    }

    if (item.taxable) {
      taxableAmount += amount;
    }
  });

  const tax = taxableAmount * taxRate;
  const taxLow = subtotalLow * taxRate * (taxableAmount / subtotal || 0);
  const taxHigh = subtotalHigh * taxRate * (taxableAmount / subtotal || 0);

  return {
    subtotal,
    subtotalLow,
    subtotalHigh,
    laborTotal,
    materialsTotal,
    tax,
    taxRate,
    total: subtotal + tax,
    totalLow: subtotalLow + taxLow,
    totalHigh: subtotalHigh + taxHigh,
  };
}
