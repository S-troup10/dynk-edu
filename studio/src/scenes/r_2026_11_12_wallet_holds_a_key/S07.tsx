// S07 "In 2013, James Howells threw out an old hard drive, with the only copy of his key." (182 f)
//  1 f0–c1    3D  two identical drives on the desk, camera sliding; slate 2013 · NEWPORT, WALES      (In 2013,)
//  2 c1–c2    3D  one drive lifted off the desk (orange seam = his)                                   (James Howells)
//  3 c2–c3    3D  bin, lid open, drive drops in, lid shuts, thud                                      (threw out an old hard drive,)
//  4 c3–c4    3D  drive alone, xray -> platter + glowing key                                          (with the only copy)
//  5 c4–end   3D  tighter new angle, callout THE ONLY COPY                                            (of his key.)
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, HardDrive, Bin, Sfx, W, project, clamp, ORANGE, type Shot, type Vec3 } from "./_shared";

const outC = Easing.out(Easing.cubic);
const DY = 0.13; // drive centre height when lying on the floor

const Slate: React.FC = () => {
  const f = useCurrentFrame();
  const e = outC(interpolate(f, [4, 12], [0, 1], clamp));
  return (
    <div style={{ position: "absolute", left: 90, top: 410, opacity: e, transform: `translate3d(0, ${(1 - e) * 12}px, 0)`, fontFamily: brand.body }}>
      <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: 5, color: "rgba(255,255,255,0.92)" }}>2013 · NEWPORT, WALES</div>
      <div style={{ marginTop: 12, height: 3, width: 70 * e, background: ORANGE }} />
    </div>
  );
};

const Shot1: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill>
    <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <HardDrive position={[-0.85, DY, 0]} rotation={[0, 0.25, 0]} />
      <HardDrive position={[0.85, DY, 0.05]} rotation={[0, -0.2, 0]} seam />
    </Studio3D>
    <Slate />
  </AbsoluteFill>
);

const Shot2: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const lift = Easing.inOut(Easing.cubic)(interpolate(f, [4, 26], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <HardDrive position={[-0.85, DY, 0]} rotation={[0, 0.25, 0]} />
        <HardDrive position={[0.85 - lift * 0.55, DY + lift * 0.95, 0.05 + lift * 0.3]} rotation={[lift * 0.35, -0.2 + lift * 0.5, lift * -0.2]} seam />
      </Studio3D>
    </AbsoluteFill>
  );
};

const Shot3: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const t0 = 6, dur = 14;
  const p = interpolate(f, [t0, t0 + dur], [0, 1], clamp);
  const fall = p * p; // gravity feel
  const y = 2.7 - fall * 2.2;
  const lid = 1 - Easing.inOut(Easing.cubic)(interpolate(f, [t0 + dur + 2, t0 + dur + 18], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Bin position={[0, 0, 0]} lid={lid} />
        <HardDrive position={[0.02, y, 0.05]} scale={0.5} rotation={[p * 0.9, 0.4 + p * 1.2, p * 0.5]} seam />
      </Studio3D>
    </AbsoluteFill>
  );
};

const KS = 1.6;
const DRIVE_POS: Vec3 = [0, DY + 0.1, 0];
const KEY_WORLD: Vec3 = [DRIVE_POS[0] + -0.3 * KS + 0.5, DRIVE_POS[1] + 0.1 * KS, DRIVE_POS[2] - 0.2 * KS];

const Shot4: React.FC<{ shot: Shot; xrayFrom: number }> = ({ shot, xrayFrom }) => {
  const f = useCurrentFrame();
  const x = Easing.inOut(Easing.cubic)(interpolate(f, [xrayFrom, xrayFrom + 12], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <HardDrive position={DRIVE_POS} scale={KS} xray={x} keyInside />
      </Studio3D>
    </AbsoluteFill>
  );
};

const Shot5: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const [kx, ky] = project(shot, f, KEY_WORLD);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <HardDrive position={DRIVE_POS} scale={KS} xray={1} keyInside />
      </Studio3D>
      <Callout text="THE ONLY COPY" at={[kx, ky]} label={[540, Math.max(520, Math.min(ky - 150, 700))]} startFrame={4} accent />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 182;
  const c1 = Math.max(30, W(props, "James", 0, 1.32) - 1);
  const c2 = Math.max(c1 + 24, W(props, "threw", 0, 2.14) - 8);
  const c3 = Math.max(c2 + 36, W(props, "with", 0, 4.29));
  const c4 = Math.max(c3 + 20, W(props, "of", 0, 5.32));
  const s1: Shot = { from: [-3.0, 1.3, 4.6], to: [2.6, 1.5, 4.4], tFrom: [-0.4, 0.2, 0], tTo: [0.4, 0.2, 0], fov: 30, len: c1 };
  const s2: Shot = { from: [1.8, 1.0, 3.6], to: [0.7, 1.7, 3.3], tFrom: [0.2, 0.5, 0], tTo: [0, 0.8, 0], fov: 30, len: c2 - c1 };
  const s3: Shot = { from: [2.8, 2.5, 4.6], to: [1.6, 2.2, 3.8], tFrom: [0, 1.0, 0], tTo: [0, 0.9, 0], fov: 32, len: c3 - c2 };
  const s4: Shot = { from: [0.1, 2.9, 2.9], to: [0, 2.3, 2.1], tFrom: [0, 0.2, 0], tTo: [0, 0.2, 0], fov: 30, len: c4 - c3 };
  const s5: Shot = { from: [-1.5, 1.6, 2.1], to: [-0.5, 1.2, 1.5], tFrom: [0, 0.3, -0.1], tTo: [0.05, 0.3, -0.25], fov: 30, len: total - c4 };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c1} layout="none"><Shot1 shot={s1} /></Sequence>
      <Sequence from={c1} durationInFrames={c2 - c1} layout="none"><Shot2 shot={s2} /></Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="none"><Shot3 shot={s3} /></Sequence>
      <Sequence from={c3} durationInFrames={c4 - c3} layout="none"><Shot4 shot={s4} xrayFrom={2} /></Sequence>
      <Sequence from={c4} durationInFrames={total - c4} layout="none"><Shot5 shot={s5} /></Sequence>
      <Sfx name="whoosh_soft" at={c1} volume={0.28} />
      <Sfx name="tick" at={c1 + 8} volume={0.4} />
      <Sfx name="thud" at={c2 + 20} volume={0.4} />
      <Sfx name="glint" at={c3 + 4} volume={0.3} />
      <Disclaimer text="Illustration · per court documents, 2025" />
    </Shell>
  );
};
export default Scene;
