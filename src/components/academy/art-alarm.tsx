"use client";

// Fire alarm devices for the Academy's alarm course, drawn in the parent
// <svg>'s coordinates. Ceiling devices hang from (x, y); wall devices are
// centered on (x, y).

const ALARM_RED = "#d62828";

export function SmokeDetector({ x, y, s = 1, led = "#22c55e" }: { x: number; y: number; s?: number; led?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-15} y={0} width={30} height={3.5} rx={1} fill="#e5e7eb" stroke="#9ca3af" strokeWidth={0.6} />
      <path d="M-13,3.5 L13,3.5 C12,11 7,13 0,13 C-7,13 -12,11 -13,3.5 Z" fill="#f9fafb" stroke="#9ca3af" strokeWidth={0.8} />
      {[-8, -4, 0, 4, 8].map((dx) => (
        <line key={dx} x1={dx} y1={6} x2={dx} y2={9.5} stroke="#cbd5e1" strokeWidth={1.2} />
      ))}
      <circle cx={9} cy={8.5} r={1.4} fill={led} />
    </g>
  );
}

export function HeatDetector({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-13} y={0} width={26} height={3.5} rx={1} fill="#e5e7eb" stroke="#9ca3af" strokeWidth={0.6} />
      <path d="M-10,3.5 L10,3.5 L8,10 L-8,10 Z" fill="#f9fafb" stroke="#9ca3af" strokeWidth={0.8} />
      <path d="M-5,10 L5,10 L3,14 L-3,14 Z" fill="#d1d5db" stroke="#6b7280" strokeWidth={0.6} />
      <circle cx={0} cy={15.5} r={2} fill="#111827" />
    </g>
  );
}

export function PullStation({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-10} y={-14} width={20} height={28} rx={2.5} fill={ALARM_RED} stroke="#7f1d1d" strokeWidth={1} />
      <text x={0} y={-6} textAnchor="middle" fontSize={5.5} fontWeight={900} fill="#fff">
        FIRE
      </text>
      <rect x={-6.5} y={-2} width={13} height={5} rx={1} fill="#fff" />
      <text x={0} y={9} textAnchor="middle" fontSize={3.6} fontWeight={800} fill="#fff">
        PULL DOWN
      </text>
    </g>
  );
}

export function HornStrobe({ x, y, s = 1, flashing = false }: { x: number; y: number; s?: number; flashing?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {flashing && <circle cx={0} cy={8} r={14} fill="#fef9c3" className="academy-ping" />}
      <rect x={-12} y={-15} width={24} height={30} rx={2.5} fill={ALARM_RED} stroke="#7f1d1d" strokeWidth={1} />
      {[-10, -7, -4].map((dy) => (
        <line key={dy} x1={-7} y1={dy} x2={7} y2={dy} stroke="#7f1d1d" strokeWidth={1.4} strokeLinecap="round" />
      ))}
      <text x={0} y={3} textAnchor="middle" fontSize={5.5} fontWeight={900} fill="#fff">
        FIRE
      </text>
      <rect x={-7} y={5} width={14} height={8} rx={2} fill={flashing ? "#fffbeb" : "#e0f2fe"} stroke="#94a3b8" strokeWidth={0.8} />
    </g>
  );
}

export type PanelState = "normal" | "alarm" | "supervisory" | "trouble";

/** Wall-mounted fire alarm control panel, top-left at (x, y), 80 x 104. */
export function ControlPanel({
  x,
  y,
  state = "normal",
  lcd = ["SYSTEM NORMAL", ""],
}: {
  x: number;
  y: number;
  state?: PanelState;
  lcd?: [string, string];
}) {
  const leds: { key: PanelState | "power"; on: string; label: string }[] = [
    { key: "power", on: "#22c55e", label: "PWR" },
    { key: "alarm", on: "#ef4444", label: "ALM" },
    { key: "supervisory", on: "#eab308", label: "SUP" },
    { key: "trouble", on: "#f59e0b", label: "TBL" },
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={80} height={104} rx={4} fill="#b91c1c" stroke="#7f1d1d" strokeWidth={1.5} />
      <rect x={5} y={5} width={70} height={94} rx={3} fill="#dc2626" />
      <text x={40} y={15} textAnchor="middle" fontSize={6} fontWeight={900} fill="#fff" letterSpacing={0.6}>
        FIRE ALARM
      </text>
      <rect x={10} y={21} width={60} height={22} rx={2} fill="#14532d" stroke="#052e16" strokeWidth={1} />
      <text x={14} y={30} fontSize={5.4} fontWeight={700} fill="#bbf7d0" fontFamily="ui-monospace, monospace">
        {lcd[0]}
      </text>
      <text x={14} y={38.5} fontSize={5.4} fontWeight={700} fill="#bbf7d0" fontFamily="ui-monospace, monospace">
        {lcd[1]}
      </text>
      {leds.map((l, i) => {
        const lit = l.key === "power" || l.key === state;
        return (
          <g key={l.key} transform={`translate(${16 + i * 16} 54)`}>
            {lit && l.key !== "power" && <circle r={6} fill={l.on} opacity={0.35} className="academy-ping" />}
            <circle r={3.4} fill={lit ? l.on : "#7f1d1d"} stroke="#450a0a" strokeWidth={0.6} />
            <text y={10} textAnchor="middle" fontSize={4.2} fontWeight={800} fill="#fee2e2">
              {l.label}
            </text>
          </g>
        );
      })}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={12 + i * 20} y={76} width={16} height={9} rx={2} fill="#fecaca" stroke="#7f1d1d" strokeWidth={0.6} />
      ))}
    </g>
  );
}

/** Ceiling supply-air diffuser with air blowing out, centered on x. */
export function Diffuser({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 20} y={y} width={40} height={6} fill="#e5e7eb" stroke="#9ca3af" strokeWidth={0.8} />
      {[-14, -7, 0, 7, 14].map((dx) => (
        <line key={dx} x1={x + dx} y1={y + 1} x2={x + dx} y2={y + 5} stroke="#9ca3af" strokeWidth={1} />
      ))}
      <g stroke="#60a5fa" strokeWidth={1.6} fill="none" strokeLinecap="round" className="academy-rise" style={{ animationDirection: "reverse" }}>
        <path d={`M${x - 10},${y + 10} q-8,6 -16,6`} />
        <path d={`M${x + 10},${y + 10} q8,6 16,6`} />
        <path d={`M${x},${y + 10} v12`} />
      </g>
    </g>
  );
}
