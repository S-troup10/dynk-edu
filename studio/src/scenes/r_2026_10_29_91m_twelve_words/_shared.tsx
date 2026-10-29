// Shared props + objects for run 2026-10-29-91m-twelve-words ("$91M, and nobody guessed his 12 words").
// Written by the director. Composers IMPORT from here and never edit it, so every scene shares one world:
// graphite glass WORD TILES on the dark studio floor, orange = the one thing that matters in the shot.
//
//   import { PHRASE, WordTile, PhraseGrid, CamRig, project, sfx, W, type Shot } from "./_shared";
//
// All words shown are random BIP-39 words (not anyone's wallet). Amounts per ZachXBT (Aug 2025).
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

/** The made-up recovery phrase used everywhere (random BIP-39 words, invalid checksum, nobody's wallet). */
export const PHRASE = ["client", "flame", "family", "social", "turtle", "throw", "unusual", "tunnel", "lizard", "lamp", "gasp", "sad"];
/** 2^128 written out (number of possible 12-word phrases' entropy values, BIP-39). */
export const BIG = "340,282,366,920,938,463,463,374,607,431,768,211,456";
/** Story numbers (source: ZachXBT via Decrypt / Cointelegraph, 19–21 Aug 2025). */
export const STORY = { btc: 783, usd: "$91,000,000", usdShort: "$91M", date: "19 AUG 2025" };

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

/* ---------- WORD TILE: the hero object. Graphite glass slab, word in mono, optional number badge ----------
   size ≈ 1.6 × 0.5 × 0.1 world units. glow = orange face (the accent system). dim = greyed.
   spin 0..1 = slot-machine flip about X (shows `spinWords` cycling while spinning). */
export const WordTile: React.FC<{
  word: string; index?: number; position?: Vec3; rotation?: Vec3; glow?: boolean; dim?: boolean; scale?: number;
  spin?: number; spinWord?: string; opacity?: number;
}> = ({ word, index, position = [0, 0, 0], rotation = [0, 0, 0], glow = false, dim = false, scale = 1, spin = 0, spinWord, opacity = 1 }) => {
  const shown = spinWord ?? word;
  const label = index !== undefined ? `${index}  ${shown}` : shown;
  const tex = useMemo(
    () => glyphTexture(label, {
      font: "600 104px 'DejaVu Sans Mono', monospace", w: 1024, h: 320,
      fg: glow ? "#0b0703" : dim ? "#5f5f5f" : "#f2f2f2", bg: glow ? "#FF8000" : "#1b1c1f",
    }),
    [label, glow, dim],
  );
  return (
    <group position={position} rotation={[rotation[0] + spin * Math.PI * 2, rotation[1], rotation[2]]} scale={scale}>
      <RoundedBox args={[1.6, 0.5, 0.1]} radius={0.05} smoothness={2}>
        <Mat kind={glow ? "accent" : "graphite"} opacity={opacity < 1 ? opacity : undefined} />
      </RoundedBox>
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[1.5, 0.44]} />
        <meshStandardMaterial map={tex} metalness={0.2} roughness={0.35} transparent={opacity < 1} opacity={opacity}
          emissive={glow ? "#FF6A00" : "#000000"} emissiveIntensity={glow ? 0.12 : 0} />
      </mesh>
    </group>
  );
};

/** The 12-word phrase as a 3-column × 4-row grid of numbered tiles standing up, centred on `position`.
 *  glow: indices (0-based) that are orange. rise 0..1 lifts them out of the floor (stagger by index). */
export const PhraseGrid: React.FC<{
  position?: Vec3; glow?: number[] | "all"; dim?: boolean; rise?: number; spin?: number; spinWords?: string[][]; numbered?: boolean; gapX?: number; gapY?: number;
}> = ({ position = [0, 0, 0], glow = [], dim = false, rise = 1, spin = 0, spinWords, numbered = true, gapX = 1.75, gapY = 0.62 }) => (
  <group position={position}>
    {PHRASE.map((w, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const r = Math.min(1, Math.max(0, rise * 1.6 - i * 0.05));
      const y = (1.5 - row) * gapY + 1.2 - (1 - r) * 2.2;
      const g = glow === "all" || (Array.isArray(glow) && glow.includes(i));
      return (
        <WordTile key={i} word={w} index={numbered ? i + 1 : undefined} position={[(col - 1) * gapX, y, 0]} glow={g} dim={dim}
          spin={spin * (1 + (i % 5) * 0.13)} spinWord={spinWords ? spinWords[i][Math.floor(spin * 40 + i) % spinWords[i].length] : undefined} />
      );
    })}
  </group>
);

/** Cheap deterministic pseudo-random (for shuffles, instanced positions) — never use Math.random() in scenes. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
