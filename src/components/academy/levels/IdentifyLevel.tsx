"use client";

// Tap-to-identify engine: "Tap the PULL STATION" on a drawing, with a callout
// label for each part found and a closing question. Courses supply the art,
// the hit areas, and the facts.

import { useState } from "react";
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

export type IdentifyPart = {
  id: string;
  name: string;
  fact: string;
  /** Tap area, in the art's coordinates. Also drawn as the highlight. */
  hit: React.ReactNode;
  /** Callout: a dot on the part (px, py) and the label's text position. */
  label: { px: number; py: number; lx: number; ly: number; anchor?: "start" | "end" };
};

export type IdentifyQuestion = {
  text: string;
  sub?: string;
  options: string[];
  answer: number;
  right: string;
  wrong: string;
  fact: string;
};

export default function IdentifyLevel({
  onFinish,
  onExit,
  title,
  parts,
  art,
  viewBox,
  artLabel,
  question,
}: LevelProps & {
  title: string;
  parts: IdentifyPart[];
  art: React.ReactNode;
  viewBox: { w: number; h: number };
  artLabel: string;
  question: IdentifyQuestion;
}) {
  const [order] = useState(() => shuffle(parts));
  const total = order.length + 1;
  const [step, setStep] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<{ id: string; key: number } | null>(null);
  const [sheet, setSheet] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const target = order[step] as IdentifyPart | undefined;
  const onQuestion = step === order.length;
  const byId = (id: string) => parts.find((p) => p.id === id)!;

  const tap = (id: string) => {
    if (!target || sheet) return;
    if (id === target.id) {
      setScore((s) => s + stepPoints(misses));
      setFound((f) => [...f, id]);
      setWrong(null);
      setSheet(true);
    } else {
      setMisses((m) => m + 1);
      setWrong({ id, key: Date.now() });
    }
  };

  const next = () => {
    setSheet(false);
    setMisses(0);
    setWrong(null);
    if (onQuestion) onFinish({ score, max: total * 100 });
    else setStep((s) => s + 1);
  };

  const answer = (i: number) => {
    setPicked(i);
    if (i === question.answer) setScore((s) => s + 100);
    setSheet(true);
  };

  const hint = !onQuestion && misses >= 2 ? target!.id : null;

  return (
    <div>
      <LevelHeader title={title} step={step} total={total} score={score} onExit={onExit} />

      {onQuestion ? (
        <Prompt sub={question.sub}>{question.text}</Prompt>
      ) : (
        <Prompt sub={misses >= 2 ? "Hint: look for the pulsing part." : "Tap it on the drawing."}>
          Tap the <span className="text-orange-600">{target!.name.toUpperCase()}</span>
        </Prompt>
      )}

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="rounded-2xl bg-white/70 border border-orange-200/70 p-2 shadow-sm">
          <svg
            viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
            className="w-full h-auto max-h-[46svh] md:max-h-[62svh] select-none touch-manipulation"
            role="img"
            aria-label={artLabel}
          >
            {art}

            {found.map((id) => {
              const l = byId(id).label;
              return (
                <g key={id} pointerEvents="none">
                  <line x1={l.px} y1={l.py} x2={l.lx} y2={l.ly - 4} stroke="#111827" strokeWidth={1.3} />
                  <circle cx={l.px} cy={l.py} r={2.8} fill="#111827" />
                  <text
                    x={l.lx}
                    y={l.ly}
                    textAnchor={l.anchor ?? "start"}
                    fontSize={11.5}
                    fontWeight={800}
                    fill="#111827"
                    stroke="#fbf6ea"
                    strokeWidth={4}
                    paintOrder="stroke"
                    letterSpacing={0.3}
                  >
                    {byId(id).name.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {wrong && (
              <g key={wrong.key} className="academy-shake" fill="#ef4444" stroke="#ef4444" opacity={0.45} pointerEvents="none">
                {byId(wrong.id).hit}
              </g>
            )}
            {hint && (
              <g className="animate-pulse" fill="#f97316" stroke="#f97316" opacity={0.45} pointerEvents="none">
                {byId(hint).hit}
              </g>
            )}

            {!onQuestion && !sheet && (
              <g fill="#000" fillOpacity={0} stroke="#000" strokeOpacity={0}>
                {parts.map((p, i) => (
                  <g
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Part ${i + 1}`}
                    className="cursor-pointer outline-none"
                    onClick={() => tap(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        tap(p.id);
                      }
                    }}
                  >
                    {p.hit}
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>

        <div>
          {onQuestion && <Choices options={question.options} answer={question.answer} picked={picked} onPick={answer} />}
          {!onQuestion && wrong && (
            <Nudge key={wrong.key} tone="wrong">
              Not quite. That&apos;s the {byId(wrong.id).name.toLowerCase()}. Try again.
            </Nudge>
          )}
          {!onQuestion && found.length > 0 && (
            <ul className="mt-3 space-y-2 hidden md:block">
              {found.map((id) => (
                <li key={id} className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm">
                  <span className="font-bold text-gray-900">{byId(id).name}.</span>{" "}
                  <span className="text-gray-600">{byId(id).fact}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {sheet && <SheetSpacer />}

      <FeedbackSheet
        open={sheet}
        tone={onQuestion ? (picked === question.answer ? "right" : "wrong") : "right"}
        title={
          onQuestion
            ? picked === question.answer
              ? question.right
              : question.wrong
            : `${target!.name}${misses === 0 ? ", first try!" : ""}`
        }
        actionLabel={onQuestion ? "Finish level" : "Next part"}
        onAction={next}
      >
        {onQuestion ? question.fact : target!.fact}
      </FeedbackSheet>
    </div>
  );
}
