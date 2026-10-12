"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleCheck, CircleX, Info, X } from "lucide-react";

export type LevelResult = { score: number; max: number };

export interface LevelProps {
  onFinish: (result: LevelResult) => void;
  onExit: () => void;
}

/** Points for a step answered after `misses` wrong tries. */
export function stepPoints(misses: number) {
  return misses === 0 ? 100 : misses === 1 ? 50 : 25;
}

export function starsFor(score: number, max: number) {
  const pct = max ? score / max : 0;
  return pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function LevelHeader({
  title,
  step,
  total,
  score,
  onExit,
}: {
  title: string;
  step: number;
  total: number;
  score: number;
  onExit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <button
        onClick={onExit}
        aria-label="Leave level"
        className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 shadow-sm"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <span className="truncate">{title}</span>
          <span className="tabular-nums">
            {Math.min(step + 1, total)}/{total}
          </span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-gray-200/80 overflow-hidden">
          <motion.div
            className="h-full bg-orange-500 rounded-full"
            initial={false}
            animate={{ width: `${(step / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
      <div
        className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-sm font-bold tabular-nums min-w-[3.5rem] text-center"
        aria-label={`Score ${score}`}
      >
        {score}
      </div>
    </div>
  );
}

/** The instruction line above a scene ("Tap the GLASS BULB"). */
export function Prompt({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{children}</h2>
      {sub && <p className="mt-1 text-sm text-gray-600">{sub}</p>}
    </div>
  );
}

/** A short, non-blocking note under the scene, e.g. after a wrong tap. */
export function Nudge({ tone, children }: { tone: "wrong" | "right" | "info"; children: React.ReactNode }) {
  const styles = {
    wrong: "bg-red-50 border-red-200 text-red-800",
    right: "bg-green-50 border-green-200 text-green-800",
    info: "bg-white border-gray-200 text-gray-700",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-3 rounded-xl border px-4 py-2.5 text-sm font-medium ${styles}`}
      role="status"
    >
      {children}
    </motion.div>
  );
}

const sheetTones = {
  right: { box: "border-green-500", head: "text-green-700", Icon: CircleCheck },
  wrong: { box: "border-red-500", head: "text-red-700", Icon: CircleX },
  info: { box: "border-orange-500", head: "text-orange-700", Icon: Info },
};

/** Bottom sheet that explains an answer and moves the level along. */
export function FeedbackSheet({
  open,
  tone,
  title,
  children,
  actionLabel = "Next",
  onAction,
}: {
  open: boolean;
  tone: "right" | "wrong" | "info";
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction: () => void;
}) {
  const t = sheetTones[tone];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", damping: 30, stiffness: 340 }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] print:hidden"
          role="dialog"
          aria-label={title}
        >
          <div className={`mx-auto max-w-xl rounded-2xl border-2 bg-white shadow-2xl p-5 ${t.box}`}>
            <div className={`flex items-center gap-2 font-extrabold text-lg ${t.head}`}>
              <t.Icon className="w-6 h-6 flex-shrink-0" />
              {title}
            </div>
            <div className="mt-2 text-[15px] leading-relaxed text-gray-700 max-h-[38vh] overflow-y-auto">
              {children}
            </div>
            <button
              autoFocus
              onClick={onAction}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 transition-colors"
            >
              {actionLabel}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Multiple-choice answers. Locks once answered and marks right and wrong. */
const choiceColumns = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
};

export function Choices({
  options,
  answer,
  picked,
  onPick,
  columns = 1,
}: {
  options: React.ReactNode[];
  answer: number;
  picked: number | null;
  onPick: (index: number) => void;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div className={`grid gap-2.5 ${choiceColumns[columns]}`}>
      {options.map((opt, i) => {
        const done = picked !== null;
        const isAnswer = i === answer;
        const isPicked = i === picked;
        const style = !done
          ? "bg-white border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-900"
          : isAnswer
            ? "bg-green-50 border-green-500 text-green-900"
            : isPicked
              ? "bg-red-50 border-red-400 text-red-900"
              : "bg-white border-gray-200 text-gray-400";
        return (
          <button
            key={i}
            disabled={done}
            onClick={() => onPick(i)}
            className={`w-full text-left rounded-xl border-2 px-4 py-3.5 font-semibold transition-colors flex items-center gap-3 ${style}`}
          >
            <span className="flex-1">{opt}</span>
            {done && isAnswer && <CircleCheck className="w-5 h-5 text-green-600 flex-shrink-0" />}
            {done && isPicked && !isAnswer && <CircleX className="w-5 h-5 text-red-500 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

/** Space at the bottom of a level so the feedback sheet never hides content. */
export function SheetSpacer() {
  return <div aria-hidden className="h-64" />;
}
