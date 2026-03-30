import { Composition } from "remotion";
import { StackwatchDemo, TOTAL_FRAMES } from "./Video";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="StackwatchDemo"
    component={StackwatchDemo}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1280}
    height={720}
  />
);
