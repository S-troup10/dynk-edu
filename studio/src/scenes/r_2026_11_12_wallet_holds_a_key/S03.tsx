// S03 "Because a crypto wallet doesn't hold your coins. It holds a key." (113 f)
//  1 f0–A    3D  upright Handset (Wallet / 0.42 BTC), camera arcs round to the front   (Because a crypto wallet)
//  2 A–B     3D  xray 0→1: glass phone, empty inside; callout NO COINS IN HERE          (doesn't hold your coins.)
//  3 B–end   3D  macro on glass phone, glowing NumberKey inside, slow push; callout JUST A KEY; thud on "key"
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { CamRig, Sfx, W, clamp, ease, project, type Shot, type Vec3 } from "./_shared";
import { Handset } from "./_shared";
import { NumberKey } from "./_shared";

const PY = 1.2; // phone centre height
const PHONE_LINES = [
  { text: "Wallet", size: 60, weight: 700 },
  { text: "0.42 BTC", size: 84, weight: 700 },
  { text: "Send   Receive", size: 44, color: "#b8b8b8" },
];

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill>
    <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <Handset position={[0, PY, 0]} lines={PHONE_LINES} />
    </Studio3D>
  </AbsoluteFill>
);

const ShotB: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const xr = ease(interpolate(f, [1, 11], [0, 1], clamp));
  const at = project(shot, f, [0.2, PY + 0.2, 0] as Vec3);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Handset position={[0, PY, 0]} lines={PHONE_LINES} xray={xr} />
      </Studio3D>
      <Callout text="NO COINS IN HERE" at={[at[0] + 20, at[1]]} label={[740, 560]} startFrame={10} />
    </AbsoluteFill>
  );
};

const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const at = project(shot, f, [0, PY + 0.1, 0] as Vec3);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Handset position={[0, PY, 0]} lines={PHONE_LINES} xray={1}>
          <NumberKey position={[0, -0.32, 0]} rotation={[0, 0, Math.PI / 2]} scale={0.34} glowLight />
        </Handset>
      </Studio3D>
      <Callout text="JUST A KEY" at={[at[0] + 30, at[1]]} label={[790, 520]} startFrame={9} accent />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 113;
  const cutB = Math.max(36, W(props, "doesn't", 0, 1.6) - 1);
  const cutC = Math.max(cutB + 24, W(props, "It", 0, 2.61) - 1);
  const A: Shot = { from: [-3.4, 1.7, 6.2], to: [0.3, 1.45, 7.0], tFrom: [0, PY, 0], tTo: [0, PY, 0], fov: 30, len: cutB };
  const B: Shot = { from: [0.3, 1.45, 7.0], to: [0.0, 1.35, 6.2], tFrom: [0, PY, 0], tTo: [0, PY, 0], fov: 30, len: cutC - cutB };
  const C: Shot = { from: [0.9, 1.5, 4.2], to: [0.2, 1.3, 3.5], tFrom: [0, PY, 0], tTo: [0, PY, 0], fov: 30, len: total - cutC };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutB} layout="none"><ShotA shot={A} /></Sequence>
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none"><ShotB shot={B} /></Sequence>
      <Sequence from={cutC} durationInFrames={total - cutC} layout="none"><ShotC shot={C} /></Sequence>
      <Sfx name="whoosh_soft" at={cutB} volume={0.25} />
      <Sfx name="tick" at={cutB + 10} volume={0.3} />
      <Sfx name="whoosh_soft" at={cutC} volume={0.3} />
      <Sfx name="thud" at={W(props, "key.", 0, 3.36)} volume={0.4} />
      <Disclaimer text="Illustration · simplified" />
    </Shell>
  );
};
export default Scene;
