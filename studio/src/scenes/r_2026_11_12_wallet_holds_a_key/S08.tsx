// S08 "It's somewhere under 1.4 million tonnes of rubbish. And the courts said no digging." (157 f)
//  1 f0–38    3D  low angle at the foot of the heap, craning up its side (It's somewhere under)
//  2 38–106   3D  wide high heap, small orange glow inside, 1,400,000 counter + TONNES, sub_drop (1.4 million tonnes of rubbish.)
//  3 106–134  2D  court-notice card, two orange stamps (And the courts said)
//  4 134–157  3D  heap behind barrier posts rising in sequence, callout NO DIG (no digging.)
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Cam2D, RubbishHeap, Sfx, W, STORY, ORANGE, clamp, project, type Shot, type Vec3 } from "./_shared";

const outC = Easing.out(Easing.cubic);
const GLOW: Vec3 = [0.4, 1.7, 0.6];

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill>
    <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <RubbishHeap R={6} H={4} />
    </Studio3D>
  </AbsoluteFill>
);

const ShotB: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const cnt = Math.round(interpolate(f, [4, 24], [0, 1400000], { ...clamp, easing: Easing.out(Easing.cubic) }) / 2000) * 2000;
  const shown = f >= 24 ? 1400000 : cnt;
  const op = outC(interpolate(f, [2, 10], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <RubbishHeap R={6} H={4} glowAt={GLOW} />
      </Studio3D>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, padding: "40px 0", background: "radial-gradient(ellipse at center, rgba(8,8,10,0.85) 0%, rgba(8,8,10,0.55) 55%, rgba(8,8,10,0) 80%)", textAlign: "center", opacity: op, transform: `translateY(${(1 - op) * 14}px)` }}>
        <div style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 700, fontSize: 88, color: "#f2f2f2", fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}>
          {shown.toLocaleString("en-US")}
        </div>
        <div style={{ fontFamily: brand.body, fontWeight: 600, fontSize: 28, letterSpacing: 8, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>TONNES</div>
      </div>
    </AbsoluteFill>
  );
};

const ShotC: React.FC = () => {
  const f = useCurrentFrame();
  const e = (a: number, b: number) => outC(interpolate(f, [a, b], [0, 1], clamp));
  const stamp = (at: number) => {
    const p = e(at, at + 5);
    return { opacity: p, transform: `scale(${1.15 - 0.15 * p})` };
  };
  const mono = { fontFamily: brand.body, textTransform: "uppercase" as const };
  return (
    <AbsoluteFill style={{ background: "#0d0e10" }}>
      <Cam2D shot={{ from: { x: 14, y: 12, s: 1.0 }, to: { x: -10, y: -8, s: 1.05 }, len: 28 }}>
        <div style={{ position: "absolute", left: 110, width: 860, top: 600, height: 640, background: "#eeeae0", borderRadius: 10,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)", padding: "64px 56px", boxSizing: "border-box", opacity: e(0, 5) }}>
          <div style={{ ...mono, fontWeight: 600, fontSize: 26, letterSpacing: 6, color: "#6a6a66", marginBottom: 44 }}>Court notice</div>
          <div style={{ opacity: e(1, 6) }}>
            <div style={{ ...mono, fontWeight: 600, fontSize: 40, letterSpacing: 3, color: "#1b1b1b" }}>{STORY.court1}</div>
            <div style={{ ...mono, fontWeight: 800, fontSize: 60, color: ORANGE, marginTop: 14, transformOrigin: "left center", ...stamp(6) }}>{STORY.court1b}</div>
          </div>
          <div style={{ height: 2, background: "#bdb9ad", margin: "52px 0", opacity: e(10, 14) }} />
          <div style={{ opacity: e(12, 17) }}>
            <div style={{ ...mono, fontWeight: 600, fontSize: 40, letterSpacing: 3, color: "#1b1b1b" }}>{STORY.court2}</div>
            <div style={{ ...mono, fontWeight: 800, fontSize: 60, color: ORANGE, marginTop: 14, transformOrigin: "left center", ...stamp(17) }}>{STORY.court2b}</div>
          </div>
        </div>
      </Cam2D>
    </AbsoluteFill>
  );
};

const POSTS = Array.from({ length: 9 }, (_, i) => -4.4 + i * 1.1);
const POST_Z = 4.6;
const ShotD: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const callTop = project(shot, f, [0, 1.6, POST_Z]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <RubbishHeap R={6} H={4} />
        {POSTS.map((x, i) => {
          const p = outC(interpolate(f, [i * 3, i * 3 + 6], [0, 1], clamp));
          return (
            <mesh key={i} position={[x, 0.8 * p, POST_Z]} scale={[1, Math.max(0.001, p), 1]}>
              <boxGeometry args={[0.28, 1.6, 0.28]} />
              <meshStandardMaterial color="#8a8d93" metalness={0.7} roughness={0.35} />
            </mesh>
          );
        })}
      </Studio3D>
      <Callout text="NO DIG" at={[callTop[0], callTop[1] + 20]} label={[760, 1380]} startFrame={10} accent />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 157;
  const c2 = Math.max(30, W(props, "1.4", 0, 1.28) - 0);
  const c3 = Math.max(c2 + 40, W(props, "and", 0, 3.6) - 2);
  const c4 = Math.max(c3 + 24, W(props, "no", 0, 4.47));
  const shotA: Shot = { from: [-1.2, 0.6, 14.5], to: [1.6, 2.2, 13.2], tFrom: [0, 1.2, 0], tTo: [0, 2.2, 0], fov: 46, len: c2 };
  const shotB: Shot = { from: [-3, 12, 34], to: [2, 13.4, 32], tFrom: [0, 0.6, 0], tTo: [0, 0.6, 0], fov: 34, len: c3 - c2 };
  const shotD: Shot = { from: [-3, 3.4, 23], to: [1.6, 4.2, 21.2], tFrom: [0, 1.0, 1.5], tTo: [0, 1.2, 1.5], fov: 40, len: total - c4 };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c2} layout="none"><ShotA shot={shotA} /></Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="none"><ShotB shot={shotB} /></Sequence>
      <Sequence from={c3} durationInFrames={c4 - c3} layout="none"><ShotC /></Sequence>
      <Sequence from={c4} durationInFrames={total - c4} layout="none"><ShotD shot={shotD} /></Sequence>
      <Sfx name="whoosh_soft" at={c2} volume={0.3} />
      <Sfx name="sub_drop" at={c2 + 4} volume={0.5} />
      <Sfx name="click" at={c3 + 6} volume={0.5} />
      <Sfx name="click" at={c3 + 17} volume={0.5} />
      <Sfx name="whoosh_soft" at={c4} volume={0.3} />
      <Sequence from={c4} layout="none"><Disclaimer text="Sources in caption" /></Sequence>
    </Shell>
  );
};
export default Scene;
