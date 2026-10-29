// S03 (dark): 850,000 counts up as a chrome coin stack rises; on "gone" the whole stack sinks through the floor.
import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { Shell, Studio3D, CoinStack, ChromeNumber, Label2, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [90, 130], [0, 850000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const sink = interpolate(f, [150, 178], [0, 4.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const stacks: [number, number, number][] = [[-1.5, -1.0, 7], [0, 0, 11], [1.5, -1.2, 8], [-0.8, -2.4, 9], [0.9, -2.6, 6]];
  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: [0, 3.2, 12.5], to: [0, 2.8, 10.8], target: [0, 1.2, -1], fov: 32 }}>
        <group position={[0, -sink, 0]}>
          {stacks.map(([x, z, c], i) => (
            <CoinStack key={i} count={c} radius={0.55} position={[x, 0, z]} growAt={20 + i * 8} glyph="₿" mat="clay" />
          ))}
        </group>
      </Studio3D>
      {f >= 88 && <ChromeNumber value={n.toLocaleString("en-US")} unit="BTC" y={330} size={140} delay={88} />}
      <Label2 text="≈ 7% of all bitcoin at the time" y={500} delay={120} />
    </Shell>
  );
};
export default Scene;
