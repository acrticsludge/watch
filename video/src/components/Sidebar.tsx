import { C, F } from "../styles";

export type NavItem = "dashboard" | "integrations" | "alerts" | "settings";

// Lucide-style icons
const DashboardIcon = ({ active }: { active: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? "#60a5fa" : "#52525b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const PlugIcon = ({ active }: { active: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? "#60a5fa" : "#52525b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" />
    <path d="M18 8H6a2 2 0 0 0-2 2v3a7 7 0 1 0 14 0v-3a2 2 0 0 0-2-2Z" />
  </svg>
);
const BellIcon = ({ active }: { active: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? "#60a5fa" : "#52525b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? "#60a5fa" : "#52525b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LogOutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const GridLogo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" fill="white" />
  </svg>
);

const NAV = [
  { id: "dashboard"    as NavItem, label: "Dashboard",    Icon: DashboardIcon },
  { id: "integrations" as NavItem, label: "Integrations", Icon: PlugIcon },
  { id: "alerts"       as NavItem, label: "Alert History", Icon: BellIcon },
  { id: "settings"     as NavItem, label: "Settings",     Icon: SettingsIcon },
];

export const Sidebar: React.FC<{ active: NavItem }> = ({ active }) => (
  <div style={{
    width: 224, height: "100%",
    background: "#0d0d0d",
    borderRight: `1px solid ${C.border}`,
    display: "flex", flexDirection: "column",
    flexShrink: 0, fontFamily: F.sans,
  }}>
    {/* Logo — h-14 = 56px */}
    <div style={{
      height: 56, display: "flex", alignItems: "center",
      padding: "0 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: "#2563eb", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 12px rgba(59,130,246,0.35)",
        }}>
          <GridLogo />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>
          Stackwatch
        </span>
      </div>
    </div>

    {/* Nav */}
    <div style={{ flex: 1, padding: "12px 8px 8px" }}>
      {NAV.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <div key={id} style={{
            position: "relative",
            display: "flex", alignItems: "center", gap: 12,
            padding: "8px 12px",
            borderRadius: 8,
            background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
            marginBottom: 2,
          }}>
            {isActive && (
              <div style={{
                position: "absolute", left: 0, top: "50%",
                transform: "translateY(-50%)",
                width: 2, height: 16, borderRadius: 2,
                background: "#3b82f6",
                boxShadow: "0 0 6px rgba(59,130,246,0.7)",
              }} />
            )}
            <Icon active={isActive} />
            <span style={{
              fontSize: 13, fontWeight: isActive ? 500 : 400,
              color: isActive ? C.text : "#71717a",
            }}>{label}</span>
          </div>
        );
      })}
    </div>

    {/* Footer */}
    <div style={{ padding: "8px", borderTop: `1px solid ${C.border}` }}>
      {/* User row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 2 }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "rgba(59,130,246,0.15)",
          border: "1px solid rgba(59,130,246,0.25)",
          boxShadow: "0 0 0 1px rgba(59,130,246,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: "#60a5fa", flexShrink: 0,
        }}>A</div>
        <span style={{
          fontSize: 11, color: "#71717a", flex: 1,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>anubhavrai100@gmail.com</span>
        <span style={{
          fontSize: 9, color: "#71717a",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3, padding: "1px 5px", fontFamily: F.mono, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>free</span>
      </div>
      {/* Sign out */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8 }}>
        <LogOutIcon />
        <span style={{ fontSize: 13, color: "#3f3f46" }}>Sign out</span>
      </div>
    </div>
  </div>
);
