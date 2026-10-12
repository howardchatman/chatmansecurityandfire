"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge, Flames, MiniHead, PIPE_RED, Smoke, Spray, SprayDefs } from "../art";
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

type PartId = "supply" | "pump" | "control" | "alarm" | "riser" | "branch" | "head";

const ORDER: { id: PartId; name: string; blurb: string }[] = [
  { id: "supply", name: "Water supply", blurb: "The city water main (or a storage tank) feeds the whole system." },
  { id: "pump", name: "Fire pump", blurb: "Boosts the pressure when the supply alone isn't strong enough. Not every building needs one." },
  { id: "control", name: "Control valve", blurb: "Lets a technician shut the system down for repairs. The rest of the time it stays open." },
  { id: "alarm", name: "Alarm valve & flow switch", blurb: "Senses water moving and signals the fire alarm panel, which sounds the alarm and alerts the monitoring company." },
  { id: "riser", name: "Riser", blurb: "The vertical pipe that carries water up to every floor." },
  { id: "branch", name: "Branch lines", blurb: "The horizontal pipes on each floor that feed the sprinkler heads." },
  { id: "head", name: "Sprinkler head", blurb: "Opens where it's hot and puts water on the fire." },
];

const QUESTIONS = [
  {
    text: "The fire department arrives. How do they push more water into the sprinklers?",
    options: [
      "They open more sprinkler heads",
      "Through the Fire Department Connection (FDC) on the outside wall",
      "They plug into the fire pump's controller",
    ],
    answer: 1,
    right: "Right, the FDC",
    wrong: "They use the FDC",
    fact: "The FDC is the pair of capped inlets on the building's outside wall. A fire engine hooks its hoses to it and pumps water straight into the sprinkler piping. That's why the FDC has to stay visible, capped, and clear of cars, bushes, and dumpsters.",
  },
  {
    text: "On a normal day with no fire, the main control valve should be…",
    options: [
      "Closed, so the pipes stay dry until there's a fire",
      "Open, and locked or supervised so nobody can shut it",
      "Half open, to take strain off the pipes",
    ],
    answer: 1,
    right: "Open, locked, and watched",
    wrong: "It stays open",
    fact: "In a wet system the valve stays open all the time. The heads are what hold the water back. A shut valve is the leading reason sprinklers fail to operate in fires, so valves are locked open or fitted with a tamper switch that alerts the alarm panel the moment someone turns one.",
  },
];

const TOTAL = ORDER.length + QUESTIONS.length;

export default function FollowWater({ onFinish, onExit }: LevelProps) {
  const [chips] = useState(() => shuffle(ORDER));
  const [placed, setPlaced] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<{ id: PartId; key: number } | null>(null);
  const [finale, setFinale] = useState<"idle" | "spraying" | "out">("idle");
  const [q, setQ] = useState(-1); // -1 while building, then question index
  const [picked, setPicked] = useState<number | null>(null);
  const [sheet, setSheet] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const placedIds = new Set(ORDER.slice(0, placed).map((p) => p.id));
  const building = q === -1;
  const step = building ? placed : ORDER.length + q;

  const tapChip = (id: PartId) => {
    if (!building || placedIds.has(id) || placed >= ORDER.length) return;
    if (id === ORDER[placed].id) {
      setScore((s) => s + stepPoints(misses));
      setMisses(0);
      setWrong(null);
      const n = placed + 1;
      setPlaced(n);
      if (n === ORDER.length) {
        timers.current.push(setTimeout(() => setFinale("spraying"), 700));
        timers.current.push(setTimeout(() => setFinale("out"), 2100));
        timers.current.push(setTimeout(() => setSheet(true), 2700));
      }
    } else {
      setMisses((m) => m + 1);
      setWrong({ id, key: Date.now() });
    }
  };

  const next = () => {
    setSheet(false);
    setPicked(null);
    if (q === QUESTIONS.length - 1) {
      onFinish({ score, max: TOTAL * 100 });
    } else {
      setQ(q + 1);
    }
  };

  const answer = (i: number) => {
    setPicked(i);
    if (i === QUESTIONS[q].answer) setScore((s) => s + 100);
    setSheet(true);
  };

  const hintId = building && misses >= 2 && placed < ORDER.length ? ORDER[placed].id : null;
  const last = placed > 0 ? ORDER[placed - 1] : null;

  return (
    <div>
      <LevelHeader title="Follow the Water" step={step} total={TOTAL} score={score} onExit={onExit} />

      {building ? (
        <Prompt sub="Tap the parts in the order water flows through them.">
          Get water to the fire on floor 3
        </Prompt>
      ) : (
        <Prompt sub="Bonus question">{QUESTIONS[q].text}</Prompt>
      )}

      <div className="grid md:grid-cols-[1fr_1fr] gap-3 md:gap-4 items-start">
        <div className="rounded-2xl bg-white/70 border border-orange-200/70 p-2 shadow-sm">
          <Building placed={placedIds} finale={finale} />
        </div>

        <div>
          {building ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {chips.map((c) => {
                  const idx = ORDER.findIndex((o) => o.id === c.id);
                  const done = placedIds.has(c.id);
                  const isWrong = wrong?.id === c.id;
                  return (
                    <button
                      key={isWrong ? `${c.id}-${wrong!.key}` : c.id}
                      onClick={() => tapChip(c.id)}
                      disabled={done}
                      className={`relative rounded-xl border-2 px-2.5 py-2 sm:px-3 sm:py-3 text-left text-[13px] sm:text-sm leading-tight font-bold transition-colors ${
                        done
                          ? "bg-green-50 border-green-500 text-green-900"
                          : isWrong
                            ? "academy-shake bg-red-50 border-red-400 text-red-900"
                            : hintId === c.id
                              ? "animate-pulse bg-orange-50 border-orange-500 text-gray-900"
                              : "bg-white border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {done ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-slate-800 text-white text-xs items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                        ) : (
                          <span className="inline-flex w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0" />
                        )}
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {wrong ? (
                <Nudge key={wrong.key} tone="wrong">
                  {placed === 0
                    ? "Not yet. Where does the water come from in the first place?"
                    : `Not yet. Where does the water go right after the ${ORDER[placed - 1].name.toLowerCase()}?`}
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
            <Choices options={QUESTIONS[q].options} answer={QUESTIONS[q].answer} picked={picked} onPick={answer} />
          )}
        </div>
      </div>

      {sheet && <SheetSpacer />}

      <FeedbackSheet
        open={sheet}
        tone={building ? "right" : picked === QUESTIONS[q].answer ? "right" : "wrong"}
        title={building ? "Water's on the fire!" : picked === QUESTIONS[q].answer ? QUESTIONS[q].right : QUESTIONS[q].wrong}
        actionLabel={building ? "Bonus questions" : q === QUESTIONS.length - 1 ? "Finish level" : "Next"}
        onAction={building ? () => { setSheet(false); setQ(0); } : next}
      >
        {building ? (
          <>
            Supply, pump, the open control valve, past the flow switch, up the riser, along the branch line, and out the
            one head that got hot. The moving water tripped the flow switch, so the alarm is sounding and the monitoring
            company is calling the fire department.
          </>
        ) : (
          QUESTIONS[q].fact
        )}
      </FeedbackSheet>
    </div>
  );
}

const RISER_X = 320;
const BRANCH_Y = [62, 164, 260];
const HEAD_X = [110, 180, 250];
const MAIN_Y = 432;

function Pipe({ d, on }: { d: string; on: boolean }) {
  return (
    <g>
      {on ? (
        <>
          <path d={d} stroke={PIPE_RED} strokeWidth={7} fill="none" strokeLinecap="round" />
          <motion.path
            d={d}
            stroke="#93c5fd"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        </>
      ) : (
        <path d={d} stroke="#9ca3af" strokeWidth={5} fill="none" strokeDasharray="5 5" strokeLinecap="round" opacity={0.7} />
      )}
    </g>
  );
}

function Ghost({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <g opacity={on ? 1 : 0.3} style={{ transition: "opacity 0.4s" }}>
      {children}
    </g>
  );
}

function Building({ placed, finale }: { placed: Set<PartId>; finale: "idle" | "spraying" | "out" }) {
  const on = (id: PartId) => placed.has(id);
  const n = (id: PartId) => ORDER.findIndex((o) => o.id === id) + 1;
  const ringing = finale !== "idle";

  return (
    <svg viewBox="0 0 360 470" className="w-full h-auto max-h-[38svh] md:max-h-[64svh] select-none" role="img" aria-label="Cutaway of a three-story building's sprinkler system">
      <SprayDefs />
      {/* Ground and basement */}
      <rect x={0} y={340} width={360} height={130} fill="#d9c7a3" />
      <line x1={0} y1={340} x2={360} y2={340} stroke="#8a7350" strokeWidth={2} />
      <rect x={60} y={344} width={284} height={112} fill="#e7e3d8" stroke="#6b7280" strokeWidth={4} />

      {/* Building shell, floors, and simple furniture */}
      <rect x={60} y={46} width={284} height={294} fill="#f7efdc" stroke="#9a4a2c" strokeWidth={6} />
      <rect x={54} y={40} width={296} height={10} fill="#8b8f97" />
      {[146, 242, 336].map((y) => (
        <rect key={y} x={60} y={y} width={284} height={7} fill="#9ca3af" />
      ))}
      {[146, 242, 336].map((floorY, i) => (
        <g key={floorY} fill="#c9b99a">
          <rect x={i === 0 ? 236 : 150} y={floorY - 26} width={46} height={5} />
          <rect x={i === 0 ? 239 : 153} y={floorY - 21} width={4} height={21} />
          <rect x={i === 0 ? 275 : 189} y={floorY - 21} width={4} height={21} />
        </g>
      ))}
      <text x={70} y={138} fontSize={9} fontWeight={700} fill="#9a8a6a">FLOOR 3</text>
      <text x={70} y={234} fontSize={9} fontWeight={700} fill="#9a8a6a">FLOOR 2</text>
      <text x={70} y={330} fontSize={9} fontWeight={700} fill="#9a8a6a">FLOOR 1</text>
      <text x={166} y={450} fontSize={9} fontWeight={700} fill="#8b8f97">RISER ROOM</text>
      <text x={6} y={456} fontSize={9} fontWeight={800} fill="#6b5a3a">CITY MAIN</text>

      {/* 1. Supply */}
      <Pipe d={`M0,${MAIN_Y} H96`} on={on("supply")} />

      {/* 2. Fire pump */}
      <Pipe d={`M146,${MAIN_Y} H${RISER_X}`} on={on("pump")} />
      <Ghost on={on("pump")}>
        <rect x={92} y={416} width={58} height={32} rx={8} fill="#dc2626" stroke="#7f1d1d" strokeWidth={2} />
        <circle cx={108} cy={432} r={9} fill="#b91c1c" stroke="#7f1d1d" strokeWidth={2} />
        <rect x={124} y={422} width={20} height={20} rx={3} fill="#ef4444" stroke="#7f1d1d" strokeWidth={1.5} />
        <rect x={96} y={448} width={50} height={5} fill="#4b5563" />
      </Ghost>

      {/* 3. Control valve (OS&Y) */}
      <Pipe d={`M${RISER_X},${MAIN_Y} V390`} on={on("control")} />
      <Ghost on={on("control")}>
        <rect x={RISER_X - 10} y={400} width={20} height={18} rx={4} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
        <line x1={RISER_X - 10} y1={409} x2={290} y2={409} stroke="#6b7280" strokeWidth={3} />
        <ellipse cx={288} cy={409} rx={4} ry={11} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
      </Ghost>

      {/* 4. Alarm valve, flow switch, and bell */}
      <Pipe d={`M${RISER_X},390 V350`} on={on("alarm")} />
      <Ghost on={on("alarm")}>
        <circle cx={RISER_X} cy={372} r={11} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
        <rect x={RISER_X + 8} y={352} width={14} height={11} rx={2} fill="#e5e7eb" stroke="#374151" strokeWidth={1.2} />
        <path d={`M${RISER_X + 15},352 V348 H262 V358`} stroke="#374151" strokeWidth={1.2} fill="none" />
        <g className={ringing ? "academy-shake" : undefined} style={ringing ? { animationIterationCount: "infinite" } : undefined}>
          <circle cx={262} cy={368} r={10} fill="#d4a017" stroke="#7a5c0a" strokeWidth={1.5} />
          <circle cx={262} cy={368} r={3} fill="#7a5c0a" />
        </g>
        {ringing && (
          <g stroke="#dc2626" strokeWidth={2} fill="none" strokeLinecap="round">
            <path d="M244,358 q-5,10 0,20" />
            <path d="M238,354 q-7,14 0,28" />
            <text x={226} y={398} fontSize={10} fontWeight={900} fill="#dc2626" stroke="none">ALARM!</text>
          </g>
        )}
      </Ghost>

      {/* 5. Riser */}
      <Pipe d={`M${RISER_X},350 V${BRANCH_Y[0]}`} on={on("riser")} />

      {/* 6. Branch lines */}
      {BRANCH_Y.map((y) => (
        <Pipe key={y} d={`M${RISER_X},${y} H86`} on={on("branch")} />
      ))}

      {/* Fire on floor 3 */}
      <g>
        <path d="M168,128 L192,128 L189,146 L171,146 Z" fill="#6b7280" stroke="#374151" strokeWidth={1.2} />
        {finale === "out" ? <Smoke x={180} y={128} /> : <Flames x={180} y={130} size={finale === "spraying" ? 1.1 : 0.85} />}
      </g>

      {/* 7. Sprinkler heads */}
      <Ghost on={on("head")}>
        {BRANCH_Y.map((y) =>
          HEAD_X.map((x) => <MiniHead key={`${x}-${y}`} x={x} y={y + 3} scale={0.95} open={finale !== "idle" && y === BRANCH_Y[0] && x === 180} />),
        )}
      </Ghost>
      {finale === "spraying" && <Spray x={180} y={BRANCH_Y[0] + 24} length={58} spread={34} />}

      {/* Number callouts for placed parts */}
      {on("supply") && <Badge x={40} y={416} n={n("supply")} />}
      {on("pump") && <Badge x={121} y={402} n={n("pump")} />}
      {on("control") && <Badge x={272} y={409} n={n("control")} />}
      {on("alarm") && <Badge x={RISER_X - 22} y={380} n={n("alarm")} />}
      {on("riser") && <Badge x={RISER_X - 16} y={200} n={n("riser")} />}
      {on("branch") && <Badge x={86} y={BRANCH_Y[1] + 14} n={n("branch")} />}
      {on("head") && <Badge x={276} y={BRANCH_Y[2] + 22} n={n("head")} />}
    </svg>
  );
}
