"use client";

// Memory-match engine: flip two cards at a time to pair a term with its
// meaning (e.g. "NFPA 25" with "Inspecting and maintaining sprinklers").
// Fewer flips, more points. Courses supply the rounds of pairs.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { FeedbackSheet, LevelHeader, type LevelProps, Nudge, Prompt, SheetSpacer, shuffle } from "../ui";

export type MatchPair = { id: string; term: string; meaning: string; fact: string };

type Card = { key: string; pair: string; side: "term" | "meaning"; text: string };

function deal(pairs: MatchPair[]): Card[] {
  return shuffle(
    pairs.flatMap((p) => [
      { key: `${p.id}-t`, pair: p.id, side: "term" as const, text: p.term },
      { key: `${p.id}-m`, pair: p.id, side: "meaning" as const, text: p.meaning },
    ]),
  );
}

/** Points for a round: full marks for a perfect memory, down to 30%. */
function roundScore(pairs: number, moves: number) {
  return Math.max(pairs * 30, pairs * 100 - Math.max(0, moves - pairs) * 20);
}

export default function MatchLevel({
  onFinish,
  onExit,
  title,
  prompt,
  rounds,
}: LevelProps & { title: string; prompt: string; rounds: { name: string; pairs: MatchPair[] }[] }) {
  const [r, setR] = useState(0);
  const [cards, setCards] = useState(() => deal(rounds[0].pairs));
  const [up, setUp] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [banked, setBanked] = useState(0);
  const [last, setLast] = useState<{ pair: MatchPair; ok: boolean; key: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const round = rounds[r];
  const totalPairs = rounds.reduce((s, x) => s + x.pairs.length, 0);
  const pairsBefore = rounds.slice(0, r).reduce((s, x) => s + x.pairs.length, 0);
  const roundDone = matched.length === round.pairs.length;
  const live = roundDone ? roundScore(round.pairs.length, moves) : 0;
  const pairById = (id: string) => round.pairs.find((p) => p.id === id)!;

  const flip = (card: Card) => {
    if (up.length === 2 || up.includes(card.key) || matched.includes(card.pair)) return;
    const next = [...up, card.key];
    setUp(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((k) => cards.find((c) => c.key === k)!);
    if (a.pair === b.pair) {
      setMatched((m) => [...m, a.pair]);
      setUp([]);
      setLast({ pair: pairById(a.pair), ok: true, key: Date.now() });
    } else {
      setLast(null);
      timer.current = setTimeout(() => setUp([]), 950);
    }
  };

  const next = () => {
    const total = banked + live;
    if (r === rounds.length - 1) {
      onFinish({ score: total, max: totalPairs * 100 });
      return;
    }
    setBanked(total);
    setR(r + 1);
    setCards(deal(rounds[r + 1].pairs));
    setUp([]);
    setMatched([]);
    setMoves(0);
    setLast(null);
  };

  return (
    <div>
      <LevelHeader
        title={title}
        step={pairsBefore + matched.length}
        total={totalPairs}
        score={banked + live}
        onExit={onExit}
      />
      <div className="flex items-start justify-between gap-3">
        <Prompt sub={`${round.name} · Round ${r + 1} of ${rounds.length}. Fewer flips, more points.`}>{prompt}</Prompt>
        <div className="flex-shrink-0 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-800 tabular-nums">
          {moves} {moves === 1 ? "try" : "tries"}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl">
        {cards.map((c) => {
          const isMatched = matched.includes(c.pair);
          const isUp = isMatched || up.includes(c.key);
          return (
            <button
              key={c.key}
              onClick={() => flip(c)}
              aria-label={isUp ? c.text : "Face-down card"}
              className="relative h-24 sm:h-28 [perspective:800px]"
            >
              <motion.div
                className="absolute inset-0 [transform-style:preserve-3d]"
                initial={false}
                animate={{ rotateY: isUp ? 180 : 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* Back of the card */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 border-2 border-orange-700 shadow-sm flex items-center justify-center [backface-visibility:hidden]">
                  <span className="text-white/90 font-black tracking-widest text-xs">NFPA</span>
                </div>
                {/* Face of the card */}
                <div
                  className={`absolute inset-0 rounded-xl border-2 shadow-sm flex items-center justify-center p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    isMatched ? "bg-green-50 border-green-500" : "bg-white border-orange-400"
                  }`}
                >
                  {c.side === "term" ? (
                    <span className="text-lg sm:text-xl font-black text-orange-700 leading-tight">{c.text}</span>
                  ) : (
                    <span className="text-[11px] sm:text-xs font-bold text-gray-800 leading-snug">{c.text}</span>
                  )}
                  {isMatched && <Check className="absolute top-1 right-1 w-4 h-4 text-green-600" />}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>

      {last?.ok && !roundDone && (
        <Nudge key={last.key} tone="right">
          <strong>{last.pair.term}:</strong> {last.pair.fact}
        </Nudge>
      )}

      {roundDone && <SheetSpacer />}

      <FeedbackSheet
        open={roundDone}
        tone="right"
        title={`${round.name}: matched in ${moves} tries`}
        actionLabel={r === rounds.length - 1 ? "Finish level" : "Next round"}
        onAction={next}
      >
        <ul className="space-y-1.5">
          {round.pairs.map((p) => (
            <li key={p.id} className="text-sm">
              <span className="font-black text-orange-700">{p.term}</span> <span className="text-gray-700">{p.fact}</span>
            </li>
          ))}
        </ul>
      </FeedbackSheet>
    </div>
  );
}
