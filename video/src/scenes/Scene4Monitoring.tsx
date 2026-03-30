import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F, barColor } from "../styles";
import { Sidebar } from "../components/Sidebar";

// Real service icons
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
const SupabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="#34d399" width="16" height="16">
    <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.01 13.21-.876 14.11 0 14.11h11.16l.085 8.54c.015.986 1.26 1.41 1.875.637l9.26-11.652c.755-1.162-.13-2.75-1.04-2.75H12.027l-.128-7.849z" />
  </svg>
);
const RailwayIcon = () => (
  <svg viewBox="0 0 1024 1024" fill="#e4e4e7" width="16" height="16">
    <path d="M4.756 438.175A520.713 520.713 0 0 0 0 489.735h777.799c-2.716-5.306-6.365-10.09-10.045-14.772-132.97-171.791-204.498-156.896-306.819-161.26-34.114-1.403-57.249-1.967-193.037-1.967-72.677 0-151.688.185-228.628.39-9.96 26.884-19.566 52.942-24.243 74.14h398.571v51.909H4.756ZM783.93 541.696H.399c.82 13.851 2.112 27.517 3.978 40.999h723.39c32.248 0 50.299-18.297 56.162-40.999ZM45.017 724.306S164.941 1018.77 511.46 1024c207.112 0 385.071-123.006 465.907-299.694H45.017Z" />
    <path d="M511.454 0C319.953 0 153.311 105.16 65.31 260.612c68.771-.144 202.704-.226 202.704-.226h.031v-.051c158.309 0 164.193.707 195.118 1.998l19.149.706c66.7 2.224 148.683 9.384 213.19 58.19 35.015 26.471 85.571 84.896 115.708 126.52 27.861 38.499 35.876 82.756 16.933 125.158-17.436 38.97-54.952 62.215-100.383 62.215H16.69s4.233 17.944 10.58 37.751h970.632A510.385 510.385 0 0 0 1024 512.218C1024.01 229.355 794.532 0 511.454 0Z" />
  </svg>
);
const MongoIcon = () => (
  <svg viewBox="0 0 24 24" fill="#47A248" width="16" height="16">
    <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0 1 11.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 0 0 3.639-8.464c.01-.814-.109-1.622-.197-2.218z" />
  </svg>
);

export const DURATION = 150;

const animatedPct = (frame: number) =>
  Math.round(interpolate(frame, [15, 110], [65, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

// Thin metric progress bar — matches real UI (3px height, ~100px wide)
const TinyBar: React.FC<{ pct: number; width?: number }> = ({ pct, width = 100 }) => (
  <div style={{ width, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
    <div style={{ height: "100%", width: `${pct}%`, background: barColor(pct), borderRadius: 2 }} />
  </div>
);

interface MetricRowProps { name: string; pct: number; delta?: string; isToday?: boolean }
const MetricRow: React.FC<MetricRowProps> = ({ name, pct, delta, isToday }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
    <span style={{ fontSize: 11, color: C.textMuted, width: 130, flexShrink: 0, fontFamily: F.sans }}>{name}</span>
    <TinyBar pct={pct} />
    <span style={{ fontSize: 11, color: pct >= 80 ? C.red : pct >= 60 ? C.amber : C.blue, fontFamily: F.mono, width: 36, textAlign: "right", flexShrink: 0 }}>
      {pct}%
    </span>
    {isToday ? (
      <span style={{ fontSize: 10, color: C.red, fontFamily: F.mono }}>· today</span>
    ) : (
      <span style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{delta}</span>
    )}
  </div>
);

// % badge in top-right of card
const PctBadge: React.FC<{ pct: number }> = ({ pct }) => {
  const bg = pct >= 80 ? "#dc2626" : "#16a34a";
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

interface ServiceCardProps {
  service: string;
  account: string;
  icon: React.ReactNode;
  topPct: number;
  metrics: MetricRowProps[];
  extraCount: number;
  opacity?: number;
}
const ServiceCard: React.FC<ServiceCardProps> = ({ service, account, icon, topPct, metrics, extraCount, opacity = 1 }) => {
  const isCritical = topPct >= 80;
  return (
    <div style={{
      opacity,
      background: isCritical ? "rgba(239,68,68,0.04)" : C.card,
      border: `1px solid ${isCritical ? "rgba(239,68,68,0.2)" : C.border}`,
      borderRadius: 12, padding: "14px 16px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.sans }}>{service}</div>
          <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.sans }}>{account}</div>
        </div>
        <PctBadge pct={topPct} />
      </div>

      {/* Metrics */}
      {metrics.map((m) => <MetricRow key={m.name} {...m} />)}

      <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, marginBottom: 12 }}>
        +{extraCount} more · click for details
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: `1px solid ${C.border}`, paddingTop: 10,
      }}>
        <span style={{ fontSize: 11, color: C.textDim, fontFamily: F.sans }}>Synced 1m ago</span>
        <span style={{ fontSize: 11, color: "#4ade80", fontFamily: F.sans, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 8 }}>●</span> connected
        </span>
      </div>
    </div>
  );
};

export const Scene4Monitoring: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = animatedPct(frame);

  const opacity = interpolate(frame, [0, 12, DURATION - 12, DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const card1Op = interpolate(frame, [0, 10],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card2Op = interpolate(frame, [4, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card3Op = interpolate(frame, [8, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Status counters
  const criticalCount = pct >= 80 ? 1 : 0;
  const warningCount  = pct >= 60 && pct < 80 ? 1 : 0;
  const healthyCount  = 3 - criticalCount - warningCount;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <Sidebar active="dashboard" />

      <div style={{ flex: 1, minWidth: 0, padding: "36px 40px 36px 32px", fontFamily: F.sans }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: C.textMuted,
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "7px 12px",
          }}>
            <span>↺</span>
            <span style={{ fontSize: 11 }}>Updated just now</span>
          </div>
        </div>

        {/* Status grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
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

        {/* Service cards — 3 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <ServiceCard
            opacity={card1Op}
            service="Railway"
            account="personal"
            icon={<RailwayIcon />}
            topPct={12}
            extraCount={3}
            metrics={[
              { name: "Memory Usage",   pct: 12, delta: "-12%" },
              { name: "Peak Memory",    pct: 7,  delta: "-7%" },
              { name: "Network Ingress",pct: 3,  delta: "-3%" },
            ]}
          />

          {/* Supabase — animated */}
          <div style={{
            opacity: card2Op,
            background: pct >= 80 ? "rgba(239,68,68,0.04)" : C.card,
            border: `1px solid ${pct >= 80 ? "rgba(239,68,68,0.2)" : C.border}`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}><SupabaseIcon /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Supabase</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>dbd</div>
              </div>
              <PctBadge pct={pct} />
            </div>

            {/* Animated cache hit ratio */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: C.textMuted, width: 130, flexShrink: 0 }}>Cache Hit Ratio</span>
              <TinyBar pct={pct} />
              <span style={{ fontSize: 11, color: barColor(pct), fontFamily: F.mono, width: 36, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
              {pct >= 90 && <span style={{ fontSize: 10, color: C.red, fontFamily: F.mono }}>· today</span>}
            </div>
            <MetricRow name="Active Connections" pct={18} delta="-19%" />
            <MetricRow name="Database Size"      pct={7}  delta="-7%" />
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2, marginBottom: 12 }}>
              +2 more · click for details
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderTop: `1px solid ${C.border}`, paddingTop: 10,
            }}>
              <span style={{ fontSize: 11, color: C.textDim }}>Synced 1m ago</span>
              <span style={{ fontSize: 11, color: "#4ade80", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 8 }}>●</span> connected
              </span>
            </div>
          </div>

          <ServiceCard
            opacity={card3Op}
            service="MongoDB Atlas"
            account="Atlas 1"
            icon={<MongoIcon />}
            topPct={14}
            extraCount={4}
            metrics={[
              { name: "Active Connections", pct: 14, delta: "-14%" },
              { name: "Network Out",        pct: 2,  delta: "-2%" },
              { name: "Storage",            pct: 1,  delta: "-1%" },
            ]}
          />
        </div>
      </div>
      </div>
    </AbsoluteFill>
  );
};
