import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";

export const DURATION = 180;

const ORG_NAME  = "Acme Corp";
const ORG_SLUG  = "acme-corp";
const PROJ_NAME = "Production";
const PROJ_SLUG = "production";

// Typing timings
const ORG_TYPE_START  = 12;
const ORG_TYPE_END    = 60;
const PROJ_TYPE_START = 70;
const PROJ_TYPE_END   = 110;
const BTN_HOVER_START = 118;
const BTN_CLICK_FRAME = 128;
const SUCCESS_FRAME   = 148;

const GridLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" fill="white" />
  </svg>
);

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function typeText(frame: number, text: string, start: number, end: number): string {
  if (frame < start) return "";
  const count = Math.min(text.length, Math.floor(interpolate(frame, [start, end], [0, text.length], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  })));
  return text.substring(0, count);
}

const InputField: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  focused?: boolean;
  mono?: boolean;
  cursor?: boolean;
}> = ({ label, value, placeholder, focused, mono, cursor }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>
      {label}
    </label>
    <div style={{
      padding: "9px 12px",
      background: C.cardSub,
      border: `1px solid ${focused ? "#2563eb" : C.border}`,
      borderRadius: 7,
      fontSize: 13,
      fontFamily: mono ? F.mono : F.sans,
      color: value ? C.text : C.textDim,
      minHeight: 36,
      outline: focused ? "2px solid rgba(37,99,235,0.2)" : "none",
      outlineOffset: -1,
    }}>
      {value ? (value + (cursor ? "|" : "")) : <span style={{ color: C.textDim }}>{placeholder}</span>}
    </div>
  </div>
);

export const Scene2Onboarding: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const contentOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const orgTyped  = typeText(frame, ORG_NAME,  ORG_TYPE_START,  ORG_TYPE_END);
  const orgSlug   = typeText(frame, ORG_SLUG,  ORG_TYPE_START + 4, ORG_TYPE_END + 4);
  const projTyped = typeText(frame, PROJ_NAME, PROJ_TYPE_START, PROJ_TYPE_END);
  const projSlug  = typeText(frame, PROJ_SLUG, PROJ_TYPE_START + 4, PROJ_TYPE_END + 4);

  const orgCursor  = frame >= ORG_TYPE_START && frame < PROJ_TYPE_START && orgTyped.length < ORG_NAME.length;
  const projCursor = frame >= PROJ_TYPE_START && frame < BTN_CLICK_FRAME && projTyped.length < PROJ_NAME.length;

  const btnScale = frame >= BTN_CLICK_FRAME && frame < SUCCESS_FRAME
    ? interpolate(frame, [BTN_CLICK_FRAME, BTN_CLICK_FRAME + 6, BTN_CLICK_FRAME + 12], [1, 0.94, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 1;
  const btnHovered = frame >= BTN_HOVER_START;

  const showSuccess = frame >= SUCCESS_FRAME;
  const successOp = interpolate(frame, [SUCCESS_FRAME, SUCCESS_FRAME + 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOp, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sans }}>
      <div style={{ opacity: contentOp, width: 480 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#2563eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(59,130,246,0.4)",
          }}>
            <GridLogo />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>Stackwatch</span>
        </div>

        {/* Card */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "28px 32px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Let's get you set up
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 24px" }}>
            Create your org and first project to get started.
          </p>

          {!showSuccess ? (
            <>
              {/* Org section */}
              <div style={{
                background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "16px 18px", marginBottom: 12,
              }}>
                <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: F.mono }}>
                  Your organization
                </div>
                <InputField
                  label="Name"
                  value={orgTyped}
                  placeholder="e.g. Acme Corp"
                  focused={frame >= ORG_TYPE_START && frame < PROJ_TYPE_START}
                  cursor={orgCursor}
                />
                <InputField
                  label="Slug"
                  value={orgSlug}
                  placeholder="acme-corp"
                  mono
                />
              </div>

              {/* Project section */}
              <div style={{
                background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                borderRadius: 10, padding: "16px 18px", marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: F.mono }}>
                  Your first project
                </div>
                <InputField
                  label="Name"
                  value={projTyped}
                  placeholder="e.g. Production"
                  focused={frame >= PROJ_TYPE_START && frame < BTN_CLICK_FRAME}
                  cursor={projCursor}
                />
                <InputField
                  label="Slug"
                  value={projSlug}
                  placeholder="production"
                  mono
                />
              </div>

              {/* Continue button */}
              <div style={{
                transform: `scale(${btnScale})`,
                background: btnHovered ? "#f0f0f0" : "#ffffff",
                color: "#0a0a0a",
                borderRadius: 8, padding: "10px 0",
                textAlign: "center",
                fontSize: 14, fontWeight: 600,
                cursor: "pointer",
                boxShadow: btnHovered ? "0 0 0 3px rgba(255,255,255,0.15)" : "none",
              }}>
                Continue →
              </div>
            </>
          ) : (
            /* Success state */
            <div style={{
              opacity: successOp,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "32px 0",
              gap: 12,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckIcon />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Acme Corp · Production</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Redirecting to your dashboard…</div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
