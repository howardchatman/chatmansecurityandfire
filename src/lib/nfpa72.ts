// NFPA 72 Inspection and Testing Form (Figure 10.6.2.3) — the Chatman Security
// & Fire version.
//
// This is the seven-page form techs already fill out by hand and hand to the
// fire marshal. Everything the standard asks for is here, in the standard's
// order, so a marshal reading it finds what they expect where they expect it.
// What changes is the presentation: our logo, our colors, and a screen you can
// actually type into instead of a PDF you fight with.
//
// Every row carries its own label rather than being keyed off a constant. A
// form saved in January still renders correctly in December even if we add a
// device type in between — the saved rows are the truth, and the constants
// below only seed new forms.

export interface DeviceRow {
  label: string;
  qty_installed: string;
  circuit_style: string;
  qty_tested: string;
  /** Fills the "(Specify)" blank on Other rows. */
  specify?: string;
}

/** Visual / Functional check with room for a note. */
export interface TestRow {
  label: string;
  visual: boolean;
  functional: boolean;
  comments: string;
}

/** "Notifications are made" — who was told, and when. */
export interface NotifyRow {
  label: string;
  /** "yes" | "no" | "" — unanswered is meaningful, so this is not a boolean. */
  answer: "" | "yes" | "no";
  who: string;
  time: string;
}

/** Supervising station signal verification. */
export interface SignalRow {
  label: string;
  answer: "" | "yes" | "no";
  time: string;
  comments: string;
}

/** One line of the initiating/supervisory device test log. */
export interface DeviceTestRow {
  location: string;
  device_type: string;
  visual: boolean;
  functional: boolean;
  factory_setting: string;
  measured_setting: string;
  /** "" until tested, then pass or fail. */
  result: "" | "pass" | "fail";
}

export interface CombinationRow {
  label: string;
  /** Free text on the (Specify) rows; fixed on the first two. */
  specify?: string;
  visual: boolean;
  device_operation: string;
  simulated_operation: string;
}

export interface Nfpa72Form {
  date: string;
  time: string;

  service_org: {
    name: string;
    address: string;
    representative: string;
    license_no: string;
    telephone: string;
  };

  monitoring: {
    contact: string;
    telephone: string;
    account_ref: string;
  };

  /** McCulloh / Multiplex / Digital / Reverse Priority / RF — more than one can apply. */
  transmission: string[];
  transmission_other: string;

  control_unit: {
    manufacturer: string;
    model_no: string;
    circuit_styles: string;
    number_of_circuits: string;
    software_rev: string;
  };

  property: {
    name: string;
    address: string;
    owner_contact: string;
    telephone: string;
  };

  approving_agency: {
    contact: string;
    telephone: string;
  };

  /** Weekly | Monthly | Quarterly | Semiannually | Annually */
  service_frequency: string;
  service_other: string;

  last_service_date: string;
  last_config_revision_date: string;

  initiating: DeviceRow[];
  /** "" | "disabled" | "enabled" */
  alarm_verification: string;

  notification: DeviceRow[];
  nac_circuit_count: string;
  /** "" | "yes" | "no" — are circuits monitored for integrity? */
  circuits_monitored: "" | "yes" | "no";

  supervisory: DeviceRow[];

  slc: { quantity: string; styles: string };

  power: {
    primary_voltage: string;
    primary_amps: string;
    overcurrent_type: string;
    overcurrent_amps: string;
    panelboard_location: string;
    disconnect_location: string;
    secondary_voltage: string;
    battery_amp_hr: string;
    calculated_capacity: string;
    capacity_hours: string;
    generator: string;
    fuel_storage: string;
  };

  /** Dry Cell | Lead-Acid | Nickel-Cadmium | Sealed Lead Acid | Other */
  battery_type: string;
  battery_other: string;

  /** NFPA 70 Article 700 | 701 | 702 backup, when used instead of secondary power. */
  standby_article: string;

  pre_test_notifications: NotifyRow[];
  system_tests: TestRow[];
  secondary_power_tests: TestRow[];

  device_tests: DeviceTestRow[];
  device_tests_comments: string;

  emergency_comms: TestRow[];
  combination_systems: CombinationRow[];
  interface_equipment: string[];
  special_hazard_systems: string[];
  special_procedures: string;
  page6_comments: string;

  supervising_station: SignalRow[];
  post_test_notifications: NotifyRow[];
  did_not_operate: string;
  restored: { date: string; time: string };

  inspector: { name: string; date: string; time: string; signature: string };
  owner_rep: { name: string; date: string; time: string; signature: string };
}

// ── Seed lists ────────────────────────────────────────────────────────────
// Only used to build a blank form. Saved forms carry their own labels.

const INITIATING = [
  "Manual Fire Alarm Boxes",
  "Ion Detectors",
  "Photo Detectors",
  "Duct Detectors",
  "Heat Detectors",
  "Waterflow Switches",
  "Supervisory Switches",
  "Other (Specify)",
];

const NOTIFICATION = ["Bells", "Horns", "Chimes", "Strobes", "Speakers", "Other (Specify)"];

const SUPERVISORY = [
  "Building Temp.",
  "Site Water Temp.",
  "Site Water Level",
  "Fire Pump Power",
  "Fire Pump Running",
  "Fire Pump Auto Position",
  "Fire Pump or Pump Controller Trouble",
  "Generator in Auto Position",
  "Generator or Controller Trouble",
  "Switch Transfer",
  "Generator Engine Running",
  "Other (Specify)",
];

const PRE_TEST_NOTIFY = [
  "Monitoring Entity",
  "Building Occupants",
  "Building Management",
  "Other (Specify)",
  "AHJ Notified of Any Impairments",
];

const SYSTEM_TESTS = [
  "Control Unit",
  "Interface Equipment",
  "Lamps/LEDs",
  "Fuses",
  "Primary Power Supply",
  "Trouble Signals",
  "Disconnect Switches",
  "Ground-Fault Monitoring",
];

const SECONDARY_POWER = [
  "Battery Condition",
  "Load Voltage",
  "Discharge Test",
  "Charger Test",
  "Specific Gravity",
  "Transient Suppressors",
  "Remote Annunciators",
  "Notification Appliances — Audible",
  "Notification Appliances — Visible",
  "Notification Appliances — Speakers",
  "Notification Appliances — Voice Clarity",
];

const EMERGENCY_COMMS = [
  "Phone Set",
  "Phone Jacks",
  "Off-Hook Indicator",
  "Amplifier(s)",
  "Tone Generator(s)",
  "Call-in Signal",
  "System Performance",
];

const SUPERVISING_STATION = [
  "Alarm Signal",
  "Alarm Restoration",
  "Trouble Signal",
  "Trouble Signal Restoration",
  "Supervisory Signal",
  "Supervisory Restoration",
];

const POST_TEST_NOTIFY = [
  "Building Management",
  "Monitoring Agency",
  "Building Occupants",
  "Other (Specify)",
];

export const TRANSMISSION_TYPES = ["McCulloh", "Multiplex", "Digital", "Reverse Priority", "RF"];
export const SERVICE_FREQUENCIES = ["Weekly", "Monthly", "Quarterly", "Semiannually", "Annually"];
export const BATTERY_TYPES = ["Dry Cell", "Lead-Acid", "Nickel-Cadmium", "Sealed Lead Acid", "Other"];

/** The certification line that has to appear above the signatures. */
export const CERTIFICATION =
  "THIS TESTING WAS PERFORMED IN ACCORDANCE WITH APPLICABLE NFPA STANDARDS";

/**
 * NFPA holds the copyright on Figure 10.6.2.3 and permits copying for
 * individual use. Our version keeps the attribution on every page — it is both
 * the honest thing to do and what tells a fire marshal which figure they are
 * looking at.
 */
export const NFPA_ATTRIBUTION = "Based on NFPA 72, Figure 10.6.2.3";

/** Company details that are the same on every form we issue. */
export const SERVICE_ORG_DEFAULTS = {
  name: "Chatman Security & Fire",
  address: "",
  representative: "Howard Chatman",
  license_no: "",
  telephone: "832-859-7009",
};

const device = (label: string): DeviceRow => ({
  label,
  qty_installed: "",
  circuit_style: "",
  qty_tested: "",
  ...(label.startsWith("Other") ? { specify: "" } : {}),
});
const test = (label: string): TestRow => ({ label, visual: false, functional: false, comments: "" });
const notify = (label: string): NotifyRow => ({ label, answer: "", who: "", time: "" });
const signal = (label: string): SignalRow => ({ label, answer: "", time: "", comments: "" });

export function emptyDeviceTestRow(): DeviceTestRow {
  return {
    location: "",
    device_type: "",
    visual: false,
    functional: false,
    factory_setting: "",
    measured_setting: "",
    result: "",
  };
}

/**
 * A blank form, optionally pre-filled from the inspection record so the tech
 * isn't retyping the customer's name and address they already entered.
 */
export function emptyNfpa72Form(seed?: {
  date?: string;
  property_name?: string;
  property_address?: string;
  owner_contact?: string;
  owner_telephone?: string;
  inspector_name?: string;
}): Nfpa72Form {
  return {
    date: seed?.date || "",
    time: "",
    service_org: { ...SERVICE_ORG_DEFAULTS },
    monitoring: { contact: "", telephone: "", account_ref: "" },
    transmission: [],
    transmission_other: "",
    control_unit: {
      manufacturer: "",
      model_no: "",
      circuit_styles: "",
      number_of_circuits: "",
      software_rev: "",
    },
    property: {
      name: seed?.property_name || "",
      address: seed?.property_address || "",
      owner_contact: seed?.owner_contact || "",
      telephone: seed?.owner_telephone || "",
    },
    approving_agency: { contact: "", telephone: "" },
    service_frequency: "",
    service_other: "",
    last_service_date: "",
    last_config_revision_date: "",
    initiating: INITIATING.map(device),
    alarm_verification: "",
    notification: NOTIFICATION.map(device),
    nac_circuit_count: "",
    circuits_monitored: "",
    supervisory: SUPERVISORY.map(device),
    slc: { quantity: "", styles: "" },
    power: {
      primary_voltage: "",
      primary_amps: "",
      overcurrent_type: "",
      overcurrent_amps: "",
      panelboard_location: "",
      disconnect_location: "",
      secondary_voltage: "",
      battery_amp_hr: "",
      calculated_capacity: "",
      capacity_hours: "",
      generator: "",
      fuel_storage: "",
    },
    battery_type: "",
    battery_other: "",
    standby_article: "",
    pre_test_notifications: PRE_TEST_NOTIFY.map(notify),
    system_tests: SYSTEM_TESTS.map(test),
    secondary_power_tests: SECONDARY_POWER.map(test),
    device_tests: [
      { ...emptyDeviceTestRow(), device_type: "Smoke Detectors" },
      { ...emptyDeviceTestRow(), device_type: "Pull Stations" },
      { ...emptyDeviceTestRow(), device_type: "Heat Detectors" },
      { ...emptyDeviceTestRow(), device_type: "Waterflow" },
      { ...emptyDeviceTestRow(), device_type: "Tamper" },
    ],
    device_tests_comments: "",
    emergency_comms: EMERGENCY_COMMS.map(test),
    combination_systems: [
      {
        label: "Fire Extinguisher Monitoring Device/System",
        visual: false,
        device_operation: "",
        simulated_operation: "",
      },
      {
        label: "Carbon Monoxide Detector/System",
        visual: false,
        device_operation: "",
        simulated_operation: "",
      },
      { label: "Other (Specify)", specify: "", visual: false, device_operation: "", simulated_operation: "" },
    ],
    interface_equipment: ["", "", ""],
    special_hazard_systems: ["", "", ""],
    special_procedures: "",
    page6_comments: "",
    supervising_station: SUPERVISING_STATION.map(signal),
    post_test_notifications: POST_TEST_NOTIFY.map(notify),
    did_not_operate: "",
    restored: { date: "", time: "" },
    inspector: { name: seed?.inspector_name || "", date: "", time: "", signature: "" },
    owner_rep: { name: "", date: "", time: "", signature: "" },
  };
}

/**
 * Older saved forms may predate fields added later. Merging over a blank form
 * means a tech opening a January form in December gets the new fields rather
 * than a page of `undefined`.
 */
export function hydrateNfpa72Form(saved: unknown): Nfpa72Form {
  const base = emptyNfpa72Form();
  if (!saved || typeof saved !== "object") return base;
  return { ...base, ...(saved as Partial<Nfpa72Form>) };
}

/**
 * How much of the form is filled in — shown to the tech so an unfinished form
 * doesn't get handed to a fire marshal by accident.
 *
 * Deliberately counts only the fields that identify the property and certify
 * the test. Device quantities vary by building; a small system legitimately
 * leaves most device rows blank, so counting those would punish honest forms.
 */
export function nfpa72Completeness(f: Nfpa72Form): { done: number; total: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ["Date of inspection", !!f.date],
    ["Property name", !!f.property.name],
    ["Property address", !!f.property.address],
    ["Service representative", !!f.service_org.representative],
    ["License number", !!f.service_org.license_no],
    ["Service frequency", !!f.service_frequency || !!f.service_other],
    ["Control unit manufacturer", !!f.control_unit.manufacturer],
    ["Control unit model", !!f.control_unit.model_no],
    ["At least one device tested", f.initiating.some((r) => !!r.qty_tested)],
    ["Supervising station signals verified", f.supervising_station.some((r) => r.answer !== "")],
    ["System restored to normal", !!f.restored.date],
    ["Inspector name", !!f.inspector.name],
    ["Inspector signature", !!f.inspector.signature],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
  return { done: checks.length - missing.length, total: checks.length, missing };
}
