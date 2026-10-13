"use client";

// NFPA Codes course: which standard covers what, how often things get
// inspected and tested, hazard classification, the numbers inspectors check,
// impairments and fire watch, and two code walkthroughs (egress and a
// commercial kitchen).
//
// Requirements are summarized for building owners and managers. Editions and
// local amendments vary; the AHJ has the final word.

import {
  Briefcase,
  Car,
  ChefHat,
  Cog,
  Factory,
  ShoppingBag,
  SprayCan,
  Theater,
  TreePine,
  UtensilsCrossed,
} from "lucide-react";
import { HornStrobe, PullStation, SmokeDetector } from "../art-alarm";
import { Extinguisher } from "../art-extinguisher";
import MatchLevel, { type MatchPair } from "../levels/MatchLevel";
import NumberLevel, { type NumberQuestion } from "../levels/NumberLevel";
import QuizLevel, { type QuizQuestion } from "../levels/QuizLevel";
import SpotLevel, { type Decoy, type Violation } from "../levels/SpotLevel";
import { type LevelProps, SubjectCard } from "../ui";

/* ---------- Level 1: NFPA by the numbers (memory match) ---------- */

const pair = (n: string, meaning: string, fact: string): MatchPair => ({ id: n, term: `NFPA ${n}`, meaning, fact });

const MATCH_ROUNDS = [
  {
    name: "The big six",
    pairs: [
      pair("1", "The Fire Code", "Fire prevention across a building's life: housekeeping, access roads, permits. It pulls in the other standards by reference."),
      pair("10", "Portable extinguishers", "Choosing, placing, inspecting, and maintaining extinguishers: monthly checks, annual service, hydrostatic tests."),
      pair("13", "Installing sprinkler systems", "How sprinklers are designed and installed: hazard classification, spacing, pipe sizing, water supply."),
      pair("25", "Inspecting and maintaining sprinklers", "Keeping water-based systems working after installation: inspections, tests, maintenance, and impairments."),
      pair("72", "Fire alarm and signaling", "Detectors, notification appliances, panels, and monitoring, from design through testing."),
      pair("101", "Life Safety Code", "Getting people out alive: exits, egress paths, exit signs, emergency lighting, occupancy rules."),
    ],
  },
  {
    name: "Systems and equipment",
    pairs: [
      pair("14", "Standpipes and hose systems", "The pipes and hose connections firefighters use inside tall or large buildings."),
      pair("20", "Installing fire pumps", "Pumps that boost water pressure when the city supply can't deliver enough."),
      pair("70", "National Electrical Code", "Wiring rules for everything electrical, including fire alarm circuits."),
      pair("80", "Fire doors", "Fire doors and shutters have to close and latch on their own, and get inspected every year."),
      pair("96", "Commercial kitchen exhaust", "Hoods, grease ducts, and exhaust fans: construction, clearances, and cleaning schedules."),
      pair("110", "Emergency generators", "Standby power: weekly inspections and monthly run tests under load."),
    ],
  },
  {
    name: "Special cases",
    pairs: [
      pair("13D", "Sprinklers in houses", "One- and two-family homes. The goal is time for people to escape."),
      pair("13R", "Sprinklers in low-rise apartments", "Residential buildings like apartments and dorms, up to four stories."),
      pair("17A", "Wet chemical systems", "Like the hood suppression system over a restaurant's fryers."),
      pair("2001", "Clean agent systems", "Gas that puts out fire and leaves no residue. Common in server rooms."),
      pair("30", "Flammable liquids", "Storing and handling fuels, solvents, and other flammable or combustible liquids."),
      pair("241", "Construction sites", "Fire safety during construction, renovation, and demolition, when buildings are most vulnerable."),
    ],
  },
];

export function NfpaNumbers(props: LevelProps) {
  return <MatchLevel {...props} title="NFPA by the Numbers" prompt="Match each standard to what it covers" rounds={MATCH_ROUNDS} />;
}

/* ---------- Level 2: Which standard applies? ---------- */

const std = (
  prompt: string,
  options: string[],
  answer: number,
  explain: string,
): QuizQuestion => ({
  prompt: "Which NFPA standard covers this?",
  sub: prompt,
  visual: () => (
    <div className="p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-orange-700">Inspector&apos;s note</div>
      <p className="mt-2 text-xl font-extrabold text-gray-900 leading-snug">&ldquo;{prompt}&rdquo;</p>
    </div>
  ),
  options,
  answer,
  right: options[answer],
  wrong: `That's ${options[answer]}`,
  explain,
  ref: options[answer],
});

const STANDARD_QUESTIONS: QuizQuestion[] = [
  std("The restaurant's hood and duct are caked with grease.", ["NFPA 13", "NFPA 96", "NFPA 72", "NFPA 80"], 1, "NFPA 96 covers commercial kitchen exhaust: hoods, grease ducts, fans, and how often they're cleaned."),
  std("The stairwell fire door is propped open with a wedge.", ["NFPA 80", "NFPA 96", "NFPA 20", "NFPA 14"], 0, "NFPA 80 covers fire doors: they must close and latch on their own. NFPA 101 backs it up for doors in the exit path."),
  std("The sprinkler system's annual inspection is overdue.", ["NFPA 13", "NFPA 72", "NFPA 25", "NFPA 10"], 2, "NFPA 13 is for installing sprinklers. NFPA 25 is for inspecting, testing, and maintaining them afterward."),
  std("An engineer is designing sprinklers for a new office building.", ["NFPA 25", "NFPA 13", "NFPA 13D", "NFPA 101"], 1, "NFPA 13 is the design and installation standard for commercial sprinkler systems. 13D is for houses."),
  std("The fire alarm panel is showing a trouble signal.", ["NFPA 70", "NFPA 101", "NFPA 72", "NFPA 25"], 2, "NFPA 72 covers fire alarm systems, including what trouble, supervisory, and alarm signals mean and how they're handled."),
  std("The emergency generator hasn't been run in months.", ["NFPA 110", "NFPA 70", "NFPA 20", "NFPA 1"], 0, "NFPA 110 calls for weekly generator inspections and a monthly run under load for at least 30 minutes."),
  std("The extinguisher tag shows its last annual service 14 months ago.", ["NFPA 13", "NFPA 10", "NFPA 17A", "NFPA 101"], 1, "NFPA 10 covers portable extinguishers: monthly inspections and annual maintenance."),
  std("The exit sign over the back door is dark.", ["NFPA 72", "NFPA 80", "NFPA 101", "NFPA 70"], 2, "The Life Safety Code (NFPA 101) requires exit signs to stay lit, including on battery backup in a power failure."),
  std("Firefighters need hose connections in the stairwells of a high-rise.", ["NFPA 14", "NFPA 13R", "NFPA 24", "NFPA 96"], 0, "NFPA 14 covers standpipe and hose systems, the built-in pipes firefighters connect to on each floor."),
  std("Gas cans and solvents are stored in a hallway closet.", ["NFPA 96", "NFPA 30", "NFPA 10", "NFPA 72"], 1, "NFPA 30 covers storing and handling flammable and combustible liquids: how much, in what containers, and where."),
  std("The fire pump wouldn't start during its weekly test.", ["NFPA 72", "NFPA 101", "NFPA 25", "NFPA 96"], 2, "NFPA 20 covers installing fire pumps. Testing and maintaining them, including weekly or monthly runs, is NFPA 25."),
  std("A builder wants sprinklers in a new single-family home.", ["NFPA 13", "NFPA 13R", "NFPA 13D", "NFPA 14"], 2, "NFPA 13D is the sprinkler standard for one- and two-family homes and manufactured homes."),
];

export function NfpaWhichStandard(props: LevelProps) {
  return <QuizLevel {...props} title="Which Standard Applies?" questions={STANDARD_QUESTIONS} columns={2} />;
}

/* ---------- Level 3: The ITM calendar ---------- */

const FREQUENCIES = ["Weekly", "Monthly", "Quarterly", "Every 6 months", "Annually", "Every 5 years"];

const itm = (task: string, answer: number, explain: string, ref: string): QuizQuestion => ({
  prompt: "How often?",
  sub: task,
  visual: () => (
    <div className="p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-orange-700">{ref}</div>
      <p className="mt-2 text-xl font-extrabold text-gray-900 leading-snug">{task}</p>
    </div>
  ),
  answer,
  right: FREQUENCIES[answer],
  wrong: `It's ${FREQUENCIES[answer].toLowerCase()}`,
  explain,
  ref,
});

const ITM_QUESTIONS: QuizQuestion[] = [
  itm("Quick visual check of every portable extinguisher", 1, "About every 30 days someone confirms each extinguisher is in place, visible, charged, pinned, and undamaged.", "NFPA 10"),
  itm("Run the diesel fire pump (no-flow \"churn\" test)", 0, "Diesel pumps run weekly. Most electric pumps run monthly, though some, like pumps for buildings taller than the fire department can pump to, still run weekly.", "NFPA 25"),
  itm("Inspect the fire department connection (FDC)", 2, "Quarterly: visible and accessible, caps in place, couplings and gaskets in good shape, no debris inside, signs present.", "NFPA 25"),
  itm("Test the sprinkler waterflow alarm switches", 3, "Vane-type and pressure-type waterflow switches get tested every 6 months, so you know a flowing sprinkler will set off the alarm.", "NFPA 25 & NFPA 72"),
  itm("Main drain test on the sprinkler riser", 4, "Once a year the main drain is opened wide and the pressure drop is compared with past results. A big change can mean a closed valve or a blocked supply.", "NFPA 25"),
  itm("Look over every sprinkler head from the floor", 4, "Every year: no paint, corrosion, damage, loading, or missing heads, and nothing stored too close.", "NFPA 25"),
  itm("Functional test of smoke detectors", 4, "Each detector is tested every year. Sensitivity testing is separate: within a year of installation, then every other year.", "NFPA 72"),
  itm("Service the kitchen hood suppression system", 3, "A licensed company services the system every 6 months.", "NFPA 96 & NFPA 17A"),
  itm("90-minute test of emergency lights", 4, "Once a year the lights run on battery for 90 minutes. There's also a 30-second test every month.", "NFPA 101"),
  itm("Internal inspection of sprinkler piping for obstructions", 5, "Every 5 years someone opens the system and looks inside the pipes for scale, debris, or other buildup that could block water.", "NFPA 25"),
  itm("Run the emergency generator under load for 30 minutes", 1, "Generators get inspected weekly and exercised under load for at least 30 minutes each month.", "NFPA 110"),
  itm("Test or replace the sprinkler system's gauges", 5, "Every 5 years gauges get replaced or checked against a calibrated gauge.", "NFPA 25"),
  itm("Inspect and test fire doors", 4, "Every fire door assembly gets inspected and tested once a year: closes, latches, no holes, no blocked closer.", "NFPA 80"),
  itm("Flow test the building's standpipes", 5, "Every 5 years water flows from the most remote hose connection to prove the system delivers.", "NFPA 25"),
  itm("Clean the hood over a 24-hour diner's charbroiler", 2, "High-volume cooking (charbroiling, woks, 24-hour kitchens) gets the hood and duct cleaned quarterly. Moderate-volume kitchens: every 6 months.", "NFPA 96"),
  itm("Hydrostatic pressure test of a CO2 extinguisher", 5, "CO2 and water extinguishers get a hydrostatic test every 5 years. Stored-pressure dry chemical: every 12.", "NFPA 10"),
];

export function NfpaItm(props: LevelProps) {
  return <QuizLevel {...props} title="The ITM Calendar" questions={ITM_QUESTIONS} options={FREQUENCIES} columns={3} />;
}

/* ---------- Level 4: Hazard classification (NFPA 13) ---------- */

const HAZARDS = ["Light hazard", "Ordinary hazard 1", "Ordinary hazard 2", "Extra hazard 1", "Extra hazard 2"];

const DESIGN =
  " Light hazard is designed around 0.10 gallons per minute per square foot over 1,500 sq ft; Ordinary 1 is 0.15, Ordinary 2 is 0.20, Extra 1 is 0.30 and Extra 2 is 0.40, both over 2,500 sq ft.";

const hazard = (icon: React.ElementType, name: string, answer: number, explain: string): QuizQuestion => ({
  prompt: "What's the hazard classification?",
  visual: () => <SubjectCard icon={icon} name={name} />,
  answer,
  right: HAZARDS[answer],
  wrong: `It's ${HAZARDS[answer].toLowerCase()}`,
  explain,
  ref: "NFPA 13",
});

const HAZARD_QUESTIONS: QuizQuestion[] = [
  hazard(Briefcase, "Office floor", 0, "Offices have little fuel and it burns slowly: light hazard. That's why office sprinklers can be up to 15 feet apart." + DESIGN),
  hazard(UtensilsCrossed, "Restaurant dining room", 0, "The seating area of a restaurant is light hazard."),
  hazard(ChefHat, "Restaurant kitchen", 1, "The kitchen (service area) steps up to ordinary hazard group 1. More fuel, more heat, more water."),
  hazard(Car, "Parking garage", 1, "Parking garages are ordinary hazard group 1."),
  hazard(ShoppingBag, "Retail store sales floor", 2, "Mercantile floors are ordinary hazard group 2. Merchandise stacked over 12 feet is treated as storage under NFPA 13's storage chapters instead."),
  hazard(Cog, "Machine shop", 2, "Machine and metalworking shops are ordinary hazard group 2."),
  hazard(Theater, "Theater stage", 2, "The stage is ordinary hazard group 2, even though the seating area is light hazard. Scenery and curtains add a lot of fuel."),
  hazard(TreePine, "Sawmill", 3, "Sawmills are extra hazard group 1: lots of dust and lint that let fire spread fast." + DESIGN),
  hazard(Factory, "Plastics manufacturing plant", 4, "Plastics manufacturing is extra hazard group 2: large amounts of fuel that burn hot and fast."),
  hazard(SprayCan, "Booth spraying flammable paint", 4, "Spraying flammable liquids is extra hazard group 2, the top of the scale."),
];

export function NfpaHazards(props: LevelProps) {
  return <QuizLevel {...props} title="Hazard Classification" questions={HAZARD_QUESTIONS} options={HAZARDS} />;
}

/* ---------- Level 5: Dial in the code (numbers) ---------- */

const NUMBER_QUESTIONS: NumberQuestion[] = [
  {
    prompt: "Max distance between sprinklers in an office",
    sub: "Standard spray heads, light hazard.",
    unit: "ft",
    min: 5,
    max: 30,
    step: 1,
    answer: 15,
    tolerance: 2,
    explain: "Up to 15 feet apart in light and ordinary hazard, closer for extra hazard. Sprinklers also can't be closer than 6 feet, or one can cool its neighbor before it opens.",
    ref: "NFPA 13",
  },
  {
    prompt: "Minimum clearance between storage and sprinkler deflectors",
    unit: "in",
    min: 0,
    max: 48,
    step: 1,
    answer: 18,
    tolerance: 3,
    explain: "18 inches lets the spray pattern develop. Some warehouse (ESFR) sprinklers need 36.",
    ref: "NFPA 13 & NFPA 25",
  },
  {
    prompt: "Highest a pull station's handle can be mounted",
    unit: "in",
    min: 30,
    max: 72,
    step: 1,
    answer: 48,
    tolerance: 3,
    explain: "Between 42 and 48 inches off the floor, within 5 feet of the exit door, so anyone can reach it on the way out.",
    ref: "NFPA 72",
  },
  {
    prompt: "Longest walk to the nearest pull station",
    unit: "ft",
    min: 50,
    max: 400,
    step: 10,
    answer: 200,
    tolerance: 30,
    explain: "No one should have to walk more than 200 feet to sound the alarm. Extra pull stations get added on big floors.",
    ref: "NFPA 72",
  },
  {
    prompt: "Lowest a wall-mounted strobe can be",
    unit: "in",
    min: 48,
    max: 120,
    step: 1,
    answer: 80,
    tolerance: 6,
    explain: "Wall strobes go between 80 and 96 inches above the floor, so furniture and people don't block them.",
    ref: "NFPA 72",
  },
  {
    prompt: "Minimum distance from a smoke detector to an air supply vent",
    unit: "in",
    min: 0,
    max: 72,
    step: 1,
    answer: 36,
    tolerance: 6,
    explain: "Three feet. Air blowing out of a vent pushes smoke away from the detector.",
    ref: "NFPA 72",
  },
  {
    prompt: "Longest walk to a Class A extinguisher",
    unit: "ft",
    min: 25,
    max: 200,
    step: 5,
    answer: 75,
    tolerance: 10,
    explain: "75 feet for ordinary combustibles. Near commercial fryers (Class K), it's 30 feet.",
    ref: "NFPA 10",
  },
  {
    prompt: "How long emergency lights must run on battery",
    unit: "min",
    min: 15,
    max: 180,
    step: 5,
    answer: 90,
    tolerance: 15,
    explain: "90 minutes, proven by an annual full-duration test, with a 30-second test every month.",
    ref: "NFPA 101",
  },
  {
    prompt: "Hours a fire alarm panel's batteries must hold standby",
    sub: "Before it still has to sound the alarm.",
    unit: "hr",
    min: 4,
    max: 72,
    step: 1,
    answer: 24,
    tolerance: 4,
    explain: "Typically 24 hours of standby followed by 5 minutes of full alarm (15 minutes for voice evacuation systems).",
    ref: "NFPA 72",
  },
  {
    prompt: "Fire alarm out of service longer than this triggers a fire watch",
    sub: "Hours in a 24-hour period.",
    unit: "hr",
    min: 1,
    max: 24,
    step: 1,
    answer: 4,
    tolerance: 1,
    explain: "More than 4 hours in 24: notify the fire marshal (AHJ), then evacuate or post an approved fire watch until it's restored. Sprinkler systems get 10 hours.",
    ref: "NFPA 101",
  },
  {
    prompt: "Minimum width of a fire department access road",
    unit: "ft",
    min: 10,
    max: 40,
    step: 1,
    answer: 20,
    tolerance: 2,
    explain: "20 feet of unobstructed width, with 13 feet 6 inches of vertical clearance so engines and ladder trucks fit.",
    ref: "NFPA 1",
  },
  {
    prompt: "Spare sprinkler heads to keep on hand",
    sub: "For a system with fewer than 300 sprinklers.",
    unit: "heads",
    min: 0,
    max: 24,
    step: 1,
    answer: 6,
    tolerance: 1,
    explain: "At least 6, plus the special wrench, in a spare-head cabinet. 300 to 1,000 sprinklers: 12. Over 1,000: 24.",
    ref: "NFPA 13 & NFPA 25",
  },
];

export function NfpaNumbersDial(props: LevelProps) {
  return <NumberLevel {...props} title="Dial In the Code" questions={NUMBER_QUESTIONS} />;
}

/* ---------- Level 6: Impairments and fire watch ---------- */

const IMPAIRMENT_QUESTIONS: QuizQuestion[] = [
  {
    prompt: "Before a planned sprinkler shutdown, who has to be told?",
    options: [
      "Nobody, if it's back on by tonight",
      "The fire department, alarm monitoring company, insurance carrier, and people in the affected area",
      "Only the building owner",
    ],
    answer: 1,
    right: "Everyone who'd respond or be at risk",
    wrong: "Tell everyone who'd respond or be at risk",
    explain: "A planned impairment gets coordinated ahead of time: notify the fire department, the monitoring company, the insurer, and supervisors in the affected areas, and decide what extra precautions are needed.",
    ref: "NFPA 25, Chapter 15",
  },
  {
    prompt: "What goes on the valve when the system is shut down?",
    options: ["A padlock and nothing else", "An impairment tag", "Duct tape over the valve wheel"],
    answer: 1,
    right: "An impairment tag",
    wrong: "An impairment tag",
    explain: "A tag hangs on the closed valve (and often the panel) so anyone, including firefighters, can see at a glance that the system is out of service.",
    ref: "NFPA 25",
  },
  {
    prompt: "Who's in charge of managing an impairment?",
    options: [
      "The impairment coordinator: the owner or their designated representative",
      "Whichever firefighter shows up first",
      "The sprinkler manufacturer",
    ],
    answer: 0,
    right: "The impairment coordinator",
    wrong: "It's the impairment coordinator",
    explain: "The building owner assigns an impairment coordinator to run the process: notifications, tags, precautions, and restoration.",
    ref: "NFPA 25",
  },
  {
    prompt: "The fire alarm will be down 6 hours. What's required?",
    options: [
      "Nothing, since it's less than a workday",
      "Notify the fire marshal (AHJ), then evacuate or post a fire watch",
      "Turn the horns off so they don't false-alarm",
    ],
    answer: 1,
    right: "Notify, then fire watch or evacuate",
    wrong: "Over 4 hours means a fire watch",
    explain: "A required fire alarm out of service more than 4 hours in a 24-hour period means notifying the AHJ and either evacuating or providing an approved fire watch.",
    ref: "NFPA 101",
  },
  {
    prompt: "The sprinklers will be down 6 hours for a repair. Is a fire watch required?",
    options: [
      "Not by the 10-hour rule, but still notify, tag it, and take precautions",
      "Yes, any sprinkler shutdown needs a fire watch",
      "No, and no one needs to be notified",
    ],
    answer: 0,
    right: "Not by the 10-hour rule",
    wrong: "The sprinkler threshold is 10 hours",
    explain: "Sprinkler systems out more than 10 hours in 24 need a fire watch or evacuation. Shorter impairments still need notification and tagging, and your local fire marshal may set a stricter rule.",
    ref: "NFPA 101 & NFPA 25",
  },
  {
    prompt: "What does a fire watch actually do?",
    options: [
      "Trained people patrol the unprotected area, watch for fire, and can sound the alarm and call 911",
      "A camera records the area for later review",
      "A sign is posted saying the system is down",
    ],
    answer: 0,
    right: "Trained people on patrol",
    wrong: "It's trained people on patrol",
    explain: "A fire watch stands in for the out-of-service system: dedicated, trained people walking the area, with a way to warn occupants and call the fire department. Many jurisdictions require a written log.",
    ref: "NFPA 101 & NFPA 1",
  },
  {
    prompt: "Repairs are done and the valve is reopened. How do you prove the water is back?",
    options: ["Look at the pipes", "Run a main drain test", "Wait for the next fire"],
    answer: 1,
    right: "Main drain test",
    wrong: "Run a main drain test",
    explain: "A main drain test after reopening a control valve confirms it's fully open and the supply is good. Then remove the tags and notify everyone you told at the start.",
    ref: "NFPA 25",
  },
  {
    prompt: "A pipe bursts at 2 a.m. and someone shuts the riser valve. What kind of impairment is this?",
    options: ["Planned", "Emergency", "Not an impairment, since it was on purpose"],
    answer: 1,
    right: "Emergency impairment",
    wrong: "It's an emergency impairment",
    explain: "Unplanned outages are emergency impairments. The same steps apply as fast as possible: notifications, tags, precautions like a fire watch, and getting it repaired and back in service.",
    ref: "NFPA 25",
  },
];

export function NfpaImpairments(props: LevelProps) {
  return <QuizLevel {...props} title="Impairments & Fire Watch" questions={IMPAIRMENT_QUESTIONS} shuffleQuestions={false} />;
}

/* ---------- Level 7: Life safety walkthrough (NFPA 101 / 80) ---------- */

const EGRESS_VIOLATIONS: Violation[] = [
  {
    id: "wedge",
    title: "Stairwell fire door wedged open",
    body: "Fire doors have to close and latch on their own to keep fire and smoke out of the stairwell. Never wedge or tie them open. Hold-opens are only allowed if they release automatically when the alarm sounds.",
    code: "NFPA 80 & NFPA 101",
    hit: { kind: "rect", x: 8, y: 196, w: 92, h: 160 },
    mark: { x: 54, y: 296 },
  },
  {
    id: "emergency-light",
    title: "Emergency light not working",
    body: "If the power fails, these light the way out. One lamp is broken and the battery light is red. They get a 30-second test every month and a 90-minute test every year.",
    code: "NFPA 101",
    hit: { kind: "rect", x: 106, y: 94, w: 60, h: 40 },
    mark: { x: 136, y: 112 },
  },
  {
    id: "storage",
    title: "Storage in the exit corridor",
    body: "Corridors leading to exits have to stay clear for their full required width. Parked carts and stacked chairs become obstacles in the dark and smoke.",
    code: "NFPA 101",
    hit: { kind: "rect", x: 176, y: 262, w: 80, h: 94 },
    mark: { x: 214, y: 310 },
  },
  {
    id: "chain",
    title: "Exit door chained shut",
    body: "Exits have to open from the inside without a key, tool, or special knowledge. Locked and chained exits have cost lives in fires.",
    code: "NFPA 101",
    hit: { kind: "rect", x: 264, y: 218, w: 92, h: 138 },
    mark: { x: 306, y: 290 },
  },
  {
    id: "dark-sign",
    title: "Exit sign out",
    body: "Exit signs have to stay lit at all times, on battery backup when the power fails. This one is dark.",
    code: "NFPA 101",
    hit: { kind: "rect", x: 272, y: 184, w: 70, h: 30 },
    mark: { x: 306, y: 198 },
  },
];

const EGRESS_DECOYS: Decoy[] = [
  { id: "lit-sign", note: "That exit sign is lit. It passes.", hit: { kind: "rect", x: 24, y: 166, w: 60, h: 26 } },
  {
    id: "mag",
    note: "That office door is held open by a magnet tied to the fire alarm. It releases when the alarm sounds, which is allowed.",
    hit: { kind: "rect", x: 104, y: 196, w: 66, h: 160 },
  },
  { id: "pull", note: "The pull station is by the exit at the right height. It passes.", hit: { kind: "rect", x: 244, y: 232, w: 22, h: 40 } },
  { id: "detector", note: "Smoke detector is clean and uncovered. It passes.", hit: { kind: "circle", cx: 200, cy: 30, r: 22 } },
  { id: "strobe", note: "Horn/strobe is visible and unblocked. It passes.", hit: { kind: "rect", x: 210, y: 92, w: 34, h: 44 } },
];

function CorridorScene() {
  return (
    <g>
      <rect x={0} y={0} width={360} height={30} fill="#e7e2d6" />
      {[60, 120, 180, 240, 300].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={30} stroke="#d1cab8" strokeWidth={1} />
      ))}
      <rect x={0} y={30} width={360} height={322} fill="#ede4cf" />
      <rect x={0} y={330} width={360} height={22} fill="#d6ccb4" />
      <rect x={0} y={352} width={360} height={68} fill="#b8b2a3" />
      <line x1={0} y1={352} x2={360} y2={352} stroke="#8f887a" strokeWidth={2} />
      {/* Egress arrow on the floor */}
      <path d="M20,392 H330" stroke="#16a34a" strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
      <path d="M322,384 L336,392 L322,400" fill="none" stroke="#16a34a" strokeWidth={3} opacity={0.6} />

      <SmokeDetector x={200} y={30} s={1.3} />
      <HornStrobe x={227} y={114} s={1.05} />

      {/* Stairwell fire door, wedged open */}
      <rect x={20} y={168} width={58} height={20} rx={2} fill="#fff" stroke="#9ca3af" />
      <text x={49} y={182} textAnchor="middle" fontSize={11} fontWeight={900} fill="#dc2626" letterSpacing={1}>
        EXIT
      </text>
      <rect x={16} y={200} width={66} height={152} fill="#3f3f46" />
      <path d="M24,352 L24,240 M24,300 L70,300 M40,280 L70,280 M56,260 L70,260" stroke="#71717a" strokeWidth={2} />
      <text x={49} y={224} textAnchor="middle" fontSize={8} fontWeight={800} fill="#d4d4d8">
        STAIR 1
      </text>
      <path d="M82,200 L98,206 L98,346 L82,352 Z" fill="#94a3b8" stroke="#475569" strokeWidth={1.5} />
      <line x1={70} y1={204} x2={90} y2={206} stroke="#475569" strokeWidth={3} />
      <path d="M86,352 L100,352 L100,344 Z" fill="#a16207" stroke="#713f12" strokeWidth={1} />

      {/* Broken emergency light */}
      <rect x={116} y={104} width={40} height={16} rx={3} fill="#f8fafc" stroke="#94a3b8" />
      <circle cx={146} cy={112} r={2} fill="#ef4444" />
      <g transform="rotate(30 112 112)">
        <rect x={104} y={108} width={12} height={8} rx={3} fill="#e2e8f0" stroke="#64748b" />
      </g>
      <rect x={156} y={106} width={10} height={9} rx={3} fill="#e2e8f0" stroke="#64748b" />
      <path d="M110,124 l3,6 l-4,2" stroke="#94a3b8" strokeWidth={1} fill="none" />

      {/* Office door held by a magnetic hold-open (allowed) */}
      <rect x={108} y={200} width={58} height={152} fill="#f5f5f4" stroke="#a8a29e" strokeWidth={1.5} />
      <path d="M108,200 L92,208 L92,344 L108,352 Z" fill="#c4a574" stroke="#8a6d3b" strokeWidth={1.5} />
      <rect x={92} y={286} width={8} height={10} rx={1} fill="#6b7280" />
      <text x={137} y={226} textAnchor="middle" fontSize={8} fontWeight={800} fill="#78716c">
        OFFICE
      </text>

      {/* Chairs and a cart parked in the corridor */}
      <rect x={184} y={300} width={46} height={44} rx={3} fill="#94a3b8" stroke="#475569" />
      <circle cx={192} cy={348} r={4} fill="#1f2937" />
      <circle cx={224} cy={348} r={4} fill="#1f2937" />
      <rect x={188} y={286} width={38} height={14} fill="#c8955c" stroke="#8a5a2b" />
      {[0, 10, 20].map((dy) => (
        <path key={dy} d={`M234,${286 - dy} h16 v${16} M236,${300 - dy} v${52 - (20 - dy)}`} stroke="#1d4ed8" strokeWidth={3} fill="none" />
      ))}

      {/* Exit door with a dark sign and a chain */}
      <rect x={274} y={188} width={62} height={22} rx={2} fill="#e5e7eb" stroke="#9ca3af" />
      <text x={305} y={204} textAnchor="middle" fontSize={12} fontWeight={900} fill="#9ca3af" letterSpacing={1.5}>
        EXIT
      </text>
      <rect x={278} y={222} width={56} height={130} fill="#94a3b8" stroke="#475569" strokeWidth={2} />
      <rect x={282} y={280} width={48} height={6} rx={2} fill="#475569" />
      <path d="M280,276 q14,10 26,0 q14,-10 26,0" stroke="#71717a" strokeWidth={2.5} fill="none" strokeDasharray="4 2" />
      <rect x={300} y={278} width={10} height={12} rx={2} fill="#ca8a04" stroke="#713f12" />
      <PullStation x={255} y={252} s={0.95} />
    </g>
  );
}

export function NfpaEgress(props: LevelProps) {
  return (
    <SpotLevel
      {...props}
      title="Life Safety Walkthrough"
      violations={EGRESS_VIOLATIONS}
      decoys={EGRESS_DECOYS}
      scene={<CorridorScene />}
      viewBox={{ w: 360, h: 420 }}
      sceneLabel="Building corridor with a stairwell door, an office door, an emergency light, and an exit door"
      timeLimit={75}
    />
  );
}

/* ---------- Level 8: Commercial kitchen walkthrough (NFPA 96 / 17A / 10) ---------- */

const KITCHEN_VIOLATIONS: Violation[] = [
  {
    id: "service",
    title: "Hood system overdue for service",
    body: "Kitchen hood suppression systems are serviced by a licensed company every 6 months. This tag says the last service was 9 months ago.",
    code: "NFPA 96 & NFPA 17A",
    hit: { kind: "rect", x: 300, y: 128, w: 60, h: 40 },
    mark: { x: 328, y: 146 },
  },
  {
    id: "grease",
    title: "Grease building up in the hood",
    body: "Grease in the hood and duct is fuel waiting for a spark. High-volume kitchens (charbroilers, woks, 24-hour cooking) get cleaned quarterly; moderate-volume kitchens every 6 months.",
    code: "NFPA 96",
    hit: { kind: "rect", x: 66, y: 30, w: 270, h: 92 },
    mark: { x: 150, y: 96 },
  },
  {
    id: "fryer",
    title: "Fryer moved out from under its nozzle",
    body: "Each nozzle is aimed at one appliance's exact spot. Move the fryer and the chemical lands on the floor while the oil keeps burning. Appliances have to stay where the system was designed for them.",
    code: "NFPA 17A & NFPA 96",
    hit: { kind: "rect", x: 168, y: 226, w: 160, h: 130 },
    mark: { x: 280, y: 290 },
  },
  {
    id: "pull",
    title: "Hood system pull station blocked",
    body: "The manual pull for the hood system has to be easy to reach in the path of egress, 10 to 20 feet from the hood, so you can trip it on your way out.",
    code: "NFPA 96",
    hit: { kind: "rect", x: 6, y: 150, w: 72, h: 206 },
    mark: { x: 40, y: 230 },
  },
  {
    id: "wrong-ext",
    title: "Wrong extinguisher by the fryers",
    body: "Commercial fryers need a Class K wet chemical extinguisher within 30 feet. It cools the oil and seals the surface. An ABC can knock the flames down, but the hot oil can flare right back up.",
    code: "NFPA 10 & NFPA 96",
    hit: { kind: "rect", x: 328, y: 196, w: 32, h: 104 },
    mark: { x: 342, y: 250 },
  },
];

const KITCHEN_DECOYS: Decoy[] = [
  { id: "range", note: "The range sits right under its nozzle, just as the system was designed.", hit: { kind: "rect", x: 84, y: 226, w: 80, h: 130 } },
  {
    id: "gas",
    note: "The gas shutoff is in place. When the hood system trips, it automatically cuts fuel to the appliances under it.",
    hit: { kind: "circle", cx: 124, cy: 196, r: 16 },
  },
];

function KitchenScene() {
  return (
    <g>
      {/* Tile wall and floor */}
      <rect x={0} y={0} width={360} height={352} fill="#f1f5f9" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 30} x2={360} y2={i * 30} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`v${i}`} x1={i * 30} y1={0} x2={i * 30} y2={352} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <rect x={0} y={352} width={360} height={68} fill="#9a3412" opacity={0.75} />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((x) => (
        <line key={x} x1={x} y1={352} x2={x} y2={420} stroke="#7c2d12" strokeWidth={1} opacity={0.6} />
      ))}

      {/* Duct, hood, filters, grease */}
      <rect x={180} y={0} width={44} height={40} fill="#cbd5e1" stroke="#94a3b8" />
      <path d="M70,40 L330,40 L316,118 L84,118 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
      <rect x={96} y={96} width={208} height={20} fill="#64748b" />
      {[110, 140, 170, 200, 230, 260, 290].map((x) => (
        <line key={x} x1={x} y1={96} x2={x} y2={116} stroke="#475569" strokeWidth={2} />
      ))}
      <g fill="#a16207" opacity={0.85}>
        <path d="M100,116 q4,10 8,0 Z" />
        <path d="M150,116 q5,14 10,0 Z" />
        <path d="M214,116 q4,9 8,0 Z" />
        <path d="M262,116 q5,12 10,0 Z" />
        <ellipse cx={170} cy={80} rx={34} ry={7} opacity={0.5} />
        <ellipse cx={250} cy={66} rx={26} ry={6} opacity={0.5} />
      </g>

      {/* Suppression nozzles and their aim points */}
      {[124, 204].map((x) => (
        <g key={x}>
          <line x1={x} y1={118} x2={x} y2={128} stroke="#334155" strokeWidth={3} />
          <path d={`M${x - 4},128 L${x + 4},128 L${x + 2},136 L${x - 2},136 Z`} fill="#111827" />
          <line x1={x} y1={138} x2={x} y2={230} stroke="#60a5fa" strokeWidth={1.2} strokeDasharray="3 4" opacity={0.7} />
        </g>
      ))}

      {/* Hood system cylinder and its service tag */}
      <rect x={334} y={46} width={18} height={70} rx={6} fill="#dc2626" stroke="#7f1d1d" />
      <line x1={330} y1={128} x2={343} y2={116} stroke="#6b7280" strokeWidth={1} />
      <g transform="rotate(4 330 146)">
        <rect x={304} y={128} width={54} height={34} rx={3} fill="#fef3c7" stroke="#d97706" />
        <text x={331} y={140} textAnchor="middle" fontSize={6.5} fontWeight={800} fill="#78350f">
          LAST SERVICE
        </text>
        <text x={331} y={154} textAnchor="middle" fontSize={9} fontWeight={900} fill="#b91c1c">
          9 MO. AGO
        </text>
      </g>

      {/* Gas line with shutoff (fine) */}
      <path d="M100,196 H300" stroke="#ca8a04" strokeWidth={4} />
      <rect x={116} y={188} width={16} height={8} rx={2} fill="#facc15" stroke="#a16207" />

      {/* Range, right under its nozzle (fine) */}
      <rect x={88} y={232} width={72} height={120} rx={3} fill="#9ca3af" stroke="#4b5563" strokeWidth={1.5} />
      <rect x={88} y={232} width={72} height={10} fill="#4b5563" />
      {[104, 144].map((cx) => (
        <ellipse key={cx} cx={cx} cy={237} rx={10} ry={3} fill="#1f2937" />
      ))}
      <rect x={96} y={262} width={56} height={60} rx={2} fill="#6b7280" />

      {/* Where the fryer belongs, and where it ended up */}
      <rect x={172} y={340} width={64} height={12} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x={252} y={244} width={70} height={108} rx={3} fill="#a1a1aa" stroke="#52525b" strokeWidth={1.5} />
      <rect x={256} y={236} width={62} height={14} rx={2} fill="#ca8a04" opacity={0.85} />
      <rect x={262} y={226} width={6} height={12} fill="#52525b" />
      <rect x={306} y={226} width={6} height={12} fill="#52525b" />
      <text x={287} y={300} textAnchor="middle" fontSize={8} fontWeight={800} fill="#3f3f46">
        FRYER
      </text>

      {/* Hood system pull station behind stacked crates */}
      <rect x={28} y={160} width={24} height={30} rx={3} fill="#dc2626" stroke="#7f1d1d" />
      <text x={40} y={172} textAnchor="middle" fontSize={4.5} fontWeight={900} fill="#fff">
        KITCHEN
      </text>
      <text x={40} y={178} textAnchor="middle" fontSize={4.5} fontWeight={900} fill="#fff">
        FIRE
      </text>
      {[184, 240, 296].map((y) => (
        <g key={y}>
          <rect x={12} y={y} width={60} height={56} rx={2} fill="#2563eb" stroke="#1e3a8a" />
          {[0, 1, 2].map((r) => (
            <line key={r} x1={16} y1={y + 12 + r * 14} x2={68} y2={y + 12 + r * 14} stroke="#1e3a8a" strokeWidth={2} />
          ))}
        </g>
      ))}

      {/* ABC extinguisher where a Class K belongs */}
      <Extinguisher x={344} y={292} s={0.42} label="ABC" tag={false} />
    </g>
  );
}

export function NfpaKitchen(props: LevelProps) {
  return (
    <SpotLevel
      {...props}
      title="Kitchen Walkthrough"
      violations={KITCHEN_VIOLATIONS}
      decoys={KITCHEN_DECOYS}
      scene={<KitchenScene />}
      viewBox={{ w: 360, h: 420 }}
      sceneLabel="Commercial kitchen with an exhaust hood, a range, a fryer, a pull station, and an extinguisher"
      timeLimit={75}
    />
  );
}

/* ---------- Question banks for the final exam ---------- */

export const NFPA_EXAM_BANK: QuizQuestion[] = [
  ...STANDARD_QUESTIONS,
  ...ITM_QUESTIONS.map((q) => ({ ...q, options: FREQUENCIES })),
  ...HAZARD_QUESTIONS.map((q) => ({ ...q, options: HAZARDS })),
  ...IMPAIRMENT_QUESTIONS,
];
