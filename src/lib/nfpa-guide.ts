// Content for the NFPA study guide at /academy/nfpa. Plain-language summaries
// for building owners and managers, written to match the Academy's NFPA
// course. Editions and local amendments vary; the AHJ has the final word.

export type GuideStandard = {
  number: string;
  title: string;
  covers: string;
  points: string[];
  /** Academy course hash to practice it (see COURSES in the Academy). */
  practice: { label: string; hash: string };
};

export const GUIDE_STANDARDS: GuideStandard[] = [
  {
    number: "NFPA 1",
    title: "Fire Code",
    covers:
      "The baseline fire prevention code: fire department access, housekeeping, hazardous materials, permits, and fire protection systems. For system details it points to the other NFPA standards.",
    points: [
      "Fire department access roads at least 20 feet wide, with 13 feet 6 inches of vertical clearance.",
      "Fire protection systems kept in service, with notification and precautions when one is down.",
    ],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 10",
    title: "Portable Fire Extinguishers",
    covers: "Choosing, placing, inspecting, maintaining, and testing portable extinguishers.",
    points: [
      "Monthly (about every 30 days) visual inspection: in place, visible, charged, pin and seal intact, undamaged.",
      "Annual maintenance by a licensed technician, recorded on the tag.",
      "Hydrostatic test every 5 years for water, CO2, and wet chemical; every 12 years for stored-pressure dry chemical.",
      "Walking distance: no more than 75 feet to a Class A extinguisher; 30 feet to a Class K in commercial kitchens.",
      "Top no higher than 5 feet (40 lb or lighter) or 3½ feet (heavier); bottom at least 4 inches off the floor.",
    ],
    practice: { label: "Fire Extinguishers course", hash: "extinguishers" },
  },
  {
    number: "NFPA 13",
    title: "Installation of Sprinkler Systems",
    covers: "How commercial sprinkler systems are designed and installed, from hazard classification to pipe sizing and water supply.",
    points: [
      "Occupancy hazard (light, ordinary 1 and 2, extra 1 and 2) sets how much water the design delivers.",
      "Standard spray heads up to 15 feet apart in light and ordinary hazard, and never closer than 6 feet.",
      "At least 18 inches between storage and sprinkler deflectors (more for some warehouse sprinklers).",
      "Spare-head cabinet: at least 6 spares under 300 sprinklers, 12 for 300 to 1,000, 24 over 1,000.",
      "Glass bulb color shows the temperature rating: orange 135°F, red 155°F, yellow 175°F, green 200°F, blue 286°F.",
    ],
    practice: { label: "Fire Sprinklers course", hash: "sprinklers" },
  },
  {
    number: "NFPA 13D & 13R",
    title: "Residential Sprinkler Systems",
    covers:
      "Lighter-duty sprinkler standards built around giving people time to escape. 13D covers one- and two-family homes and manufactured homes; 13R covers low-rise residential buildings like apartments and dorms, up to four stories.",
    points: ["Commercial buildings and taller residential buildings use full NFPA 13 systems."],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 14",
    title: "Standpipe and Hose Systems",
    covers: "The built-in pipes and hose connections firefighters use inside tall or large buildings.",
    points: [
      "Class I: 2½-inch connections for fire department use. Class II: 1½-inch hose stations for trained occupants. Class III: both.",
      "Flow tested every 5 years under NFPA 25.",
    ],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 20",
    title: "Stationary Fire Pumps",
    covers: "Installing fire pumps that boost water pressure when the city supply can't deliver enough for sprinklers or standpipes.",
    points: [
      "Under NFPA 25, diesel pumps run weekly and most electric pumps run monthly, with an annual flow test.",
    ],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 25",
    title: "Inspection, Testing, and Maintenance of Water-Based Systems",
    covers:
      "Keeping sprinklers, standpipes, fire pumps, private hydrants, and their water supplies working after installation. The building owner is responsible.",
    points: [
      "Annually: look over sprinklers from the floor, and run a main drain test.",
      "Quarterly: inspect the fire department connection (FDC).",
      "Every 6 months: test vane-type and pressure-type waterflow alarm switches.",
      "Every 5 years: internal inspection of piping, gauges replaced or calibrated, standpipe flow test.",
      "Painted, corroded, damaged, or loaded sprinklers are replaced, not cleaned.",
      "Chapter 15 impairments: an impairment coordinator, tags, notifications, and precautions while a system is down.",
    ],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 72",
    title: "National Fire Alarm and Signaling Code",
    covers: "Fire alarm design, installation, inspection, testing, and maintenance: detectors, pull stations, horns and strobes, panels, and monitoring.",
    points: [
      "Three signal types: alarm (fire), supervisory (fire protection impaired), and trouble (fault in the alarm system).",
      "Detectors and notification appliances tested every year; smoke detector sensitivity within a year of installation, then every other year.",
      "Pull stations 42 to 48 inches high, within 5 feet of exit doors, and never more than a 200-foot walk from anywhere on the floor.",
      "Wall strobes 80 to 96 inches above the floor; smoke detectors at least 3 feet from supply air vents.",
      "Backup batteries typically sized for 24 hours of standby plus 5 minutes of alarm (15 minutes for voice evacuation).",
    ],
    practice: { label: "Fire Alarms course", hash: "fire-alarms" },
  },
  {
    number: "NFPA 70",
    title: "National Electrical Code",
    covers: "The wiring rules for everything electrical. Article 760 covers fire alarm circuits.",
    points: [],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 80",
    title: "Fire Doors and Other Opening Protectives",
    covers: "Fire doors, frames, hardware, and shutters that keep fire and smoke from spreading between areas.",
    points: [
      "Fire doors must close and latch on their own. Never wedge or tie them open.",
      "Hold-open devices are allowed only if they release automatically when the alarm sounds.",
      "Every fire door assembly is inspected and tested once a year.",
    ],
    practice: { label: "Life Safety Walkthrough", hash: "nfpa" },
  },
  {
    number: "NFPA 96",
    title: "Ventilation Control and Fire Protection of Commercial Cooking Operations",
    covers: "Commercial kitchen hoods, grease ducts, exhaust fans, and the fire protection that goes with them.",
    points: [
      "Hood and duct cleaning: monthly for solid-fuel cooking, quarterly for high volume (charbroiling, woks, 24-hour), every 6 months for moderate volume, yearly for low volume.",
      "The hood suppression system is serviced every 6 months.",
      "A manual pull for the hood system in the path of egress, 10 to 20 feet from the hood.",
      "When the system trips, fuel and power to the appliances under the hood shut off automatically.",
    ],
    practice: { label: "Kitchen Walkthrough", hash: "nfpa" },
  },
  {
    number: "NFPA 17A",
    title: "Wet Chemical Extinguishing Systems",
    covers: "Pre-engineered wet chemical systems, like the hood suppression system over a restaurant's fryers.",
    points: [
      "Nozzles are aimed at each appliance's exact position. Moving appliances defeats the design.",
      "Serviced every 6 months by a licensed company.",
    ],
    practice: { label: "Kitchen Walkthrough", hash: "nfpa" },
  },
  {
    number: "NFPA 101",
    title: "Life Safety Code",
    covers: "Getting people out alive: exits, egress paths, exit signs, emergency lighting, and the protection features each occupancy needs.",
    points: [
      "Exits open from the inside without a key, tool, or special knowledge.",
      "Exit signs stay lit, and egress paths stay clear for their full width.",
      "Emergency lighting runs 90 minutes: tested 30 seconds monthly and 90 minutes yearly.",
      "Fire alarm out more than 4 hours in 24, or sprinklers out more than 10: notify the AHJ, then evacuate or post a fire watch.",
    ],
    practice: { label: "Life Safety Walkthrough", hash: "nfpa" },
  },
  {
    number: "NFPA 110",
    title: "Emergency and Standby Power Systems",
    covers: "Generators and transfer equipment that keep emergency systems running when the power fails.",
    points: ["Inspected weekly and run under load for at least 30 minutes every month."],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 2001",
    title: "Clean Agent Fire Extinguishing Systems",
    covers: "Gas systems that put out fire and leave no residue, common in server rooms, archives, and telecom spaces.",
    points: ["The room has to hold the agent long enough to work, so its enclosure integrity matters."],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 30",
    title: "Flammable and Combustible Liquids Code",
    covers: "Storing and handling fuels, solvents, and other flammable or combustible liquids: quantities, containers, cabinets, and locations.",
    points: ["Flammable liquids never belong in exit paths or hallway closets."],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 241",
    title: "Safeguarding Construction, Alteration, and Demolition Operations",
    covers: "Fire safety while a building is under construction or renovation, when it's most vulnerable: hot work, temporary heat, and keeping fire protection available as the work goes on.",
    points: [],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
  {
    number: "NFPA 4",
    title: "Integrated Fire Protection and Life Safety System Testing",
    covers: "Testing that systems work together: the alarm releases door holders, recalls elevators, and shuts down fans the way it's supposed to.",
    points: [],
    practice: { label: "NFPA Codes course", hash: "nfpa" },
  },
];

export const GUIDE_SCHEDULE: { system: string; task: string; frequency: string; standard: string }[] = [
  { system: "Generator", task: "Inspect", frequency: "Weekly", standard: "NFPA 110" },
  { system: "Fire pump (diesel)", task: "No-flow run", frequency: "Weekly", standard: "NFPA 25" },
  { system: "Fire pump (most electric)", task: "No-flow run", frequency: "Monthly", standard: "NFPA 25" },
  { system: "Extinguishers", task: "Visual inspection", frequency: "Monthly", standard: "NFPA 10" },
  { system: "Emergency lights", task: "30-second test", frequency: "Monthly", standard: "NFPA 101" },
  { system: "Generator", task: "Run under load, 30+ minutes", frequency: "Monthly", standard: "NFPA 110" },
  { system: "Fire department connection", task: "Inspect", frequency: "Quarterly", standard: "NFPA 25" },
  { system: "Waterflow alarm switches", task: "Test", frequency: "Every 6 months", standard: "NFPA 25 & 72" },
  { system: "Kitchen hood suppression", task: "Service", frequency: "Every 6 months", standard: "NFPA 96 & 17A" },
  { system: "Sprinklers", task: "Inspect from the floor", frequency: "Annually", standard: "NFPA 25" },
  { system: "Sprinkler riser", task: "Main drain test", frequency: "Annually", standard: "NFPA 25" },
  { system: "Fire pump", task: "Flow test", frequency: "Annually", standard: "NFPA 25" },
  { system: "Fire alarm devices", task: "Functional test", frequency: "Annually", standard: "NFPA 72" },
  { system: "Extinguishers", task: "Maintenance and tag", frequency: "Annually", standard: "NFPA 10" },
  { system: "Emergency lights", task: "90-minute test", frequency: "Annually", standard: "NFPA 101" },
  { system: "Fire doors", task: "Inspect and test", frequency: "Annually", standard: "NFPA 80" },
  { system: "Smoke detectors", task: "Sensitivity test", frequency: "Every 2 years (after year 1)", standard: "NFPA 72" },
  { system: "Sprinkler piping", task: "Internal inspection", frequency: "Every 5 years", standard: "NFPA 25" },
  { system: "Sprinkler gauges", task: "Replace or calibrate", frequency: "Every 5 years", standard: "NFPA 25" },
  { system: "Standpipes", task: "Flow test", frequency: "Every 5 years", standard: "NFPA 25" },
  { system: "CO2 and water extinguishers", task: "Hydrostatic test", frequency: "Every 5 years", standard: "NFPA 10" },
  { system: "Dry chemical extinguishers", task: "Hydrostatic test", frequency: "Every 12 years", standard: "NFPA 10" },
  { system: "Fast-response sprinklers", task: "Sample test", frequency: "At 20 years, then every 10", standard: "NFPA 25" },
  { system: "Standard-response sprinklers", task: "Sample test", frequency: "At 50 years, then every 10", standard: "NFPA 25" },
];

export const GUIDE_NUMBERS: { value: string; what: string; standard: string }[] = [
  { value: "15 ft", what: "Max spacing between standard sprinklers, light and ordinary hazard", standard: "NFPA 13" },
  { value: "6 ft", what: "Minimum spacing between sprinklers", standard: "NFPA 13" },
  { value: "18 in", what: "Clearance between storage and sprinkler deflectors", standard: "NFPA 13" },
  { value: "42–48 in", what: "Pull station mounting height", standard: "NFPA 72" },
  { value: "5 ft", what: "Max distance from an exit door to its pull station", standard: "NFPA 72" },
  { value: "200 ft", what: "Max walk to the nearest pull station", standard: "NFPA 72" },
  { value: "80–96 in", what: "Wall-mounted strobe height", standard: "NFPA 72" },
  { value: "3 ft", what: "Smoke detector distance from a supply air vent", standard: "NFPA 72" },
  { value: "24 hr + 5 min", what: "Fire alarm battery: standby, then alarm", standard: "NFPA 72" },
  { value: "75 ft", what: "Max walk to a Class A extinguisher", standard: "NFPA 10" },
  { value: "30 ft", what: "Max walk to a Class K extinguisher", standard: "NFPA 10" },
  { value: "5 ft", what: "Max height to the top of an extinguisher 40 lb or lighter", standard: "NFPA 10" },
  { value: "90 min", what: "Emergency lighting battery duration", standard: "NFPA 101" },
  { value: "4 hr", what: "Fire alarm outage (in 24 hours) that triggers a fire watch", standard: "NFPA 101" },
  { value: "10 hr", what: "Sprinkler outage (in 24 hours) that triggers a fire watch", standard: "NFPA 101 & 25" },
  { value: "10–20 ft", what: "Kitchen hood manual pull distance from the hood", standard: "NFPA 96" },
  { value: "20 ft", what: "Minimum fire department access road width", standard: "NFPA 1" },
];

export const GUIDE_GLOSSARY: { term: string; meaning: string }[] = [
  { term: "AHJ", meaning: "Authority Having Jurisdiction: the office that enforces the code and approves systems. Usually the local fire marshal." },
  { term: "ITM", meaning: "Inspection, testing, and maintenance: the ongoing work that keeps a system ready after it's installed." },
  { term: "Listed", meaning: "Included on a list from a testing organization (like UL or FM) as suitable for a specific purpose." },
  { term: "Approved", meaning: "Acceptable to the AHJ. Listed equipment still has to be approved for the installation." },
  { term: "Impairment", meaning: "A fire protection system, or part of one, that's out of order. It can be planned (a repair) or an emergency (a burst pipe)." },
  { term: "Impairment coordinator", meaning: "The person the owner assigns to manage impairments: notifications, tags, precautions, and restoring service." },
  { term: "Fire watch", meaning: "Trained people assigned to patrol an unprotected area, watch for fire, warn occupants, and call the fire department." },
  { term: "Alarm signal", meaning: "A signal that means fire. Horns and strobes sound and the fire department is called." },
  { term: "Supervisory signal", meaning: "Something that would keep fire protection from working is off-normal, like a closed sprinkler valve." },
  { term: "Trouble signal", meaning: "A fault in the fire alarm system itself, like a cut wire, low battery, or lost power." },
  { term: "Hazard classification", meaning: "NFPA 13's rating of how much fuel a space has and how fast it burns. It sets how much water the sprinklers deliver." },
  { term: "Design density", meaning: "How much water the sprinkler design delivers, in gallons per minute per square foot, over a set design area." },
  { term: "Wet pipe system", meaning: "Pipes full of water at all times. The most common type." },
  { term: "Dry pipe system", meaning: "Pipes full of pressurized air, with water held back at a valve. Used where pipes could freeze." },
  { term: "Preaction system", meaning: "A dry system that needs a detector to trip before water enters the pipes. Common in server rooms and museums." },
  { term: "Deluge system", meaning: "Open heads on dry pipe. When detection trips the valve, every head flows at once. Used for high hazards like aircraft hangars." },
  { term: "Main drain test", meaning: "Opening the riser's main drain and comparing the pressure drop with past results to check the water supply and valves." },
  { term: "Hydrostatic test", meaning: "Pressure-testing a cylinder or pipe with water to make sure it's still safe." },
  { term: "Temporal-3", meaning: "The three-pulse evacuation pattern fire alarm horns sound." },
];
