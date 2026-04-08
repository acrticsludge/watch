import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F, barColor } from "../styles";
import { Sidebar } from "../components/Sidebar";

export const DURATION = 240;

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="#e4e4e7" width="16" height="16">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);
const VercelIcon = () => (
  <svg viewBox="0 0 24 24" fill="#e4e4e7" width="16" height="16">
    <path d="M24 22.525H0l12-21.05 12 21.05z" />
  </svg>
);

const TinyBar: React.FC<{ pct: number; width?: number }> = ({ pct, width = 100 }) => (
  <div style={{ width, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
    <div style={{ height: "100%", width: `${pct}%`, background: barColor(pct), borderRadius: 2 }} />
  </div>
);

interface MetricRowProps { name: string; pct: number; delta?: string }
const MetricRow: React.FC<MetricRowProps> = ({ name, pct, delta }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
    <span style={{ fontSize: 11, color: C.textMuted, width: 130, flexShrink: 0 }}>{name}</span>
    <TinyBar pct={pct} />
    <span style={{ fontSize: 11, color: pct >= 80 ? C.red : pct >= 60 ? C.amber : C.blue, fontFamily: F.mono, width: 36, textAlign: "right", flexShrink: 0 }}>
      {pct}%
    </span>
    {delta && <span style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{delta}</span>}
  </div>
);

const PctBadge: React.FC<{ pct: number }> = ({ pct }) => {
  const bg = pct >= 80 ? "#dc2626" : pct >= 60 ? "#d97706" : "#16a34a";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: "#fff",
      background: bg, borderRadius: 5, padding: "2px 7px",
      fontFamily: F.mono, flexShrink: 0,
    }}>
      {pct}%
    </span>
  );
};

export const Scene4Monitoring: React.FC = () => {
  const frame = useCurrentFrame();

  // Vercel bandwidth animates 58% → 85% over frames 18–180
  const vercelPct = Math.round(interpolate(frame, [18, 180], [58, 85], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

  const sceneOp = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const card1Op = interpolate(frame, [0, 12],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card2Op = interpolate(frame, [6, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Status counters driven by animated pct
  const criticalCount = vercelPct >= 80 ? 1 : 0;
  const warningCount  = vercelPct >= 60 && vercelPct < 80 ? 1 : 0;
  const healthyCount  = 2 - criticalCount - warningCount;

  const isCritical = vercelPct >= 80;
  const isWarning  = vercelPct >= 60 && vercelPct < 80;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOp }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <Sidebar active="dashboard" />

        <div style={{ flex: 1, minWidth: 0, padding: "32px 36px", fontFamily: F.sans }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
              Dashboard
            </h1>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textMuted,
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px",
            }}>
              <span>↺</span> Updated just now
            </div>
          </div>

          {/* Status grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Healthy",  value: healthyCount, color: "#4ade80" },
              { label: "Warning",  value: warningCount,  color: "#fbbf24" },
              { label: "Critical", value: criticalCount, color: "#f87171" },
            ].map((s) => (
              <div key={s.label} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "12px 16px",
              }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.value > 0 ? s.color : C.textDim, fontFamily: F.mono }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            USAGE
          </div>

          {/* Cards — 2 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Vercel — animated */}
            <div style={{
              opacity: card1Op,
              background: isCritical ? "rgba(239,68,68,0.04)" : isWarning ? "rgba(245,158,11,0.04)" : C.card,
              border: `1px solid ${isCritical ? "rgba(239,68,68,0.2)" : isWarning ? "rgba(245,158,11,0.2)" : C.border}`,
              borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <VercelIcon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Vercel</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Production</div>
                </div>
                <PctBadge pct={vercelPct} />
              </div>

              {/* Animated bandwidth row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: C.textMuted, width: 130, flexShrink: 0 }}>Bandwidth</span>
                <TinyBar pct={vercelPct} />
                <span style={{ fontSize: 11, color: barColor(vercelPct), fontFamily: F.mono, width: 36, textAlign: "right", flexShrink: 0 }}>
                  {vercelPct}%
                </span>
                {vercelPct >= 80 && <span style={{ fontSize: 10, color: C.red, fontFamily: F.mono }}>· limit near</span>}
              </div>
              <MetricRow name="Build Minutes"         pct={34} delta="-34%" />
              <MetricRow name="Function Invocations"  pct={12} delta="-12%" />
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, marginBottom: 12 }}>+2 more · click for details</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: C.textDim }}>Synced just now</span>
                <span style={{ fontSize: 11, color: "#4ade80", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 8 }}>●</span> connected
                </span>
              </div>
            </div>

            {/* GitHub — static */}
            <div style={{
              opacity: card2Op,
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <GithubIcon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>GitHub Actions</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>acme-org</div>
                </div>
                <PctBadge pct={23} />
              </div>
              <MetricRow name="Actions Minutes"    pct={23} delta="-23%" />
              <MetricRow name="Storage"            pct={8}  delta="-8%" />
              <MetricRow name="Packages Bandwidth" pct={1}  delta="-1%" />
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, marginBottom: 12 }}>+3 more · click for details</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: C.textDim }}>Synced just now</span>
                <span style={{ fontSize: 11, color: "#4ade80", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 8 }}>●</span> connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
