// Shared props + objects for run 2026-11-09-bybit-every-signature-real ("$1.5B, and every signature was real").
// Written by the director. Composers IMPORT from here and never edit it, so every scene shares one world:
// graphite glass SIGNATURE CARDS (transaction / approval requests) on the dark studio floor, orange = the one thing
// that matters in the shot (usually the hidden real transaction, or the signature itself).
//
//   import { STORY, SignCard, CamRig, project, Sfx, W, rand, type Shot } from "./_shared";
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
  const q = p * 0.7 + Easing.out(Easing.cubic)(p) * 0.3; // never starts from rest: frame 0 of every shot is moving
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
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
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
