"use client";

// Fire Extinguishers course: classes of fire, the PASS method, the monthly
// check, the right extinguisher for the room, and common myths.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  ChefHat,
  Check,
  Cog,
  CookingPot,
  Footprints,
  Fuel,
  Monitor,
  PaintBucket,
  Ruler,
  Server,
  Sofa,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { Flames, Smoke } from "../art";
import { Extinguisher, GaugeFace, type Needle } from "../art-extinguisher";
import QuizLevel, { type QuizQuestion } from "../levels/QuizLevel";
import { MythOrFactLevel, type Statement } from "../levels/MythOrFact";
import {
  Choices,
  FeedbackSheet,
  LevelHeader,
  type LevelProps,
  Nudge,
  Prompt,
  SheetSpacer,
  shuffle,
  stepPoints,
} from "../ui";

function ThingCard({ icon: Icon, name, tone = "orange" }: { icon: React.ElementType; name: string; tone?: "orange" | "red" }) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className={`p-4 rounded-2xl ${tone === "red" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
        <Icon className="w-10 h-10" />
      </div>
      <div className="text-xl font-extrabold text-gray-900">{name}</div>
    </div>
  );
}

/* ---------- Level 1: Classes of fire ---------- */

const CLASSES = [
  { letter: "A", color: "#16a34a", text: "Wood, paper, trash" },
  { letter: "B", color: "#dc2626", text: "Flammable liquids" },
  { letter: "C", color: "#2563eb", text: "Live electrical" },
  { letter: "D", color: "#ca8a04", text: "Burning metals" },
  { letter: "K", color: "#111827", text: "Cooking oils" },
];

const CLASS_OPTIONS = CLASSES.map((c) => (
  <span key={c.letter} className="flex items-center gap-2.5">
    <span
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black flex-shrink-0"
      style={{ background: c.color }}
    >
      {c.letter}
    </span>
    <span className="text-sm leading-tight">{c.text}</span>
  </span>
));

const classQ = (icon: React.ElementType, name: string, answer: number, explain: string): QuizQuestion => ({
  prompt: "What class of fire is this?",
  visual: () => <ThingCard icon={icon} name={name} tone="red" />,
  answer,
  right: `Class ${CLASSES[answer].letter}`,
  wrong: `It's Class ${CLASSES[answer].letter}`,
  explain,
});

const CLASS_QUESTIONS: QuizQuestion[] = [
  classQ(Trash2, "A trash can full of paper", 0, "Class A covers ordinary combustibles: paper, wood, cloth, and trash. Water and ABC extinguishers both work on it."),
  classQ(Fuel, "Gasoline spilled on a garage floor", 1, "Class B is flammable liquids and gases. Never use water: it spreads the burning liquid. Use a B-rated extinguisher like an ABC."),
  classQ(Zap, "A sparking electrical panel", 2, "Class C is energized electrical equipment. Never use water: it conducts electricity. Use a C-rated extinguisher like ABC or CO2, and cut the power if you safely can."),
  classQ(CookingPot, "Oil burning in a restaurant deep fryer", 4, "Class K is cooking oils and fats. They burn so hot that commercial kitchens need a Class K wet chemical extinguisher near the fryers. Water makes burning oil erupt."),
  classQ(Cog, "Magnesium shavings in a machine shop", 3, "Class D is combustible metals like magnesium and titanium. They need a special Class D dry powder. Water can make them burn even more violently."),
  classQ(Sofa, "A burning couch cushion", 0, "Fabric and foam are ordinary combustibles: Class A."),
  classQ(PaintBucket, "Paint thinner on a workbench", 1, "Thinner is a flammable liquid: Class B."),
  classQ(Monitor, "A computer that's still plugged in", 2, "Still plugged in means energized: Class C. Once it's unplugged, what's burning is plastic, a Class A fire."),
];

export function ExtClasses(props: LevelProps) {
  return <QuizLevel {...props} title="Classes of Fire" questions={CLASS_QUESTIONS} options={CLASS_OPTIONS} columns={2} />;
}

/* ---------- Level 2: PASS ---------- */

const STEPS = [
  {
    id: "pull",
    name: "Pull the pin",
    blurb: "The pin locks the handle so it can't go off by accident. Pull it straight out. That breaks the plastic tamper seal.",
  },
  {
    id: "aim",
    name: "Aim at the base",
    blurb: "Aim low, at the base of the fire where the fuel is, from about 6 to 8 feet away. Spraying the flames does almost nothing.",
  },
  { id: "squeeze", name: "Squeeze the handle", blurb: "Squeeze slowly and evenly. Let go and it stops." },
  {
    id: "sweep",
    name: "Sweep side to side",
    blurb: "Sweep across the base until the fire is out, then back away and keep watching. It can flare back up.",
  },
];

const PASS_QUESTIONS = [
  {
    text: "Before you grab an extinguisher, what comes first?",
    options: [
      "Find the biggest extinguisher in the building",
      "Pull the fire alarm (or make sure someone has) and know your way out",
      "Open the windows to let the smoke out",
    ],
    answer: 1,
    right: "Alarm first, exit behind you",
    wrong: "Alarm first, exit behind you",
    fact: "Get everyone moving and help on the way before you fight anything. Only fight a fire that's small and contained, with a clear exit at your back.",
  },
  {
    text: "Flames are climbing the wall and the room is filling with smoke. Now what?",
    options: [
      "Keep spraying until the extinguisher is empty",
      "Grab a second extinguisher and go back in",
      "Get out, close the door behind you, and call 911",
    ],
    answer: 2,
    right: "Get out",
    wrong: "Time to get out",
    fact: "Portable extinguishers are for small, early fires, and most empty in well under 30 seconds. Once a fire is spreading or smoke is building up, leave, close the door to slow it down, and let the fire department take it.",
  },
];

const PASS_TOTAL = STEPS.length + PASS_QUESTIONS.length;

export function ExtPass({ onFinish, onExit }: LevelProps) {
  const [chips] = useState(() => shuffle(STEPS));
  const [placed, setPlaced] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<{ id: string; key: number } | null>(null);
  const [fire, setFire] = useState<"big" | "small" | "out">("big");
  const [q, setQ] = useState(-1);
  const [picked, setPicked] = useState<number | null>(null);
  const [sheet, setSheet] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const done = new Set(STEPS.slice(0, placed).map((s) => s.id));
  const drilling = q === -1;

  const tap = (id: string) => {
    if (!drilling || done.has(id) || placed >= STEPS.length) return;
    if (id === STEPS[placed].id) {
      setScore((s) => s + stepPoints(misses));
      setMisses(0);
      setWrong(null);
      const n = placed + 1;
      setPlaced(n);
      if (n === STEPS.length) {
        timers.current.push(setTimeout(() => setFire("small"), 900));
        timers.current.push(setTimeout(() => setFire("out"), 2000));
        timers.current.push(setTimeout(() => setSheet(true), 2700));
      }
    } else {
      setMisses((m) => m + 1);
      setWrong({ id, key: Date.now() });
    }
  };

  const answer = (i: number) => {
    setPicked(i);
    if (i === PASS_QUESTIONS[q].answer) setScore((s) => s + 100);
    setSheet(true);
  };

  const next = () => {
    setSheet(false);
    if (drilling) {
      setQ(0);
      return;
    }
    setPicked(null);
    if (q === PASS_QUESTIONS.length - 1) onFinish({ score, max: PASS_TOTAL * 100 });
    else setQ(q + 1);
  };

  const last = placed > 0 ? STEPS[placed - 1] : null;
  const hintId = drilling && misses >= 2 && placed < STEPS.length ? STEPS[placed].id : null;
  const spraying = done.has("squeeze") && fire !== "out";

  return (
    <div>
      <LevelHeader
        title="P.A.S.S."
        step={drilling ? placed : STEPS.length + q}
        total={PASS_TOTAL}
        score={score}
        onExit={onExit}
      />
      {drilling ? (
        <Prompt sub="A small trash-can fire, alarm already pulled, exit behind you. Tap the steps in order.">
          Put it out with P.A.S.S.
        </Prompt>
      ) : (
        <Prompt sub="Bonus question">{PASS_QUESTIONS[q].text}</Prompt>
      )}

      <div className="grid md:grid-cols-2 gap-3 md:gap-4 items-start">
        <div className="rounded-2xl bg-white/70 border border-orange-200/70 p-2 shadow-sm">
          <svg viewBox="0 0 360 250" className="w-full h-auto max-h-[36svh] md:max-h-[56svh] select-none" role="img" aria-label="An extinguisher aimed at a small trash-can fire">
            <rect x={0} y={0} width={360} height={226} fill="#f7efdc" />
            <rect x={0} y={226} width={360} height={24} fill="#cbbf9f" />
            <line x1={0} y1={226} x2={360} y2={226} stroke="#a8977a" strokeWidth={2} />

            {/* Fire */}
            <path d="M276,200 L304,200 L301,226 L279,226 Z" fill="#6b7280" stroke="#374151" strokeWidth={1.2} />
            {fire === "out" ? <Smoke x={290} y={200} /> : <Flames x={290} y={202} size={fire === "big" ? 1.15 : 0.55} />}

            {/* Discharge */}
            {spraying && (
              <g className={done.has("sweep") ? "academy-sweep" : undefined} style={{ transformOrigin: "202px 168px" }}>
                <path d="M202,168 L262,198 Q290,186 318,198 L318,228 Q290,234 262,226 Z" fill="#f1f5f9" opacity={0.9} />
                {[
                  [240, 196, 6],
                  [270, 206, 8],
                  [300, 212, 7],
                  [256, 214, 5],
                  [288, 222, 6],
                ].map(([cx, cy, r]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#fff" opacity={0.85} className="academy-rise" />
                ))}
              </g>
            )}

            <Extinguisher
              x={84}
              y={226}
              pin={!done.has("pull")}
              seal={!done.has("pull")}
              hose={done.has("aim") ? "aimed" : "stowed"}
              squeezed={done.has("squeeze")}
              tag={false}
            />

            {/* The pin flies off when pulled */}
            {done.has("pull") && (
              <motion.g
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: -46, y: -20, opacity: 0, rotate: -60 }}
                transition={{ duration: 0.8 }}
              >
                <line x1={98} y1={42} x2={98} y2={56} stroke="#9ca3af" strokeWidth={2} />
                <circle cx={98} cy={64} r={6} fill="none" stroke="#9ca3af" strokeWidth={2} />
              </motion.g>
            )}

            {done.has("aim") && (
              <g>
                <path d="M120,240 H276" stroke="#6b7280" strokeWidth={1.2} strokeDasharray="4 3" />
                <path d="M120,236 v8 M276,236 v8" stroke="#6b7280" strokeWidth={1.2} />
                <text x={198} y={246} textAnchor="middle" fontSize={9} fontWeight={800} fill="#4b5563" stroke="#cbbf9f" strokeWidth={3} paintOrder="stroke">
                  6–8 FT
                </text>
              </g>
            )}
          </svg>
        </div>

        <div>
          {drilling ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {chips.map((c) => {
                  const idx = STEPS.findIndex((s) => s.id === c.id);
                  const isDone = done.has(c.id);
                  const isWrong = wrong?.id === c.id;
                  return (
                    <button
                      key={isWrong ? `${c.id}-${wrong!.key}` : c.id}
                      onClick={() => tap(c.id)}
                      disabled={isDone}
                      className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-bold transition-colors ${
                        isDone
                          ? "bg-green-50 border-green-500 text-green-900"
                          : isWrong
                            ? "academy-shake bg-red-50 border-red-400 text-red-900"
                            : hintId === c.id
                              ? "animate-pulse bg-orange-50 border-orange-500 text-gray-900"
                              : "bg-white border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-flex w-7 h-7 rounded-full items-center justify-center flex-shrink-0 text-sm font-black ${
                            isDone ? "bg-slate-800 text-white" : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {isDone ? idx + 1 : c.name[0]}
                        </span>
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {wrong ? (
                <Nudge key={wrong.key} tone="wrong">
                  {placed === 0 ? "Not yet. What keeps the handle from being squeezed?" : `Not yet. What comes right after "${STEPS[placed - 1].name.toLowerCase()}"?`}
                </Nudge>
              ) : last ? (
                <Nudge key={last.id} tone="right">
                  <span className="inline-flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{last.name}.</strong> {last.blurb}
                    </span>
                  </span>
                </Nudge>
              ) : null}
            </>
          ) : (
            <Choices options={PASS_QUESTIONS[q].options} answer={PASS_QUESTIONS[q].answer} picked={picked} onPick={answer} />
          )}
        </div>
      </div>

      {sheet && <SheetSpacer />}

      <FeedbackSheet
        open={sheet}
        tone={drilling || picked === PASS_QUESTIONS[q]?.answer ? "right" : "wrong"}
        title={drilling ? "Fire's out!" : picked === PASS_QUESTIONS[q].answer ? PASS_QUESTIONS[q].right : PASS_QUESTIONS[q].wrong}
        actionLabel={drilling ? "Bonus questions" : q === PASS_QUESTIONS.length - 1 ? "Finish level" : "Next"}
        onAction={next}
      >
        {drilling ? (
          <>
            <strong>P</strong>ull, <strong>A</strong>im, <strong>S</strong>queeze, <strong>S</strong>weep. Now back away and
            keep an eye on it, because a fire that looks out can flare back up. Every extinguisher that&apos;s been used,
            even for a second, has to be recharged before it goes back on the wall.
          </>
        ) : (
          PASS_QUESTIONS[q].fact
        )}
      </FeedbackSheet>
    </div>
  );
}

/* ---------- Level 3: Monthly check ---------- */

type Condition = {
  needle?: Needle;
  pin?: boolean;
  seal?: boolean;
  cracked?: boolean;
  blocked?: boolean;
};

function CheckCard({ c }: { c: Condition }) {
  const needle = c.needle ?? "ok";
  return (
    <svg viewBox="0 0 260 240" className="w-full h-auto max-h-[38svh] md:max-h-[56svh]" role="img" aria-label="Extinguisher up close with its gauge">
      <rect x={0} y={0} width={260} height={240} fill="#f3ead6" />
      <rect x={0} y={222} width={260} height={18} fill="#cbbf9f" />
      {!c.blocked && <path d="M78,46 h24 v10" stroke="#6b7280" strokeWidth={3} fill="none" />}
      <Extinguisher
        x={90}
        y={c.blocked ? 222 : 212}
        s={0.92}
        needle={needle}
        pin={c.pin ?? true}
        seal={c.seal ?? true}
        cracked={c.cracked}
      />
      {c.blocked && (
        <g>
          {[
            [30, 160, 70, 62],
            [96, 172, 64, 50],
            [56, 112, 60, 48],
          ].map(([x, y, w, h]) => (
            <g key={`${x}-${y}`}>
              <rect x={x} y={y} width={w} height={h} fill="#c8955c" stroke="#8a5a2b" strokeWidth={1.5} />
              <rect x={x + w / 2 - 5} y={y} width={10} height={h * 0.35} fill="#e3c08f" />
            </g>
          ))}
        </g>
      )}
      {/* Gauge close-up */}
      <line x1={88} y1={58} x2={176} y2={70} stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 3" />
      <circle cx={204} cy={74} r={40} fill="#fff" stroke="#d1d5db" strokeWidth={2} />
      <GaugeFace cx={204} cy={74} r={34} needle={needle} labels />
    </svg>
  );
}

const PASS_FAIL = [
  <span key="p" className="flex items-center gap-2 justify-center">
    <Check className="w-5 h-5" /> Pass
  </span>,
  <span key="f" className="flex items-center gap-2 justify-center">
    <X className="w-5 h-5" /> Fail
  </span>,
];

const checkQ = (c: Condition, sub: string, pass: boolean, explain: string, title?: string): QuizQuestion => ({
  prompt: "Monthly check: pass or fail?",
  sub,
  visual: () => <CheckCard c={c} />,
  answer: pass ? 0 : 1,
  right: pass ? "Pass, good eye" : (title ?? "Fail, good catch"),
  wrong: pass ? "This one passes" : (title ?? "This one fails"),
  explain,
});

const CHECK_QUESTIONS: QuizQuestion[] = [
  checkQ(
    {},
    "Gauge, pin, seal, hose, mounting. Tag shows annual service 4 months ago.",
    true,
    "Gauge in the green, pin and tamper seal in place, hose intact, mounted and visible, annual service current. Initial the monthly check and move on.",
  ),
  checkQ(
    { needle: "low" },
    "Tag shows annual service 2 months ago.",
    false,
    "The needle is in the red on the left: undercharged. It may sputter or not discharge at all. Take it out of service and have it recharged.",
    "Fail: undercharged",
  ),
  checkQ(
    { pin: false, seal: false },
    "Tag shows annual service 5 months ago.",
    false,
    "The pin and tamper seal are gone, so it may have been used or tampered with. Even a short squeeze can let pressure leak out. Have it serviced.",
    "Fail: pin and seal missing",
  ),
  checkQ(
    {},
    "Everything looks fine, but the tag shows the last annual service was 14 months ago.",
    false,
    "Every extinguisher needs maintenance once a year by a licensed technician, recorded on the tag. Fourteen months is overdue, even if it looks perfect.",
    "Fail: annual service overdue",
  ),
  checkQ(
    { needle: "high" },
    "Tag shows annual service 6 months ago.",
    false,
    "The needle is in the red on the right: overcharged. Too much pressure can damage the valve or cylinder. Have it serviced.",
    "Fail: overcharged",
  ),
  checkQ(
    { cracked: true },
    "Tag shows annual service 3 months ago.",
    false,
    "Look at the hose: it's cracked. A cracked hose can split under pressure and spray everywhere except the fire.",
    "Fail: cracked hose",
  ),
  checkQ(
    { blocked: true },
    "Tag shows annual service 1 month ago.",
    false,
    "It's sitting on the floor behind boxes. Extinguishers have to be mounted, visible, and easy to grab in a hurry.",
    "Fail: blocked and not mounted",
  ),
  checkQ(
    {},
    "Gauge, pin, seal, hose, mounting. Tag shows annual service 9 months ago.",
    true,
    "Everything checks out, and the annual service is still current. That's a pass.",
  ),
];

export function ExtCheck(props: LevelProps) {
  return <QuizLevel {...props} title="Monthly Check" questions={CHECK_QUESTIONS} options={PASS_FAIL} columns={2} />;
}

/* ---------- Level 4: Right extinguisher, right place ---------- */

const TYPES = ["ABC dry chemical", "Class K wet chemical", "Carbon dioxide (CO2)", "Class D dry powder"];

const typeQ = (icon: React.ElementType, name: string, answer: number, explain: string): QuizQuestion => ({
  prompt: "Which extinguisher belongs here?",
  visual: () => <ThingCard icon={icon} name={name} />,
  options: TYPES,
  answer,
  right: TYPES[answer],
  wrong: `Best fit: ${TYPES[answer]}`,
  explain,
});

const PICK_QUESTIONS: QuizQuestion[] = [
  typeQ(Briefcase, "General office space", 0, "A multipurpose ABC dry chemical extinguisher handles the paper, furniture, and electronics in a typical office."),
  typeQ(ChefHat, "Restaurant cook line with deep fryers", 1, "Cooking oil fires need Class K wet chemical. It cools the oil and forms a soapy layer that keeps it from reigniting. It has to be within 30 feet of the cooking equipment."),
  typeQ(Server, "Server room full of running equipment", 2, "CO2 smothers the fire and leaves no residue to ruin electronics. Dry chemical works too, but the powder is corrosive and messy."),
  typeQ(Cog, "Machine shop that grinds magnesium", 3, "Burning metals need Class D dry powder. Ordinary extinguishers, and especially water, can make a metal fire worse."),
  {
    prompt: "How high can you hang a 20-pound extinguisher?",
    sub: "Mounting height matters so anyone can grab it.",
    visual: () => <ThingCard icon={Ruler} name="Mounting height" />,
    options: ["Top no higher than 5 feet off the floor", "At least 7 feet up so nobody bumps it", "Anywhere, as long as there's a sign"],
    answer: 0,
    right: "No higher than 5 feet",
    wrong: "Top no higher than 5 feet",
    explain: "Extinguishers 40 pounds or lighter hang with the top no higher than 5 feet. Heavier ones go no higher than 3½ feet. Either way, the bottom stays at least 4 inches off the floor.",
  },
  {
    prompt: "In an office, how far can someone have to walk to reach an extinguisher?",
    sub: "This is the maximum travel distance for ordinary (Class A) hazards.",
    visual: () => <ThingCard icon={Footprints} name="Travel distance" />,
    options: ["75 feet", "200 feet", "500 feet"],
    answer: 0,
    right: "75 feet",
    wrong: "It's 75 feet",
    explain: "For ordinary hazards the walk to an extinguisher can't be more than 75 feet. Near commercial cooking with Class K hazards, it's 30 feet.",
  },
];

export function ExtPick(props: LevelProps) {
  return <QuizLevel {...props} title="Right Tool, Right Place" questions={PICK_QUESTIONS} shuffleQuestions={false} />;
}

/* ---------- Level 5: Myths ---------- */

const EXT_MYTHS: Statement[] = [
  {
    text: "You can put out a grease fire with water.",
    fact: false,
    why: "Water sinks under the burning oil, flashes to steam, and throws flaming oil everywhere. Cover a pan with a lid, or use a Class K extinguisher in a commercial kitchen.",
  },
  {
    text: "An ABC extinguisher works on most fires in a typical office.",
    fact: true,
    why: "ABC dry chemical covers ordinary combustibles, flammable liquids, and electrical equipment. That's why it's the most common type.",
  },
  {
    text: "Fire extinguishers need a quick visual check every month.",
    fact: true,
    why: "Monthly: is it there, visible, charged, pinned, and undamaged? Then a licensed technician does full maintenance once a year.",
  },
  {
    text: "If you only used an extinguisher for a second, it's still good to go.",
    fact: false,
    why: "Any use can let pressure leak out through the valve. A used extinguisher has to be recharged before it goes back on the wall.",
  },
  {
    text: "As long as the gauge is in the green, an extinguisher never needs service.",
    fact: false,
    why: "It still needs annual maintenance, plus periodic internal checks and pressure testing of the cylinder.",
  },
  {
    text: "Aim at the tallest flames, not the base of the fire.",
    fact: false,
    why: "Aim at the base, where the fuel is. Spraying the flames barely touches what's actually burning.",
  },
  {
    text: "A typical portable extinguisher can run empty in under 30 seconds.",
    fact: true,
    why: "Most hold only enough for a short burst. That's why they're for small, early fires, and why you need a clear way out.",
  },
  {
    text: "Keep fighting a fire even if it's spreading and the room is filling with smoke.",
    fact: false,
    why: "Once it's spreading or smoky, get out, close the door behind you, and call 911.",
  },
  {
    text: "CO2 extinguishers leave a messy powder behind.",
    fact: false,
    why: "CO2 is a gas that leaves no residue. Dry chemical extinguishers are the ones that leave powder everywhere.",
  },
  {
    text: "Class K extinguishers are made for commercial cooking oil fires.",
    fact: true,
    why: "Their wet chemical cools the oil and forms a soapy layer over it so it doesn't reignite.",
  },
  {
    text: "Storing the extinguisher in a closet is fine as long as everyone knows where it is.",
    fact: false,
    why: "Extinguishers have to be visible and easy to reach. If one can't be seen, signs have to point to it. In a panic, nobody remembers the closet.",
  },
  {
    text: "Stored-pressure dry chemical extinguishers need a hydrostatic pressure test every 12 years.",
    fact: true,
    why: "The cylinder gets pressure-tested to make sure it's still safe. Water and CO2 extinguishers need it every 5 years.",
  },
];

export function ExtMyths(props: LevelProps) {
  return <MythOrFactLevel {...props} title="Extinguisher Myth or Fact" statements={EXT_MYTHS} />;
}
