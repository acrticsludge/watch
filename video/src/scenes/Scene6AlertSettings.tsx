import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";
import { Sidebar } from "../components/Sidebar";

export const DURATION = 180;

// Animation timings
const TAB_HIGHLIGHT   = 14;   // Alerts tab becomes active
const SLIDER_START    = 40;   // slider starts moving
const SLIDER_END      = 100;  // slider done (80% → 70%)
const BTN_CLICK       = 112;
const TOAST_FRAME     = 128;
const TOAST_EXIT      = 158;

const VercelIcon = () => (
  <svg viewBox="0 0 24 24" fill="#e4e4e7" width="14" height="14">
    <path d="M24 22.525H0l12-21.05 12 21.05z" />
  </svg>
);

const TABS = ["General", "Alerts", "Notifications", "Billing"];

const Toggle: React.FC<{ on: boolean }> = ({ on }) => (
  <div style={{
    width: 32, height: 18, borderRadius: 9,
    background: on ? "#2563eb" : "rgba(255,255,255,0.1)",
    position: "relative", flexShrink: 0,
    border: `1px solid ${on ? "#2563eb" : "rgba(255,255,255,0.15)"}`,
  }}>
    <div style={{
      position: "absolute",
      top: 2, left: on ? 14 : 2,
      width: 12, height: 12, borderRadius: "50%",
      background: "#fff",
      transition: "left 0.15s",
    }} />
  </div>
);

interface SliderRowProps {
  label: string;
  pct: number;
  enabled: boolean;
  showBtn?: boolean;
  btnClicked?: boolean;
}
const SliderRow: React.FC<SliderRowProps> = ({ label, pct, enabled, showBtn, btnClicked }) => {
  const trackColor = pct >= 80 ? "#dc2626" : pct >= 60 ? "#d97706" : "#2563eb";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0",
      borderBottom: `1px solid ${C.border}`,
      opacity: enabled ? 1 : 0.4,
    }}>
      <Toggle on={enabled} />
      <span style={{ fontSize: 12, color: C.text, width: 160, flexShrink: 0 }}>{label}</span>
      {/* Slider track */}
      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, position: "relative" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: trackColor, borderRadius: 2 }} />
        {/* Thumb */}
        <div style={{
          position: "absolute",
          left: `${pct}%`, top: "50%",
          transform: "translate(-50%, -50%)",
          width: 14, height: 14, borderRadius: "50%",
          background: "#fff", border: `2px solid ${trackColor}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: F.mono, color: trackColor, width: 36, textAlign: "right", flexShrink: 0 }}>
        {pct}%
      </span>
      {showBtn && (
        <div style={{
          transform: `scale(${btnClicked ? 0.94 : 1})`,
          background: "#2563eb", color: "#fff",
          fontSize: 11, fontWeight: 600,
          padding: "5px 12px", borderRadius: 6, flexShrink: 0,
          cursor: "pointer",
        }}>
          Save
        </div>
      )}
    </div>
  );
};

export const Scene6AlertSettings: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const contentOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Bandwidth slider: 80 → 70
  const bandwidthPct = Math.round(interpolate(frame, [SLIDER_START, SLIDER_END], [80, 70], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

  const btnClicked = frame >= BTN_CLICK && frame < BTN_CLICK + 12;
  const btnScale = btnClicked
    ? interpolate(frame, [BTN_CLICK, BTN_CLICK + 6, BTN_CLICK + 12], [1, 0.92, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 1;

  const toastOp = interpolate(frame, [TOAST_FRAME, TOAST_FRAME + 12, TOAST_EXIT, TOAST_EXIT + 10], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const toastY = interpolate(frame, [TOAST_FRAME, TOAST_FRAME + 12], [10, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const showToast = frame >= TOAST_FRAME && frame < TOAST_EXIT + 10;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOp }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <Sidebar active="settings" />

        <div style={{ flex: 1, minWidth: 0, padding: "32px 36px", fontFamily: F.sans, overflow: "hidden", position: "relative" }}>
          <div style={{ opacity: contentOp }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
              Settings
            </h1>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 2, marginBottom: 24,
              borderBottom: `1px solid ${C.border}`, paddingBottom: 0,
            }}>
              {TABS.map((tab) => {
                const isActive = tab === "Alerts" && frame >= TAB_HIGHLIGHT;
                return (
                  <div key={tab} style={{
                    padding: "8px 14px", fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? C.text : C.textMuted,
                    borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                    marginBottom: -1,
                    cursor: "pointer",
                  }}>
                    {tab}
                  </div>
                );
              })}
            </div>

            {/* Vercel section */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "16px 20px",
              maxWidth: 680,
            }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <VercelIcon />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Vercel</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>Production</div>
                </div>
              </div>

              {/* Slider rows */}
              <SliderRow
                label="Bandwidth"
                pct={bandwidthPct}
                enabled
                showBtn
                btnClicked={frame >= BTN_CLICK && frame < BTN_CLICK + 12}
              />
              <SliderRow label="Build Minutes"        pct={75} enabled />
              <SliderRow label="Function Invocations" pct={90} enabled={false} />

              <div style={{ fontSize: 11, color: C.textDim, marginTop: 10 }}>
                Alerts fire when a metric crosses its threshold. They won't re-fire until it drops below and crosses again.
              </div>
            </div>
          </div>

          {/* Toast */}
          {showToast && (
            <div style={{
              position: "absolute", bottom: 32, right: 36,
              opacity: toastOp, transform: `translateY(${toastY}px)`,
              background: "#1a1a1a",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 8, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}>
              <span style={{ color: "#4ade80", fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 13, color: C.text }}>Threshold updated</span>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
