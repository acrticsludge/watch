import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";
import { Sidebar } from "../components/Sidebar";

export const DURATION = 150;

const ALERT_ROWS = [
  { service: "Vercel", account: "Production", metric: "Bandwidth", pct: 85, channel: "Email", when: "just now" },
  { service: "Vercel", account: "Production", metric: "Bandwidth", pct: 85, channel: "Push",  when: "just now" },
];

const EMAIL_FRAME = 72;

export const Scene5Alert: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const tableOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const row1Op  = interpolate(frame, [8,  20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const row2Op  = interpolate(frame, [16, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const emailOp = interpolate(frame, [EMAIL_FRAME, EMAIL_FRAME + 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const emailX = interpolate(frame, [EMAIL_FRAME, EMAIL_FRAME + 14], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOp }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <Sidebar active="alerts" />

        <div style={{ flex: 1, minWidth: 0, padding: "32px 36px", fontFamily: F.sans, overflow: "hidden" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Alert History
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 20px" }}>
            {ALERT_ROWS.length} alerts in the last 30 days
          </p>

          {/* Table */}
          <div style={{
            opacity: tableOp,
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: "hidden",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1.6fr 0.8fr 0.8fr 0.8fr",
              padding: "10px 18px",
              borderBottom: `1px solid ${C.border}`,
            }}>
              {["SERVICE", "METRIC", "USAGE", "CHANNEL", "WHEN"].map((h) => (
                <div key={h} style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {h}
                </div>
              ))}
            </div>

            {ALERT_ROWS.map((row, i) => {
              const rowOp = i === 0 ? row1Op : row2Op;
              const badgeBg = row.pct >= 80 ? "#dc2626" : row.pct >= 60 ? "#d97706" : "#16a34a";
              return (
                <div key={i} style={{
                  opacity: rowOp,
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1.6fr 0.8fr 0.8fr 0.8fr",
                  padding: "14px 18px",
                  borderBottom: i < ALERT_ROWS.length - 1 ? `1px solid ${C.border}` : "none",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.service}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{row.account}</div>
                  </div>
                  <div style={{ fontSize: 13, color: C.blue }}>{row.metric}</div>
                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#fff",
                      background: badgeBg, borderRadius: 5, padding: "2px 7px", fontFamily: F.mono,
                    }}>
                      {row.pct}%
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.text }}>{row.channel}</div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>{row.when}</div>
                </div>
              );
            })}
          </div>

          {/* Email preview */}
          {frame >= EMAIL_FRAME && (
            <div style={{ opacity: emailOp, transform: `translateX(${emailX}px)`, marginTop: 20, maxWidth: 480 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                marginBottom: 10, fontSize: 11, color: "#71717a", fontFamily: F.mono,
              }}>
                <span style={{ fontSize: 13 }}>✉</span>
                <span>Alert email sent to anubhavrai100@gmail.com</span>
              </div>
              <div style={{
                background: "#ffffff", borderRadius: 10, overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              }}>
                {/* Amber header for warning-level alert */}
                <div style={{ background: "#d97706", padding: "14px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg viewBox="0 0 24 24" fill="white" width="13" height="13">
                        <path d="M24 22.525H0l12-21.05 12 21.05z" />
                      </svg>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: F.sans }}>Usage Alert</div>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: F.sans }}>
                    Vercel · Production account
                  </div>
                </div>

                <div style={{ padding: "18px 22px", background: "#fff" }}>
                  <p style={{ fontSize: 14, color: "#111", margin: "0 0 14px", fontFamily: F.sans }}>
                    <strong>bandwidth_gb</strong> has reached{" "}
                    <strong style={{ color: "#d97706" }}>85%</strong> of your limit.
                  </p>
                  {[
                    { label: "Current usage", value: "85.3 GB" },
                    { label: "Limit",         value: "100 GB" },
                    { label: "Recorded at",   value: "4/7/2026, 10:14:22 AM" },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "8px 0", borderTop: "1px solid #f3f4f6",
                      fontSize: 13, fontFamily: F.sans,
                    }}>
                      <span style={{ color: "#6b7280" }}>{row.label}</span>
                      <span style={{ color: "#111", fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 18 }}>
                    <div style={{
                      display: "inline-block",
                      background: "#2563eb", color: "#fff",
                      borderRadius: 6, padding: "9px 18px",
                      fontSize: 13, fontWeight: 600, fontFamily: F.sans,
                    }}>
                      View Dashboard
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 14, fontFamily: F.sans }}>
                    You received this because you have email alerts enabled on Stackwatch.{" "}
                    <span style={{ color: "#2563eb", textDecoration: "underline" }}>Manage alerts</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
