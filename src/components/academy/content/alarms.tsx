"use client";

// Fire Alarms course: what the devices are, what the panel's signals mean,
// which detector goes where, a walkthrough, and common myths.

import { BedDouble, Car, ChefHat, Server, ShowerHead, Warehouse } from "lucide-react";
import { ControlPanel, Diffuser, HeatDetector, HornStrobe, PullStation, SmokeDetector, type PanelState } from "../art-alarm";
import { Extinguisher } from "../art-extinguisher";
import IdentifyLevel, { type IdentifyPart } from "../levels/IdentifyLevel";
import QuizLevel, { type QuizQuestion } from "../levels/QuizLevel";
import SpotLevel, { type Decoy, type Violation } from "../levels/SpotLevel";
import { MythOrFactLevel, type Statement } from "../levels/MythOrFact";
import { type LevelProps, SubjectCard } from "../ui";

/* ---------- Level 1: Parts of a fire alarm system ---------- */

const PARTS: IdentifyPart[] = [
  {
    id: "panel",
    name: "Control panel",
    fact: "The fire alarm control panel is the brain. It watches every device around the clock, sounds the alarm, and signals the monitoring company. If the power goes out it keeps running on backup batteries, typically sized for 24 hours of standby plus 5 minutes of full alarm.",
    hit: <rect x={30} y={108} width={88} height={112} rx={4} />,
    label: { px: 116, py: 140, lx: 126, ly: 150 },
  },
  {
    id: "smoke",
    name: "Smoke detector",
    fact: "Senses smoke particles, usually before there's much heat, so it gives the earliest warning. Unlike a home smoke alarm, it doesn't just beep by itself: it reports to the panel, which sounds the alarm through the whole building.",
    hit: <circle cx={80} cy={32} r={20} />,
    label: { px: 92, py: 38, lx: 100, ly: 60 },
  },
  {
    id: "heat",
    name: "Heat detector",
    fact: "Goes where a smoke detector would false-alarm: kitchens, garages, dusty or steamy rooms. Some trip at a fixed temperature (often 135°F). Rate-of-rise types trip when the temperature climbs fast, about 15°F in a minute.",
    hit: <circle cx={250} cy={34} r={20} />,
    label: { px: 250, py: 46, lx: 350, ly: 64, anchor: "end" },
  },
  {
    id: "pull",
    name: "Pull station",
    fact: "Lets anyone who sees a fire set off the alarm. It's mounted 42 to 48 inches off the floor and within 5 feet of the exit door, so you can pull it on your way out.",
    hit: <rect x={258} y={180} width={30} height={40} rx={4} />,
    label: { px: 262, py: 190, lx: 254, ly: 176, anchor: "end" },
  },
  {
    id: "horn",
    name: "Horn/strobe",
    fact: "The horn sounds the evacuation signal, a three-pulse pattern called temporal-3. The strobe flashes for people who are deaf or hard of hearing, and for anyone in a space too loud to hear the horn.",
    hit: <rect x={134} y={74} width={32} height={46} rx={4} />,
    label: { px: 164, py: 100, lx: 180, ly: 106 },
  },
];

function LobbyArt() {
  return (
    <g>
      <rect x={0} y={0} width={360} height={26} fill="#e7e2d6" />
      {[60, 120, 180, 240, 300].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={26} stroke="#d1cab8" strokeWidth={1} />
      ))}
      <rect x={0} y={26} width={360} height={236} fill="#f3ead6" />
      <rect x={0} y={262} width={360} height={38} fill="#cbbf9f" />
      <line x1={0} y1={262} x2={360} y2={262} stroke="#a8977a" strokeWidth={2} />

      {/* Exit door and sign */}
      <rect x={296} y={130} width={50} height={132} fill="#94a3b8" stroke="#475569" strokeWidth={2} />
      <rect x={300} y={192} width={42} height={5} rx={2} fill="#475569" />
      <rect x={298} y={108} width={46} height={16} rx={2} fill="#fff" stroke="#9ca3af" />
      <text x={321} y={120} textAnchor="middle" fontSize={10} fontWeight={900} fill="#dc2626" letterSpacing={1}>
        EXIT
      </text>

      {/* Reception desk */}
      <rect x={134} y={214} width={100} height={48} rx={3} fill="#a07850" />
      <rect x={130} y={208} width={108} height={8} rx={2} fill="#8b6844" />

      <ControlPanel x={34} y={112} />
      <SmokeDetector x={80} y={26} s={1.3} />
      <HeatDetector x={250} y={26} s={1.3} />
      <HornStrobe x={150} y={97} s={1.1} />
      <PullStation x={273} y={200} s={1.05} />
    </g>
  );
}

export function AlarmAnatomy(props: LevelProps) {
  return (
    <IdentifyLevel
      {...props}
      title="Parts of a Fire Alarm"
      parts={PARTS}
      art={<LobbyArt />}
      viewBox={{ w: 360, h: 300 }}
      artLabel="Building lobby with fire alarm devices on the walls and ceiling"
      question={{
        text: "What's the difference between a smoke ALARM and a smoke DETECTOR?",
        sub: "You'll hear both terms. They aren't the same thing.",
        options: [
          "No difference. They're two names for the same device",
          "A smoke alarm sounds on its own, like at home. A smoke detector reports to a fire alarm panel",
          "Smoke detectors sense heat and smoke alarms sense smoke",
        ],
        answer: 1,
        right: "Exactly",
        wrong: "They work differently",
        fact: "A home smoke alarm has the sensor, horn, and battery in one unit, and it only warns that room. A commercial smoke detector is just the sensor. It reports to the panel, which sounds every horn and strobe in the building and calls for help.",
      }}
    />
  );
}

/* ---------- Level 2: Alarm, supervisory, or trouble? ---------- */

const SIGNALS = [
  <SignalOption key="a" color="#dc2626" name="Alarm" note="Fire. Evacuate." />,
  <SignalOption key="s" color="#ca8a04" name="Supervisory" note="Fire protection is impaired" />,
  <SignalOption key="t" color="#d97706" name="Trouble" note="Fault in the alarm system" />,
];
const STATES: PanelState[] = ["alarm", "supervisory", "trouble"];

function SignalOption({ color, name, note }: { color: string; name: string; note: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span>
        <span className="block font-extrabold uppercase tracking-wide">{name}</span>
        <span className="block text-xs font-medium opacity-70">{note}</span>
      </span>
    </span>
  );
}

function PanelVisual({ lcd, lit }: { lcd: [string, string]; lit: PanelState }) {
  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto max-h-[34svh] md:max-h-[50svh]" role="img" aria-label={`Fire alarm panel reading ${lcd.join(" ")}`}>
      <rect x={0} y={0} width={200} height={140} fill="#f3ead6" />
      <g transform="translate(40 14) scale(1.5 1.08)">
        <ControlPanel x={0} y={0} state={lit} lcd={lcd} />
      </g>
    </svg>
  );
}

const signalQ = (
  lcd: [string, string],
  sub: string,
  answer: 0 | 1 | 2,
  explain: string,
): QuizQuestion => ({
  prompt: "Alarm, supervisory, or trouble?",
  sub,
  answer,
  visual: (answered) => <PanelVisual lcd={lcd} lit={answered ? STATES[answer] : "normal"} />,
  right: `Right: ${["alarm", "supervisory", "trouble"][answer]}`,
  wrong: `That's a ${["alarm", "supervisory", "trouble"][answer]} signal`,
  explain,
  ref: "NFPA 72",
});

const SIGNAL_QUESTIONS: QuizQuestion[] = [
  signalQ(
    ["PULL STATION", "LOBBY EAST EXIT"],
    "Someone pulled the pull station by the lobby exit.",
    0,
    "Alarm means fire. The horns and strobes sound, everyone evacuates, and the monitoring company sends the fire department.",
  ),
  signalQ(
    ["WATERFLOW", "SPRINKLER RISER 1"],
    "Water is flowing through the sprinkler riser.",
    0,
    "Flowing water means a sprinkler head opened (or a pipe broke). Either way it's treated as a fire: full alarm.",
  ),
  signalQ(
    ["SMOKE DETECTOR", "2ND FL SERVER RM"],
    "A smoke detector in the server room senses smoke.",
    0,
    "Any detector sensing a fire is an alarm. Evacuate first and ask questions later.",
  ),
  signalQ(
    ["VALVE TAMPER", "RISER 1 CONTROL"],
    "A technician partly closed the sprinkler control valve.",
    1,
    "Supervisory means something that keeps the fire protection system from working is off-normal, like a closed valve. Nobody evacuates, but it needs attention right away.",
  ),
  signalQ(
    ["LOW AIR", "DRY PIPE SYSTEM"],
    "Air pressure is dropping in a dry-pipe sprinkler system.",
    1,
    "A dry-pipe system holds water back with air pressure. Losing that air is a supervisory signal: the sprinklers need attention before they can be trusted.",
  ),
  signalQ(
    ["AC POWER FAILURE", "ON BATTERY"],
    "The building lost power. The panel is running on its batteries.",
    2,
    "Trouble means a fault in the alarm system itself. The panel keeps working on batteries for a while, but call your fire alarm company.",
  ),
  signalQ(
    ["LOW BATTERY", ""],
    "The panel's backup batteries are getting weak.",
    2,
    "Weak batteries are a trouble signal. Panel batteries get tested every year and replaced on schedule, so the system still works when the power goes out.",
  ),
  signalQ(
    ["OPEN CIRCUIT", "DETECTOR LOOP 1"],
    "A wire to a group of detectors was cut during remodeling.",
    2,
    "A cut wire is a trouble signal. Until it's repaired, those detectors may not be able to report a fire.",
  ),
];

export function AlarmSignals(props: LevelProps) {
  return <QuizLevel {...props} title="Alarm, Supervisory, or Trouble?" questions={SIGNAL_QUESTIONS} options={SIGNALS} />;
}

/* ---------- Level 3: Pick the right detector ---------- */

const DETECTORS = ["Smoke detector", "Heat detector", "Beam smoke detector"];

const roomQ = (icon: React.ElementType, name: string, answer: number, explain: string): QuizQuestion => ({
  prompt: "Which detector is the best fit?",
  visual: () => <SubjectCard icon={icon} name={name} />,
  answer,
  right: `Yes: ${DETECTORS[answer].toLowerCase()}`,
  wrong: `Best fit: ${DETECTORS[answer].toLowerCase()}`,
  explain,
  ref: "NFPA 72",
});

const DETECTOR_QUESTIONS: QuizQuestion[] = [
  roomQ(BedDouble, "Hotel corridor outside guest rooms", 0, "Clean air and people sleeping nearby. Smoke detectors give the earliest warning."),
  roomQ(ChefHat, "Restaurant kitchen, near the cook line", 1, "Cooking smoke and steam would set off a smoke detector all day. A heat detector ignores them and still catches a real fire."),
  roomQ(Car, "Enclosed parking garage", 1, "Car exhaust would trigger smoke detectors. Heat detectors are the usual choice."),
  roomQ(Warehouse, "Warehouse with a 40-foot ceiling", 2, "Smoke spreads out and thins before it reaches a ceiling that high. A beam detector shines across the open space and catches smoke anywhere along the beam."),
  roomQ(Server, "Server room", 0, "Electrical fires smolder and make smoke long before much heat. Early warning protects people and the equipment."),
  roomQ(ShowerHead, "Locker room next to the showers", 1, "Steam looks like smoke to a smoke detector. A heat detector avoids the false alarms."),
];

export function AlarmDetectors(props: LevelProps) {
  return <QuizLevel {...props} title="Pick the Right Detector" questions={DETECTOR_QUESTIONS} options={DETECTORS} />;
}

/* ---------- Level 4: Alarm walkthrough ---------- */

const ALARM_VIOLATIONS: Violation[] = [
  {
    id: "covered",
    title: "Smoke detector still bagged",
    body: "Dust covers go on during construction and come off before anyone moves in. With the bag on, the detector can't sense smoke at all.",
    code: "NFPA 72",
    hit: { kind: "circle", cx: 70, cy: 44, r: 26 },
    mark: { x: 70, y: 46 },
  },
  {
    id: "vent",
    title: "Detector next to an air vent",
    body: "Smoke detectors need to be at least 3 feet from air supply vents. Blowing air pushes smoke away from the sensor and delays the alarm.",
    code: "NFPA 72",
    hit: { kind: "rect", x: 150, y: 30, w: 86, h: 40 },
    mark: { x: 212, y: 46 },
  },
  {
    id: "trouble",
    title: "Trouble signal being ignored",
    body: "A trouble signal means part of the system may not work. Silencing the beep and taping a note over it leaves the building unprotected. Call your fire alarm company.",
    code: "NFPA 72",
    hit: { kind: "rect", x: 22, y: 116, w: 100, h: 116 },
    mark: { x: 66, y: 172 },
  },
  {
    id: "strobe",
    title: "Strobe covered by a poster",
    body: "Horns and strobes have to be seen and heard. With a poster over the strobe, someone who can't hear the horn may never get the warning.",
    code: "NFPA 72",
    hit: { kind: "rect", x: 136, y: 90, w: 70, h: 68 },
    mark: { x: 168, y: 124 },
  },
  {
    id: "pull",
    title: "Pull station blocked",
    body: "Pull stations have to stay visible and reachable near the exit. Nobody should have to move a filing cabinet to sound the alarm.",
    code: "NFPA 72",
    hit: { kind: "rect", x: 244, y: 232, w: 50, h: 120 },
    mark: { x: 268, y: 262 },
  },
];

const ALARM_DECOYS: Decoy[] = [
  { id: "smoke-ok", note: "That detector is clean, uncovered, and away from vents. It passes.", hit: { kind: "circle", cx: 318, cy: 44, r: 22 } },
  { id: "strobe-ok", note: "That horn/strobe is visible and unblocked. It passes.", hit: { kind: "rect", x: 222, y: 104, w: 40, h: 50 } },
  { id: "exit", note: "The exit sign is lit. It passes.", hit: { kind: "rect", x: 296, y: 192, w: 50, h: 24 } },
  { id: "ext", note: "The extinguisher is mounted, visible, and in the green. It passes.", hit: { kind: "rect", x: 108, y: 236, w: 40, h: 76 } },
];

function OfficeScene() {
  return (
    <g>
      <rect x={0} y={0} width={360} height={34} fill="#e7e2d6" />
      {[60, 120, 180, 240, 300].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={34} stroke="#d1cab8" strokeWidth={1} />
      ))}
      <rect x={0} y={34} width={360} height={318} fill="#f3ead6" />
      <rect x={0} y={352} width={360} height={68} fill="#c4bcab" />
      <line x1={0} y1={352} x2={360} y2={352} stroke="#9c937f" strokeWidth={2} />

      {/* Bagged detector (violation) */}
      <SmokeDetector x={70} y={34} s={1.4} />
      <path d="M50,36 C46,58 56,70 70,70 C84,70 94,58 90,36 Z" fill="#e0f2fe" opacity={0.55} stroke="#93c5fd" strokeWidth={1} />
      <path d="M62,38 l16,0" stroke="#93c5fd" strokeWidth={2} />

      {/* Detector beside a supply vent (violation) */}
      <Diffuser x={176} y={34} />
      <SmokeDetector x={214} y={34} s={1.4} />

      {/* Good detector (decoy) */}
      <SmokeDetector x={318} y={34} s={1.4} />

      {/* Panel in trouble with a note over it (violation) */}
      <ControlPanel x={26} y={120} state="trouble" lcd={["TROUBLE", "SILENCED"]} />
      <g transform="rotate(-6 92 214)">
        <rect x={66} y={196} width={52} height={34} fill="#fde047" stroke="#ca8a04" strokeWidth={1} />
        <text x={92} y={209} textAnchor="middle" fontSize={7} fontWeight={800} fill="#78350f">
          IGNORE IT
        </text>
        <text x={92} y={220} textAnchor="middle" fontSize={6} fontWeight={700} fill="#78350f">
          keeps beeping
        </text>
      </g>

      {/* Strobe under a poster (violation) and a clear one (decoy) */}
      <HornStrobe x={162} y={134} s={1.2} />
      <g transform="rotate(3 170 120)">
        <rect x={142} y={96} width={58} height={48} fill="#fff" stroke="#d1d5db" />
        <rect x={146} y={100} width={50} height={20} fill="#fb923c" />
        <text x={171} y={131} textAnchor="middle" fontSize={7.5} fontWeight={900} fill="#1f2937">
          TEAM PARTY
        </text>
        <text x={171} y={140} textAnchor="middle" fontSize={6.5} fontWeight={700} fill="#6b7280">
          FRIDAY 3 PM
        </text>
        <rect x={140} y={93} width={10} height={5} fill="#fef3c7" opacity={0.9} />
        <rect x={192} y={93} width={10} height={5} fill="#fef3c7" opacity={0.9} />
      </g>
      <HornStrobe x={242} y={128} s={1.2} />

      {/* Mounted extinguisher (decoy) */}
      <rect x={112} y={232} width={32} height={10} rx={1} fill="#dc2626" />
      <text x={128} y={239.5} textAnchor="middle" fontSize={5} fontWeight={800} fill="#fff">
        FIRE EXT.
      </text>
      <Extinguisher x={128} y={310} s={0.33} />

      {/* Exit door and sign (decoy) */}
      <rect x={296} y={196} width={50} height={18} rx={2} fill="#fff" stroke="#9ca3af" />
      <text x={321} y={209} textAnchor="middle" fontSize={11} fontWeight={900} fill="#dc2626" letterSpacing={1}>
        EXIT
      </text>
      <rect x={296} y={222} width={50} height={130} fill="#94a3b8" stroke="#475569" strokeWidth={2} />
      <rect x={300} y={282} width={42} height={5} rx={2} fill="#475569" />

      {/* Pull station hidden behind a filing cabinet (violation) */}
      <PullStation x={270} y={250} s={1.05} />
      <rect x={246} y={262} width={46} height={90} rx={2} fill="#6b7280" stroke="#374151" strokeWidth={1.5} />
      {[284, 310, 336].map((y) => (
        <g key={y}>
          <line x1={250} y1={y - 6} x2={288} y2={y - 6} stroke="#4b5563" strokeWidth={1} />
          <rect x={262} y={y - 1} width={14} height={4} rx={1} fill="#d1d5db" />
        </g>
      ))}

      {/* Desk and plant for context */}
      <rect x={160} y={300} width={70} height={52} rx={2} fill="#a07850" />
      <rect x={156} y={294} width={78} height={8} rx={2} fill="#8b6844" />
      <rect x={20} y={318} width={22} height={34} rx={3} fill="#a16207" />
      <path d="M31,318 C14,300 18,284 28,292 C26,276 40,276 36,294 C46,282 52,300 31,318 Z" fill="#4d7c0f" />
    </g>
  );
}

export function AlarmInspector(props: LevelProps) {
  return (
    <SpotLevel
      {...props}
      title="Alarm Walkthrough"
      violations={ALARM_VIOLATIONS}
      decoys={ALARM_DECOYS}
      scene={<OfficeScene />}
      viewBox={{ w: 360, h: 420 }}
      sceneLabel="Office with smoke detectors, a fire alarm panel, horn/strobes, and an exit door"
      timeLimit={75}
    />
  );
}

/* ---------- Level 5: Myths ---------- */

export const ALARM_MYTHS: Statement[] = [
  {
    text: "A fire alarm panel stops working when the power goes out.",
    fact: false,
    why: "Panels have backup batteries, typically sized for 24 hours of standby plus 5 minutes of full alarm. A power loss shows up as a trouble signal.",
    ref: "NFPA 72",
  },
  {
    text: "A trouble signal means there's a fire somewhere in the building.",
    fact: false,
    why: "Trouble means a fault in the alarm system itself, like a cut wire or low battery. A fire is an alarm signal.",
    ref: "NFPA 72",
  },
  {
    text: "Commercial fire alarm systems need to be tested at least once a year.",
    fact: true,
    why: "NFPA 72 calls for regular inspection and testing. Most devices get tested annually by a licensed fire alarm company.",
    ref: "NFPA 72",
  },
  {
    text: "It's fine to silence a trouble beep and deal with it whenever.",
    fact: false,
    why: "Part of your system may not work until it's fixed. Silence the buzzer if you need to, then call your alarm company right away.",
    ref: "NFPA 72",
  },
  {
    text: "Strobes are there for people who are deaf or hard of hearing.",
    fact: true,
    why: "Visual signals make sure everyone gets the warning, including in spaces too loud to hear a horn.",
    ref: "NFPA 72",
  },
  {
    text: "Pull stations belong within 5 feet of the exit doors.",
    fact: true,
    why: "That way you can sound the alarm on your way out instead of going deeper into the building.",
    ref: "NFPA 72",
  },
  {
    text: "Heat detectors are better than smoke detectors everywhere.",
    fact: false,
    why: "Heat detectors are slower. They're for places where smoke detectors would false-alarm, like kitchens and garages. Smoke detectors give earlier warning everywhere else.",
    ref: "NFPA 72",
  },
  {
    text: "Mounting a smoke detector right next to an air vent is fine.",
    fact: false,
    why: "Keep detectors at least 3 feet from supply vents. Moving air blows smoke away from the sensor.",
    ref: "NFPA 72",
  },
  {
    text: "Water flowing in a sprinkler system sets off the fire alarm.",
    fact: true,
    why: "A flow switch on the riser senses water moving and tells the panel to go into alarm.",
    ref: "NFPA 72 & NFPA 25",
  },
  {
    text: "A battery smoke alarm from the hardware store covers a building that requires a fire alarm system.",
    fact: false,
    why: "Single-station smoke alarms only warn the room they're in. A required system needs detectors, notification, and monitoring tied to a listed control panel.",
    ref: "NFPA 72",
  },
  {
    text: "Pulling a fire alarm as a prank is a crime in Texas.",
    fact: true,
    why: "Knowingly setting off a false alarm is a criminal offense under Texas law. It also pulls firefighters away from real emergencies.",
    ref: "Texas Penal Code §42.06",
  },
  {
    text: "When a monitored system goes into alarm, the monitoring company sends the fire department.",
    fact: true,
    why: "That's what monitoring is for. The central station gets the signal and dispatches help, even if nobody's in the building.",
    ref: "NFPA 72",
  },
];

export function AlarmMyths(props: LevelProps) {
  return <MythOrFactLevel {...props} title="Alarm Myth or Fact" statements={ALARM_MYTHS} />;
}

/* ---------- Question bank for the final exam ---------- */

export const ALARM_EXAM_BANK: QuizQuestion[] = [
  ...SIGNAL_QUESTIONS.map((q) => ({ ...q, options: SIGNALS, ref: "NFPA 72" })),
  ...DETECTOR_QUESTIONS.map((q) => ({ ...q, options: DETECTORS, ref: "NFPA 72" })),
];
