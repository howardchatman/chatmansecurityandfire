"use client";

import { useEffect, useRef, useState } from "react";
import { BULB, Flames, Heat, MiniHead, PIPE_RED, Smoke, Spray, SprayDefs } from "../art";
import {
  Choices,
  FeedbackSheet,
  LevelHeader,
  type LevelProps,
  Nudge,
  Prompt,
  SheetSpacer,
  stepPoints,
} from "../ui";

const HEADS = [40, 110, 180, 250, 320];
const HEAD_Y = 38;
const FLOOR_Y = 226;

type Fire = { x: number; kind: "basket" | "couch"; state: "small" | "big" | "out" };

const BULB_CHART: { color: string; name: string; temp: string }[] = [
  { color: BULB.orange, name: "Orange", temp: "135°F" },
  { color: BULB.red, name: "Red", temp: "155°F" },
  { color: BULB.yellow, name: "Yellow", temp: "175°F" },
  { color: BULB.green, name: "Green", temp: "200°F" },
  { color: BULB.blue, name: "Blue", temp: "286°F" },
  { color: BULB.purple, name: "Purple", temp: "360°F" },
  { color: BULB.black, name: "Black", temp: "400°F+" },
];

const PREDICT = {
  options: [
    "Every sprinkler in the room opens, like in the movies",
    "Only the sprinkler over the fire opens",
    "Nothing, until the fire alarm tells them to open",
  ],
  answer: 1,
};

const RED_TEMP = { options: ["135°F", "155°F", "200°F", "286°F"], answer: 1 };

const BOILER = {
  options: [
    <BulbOption key="r" color={BULB.red} label="Red, 155°F" />,
    <BulbOption key="g" color={BULB.green} label="Green, 200°F" />,
    <BulbOption key="b" color={BULB.blue} label="Blue, 286°F" />,
  ],
  answer: 1,
};

const TOTAL = 5;

export default function HotHead({ onFinish, onExit }: LevelProps) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [fire, setFire] = useState<Fire | null>({ x: HEADS[1], kind: "basket", state: "small" });
  const [heat, setHeat] = useState(false);
  const [open, setOpen] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [wrongHead, setWrongHead] = useState<{ i: number; key: number } | null>(null);
  const [locked, setLocked] = useState(false);
  const [sheet, setSheet] = useState<null | { tone: "right" | "wrong"; title: string; body: React.ReactNode }>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

  /** Heat rises, the given heads open, the fire goes out, then explain. */
  const runFire = (heads: number[], sheetContent: NonNullable<typeof sheet>, headStart = 1300) => {
    setLocked(true);
    setHeat(true);
    setFire((f) => f && { ...f, state: "big" });
    later(headStart, () => setOpen(heads));
    later(headStart + 1300, () => {
      setHeat(false);
      setFire((f) => f && { ...f, state: "out" });
    });
    later(headStart + 2000, () => setSheet(sheetContent));
  };

  const next = () => {
    setSheet(null);
    setMisses(0);
    setPicked(null);
    setOpen([]);
    setSelected([]);
    setWrongHead(null);
    setLocked(false);
    if (step === TOTAL - 1) {
      onFinish({ score, max: TOTAL * 100 });
      return;
    }
    const s = step + 1;
    setStep(s);
    if (s === 1) {
      setFire({ x: HEADS[3], kind: "basket", state: "small" });
      setHeat(true);
    } else if (s === 2) {
      setFire({ x: (HEADS[1] + HEADS[2]) / 2, kind: "couch", state: "small" });
      setHeat(true);
    } else {
      setFire(null);
      setHeat(false);
    }
  };

  // Step 0: predict before watching.
  const predict = (i: number) => {
    setPicked(i);
    const right = i === PREDICT.answer;
    if (right) setScore((s) => s + 100);
    runFire([1], {
      tone: right ? "right" : "wrong",
      title: right ? "Right: only the hot one opens" : "Only the hot one opens",
      body: (
        <>
          Each sprinkler is its own heat detector. Only the head over the fire got hot enough, so it&apos;s the only one
          that opened and the rest of the room stays dry. Every head going off at once only happens with a special{" "}
          <strong>deluge system</strong>, built for places like aircraft hangars.
        </>
      ),
    });
  };

  // Step 1: tap the head that opens.
  const tapSingle = (i: number) => {
    if (locked) return;
    if (i === 3) {
      setScore((s) => s + stepPoints(misses));
      runFire(
        [3],
        {
          tone: "right",
          title: misses === 0 ? "That's the one, first try!" : "That's the one",
          body: (
            <>
              Heat rises straight up from the fire and spreads across the ceiling, so the closest head heats first and
              opens. NFPA data shows that in about <strong>3 out of 4</strong> fires where sprinklers operated, just one
              sprinkler opened.
            </>
          ),
        },
        500,
      );
    } else {
      setMisses((m) => m + 1);
      setWrongHead({ i, key: Date.now() });
    }
  };

  // Step 2: select every head that opens over a bigger fire.
  const toggle = (i: number) => {
    if (locked) return;
    setSelected((sel) => (sel.includes(i) ? sel.filter((h) => h !== i) : [...sel, i]));
  };
  const checkSelection = () => {
    const right = selected.length === 2 && selected.includes(1) && selected.includes(2);
    if (right) setScore((s) => s + 100);
    else setScore((s) => s + 25);
    setSelected([1, 2]);
    runFire(
      [1, 2],
      {
        tone: right ? "right" : "wrong",
        title: right ? "Both of them, exactly" : "The two closest heads open",
        body: (
          <>
            A fire right between two heads heats both about equally, so both open. Systems are designed for a small group
            of heads over the fire to open together, never the whole building.
          </>
        ),
      },
      700,
    );
  };

  const answerRed = (i: number) => {
    setPicked(i);
    const right = i === RED_TEMP.answer;
    if (right) setScore((s) => s + 100);
    setSheet({
      tone: right ? "right" : "wrong",
      title: right ? "155°F, you know your colors" : "Red means 155°F",
      body: (
        <>
          <p>The liquid&apos;s color tells you the temperature the bulb opens at:</p>
          <BulbChart />
        </>
      ),
    });
  };

  const answerBoiler = (i: number) => {
    setPicked(i);
    const right = i === BOILER.answer;
    if (right) setScore((s) => s + 100);
    setSheet({
      tone: right ? "right" : "wrong",
      title: right ? "Green is the right call" : "Green is the best fit",
      body: (
        <>
          Orange and red bulbs are for ceilings that stay at or below 100°F. A red bulb in a 130°F room is too close to
          its trigger point. A hot room needs an intermediate rating (yellow or green, for ceilings up to 150°F). Going
          higher than you need, like blue, makes the head slower to react in a real fire.
        </>
      ),
    });
  };

  const prompts = [
    { title: "A trash can catches fire. What happens?", sub: "Make your prediction, then watch." },
    {
      title: "Another fire! Tap the sprinkler that opens.",
      sub: misses >= 2 ? "Hint: heat rises straight up from the flames." : "Think about where the heat goes.",
    },
    {
      title: "A couch is burning. Tap every sprinkler that opens.",
      sub: "Select the heads, then press Check.",
    },
    { title: "Bulbs come in colors. A red bulb opens at about…", sub: "This one shows up in offices and stores everywhere." },
    {
      title: "Which bulb is the best fit here?",
      sub: "A mechanical room next to a boiler. The ceiling regularly reaches 130°F.",
    },
  ];

  return (
    <div>
      <LevelHeader title="Only the Hot One Opens" step={step} total={TOTAL} score={score} onExit={onExit} />
      <Prompt sub={prompts[step].sub}>{prompts[step].title}</Prompt>

      <div className="grid md:grid-cols-[3fr_2fr] gap-4 items-start">
        <div className="rounded-2xl bg-white/70 border border-orange-200/70 p-2 shadow-sm">
          {step <= 2 ? (
            <Room
              fire={fire}
              heat={heat}
              open={open}
              selected={selected}
              wrongHead={wrongHead}
              tappable={!locked && (step === 1 || step === 2)}
              onTap={step === 1 ? tapSingle : toggle}
            />
          ) : (
            <BulbLineup highlight={step === 3 ? BULB.red : null} boiler={step === 4} />
          )}
        </div>

        <div>
          {step === 0 && <Choices options={PREDICT.options} answer={PREDICT.answer} picked={picked} onPick={predict} />}
          {step === 1 && wrongHead && (
            <Nudge key={wrongHead.key} tone="wrong">
              That head is too far from the heat. It stays shut.
            </Nudge>
          )}
          {step === 2 && (
            <button
              disabled={selected.length === 0 || locked}
              onClick={checkSelection}
              className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3.5 transition-colors"
            >
              {selected.length === 0 ? "Tap the heads that open" : `Check (${selected.length} selected)`}
            </button>
          )}
          {step === 3 && (
            <Choices options={RED_TEMP.options} answer={RED_TEMP.answer} picked={picked} onPick={answerRed} />
          )}
          {step === 4 && <Choices options={BOILER.options} answer={BOILER.answer} picked={picked} onPick={answerBoiler} />}
        </div>
      </div>

      {sheet && <SheetSpacer />}

      <FeedbackSheet
        open={!!sheet}
        tone={sheet?.tone ?? "right"}
        title={sheet?.title ?? ""}
        actionLabel={step === TOTAL - 1 ? "Finish level" : "Next"}
        onAction={next}
      >
        {sheet?.body}
      </FeedbackSheet>
    </div>
  );
}

function Room({
  fire,
  heat,
  open,
  selected,
  wrongHead,
  tappable,
  onTap,
}: {
  fire: Fire | null;
  heat: boolean;
  open: number[];
  selected: number[];
  wrongHead: { i: number; key: number } | null;
  tappable: boolean;
  onTap: (i: number) => void;
}) {
  const fireTop = fire?.kind === "couch" ? 196 : 202;
  return (
    <svg viewBox="0 0 360 250" className="w-full h-auto select-none touch-manipulation" role="img" aria-label="Room with five ceiling sprinklers and a fire">
      <SprayDefs />
      {/* Above-ceiling space with the branch line */}
      <rect x={0} y={0} width={360} height={30} fill="#d9d2c0" />
      <line x1={0} y1={15} x2={360} y2={15} stroke={PIPE_RED} strokeWidth={7} />
      {HEADS.map((x) => (
        <line key={x} x1={x} y1={15} x2={x} y2={HEAD_Y} stroke={PIPE_RED} strokeWidth={4} />
      ))}
      <rect x={0} y={30} width={360} height={8} fill="#ece4d2" stroke="#cbbf9f" strokeWidth={1} />

      {/* Room */}
      <rect x={0} y={38} width={360} height={FLOOR_Y - 38} fill="#f7efdc" />
      <rect x={300} y={128} width={44} height={98} fill="#d6c7a8" stroke="#a8977a" strokeWidth={1.5} />
      <circle cx={308} cy={180} r={2.5} fill="#8a7a5c" />
      <rect x={24} y={88} width={52} height={36} fill="#fff" stroke="#a8977a" strokeWidth={2} />
      <path d="M28,120 L42,104 L52,114 L60,106 L72,120 Z" fill="#a7c4a0" />
      <rect x={0} y={FLOOR_Y} width={360} height={250 - FLOOR_Y} fill="#cbbf9f" />
      <line x1={0} y1={FLOOR_Y} x2={360} y2={FLOOR_Y} stroke="#a8977a" strokeWidth={2} />

      {/* Fire */}
      {fire && (
        <g>
          {fire.kind === "basket" ? (
            <path
              d={`M${fire.x - 13},${fireTop} L${fire.x + 13},${fireTop} L${fire.x + 10},${FLOOR_Y} L${fire.x - 10},${FLOOR_Y} Z`}
              fill="#6b7280"
              stroke="#374151"
              strokeWidth={1.2}
            />
          ) : (
            <g>
              <rect x={fire.x - 46} y={fireTop} width={92} height={24} rx={6} fill="#7c5a3a" />
              <rect x={fire.x - 50} y={fireTop - 12} width={14} height={36} rx={5} fill="#6b4a2e" />
              <rect x={fire.x + 36} y={fireTop - 12} width={14} height={36} rx={5} fill="#6b4a2e" />
              <rect x={fire.x - 36} y={fireTop - 22} width={72} height={16} rx={5} fill="#8b6844" />
            </g>
          )}
          {fire.state !== "out" &&
            (fire.kind === "basket" ? (
              <Flames x={fire.x} y={fireTop + 2} size={fire.state === "big" ? 1.35 : 0.85} />
            ) : (
              <>
                <Flames x={fire.x - 20} y={fireTop - 4} size={fire.state === "big" ? 1.4 : 0.9} />
                <Flames x={fire.x + 20} y={fireTop - 4} size={fire.state === "big" ? 1.3 : 0.8} />
              </>
            ))}
          {fire.state === "out" && <Smoke x={fire.x} y={fireTop} />}
          {heat && fire.state !== "out" && (
            <Heat x={fire.x} y1={fireTop - 40} y2={HEAD_Y + 46} width={fire.kind === "couch" ? 60 : 28} />
          )}
        </g>
      )}

      {/* Sprinklers */}
      {HEADS.map((x, i) => {
        const isOpen = open.includes(i);
        const isSelected = selected.includes(i);
        const isWrong = wrongHead?.i === i;
        return (
          <g key={x}>
            {isSelected && !isOpen && (
              <circle cx={x} cy={HEAD_Y + 16} r={22} fill="#fb923c" fillOpacity={0.18} stroke="#ea580c" strokeWidth={2.5} />
            )}
            <g key={isWrong ? wrongHead!.key : x} className={isWrong ? "academy-shake" : undefined}>
              <MiniHead x={x} y={HEAD_Y} scale={1.5} open={isOpen} />
            </g>
            {isOpen && (
              <>
                <circle cx={x} cy={HEAD_Y + 18} r={14} fill="#fde68a" className="academy-ping" style={{ animationIterationCount: 1, animationFillMode: "forwards" }} />
                <Spray x={x} y={HEAD_Y + 33} length={FLOOR_Y - HEAD_Y - 35} spread={58} />
              </>
            )}
            {tappable && (
              <rect
                x={x - 26}
                y={HEAD_Y - 6}
                width={52}
                height={60}
                fill="#000"
                fillOpacity={0}
                role="button"
                tabIndex={0}
                aria-label={`Sprinkler ${i + 1}${isSelected ? ", selected" : ""}`}
                className="cursor-pointer outline-none"
                onClick={() => onTap(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onTap(i);
                  }
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function BulbLineup({ highlight, boiler }: { highlight: string | null; boiler: boolean }) {
  const bulbs = boiler ? BULB_CHART.filter((b) => ["Red", "Green", "Blue"].includes(b.name)) : BULB_CHART;
  const gap = 360 / bulbs.length;
  return (
    <svg viewBox={boiler ? "0 0 360 200" : "0 0 360 170"} className="w-full h-auto" role="img" aria-label="Sprinkler bulbs in different colors">
      {boiler && (
        <g>
          <rect x={14} y={14} width={110} height={40} rx={8} fill="#fee2e2" stroke="#f87171" />
          <text x={69} y={40} textAnchor="middle" fontSize={15} fontWeight={800} fill="#b91c1c">
            130°F ceiling
          </text>
          <rect x={250} y={60} width={86} height={120} rx={10} fill="#9ca3af" stroke="#4b5563" strokeWidth={2} />
          <text x={293} y={128} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1f2937">
            BOILER
          </text>
          <Heat x={293} y1={60} y2={20} width={36} />
        </g>
      )}
      {bulbs.map((b, i) => {
        const cx = boiler ? 60 + i * 70 : gap * i + gap / 2;
        const isHi = highlight === b.color;
        const s = isHi ? 1.35 : 1;
        return (
          <g key={b.name} transform={`translate(${cx} ${boiler ? 120 : 98}) scale(${s})`}>
            {isHi && <path d="M-8,-62 L8,-62 L0,-50 Z" fill="#ea580c" />}
            <rect x={-8} y={-40} width={16} height={80} rx={8} fill={b.color} stroke="#1f2937" strokeWidth={1.4} />
            <rect x={-4.5} y={-32} width={3} height={58} rx={1.5} fill="#fff" opacity={0.55} />
            <circle cx={2} cy={-30} r={2.6} fill="#fff" opacity={0.8} />
          </g>
        );
      })}
    </svg>
  );
}

function BulbOption({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="inline-block w-3 h-8 rounded-full border border-gray-800" style={{ background: color }} />
      {label}
    </span>
  );
}

function BulbChart() {
  return (
    <ul className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
      {BULB_CHART.map((b) => (
        <li key={b.name} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1.5 text-sm">
          <span className="inline-block w-2.5 h-6 rounded-full border border-gray-800" style={{ background: b.color }} />
          <span className="font-semibold text-gray-900">{b.temp}</span>
          <span className="text-gray-500">{b.name}</span>
        </li>
      ))}
    </ul>
  );
}
