"use client";

// "Dial it in" engine: set a slider to the number the code calls for
// (18 inches, 75 feet, 90 minutes...). Exact earns full points; close earns
// partial credit. Courses supply the questions.

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { CodeRef, FeedbackSheet, LevelHeader, type LevelProps, Prompt, SheetSpacer, shuffle } from "../ui";

export type NumberQuestion = {
  prompt: string;
  sub?: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  answer: number;
  /** Within this much of the answer earns partial credit. */
  tolerance: number;
  explain: string;
  ref?: string;
};

/** A random starting point that's never close to the answer. */
function startFor(q: NumberQuestion) {
  const steps = Math.round((q.max - q.min) / q.step);
  for (let tries = 0; tries < 50; tries++) {
    const v = +(q.min + Math.floor(Math.random() * (steps + 1)) * q.step).toFixed(2);
    if (Math.abs(v - q.answer) > q.tolerance * 2) return v;
  }
  return q.answer - q.min > q.max - q.answer ? q.min : q.max;
}

export default function NumberLevel({
  onFinish,
  onExit,
  title,
  questions,
}: LevelProps & { title: string; questions: NumberQuestion[] }) {
  const [deck] = useState(() => shuffle(questions));
  const [i, setI] = useState(0);
  const [value, setValue] = useState(() => startFor(deck[0]));
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);

  const q = deck[i];
  const diff = Math.abs(value - q.answer);
  const exact = diff === 0;
  const close = !exact && diff <= q.tolerance;
  const pct = (n: number) => ((n - q.min) / (q.max - q.min)) * 100;

  const nudge = (d: number) => setValue((v) => Math.min(q.max, Math.max(q.min, +(v + d).toFixed(2))));

  const lock = () => {
    setLocked(true);
    setScore((s) => s + (exact ? 100 : close ? 60 : 0));
  };

  const next = () => {
    if (i === deck.length - 1) {
      onFinish({ score, max: deck.length * 100 });
      return;
    }
    setLocked(false);
    setI(i + 1);
    setValue(startFor(deck[i + 1]));
  };

  return (
    <div>
      <LevelHeader title={title} step={i} total={deck.length} score={score} onExit={onExit} />
      <Prompt sub={q.sub}>{q.prompt}</Prompt>

      <div className="max-w-xl rounded-2xl bg-white border border-orange-200/70 shadow-sm p-5 sm:p-6">
        <div className="text-center">
          <span className="text-6xl sm:text-7xl font-black text-gray-900 tabular-nums">{value}</span>
          <span className="ml-2 text-2xl font-bold text-gray-500">{q.unit}</span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => nudge(-q.step)}
            disabled={locked}
            aria-label="Decrease"
            className="p-2.5 rounded-full border-2 border-gray-200 text-gray-700 hover:border-orange-400 disabled:opacity-40"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <input
              type="range"
              min={q.min}
              max={q.max}
              step={q.step}
              value={value}
              disabled={locked}
              onChange={(e) => setValue(Number(e.target.value))}
              aria-label={`${q.prompt} (${q.unit})`}
              className="w-full accent-orange-600 h-2 cursor-pointer disabled:cursor-default"
            />
            {locked && (
              <div
                className="absolute -top-7 -translate-x-1/2 rounded-md bg-green-600 text-white text-xs font-bold px-2 py-0.5 whitespace-nowrap"
                style={{ left: `${pct(q.answer)}%` }}
              >
                Code: {q.answer}
              </div>
            )}
          </div>
          <button
            onClick={() => nudge(q.step)}
            disabled={locked}
            aria-label="Increase"
            className="p-2.5 rounded-full border-2 border-gray-200 text-gray-700 hover:border-orange-400 disabled:opacity-40"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-1 flex justify-between px-12 text-xs font-semibold text-gray-400 tabular-nums">
          <span>
            {q.min} {q.unit}
          </span>
          <span>
            {q.max} {q.unit}
          </span>
        </div>

        <button
          onClick={lock}
          disabled={locked}
          className="mt-6 w-full rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3.5 transition-colors"
        >
          Lock it in
        </button>
      </div>

      {locked && <SheetSpacer />}

      <FeedbackSheet
        open={locked}
        tone={exact ? "right" : close ? "info" : "wrong"}
        title={
          exact
            ? `Spot on: ${q.answer} ${q.unit}`
            : close
              ? `Close! It's ${q.answer} ${q.unit} (+60)`
              : `It's ${q.answer} ${q.unit}`
        }
        actionLabel={i === deck.length - 1 ? "Finish level" : "Next"}
        onAction={next}
      >
        {q.explain}
        <CodeRef>{q.ref}</CodeRef>
      </FeedbackSheet>
    </div>
  );
}
