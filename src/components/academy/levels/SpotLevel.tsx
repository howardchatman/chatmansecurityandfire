"use client";

// Find-the-violations engine: a tappable scene, a countdown, and an
// explanation for each violation found. Courses supply the scene and data.

import { useEffect, useRef, useState } from "react";
import { CircleCheck, Search, Timer } from "lucide-react";
import { FeedbackSheet, LevelHeader, type LevelProps, Nudge, Prompt, SheetSpacer } from "../ui";

export type Hit =
  | { kind: "rect"; x: number; y: number; w: number; h: number }
  | { kind: "circle"; cx: number; cy: number; r: number };

export type Violation = {
  id: string;
  title: string;
  body: string;
  code: string;
  hit: Hit;
  mark: { x: number; y: number };
};

export type Decoy = { id: string; note: string; hit: Hit };

export default function SpotLevel({
  onFinish,
  onExit,
  title,
  violations,
  decoys,
  scene,
  viewBox,
  sceneLabel,
  timeLimit = 90,
}: LevelProps & {
  title: string;
  violations: Violation[];
  decoys: Decoy[];
  scene: React.ReactNode;
  viewBox: { w: number; h: number };
  sceneLabel: string;
  timeLimit?: number;
}) {
  const [found, setFound] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [sheetState, setSheet] = useState<{ kind: "found"; v: Violation } | { kind: "summary" } | null>(null);
  const [missMark, setMissMark] = useState<{ x: number; y: number; key: number; note: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const allFound = found.length === violations.length;
  const over = timeLeft <= 0 && !allFound;
  // Running out the clock opens the summary on its own.
  const sheet = sheetState ?? (over ? ({ kind: "summary" } as const) : null);
  const running = !over && !sheet && !allFound;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const base = Math.max(0, found.length * 100 - misses * 10);
  const timeBonus = allFound ? Math.round((100 * Math.max(0, timeLeft)) / timeLimit) : 0;
  const score = base + timeBonus;

  const toSvg = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const onSceneClick = (e: React.MouseEvent) => {
    if (!running) return;
    const { x, y } = toSvg(e);
    const v = violations.find((v) => inside(v.hit, x, y));
    if (v) {
      if (found.includes(v.id)) return;
      setFound((f) => [...f, v.id]);
      setMissMark(null);
      setSheet({ kind: "found", v });
      return;
    }
    const decoy = decoys.find((d) => inside(d.hit, x, y));
    setMisses((m) => m + 1);
    setMissMark({ x, y, key: Date.now(), note: decoy ? decoy.note : "Nothing wrong there. Keep looking." });
  };

  const closeSheet = () => {
    if (sheet?.kind === "summary") {
      onFinish({ score, max: violations.length * 100 + 100 });
      return;
    }
    setSheet(allFound ? { kind: "summary" } : null);
  };

  const mins = Math.floor(Math.max(0, timeLeft) / 60);
  const secs = String(Math.max(0, timeLeft) % 60).padStart(2, "0");

  return (
    <div>
      <LevelHeader title={title} step={found.length} total={violations.length} score={score} onExit={onExit} />

      <div className="flex items-start justify-between gap-3">
        <Prompt sub="Tap anything that would get written up. Wrong taps cost 10 points.">
          Find the {violations.length} violations
        </Prompt>
        <div
          className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
            timeLeft <= 15 && running ? "bg-red-600 text-white animate-pulse" : "bg-white border border-gray-200 text-gray-800"
          }`}
          aria-label={`${timeLeft} seconds left`}
        >
          <Timer className="w-4 h-4" />
          {mins}:{secs}
        </div>
      </div>

      <div className="grid md:grid-cols-[3fr_2fr] gap-4 items-start">
        <div className="rounded-2xl bg-white/70 border border-orange-200/70 p-2 shadow-sm">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
            className={`w-full h-auto max-h-[60svh] select-none touch-manipulation ${running ? "cursor-crosshair" : ""}`}
            onClick={onSceneClick}
            role="img"
            aria-label={sceneLabel}
          >
            {scene}
            {violations.map((v) => {
              const isFound = found.includes(v.id);
              const missed = over && !isFound;
              if (!isFound && !missed) return null;
              return (
                <g key={v.id} pointerEvents="none">
                  <circle
                    cx={v.mark.x}
                    cy={v.mark.y}
                    r={22}
                    fill="none"
                    stroke={isFound ? "#16a34a" : "#ea580c"}
                    strokeWidth={4}
                    strokeDasharray={missed ? "6 4" : undefined}
                  />
                  <circle cx={v.mark.x + 16} cy={v.mark.y - 16} r={9} fill={isFound ? "#16a34a" : "#ea580c"} />
                  <text x={v.mark.x + 16} y={v.mark.y - 12.5} textAnchor="middle" fontSize={11} fontWeight={900} fill="#fff">
                    {isFound ? "✓" : "!"}
                  </text>
                </g>
              );
            })}
            {missMark && (
              <g key={missMark.key} pointerEvents="none" className="academy-shake">
                <path
                  d={`M${missMark.x - 8},${missMark.y - 8} L${missMark.x + 8},${missMark.y + 8} M${missMark.x + 8},${missMark.y - 8} L${missMark.x - 8},${missMark.y + 8}`}
                  stroke="#dc2626"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              </g>
            )}
          </svg>
        </div>

        <div>
          {missMark && running && (
            <Nudge key={missMark.key} tone="wrong">
              {missMark.note}
            </Nudge>
          )}
          <ul className="mt-3 grid grid-cols-1 gap-2">
            {violations.map((v, i) => {
              const isFound = found.includes(v.id);
              const missed = over && !isFound;
              // List found items in the order they were found, then blanks.
              const shown = isFound || missed;
              return (
                <li
                  key={v.id}
                  style={{ order: isFound ? found.indexOf(v.id) : violations.length + i }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    isFound
                      ? "bg-green-50 border-green-200 text-green-900 font-semibold"
                      : missed
                        ? "bg-orange-50 border-orange-200 text-orange-900"
                        : "bg-white/60 border-dashed border-gray-300 text-gray-400"
                  }`}
                >
                  {isFound ? <CircleCheck className="w-4 h-4 flex-shrink-0" /> : <Search className="w-4 h-4 flex-shrink-0" />}
                  {shown ? (missed ? `Missed: ${v.title}` : v.title) : "Violation not found yet"}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {sheet && <SheetSpacer />}

      <FeedbackSheet
        open={!!sheet}
        tone={sheet?.kind === "found" ? "right" : allFound ? "right" : "info"}
        title={
          sheet?.kind === "found"
            ? `Found: ${sheet.v.title}`
            : allFound
              ? `All ${violations.length} found with ${Math.max(0, timeLeft)}s to spare!`
              : `Time's up: ${found.length} of ${violations.length} found`
        }
        actionLabel={sheet?.kind === "summary" ? "Finish level" : allFound ? "See results" : "Keep looking"}
        onAction={closeSheet}
      >
        {sheet?.kind === "found" ? (
          <>
            <p>{sheet.v.body}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{sheet.v.code}</p>
          </>
        ) : (
          <>
            <p>
              {allFound
                ? `That's a sharp eye. Time bonus: +${timeBonus}.`
                : "The ones you missed are circled in orange. These are some of the most common write-ups we see on real inspections."}
            </p>
            {misses > 0 && <p className="mt-1 text-sm text-gray-500">Wrong taps: {misses} (−{misses * 10})</p>}
          </>
        )}
      </FeedbackSheet>
    </div>
  );
}

function inside(hit: Hit, x: number, y: number) {
  if (hit.kind === "rect") return x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h;
  return (x - hit.cx) ** 2 + (y - hit.cy) ** 2 <= hit.r ** 2;
}
