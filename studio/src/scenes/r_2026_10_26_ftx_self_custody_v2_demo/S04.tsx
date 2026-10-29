// S04 reveal: the orange key on a plinth, warm rim light, slow low-angle push. "You hold the keys."
import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { Shell, Studio3D, Key, Plinth, Person, Enter, LightLeak, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flip = spring({ frame: f - 0.7 * fps, fps, config: { damping: 14, stiffness: 90 } });
  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" accentRim camera={{ from: [0, 1.9, 12.5], to: [0, 2.1, 10.2], target: [0, 1.75, 0], fov: 30 }}>
        <Plinth radius={0.75} height={0.7} mat="graphite" />
        <Enter at={0} position={[0, 1.55, 0]} from={[0, 0.8, 0]} float={0.05}>
          <group rotation={[0, flip * Math.PI, 0]}>
            <Key accent rotation={[0, 0, 0]} scale={0.75} position={[0, 0.3, 0]} />
          </group>
        </Enter>
        {f > 1.7 * fps && (
          <Enter at={1.7 * fps} position={[-1.2, 0, 0.2]}><Person scale={0.5} mat="clay" /></Enter>
        )}
      </Studio3D>
      <LightLeak at={Math.round(2.1 * fps)} duration={18} />
    </Shell>
  );
};
export default Scene;
