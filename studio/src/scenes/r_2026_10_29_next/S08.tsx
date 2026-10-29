// Scene: 2026-10-29-next S08 · PAYOFF "Next time, you copy the top one. The ends match. The middle never did."
// The hook's ghost overlay replayed from a new SIDE angle: the pasted row (FAKE) is written onto the floor by an
// orange copy cursor, the ghost of the address you meant (REAL) drops onto it, the ends lock orange, the middle
// ghost tiles refuse to seat. Shared row/tiles from ./_shared (do not edit). Addresses are made up.
import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, EnergyArcs, glyphTexture, type SceneProps } from "../../kit";
import { REAL, FAKE, FIRST4, LAST4, TileRow, tileX } from "./_shared";

type Vec3 = [number, number, number];
const S = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const ENDS = [...FIRST4, ...LAST4];

const wordAt = (props: SceneProps, text: string, fallback: number, nth = 0) => {
  const ws = (props.vo?.words ?? []).filter((w) => w.text.toLowerCase().replace(/[^a-z]/g, "") === text);
  return Math.round((ws[nth]?.start ?? fallback) * S);
};

/* ---------------- camera: three shots, hard cuts, always moving ---------------- */
type Cam = { pos: Vec3; target: Vec3; fov: number };
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const shot = (f: number, f0: number, f1: number, a: Cam, b: Cam): Cam => {
  const p = ease(interpolate(f, [f0, f1], [0, 1], clamp));
  return { pos: lerp3(a.pos, b.pos, p), target: lerp3(a.target, b.target, p), fov: a.fov + (b.fov - a.fov) * p };
};
const CUT_B = Math.round(2.4 * S);
const CUT_C = Math.round(3.5 * S);
const camAt = (f: number, dur: number): Cam => {
  // A: 3/4 high side angle on the whole row (row reads as a diagonal into depth), slow push
  if (f < CUT_B)
    return shot(f, 0, CUT_B, { pos: [-25, 8.5, 5.6], target: [0.8, -1.4, -0.6], fov: 30 }, { pos: [-23, 7.2, 5.0], target: [0.8, -1.3, -0.6], fov: 30 });
  // B: low side angle along the row, ends + middle in perspective
  if (f < CUT_C)
    return shot(f, CUT_B, CUT_C, { pos: [-19.5, 2.6, 3.2], target: [0.4, -0.6, -1.0], fov: 30 }, { pos: [-19, 2.5, 3.0], target: [0.6, -0.6, -1.0], fov: 30 });
  // C: rack toward the middle (drift along the row), still holding both ends
  return shot(f, CUT_C, dur, { pos: [-19, 2.5, 3.0], target: [0.6, -0.6, -1.0], fov: 30 }, { pos: [-17.5, 2.6, 2.6], target: [1.6, -0.9, -0.9], fov: 30 });
};

const CamRig: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { camera } = useThree();
  const c = camAt(f, durationInFrames);
  React.useLayoutEffect(() => {
    camera.position.set(...c.pos);
    (camera as THREE.PerspectiveCamera).fov = c.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...c.target);
  });
  return null;
};

/** world point -> 1080x1920 px for 2D callouts / arcs */
const project = (p: Vec3, c: Cam): [number, number] => {
  const cam = new THREE.PerspectiveCamera(c.fov, 1080 / 1920, 0.1, 200);
  cam.position.set(...c.pos);
  cam.lookAt(...c.target);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return [(v.x + 1) * 540, (1 - v.y) * 960];
};

/* ---------------- ghost tile / ghost row (REAL, translucent) ---------------- */
const GhostTile: React.FC<{ ch: string; position: Vec3; glow: number; lift: number }> = ({ ch, position, glow, lift }) => {
  const on = glow > 0.5;
  const tex = useMemo(
    () => glyphTexture(ch, { font: "600 300px 'DejaVu Sans Mono', monospace", w: 256, h: 320, fg: on ? "#1a1208" : "#8a8a8a", bg: on ? "#FF8000" : "#0e0f11" }),
    [ch, on],
  );
  return (
    <group position={[position[0], position[1] + lift, position[2]]}>
      <RoundedBox args={[0.4, 0.5, 0.08]} radius={0.04} smoothness={2}>
        <meshStandardMaterial color={on ? "#FF8000" : "#3a3c40"} metalness={0.3} roughness={0.35} transparent opacity={on ? 0.85 : 0.32}
          emissive={on ? "#FF6A00" : "#000000"} emissiveIntensity={on ? 0.5 : 0} depthWrite={false} />
      </RoundedBox>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[0.34, 0.44]} />
        <meshStandardMaterial map={tex} transparent opacity={on ? 0.95 : 0.55} depthWrite={false}
          emissive={on ? "#FF6A00" : "#000000"} emissiveIntensity={on ? 0.35 : 0} />
      </mesh>
    </group>
  );
};

const GhostRow: React.FC<{ y: number; glow: boolean; middleLift: (i: number) => number }> = ({ y, glow, middleLift }) => (
  <group position={[0, y, 0]}>
    {REAL.split("").map((c, i) => (
      <GhostTile key={i} ch={c} position={[tileX(i), 0, 0]} glow={glow && ENDS.includes(i) ? 1 : 0} lift={ENDS.includes(i) ? 0 : middleLift(i)} />
    ))}
  </group>
);

/* ---------------- copy cursor: short orange streak running along the floor onto the row ---------------- */
const CopyCursor: React.FC<{ x: number; opacity: number }> = ({ x, opacity }) =>
  opacity <= 0 ? null : (
    <group position={[x, 0.03, 0.1]}>
      <mesh position={[-0.9, 0, 0]}>
        <boxGeometry args={[1.8, 0.04, 0.06]} />
        <meshStandardMaterial color="#FF8000" emissive="#FF6A00" emissiveIntensity={1.1} transparent opacity={opacity} />
      </mesh>
      <mesh position={[-3.0, 0, 0]}>
        <boxGeometry args={[2.4, 0.025, 0.04]} />
        <meshStandardMaterial color="#FF8000" emissive="#FF6A00" emissiveIntensity={0.8} transparent opacity={opacity * 0.35} />
      </mesh>
    </group>
  );

const ROW_Y = 0.25;          // pasted row centre (stands on the floor)
const GHOST_REST = 0.78;     // ghost row centre once seated on top of the pasted row
const GHOST_HIGH = 1.9;

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fCopy = wordAt(props, "copy", 1.033);
  const fEnds = wordAt(props, "ends", 2.462);
  const fMatch = wordAt(props, "match", 2.691);
  const fMiddle = wordAt(props, "middle", 3.622);

  // copy cursor: from off-frame left to past the row's far end, writing FAKE tiles as it goes
  const xStart = tileX(0) - 4.5, xEnd = tileX(41) + 0.6;
  const cp = interpolate(f, [fCopy, fCopy + 0.85 * S], [0, 1], clamp);
  const cursorX = xStart + (xEnd - xStart) * Easing.inOut(Easing.cubic)(cp);
  const cursorOp = f < fCopy ? 0 : interpolate(f, [fCopy + 0.8 * S, fCopy + 1.05 * S], [1, 0], clamp);
  const written = FAKE.split("").filter((_, i) => tileX(i) < cursorX - 0.1).length;

  // ghost: hovers high (slow bob), drops slowly from 1.4 s, seats at ~2.5 s (thud)
  const drop = Easing.bezier(0.45, 0, 0.6, 1)(interpolate(f, [1.4 * S, 2.5 * S], [0, 1], clamp));
  const ghostY = GHOST_HIGH + (GHOST_REST - GHOST_HIGH) * drop + (1 - drop) * Math.sin(f / 9) * 0.05;
  const locked = f >= fMatch;
  // on 'middle' the ghost's middle tiles lift off one after another: they don't seat
  const middleLift = (i: number) => {
    const k = Math.abs(i - 21.5) / 16; // centre first, outward
    return 0.16 * ease(interpolate(f, [fMiddle + k * 8, fMiddle + k * 8 + 10], [0, 1], clamp));
  };

  const cam = camAt(f, durationInFrames);
  const topY = GHOST_REST + 0.25;
  const pFirst = project([tileX(3.5), topY + 0.02, 0], cam);
  const pLast = project([tileX(39.5), topY + 0.02, 0], cam);
  const pMid = project([tileX(22), ROW_Y - 0.22, 0.05], cam);
  const pFirstBase = project([tileX(3.5), GHOST_REST, 0.05], cam);
  const pLastBase = project([tileX(39.5), GHOST_REST, 0.05], cam);
  const cx = (x: number) => Math.max(210, Math.min(850, x));
  const nearW = Math.abs(project([tileX(6), GHOST_REST, 0], cam)[0] - project([tileX(1), GHOST_REST, 0], cam)[0]);
  const farW = Math.abs(project([tileX(41), GHOST_REST, 0], cam)[0] - project([tileX(38), GHOST_REST, 0], cam)[0]);

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: [-26, 3, 2], target: [0, 0, 0], fov: 30 }}>
        <CamRig />
        <fog attach="fog" args={["#0B0B0B", 13, 36]} />
        {written > 0 && (
          <TileRow chars={FAKE} position={[0, ROW_Y, 0]} only={[0, written]} glow={locked ? ENDS : []} />
        )}
        <GhostRow y={ghostY} glow={locked} middleLift={middleLift} />
        <CopyCursor x={cursorX} opacity={cursorOp} />
      </Studio3D>

      {locked && (
        <>
          <EnergyArcs x={pFirstBase[0]} y={pFirstBase[1]} width={Math.max(120, nearW * 1.1)} height={Math.max(60, nearW * 0.45)} startFrame={fMatch} />
          <EnergyArcs x={pLastBase[0]} y={pLastBase[1]} width={Math.max(60, farW * 1.4)} height={Math.max(36, farW * 0.6)} count={7} startFrame={fMatch} intensity={0.8} />
        </>
      )}
      <Callout text="FIRST 4 ✓" at={pFirst} label={[cx(pFirst[0] + 40), Math.max(430, pFirst[1] - 170)]} startFrame={fEnds} />
      <Callout text="LAST 4 ✓" at={pLast} label={[cx(pLast[0] - 60), Math.max(430, pLast[1] - 200)]} startFrame={fMatch} />
      <Callout text="MIDDLE ✗" at={pMid} label={[cx(pMid[0] + 200), pMid[1] + 200]} startFrame={fMiddle} />
      <Disclaimer text="Magnified illustration · addresses are made up" />
    </Shell>
  );
};

export default Scene;
