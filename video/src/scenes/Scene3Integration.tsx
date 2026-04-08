import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";
import { Sidebar } from "../components/Sidebar";

export const DURATION = 330;

// ── Vercel flow timings ───────────────────────────────────────────────────────
const VERCEL_CLICK_FRAME = 20;   // highlight "Add account" on Vercel card
const MODAL_OPEN_FRAME   = 34;   // modal starts opening
const TOKEN_TYPE_START   = 52;   // start typing Vercel token
const TOKEN_TYPE_END     = 136;  // done typing
const CONNECT_CLICK      = 148;  // click Connect
const VERCEL_SUCCESS     = 164;  // Vercel card shows connected

// ── GitHub flow timings ───────────────────────────────────────────────────────
const GH_MODAL_OPEN   = 180;
const GH_TYPE_START   = 194;
const GH_TYPE_END     = 230;
const GH_CONNECT      = 238;
const GH_SUCCESS      = 252;

const VERCEL_TOKEN = "ver_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const GH_TOKEN     = "ghp_xxxxxxxxxxxxxxxxxxxx";

const SERVICES = [
  {
    id: "github",
    name: "GitHub Actions",
    desc: "Track Actions minutes vs monthly limit.",
    warn: "Requires GitHub's legacy billing system. Personal accounts on the new billing platform and most accounts created after 2023 are not supported.",
  },
  {
    id: "vercel",
    name: "Vercel",
    desc: "Monitor bandwidth, build minutes, and function invocations.",
    warn: "Hobby plan accounts are not supported — Vercel does not expose billing data via API for Hobby. Pro or Team plan required.",
  },
  {
    id: "supabase",
    name: "Supabase",
    desc: "Watch database size, storage, and monthly active users.",
    warn: null,
  },
  {
    id: "railway",
    name: "Railway",
    desc: "Monitor memory and CPU usage across all deployed services.",
    warn: "Requires at least one deployed service on your Railway account.",
  },
  {
    id: "mongodb",
    name: "MongoDB Atlas",
    desc: "Track storage, connections, and performance metrics.",
    warn: "M0 free-tier clusters don't expose live usage data via the Atlas API.",
  },
];

function typeText(frame: number, text: string, start: number, end: number): string {
  if (frame < start) return "";
  const count = Math.min(text.length, Math.floor(interpolate(frame, [start, end], [0, text.length], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  })));
  return text.substring(0, count);
}

const ConnectedRow: React.FC<{ name: string; label: string }> = ({ name, label }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "8px 12px", marginTop: 8,
  }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</div>
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
);

export const Scene3Integration: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Vercel modal
  const vercelModalVisible = frame >= MODAL_OPEN_FRAME && frame < VERCEL_SUCCESS;
  const vercelModalOp = interpolate(frame, [MODAL_OPEN_FRAME, MODAL_OPEN_FRAME + 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const vercelModalY = interpolate(frame, [MODAL_OPEN_FRAME, MODAL_OPEN_FRAME + 14], [14, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // GitHub modal
  const ghModalVisible = frame >= GH_MODAL_OPEN && frame < GH_SUCCESS;
  const ghModalOp = interpolate(frame, [GH_MODAL_OPEN, GH_MODAL_OPEN + 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const ghModalY = interpolate(frame, [GH_MODAL_OPEN, GH_MODAL_OPEN + 14], [14, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const backdropOp = (vercelModalVisible || ghModalVisible)
    ? interpolate(frame,
        vercelModalVisible ? [MODAL_OPEN_FRAME, MODAL_OPEN_FRAME + 14] : [GH_MODAL_OPEN, GH_MODAL_OPEN + 14],
        [0, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  // Token typing
  const vercelToken = typeText(frame, VERCEL_TOKEN, TOKEN_TYPE_START, TOKEN_TYPE_END);
  const vercelCursor = frame >= TOKEN_TYPE_START && frame < CONNECT_CLICK && vercelToken.length < VERCEL_TOKEN.length;
  const vercelBtnScale = frame >= CONNECT_CLICK && frame < VERCEL_SUCCESS
    ? interpolate(frame, [CONNECT_CLICK, CONNECT_CLICK + 6, CONNECT_CLICK + 12], [1, 0.93, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 1;
  const vercelConnecting = frame >= CONNECT_CLICK && frame < VERCEL_SUCCESS;

  const ghToken = typeText(frame, GH_TOKEN, GH_TYPE_START, GH_TYPE_END);
  const ghCursor = frame >= GH_TYPE_START && frame < GH_CONNECT && ghToken.length < GH_TOKEN.length;
  const ghBtnScale = frame >= GH_CONNECT && frame < GH_SUCCESS
    ? interpolate(frame, [GH_CONNECT, GH_CONNECT + 6, GH_CONNECT + 12], [1, 0.93, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 1;
  const ghConnecting = frame >= GH_CONNECT && frame < GH_SUCCESS;

  const vercelConnected = frame >= VERCEL_SUCCESS;
  const ghConnected = frame >= GH_SUCCESS;

  // Vercel card highlight (before modal opens)
  const vercelHighlight = frame >= VERCEL_CLICK_FRAME && frame < MODAL_OPEN_FRAME;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOp }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <Sidebar active="integrations" />

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0, padding: "32px 36px", fontFamily: F.sans, overflow: "hidden", position: "relative" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Integrations
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 20px" }}>
            Connect your services to start monitoring usage.
          </p>

          {/* Service blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SERVICES.map((svc) => {
              const isVercel = svc.id === "vercel";
              const isGitHub = svc.id === "github";
              const highlighted = isVercel && vercelHighlight;

              return (
                <div key={svc.id} style={{
                  background: highlighted ? "rgba(37,99,235,0.06)" : C.card,
                  border: `1px solid ${highlighted ? "rgba(37,99,235,0.3)" : C.border}`,
                  borderRadius: 10, padding: "13px 16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, paddingRight: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>
                        {svc.name}
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: svc.warn ? 6 : 0, lineHeight: 1.5 }}>
                        {svc.desc}
                      </div>
                      {svc.warn && (
                        <div style={{ fontSize: 10, color: "#f59e0b", lineHeight: 1.5, marginBottom: 4 }}>
                          ⚠ {svc.warn}
                        </div>
                      )}
                      {!(isVercel && vercelConnected) && !(isGitHub && ghConnected) && (
                        <div style={{ fontSize: 11, color: C.textDim, marginTop: svc.warn ? 0 : 2 }}>
                          No accounts connected.
                        </div>
                      )}
                      {isVercel && vercelConnected && <ConnectedRow name="Vercel" label="Production" />}
                      {isGitHub && ghConnected && <ConnectedRow name="GitHub" label="acme-org" />}
                    </div>
                    <div style={{
                      background: highlighted ? "#1d4ed8" : "#2563eb",
                      borderRadius: 7, padding: "6px 12px",
                      fontSize: 12, color: "#fff", fontWeight: 500, flexShrink: 0,
                    }}>
                      + Add account
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Backdrop */}
          {(vercelModalVisible || ghModalVisible) && (
            <div style={{
              position: "absolute", inset: 0,
              background: `rgba(0,0,0,${backdropOp})`,
            }} />
          )}

          {/* Vercel modal */}
          {vercelModalVisible && (
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: `translate(-50%, calc(-50% + ${vercelModalY}px))`,
              opacity: vercelModalOp,
              width: 460,
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              fontFamily: F.sans,
              zIndex: 10,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px 12px",
                borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Connect Vercel</span>
                <span style={{ fontSize: 16, color: C.textDim, lineHeight: 1 }}>×</span>
              </div>
              <div style={{ padding: "18px 20px" }}>
                {/* API Token field */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                    API Token
                  </label>
                  <div style={{
                    padding: "9px 12px",
                    background: C.cardSub,
                    border: `1px solid ${frame >= TOKEN_TYPE_START ? "#2563eb" : C.border}`,
                    borderRadius: 7, fontSize: 12, fontFamily: F.mono,
                    color: vercelToken ? C.text : C.textDim,
                    outline: frame >= TOKEN_TYPE_START ? "2px solid rgba(37,99,235,0.2)" : "none",
                    outlineOffset: -1,
                  }}>
                    {vercelToken
                      ? vercelToken + (vercelCursor ? "|" : "")
                      : <span style={{ color: C.textDim }}>ver_...</span>}
                  </div>
                </div>
                {/* Account label */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                    Account label
                  </label>
                  <div style={{
                    padding: "9px 12px",
                    background: C.cardSub, border: `1px solid ${C.border}`,
                    borderRadius: 7, fontSize: 13, color: C.text,
                  }}>
                    Production
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 18 }}>
                  Create a token at vercel.com/account/tokens with full access scope.
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <div style={{ padding: "8px 16px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12, color: C.textMuted }}>
                    Cancel
                  </div>
                  <div style={{
                    transform: `scale(${vercelBtnScale})`,
                    padding: "8px 18px", borderRadius: 7,
                    background: vercelConnecting ? "rgba(37,99,235,0.7)" : "#2563eb",
                    fontSize: 12, fontWeight: 600, color: "#fff",
                  }}>
                    {vercelConnecting ? "Connecting…" : "Connect"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GitHub modal */}
          {ghModalVisible && (
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: `translate(-50%, calc(-50% + ${ghModalY}px))`,
              opacity: ghModalOp,
              width: 460,
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              fontFamily: F.sans,
              zIndex: 10,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px 12px",
                borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Connect GitHub Actions</span>
                <span style={{ fontSize: 16, color: C.textDim, lineHeight: 1 }}>×</span>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                    Personal Access Token
                  </label>
                  <div style={{
                    padding: "9px 12px",
                    background: C.cardSub,
                    border: `1px solid ${frame >= GH_TYPE_START ? "#2563eb" : C.border}`,
                    borderRadius: 7, fontSize: 12, fontFamily: F.mono,
                    color: ghToken ? C.text : C.textDim,
                    outline: frame >= GH_TYPE_START ? "2px solid rgba(37,99,235,0.2)" : "none",
                    outlineOffset: -1,
                  }}>
                    {ghToken
                      ? ghToken + (ghCursor ? "|" : "")
                      : <span style={{ color: C.textDim }}>ghp_...</span>}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>
                    Account label
                  </label>
                  <div style={{
                    padding: "9px 12px",
                    background: C.cardSub, border: `1px solid ${C.border}`,
                    borderRadius: 7, fontSize: 13, color: C.text,
                  }}>
                    acme-org
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 18 }}>
                  Token needs repo, read:org, and read:user scopes.
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <div style={{ padding: "8px 16px", borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 12, color: C.textMuted }}>
                    Cancel
                  </div>
                  <div style={{
                    transform: `scale(${ghBtnScale})`,
                    padding: "8px 18px", borderRadius: 7,
                    background: ghConnecting ? "rgba(37,99,235,0.7)" : "#2563eb",
                    fontSize: 12, fontWeight: 600, color: "#fff",
                  }}>
                    {ghConnecting ? "Connecting…" : "Connect"}
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
