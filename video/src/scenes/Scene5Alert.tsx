import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";
import { Sidebar } from "../components/Sidebar";

export const DURATION = 120;

const ALERT_ROWS = [
  { service: "Supabase", account: "dbd", metric: "Cache Hit Ratio", pct: 100, channel: "Email",  when: "just now" },
  { service: "Supabase", account: "dbd", metric: "Cache Hit Ratio", pct: 100, channel: "Push",   when: "just now" },
];

// Email slides in at frame 70
const EMAIL_FRAME = 68;

export const Scene5Alert: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const tableOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const row1Op  = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const row2Op  = interpolate(frame, [16, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const emailOp = interpolate(frame, [EMAIL_FRAME, EMAIL_FRAME + 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const emailX = interpolate(frame, [EMAIL_FRAME, EMAIL_FRAME + 16], [40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <Sidebar active="alerts" />

      <div style={{ flex: 1, minWidth: 0, padding: "36px 40px", fontFamily: F.sans, overflow: "hidden" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Alert History
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 24px" }}>
          {ALERT_ROWS.length} alert{ALERT_ROWS.length !== 1 ? "s" : ""} in the last 30 days
        </p>

        {/* Table */}
        <div style={{
          opacity: tableOp,
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 12, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1.6fr 0.8fr 0.8fr 0.8fr",
            padding: "10px 18px",
            borderBottom: `1px solid ${C.border}`,
          }}>
            {["SERVICE", "METRIC", "USAGE", "CHANNEL", "WHEN"].map((h) => (
              <div key={h} style={{ fontSize: 10, color: C.textDim, fontFamily: F.sans, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {ALERT_ROWS.map((row, i) => {
            const rowOp = i === 0 ? row1Op : row2Op;
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
                    background: "#dc2626", borderRadius: 5, padding: "2px 7px", fontFamily: F.mono,
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

        {/* Email preview slides in */}
        {frame >= EMAIL_FRAME && (
          <div style={{ opacity: emailOp, transform: `translateX(${emailX}px)`, marginTop: 20, maxWidth: 480 }}>
            {/* "Alert email sent" label */}
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              marginBottom: 10, fontSize: 11, color: "#71717a", fontFamily: F.mono,
            }}>
              <span style={{ fontSize: 13 }}>✉</span>
              <span>Alert email sent to anubhavrai100@gmail.com</span>
            </div>
          <div style={{
            background: "#ffffff",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
          }}>
            {/* Red header */}
            <div style={{ background: "#dc2626", padding: "16px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                    <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
                  </svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: F.sans }}>Usage Alert</div>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: F.sans }}>
                Supabase · dbd account
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px", background: "#fff" }}>
              <p style={{ fontSize: 14, color: "#111", margin: "0 0 16px", fontFamily: F.sans }}>
                <strong>cache_hit_ratio</strong> has reached{" "}
                <strong style={{ color: "#dc2626" }}>100%</strong> of your limit.
              </p>

              {/* Data rows */}
              {[
                { label: "Current usage", value: "99.99" },
                { label: "Limit",         value: "100" },
                { label: "Recorded at",   value: "3/30/2026, 2:23:06 PM" },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "9px 0",
                  borderTop: `1px solid #f3f4f6`,
                  fontSize: 13, fontFamily: F.sans,
                }}>
                  <span style={{ color: "#6b7280" }}>{row.label}</span>
                  <span style={{ color: "#111", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}

              {/* CTA */}
              <div style={{ marginTop: 20 }}>
                <div style={{
                  display: "inline-block",
                  background: "#2563eb", color: "#fff",
                  borderRadius: 6, padding: "10px 20px",
                  fontSize: 13, fontWeight: 600, fontFamily: F.sans,
                }}>
                  View Dashboard
                </div>
              </div>

              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 16, fontFamily: F.sans }}>
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
