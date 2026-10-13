"use client";

// Final exam: 25 questions drawn from every course's question bank and myth
// list, a different mix each time. 80% passes.

import { useState } from "react";
import QuizLevel, { type QuizQuestion } from "../levels/QuizLevel";
import { SPRINKLER_MYTHS, type Statement } from "../levels/MythOrFact";
import { ALARM_EXAM_BANK, ALARM_MYTHS } from "./alarms";
import { EXT_EXAM_BANK, EXT_MYTHS } from "./extinguishers";
import { NFPA_EXAM_BANK } from "./nfpa";
import { type LevelProps, shuffle } from "../ui";

export const EXAM_LENGTH = 25;
export const EXAM_PASS = 0.8;

const SPRINKLER_BANK: QuizQuestion[] = [
  {
    prompt: "What makes a sprinkler head open?",
    options: ["Smoke reaching the head", "Heat at the head", "A signal from the alarm panel", "A manual switch"],
    answer: 1,
    explain: "Each head is its own heat detector. The liquid in the glass bulb expands with heat until the glass breaks.",
    ref: "NFPA 13",
  },
  {
    prompt: "A small fire starts under one sprinkler. How many usually open?",
    options: ["Every head in the building", "Just the one or two closest to the fire", "Every head on that floor"],
    answer: 1,
    explain: "Only heads hot enough open. In about 3 out of 4 fires where sprinklers operated, just one opened.",
  },
  {
    prompt: "A red glass bulb is rated to open at about…",
    options: ["135°F", "155°F", "200°F", "286°F"],
    answer: 1,
    explain: "Orange 135°F, red 155°F, yellow 175°F, green 200°F, blue 286°F.",
    ref: "NFPA 13",
  },
  {
    prompt: "On a wet sprinkler system, the main control valve should normally be…",
    options: ["Closed until there's a fire", "Open, and locked or supervised"],
    answer: 1,
    explain: "The heads hold the water back. A shut valve is the leading reason sprinklers fail to operate in fires.",
    ref: "NFPA 25",
  },
  {
    prompt: "A sprinkler head got paint on it. What happens now?",
    options: ["Wipe it clean", "Replace it", "Leave it if the bulb is clear"],
    answer: 1,
    explain: "Painted, corroded, damaged, or loaded heads get replaced, not cleaned.",
    ref: "NFPA 25",
  },
  {
    prompt: "What does the fire department connection (FDC) do?",
    options: ["Lets fire engines pump extra water into the system", "Shuts the sprinklers off", "Tests the alarm"],
    answer: 0,
    explain: "Firefighters hook hoses to the FDC to boost the water supply. It gets inspected quarterly.",
    ref: "NFPA 25",
  },
  {
    prompt: "What does the flow switch on the riser do?",
    options: ["Senses water moving and signals the fire alarm panel", "Opens the sprinkler heads", "Boosts water pressure"],
    answer: 0,
    explain: "Flowing water means a head opened or a pipe broke, so the panel goes into alarm.",
    ref: "NFPA 72 & NFPA 25",
  },
  {
    prompt: "Where would every sprinkler in an area open at once?",
    options: ["Any office during a big fire", "A deluge system, in places like aircraft hangars", "Never, anywhere"],
    answer: 1,
    explain: "Deluge systems use open heads and release water everywhere at once. Ordinary systems open one head at a time.",
    ref: "NFPA 13",
  },
  {
    prompt: "A mechanical room ceiling regularly reaches 130°F. Which bulb fits?",
    options: ["Red, 155°F", "Green, 200°F", "Blue, 286°F"],
    answer: 1,
    explain: "Ordinary (orange and red) is for ceilings up to 100°F. Intermediate (yellow and green) covers up to 150°F.",
    ref: "NFPA 13",
  },
];

function StatementCard({ text }: { text: string }) {
  return (
    <div className="p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-orange-700">Myth or fact?</div>
      <p className="mt-2 text-xl font-extrabold text-gray-900 leading-snug">&ldquo;{text}&rdquo;</p>
    </div>
  );
}

const fromStatement = (s: Statement): QuizQuestion => ({
  prompt: "Myth or fact?",
  visual: () => <StatementCard text={s.text} />,
  options: ["Myth", "Fact"],
  columns: 2,
  answer: s.fact ? 1 : 0,
  right: s.fact ? "Fact" : "Myth",
  wrong: s.fact ? "It's a fact" : "It's a myth",
  explain: s.why,
  ref: s.ref,
});

const POOLS: QuizQuestion[][] = [
  [...SPRINKLER_BANK, ...SPRINKLER_MYTHS.map(fromStatement)],
  [...ALARM_EXAM_BANK, ...ALARM_MYTHS.map(fromStatement)],
  [...EXT_EXAM_BANK, ...EXT_MYTHS.map(fromStatement)],
  [...NFPA_EXAM_BANK],
];

/** Six from each course, plus one more from anywhere. */
function buildExam(): QuizQuestion[] {
  const picks = POOLS.flatMap((pool) => shuffle(pool).slice(0, 6));
  const rest = POOLS.flat().filter((q) => !picks.includes(q));
  return [...picks, ...shuffle(rest).slice(0, EXAM_LENGTH - picks.length)];
}

export function FinalExam(props: LevelProps) {
  const [questions] = useState(buildExam);
  return <QuizLevel {...props} title="Final Exam" questions={questions} />;
}
