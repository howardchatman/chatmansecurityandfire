"use client";

// Small SVG pieces shared by the Academy levels. Each draws in the parent
// <svg>'s coordinate space.

export const BULB = {
  orange: "#f97316",
  red: "#e11d2b",
  yellow: "#facc15",
  green: "#16a34a",
  blue: "#2563eb",
  purple: "#9333ea",
  black: "#1f2937",
};

export const PIPE_RED = "#c62828";

/** A pendent sprinkler head hanging from a ceiling point (x, y). */
export function MiniHead({
  x,
  y,
  scale = 1,
  bulb = BULB.red,
  open = false,
  painted = false,
}: {
  x: number;
  y: number;
  scale?: number;
  bulb?: string;
  open?: boolean;
  painted?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={1.5} rx={8} ry={2} fill="#d1d5db" stroke="#6b7280" strokeWidth={0.6} />
      <rect x={-3.5} y={2} width={7} height={5.5} rx={1} fill="#c9a227" stroke="#8a6d12" strokeWidth={0.6} />
      <path
        d="M-3,7.5 C-8.5,10 -8.5,16 -1.6,19 M3,7.5 C8.5,10 8.5,16 1.6,19"
        stroke="#8b929c"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      {open ? (
        <g fill="#cbd5e1">
          <path d="M-5,10 l2,-2 l1,3z" />
          <path d="M5,12 l-2,-1.5 l-0.5,3z" />
        </g>
      ) : (
        <>
          <rect x={-1.7} y={7.6} width={3.4} height={10.4} rx={1.7} fill={bulb} stroke="#7f1d1d" strokeWidth={0.4} />
          <rect x={-0.8} y={9} width={0.7} height={6} rx={0.35} fill="#fff" opacity={0.7} />
        </>
      )}
      <rect x={-9} y={19} width={18} height={2.2} rx={1} fill="#9ca3af" stroke="#4b5563" strokeWidth={0.5} />
      {painted && (
        <g>
          <path
            d="M-10,0 C-6,-2 6,-2 10,0 L10,8 C11,13 8,22 3,23 L-4,23 C-8,22 -11,14 -10,8 Z"
            fill="#f3eee2"
            stroke="#d4cbb5"
            strokeWidth={0.8}
          />
          <path d="M-6,23 q0.8,4 1.6,0 M2,23 q1,5 2,0 M6,20 q0.8,3.5 1.6,0" fill="#f3eee2" stroke="#d4cbb5" strokeWidth={0.6} />
        </g>
      )}
    </g>
  );
}

/** Water spraying down from a deflector at (x, y). */
export function Spray({ x, y, length, spread }: { x: number; y: number; length: number; spread: number }) {
  const lines = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];
  return (
    <g pointerEvents="none">
      <path
        d={`M${x - 4},${y} L${x - spread},${y + length} L${x + spread},${y + length} L${x + 4},${y} Z`}
        fill="url(#academy-spray-fill)"
      />
      {lines.map((f, i) => (
        <line
          key={i}
          x1={x + f * 4}
          y1={y}
          x2={x + f * spread}
          y2={y + length * (0.82 + 0.18 * (1 - Math.abs(f)))}
          stroke="#3b82f6"
          strokeWidth={1.4}
          strokeLinecap="round"
          className="academy-spray"
          style={{ animationDelay: `${(i % 3) * -0.15}s` }}
        />
      ))}
    </g>
  );
}

/** Gradient used by <Spray>. Render once inside each <svg> that sprays. */
export function SprayDefs() {
  return (
    <defs>
      <linearGradient id="academy-spray-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#60a5fa" stopOpacity={0.55} />
        <stop offset="1" stopColor="#93c5fd" stopOpacity={0.12} />
      </linearGradient>
    </defs>
  );
}

/** A flickering flame whose base sits on (x, y). */
export function Flames({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const flame = "M0,0 C-11,-3 -13,-19 0,-36 C13,-19 11,-3 0,0 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} pointerEvents="none">
      <g className="academy-flicker">
        <path d={flame} transform="translate(-9 2) scale(0.7)" fill="#f97316" />
        <path d={flame} transform="translate(9 2) scale(0.75)" fill="#f97316" />
        <path d={flame} fill="#ef4444" />
        <path d={flame} transform="translate(0 0) scale(0.62)" fill="#fb923c" />
        <path d={flame} transform="translate(0 0) scale(0.34)" fill="#fde047" />
      </g>
    </g>
  );
}

/** Wavy heat rising from (x, y1) up toward y2. */
export function Heat({ x, y1, y2, width = 30 }: { x: number; y1: number; y2: number; width?: number }) {
  const h = y1 - y2;
  const wave = (dx: number) => {
    const sx = x + dx;
    const seg = h / 4;
    return `M${sx},${y1} q6,${-seg / 2} 0,${-seg} q-6,${-seg / 2} 0,${-seg} q6,${-seg / 2} 0,${-seg} q-6,${-seg / 2} 0,${-seg}`;
  };
  return (
    <g pointerEvents="none" fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" opacity={0.75}>
      {[-width / 2, 0, width / 2].map((dx, i) => (
        <path key={i} d={wave(dx)} className="academy-rise" style={{ animationDelay: `${i * 0.45}s` }} />
      ))}
    </g>
  );
}

/** Puff of smoke for a fire that's been put out. */
export function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g pointerEvents="none" fill="#9ca3af" opacity={0.55}>
      <circle cx={x - 5} cy={y - 8} r={6} className="academy-rise" />
      <circle cx={x + 4} cy={y - 14} r={7} className="academy-rise" style={{ animationDelay: "0.5s" }} />
      <circle cx={x} cy={y - 22} r={5} className="academy-rise" style={{ animationDelay: "1s" }} />
    </g>
  );
}

/** A dark numbered marker, like the callouts on a riser diagram. */
export function Badge({ x, y, n }: { x: number; y: number; n: number | string }) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={9} fill="#1e293b" stroke="#fff" strokeWidth={1.5} />
      <text x={x} y={y + 3.6} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#fff">
        {n}
      </text>
    </g>
  );
}
