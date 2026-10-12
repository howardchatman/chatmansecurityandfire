"use client";

// Multiple-choice level engine: one question at a time, an optional picture
// beside it, and an explanation after every answer. Courses supply the data.

import { useState } from "react";
import { Choices, FeedbackSheet, LevelHeader, type LevelProps, Prompt, SheetSpacer, shuffle } from "../ui";

export type QuizQuestion = {
  prompt: string;
  sub?: string;
  /** Picture shown beside the choices; told whether the question is answered. */
  visual?: (answered: boolean) => React.ReactNode;
  /** Per-question options. Falls back to the level's shared options. */
  options?: React.ReactNode[];
  answer: number;
  right?: string;
  wrong?: string;
  explain: React.ReactNode;
};

export default function QuizLevel({
  onFinish,
  onExit,
  title,
  questions,
  options,
  columns = 1,
  shuffleQuestions = true,
}: LevelProps & {
  title: string;
  questions: QuizQuestion[];
  options?: React.ReactNode[];
  columns?: 1 | 2 | 3;
  shuffleQuestions?: boolean;
}) {
  const [deck] = useState(() => (shuffleQuestions ? shuffle(questions) : questions));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const q = deck[i];
  const opts = q.options ?? options ?? [];
  const answered = picked !== null;
  const right = picked === q.answer;

  const pick = (n: number) => {
    setPicked(n);
    if (n === q.answer) setScore((s) => s + 100);
  };

  const next = () => {
    if (i === deck.length - 1) {
      onFinish({ score, max: deck.length * 100 });
      return;
    }
    setPicked(null);
    setI(i + 1);
  };

  return (
    <div>
      <LevelHeader title={title} step={i} total={deck.length} score={score} onExit={onExit} />
      <Prompt sub={q.sub}>{q.prompt}</Prompt>

      <div className={q.visual ? "grid md:grid-cols-2 gap-4 items-start" : "max-w-xl"}>
        {q.visual && (
          <div key={i} className="rounded-2xl bg-white/70 border border-orange-200/70 p-2 shadow-sm">
            {q.visual(answered)}
          </div>
        )}
        <Choices key={`c${i}`} options={opts} answer={q.answer} picked={picked} onPick={pick} columns={columns} />
      </div>

      {answered && <SheetSpacer />}

      <FeedbackSheet
        open={answered}
        tone={right ? "right" : "wrong"}
        title={right ? (q.right ?? "Correct!") : (q.wrong ?? "Not quite")}
        actionLabel={i === deck.length - 1 ? "Finish level" : "Next"}
        onAction={next}
      >
        {q.explain}
      </FeedbackSheet>
    </div>
  );
}
