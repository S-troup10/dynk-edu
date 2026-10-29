// S03 mechanism (light tone): you send coins INTO the exchange; it keeps the key; you get an IOU card.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Bank, Person, ArcTravel, Key, Card, Enter, type SceneProps } from "../../kit";

const S = 30; // fps
const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const p1 = interpolate(f, [0.6 * S, 1.6 * S], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2 = interpolate(f, [1.3 * S, 2.3 * S], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Shell props={props} tone="light">
      <Studio3D tone="light" camera={{ from: [0.4, 3.2, 17], to: [0, 2.9, 15], target: [0, 1.6, 0], fov: 32 }}>
        <Enter at={0} position={[0.7, 0, -1]}><Bank label="EXCHANGE" scale={0.8} /></Enter>
        <Enter at={6} position={[-1.5, 0, 1.6]}><Person scale={0.8} /></Enter>
        {p1 > 0 && p1 < 1 && <ArcTravel from={[-1.5, 1.3, 1.6]} to={[0.7, 1.1, -0.2]} p={p1} accent={false} />}
        {p2 > 0 && p2 < 1 && <ArcTravel from={[-1.5, 1.3, 1.6]} to={[0.7, 1.1, -0.2]} p={p2} accent={false} trail={false} />}
        {f > 4.1 * S && (
          <Enter at={4.1 * S} position={[0.7, 3.5, -0.6]} from={[0, 1.2, 0]} float={0.06}>
            <Key accent rotation={[0, 0.4, Math.PI / 2]} scale={0.55} position={[0, 0, 0]} />
          </Enter>
        )}
        {f > 5.5 * S && (
          <Enter at={5.5 * S} position={[-1.0, 2.7, 1.9]} from={[0, 0.8, 0]} float={0.05}>
            <group scale={0.6}><Card label="IOU" mat="graphite" rotation={[0.05, 0.15, 0.04]} position={[0, 0, 0]} /></group>
          </Enter>
        )}
      </Studio3D>
    </Shell>
  );
};
export default Scene;
