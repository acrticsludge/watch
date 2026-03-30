import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";

export const DURATION = 90;

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 12 12" fill="white">
    <rect x="0" y="0" width="5" height="5" rx="1.2" />
    <rect x="7" y="0" width="5" height="5" rx="1.2" opacity="0.7" />
    <rect x="0" y="7" width="5" height="5" rx="1.2" opacity="0.7" />
    <rect x="7" y="7" width="5" height="5" rx="1.2" />
  </svg>
);

export const Scene7EndFrame: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 18, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const logoOp    = interpolate(frame, [0, 22],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dividerW  = interpolate(frame, [18, 52], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dividerOp = interpolate(frame, [18, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineOp = interpolate(frame, [28, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const urlOp     = interpolate(frame, [44, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: C.bg, opacity,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Logo row */}
      <div style={{
        opacity: logoOp,
        display: "flex", alignItems: "center", gap: 12, marginBottom: 22,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, background: "#2563eb",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <GridIcon />
        </div>
        <span style={{
          fontSize: 32, fontWeight: 700, color: C.text,
          fontFamily: F.sans, letterSpacing: "-0.04em",
        }}>
          Stackwatch
        </span>
      </div>

      {/* Divider */}
      <div style={{
        opacity: dividerOp,
        width: dividerW, height: 1,
        background: C.border, marginBottom: 22,
      }} />

      {/* Tagline */}
      <div style={{
        opacity: taglineOp,
        fontSize: 15, color: C.textMuted, fontFamily: F.sans,
        letterSpacing: "0.01em", marginBottom: 28,
      }}>
        know before your users do
      </div>

      {/* URL */}
      <div style={{
        opacity: urlOp,
        fontSize: 11, color: C.textDim,
        fontFamily: F.mono, letterSpacing: "0.04em",
      }}>
        stackwatch.pulsemonitor.dev
      </div>
    </AbsoluteFill>
  );
};
