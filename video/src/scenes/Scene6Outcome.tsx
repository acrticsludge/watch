import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../styles";
import { Sidebar } from "../components/Sidebar";

const RailwayIcon = () => (
  <svg viewBox="0 0 1024 1024" fill="#e4e4e7" width="15" height="15">
    <path d="M4.756 438.175A520.713 520.713 0 0 0 0 489.735h777.799c-2.716-5.306-6.365-10.09-10.045-14.772-132.97-171.791-204.498-156.896-306.819-161.26-34.114-1.403-57.249-1.967-193.037-1.967-72.677 0-151.688.185-228.628.39-9.96 26.884-19.566 52.942-24.243 74.14h398.571v51.909H4.756ZM783.93 541.696H.399c.82 13.851 2.112 27.517 3.978 40.999h723.39c32.248 0 50.299-18.297 56.162-40.999ZM45.017 724.306S164.941 1018.77 511.46 1024c207.112 0 385.071-123.006 465.907-299.694H45.017Z" />
    <path d="M511.454 0C319.953 0 153.311 105.16 65.31 260.612c68.771-.144 202.704-.226 202.704-.226h.031v-.051c158.309 0 164.193.707 195.118 1.998l19.149.706c66.7 2.224 148.683 9.384 213.19 58.19 35.015 26.471 85.571 84.896 115.708 126.52 27.861 38.499 35.876 82.756 16.933 125.158-17.436 38.97-54.952 62.215-100.383 62.215H16.69s4.233 17.944 10.58 37.751h970.632A510.385 510.385 0 0 0 1024 512.218C1024.01 229.355 794.532 0 511.454 0Z" />
  </svg>
);
const SupabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="#34d399" width="15" height="15">
    <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
  </svg>
);
const MongoIcon = () => (
  <svg viewBox="0 0 24 24" fill="#47A248" width="15" height="15">
    <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.109-1.622-.197-2.218z" />
  </svg>
);

export const DURATION = 75;

const TinyBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div style={{ width: 100, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
    <div style={{ height: "100%", width: `${pct}%`, background: "#3b82f6", borderRadius: 2 }} />
  </div>
);

export const Scene6Outcome: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const contentOp = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cards = [
    {
      service: "Railway", account: "personal", icon: <RailwayIcon />,
      topPct: 12,
      metrics: [
        { name: "Memory Usage", pct: 12 }, { name: "Peak Memory", pct: 7 }, { name: "Network Ingress", pct: 3 },
      ],
      extra: 3,
    },
    {
      service: "Supabase", account: "dbd", icon: <SupabaseIcon />,
      topPct: 18,
      metrics: [
        { name: "Cache Hit Ratio", pct: 18 }, { name: "Active Connections", pct: 15 }, { name: "Database Size", pct: 7 },
      ],
      extra: 2,
    },
    {
      service: "MongoDB Atlas", account: "Atlas 1", icon: <MongoIcon />,
      topPct: 14,
      metrics: [
        { name: "Active Connections", pct: 14 }, { name: "Network Out", pct: 2 }, { name: "Storage", pct: 1 },
      ],
      extra: 4,
    },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <Sidebar active="dashboard" />

      <div style={{ flex: 1, minWidth: 0, padding: "36px 40px 36px 32px", fontFamily: F.sans }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, opacity: contentOp }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>Dashboard</h1>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted,
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px",
          }}>
            <span>↺</span><span style={{ fontSize: 11 }}>Updated just now</span>
          </div>
        </div>

        {/* Status — all healthy */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20, opacity: contentOp }}>
          {[
            { label: "Healthy", value: "17", color: "#4ade80" },
            { label: "Warning", value: "0",  color: C.textDim },
            { label: "Critical", value: "0", color: C.textDim },
          ].map((s) => (
            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: F.mono }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, opacity: contentOp }}>USAGE</div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, opacity: contentOp }}>
          {cards.map((card) => (
            <div key={card.service} style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{card.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{card.service}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{card.account}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#fff",
                  background: "#16a34a", borderRadius: 5, padding: "2px 7px", fontFamily: F.mono,
                }}>{card.topPct}%</span>
              </div>
              {card.metrics.map((m) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: C.textMuted, width: 130, flexShrink: 0 }}>{m.name}</span>
                  <TinyBar pct={m.pct} />
                  <span style={{ fontSize: 11, color: C.blue, fontFamily: F.mono, width: 28, textAlign: "right" }}>{m.pct}%</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, marginBottom: 12 }}>
                +{card.extra} more · click for details
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between",
                borderTop: `1px solid ${C.border}`, paddingTop: 10,
              }}>
                <span style={{ fontSize: 11, color: C.textDim }}>Synced 1m ago</span>
                <span style={{ fontSize: 11, color: "#4ade80", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 8 }}>●</span> connected
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
      </div>
    </AbsoluteFill>
  );
};
