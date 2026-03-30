// Design tokens matching the Stackwatch app exactly
export const C = {
  bg: "#0a0a0a",
  card: "#111111",
  cardSub: "#0d0d0d",
  border: "rgba(255,255,255,0.06)",
  borderBright: "rgba(255,255,255,0.12)",
  text: "#fafafa",
  textMuted: "#71717a",   // zinc-500
  textDim: "#3f3f46",     // zinc-700
  green: "#4ade80",       // green-400
  amber: "#fbbf24",       // amber-400
  red: "#f87171",         // red-400
  blue: "#60a5fa",        // blue-400
  greenBg: "rgba(34,197,94,0.08)",
  amberBg: "rgba(245,158,11,0.08)",
  redBg: "rgba(239,68,68,0.08)",
  blueBg: "rgba(59,130,246,0.08)",
  greenBorder: "rgba(34,197,94,0.2)",
  amberBorder: "rgba(245,158,11,0.2)",
  redBorder: "rgba(239,68,68,0.2)",
  blueBorder: "rgba(59,130,246,0.2)",
} as const;

export const F = {
  mono: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
  sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

// Progress bar color by percentage — mirrors app logic
export const barColor = (pct: number) =>
  pct >= 80 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#3b82f6";

export const statusColor = (pct: number) =>
  pct >= 80 ? C.red : pct >= 60 ? C.amber : C.green;
