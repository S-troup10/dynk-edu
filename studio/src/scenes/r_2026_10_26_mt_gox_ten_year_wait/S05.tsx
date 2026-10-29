// S05 (dark): close on a phone showing "10.00 BTC" (a number on their website), then the camera pulls back
// to reveal the exchange behind it, and the orange key appears inside it on "the exchange holds the keys".
import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { Shell, Studio3D, Phone, Bank, Key, Enter, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const a = props.assets as Record<string, string>;
  const f = useCurrentFrame();
  const side = interpolate(f, [150, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: [0.2, 2.3, 8.6], to: [0, 3.0, 15.5], target: [0, 2.05, -1.5], fov: 32, startFrame: 105, durationFrames: 115 }}>
        <group position={[-1.45 * side, 0, 1.6 - 0.6 * side]} scale={1 - 0.35 * side}>
          <Enter at={0} position={[0, 0, 0]} from={[0, -0.5, 0]} float={0.03}>
            <Phone screen={a.balance} position={[0, 1.85, 0]} rotation={[0, -0.12 + 0.18 * side, 0]} scale={0.95} />
          </Enter>
        </group>
        <Enter at={95} position={[0.7, 0, -3.2]}><Bank label="EXCHANGE" scale={1.0} /></Enter>
        {/* key lands on "keys" (6.67s) above the exchange */}
        <Enter at={196} position={[0.7, 4.1, -3.0]} from={[0, 1.0, 0]} float={0.05}>
          <Key accent rotation={[0, 0.3, Math.PI / 2]} scale={0.6} position={[0, 0, 0]} />
        </Enter>
      </Studio3D>
    </Shell>
  );
};
export default Scene;
