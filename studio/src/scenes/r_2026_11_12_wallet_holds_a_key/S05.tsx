// S05 "Your address is a glass letterbox. Anyone can look in. Anyone can drop coins in." (162 f)
//  1 f0–cutB   3D  one Letterbox (18 discs), camera orbiting ~25° to front-on; callout YOUR ADDRESS on the plate
//  2 cutB–cutC 3D  push in to the glass, discs inside; callout PUBLIC
//  3 cutC–end  3D  from above, four discs fall through the slot into the pile (18→22); callout ANYONE CAN PAY IN
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { CamRig, Disc, LB, Letterbox, Sfx, W, clamp, project, type Shot, type Vec3 } from "./_shared";

const outC = Easing.out(Easing.cubic);
const inQ = Easing.in(Easing.quad);
const TGT: Vec3 = [0, 1.3, 0];

const PLATE: Vec3 = [0.32, 0.38, 0.41];
const GLASS: Vec3 = [0.42, 1.55, 0.41];

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const at = project(shot, f, PLATE);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox coins={18} />
      </Studio3D>
      <Callout text="YOUR ADDRESS" at={at} label={[Math.min(880, at[0] + 250), at[1] - 90]} startFrame={14} accent />
    </AbsoluteFill>
  );
};

const ShotB: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const at = project(shot, f, GLASS);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox coins={18} />
      </Studio3D>
      <Callout text="PUBLIC" at={at} label={[880, at[1] + 260]} startFrame={6} accent />
    </AbsoluteFill>
  );
};

const DROPS = [9, 17, 25, 33]; // local start frames, 12 f fall
const FALL = 12;
const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const landed = DROPS.filter((d) => f >= d + FALL).length;
  const slot = project(shot, f, LB.slot);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox coins={18 + landed} />
        {DROPS.map((d, i) => {
          const p = (f - d) / FALL;
          if (p < 0 || p >= 1) return null;
          const y = 2.4 - (2.4 - 0.62 - i * 0.02) * inQ(p);
          const flat = interpolate(y, [1.85, 1.0], [0, 1], clamp);
          const sc = outC(interpolate(f - d, [0, 3], [0, 1], clamp));
          const wob = Math.sin((f + i * 5) / 3) * 0.45 * (1 - flat);
          return (
            <group key={i} scale={sc}>
              <Disc position={[(i - 1.5) * 0.04, y, 0.14]} rotation={[(Math.PI / 2) * (1 - flat), wob, 0]} />
            </group>
          );
        })}
      </Studio3D>
      <Callout text="ANYONE CAN PAY IN" at={slot} label={[Math.max(330, slot[0] - 260), slot[1] - 110]} startFrame={6} accent />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 162;
  const cutB = Math.max(40, W(props, "anyone", 0, 2.18) - 2);
  const cutC = Math.max(cutB + 30, W(props, "anyone", 1, 3.44) - 2);
  const shotA: Shot = { from: [-2.7, 1.9, 6.4], to: [0, 1.75, 6.9], tFrom: TGT, tTo: [0, 1.28, 0], fov: 30, len: cutB };
  const shotB: Shot = { from: [0.5, 2.3, 6.6], to: [0.1, 2.15, 5.3], tFrom: [0, 1.3, 0], tTo: [0, 1.25, 0], fov: 30, len: cutC - cutB };
  const shotC: Shot = { from: [0.9, 3.7, 6.2], to: [0.3, 3.4, 5.6], tFrom: [0, 1.5, 0], tTo: [0, 1.45, 0], fov: 30, len: total - cutC };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutB} layout="none"><ShotA shot={shotA} /></Sequence>
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none"><ShotB shot={shotB} /></Sequence>
      <Sequence from={cutC} durationInFrames={total - cutC} layout="none"><ShotC shot={shotC} /></Sequence>
      <Sfx name="whoosh_soft" at={cutB} volume={0.3} />
      {DROPS.map((d, i) => <Sfx key={i} name="tick" at={cutC + d + FALL} volume={0.4} />)}
      <Disclaimer text="Illustration · example address" />
    </Shell>
  );
};
export default Scene;
