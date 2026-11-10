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
import { useThree } from "@react-three/fiber";
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
/** Put inside <Studio3D>; drives the camera for `shot` using the current (Sequence-local) frame. */
export const CamRig: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { pos, tgt } = camAt(shot, f);
    camera.position.set(...pos);
    (camera as THREE.PerspectiveCamera).fov = shot.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...tgt);
  });
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
export const SIG_D = "M20 120 C 60 40, 90 40, 100 100 S 140 170, 170 90 S 210 20, 230 100 C 240 140, 260 140, 280 90 C 300 50, 320 70, 330 110 C 340 140, 370 130, 400 80 M 120 150 C 220 145, 330 140, 430 132";
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
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 240, radius, 10, false);
  }, [JSON.stringify(points), radius]);
  const total = geo.index ? geo.index.count : 0;
  geo.setDrawRange(0, Math.floor(total * Math.min(1, Math.max(0, progress)) / 60) * 60);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={ORANGE} emissive={"#FF6A00"} emissiveIntensity={1.6} roughness={0.35} metalness={0.1} toneMapped={false} />
    </mesh>
  );
};
/** A signature-shaped scribble in the XY plane (width ≈ 2.6, centred at origin) for InkStroke. */
export const SIG_POINTS: Vec3[] = [[-1.3, -0.1, 0], [-1.05, 0.5, 0], [-0.85, 0.15, 0], [-1.0, -0.2, 0], [-0.7, -0.05, 0], [-0.45, 0.35, 0], [-0.3, -0.25, 0], [-0.1, 0.2, 0], [0.05, 0.0, 0], [0.25, 0.45, 0], [0.3, -0.3, 0], [0.5, 0.05, 0], [0.75, -0.1, 0], [1.0, 0.15, 0], [1.3, -0.15, 0]];

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
