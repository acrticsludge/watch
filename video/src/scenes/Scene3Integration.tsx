import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";
import { Sidebar } from "../components/Sidebar";

export const DURATION = 210;

// Typing: Management API Key
const API_KEY = "sbp_5f9a8b3c4d2e1a7f8b9c0d1e";
const TYPE_START = 85;
const TYPE_END = 160;
const CLICK_FRAME = 172;
const SUCCESS_FRAME = 188;

const SERVICES = [
  {
    name: "GitHub Actions",
    desc: "Track Actions minutes vs monthly limit.",
    warn: "Requires GitHub's legacy billing system. Personal accounts on the new billing platform and most accounts created after 2023 are not supported — the API returns no data.",
    hasAccount: false,
  },
  {
    name: "Vercel",
    desc: "Monitor bandwidth, build minutes, and function invocations.",
    warn: "Hobby plan accounts are not supported — Vercel does not expose billing data via API for Hobby. Pro or Team plan required.",
    hasAccount: false,
  },
  {
    name: "Supabase",
    desc: "Watch database size, storage, and monthly active users.",
    warn: null,
    hasAccount: false,
    highlight: true,
  },
];

export const Scene3Integration: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Dialog
  const dialogOpacity = interpolate(frame, [48, 65], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const dialogY = interpolate(frame, [48, 65], [16, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const showDialog = frame >= 48 && frame < SUCCESS_FRAME;

  // Typing
  const charCount = frame >= TYPE_START
    ? Math.min(
        API_KEY.length,
        Math.floor(interpolate(frame, [TYPE_START, TYPE_END], [0, API_KEY.length], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        }))
      )
    : 0;
  const showCursor = frame >= TYPE_START && frame < CLICK_FRAME && charCount < API_KEY.length;
  const displayKey = API_KEY.substring(0, charCount) + (showCursor ? "|" : "");
  const apiKeyFocused = frame >= TYPE_START && frame < SUCCESS_FRAME;

  // Connect button
  const btnScale = frame >= CLICK_FRAME && frame < SUCCESS_FRAME
    ? interpolate(frame, [CLICK_FRAME, CLICK_FRAME + 7, CLICK_FRAME + 14], [1, 0.94, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 1;
  const btnConnecting = frame >= CLICK_FRAME && frame < SUCCESS_FRAME;

  // Success
  const successOpacity = interpolate(frame, [SUCCESS_FRAME, SUCCESS_FRAME + 15], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Backdrop dimming
  const backdropOpacity = showDialog
    ? interpolate(frame, [48, 65], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <Sidebar active="integrations" />

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, padding: "36px 40px", fontFamily: F.sans, overflow: "hidden", position: "relative" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Integrations
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 24px" }}>
          Connect your services to start monitoring usage.
        </p>

        {/* Service blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SERVICES.map((svc) => {
            const isConnected = svc.highlight && frame >= SUCCESS_FRAME;
            return (
              <div key={svc.name} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "16px 20px",
                position: "relative",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                      {svc.name}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: svc.warn ? 8 : 0 }}>
                      {svc.desc}
                    </div>
                    {svc.warn && (
                      <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 6, lineHeight: "1.5" }}>
                        {svc.warn}
                      </div>
                    )}
                    {!svc.hasAccount && !isConnected && (
                      <div style={{ fontSize: 12, color: C.textDim, marginTop: svc.warn ? 0 : 4 }}>
                        No accounts connected.
                      </div>
                    )}
                    {isConnected && (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "9px 12px", marginTop: 8,
                      }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>dbd</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>Last synced just now</div>
                        </div>
                        <span style={{
                          fontSize: 11, color: "#4ade80",
                          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                          borderRadius: 5, padding: "3px 8px",
                        }}>
                          connected
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "#2563eb", borderRadius: 8, padding: "7px 14px",
                    fontSize: 13, color: "#fff", fontWeight: 500, flexShrink: 0,
                    cursor: "pointer",
                  }}>
                    + Add account
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Backdrop */}
        {showDialog && (
          <div style={{
            position: "absolute", inset: 0,
            background: `rgba(0,0,0,${backdropOpacity})`,
            backdropFilter: backdropOpacity > 0.3 ? "blur(2px)" : "none",
          }} />
        )}

        {/* Connect dialog */}
        {showDialog && (
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(-50%, calc(-50% + ${dialogY}px))`,
            opacity: dialogOpacity,
            width: 480,
            background: "#161616",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
            fontFamily: F.sans,
            zIndex: 10,
          }}>
            {/* Dialog header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "18px 20px 14px",
              borderBottom: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Connect Supabase</span>
              <span style={{ fontSize: 16, color: C.textDim, cursor: "pointer", lineHeight: 1 }}>×</span>
            </div>

            {/* Fields */}
            <div style={{ padding: "20px" }}>
              {/* Management API Key */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                  Management API Key
                </label>
                <div style={{
                  padding: "9px 12px",
                  background: C.cardSub,
                  border: `1px solid ${apiKeyFocused ? "#2563eb" : C.border}`,
                  borderRadius: 7,
                  fontSize: 13, fontFamily: F.mono,
                  color: charCount > 0 ? C.text : C.textDim,
                  minHeight: 36,
                  outline: apiKeyFocused ? "2px solid rgba(37,99,235,0.2)" : "none",
                }}>
                  {charCount > 0 ? displayKey : <span style={{ color: C.textDim }}>sbp_...</span>}
                </div>
              </div>

              {/* Project ref */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                  Project ref
                </label>
                <div style={{
                  padding: "9px 12px",
                  background: C.cardSub, border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 13, color: C.text, fontFamily: F.mono,
                }}>
                  abcdefghijklmnop
                </div>
              </div>

              {/* Account label */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                  Account label
                </label>
                <div style={{
                  padding: "9px 12px",
                  background: C.cardSub, border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 13, color: C.textDim, fontFamily: F.sans,
                }}>
                  {frame >= SUCCESS_FRAME - 30 ? "dbd" : "e.g. prod-db"}
                </div>
              </div>

              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 20 }}>
                Find your Management API key at supabase.com/dashboard/account/tokens
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <div style={{
                  padding: "8px 18px", borderRadius: 7,
                  border: `1px solid ${C.border}`,
                  fontSize: 13, color: C.textMuted, cursor: "pointer",
                }}>
                  Cancel
                </div>
                <div style={{
                  transform: `scale(${btnScale})`,
                  padding: "8px 20px", borderRadius: 7,
                  background: btnConnecting ? "rgba(37,99,235,0.7)" : "#2563eb",
                  fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
                }}>
                  {btnConnecting ? "Connecting..." : "Connect"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </AbsoluteFill>
  );
};
