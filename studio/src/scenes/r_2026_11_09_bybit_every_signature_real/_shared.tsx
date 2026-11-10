// Shared props + objects for run 2026-11-09-bybit-every-signature-real ("$1.5B, and every signature was real").
// Written by the director. Composers IMPORT from here and never edit it, so every scene shares one world:
// INK & SIGNATURES. Orange glowing ink (the signature) is the accent system; graphite glass signature cards, a chrome
// fountain pen, a multisig vault door with three keyholes, hex tokens, a trap gift box, a magnifier, towers of signed
// paper, a CONFIRM keycap. NOTHING from the $91M video's visual set (coins, balance plates, chrome $ slams, padlocks,
// phone chat UIs, share sheet, dot grids) — this video has its own world.
//
//   import { STORY, SignCard, Pen, InkStroke, InkPath2D, VaultDoor, Token, GiftBox, Magnifier, PaperStack, Keycap,
//            KeyObj, Cam2D, ease, CamRig, project, Sfx, W, rand, SIG_D, type Shot, type Shot2D } from "./_shared";
//
// SMOOTH MOTION (Cooper: last cut was jittery): Chrome snaps 2D layers to whole pixels, so slow CSS drifts step.
// ALWAYS move 2D layers with <Cam2D> (perspective + translate3d + tiny rotateX = sub-pixel). Never animate a plain
// translate()/scale() on a text layer slower than ~3 px/frame. 3D (WebGL) is sub-pixel already.
//
// Story numbers: FBI PSA I-022625-PSA (26 Feb 2025), NCC Group analysis (10 Mar 2025), Scam Sniffer 2024 report.
import React, { useLayoutEffect, useMemo } from "react";
import { Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { glyphTexture, Mat, type SceneProps } from "../../kit";

export type Vec3 = [number, number, number];
export const FPS = 30;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ORANGE = "#FF8000";

/** Story numbers (sources above). Exchange + wallet product may be named in captions/disclaimers only, never as logos. */
export const STORY = {
  usd: "$1,500,000,000", usdShort: "$1.5B", eth: "401,347", ethShort: "401,000", date: "21 FEB 2025",
  drainers: "$494,000,000", drainersShort: "$494M", victims: "332,000",
};
/** What the signers SAW vs what they SIGNED (paraphrased from NCC Group; illustrative wording). */
export const SAW = ["Transfer", "Cold wallet → hot wallet", "Routine internal transfer"];
export const SIGNED = ["delegatecall", "Change wallet logic", "Control → attacker contract"];
/** Raw calldata look (made-up hex, illustrative). */
export const HEX = "0x6a76120260157014b73aeb8c8b76ba79d7edf2ebeaec2f064509f433c12e9c75b27995acfae28f43fcc082921e185fff11f2e7e8201acdb19e90dc0bc0487faa"; // random hex, not a real address
/* ---------- word timing: frame of the n-th occurrence of a word in this scene's VO ---------- */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$]/g, "");
export const W = (props: SceneProps, word: string, n = 0, fallbackSec = 0): number => {
  const hit = (props.vo?.words ?? []).filter((w) => norm(w.text) === norm(word))[n];
  return Math.round((hit?.start ?? fallbackSec) * FPS);
};

/* ---------- SFX helper: <Sfx name="whoosh_soft" at={frame} /> (files in studio/public/sfx) ---------- */
export type SfxName = "air_rise" | "click" | "glint" | "sub_drop" | "thud" | "tick" | "type" | "whoosh_soft";
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.5 }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/* ---------- camera: a shot = linear-ish move from→to while the target slides tFrom→tTo ---------- */
export type Shot = { from: Vec3; to: Vec3; tFrom: Vec3; tTo: Vec3; fov: number; len: number };
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
export const camAt = (s: Shot, f: number) => {
  const p = interpolate(f, [0, s.len], [0, 1], clamp);
  const q = Easing.bezier(0.33, 0.12, 0.25, 1)(p); // soft start (already moving), long smooth settle — no jolts
  return { pos: lerp3(s.from, s.to, q), tgt: lerp3(s.tFrom, s.tTo, q) };
};
/** Put inside <Studio3D>; drives the camera for `shot` using the current (Sequence-local) frame.
 *  Runs in useFrame (the draw loop), so it always applies AFTER Studio3D's own built-in Rig layout effect —
 *  with useLayoutEffect the two camera writers raced and alternate frames came out at two different camera
 *  positions (the "glitching" on the card shots). One writer, deterministic order, no flip. */
export const CamRig: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  useFrame(({ camera }) => {
    const { pos, tgt } = camAt(shot, f);
    camera.position.set(...pos);
    (camera as THREE.PerspectiveCamera).fov = shot.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...tgt);
  }, -10);
  return null;
};
/** World point → screen px (1080×1920) for the same camera, so Callouts track 3D parts. */
export const project = (shot: Shot, f: number, p: Vec3): [number, number] => {
  const { pos, tgt } = camAt(shot, f);
  const c = new THREE.PerspectiveCamera(shot.fov, 1080 / 1920, 0.1, 400);
  c.position.set(...pos);
  c.lookAt(...tgt);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 540, (1 - v.y) * 960];
};

/* ---------- SIGN CARD: the hero object. A graphite glass slab (≈ 2.4 × 1.5 × 0.08) with a drawn request on its face.
   lines: rows of text drawn top→bottom. glow = orange face border + emissive edge (the accent system).
   dim = greyed. Use it for "Confirm transaction" requests, approval prompts, the hardware-wallet screen. */
export type CardLine = { text: string; size?: number; color?: string; weight?: number; mono?: boolean };
const cardTexCache = new Map<string, THREE.CanvasTexture>();
const cardTexture = (lines: CardLine[], glow: boolean, dim: boolean, button?: string) => {
  const key = JSON.stringify([lines, glow, dim, button]);
  const hit = cardTexCache.get(key);
  if (hit) return hit;
  const W0 = 1200, H0 = 750;
  const c = document.createElement("canvas"); c.width = W0; c.height = H0;
  const x = c.getContext("2d")!;
  x.fillStyle = "#141518"; x.fillRect(0, 0, W0, H0);
  x.strokeStyle = glow ? ORANGE : "#2c2e33"; x.lineWidth = glow ? 14 : 4; x.strokeRect(7, 7, W0 - 14, H0 - 14);
  let y = 110;
  for (const l of lines) {
    const size = l.size ?? 56;
    x.font = `${l.weight ?? 600} ${size}px ${l.mono ? "'DejaVu Sans Mono', monospace" : "Outfit, 'DejaVu Sans', sans-serif"}`;
    x.fillStyle = dim ? "#5a5a5a" : l.color ?? "#f2f2f2";
    x.textAlign = "left"; x.textBaseline = "middle";
    x.fillText(l.text, 80, y);
    y += size * 1.55;
  }
  if (button) {
    x.fillStyle = dim ? "#2a2a2a" : glow ? ORANGE : "#f2f2f2";
    const bw = W0 - 160, bh = 120, bx = 80, by = H0 - bh - 70;
    x.beginPath(); (x as any).roundRect ? (x as any).roundRect(bx, by, bw, bh, 60) : x.rect(bx, by, bw, bh); x.fill();
    x.fillStyle = "#0b0b0b"; x.font = "700 60px Outfit, 'DejaVu Sans', sans-serif"; x.textAlign = "center";
    x.fillText(button, W0 / 2, by + bh / 2 + 3);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 16;
  cardTexCache.set(key, t);
  return t;
};
export const SignCard: React.FC<{
  lines: CardLine[]; button?: string; position?: Vec3; rotation?: Vec3; scale?: number; glow?: boolean; dim?: boolean; opacity?: number;
}> = ({ lines, button, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, glow = false, dim = false, opacity = 1 }) => {
  const tex = useMemo(() => cardTexture(lines, glow, dim, button), [JSON.stringify(lines), glow, dim, button]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[2.4, 1.5, 0.08]} radius={0.06} smoothness={2}>
        <Mat kind={glow ? "accent" : "graphite"} opacity={opacity < 1 ? opacity : undefined} />
      </RoundedBox>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[2.3, 1.4375]} />
        <meshStandardMaterial map={tex} metalness={0.15} roughness={0.4} transparent={opacity < 1} opacity={opacity}
          emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
};

/** Cheap deterministic pseudo-random (for shuffles, instanced positions) — never use Math.random() in scenes. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/* =====================================================================================================================
   SMOOTH 2D CAMERA. Wrap every 2D layer that moves:  <Cam2D shot={{from:{x:0,y:40,s:1.04}, to:{x:-20,y:0,s:1.1}, len: 36}}>
   x/y px, s scale, r deg. Eased in-out. Origin = screen centre. Sub-pixel smooth (no stepping).
   ===================================================================================================================== */
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export type Cam2DKey = { x?: number; y?: number; s?: number; r?: number };
export type Shot2D = { from: Cam2DKey; to: Cam2DKey; len: number };
export const Cam2D: React.FC<{ shot: Shot2D; children: React.ReactNode; originX?: number; originY?: number }> = ({ shot, children, originX = 540, originY = 960 }) => {
  const f = useCurrentFrame();
  const p = ease(interpolate(f, [0, shot.len], [0, 1], clamp));
  const k = (key: keyof Cam2DKey, d: number) => (shot.from[key] ?? d) + ((shot.to[key] ?? shot.from[key] ?? d) - (shot.from[key] ?? d)) * p;
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `${originX}px ${originY}px`, willChange: "transform",
      transform: `perspective(2000px) translate3d(${k("x", 0)}px, ${k("y", 0)}px, 0) scale(${k("s", 1)}) rotate(${k("r", 0)}deg) rotateX(0.01deg)` }}>
      {children}
    </div>
  );
};

/* ---------- INK (2D): an SVG path drawn on with glowing orange ink. progress 0..1. Use for handwritten signatures,
   underlines, strike-throughs, "$1.5B" written by hand (pass several d strings, drawn in sequence). ---------- */
export const SIG_D = "M17.0 120.0 C18.6 115.2 23.1 101.9 26.6 91.2 C30.1 80.5 36.2 62.4 37.8 56.0 C39.4 49.6 36.1 55.4 36.2 52.8 C36.3 50.2 36.9 44.1 38.1 40.3 C39.3 36.6 41.2 32.8 43.4 30.2 C45.6 27.7 48.4 25.7 51.1 24.8 C53.8 23.9 57.0 23.9 59.7 24.8 C62.4 25.7 65.2 27.7 67.4 30.2 C69.6 32.8 71.5 33.4 72.7 40.3 C73.9 47.3 74.8 61.9 74.6 72.0 C74.4 82.1 71.4 94.7 71.4 100.8 C71.4 106.9 74.5 106.3 74.6 108.8 C74.7 111.3 73.7 113.9 72.2 115.8 C70.7 117.8 68.1 119.7 65.6 120.6 C63.2 121.5 59.9 121.7 57.3 121.3 C54.7 120.8 51.8 119.6 50.0 117.9 C48.1 116.3 46.6 113.7 46.1 111.4 C45.6 109.0 45.9 106.1 46.9 103.8 C47.9 101.6 46.5 95.9 52.2 98.1 C57.9 100.2 73.5 113.1 81.0 116.8 C88.5 120.5 94.1 121.8 97.0 120.0 C99.9 118.2 97.6 110.2 98.6 106.1 C99.6 101.9 101.3 97.9 103.1 95.0 C104.9 92.2 107.2 89.8 109.5 88.8 C111.7 87.8 114.3 87.8 116.5 88.8 C118.8 89.8 121.1 92.2 122.9 95.0 C124.7 97.9 126.4 101.9 127.4 106.1 C128.4 110.2 128.5 120.0 129.0 120.0 C129.5 120.0 129.6 110.2 130.6 106.1 C131.6 101.9 133.3 97.9 135.1 95.0 C136.9 92.2 139.2 89.8 141.5 88.8 C143.7 87.8 146.3 87.8 148.5 88.8 C150.8 89.8 153.1 92.2 154.9 95.0 C156.7 97.9 158.4 101.9 159.4 106.1 C160.4 110.2 160.5 120.0 161.0 120.0 C161.5 120.0 161.6 110.2 162.6 106.1 C163.6 101.9 165.3 97.9 167.1 95.0 C168.9 92.2 171.2 89.8 173.5 88.8 C175.7 87.8 178.3 87.8 180.5 88.8 C182.8 89.8 185.1 92.2 186.9 95.0 C188.7 97.9 187.7 101.9 191.4 106.1 C195.1 110.2 204.2 124.3 209.0 120.0 C213.8 115.7 218.3 91.2 220.2 80.0 C222.1 68.8 220.0 59.5 220.2 52.8 C220.4 46.1 220.7 43.7 221.6 40.0 C222.6 36.3 224.2 32.7 225.8 30.6 C227.4 28.4 229.5 27.2 231.4 27.2 C233.3 27.2 235.4 28.4 237.0 30.6 C238.6 32.7 240.0 30.4 241.2 40.0 C242.4 49.6 243.2 74.7 244.2 88.0 C245.2 101.3 247.4 112.8 247.4 120.0 C247.4 127.2 244.5 128.3 244.2 131.2 C243.9 134.1 244.6 135.3 245.3 137.1 C246.0 138.9 247.1 140.6 248.4 141.9 C249.6 143.2 251.3 144.2 253.0 144.8 C254.7 145.4 256.5 145.8 258.3 145.6 C260.0 145.4 261.9 144.7 263.4 143.7 C264.9 142.7 266.2 141.3 267.2 139.7 C268.3 138.1 268.5 138.1 269.5 134.2 C270.4 130.4 272.1 119.2 273.0 116.8 C273.9 114.4 274.0 121.5 274.6 120.0 C275.2 118.5 275.3 111.3 276.4 107.5 C277.5 103.8 279.2 100.0 281.2 97.4 C283.2 94.9 285.9 92.9 288.4 92.0 C290.8 91.1 293.6 91.1 296.0 92.0 C298.5 92.9 301.2 94.9 303.2 97.4 C305.2 100.0 306.9 103.8 308.0 107.5 C309.1 111.3 309.2 119.7 309.8 120.0 C310.4 120.3 310.5 112.7 311.6 109.6 C312.7 106.5 314.4 103.4 316.4 101.3 C318.4 99.1 321.1 97.4 323.6 96.6 C326.0 95.9 328.8 95.9 331.2 96.6 C333.7 97.4 336.4 99.1 338.4 101.3 C340.4 103.4 342.1 106.5 343.2 109.6 C344.3 112.7 344.4 119.7 345.0 120.0 C345.6 120.3 345.7 114.2 346.8 111.7 C347.9 109.2 349.6 106.7 351.6 105.0 C353.6 103.2 356.3 101.9 358.8 101.3 C361.2 100.7 364.0 100.7 366.4 101.3 C368.9 101.9 371.6 103.2 373.6 105.0 C375.6 106.7 373.9 109.2 378.4 111.7 C383.0 114.2 394.6 120.2 401.0 120.0 C407.4 119.8 411.7 112.8 417.0 110.4 C422.3 108.0 430.3 106.4 433.0 105.6";
export const InkPath2D: React.FC<{ d: string | string[]; progress: number; width?: number; viewBox?: string; style?: React.CSSProperties; color?: string }> = ({
  d, progress, width = 10, viewBox = "0 0 450 180", style, color = ORANGE }) => {
  const paths = Array.isArray(d) ? d : [d];
  const id = useMemo(() => "ink" + Math.abs(Math.floor(Math.sin(paths.join("").length) * 1e6)), [paths.join("")]);
  return (
    <svg viewBox={viewBox} style={{ overflow: "visible", ...style }}>
      <defs><filter id={id} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {paths.map((pd, i) => {
        const seg = 1 / paths.length;
        const pp = Math.min(1, Math.max(0, (progress - i * seg) / seg));
        return <path key={i} d={pd} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray="1" strokeDashoffset={1 - pp} filter={`url(#${id})`} opacity={pp > 0 ? 1 : 0} />;
      })}
    </svg>
  );
};

/* ---------- INK (3D): a glowing orange tube that draws itself along a smooth curve. points in world space. ---------- */
export const InkStroke: React.FC<{ points: Vec3[]; progress: number; radius?: number }> = ({ points, progress, radius = 0.03 }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    return new THREE.TubeGeometry(curve, 480, radius, 12, false);
  }, [JSON.stringify(points), radius]);
  const total = geo.index ? geo.index.count : 0;
  geo.setDrawRange(0, Math.floor(total * Math.min(1, Math.max(0, progress)) / 72) * 72);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={ORANGE} emissive={"#FF6A00"} emissiveIntensity={1.6} roughness={0.35} metalness={0.1} toneMapped={false} />
    </mesh>
  );
};
/** A signature (cursive letterforms, baseline at y=0, x -1.3..1.3, ascenders to +0.56, one descender to -0.16) for InkStroke.
    Baseline y=0 is the line it sits on: place it with sigOnCard() for cards. */
export const SIG_POINTS: Vec3[] = [[-1.3, 0.0, 0], [-1.24, 0.18, 0], [-1.17, 0.4, 0], [-1.18, 0.42, 0], [-1.168, 0.498, 0], [-1.135, 0.561, 0], [-1.087, 0.595, 0], [-1.033, 0.595, 0], [-0.985, 0.561, 0], [-0.952, 0.498, 0], [-0.94, 0.3, 0], [-0.96, 0.12, 0], [-0.94, 0.07, 0], [-0.955, 0.026, 0], [-0.996, -0.004, 0], [-1.048, -0.008, 0], [-1.094, 0.013, 0], [-1.118, 0.054, 0], [-1.113, 0.101, 0], [-1.08, 0.137, 0], [-0.9, 0.02, 0], [-0.8, 0.0, 0], [-0.79, 0.087, 0], [-0.762, 0.156, 0], [-0.722, 0.195, 0], [-0.678, 0.195, 0], [-0.638, 0.156, 0], [-0.61, 0.087, 0], [-0.6, 0.0, 0], [-0.59, 0.087, 0], [-0.562, 0.156, 0], [-0.522, 0.195, 0], [-0.478, 0.195, 0], [-0.438, 0.156, 0], [-0.41, 0.087, 0], [-0.4, 0.0, 0], [-0.39, 0.087, 0], [-0.362, 0.156, 0], [-0.322, 0.195, 0], [-0.278, 0.195, 0], [-0.238, 0.156, 0], [-0.21, 0.087, 0], [-0.1, 0.0, 0], [-0.03, 0.25, 0], [-0.03, 0.42, 0], [-0.021, 0.5, 0], [0.005, 0.559, 0], [0.04, 0.58, 0], [0.075, 0.559, 0], [0.101, 0.5, 0], [0.12, 0.2, 0], [0.14, 0.0, 0], [0.12, -0.07, 0], [0.127, -0.107, 0], [0.146, -0.137, 0], [0.175, -0.155, 0], [0.208, -0.16, 0], [0.24, -0.148, 0], [0.264, -0.123, 0], [0.278, -0.089, 0], [0.3, 0.02, 0], [0.31, 0.0, 0], [0.321, 0.078, 0], [0.351, 0.141, 0], [0.396, 0.175, 0], [0.444, 0.175, 0], [0.489, 0.141, 0], [0.519, 0.078, 0], [0.53, 0.0, 0], [0.541, 0.065, 0], [0.571, 0.117, 0], [0.616, 0.146, 0], [0.664, 0.146, 0], [0.709, 0.117, 0], [0.739, 0.065, 0], [0.75, 0.0, 0], [0.761, 0.052, 0], [0.791, 0.094, 0], [0.836, 0.117, 0], [0.884, 0.117, 0], [0.929, 0.094, 0], [0.959, 0.052, 0], [1.1, 0.0, 0], [1.2, 0.06, 0], [1.3, 0.09, 0]];
/* ---------- SIGNATURE ON A CARD'S LINE. Finds the "x ____" line in `lines`, measures it with the same canvas font as
   cardTexture, and returns SIG_POINTS in card-LOCAL space (z = 0.05, just above the face) sized to sit ON that line:
   baseline on the underscores, spanning `fill` of their width. Wrap in the card's <group position/rotation/scale>. ---------- */
export const sigOnCard = (lines: CardLine[], fill = 0.92, points: Vec3[] = SIG_POINTS): Vec3[] => {
  const PX = 2.3 / 1200; // texture px -> card-local units (same ratio on both axes)
  let y = 110, li = -1, size = 48;
  for (let i = 0; i < lines.length; i++) {
    const sz = lines[i].size ?? 56;
    if (/^x\s*_+/.test(lines[i].text)) { li = i; size = sz; break; }
    y += sz * 1.55;
  }
  let x0 = 110, x1 = 690;
  if (li >= 0) {
    const l = lines[li];
    try {
      const c = document.createElement("canvas").getContext("2d")!;
      c.font = `${l.weight ?? 600} ${size}px ${l.mono ? "'DejaVu Sans Mono', monospace" : "Outfit, 'DejaVu Sans', sans-serif"}`;
      const pre = l.text.match(/^x\s*/)![0];
      x0 = 80 + c.measureText(pre).width; x1 = 80 + c.measureText(l.text).width;
    } catch { /* keep estimate */ }
  }
  const baseY = y + size * 0.30;             // underscores sit below the middle baseline
  const cx = (x0 + x1) / 2, w = (x1 - x0) * fill;
  const k = w / 2.6;                          // SIG_POINTS spans 2.6 units
  return points.map(([px, py]) => [(cx - 600) * PX + px * k * PX, (375 - baseY) * PX + py * k * PX, 0.05] as Vec3);
};


/* ---------- PEN: chrome fountain pen, nib at local origin pointing -Y, body up +Y (length ≈ 2.2). capped 0..1 slides
   the cap down over the nib. inkGlow = orange glow at the nib tip. ---------- */
export const Pen: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number; capped?: number; inkGlow?: boolean }> = ({
  position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, capped = 0, inkGlow = true }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0.16, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.075, 0.32, 24]} /><Mat kind="chrome" /></mesh>
    <mesh position={[0, 0.06, 0.04]} rotation={[0, 0, 0]}><boxGeometry args={[0.008, 0.18, 0.01]} /><meshStandardMaterial color="#111" /></mesh>
    <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.09, 0.075, 0.2, 32]} /><Mat kind="chrome" /></mesh>
    <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.11, 0.09, 1.5, 32]} /><Mat kind="ink" /></mesh>
    <mesh position={[0, 2.03, 0]}><sphereGeometry args={[0.11, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat kind="ink" /></mesh>
    <mesh position={[0, 0.55, 0]}><torusGeometry args={[0.105, 0.012, 8, 40]} /><Mat kind="chrome" /></mesh>
    {inkGlow && <mesh position={[0, 0.005, 0]}><sphereGeometry args={[0.025, 12, 8]} /><meshStandardMaterial color={ORANGE} emissive={"#FF6A00"} emissiveIntensity={2.5} toneMapped={false} /></mesh>}
    {capped > 0 && (
      <group position={[0, 1.6 - capped * 1.3, 0]}>
        <mesh position={[0, 0.0, 0]}><cylinderGeometry args={[0.125, 0.125, 0.9, 32, 1, true]} /><Mat kind="ink" /></mesh>
        <mesh position={[0.13, 0.15, 0]}><boxGeometry args={[0.03, 0.6, 0.06]} /><Mat kind="chrome" /></mesh>
        <mesh position={[0, -0.45, 0]}><cylinderGeometry args={[0.125, 0.11, 0.05, 32]} /><Mat kind="chrome" /></mesh>
      </group>
    )}
  </group>
);

/* ---------- VAULT DOOR: round multisig vault door (radius ≈ 1.4) standing up facing +Z, centre at position.
   keys 0..3 = how many of the three keyholes are turned (turned holes glow orange). open 0..1 swings it on its left hinge. ---------- */
export const VaultDoor: React.FC<{ position?: Vec3; rotation?: Vec3; keys?: number; open?: number; scale?: number }> = ({
  position = [0, 1.6, 0], rotation = [0, 0, 0], keys = 0, open = 0, scale = 1 }) => {
  const holes: Vec3[] = [[-0.55, 0.35, 0.2], [0.55, 0.35, 0.2], [0, -0.55, 0.2]];
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh><torusGeometry args={[1.55, 0.14, 24, 96]} /><Mat kind="graphite" /></mesh>
      <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.5, 1.5, 0.1, 64]} /><meshStandardMaterial color="#050506" /></mesh>
      <group position={[-1.4, 0, 0]} rotation={[0, -open * 1.9, 0]}>
        <group position={[1.4, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.4, 1.4, 0.32, 96]} /><Mat kind="chrome" /></mesh>
          <mesh position={[0, 0, 0.17]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.15, 1.15, 0.04, 96]} /><Mat kind="graphite" /></mesh>
          {holes.map((h, i) => {
            const turned = Math.min(1, Math.max(0, keys - i));
            return (
              <group key={i} position={h}>
                <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.06, 48]} /><Mat kind={turned > 0.5 ? "accent" : "chrome"} /></mesh>
                <mesh position={[0, 0, 0.04]} rotation={[0, 0, turned * Math.PI / 2]}><boxGeometry args={[0.05, 0.22, 0.04]} /><meshStandardMaterial color={turned > 0.5 ? "#FFB060" : "#111"} emissive={turned > 0.5 ? "#FF6A00" : "#000"} emissiveIntensity={turned > 0.5 ? 1.2 : 0} /></mesh>
              </group>
            );
          })}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1.27, Math.sin(i * Math.PI / 3) * 1.27, 0.16]}><sphereGeometry args={[0.05, 12, 8]} /><Mat kind="chrome" /></mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

/* ---------- TOKEN: glowing hex-prism crypto token (generic, no logos). accent = orange glass. ---------- */
export const Token: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number; accent?: boolean }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, accent = true }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 0.08, 6]} /><Mat kind={accent ? "accent" : "chrome"} /></mesh>
    <mesh position={[0, 0, 0.042]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.13, 0.13, 0.01, 6]} /><meshStandardMaterial color={accent ? "#FFC27A" : "#ddd"} emissive={accent ? "#FF6A00" : "#000"} emissiveIntensity={accent ? 0.6 : 0} /></mesh>
  </group>
);

/* ---------- GIFT BOX: the airdrop trap (≈ 1 unit cube, sits on the floor at position). open 0..1 lifts + tilts the lid. ---------- */
export const GiftBox: React.FC<{ position?: Vec3; rotation?: Vec3; open?: number; scale?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], open = 0, scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[1, 0.8, 1]} radius={0.03} position={[0, 0.4, 0]}><Mat kind="graphite" /></RoundedBox>
    <mesh position={[0, 0.4, 0.505]}><boxGeometry args={[0.16, 0.8, 0.01]} /><Mat kind="accent" /></mesh>
    <mesh position={[0.505, 0.4, 0]}><boxGeometry args={[0.01, 0.8, 0.16]} /><Mat kind="accent" /></mesh>
    <group position={[0, 0.86 + open * 0.9, -0.5]} rotation={[-open * 0.9, 0, 0]}>
      <RoundedBox args={[1.08, 0.14, 1.08]} radius={0.03} position={[0, 0, 0.5]}><Mat kind="graphite" /></RoundedBox>
      <mesh position={[0, 0.075, 0.5]}><boxGeometry args={[1.09, 0.01, 0.16]} /><Mat kind="accent" /></mesh>
      <mesh position={[0, 0.075, 0.5]}><boxGeometry args={[0.16, 0.01, 1.09]} /><Mat kind="accent" /></mesh>
      <mesh position={[-0.13, 0.17, 0.5]} rotation={[0, 0, 0.6]}><torusGeometry args={[0.12, 0.035, 10, 30]} /><Mat kind="accent" /></mesh>
      <mesh position={[0.13, 0.17, 0.5]} rotation={[0, 0, -0.6]}><torusGeometry args={[0.12, 0.035, 10, 30]} /><Mat kind="accent" /></mesh>
    </group>
  </group>
);

/* ---------- MAGNIFIER: chrome magnifying glass (lens radius 0.6), lens faces +Z, handle down-right. ---------- */
export const Magnifier: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh><torusGeometry args={[0.6, 0.06, 16, 80]} /><Mat kind="chrome" /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.58, 0.58, 0.02, 64]} /><meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.05} thickness={0.2} transparent opacity={0.25} /></mesh>
    <mesh position={[0.62, -0.62, 0]} rotation={[0, 0, Math.PI / 4]}><cylinderGeometry args={[0.07, 0.08, 0.9, 24]} /><Mat kind="ink" /></mesh>
  </group>
);

/* ---------- PAPER STACK: a tower of signed sheets (each 0.85 × 1.1, a small orange signature on top sheet).
   count sheets; grow 0..1 = fraction stacked so far. Instanced, cheap. ---------- */
const sheetTex = (() => { let t: THREE.CanvasTexture | null = null; return () => {
  if (t) return t;
  const c = document.createElement("canvas"); c.width = 256; c.height = 330; const x = c.getContext("2d")!;
  x.fillStyle = "#d9d9d6"; x.fillRect(0, 0, 256, 330); x.fillStyle = "#b9b9b5";
  for (let i = 0; i < 9; i++) x.fillRect(28, 40 + i * 22, 200 - (i % 3) * 40, 6);
  x.strokeStyle = ORANGE; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(40, 280);
  x.bezierCurveTo(70, 240, 90, 300, 120, 262); x.bezierCurveTo(150, 230, 170, 300, 215, 266); x.stroke();
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }; })();
export const PaperStack: React.FC<{ position?: Vec3; count?: number; grow?: number; scale?: number }> = ({ position = [0, 0, 0], count = 300, grow = 1, scale = 1 }) => {
  const ref = React.useRef<THREE.InstancedMesh>(null!);
  const n = Math.max(1, Math.floor(count * Math.min(1, Math.max(0, grow))));
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(); const q = new THREE.Quaternion(); const e = new THREE.Euler();
    for (let i = 0; i < count; i++) {
      e.set(-Math.PI / 2, 0, (rand(i + 3) - 0.5) * 0.08);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3((rand(i) - 0.5) * 0.04, i * 0.012, (rand(i + 9) - 0.5) * 0.04), q, new THREE.Vector3(1, 1, 1));
      ref.current.setMatrixAt(i, m);
    }
    ref.current.count = n;
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={position} scale={scale}>
      <instancedMesh ref={ref} args={[undefined as any, undefined as any, count]}>
        <boxGeometry args={[0.85, 1.1, 0.008]} />
        <meshStandardMaterial map={sheetTex()} roughness={0.85} />
      </instancedMesh>
    </group>
  );
};

/* ---------- KEYCAP: a big physical CONFIRM key (1.6 × 0.7), press 0..1 pushes it down; glow = orange legend + rim. ---------- */
export const Keycap: React.FC<{ position?: Vec3; rotation?: Vec3; press?: number; glow?: boolean; label?: string; scale?: number }> = ({
  position = [0, 0, 0], rotation = [0, 0, 0], press = 0, glow = true, label = "CONFIRM", scale = 1 }) => {
  const tex = useMemo(() => glyphTexture(label, { font: "800 150px Outfit, 'DejaVu Sans', sans-serif", w: 1024, h: 512, fg: glow ? "#1a0c00" : "#e8e8e8", bg: glow ? ORANGE : "#1b1c1f" }), [label, glow]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[1.9, 0.18, 1.0]} radius={0.05} position={[0, 0.09, 0]}><Mat kind="ink" /></RoundedBox>
      <group position={[0, 0.34 - press * 0.14, 0]}>
        <RoundedBox args={[1.6, 0.3, 0.72]} radius={0.08} smoothness={3}><Mat kind={glow ? "accent" : "graphite"} /></RoundedBox>
        <mesh position={[0, 0.151, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.4, 0.55]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={glow ? 0.25 : 0.1} /></mesh>
      </group>
    </group>
  );
};

/* ---------- KEY: a chrome key (length ≈ 1.4) lying along +X, bow at origin. dim = greyed. ---------- */
export const KeyObj: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number; dim?: boolean }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, dim = false }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh><torusGeometry args={[0.26, 0.07, 16, 48]} /><Mat kind={dim ? "graphite" : "chrome"} /></mesh>
    <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 1.0, 20]} /><Mat kind={dim ? "graphite" : "chrome"} /></mesh>
    {[0.95, 1.1, 1.22].map((x, i) => <mesh key={i} position={[x, -0.1 - (i % 2) * 0.04, 0]}><boxGeometry args={[0.08, 0.16 + (i % 2) * 0.08, 0.06]} /><Mat kind={dim ? "graphite" : "chrome"} /></mesh>)}
  </group>
);
