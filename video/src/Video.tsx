import { AbsoluteFill, Sequence } from "remotion";
import { Scene1Landing, DURATION as D1 } from "./scenes/Scene1Landing";
import { Scene2Dashboard, DURATION as D2 } from "./scenes/Scene2Dashboard";
import { Scene3Integration, DURATION as D3 } from "./scenes/Scene3Integration";
import { Scene4Monitoring, DURATION as D4 } from "./scenes/Scene4Monitoring";
import { Scene5Alert, DURATION as D5 } from "./scenes/Scene5Alert";
import { Scene6Outcome, DURATION as D6 } from "./scenes/Scene6Outcome";
import { Scene7EndFrame, DURATION as D7 } from "./scenes/Scene7EndFrame";

// Scene start frames
const S1 = 0;
const S2 = S1 + D1;
const S3 = S2 + D2;
const S4 = S3 + D3;
const S5 = S4 + D4;
const S6 = S5 + D5;
const S7 = S6 + D6;

export const TOTAL_FRAMES = D1 + D2 + D3 + D4 + D5 + D6 + D7;

export const StackwatchDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a0a0a" }}>
    <Sequence from={S1} durationInFrames={D1}>
      <Scene1Landing />
    </Sequence>
    <Sequence from={S2} durationInFrames={D2}>
      <Scene2Dashboard />
    </Sequence>
    <Sequence from={S3} durationInFrames={D3}>
      <Scene3Integration />
    </Sequence>
    <Sequence from={S4} durationInFrames={D4}>
      <Scene4Monitoring />
    </Sequence>
    <Sequence from={S5} durationInFrames={D5}>
      <Scene5Alert />
    </Sequence>
    <Sequence from={S6} durationInFrames={D6}>
      <Scene6Outcome />
    </Sequence>
    <Sequence from={S7} durationInFrames={D7}>
      <Scene7EndFrame />
    </Sequence>
  </AbsoluteFill>
);
