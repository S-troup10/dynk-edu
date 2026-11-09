// Scene: 2026-11-09-bybit-every-signature-real S11 (v2) — "Hackers don't need your keys. They just need your signature."
// Shot 1: three dim chrome keys hanging from wires, slow drift (callout KEYS). Hard cut.
// Shot 2: the glowing ink signature writes itself large in front of the dim keys, camera easing in (callout SIGNATURE).
import React from "react";
import { Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { KeyObj, InkStroke, SIG_POINTS, CamRig, project, Sfx, W, clamp, type Shot, type Vec3 } from "./_shared";

const KEY_X = [-0.8, 0, 0.8];
const BOW_Y = 2.7;

const Wire: React.FC<{ x: number }> = ({ x }) => (
  <mesh position={[x, BOW_Y + 1.1, 0]}>
    <cylinderGeometry args={[0.008, 0.008, 2.2, 6]} />
    <meshStandardMaterial color="#6b6e73" metalness={0.6} roughness={0.5} />
  </mesh>
);

const HangingKeys: React.FC<{ z?: number }> = ({ z = 0 }) => {
  const f = useCurrentFrame();
  return (
    <group position={[0, 0, z]}>
      {KEY_X.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <Wire x={0} />
          <KeyObj dim scale={0.95} position={[0, BOW_Y, 0]}
            rotation={[0, 0.35 * Math.sin(f / 22 + i * 1.7) + 0.4, -Math.PI / 2 + 0.03 * Math.sin(f / 30 + i)]} />
        </group>
      ))}
    </group>
  );
};

const S1: Shot = { from: [-0.9, 2.3, 8.2], to: [0.6, 2.45, 7.6], tFrom: [-0.2, 2.2, 0], tTo: [0.1, 2.15, 0], fov: 34, len: 50 };
const S2: Shot = { from: [0.5, 2.15, 8.6], to: [0, 2.0, 7.2], tFrom: [0, 2.0, 0], tTo: [0, 1.95, 0], fov: 36, len: 56 };

const Scene: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const total = props.durationInFrames ?? 101;
  const cut = 48;
  const fThey = W(props, "They", 0, 1.766);
  const fSig = W(props, "signature", 0, 2.601);
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cut} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: S1.from, to: S1.to, target: S1.tFrom }}>
          <CamRig shot={S1} />
          <pointLight position={[1.5, 3.5, 4]} intensity={30} color="#ffffff" />
          <HangingKeys />
        </Studio3D>
        <Lbl1 />
      </Sequence>
      <Sequence from={cut} durationInFrames={total - cut} layout="none">
        <Studio3D tone="dark" shadows={false} accentRim camera={{ from: S2.from, to: S2.to, target: S2.tFrom }}>
          <CamRig shot={S2} />
          <pointLight position={[1.5, 3.5, 4]} intensity={18} color="#ffffff" />
          <HangingKeys z={-0.9} />
          <SigWrite start={fThey - cut + 2} end={fSig - cut + 30} />
        </Studio3D>
        <Lbl2 start={fSig - cut + 6} />
      </Sequence>
      <Sfx name="glint" at={fThey} volume={0.3} />
      <Sfx name="sub_drop" at={fSig + 14} volume={0.35} />
      <Disclaimer text="Illustration" />
    </Shell>
  );
};

const SigWrite: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const f = useCurrentFrame();
  const p = Easing.inOut(Easing.sin)(interpolate(f, [start, end], [0, 1], clamp));
  return (
    <group position={[0, 1.95, 0.4]} scale={0.8}>
      <InkStroke points={SIG_POINTS} progress={p} radius={0.055} />
    </group>
  );
};

const Lbl1: React.FC = () => {
  const f = useCurrentFrame();
  const at = project(S1, f, [0, BOW_Y - 0.9, 0]);
  return <Callout text="KEYS" at={at} label={[at[0] + 170, at[1] + 250]} startFrame={8} />;
};
const Lbl2: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const at = project(S2, f, [1.0 * 0.8, 1.95 - 0.12, 0.4]);
  return <Callout text="SIGNATURE" at={at} label={[Math.min(at[0] + 40, 800), at[1] + 360]} startFrame={start} accent />;
};

export default Scene;
