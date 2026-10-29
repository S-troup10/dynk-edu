// S02 stakes: a crowd of chrome customers, one orange padlock in front. Number does the talking.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Person, Padlock, Enter, ChromeNumber, Label2, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [8, 40], [0, 1000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const crowd: [number, number][] = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) crowd.push([(c - 4) * 1.05 + (r % 2) * 0.5, -r * 1.2 - 1.5]);
  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: [0, 3.6, 11], to: [0, 3.3, 9.6], target: [0, 0.6, -3.5], fov: 36 }}>
        {crowd.map(([x, z], i) => (
          <Enter key={i} at={Math.max(0, i * 0.35 - 6)} position={[x, 0, z]} float={0}>
            <Person scale={0.5} mat={i % 4 === 0 ? "graphite" : "clay"} />
          </Enter>
        ))}
        <Enter at={44} position={[0, 0, 2.2]} from={[0, 1.0, 0]} float={0.03}>
          <Padlock accent scale={0.55} position={[0, 0.36, 0]} />
        </Enter>
      </Studio3D>
      <ChromeNumber value={n.toLocaleString("en-US")} unit="+" y={330} size={140} delay={4} />
      <Label2 text="FTX customers, November 2022" y={505} delay={14} />
    </Shell>
  );
};
export default Scene;
