import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";

export const DURATION = 120;

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
  </svg>
);

const SERVICES = [
  { name: "GitHub Actions", color: "#71717a" },
  { name: "Vercel",         color: "#71717a" },
  { name: "Supabase",       color: "#10b981" },
  { name: "Railway",        color: "#71717a" },
  { name: "MongoDB Atlas",  color: "#47A248" },
];

export const Scene1Landing: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity   = interpolate(frame, [0, 14, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const navOp     = interpolate(frame, [0, 14],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eyebrowOp = interpolate(frame, [8, 22],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h1Op      = interpolate(frame, [16, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subOp     = interpolate(frame, [24, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOp     = interpolate(frame, [32, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stripOp   = interpolate(frame, [38, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity, display: "flex", flexDirection: "column" }}>
      {/* Subtle dot-grid background */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }} />

      {/* ── Navbar ── */}
      <div style={{
        opacity: navOp,
        height: 56, flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(10,10,10,0.95)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 60px", position: "relative", zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6, background: "#3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <GridIcon />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: F.sans, letterSpacing: "-0.01em" }}>
            Stackwatch
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {["How it works", "Features", "Pricing"].map((label) => (
            <span key={label} style={{
              fontSize: 13, color: C.textMuted, fontFamily: F.sans, padding: "6px 12px", borderRadius: 6,
            }}>{label}</span>
          ))}
        </div>

        {/* Auth buttons — logged-in state */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: "#fff", color: "#09090b",
            fontSize: 12, fontWeight: 500, fontFamily: F.sans,
            padding: "6px 16px", borderRadius: 6,
          }}>Dashboard →</div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 60px 20px",
        position: "relative",
      }}>
        {/* Eyebrow */}
        <div style={{
          opacity: eyebrowOp,
          display: "flex", alignItems: "center", gap: 10, marginBottom: 28,
          fontSize: 10, fontFamily: F.mono, color: C.textDim,
          textTransform: "uppercase", letterSpacing: "0.18em",
        }}>
          <div style={{ width: 20, height: 1, background: "#3f3f46" }} />
          Always-on usage monitoring for solo founders and dev teams
          <div style={{ width: 20, height: 1, background: "#3f3f46" }} />
        </div>

        {/* H1 */}
        <div style={{
          opacity: h1Op,
          fontSize: 50, fontWeight: 600, lineHeight: 1.07,
          letterSpacing: "-0.03em", marginBottom: 20,
          maxWidth: 640, fontFamily: F.sans,
        }}>
          <span style={{ color: C.text }}>Catch usage limits </span>
          <span style={{ color: "#71717a" }}>before a limit becomes a production meltdown.</span>
        </div>

        {/* Subtext */}
        <div style={{ opacity: subOp }}>
          <p style={{
            fontSize: 12, color: C.textDim, fontFamily: F.mono, marginBottom: 10, letterSpacing: "0.01em",
          }}>
            Actions quota hit. Builds stopped. Users noticed first.
          </p>
          <p style={{
            fontSize: 14, color: C.textMuted, fontFamily: F.sans,
            maxWidth: 500, lineHeight: 1.65, margin: "0 auto 32px",
          }}>
            Stop checking 5 different dashboards. Stackwatch watches your GitHub, Vercel,
            Railway, Supabase and MongoDB Atlas limits 24/7, and puts you back{" "}
            <span style={{ color: C.text, fontWeight: 500 }}>in control</span> before anything reaches your users.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ opacity: ctaOp, display: "flex", gap: 10 }}>
          <div style={{
            background: "#fff", color: "#09090b",
            fontSize: 13, fontWeight: 500, fontFamily: F.sans,
            padding: "9px 28px", borderRadius: 6,
          }}>Start for free</div>
          <div style={{
            color: C.textMuted, fontSize: 13, fontFamily: F.sans,
            padding: "9px 20px", borderRadius: 6,
          }}>How it works →</div>
        </div>
      </div>

      {/* ── Services strip ── */}
      <div style={{
        opacity: stripOp,
        flexShrink: 0,
        borderTop: "1px solid #161616",
        background: C.bg,
        padding: "12px 60px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
      }}>
        <span style={{ fontSize: 9, fontFamily: F.mono, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Monitors
        </span>
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.08)" }} />
        {SERVICES.map((s) => (
          <span key={s.name} style={{ fontSize: 11, color: s.color, fontFamily: F.sans }}>{s.name}</span>
        ))}
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.08)" }} />
        <span style={{ fontSize: 10, color: C.textDim, fontFamily: F.sans }}>+ more soon</span>
      </div>
    </AbsoluteFill>
  );
};
