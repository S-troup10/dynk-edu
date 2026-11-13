// S10 "That's why losing your phone doesn't lose your coins. And why anyone with those words gets everything." (180 f)
//  1 f0–A    3D  Handset tips and falls away; glowing Letterbox (30 coins) stays; callout PHONE: GONE   (That's why losing your phone)
//  2 A–B     3D  WordPlate foreground, fresh orange NumberKey rises, glides to the box; SAME WORDS → SAME KEY (doesn't lose your coins.)
//  3 B–C     3D  same plate, a dim grey stranger's key rises, heads for the keyhole                   (And why anyone with those words)
//  4 C–end   3D  door opens, 30 discs slide out right and off frame, glow → dim; NO UNDO               (gets everything.)
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { CamRig, Sfx, W, clamp, ease, project, rand, Letterbox, Disc, Handset, WordPlate, NumberKey, type Shot, type Vec3 } from "./_shared";

const PHONE_LINES = [
  { text: "Wallet", size: 60, weight: 700 },
  { text: "0.42 BTC", size: 84, weight: 700 },
  { text: "Send   Receive", size: 44, color: "#b8b8b8" },
];
const KEY_S = 0.34;
const BOX: Vec3 = [0.3, 0, -0.5];
const PLATE: Vec3 = [0.3, 0.95, 2.6];
const PLATE_ROT: Vec3 = [-0.4, 0, 0];

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

/* ---------- shot 1: phone falls away, box stays ---------- */
const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [6, 44], [0, 1], clamp);
  const tip = ease(interpolate(f, [0, 16], [0, 1], clamp));
  const fall = p * p;
  const pos: Vec3 = [-0.75 - p * 0.35, 1.15 - fall * 4.2, 1.6 + fall * 1.4];
  const rot: Vec3 = [tip * 0.25 + p * 0.9, 0.15, -tip * 0.5 - p * 1.1];
  const at = project(shot, 28, [-0.8, 0.5, 1.6]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Handset position={pos} rotation={rot} lines={PHONE_LINES} />
        <Letterbox position={[0.8, 0, -0.8]} coins={30} glow />
      </Studio3D>
      <Callout text="PHONE: GONE" at={[at[0], at[1]]} label={[at[0] + 20, 1330]} startFrame={26} />
    </AbsoluteFill>
  );
};

/* ---------- shots 2 & 3: plate in front, key rises and glides to the keyhole ---------- */
const KeyShot: React.FC<{ shot: Shot; stranger?: boolean }> = ({ shot, stranger = false }) => {
  const f = useCurrentFrame();
  const rise = ease(interpolate(f, [4, stranger ? 18 : 20], [0, 1], clamp));
  const glide = ease(interpolate(f, [stranger ? 16 : 18, shot.len - 1], [0, 1], clamp));
  const start: Vec3 = [-0.1, PLATE[1] + 0.25, PLATE[2] + 0.1];
  const up: Vec3 = [-0.1, PLATE[1] + 0.9, PLATE[2] + 0.1];
  const end: Vec3 = [-0.1, 1.12, 0.7];
  const pos = lerp3(lerp3(start, up, rise), end, glide);
  const rotY = glide * 0.5;
  const rotZ = (1 - rise) * 0.5;
  const sc = KEY_S * (0.4 + rise * 0.6);
  const at = project(shot, 20, [0.95, PLATE[1] - 0.1, PLATE[2]]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox position={BOX} coins={30} glow keyGlow={stranger && glide > 0.7} />
        <WordPlate position={PLATE} rotation={PLATE_ROT} scale={0.45} count={12} />
        {rise > 0.02 && <NumberKey position={pos} rotation={[0, rotY, rotZ]} scale={sc} dim={stranger} glowLight={!stranger} />}
      </Studio3D>
      {!stranger && <Callout text="SAME WORDS → SAME KEY" at={[at[0], at[1]]} label={[790, 1530]} startFrame={14} accent />}
    </AbsoluteFill>
  );
};

/* ---------- shot 4: door opens, discs slide out to the right ---------- */
const N_OUT = 14;
const ShotD: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const open = ease(interpolate(f, [4, 18], [0, 1], clamp));
  const coins = Math.round(30 * (1 - interpolate(f, [6, 20], [0, 1], clamp)));
  const dim = f >= 20;
  const origin: Vec3 = [-0.5, 0, 0];
  const discs = [];
  for (let i = 0; i < N_OUT; i++) {
    const s = 6 + i;
    const p = interpolate(f, [s, s + 30], [0, 1], clamp);
    if (f < s) continue;
    const e = p * p * (3 - 2 * p) * 0.4 + p * 0.6;
    const sx = (rand(i + 1) - 0.5) * 0.7, sz = (rand(i + 9) - 0.5) * 0.4;
    const x = origin[0] + sx + e * (2.3 + rand(i + 4) * 1.2);
    const outside = Math.max(0, x - origin[0] - 0.65);
    const y = 0.53 - outside * outside * 0.12;
    const z = origin[2] + sz + e * (0.6 + rand(i + 6) * 0.9);
    discs.push(<Disc key={i} position={[x, y, z]} rotation={[p * 2.4 * (rand(i + 3) + 0.5), 0, p * 1.3]} />);
  }
  const at = project(shot, 24, [origin[0] + 0.2, 1.3, 0.2]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox position={origin} coins={coins} open={open} glow />
        {discs}
      </Studio3D>
      <Callout text="NO UNDO" at={[at[0] - 120, at[1] + 120]} label={[330, 1420]} startFrame={18} accent />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 180;
  const b = Math.max(40, W(props, "doesn't", 0, 1.7) - 1);
  const c = Math.max(b + 30, W(props, "And", 0, 2.97) - 1);
  const d = Math.max(c + 30, W(props, "gets", 0, 4.87) - 1);
  const s1: Shot = { from: [0.3, 1.7, 9.6], to: [0.1, 1.5, 8.6], tFrom: [0.0, 1.2, 0], tTo: [0.05, 1.1, 0], fov: 32, len: b };
  const s2: Shot = { from: [0.8, 2.0, 8.3], to: [0.45, 1.8, 7.3], tFrom: [0.3, 1.1, 0.3], tTo: [0.3, 1.1, 0.3], fov: 32, len: c - b };
  const s3: Shot = { from: [-0.3, 1.8, 7.9], to: [0.1, 1.95, 7.0], tFrom: [0.3, 1.1, 0.3], tTo: [0.3, 1.1, 0.3], fov: 32, len: d - c };
  const s4: Shot = { from: [-0.6, 1.8, 9.2], to: [0.6, 1.6, 8.4], tFrom: [0.0, 1.15, 0], tTo: [0.3, 1.05, 0], fov: 34, len: total - d };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={b} layout="none"><ShotA shot={s1} /></Sequence>
      <Sequence from={b} durationInFrames={c - b} layout="none"><KeyShot shot={s2} /></Sequence>
      <Sequence from={c} durationInFrames={d - c} layout="none"><KeyShot shot={s3} stranger /></Sequence>
      <Sequence from={d} durationInFrames={total - d} layout="none"><ShotD shot={s4} /></Sequence>
      <Sfx name="whoosh_soft" at={12} volume={0.3} />
      <Sfx name="glint" at={b + 22} volume={0.3} />
      <Sfx name="whoosh_soft" at={c + 2} volume={0.28} />
      <Sfx name="thud" at={d + 6} volume={0.4} />
      <Sequence from={d} durationInFrames={total - d} layout="none"><Disclaimer text="Illustration · simplified" /></Sequence>
    </Shell>
  );
};
export default Scene;
