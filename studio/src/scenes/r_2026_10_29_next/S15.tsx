// Scene: 2026-10-29-next S15 · TWIST BACK
// VO: "So nobody broke into your wallet. You checked the ends, they matched, and you sent it yourself."
// Shot A (0–2.6 s): S01's opening macro track over FIRST4 (same from/to/fov, slower); FIRST4 glows on "checked".
// Shot B (2.6–4.5 s): hard cut, LAST4 macro drifting L→R; LAST4 glows on "ends"; ghost row drops and locks on "matched" + arcs.
// Shot C (4.5 s–end): slow pull back along the row, whole row + ghost in perspective, both locked ends orange, both callouts.
import React, { useLayoutEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import { useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, EnergyArcs, Mat, glyphTexture, type SceneProps } from "../../kit";
import { REAL, FIRST4, LAST4, TileRow, tileX } from "./_shared";

type Vec3 = [number, number, number];
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeIO = Easing.bezier(0.45, 0, 0.25, 1);
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];

const ROW_Y = 0.25;       // TileRow default (tile centre)
const GHOST_DY = 0.56;    // ghost rests stacked on top of the row
const B_START = 78;       // 2.6 s cut to LAST4 (just before "ends" 2.64)
const C_START = 135;      // 4.5 s pull back
const GLOW_FIRST = 66;    // "checked" 2.19 s
const GLOW_LAST = 79;     // "ends" 2.64 s
const DROP_AT = 98;       // ghost starts falling
const LOCK_AT = 107;      // "matched" 3.56 s

const FIRST_C = (tileX(2) + tileX(5)) / 2;
const LAST_C = (tileX(38) + tileX(41)) / 2;

type Cam = { pos: Vec3; target: Vec3; fov: number; fogNear: number; fogFar: number };
/** One camera function drives both the 3D rig and the 2D overlays (callouts, arcs) so they stay glued. */
const camAt = (f: number, total: number): Cam => {
  if (f < B_START) {
    // S01 0.0–1.4 s track, same from/to/fov, stretched over 2.6 s. Linear so frame 0 is already moving.
    // same path as S01 but slower: the full from→to would take 96 frames; we cut away at 78 (p≈0.81)
    const p = interpolate(f, [0, 96], [0, 1], clamp);
    const pos = lerp3([tileX(1) - 0.6, 0.55, 2.2], [tileX(6), 0.5, 2.0], p);
    return { pos, target: [pos[0] + 0.12, 0.28, 0], fov: 30, fogNear: 5.2, fogFar: 18 };
  }
  if (f < C_START) {
    const p = interpolate(f, [B_START, C_START], [0, 1], clamp);
    const pos = lerp3([LAST_C - 0.75, 0.95, 4.7], [LAST_C + 0.35, 0.88, 4.35], p);
    return { pos, target: [pos[0] + 0.15, 0.5, 0], fov: 30, fogNear: 7, fogFar: 20 };
  }
  const p = easeIO(interpolate(f, [C_START, total - 1], [0, 1], clamp));
  // look back along the row from beyond its LAST4 end: portrait-friendly perspective, both ends in frame
  const pos = lerp3([14.5, 1.4, 1.5], [20, 2.4, 1.8], p);
  const target = lerp3([6.5, 0.5, 0], [2, 0.5, 0], p);
  const d = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  return { pos, target, fov: 32, fogNear: d + 4, fogFar: d + 26 };
};

const ShotRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, scene } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    (camera as THREE.PerspectiveCamera).fov = cam.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...cam.target);
    if (scene.fog instanceof THREE.Fog) { scene.fog.near = cam.fogNear; scene.fog.far = cam.fogFar; }
  });
  return null;
};

/** world → 1080×1920 px for the given camera */
const projector = (cam: Cam) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 200);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return (p: Vec3): [number, number] => {
    const v = new THREE.Vector3(...p).project(c);
    return [(v.x + 1) * 540, (1 - v.y) * 960];
  };
};

/** Ghost row: "the address you meant", translucent graphite tiles with dim glyphs. (Kit candidate: GhostTileRow.) */
const GhostTile: React.FC<{ ch: string; x: number }> = ({ ch, x }) => {
  const tex = useMemo(() => glyphTexture(ch, { font: "600 300px 'DejaVu Sans Mono', monospace", w: 256, h: 320, fg: "#8a8d93", bg: "#1b1c1f" }), [ch]);
  return (
    <group position={[x, 0, 0]}>
      <RoundedBox args={[0.4, 0.5, 0.08]} radius={0.04} smoothness={2}>
        <Mat kind="graphite" opacity={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[0.34, 0.44]} />
        <meshStandardMaterial map={tex} transparent opacity={0.5} metalness={0.2} roughness={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
};
const GhostRow: React.FC<{ y: number }> = ({ y }) => (
  <group position={[0, y, 0]}>
    {REAL.split("").map((c, i) => <GhostTile key={i} ch={c} x={tileX(i)} />)}
  </group>
);

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const cam = camAt(f, durationInFrames);
  const P = projector(cam);

  const glow = [...(f >= GLOW_FIRST ? FIRST4 : []), ...(f >= GLOW_LAST ? LAST4 : [])];
  const drop = spring({ frame: f - DROP_AT, fps, config: { damping: 20, stiffness: 170, mass: 0.8 } });
  const ghostY = ROW_Y + GHOST_DY + (1 - drop) * 1.6;
  const ghostVisible = f >= B_START - 2;

  // overlay anchors
  const lastTop = P([LAST_C, ROW_Y + 0.28, 0.05]);
  const lastL = P([tileX(38) - 0.2, ROW_Y + 0.28, 0.05]);
  const lastR = P([tileX(41) + 0.2, ROW_Y + 0.28, 0.05]);
  const firstTop = P([FIRST_C, ROW_Y + 0.28, 0.05]);
  const firstL = P([tileX(2) - 0.2, ROW_Y + 0.28, 0.05]);
  const firstR = P([tileX(5) + 0.2, ROW_Y + 0.28, 0.05]);
  const lastW = Math.max(60, Math.abs(lastR[0] - lastL[0]));
  const firstW = Math.max(40, Math.abs(firstR[0] - firstL[0]));

  // shot A callout target: tile "A"/"3" face, label above
  const aPt = P([tileX(4), ROW_Y + 0.12, 0.05]);
  const bPt = P([tileX(39), ROW_Y - 0.1, 0.05]);
  const cFirst = P([FIRST_C, ROW_Y + GHOST_DY + 0.3, 0]);
  const cLast = P([LAST_C, ROW_Y - 0.12, 0.05]);

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" shadows={false} floor={f < C_START} camera={{ from: cam.pos, target: cam.target, fov: cam.fov }}>
        <ShotRig cam={cam} />
        <ContactShadows position={[0, 0.005, 0]} opacity={0.85} scale={[26, 6]} blur={2.6} far={4} resolution={1024} color="#000000" frames={Infinity} />
        <TileRow chars={REAL} glow={glow} />
        {ghostVisible && <GhostRow y={ghostY} />}
      </Studio3D>

      {/* the ONE glowing system: locked ends (orange tiles + arcs where the ghost meets the row) */}
      {f >= B_START && f < C_START && (
        <EnergyArcs x={lastTop[0]} y={lastTop[1]} width={Math.min(lastW, 700)} height={110} startFrame={LOCK_AT} />
      )}
      {f >= C_START && (
        <>
          <EnergyArcs x={lastTop[0]} y={lastTop[1]} width={Math.min(lastW, 600)} height={Math.max(50, lastW * 0.35)} startFrame={C_START - 18} />
          <EnergyArcs x={firstTop[0]} y={firstTop[1]} width={firstW} height={Math.max(24, firstW * 0.35)} count={7} startFrame={C_START - 18} />
        </>
      )}

      {/* callouts on their words */}
      {f < B_START && <Callout text="FIRST 4" at={aPt} label={[290, 495]} startFrame={GLOW_FIRST} />}
      {f >= B_START && f < C_START && <Callout text="LAST 4" at={bPt} label={[830, 1460]} startFrame={GLOW_LAST} />}
      {f >= C_START && (
        <>
          <Callout text="FIRST 4" at={cFirst} label={[Math.max(170, cFirst[0] - 90), cFirst[1] - 170]} startFrame={C_START - 12} />
          <Callout text="LAST 4" at={cLast} label={[Math.max(200, cLast[0] - 230), Math.min(1420, cLast[1] + 130)]} startFrame={C_START - 12} />
        </>
      )}

      <Disclaimer text="Magnified illustration · addresses are made up" />
    </Shell>
  );
};

export default Scene;
