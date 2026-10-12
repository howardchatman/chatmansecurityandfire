"use client";

import { useState } from "react";
import { BULB, PIPE_RED, Spray, SprayDefs } from "../art";
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

type PartId = "pipe" | "frame" | "bulb" | "deflector";

const PARTS: Record<PartId, { name: string; fact: string }> = {
  pipe: {
    name: "Supply pipe",
    fact: "In a wet-pipe system, the most common kind, this pipe is full of pressurized water around the clock. The moment the head opens, the water is already there. Nobody has to flip a switch.",
  },
  frame: {
    name: "Frame",
    fact: "The two arms hold the glass bulb tight against a seal over the opening. As long as the bulb is in one piece, the water can't get out.",
  },
  bulb: {
    name: "Glass bulb",
    fact: "The bulb is the trigger. It's filled with a liquid that expands as it heats up. At the bulb's rated temperature the glass shatters, the seal drops out, and water flows.",
  },
  deflector: {
    name: "Deflector",
    fact: "Water leaves the head as a solid stream. The notched deflector breaks it into a spray that covers the floor below. A bent deflector means a bad spray pattern, so the head gets replaced.",
  },
};

const QUESTION = {
  text: "So what actually breaks the bulb?",
  options: [
    "Smoke reaching the sprinkler",
    "A signal from the fire alarm panel",
    "Heat: the liquid inside expands until the glass shatters",
    "The fire department turning on the water",
  ],
  answer: 2,
  fact: "Sprinklers react to heat at their own location, nothing else. Smoke detectors belong to the fire alarm system, which is separate. That's why burnt popcorn can set off the alarm but never the sprinklers.",
};

const LABELS: Record<PartId, { px: number; py: number; lx: number; ly: number; text: string }> = {
  pipe: { px: 250, py: 39, lx: 316, ly: 16, text: "SUPPLY PIPE" },
  frame: { px: 141, py: 185, lx: 196, ly: 166, text: "FRAME" },
  bulb: { px: 115, py: 200, lx: 196, ly: 206, text: "GLASS BULB" },
  deflector: { px: 162, py: 246, lx: 196, ly: 250, text: "DEFLECTOR" },
};

export default function Anatomy({ onFinish, onExit }: LevelProps) {
  const [order] = useState(() => shuffle(Object.keys(PARTS) as PartId[]));
  const total = order.length + 1;
  const [step, setStep] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [found, setFound] = useState<PartId[]>([]);
  const [wrong, setWrong] = useState<{ part: PartId; key: number } | null>(null);
  const [sheet, setSheet] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const target = order[step] as PartId | undefined;
  const onQuestion = step === order.length;

  const tap = (part: PartId) => {
    if (!target || sheet) return;
    if (part === target) {
      setScore((s) => s + stepPoints(misses));
      setFound((f) => [...f, part]);
      setWrong(null);
      setSheet(true);
    } else {
      setMisses((m) => m + 1);
      setWrong({ part, key: Date.now() });
    }
  };

  const next = () => {
    setSheet(false);
    setMisses(0);
    setWrong(null);
    if (onQuestion) {
      onFinish({ score, max: total * 100 });
    } else {
      setStep((s) => s + 1);
    }
  };

  const answer = (i: number) => {
    setPicked(i);
    if (i === QUESTION.answer) setScore((s) => s + 100);
    // Let the bulb burst and the spray start before the explanation slides up.
    setTimeout(() => setSheet(true), 1100);
  };

  return (
    <div>
      <LevelHeader title="Anatomy of a Sprinkler" step={step} total={total} score={score} onExit={onExit} />

      {onQuestion ? (
        <Prompt sub="Every head in a building works the same way.">{QUESTION.text}</Prompt>
      ) : (
        <Prompt sub={misses >= 2 ? "Hint: look for the pulsing part." : "Tap it on the drawing."}>
          Tap the <span className="text-orange-600">{PARTS[target!].name.toUpperCase()}</span>
        </Prompt>
      )}

      <div className="grid md:grid-cols-[1fr_1fr] gap-4 items-start">
        <div className="rounded-2xl bg-white/70 border border-orange-200/70 p-2 shadow-sm">
          <SprinklerArt
            onTap={tap}
            found={found}
            wrong={wrong}
            hint={!onQuestion && misses >= 2 ? target! : null}
            burst={picked !== null}
            interactive={!onQuestion && !sheet}
          />
        </div>
        <div>
          {onQuestion && (
            <Choices options={QUESTION.options} answer={QUESTION.answer} picked={picked} onPick={answer} />
          )}
          {!onQuestion && wrong && (
            <Nudge key={wrong.key} tone="wrong">
              Not quite. That&apos;s the {PARTS[wrong.part].name.toLowerCase()}. Try again.
            </Nudge>
          )}
          {!onQuestion && found.length > 0 && (
            <ul className="mt-3 space-y-2 hidden md:block">
              {found.map((p) => (
                <li key={p} className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm">
                  <span className="font-bold text-gray-900">{PARTS[p].name}.</span>{" "}
                  <span className="text-gray-600">{PARTS[p].fact}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {sheet && <SheetSpacer />}

      <FeedbackSheet
        open={sheet}
        tone={onQuestion ? (picked === QUESTION.answer ? "right" : "wrong") : "right"}
        title={
          onQuestion
            ? picked === QUESTION.answer
              ? "Right: heat, and only heat"
              : "It's heat, and only heat"
            : `${PARTS[target!].name}${misses === 0 ? ", first try!" : ""}`
        }
        actionLabel={onQuestion ? "Finish level" : "Next part"}
        onAction={next}
      >
        {onQuestion ? QUESTION.fact : PARTS[target!].fact}
      </FeedbackSheet>
    </div>
  );
}

function SprinklerArt({
  onTap,
  found,
  wrong,
  hint,
  burst,
  interactive,
}: {
  onTap: (part: PartId) => void;
  found: PartId[];
  wrong: { part: PartId; key: number } | null;
  hint: PartId | null;
  burst: boolean;
  interactive: boolean;
}) {
  const leftArm = "M99,142 C73,156 71,212 103,232";
  const rightArm = "M121,142 C147,156 149,212 117,232";

  // Notches cut into the deflector plate.
  const notches = Array.from({ length: 12 }, (_, i) => 62 + i * 8.6);

  // Hit areas, drawn once for tapping and again as highlight overlays.
  const shapes: Record<PartId, React.ReactNode> = {
    frame: (
      <>
        <path d={leftArm} strokeWidth={24} fill="none" strokeLinecap="round" />
        <path d={rightArm} strokeWidth={24} fill="none" strokeLinecap="round" />
        <rect x={88} y={100} width={44} height={44} rx={6} />
      </>
    ),
    bulb: <rect x={98} y={142} width={24} height={82} rx={12} />,
    deflector: <rect x={50} y={232} width={120} height={24} rx={8} />,
    pipe: (
      <>
        <rect x={0} y={20} width={320} height={38} rx={4} />
        <rect x={94} y={52} width={32} height={32} />
      </>
    ),
  };

  const overlay = (part: PartId, color: string, extra?: string, key?: number) => (
    <g key={key} className={extra} fill={color} stroke={color} pointerEvents="none" opacity={0.45}>
      {shapes[part]}
    </g>
  );

  return (
    <svg viewBox="0 0 320 340" className="w-full h-auto max-h-[44svh] md:max-h-[60svh] select-none touch-manipulation" role="img" aria-label="Pendent fire sprinkler head on its supply pipe">
      <SprayDefs />
      <defs>
        <linearGradient id="anat-pipe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef5350" />
          <stop offset="0.45" stopColor={PIPE_RED} />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="anat-brass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8841c" />
          <stop offset="0.4" stopColor="#f1d27a" />
          <stop offset="1" stopColor="#8a6d12" />
        </linearGradient>
        <linearGradient id="anat-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b7280" />
          <stop offset="0.45" stopColor="#e5e7eb" />
          <stop offset="1" stopColor="#6b7280" />
        </linearGradient>
        <linearGradient id="anat-bulb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9f1239" />
          <stop offset="0.45" stopColor={BULB.red} />
          <stop offset="1" stopColor="#881337" />
        </linearGradient>
      </defs>

      {/* Supply pipe and drop */}
      <rect x={0} y={26} width={320} height={26} fill="url(#anat-pipe)" />
      <rect x={92} y={22} width={36} height={34} rx={4} fill="url(#anat-pipe)" stroke="#7f1d1d" strokeWidth={1} />
      <rect x={99} y={52} width={22} height={34} fill="url(#anat-pipe)" />

      {/* Ceiling and escutcheon */}
      <rect x={0} y={84} width={320} height={14} fill="#ece4d2" stroke="#cbbf9f" strokeWidth={1} />
      <path d="M78,106 L84,98 L136,98 L142,106 Z" fill="url(#anat-steel)" stroke="#4b5563" strokeWidth={0.8} />

      {/* Threaded body and wrench boss */}
      <rect x={97} y={106} width={26} height={22} fill="url(#anat-brass)" stroke="#6b5310" strokeWidth={0.8} />
      {[110, 115, 120, 125].map((y) => (
        <line key={y} x1={97} y1={y} x2={123} y2={y - 2} stroke="#6b5310" strokeWidth={0.8} />
      ))}
      <rect x={91} y={128} width={38} height={14} rx={2} fill="url(#anat-brass)" stroke="#6b5310" strokeWidth={0.8} />
      <line x1={104} y1={128} x2={104} y2={142} stroke="#6b5310" strokeWidth={0.7} />
      <line x1={116} y1={128} x2={116} y2={142} stroke="#6b5310" strokeWidth={0.7} />

      {/* Frame arms */}
      <path d={leftArm} stroke="#4b5563" strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d={rightArm} stroke="#4b5563" strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d={leftArm} stroke="url(#anat-steel)" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={rightArm} stroke="url(#anat-steel)" strokeWidth={8} fill="none" strokeLinecap="round" />

      {/* Seal cap, bulb, and compression screw */}
      <rect x={102} y={142} width={16} height={6} rx={1.5} fill="url(#anat-steel)" stroke="#4b5563" strokeWidth={0.6} />
      {burst ? (
        <g fill="#fecdd3" stroke="#be123c" strokeWidth={0.6}>
          <path d="M84,170 l8,-6 l3,9z" />
          <path d="M134,182 l-7,-4 l-1,9z" />
          <path d="M92,210 l6,2 l-4,6z" />
          <path d="M128,206 l-5,5 l7,2z" />
        </g>
      ) : (
        <g>
          <rect x={103.5} y={148} width={13} height={74} rx={6.5} fill="url(#anat-bulb)" stroke="#7f1d1d" strokeWidth={0.8} />
          <rect x={106} y={154} width={2.6} height={56} rx={1.3} fill="#fff" opacity={0.55} />
          <circle cx={112} cy={156} r={2.4} fill="#fecdd3" opacity={0.9} />
        </g>
      )}
      <rect x={104} y={222} width={12} height={18} rx={2} fill="url(#anat-steel)" stroke="#4b5563" strokeWidth={0.6} />

      {/* Deflector */}
      <rect x={58} y={240} width={104} height={8} rx={2} fill="url(#anat-steel)" stroke="#374151" strokeWidth={0.8} />
      {notches.map((x) => (
        <rect key={x} x={x} y={243} width={2.4} height={5} fill="#374151" />
      ))}

      {burst && <Spray x={110} y={250} length={92} spread={150} />}

      {/* Callout labels for parts already found */}
      {found.map((p) => {
        const l = LABELS[p];
        const anchor = p === "pipe" ? "end" : "start";
        return (
          <g key={p} pointerEvents="none">
            {p !== "pipe" && (
              <>
                <line x1={l.px} y1={l.py} x2={l.lx - 4} y2={l.ly - 4} stroke="#111827" strokeWidth={1.4} />
                <circle cx={l.px} cy={l.py} r={3} fill="#111827" />
              </>
            )}
            <text
              x={l.lx}
              y={l.ly}
              textAnchor={anchor}
              fontSize={13}
              fontWeight={800}
              fill="#111827"
              stroke="#fbf6ea"
              strokeWidth={4}
              paintOrder="stroke"
              letterSpacing={0.4}
            >
              {l.text}
            </text>
          </g>
        );
      })}

      {/* Feedback overlays */}
      {wrong && overlay(wrong.part, "#ef4444", "academy-shake", wrong.key)}
      {hint && overlay(hint, "#f97316", "animate-pulse")}

      {/* Tap targets, topmost so every part is easy to hit */}
      {interactive && (
        <g fill="#000" fillOpacity={0} stroke="#000" strokeOpacity={0}>
          {(["frame", "pipe", "deflector", "bulb"] as PartId[]).map((p, i) => (
            <g
              key={p}
              role="button"
              tabIndex={0}
              aria-label={`Part ${i + 1}`}
              className="cursor-pointer outline-none"
              onClick={() => onTap(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTap(p);
                }
              }}
            >
              {shapes[p]}
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
