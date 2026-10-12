"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, Search, Timer } from "lucide-react";
import { MiniHead, PIPE_RED } from "../art";
import { FeedbackSheet, LevelHeader, type LevelProps, Nudge, Prompt, SheetSpacer } from "../ui";

const TIME_LIMIT = 90;

type Hit = { kind: "rect"; x: number; y: number; w: number; h: number } | { kind: "circle"; cx: number; cy: number; r: number };

type Violation = { id: string; title: string; body: string; code: string; hit: Hit; mark: { x: number; y: number } };

const VIOLATIONS: Violation[] = [
  {
    id: "valve",
    title: "Control valve shut",
    body: "Someone closed the valve for a repair and never reopened it. In a fire, the heads would open with no water behind them. A shut valve is the leading reason sprinklers fail to operate in fires. Valves must be locked open or supervised by the alarm panel.",
    code: "NFPA 25",
    hit: { kind: "rect", x: 4, y: 236, w: 94, h: 72 },
    mark: { x: 44, y: 268 },
  },
  {
    id: "storage",
    title: "Storage too close to a sprinkler",
    body: "Keep stock at least 18 inches below sprinkler deflectors (some warehouse heads need 36). Boxes stacked to the ceiling block the spray right where it's needed.",
    code: "NFPA 13 & 25",
    hit: { kind: "rect", x: 198, y: 54, w: 84, h: 298 },
    mark: { x: 240, y: 110 },
  },
  {
    id: "painted",
    title: "Painted sprinkler head",
    body: "Paint can glue the parts shut or insulate the bulb so the head opens late, or never. Painted heads can't be cleaned. They have to be replaced.",
    code: "NFPA 25",
    hit: { kind: "circle", cx: 161, cy: 70, r: 20 },
    mark: { x: 160, y: 70 },
  },
  {
    id: "hanging",
    title: "Sign hanging from the sprinkler pipe",
    body: "Sprinkler pipe isn't a hanger. Added weight strains the pipe hangers and fittings, and the sign can block the spray. Nothing gets tied to sprinkler pipe, not even light decorations.",
    code: "NFPA 25",
    hit: { kind: "rect", x: 94, y: 42, w: 56, h: 86 },
    mark: { x: 123, y: 110 },
  },
  {
    id: "extinguisher",
    title: "Fire extinguisher missing",
    body: "The sign and bracket are there, but the extinguisher isn't. Extinguishers have to stay mounted in their spot, charged, visible, and checked every month.",
    code: "NFPA 10",
    hit: { kind: "rect", x: 100, y: 192, w: 62, h: 106 },
    mark: { x: 130, y: 258 },
  },
  {
    id: "exit",
    title: "Exit door blocked",
    body: "Exits and the path to them have to stay clear at all times. A pallet of boxes in front of this door could trap people in a fire.",
    code: "International Fire Code",
    hit: { kind: "rect", x: 280, y: 220, w: 76, h: 134 },
    mark: { x: 318, y: 300 },
  },
];

const DECOYS: { id: string; note: string; hit: Hit }[] = [
  { id: "gauge", note: "The gauge shows normal pressure. Nothing wrong there.", hit: { kind: "circle", cx: 50, cy: 150, r: 20 } },
  { id: "exit-sign", note: "The exit sign is lit. That one passes.", hit: { kind: "rect", x: 288, y: 188, w: 62, h: 30 } },
  { id: "pull", note: "The pull station is visible and clear. That one passes.", hit: { kind: "rect", x: 166, y: 238, w: 30, h: 40 } },
  { id: "head-1", note: "That head is clean, unpainted, and has clearance. It passes.", hit: { kind: "circle", cx: 80, cy: 70, r: 20 } },
  { id: "head-4", note: "That head is clean, unpainted, and has clearance. It passes.", hit: { kind: "circle", cx: 320, cy: 70, r: 20 } },
];

export default function Inspector({ onFinish, onExit }: LevelProps) {
  const [found, setFound] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [sheetState, setSheet] = useState<{ kind: "found"; v: Violation } | { kind: "summary" } | null>(null);
  const [missMark, setMissMark] = useState<{ x: number; y: number; key: number; note: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const allFound = found.length === VIOLATIONS.length;
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
  const timeBonus = allFound ? Math.round((100 * Math.max(0, timeLeft)) / TIME_LIMIT) : 0;
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
    const v = VIOLATIONS.find((v) => inside(v.hit, x, y));
    if (v) {
      if (found.includes(v.id)) return;
      setFound((f) => [...f, v.id]);
      setMissMark(null);
      setSheet({ kind: "found", v });
      return;
    }
    const decoy = DECOYS.find((d) => inside(d.hit, x, y));
    setMisses((m) => m + 1);
    setMissMark({ x, y, key: Date.now(), note: decoy ? decoy.note : "Nothing wrong there. Keep looking." });
  };

  const closeSheet = () => {
    if (sheet?.kind === "summary") {
      onFinish({ score, max: VIOLATIONS.length * 100 + 100 });
      return;
    }
    setSheet(allFound ? { kind: "summary" } : null);
  };

  const mins = Math.floor(Math.max(0, timeLeft) / 60);
  const secs = String(Math.max(0, timeLeft) % 60).padStart(2, "0");

  return (
    <div>
      <LevelHeader title="Inspector Mode" step={found.length} total={VIOLATIONS.length} score={score} onExit={onExit} />

      <div className="flex items-start justify-between gap-3">
        <Prompt sub="Tap anything that would get written up. Wrong taps cost 10 points.">
          Find the {VIOLATIONS.length} violations
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
            viewBox="0 0 360 420"
            className={`w-full h-auto max-h-[60svh] select-none touch-manipulation ${running ? "cursor-crosshair" : ""}`}
            onClick={onSceneClick}
            role="img"
            aria-label="Back room of a store with sprinklers, storage, a riser, and an exit door"
          >
            <Scene />
            {VIOLATIONS.map((v) => {
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
            {VIOLATIONS.map((v, i) => {
              const isFound = found.includes(v.id);
              const missed = over && !isFound;
              // List found items in the order they were found, then blanks.
              const shown = isFound || missed;
              return (
                <li
                  key={v.id}
                  style={{ order: isFound ? found.indexOf(v.id) : VIOLATIONS.length + i }}
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
              ? `All ${VIOLATIONS.length} found with ${Math.max(0, timeLeft)}s to spare!`
              : `Time's up: ${found.length} of ${VIOLATIONS.length} found`
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

function Box({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#c8955c" stroke="#8a5a2b" strokeWidth={1.5} />
      <rect x={x + w / 2 - 5} y={y} width={10} height={h * 0.35} fill="#e3c08f" opacity={0.8} />
      <line x1={x + 6} y1={y + h - 9} x2={x + 20} y2={y + h - 9} stroke="#8a5a2b" strokeWidth={1.2} />
    </g>
  );
}

function Scene() {
  return (
    <g>
      {/* Deck, wall, floor */}
      <rect x={0} y={0} width={360} height={34} fill="#cfc8b8" />
      {[40, 110, 180, 250, 320].map((x) => (
        <rect key={x} x={x - 3} y={0} width={6} height={34} fill="#b9b19f" />
      ))}
      <rect x={0} y={34} width={360} height={318} fill="#efe6d2" />
      <rect x={0} y={352} width={360} height={68} fill="#c4bcab" />
      <line x1={0} y1={352} x2={360} y2={352} stroke="#9c937f" strokeWidth={2} />
      {[60, 150, 240, 330].map((x) => (
        <line key={x} x1={x} y1={352} x2={x - 30} y2={420} stroke="#b3aa96" strokeWidth={1} />
      ))}

      {/* Riser and main */}
      <path d="M24,352 V48 H360" stroke={PIPE_RED} strokeWidth={8} fill="none" strokeLinejoin="round" />
      {[80, 160, 240, 320].map((x) => (
        <line key={x} x1={x} y1={48} x2={x} y2={57} stroke={PIPE_RED} strokeWidth={4} />
      ))}

      {/* Gauge (fine) */}
      <line x1={24} y1={150} x2={40} y2={150} stroke="#6b7280" strokeWidth={3} />
      <circle cx={50} cy={150} r={11} fill="#fff" stroke="#374151" strokeWidth={2} />
      <path d="M43,154 A8,8 0 0 1 57,154" stroke="#16a34a" strokeWidth={2.5} fill="none" />
      <line x1={50} y1={151} x2={55} y2={145} stroke="#111827" strokeWidth={1.6} strokeLinecap="round" />

      {/* Control valve with a "SHUT" tag (violation) */}
      <rect x={14} y={252} width={20} height={22} rx={4} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
      <line x1={34} y1={263} x2={54} y2={263} stroke="#6b7280" strokeWidth={3} />
      <ellipse cx={56} cy={263} rx={4} ry={12} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
      <path d="M56,275 L64,284" stroke="#374151" strokeWidth={1} />
      <g transform="rotate(8 74 293)">
        <rect x={56} y={283} width={38} height={20} rx={3} fill="#fde047" stroke="#a16207" strokeWidth={1.2} />
        <text x={75} y={297} textAnchor="middle" fontSize={10} fontWeight={900} fill="#b91c1c">
          SHUT
        </text>
      </g>

      {/* Sprinklers: 160 is painted (violation), 240 is buried in boxes (violation) */}
      <MiniHead x={80} y={57} scale={1.3} />
      <MiniHead x={160} y={57} scale={1.3} painted />
      <MiniHead x={240} y={57} scale={1.3} />
      <MiniHead x={320} y={57} scale={1.3} />

      {/* Sign tied to the pipe (violation) */}
      <path d="M104,48 L108,98 M142,48 L138,98" stroke="#4b5563" strokeWidth={1.2} />
      <rect x={98} y={96} width={50} height={26} rx={3} fill="#fde047" stroke="#ca8a04" strokeWidth={1.5} />
      <text x={123} y={114} textAnchor="middle" fontSize={13} fontWeight={900} fill="#dc2626">
        SALE!
      </text>

      {/* Boxes stacked right up to a head (violation) */}
      <Box x={206} y={88} w={68} h={62} />
      <Box x={204} y={150} w={72} h={66} />
      <Box x={202} y={216} w={76} h={68} />
      <Box x={202} y={284} w={76} h={68} />

      {/* Extinguisher sign and an empty bracket (violation) */}
      <rect x={108} y={198} width={46} height={16} rx={2} fill="#dc2626" />
      <text x={131} y={209.5} textAnchor="middle" fontSize={8} fontWeight={800} fill="#fff">
        FIRE EXT.
      </text>
      <path d="M131,216 V228 M126,223 L131,229 L136,223" stroke="#dc2626" strokeWidth={2} fill="none" />
      <rect x={120} y={238} width={22} height={52} rx={8} fill="none" stroke="#b9ad92" strokeWidth={1.5} strokeDasharray="4 3" />
      <path d="M124,244 H138 V252" stroke="#6b7280" strokeWidth={3} fill="none" />

      {/* Pull station (fine) */}
      <rect x={170} y={244} width={22} height={28} rx={3} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.2} />
      <rect x={175} y={256} width={12} height={6} fill="#fff" />

      {/* Exit sign (fine) and blocked exit door (violation) */}
      <rect x={290} y={192} width={58} height={22} rx={3} fill="#fff" stroke="#9ca3af" strokeWidth={1.5} />
      <rect x={290} y={192} width={58} height={22} rx={3} fill="#ef4444" opacity={0.12} />
      <text x={319} y={208} textAnchor="middle" fontSize={13} fontWeight={900} fill="#dc2626" letterSpacing={1.5}>
        EXIT
      </text>
      <rect x={292} y={222} width={54} height={130} fill="#94a3b8" stroke="#475569" strokeWidth={2} />
      <rect x={296} y={282} width={46} height={6} rx={2} fill="#475569" />
      <Box x={288} y={296} w={34} h={42} />
      <Box x={318} y={304} w={34} h={34} />
      <rect x={284} y={338} width={72} height={14} fill="#a16207" />
      {[290, 310, 330, 348].map((x) => (
        <rect key={x} x={x} y={341} width={8} height={8} fill="#713f12" />
      ))}
    </g>
  );
}
