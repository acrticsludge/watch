import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";

export const DURATION = 75;

const LINES: { frame: number; text: string; color?: string; bold?: boolean }[] = [
  { frame: 4,  text: "$ curl https://api.myapp.com/health" },
  { frame: 14, text: '  {"status":"degraded","latency":"4200ms"}', color: C.amber },
  { frame: 24, text: "" },
  { frame: 26, text: "$ -- checking supabase dashboard --", color: C.textMuted },
  { frame: 36, text: "  cache_hit_ratio:  99.99  /  100",  color: C.red },
  { frame: 44, text: "  status:           CRITICAL",         color: C.red, bold: true },
  { frame: 51, text: "  threshold breach: 3 hours ago",      color: C.red },
  { frame: 59, text: "" },
  { frame: 61, text: "  Nobody was watching.", color: C.textDim },
];

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 660,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: F.mono,
      }}>
        {/* Chrome */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "11px 16px",
          borderBottom: `1px solid ${C.border}`,
          background: C.cardSub,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.75 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", opacity: 0.75 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", opacity: 0.5 }} />
          <span style={{ marginLeft: 8, fontSize: 11, color: C.textDim, letterSpacing: "0.04em" }}>
            terminal — bash
          </span>
        </div>

        {/* Log */}
        <div style={{ padding: "20px 24px 28px", minHeight: 280 }}>
          {LINES.map((line, i) => {
            if (frame < line.frame) return null;
            const lineOpacity = interpolate(frame, [line.frame, line.frame + 6], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                opacity: lineOpacity,
                fontSize: 13, lineHeight: "26px",
                color: line.color ?? C.text,
                fontWeight: line.bold ? 600 : 400,
                minHeight: line.text === "" ? 8 : undefined,
                letterSpacing: "0.01em",
              }}>
                {line.text}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
