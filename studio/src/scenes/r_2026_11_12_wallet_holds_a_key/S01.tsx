// S01 HOOK (135 f) "This man's 8,000 bitcoin are buried in a rubbish tip. Except they're not."
//  1 f0–c1   3D  HardDrive (orange seam) tumbling through dark air, camera tracking down            (This man's)
//  2 c1–c2   3D  glowing Letterbox, 60 discs, push in on the glass, callout 8,000 BTC                (8,000 bitcoin)
//  3 c2–c3   3D  low angle: drive lands on a small RubbishHeap (grow .25→.6), thud                  (are buried)
//  4 c3–c4   3D  wide heap, crane up and back, faint orange glow inside, callout NEWPORT, WALES      (in a rubbish tip.)
//  5 c4–end  3D  same glowing Letterbox, door shut, 60 discs, slow push, callout STILL HERE, sub_drop (Except they're not.)
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { CamRig, HardDrive, Letterbox, RubbishHeap, HookText, Sfx, W, project, LB, clamp, type Shot, type Vec3 } from "./_shared";

const outC = Easing.out(Easing.cubic);
const inQ = Easing.in(Easing.quad);

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const p = f / shot.len;
  const pos: Vec3 = [0, 1.3 - p * 0.5, 0];
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <HardDrive seam position={pos} rotation={[0.55 + f * 0.035, 0.6 + f * 0.05, 0.25 + f * 0.02]} scale={1.15} />
      </Studio3D>
    </AbsoluteFill>
  );
};

const ShotB: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const ctr = (g: number): [number, number] => project(shot, f, [0.55, 1.1 + g, 0.4]);
  const at = ctr(0);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox glow coins={60} />
      </Studio3D>
      <Callout text="8,000 BTC" at={at} label={[at[0] + 20, 1330]} startFrame={6} />
    </AbsoluteFill>
  );
};

const LAND = 11;
const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const fall = inQ(interpolate(f, [0, LAND], [0, 1], clamp));
  const y = 3.2 + (1.05 - 3.2) * fall;
  const settle = outC(interpolate(f, [LAND, LAND + 8], [0, 1], clamp));
  const rot: Vec3 = [0.5 - 0.5 * fall + 0.06 * settle, 0.3 + f * 0.05 * (1 - settle), 0.2 * (1 - fall)];
  const grow = 0.25 + 0.35 * outC(interpolate(f, [LAND, LAND + 14], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <RubbishHeap R={2.4} H={1.3} count={500} grow={grow} />
        <HardDrive seam position={[0, y, 0]} rotation={rot} scale={0.9} />
      </Studio3D>
    </AbsoluteFill>
  );
};

const ShotD: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const glow = interpolate(f, [0, 14], [0, 0.5], clamp);
  const at = project(shot, f, [0.3, 1.0, 0.5]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <RubbishHeap R={5} H={3} grow={1} glowAt={[0, 1.2, 0]} glow={glow} />
      </Studio3D>
      <Callout text="NEWPORT, WALES" at={[540, 1100]} label={[540, 1340]} startFrame={8} />
    </AbsoluteFill>
  );
};

const ShotE: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const at = project(shot, f, [0, 1.25, 0.42]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox glow coins={60} />
      </Studio3D>
      <Callout text="STILL HERE" at={at} label={[at[0], 1360]} startFrame={8} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 135;
  const c1 = Math.max(16, W(props, "8,000", 0, 0.483) + 1);
  const c2 = Math.max(c1 + 22, W(props, "are", 0, 1.456));
  const c3 = Math.max(c2 + 20, W(props, "in", 0, 2.234));
  const c4 = Math.max(c3 + 24, W(props, "Except", 0, 3.332) - 1);
  const notF = W(props, "not.", 0, 4.131);
  const a: Shot = { from: [0.4, 3.0, 5.6], to: [0.2, 1.4, 5.0], tFrom: [0, 1.9, 0], tTo: [0, 1.3, 0], fov: 32, len: c1 };
  const b: Shot = { from: [1.7, 2.2, 5.4], to: [0.5, 1.7, 3.9], tFrom: [0, 1.85, 0], tTo: [0, 1.8, 0], fov: 34, len: c2 - c1 };
  const c: Shot = { from: [2.8, 0.45, 4.4], to: [1.6, 0.8, 3.8], tFrom: [0, 1.6, 0], tTo: [0, 1.5, 0], fov: 38, len: c3 - c2 };
  const d: Shot = { from: [0, 3.0, 11.5], to: [0, 6.0, 15], tFrom: [0, 2.6, 0], tTo: [0, 2.2, 0], fov: 38, len: c4 - c3 };
  const e: Shot = { from: [-1.6, 1.8, 5.2], to: [-0.4, 1.7, 3.7], tFrom: [0, 1.85, 0], tTo: [0, 1.8, 0], fov: 34, len: total - c4 };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c1} layout="none"><ShotA shot={a} /></Sequence>
      <Sequence from={c1} durationInFrames={c2 - c1} layout="none"><ShotB shot={b} /></Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="none"><ShotC shot={c} /></Sequence>
      <Sequence from={c3} durationInFrames={c4 - c3} layout="none"><ShotD shot={d} /></Sequence>
      <Sequence from={c4} durationInFrames={total - c4} layout="none"><ShotE shot={e} /></Sequence>
      <HookText a="8,000 BITCOIN." b="IN A RUBBISH TIP." from={0} to={46} />
      <Disclaimer text="Illustration · James Howells case, Newport (UK)" />
      <Sfx name="whoosh_soft" at={c1} volume={0.3} />
      <Sfx name="thud" at={c2 + LAND} volume={0.4} />
      <Sfx name="whoosh_soft" at={c3} volume={0.25} />
      <Sfx name="whoosh_soft" at={c4} volume={0.3} />
      <Sfx name="sub_drop" at={notF} volume={0.5} />
    </Shell>
  );
};
export default Scene;
