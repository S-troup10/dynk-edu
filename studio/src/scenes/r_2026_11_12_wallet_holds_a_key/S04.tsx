// S04 "The coins live on a public ledger, copied across thousands of computers." (135 f)
//  1 f0–c1   3D  high three-quarter LedgerWall (one hot box), camera craning down; callout THE LEDGER
//  2 c1–c2   3D  NodeField, camera low moving forward, wave 0→0.6; air_rise
//  3 c2–end  3D  high wide of the whole field, wave 0.6→1, camera rising; callout EVERY ONE KEEPS A COPY
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { CamRig, Disc, Discs, LedgerWall, NodeField, Sfx, W, clamp, ease, project, wallPos, type Shot } from "./_shared";

const ROWS = 6, COLS = 9, HOT = 22;

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const hot = wallPos(ROWS, COLS, HOT);
  const [px, py] = project(shot, f, [hot[0], hot[1] + 0.3, hot[2]]);
  const [wx, wy] = project(shot, f, [-1.0, 2.4, 0]);
  void px; void py;
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <LedgerWall rows={ROWS} cols={COLS} hot={HOT} position={[0, 0, 0]} />
        <Discs n={16} max={16} w={2.4} d={1.0} position={[-1.2, 0, 1.4]} seed={5} />
        <Disc position={[1.6, 0.03, 1.9]} rotation={[0.1, 0.5, 0.05]} />
        <Disc position={[2.0, 0.03, 1.5]} rotation={[0, 1.2, 0]} />
      </Studio3D>
      <Callout text="THE LEDGER" at={[wx, wy]} label={[Math.min(Math.max(wx + 180, 300), 760), Math.max(wy - 80, 470)]} startFrame={10} />
    </AbsoluteFill>
  );
};

const ShotB: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const wave = 0.6 * ease(interpolate(f, [0, shot.len], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <NodeField rows={14} cols={12} wave={wave} />
      </Studio3D>
    </AbsoluteFill>
  );
};

const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const wave = 0.6 + 0.4 * ease(interpolate(f, [0, shot.len], [0, 1], clamp));
  const [cx, cy] = project(shot, f, [2.2, 0.4, 1.5]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <NodeField rows={14} cols={12} wave={wave} />
      </Studio3D>
      <Callout text="EVERY ONE KEEPS A COPY" at={[cx, cy]} label={[540, 1330]} startFrame={10} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 135;
  const c1 = Math.max(40, W(props, "copied", 0, 2.09) - 1);
  const c2 = Math.max(c1 + 20, W(props, "thousands", 0, 2.98) - 1);
  const a: Shot = { from: [-4.2, 6.2, 9.6], to: [-2.2, 3.4, 9.2], tFrom: [0, 2.0, 0], tTo: [0, 1.9, 0], fov: 32, len: c1 };
  const b: Shot = { from: [-1.2, 0.8, 9.0], to: [0.4, 1.1, 5.6], tFrom: [0, 0.6, 0], tTo: [0, 0.5, -2], fov: 40, len: c2 - c1 };
  const c: Shot = { from: [0, 7.5, 14.5], to: [0, 10.5, 15.5], tFrom: [0, 0, 0], tTo: [0, 0, 0], fov: 40, len: total - c2 };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c1} layout="none"><ShotA shot={a} /></Sequence>
      <Sequence from={c1} durationInFrames={c2 - c1} layout="none"><ShotB shot={b} /></Sequence>
      <Sequence from={c2} durationInFrames={total - c2} layout="none"><ShotC shot={c} /></Sequence>
      <Sfx name="whoosh_soft" at={c1} volume={0.3} />
      <Sfx name="air_rise" at={c1} volume={0.3} />
      <Sfx name="whoosh_soft" at={c2} volume={0.28} />
      <Sfx name="tick" at={14} volume={0.3} />
      <Disclaimer text="Illustration · simplified" />
    </Shell>
  );
};
export default Scene;
