"use client";

// A portable stored-pressure extinguisher and its gauge for the Academy's
// extinguisher course, drawn in the parent <svg>'s coordinates.

export type Needle = "ok" | "low" | "high";

const NEEDLE_ANGLE: Record<Needle, number> = { low: 212, ok: 270, high: 328 };

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  return `M${a.x},${a.y} A${r},${r} 0 0 1 ${b.x},${b.y}`;
}

/** Pressure gauge face: red (recharge) / green / red (overcharged). */
export function GaugeFace({
  cx,
  cy,
  r,
  needle,
  labels = false,
}: {
  cx: number;
  cy: number;
  r: number;
  needle: Needle;
  labels?: boolean;
}) {
  const tip = polar(cx, cy, r * 0.78, NEEDLE_ANGLE[needle]);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#374151" strokeWidth={Math.max(1, r * 0.09)} />
      <path d={arc(cx, cy, r * 0.72, 192, 242)} stroke="#ef4444" strokeWidth={r * 0.2} fill="none" />
      <path d={arc(cx, cy, r * 0.72, 242, 298)} stroke="#22c55e" strokeWidth={r * 0.2} fill="none" />
      <path d={arc(cx, cy, r * 0.72, 298, 348)} stroke="#ef4444" strokeWidth={r * 0.2} fill="none" />
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#111827" strokeWidth={Math.max(0.8, r * 0.08)} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r * 0.1} fill="#111827" />
      {labels && (
        <g fontSize={r * 0.13} fontWeight={800} textAnchor="middle">
          <text x={cx - r * 0.42} y={cy + r * 0.45} fill="#b91c1c">
            RECHARGE
          </text>
          <text x={cx + r * 0.42} y={cy + r * 0.45} fill="#b91c1c">
            OVER
          </text>
          <text x={cx} y={cy - r * 0.25} fill="#15803d">
            OK
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * Extinguisher standing on (x, y), about 190 units tall at s = 1.
 * The hose is either clipped to the side or aimed down and to the right.
 */
export function Extinguisher({
  x,
  y,
  s = 1,
  pin = true,
  seal = true,
  needle = "ok",
  hose = "stowed",
  squeezed = false,
  cracked = false,
  tag = true,
  label = "ABC",
}: {
  x: number;
  y: number;
  s?: number;
  pin?: boolean;
  seal?: boolean;
  needle?: Needle;
  hose?: "stowed" | "aimed";
  squeezed?: boolean;
  cracked?: boolean;
  tag?: boolean;
  label?: string;
}) {
  const hosePath = hose === "stowed" ? "M10,-166 C36,-158 36,-118 31,-72" : "M10,-166 C58,-170 74,-96 100,-74";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Cylinder */}
      <rect x={-24} y={-150} width={48} height={150} rx={14} fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
      <rect x={-16} y={-138} width={6} height={124} rx={3} fill="#fff" opacity={0.25} />
      <rect x={-24} y={-7} width={48} height={7} rx={2} fill="#991b1b" />
      <rect x={-18} y={-110} width={36} height={46} rx={2} fill="#fff" stroke="#e5e7eb" />
      <text x={0} y={-86} textAnchor="middle" fontSize={14} fontWeight={900} fill="#b91c1c">
        {label}
      </text>
      <text x={0} y={-74} textAnchor="middle" fontSize={5.5} fontWeight={800} fill="#6b7280">
        DRY CHEM
      </text>

      {/* Neck, valve, gauge */}
      <rect x={-8} y={-160} width={16} height={11} fill="#9ca3af" stroke="#4b5563" strokeWidth={0.8} />
      <rect x={-13} y={-178} width={26} height={19} rx={3} fill="#d1d5db" stroke="#4b5563" strokeWidth={1} />
      <GaugeFace cx={-3} cy={-168.5} r={7} needle={needle} />

      {/* Carry handle (fixed) and squeeze lever */}
      <line x1={4} y1={-173} x2={42} y2={-169} stroke="#374151" strokeWidth={5} strokeLinecap="round" />
      <line
        x1={4}
        y1={-181}
        x2={42}
        y2={squeezed ? -175 : -192}
        stroke="#4b5563"
        strokeWidth={5}
        strokeLinecap="round"
        style={{ transition: "all 0.35s" }}
      />

      {/* Pin and tamper seal */}
      {pin && (
        <g>
          <line x1={14} y1={-184} x2={14} y2={-170} stroke="#9ca3af" strokeWidth={2} />
          <circle cx={14} cy={-162} r={6} fill="none" stroke="#9ca3af" strokeWidth={2} />
        </g>
      )}
      {seal && <path d="M17,-158 q8,4 12,-10" stroke="#facc15" strokeWidth={2} fill="none" strokeLinecap="round" />}

      {/* Inspection tag */}
      {tag && (
        <g>
          <line x1={-8} y1={-156} x2={-30} y2={-140} stroke="#6b7280" strokeWidth={0.8} />
          <rect x={-44} y={-142} width={22} height={30} rx={2} fill="#fef3c7" stroke="#d97706" strokeWidth={1} />
          <circle cx={-33} cy={-138} r={1.5} fill="#d97706" />
          {[0, 1, 2, 3].map((r) => (
            <line key={r} x1={-41} y1={-131 + r * 5} x2={-25} y2={-131 + r * 5} stroke="#f59e0b" strokeWidth={0.6} />
          ))}
        </g>
      )}

      {/* Hose and nozzle */}
      <path d={hosePath} stroke="#111827" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      {cracked && (
        <g>
          <circle cx={33} cy={-118} r={9} fill="#fecaca" opacity={0.7} />
          <path d="M29,-122 l4,3 l-3,3 l5,3" stroke="#fff" strokeWidth={1.4} fill="none" />
        </g>
      )}
      {hose === "stowed" ? (
        <path d="M28,-74 L34,-74 L36,-56 L26,-56 Z" fill="#111827" />
      ) : (
        <path d="M97,-78 L103,-70 L118,-58 L111,-76 Z" fill="#111827" />
      )}
    </g>
  );
}
