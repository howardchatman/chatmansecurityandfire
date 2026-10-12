"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { FeedbackSheet, LevelHeader, type LevelProps, SheetSpacer, shuffle } from "../ui";

const SECONDS = 15;
const ROUNDS = 10;

export type Statement = { text: string; fact: boolean; why: string };

const STATEMENTS: Statement[] = [
  {
    text: "Smoke from burnt popcorn can set off a fire sprinkler.",
    fact: false,
    why: "Sprinklers react only to heat at the head. Smoke detectors belong to the fire alarm, a separate system. Burnt popcorn can set off the alarm, but never the sprinklers.",
  },
  {
    text: "When one sprinkler opens, all the sprinklers in the building open.",
    fact: false,
    why: "Each head opens on its own when it gets hot. In about 3 out of 4 fires where sprinklers operated, just one opened.",
  },
  {
    text: "On a wet sprinkler system, the main control valve stays open 24/7.",
    fact: true,
    why: "The heads hold the water back, not the valve. It's closed only for repairs, and it's locked or supervised so nobody can leave it shut by accident.",
  },
  {
    text: "Hanging a lightweight sign from sprinkler pipe is fine.",
    fact: false,
    why: "Nothing gets hung from sprinkler pipe. It strains the hangers and fittings and can block the spray.",
  },
  {
    text: "Storage has to stay at least 18 inches below sprinkler heads.",
    fact: true,
    why: "The spray needs room to spread. Some warehouse sprinklers need even more clearance: 36 inches.",
  },
  {
    text: "A sprinkler head with paint on it can be cleaned and put back in service.",
    fact: false,
    why: "Painted heads have to be replaced. Paint can glue the parts or insulate the bulb so it opens late, or not at all.",
  },
  {
    text: "Every sprinkler system needs a fire pump.",
    fact: false,
    why: "Plenty of buildings get enough pressure straight from the city main. A fire pump is added only when the supply can't deliver what the system needs.",
  },
  {
    text: "Fire trucks can pump water into a building's sprinkler system.",
    fact: true,
    why: "That's the job of the Fire Department Connection (FDC) on the outside wall. Keep it visible, capped, and unblocked.",
  },
  {
    text: "Sprinklers cause more water damage than firefighters' hoses would.",
    fact: false,
    why: "A sprinkler hits the fire early with a fraction of the water a fire hose puts out, so there's usually far less water damage.",
  },
  {
    text: "The building owner is responsible for keeping the sprinkler system inspected and maintained.",
    fact: true,
    why: "NFPA 25 puts that on the owner, or a representative like the property manager. That includes regular inspections by a licensed sprinkler company.",
  },
  {
    text: "A red sprinkler bulb opens at about 155°F.",
    fact: true,
    why: "The liquid's color shows the rating: orange 135°F, red 155°F, yellow 175°F, green 200°F, blue 286°F.",
  },
  {
    text: "Buildings with sprinklers should keep spare heads and a sprinkler wrench on site.",
    fact: true,
    why: "NFPA 13 calls for a spare-head cabinet with replacements for each type of head in the building, plus the wrench, so the system can go back in service fast.",
  },
];

type Answer = { said: boolean | null; right: boolean };

export default function MythOrFact(props: LevelProps) {
  return <MythOrFactLevel {...props} title="Myth or Fact" statements={STATEMENTS} />;
}

/** Rapid-fire true/false round. Courses pass their own statements. */
export function MythOrFactLevel({
  onFinish,
  onExit,
  title,
  statements,
}: LevelProps & { title: string; statements: Statement[] }) {
  const [deck] = useState(() => shuffle(statements).slice(0, ROUNDS));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const card = deck[i];

  const decide = useCallback(
    (said: boolean | null) => {
      if (answer) return;
      if (timeout.current) clearTimeout(timeout.current);
      const right = said === card.fact;
      setAnswer({ said, right });
      if (right) {
        setScore((s) => s + 100);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    },
    [answer, card],
  );

  // Each card gets the same time limit; running out counts as a miss.
  useEffect(() => {
    timeout.current = setTimeout(() => decide(null), SECONDS * 1000);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
    // Restart only when the card changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (answer) return;
      const k = e.key.toLowerCase();
      if (k === "m" || e.key === "ArrowLeft") decide(false);
      if (k === "f" || e.key === "ArrowRight") decide(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, decide]);

  const next = () => {
    if (i === deck.length - 1) {
      onFinish({ score, max: deck.length * 100 });
      return;
    }
    setAnswer(null);
    setI(i + 1);
  };

  const verdict = card.fact ? "FACT" : "MYTH";

  return (
    <div>
      <LevelHeader title={title} step={i} total={deck.length} score={score} onExit={onExit} />

      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-500 mb-2 h-7">
          <span>Statement {i + 1}</span>
          {streak >= 2 && (
            <motion.span
              key={streak}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 rounded-full bg-orange-600 text-white px-2.5 py-1 text-xs font-extrabold"
            >
              <Flame className="w-3.5 h-3.5" /> {streak} in a row
            </motion.span>
          )}
        </div>

        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          className="relative rounded-3xl bg-white border-2 border-gray-900 shadow-[6px_6px_0_0_#111827] p-6 sm:p-8 min-h-[190px] flex items-center"
        >
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">&ldquo;{card.text}&rdquo;</p>
          {answer && (
            <motion.div
              initial={{ scale: 2, opacity: 0, rotate: -18 }}
              animate={{ scale: 1, opacity: 1, rotate: -12 }}
              className={`absolute -top-4 -right-2 rounded-lg border-4 px-3 py-1 text-xl font-black tracking-widest bg-white ${
                card.fact ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
              }`}
            >
              {verdict}
            </motion.div>
          )}
        </motion.div>

        <div className="mt-4 h-2 rounded-full bg-gray-200 overflow-hidden">
          {!answer && (
            <motion.div
              key={i}
              className="h-full bg-orange-500"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: SECONDS, ease: "linear" }}
            />
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => decide(false)}
            disabled={!!answer}
            className="rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xl font-black tracking-wider py-5 shadow-[0_5px_0_0_#7f1d1d] active:translate-y-1 active:shadow-[0_1px_0_0_#7f1d1d] transition-all"
          >
            MYTH
          </button>
          <button
            onClick={() => decide(true)}
            disabled={!!answer}
            className="rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xl font-black tracking-wider py-5 shadow-[0_5px_0_0_#14532d] active:translate-y-1 active:shadow-[0_1px_0_0_#14532d] transition-all"
          >
            FACT
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-gray-400 hidden sm:block">Keyboard: M for myth, F for fact</p>
      </div>

      {answer && <SheetSpacer />}

      <FeedbackSheet
        open={!!answer}
        tone={answer?.right ? "right" : "wrong"}
        title={
          answer?.said === null
            ? `Time's up! It's a ${verdict.toLowerCase()}`
            : answer?.right
              ? `Correct, it's a ${verdict.toLowerCase()}`
              : `Nope, it's a ${verdict.toLowerCase()}`
        }
        actionLabel={i === deck.length - 1 ? "Finish level" : "Next statement"}
        onAction={next}
      >
        {card.why}
      </FeedbackSheet>
    </div>
  );
}
