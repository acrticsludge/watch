import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";
import { Sidebar } from "../components/Sidebar";

export const DURATION = 90;

const BarChartIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
  </svg>
);

export const Scene2Dashboard: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const contentOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <Sidebar active="dashboard" />

        <div style={{ flex: 1, minWidth: 0, fontFamily: F.sans, overflow: "hidden" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px", opacity: contentOp }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
                Dashboard
              </h1>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: C.textMuted,
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "7px 12px",
              }}>
                <span style={{ fontSize: 11 }}>↺</span>
                <span style={{ fontSize: 11 }}>Updated just now</span>
              </div>
            </div>

            {/* Empty state — centered */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "64px 24px", textAlign: "center",
            }}>
              {/* Icon box */}
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <BarChartIcon />
              </div>

              <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                No services connected yet
              </h2>
              <p style={{
                fontSize: 13, color: "#71717a", maxWidth: 280,
                lineHeight: 1.65, margin: "0 auto 24px",
              }}>
                Connect GitHub Actions, Vercel, Supabase, Railway, or MongoDB Atlas to start monitoring your usage and get alerted before you hit limits.
              </p>

              <div style={{
                background: "#2563eb", color: "#fff",
                fontSize: 12, fontWeight: 500, fontFamily: F.sans,
                padding: "8px 20px", borderRadius: 6,
              }}>
                Connect a service
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
