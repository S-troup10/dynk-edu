// Scene: 2026-10-29-next S01 — HOOK. "You checked the first four and last four characters. They matched.
// And the money still went to a scammer."
// Four shots, hard cuts: (A) macro track over FIRST4 · (B) macro on LAST4, ghost row drops and locks on "matched"
// · (C) high angle on the MIDDLE, pasted row's tiles flip to different characters · (D, same camera) pasted row
// slides off right on "scammer", the dim ghost row is left alone.
// Accent: only the end blocks (FIRST4 / LAST4) of the pasted row + EnergyArcs on the lock. Middle never orange.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, EnergyArcs, Mat, glyphTexture, type SceneProps } from "../../kit";
import { REAL, FAKE, FIRST4, LAST4, MIDDLE, Tile, tileX } from "./_shared";

type Vec3 = [number, number, number];
const S = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.cubic);
const ROW_Y = 0.25;            // pasted row (TileRow default height)
const GHOST_Y = ROW_Y + 0.58;  // ghost row, stacked above, locked position
const GHOST_Z = -0.06;

/* ---------- per-shot camera: position + moving target, linear-ish so frame 0 of each shot is already moving ---------- */
type Shot = { from: Vec3; to: Vec3; tFrom: Vec3; tTo: Vec3; fov: number; len: number };
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const camAt = (s: Shot, f: number) => {
  const p = interpolate(f, [0, s.len], [0, 1], clamp);
  const q = p * 0.75 + out(p) * 0.25; // mostly linear: never starts from rest
  return { pos: lerp3(s.from, s.to, q), tgt: lerp3(s.tFrom, s.tTo, q) };
};
const CamRig: React.FC<{ shot: Shot }> = ({ shot }) => {
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
/** world → screen px (1080×1920) for the same camera, so callouts / arcs track the tiles. */
const project = (shot: Shot, f: number, p: Vec3): [number, number] => {
  const { pos, tgt } = camAt(shot, f);
  const c = new THREE.PerspectiveCamera(shot.fov, 1080 / 1920, 0.1, 200);
  c.position.set(...pos);
  c.lookAt(...tgt);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 540, (1 - v.y) * 960];
};

/* ---------- ghost tile: the address you meant, dim translucent graphite ---------- */
const GhostTile: React.FC<{ ch: string; position: Vec3 }> = ({ ch, position }) => {
  const tex = useMemo(() => glyphTexture(ch, { font: "600 300px 'DejaVu Sans Mono', monospace", w: 256, h: 320, fg: "#4a4a4a", bg: "#141518" }), [ch]);
  return (
    <group position={position}>
      <RoundedBox args={[0.4, 0.5, 0.08]} radius={0.04} smoothness={2}>
        <Mat kind="graphite" opacity={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[0.34, 0.44]} />
        <meshStandardMaterial map={tex} transparent opacity={0.5} metalness={0.1} roughness={0.5} />
      </mesh>
    </group>
  );
};
const GhostRow: React.FC<{ y: number; range: [number, number] }> = ({ y, range }) => (
  <group position={[0, y, GHOST_Z]}>
    {REAL.split("").map((c, i) => (i < range[0] || i >= range[1] ? null : <GhostTile key={i} ch={c} position={[tileX(i), 0, 0]} />))}
  </group>
);

/* ---------- pasted row: per-tile glow (sweep) and per-tile flip (stagger) ---------- */
const PastedRow: React.FC<{ x?: number; glowAt: Record<number, number>; flipAt?: (i: number) => number | null; range: [number, number]; f: number; gf?: number }> = ({
  x = 0, glowAt, flipAt, range, f, gf,
}) => (
  <group position={[x, ROW_Y, 0]}>
    {REAL.split("").map((c, i) => {
      if (i < range[0] || i >= range[1]) return null;
      const g = glowAt[i];
      const fs = flipAt ? flipAt(i) : null;
      const flip = fs === null ? 0 : interpolate(f, [fs, fs + 7], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      return <Tile key={i} ch={c} position={[tileX(i), 0, 0]} glow={g !== undefined && (gf ?? f) >= g} flip={flip} flipTo={fs === null ? undefined : FAKE[i]} />;
    })}
  </group>
);

const Lbl: React.FC<{ text: string; shot: Shot; f: number; part: Vec3; dy?: number; dx?: number; start: number }> = ({ text, shot, f, part, dy = -170, dx = 0, start }) => {
  const at = project(shot, f, part);
  return <Callout text={text} at={at} label={[at[0] + dx, at[1] + dy]} startFrame={start} />;
};

/* ---------- shots ---------- */
const W = (props: SceneProps, t: string, n = 0) => (props.vo?.words ?? []).filter((w) => w.text.toLowerCase().replace(/[^a-z]/g, "") === t)[n];
const F4C = (tileX(2) + tileX(5)) / 2; // ≈ -7.82
const L4C = (tileX(38) + tileX(41)) / 2; // ≈ 8.74

const Scene: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const fFirst = Math.round((W(props, "first")?.start ?? 0.554) * S);
  const fLast = Math.round((W(props, "last")?.start ?? 1.509) * S);
  const fMatched = Math.round((W(props, "matched")?.start ?? 2.913) * S);
  const fMoney = Math.round((W(props, "money")?.start ?? 3.774) * S);
  const fScam = Math.round((W(props, "scammer")?.start ?? 4.764) * S);
  const total = props.durationInFrames ?? 179;

  const cutB = 42, cutC = 99;
  // glow sweeps across each end block, 2 frames per tile, starting on its word
  const glowAt: Record<number, number> = {};
  FIRST4.forEach((i, k) => (glowAt[i] = fFirst + k * 2));
  LAST4.forEach((i, k) => (glowAt[i] = fLast + k * 2));

  const shotA: Shot = { from: [F4C - 2.6, 0.95, 11.2], to: [F4C + 1.1, 0.8, 10.2], tFrom: [F4C - 0.7, 0.5, 0], tTo: [F4C + 0.3, 0.45, 0], fov: 30, len: cutB };
  const shotB: Shot = { from: [L4C - 2.0, 1.4, 11.6], to: [L4C + 1.0, 1.15, 10.6], tFrom: [L4C - 0.6, 0.65, 0], tTo: [L4C + 0.2, 0.6, 0], fov: 30, len: cutC - cutB };
  const lenC = total - cutC;
  const shotC: Shot = { from: [-1.3, 5.6, 8.4], to: [1.3, 5.0, 7.7], tFrom: [-0.3, 0.45, 0], tTo: [0.6, 0.45, 0], fov: 30, len: lenC };

  // ghost row drop (shot B, local frames)
  const dropStart = 72 - cutB, lockAt = fMatched - cutB;
  // flips (shot C, local): left→right cascade, ~0.03 s per tile, centred on the visible middle tiles
  const flipStart = Math.max(fMoney - cutC - 10, 2);
  const flipAt = (i: number) => (MIDDLE.includes(i) ? flipStart + (i - 15) * 1 : null);
  const slideStart = fScam - cutC;

  return (
    <Shell props={props} tone="dark">
      {/* A: macro track over FIRST4 */}
      <Sequence from={0} durationInFrames={cutB} layout="none">
        <ShotA shot={shotA} glowAt={glowAt} fFirst={fFirst} />
      </Sequence>
      {/* B: macro on LAST4, ghost row drops, locks on "matched" */}
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none">
        <ShotB shot={shotB} glowAt={glowAt} fLast={fLast - cutB} dropStart={dropStart} lockAt={lockAt} />
      </Sequence>
      {/* C + D: high angle on the middle; tiles flip; pasted row slides off right on "scammer" */}
      <Sequence from={cutC} durationInFrames={lenC} layout="none">
        <ShotC shot={shotC} glowAt={glowAt} flipAt={flipAt} slideStart={slideStart} moneyAt={fMoney - cutC} />
      </Sequence>
      <Disclaimer text="Magnified illustration · addresses are made up" />
    </Shell>
  );
};

const ShotA: React.FC<{ shot: Shot; glowAt: Record<number, number>; fFirst: number }> = ({ shot, glowAt, fFirst }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <PastedRow glowAt={glowAt} range={[0, 14]} f={f} />
      </Studio3D>
      <Lbl text="FIRST 4" shot={shot} f={f} part={[tileX(3) + 0.23, ROW_Y + 0.27, 0]} dy={-200} start={fFirst} />
    </AbsoluteFill>
  );
};

const ShotB: React.FC<{ shot: Shot; glowAt: Record<number, number>; fLast: number; dropStart: number; lockAt: number }> = ({ shot, glowAt, fLast, dropStart, lockAt }) => {
  const f = useCurrentFrame();
  // global frame for glow thresholds = local + cut
  const g = f + 42;
  const drop = interpolate(f, [dropStart, lockAt], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const settle = f > lockAt ? Math.sin((f - lockAt) / 2.2) * Math.exp(-(f - lockAt) / 5) * 0.025 : 0;
  const gy = GHOST_Y + 1.6 * (1 - drop) + settle;
  const seam = project(shot, f, [L4C, ROW_Y + 0.27, 0]);
  const left = project(shot, f, [tileX(38) - 0.2, ROW_Y, 0]);
  const right = project(shot, f, [tileX(41) + 0.2, ROW_Y, 0]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <PastedRow glowAt={glowAt} range={[28, 42]} f={g} />
        {f >= dropStart - 1 && <GhostRow y={gy} range={[28, 42]} />}
      </Studio3D>
      <Lbl text="LAST 4" shot={shot} f={f} part={[tileX(39) + 0.23, ROW_Y - 0.27, 0]} dy={230} start={fLast} />
      <EnergyArcs x={seam[0]} y={seam[1]} width={(right[0] - left[0]) * 0.95} height={120} count={9} startFrame={lockAt} />
    </AbsoluteFill>
  );
};

const ShotC: React.FC<{ shot: Shot; glowAt: Record<number, number>; flipAt: (i: number) => number | null; slideStart: number; moneyAt: number }> = ({
  shot, glowAt, flipAt, slideStart, moneyAt,
}) => {
  const f = useCurrentFrame();
  const g = f + 99;
  const slide = interpolate(f, [slideStart, slideStart + 26], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const x = slide * 14;
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <PastedRow x={x} glowAt={glowAt} flipAt={(i) => flipAt(i)} range={[0, 42]} f={f} gf={g} />
        <GhostRow y={GHOST_Y} range={[0, 42]} />
      </Studio3D>
      {g >= 0 && slide < 0.15 && (
        <Lbl text="MIDDLE" shot={shot} f={f} part={[tileX(21), ROW_Y - 0.27, 0]} dy={260} start={Math.max(moneyAt - 10, 0)} />
      )}
    </AbsoluteFill>
  );
};

export default Scene;
