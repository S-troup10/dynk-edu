// S07 (dark): "Ten years." beat of silence on an empty plinth, then the orange key rises onto it; a person steps in on
// "self-custody"; light leak on "keys live with you".
import React from "react";
import { useVideoConfig } from "remotion";
import { Shell, Studio3D, Key, Plinth, Person, Enter, LightLeak, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const { fps } = useVideoConfig();
  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" accentRim camera={{ from: [0, 2.2, 13], to: [0, 2.0, 9.6], target: [0, 1.75, 0], fov: 30 }}>
        <Plinth radius={0.75} height={0.7} mat="graphite" />
        <Enter at={Math.round(3.0 * fps)} position={[0, 1.55, 0]} from={[0, -1.2, 0]} float={0.05} spin={Math.PI}>
          <Key accent rotation={[0, 0, 0]} scale={0.75} position={[0, 0.3, 0]} />
        </Enter>
        <Enter at={Math.round(4.0 * fps)} position={[-1.2, 0, 0.2]}><Person scale={0.5} mat="clay" /></Enter>
      </Studio3D>
      <LightLeak at={Math.round(5.3 * fps)} duration={18} />
    </Shell>
  );
};
export default Scene;
