// Scene: 2026-10-29-next S10 — PROOF: May 2024 test, then ~$68M to a lookalike (Chainalysis).
// 0–59  : B&W document plates (Chainalysis title → May 3rd paragraph), slow push, typed "3 MAY 2024".
// 60–209: 3D. Phone (Send screen) left, REAL row (upper) + FAKE row (lower) right, both shortened the same.
//         Small grey coin → REAL on "test"; big orange coin (the ONE accent) arcs toward REAL, veers to FAKE,
//         lands on "lookalike". "$68M" label rides the big coin from "million".
// Local helpers worth promoting to the kit: `camAt` + `project` (one camera fn drives both the 3D rig and
// 2D callout anchors, so labels track moving 3D objects), `PathCoin` (coin along any CatmullRom path), `DocPlate`.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Shell, Studio3D, Phone, Coin, Callout, Disclaimer, Typewriter, Enter, asset, type SceneProps } from "../../kit";
import { REAL, FAKE, UI, PROOF, TileRow } from "./_shared";
import { brand } from "../../brand";

type Vec3 = [number, number, number];
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.45, 0, 0.3, 1);
const fr = (props: SceneProps, i: number) => Math.round((props.vo?.words?.[i]?.start ?? 0) * 30);

/* ------------------------------------------------------------------ plates ------------------------------------------------------------------ */
/** A B&W document plate: page crop on a dark ground, slow push toward an origin point (fractions of the plate). */
const DocPlate: React.FC<{ src: string; srcW: number; srcH: number; cropH?: number; width: number; centerY: number; push: number; origin: [number, number]; drift?: number }> = ({
  src, srcW, srcH, cropH = srcH, width, centerY, push, origin, drift = 0,
}) => {
  const s = width / srcW;
  const h = cropH * s;
  const pad = 44;
  return (
    <div style={{ position: "absolute", left: (1080 - width) / 2 - pad + drift, top: centerY - h / 2 - pad, width: width + pad * 2, height: h + pad * 2,
      background: "#f4f4f2", borderRadius: 6, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.65), 0 4px 14px rgba(0,0,0,0.5)",
      transform: `scale(${push})`, transformOrigin: `${origin[0] * 100}% ${origin[1] * 100}%`, filter: "grayscale(1) contrast(1.05) brightness(0.93)" }}>
      <div style={{ position: "absolute", left: pad, top: pad, width, height: h, overflow: "hidden" }}>
        <Img src={asset(src)} style={{ width, height: srcH * s, display: "block" }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ camera ------------------------------------------------------------------ */
// Absolute scene frames. Shot A (60–114): wide 3/4, slow push. Shot B (115–209): hard cut lower, follows the big coin down to FAKE.
const CUT_B = 115;
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
type Cam = { pos: Vec3; target: Vec3; fov: number };
const camAt = (f: number): Cam => {
  if (f < CUT_B) {
    const p = ease(interpolate(f, [60, CUT_B], [0, 1], clamp));
    return { pos: lerp3([-2.0, 3.1, 15.6], [-0.9, 2.7, 14.4], p), target: lerp3([0.15, 1.6, 0], [0.2, 1.65, 0], p), fov: 32 };
  }
  const p = inOut(interpolate(f, [CUT_B, 209], [0, 1], clamp));
  return { pos: lerp3([1.6, 1.2, 14.8], [0.8, 0.8, 13.4], p), target: lerp3([0.15, 1.9, 0], [0.25, 1.55, 0], p), fov: 32 };
};
const CamRig: React.FC<{ offset: number }> = ({ offset }) => {
  const f = useCurrentFrame() + offset;
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camAt(f);
    camera.position.set(...c.pos);
    (camera as THREE.PerspectiveCamera).fov = c.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...c.target);
  });
  return null;
};
const projCam = new THREE.PerspectiveCamera(32, 1080 / 1920, 0.1, 200);
const project = (f: number, p: Vec3): [number, number] => {
  const c = camAt(f);
  projCam.fov = c.fov;
  projCam.position.set(...c.pos);
  projCam.lookAt(...c.target);
  projCam.updateMatrixWorld();
  projCam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(projCam);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};

/* ------------------------------------------------------------------ layout ------------------------------------------------------------------ */
const ROW_SCALE = 0.42;
const ROW_X = 0.9;
const REAL_Y = 2.25;
const FAKE_Y = 1.0;
const TILE_TOP = 0.25 * ROW_SCALE; // half tile height
const shortOf = (a: string) => a.slice(0, 6) + "…" + a.slice(-4); // how apps shorten both (identical on purpose)
const SMALL_R = 0.15;
const BIG_R = 0.27;
const SMALL_END: Vec3 = [ROW_X + 0.15, REAL_Y + TILE_TOP + SMALL_R + 0.01, 0.02];
const BIG_END: Vec3 = [ROW_X, FAKE_Y + TILE_TOP + BIG_R + 0.01, 0.02];
const PHONE_OUT: Vec3 = [-0.85, 1.75, 0.6];

const smallPath = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...PHONE_OUT), new THREE.Vector3(0.0, 3.25, 0.5), new THREE.Vector3(...SMALL_END));
// Big coin: heads for the REAL row first, then veers down to the lookalike.
const bigPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(...PHONE_OUT), new THREE.Vector3(-0.35, 2.85, 0.75), new THREE.Vector3(0.6, 3.05, 0.6),
  new THREE.Vector3(1.55, 2.35, 0.6), new THREE.Vector3(1.3, 1.75, 0.4), new THREE.Vector3(...BIG_END),
], false, "catmullrom", 0.5);

const SMALL_T: [number, number] = [62, 80];   // "sent" → lands on "test" (2.68 s)
const BIG_T: [number, number] = [116, 168];   // "sixty-eight" (3.84 s) → lands on "lookalike" (5.59 s)
const progress = (f: number, [a, b]: [number, number]) => inOut(interpolate(f, [a, b], [0, 1], clamp));
const pointOn = (curve: THREE.Curve<THREE.Vector3>, p: number): Vec3 => curve.getPoint(p).toArray() as Vec3;

/** A coin travelling along any curve, spinning about its face axis and settling upright (face to camera) on arrival. */
const PathCoin: React.FC<{ curve: THREE.Curve<THREE.Vector3>; p: number; radius: number; accent?: boolean; trail?: boolean; glow?: number }> = ({ curve, p, radius, accent = false, trail = true, glow = 0 }) => {
  const dots = useMemo(() => curve.getPoints(48), [curve]);
  if (p <= 0) return null;
  const pos = pointOn(curve, p);
  const spin = (1 - p) * Math.PI * 4; // ends at 0 → glyph upright
  const flipY = (1 - p) * 0.9;
  return (
    <group>
      {trail && dots.map((d, i) => (i / 48 <= p && i / 48 > p - 0.55 ? (
        <mesh key={i} position={d}><sphereGeometry args={[0.018, 8, 8]} /><meshBasicMaterial color="#7d7d7d" /></mesh>
      ) : null))}
      <group position={pos} rotation={[0, flipY, 0]}>
        <group rotation={[Math.PI / 2, spin, 0]}>
          <Coin radius={radius} accent={accent} position={[0, 0, 0]} />
        </group>
      </group>
      {glow > 0 && <pointLight position={[pos[0], pos[1], pos[2] + 0.5]} color="#FF8000" intensity={glow} distance={1.6} decay={2} />}
    </group>
  );
};

const Stage: React.FC<{ offset: number }> = ({ offset }) => {
  const f = useCurrentFrame() + offset;
  const ps = progress(f, SMALL_T);
  const pb = progress(f, BIG_T);
  const landed = interpolate(f, [BIG_T[1], BIG_T[1] + 10], [0, 1], clamp);
  const fakeNudge = Math.sin(Math.min(1, Math.max(0, (f - BIG_T[1]) / 8)) * Math.PI) * -0.03; // row dips as the coin lands
  return (
    <>
      <CamRig offset={offset} />
      <Enter at={-6} position={[-1.15, 0, 0.4]} float={0.02}>
        <Phone screen={UI.send} position={[0, 1.65, 0]} rotation={[0, 0.42, 0]} scale={0.66} />
      </Enter>
      <Enter at={-4} position={[ROW_X, REAL_Y, 0]} float={0.015}>
        <group scale={ROW_SCALE}><TileRow chars={shortOf(REAL)} position={[0, 0, 0]} /></group>
      </Enter>
      <Enter at={-2} position={[ROW_X, FAKE_Y + fakeNudge, 0]} float={0.015}>
        <group scale={ROW_SCALE}><TileRow chars={shortOf(FAKE)} position={[0, 0, 0]} /></group>
      </Enter>
      <PathCoin curve={smallPath} p={ps} radius={SMALL_R} trail={f < 150} />
      <PathCoin curve={bigPath} p={pb} radius={BIG_R} accent glow={pb > 0 ? 0.8 + landed * 0.5 : 0} />
    </>
  );
};

/** Callout variant with the label BELOW its leader (kit Callout draws text above the label point, so a leader going up would cross it). */
const CalloutBelow: React.FC<{ text: string; at: [number, number]; label: [number, number]; startFrame: number; size?: number }> = ({ text, at, label, startFrame, size = 24 }) => {
  const f = useCurrentFrame() - startFrame;
  if (f < 0) return null;
  const line = ease(interpolate(f, [0, 10], [0, 1], clamp));
  const op = interpolate(f, [4, 12], [0, 1], clamp);
  const [x1, y1] = label, [x2, y2] = at;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * line} y2={y1 + (y2 - y1) * line} stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
        <circle cx={x2} cy={y2} r={3.5} fill="rgba(255,255,255,0.92)" opacity={line > 0.98 ? 1 : 0} />
      </svg>
      <div style={{ position: "absolute", left: x1, top: y1 + 8, transform: "translateX(-50%)", fontFamily: brand.body, fontWeight: 700, fontSize: size,
        letterSpacing: size * 0.12, textTransform: "uppercase", color: "rgba(255,255,255,0.92)", opacity: op, whiteSpace: "nowrap" }}>{text}</div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ scene ------------------------------------------------------------------ */
const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const fTest = fr(props, 6);       // 2.68 s
  const fMillion = fr(props, 10);   // 4.49 s
  const fLook = fr(props, 14);      // 5.59 s

  // Plates (0–59)
  const plateA = f < 27;
  const pushA = 1 + 0.06 * ease(interpolate(f, [0, 27], [0, 1], clamp));
  const pushB = 1.0 + 0.1 * ease(interpolate(f, [27, 60], [0, 1], clamp));
  const driftB = interpolate(f, [27, 60], [10, -14], clamp);

  // 3D label anchors (absolute frames)
  const small = project(f, SMALL_END);
  const bigPos = pointOn(bigPath, progress(f, BIG_T));
  const big = project(f, bigPos);
  const fakeLeft = project(f, [ROW_X - 0.86, FAKE_Y - TILE_TOP, 0.05]);

  return (
    <Shell props={props} tone="dark">
      {f < 60 ? (
        <AbsoluteFill style={{ background: "#0E0F11" }}>
          {plateA ? (
            <DocPlate src={PROOF.title} srcW={1290} srcH={840} cropH={700} width={930} centerY={930} push={pushA} origin={[0.35, 0.6]} />
          ) : (
            <DocPlate src={PROOF.may3} srcW={1170} srcH={474} width={940} centerY={930} push={pushB} origin={[0.72, 0.5]} drift={driftB} />
          )}
          <Callout text="Source: Chainalysis" at={plateA ? [300, 700] : [300, 760]} label={[300, 600]} startFrame={9} />
          <Typewriter text="3 May 2024" startFrame={6} y={1260} size={34} cps={14} />
        </AbsoluteFill>
      ) : (
        <Sequence from={60} layout="none">
          <Studio3D tone="dark" camera={{ from: [0, 2.9, 13.8], target: [0.1, 1.65, 0], fov: 32 }}>
            <Stage offset={60} />
          </Studio3D>
        </Sequence>
      )}
      {f >= 60 && (
        <>
          <Callout text="Test" at={[small[0] + 6, small[1] - 14]} label={[small[0] + 40, small[1] - 120]} startFrame={fTest} />
          {f >= fMillion && (
            <Callout text="$68M" accent size={34} at={[big[0] - 4, big[1] - 30]} label={[big[0] - 210, big[1] - 18]} startFrame={fMillion} />
          )}
          <CalloutBelow text="Lookalike" at={[fakeLeft[0], fakeLeft[1] + 4]} label={[fakeLeft[0] + 30, fakeLeft[1] + 120]} startFrame={fLook} />
          <Disclaimer text="Magnified illustration · addresses are made up" />
        </>
      )}
    </Shell>
  );
};

export default Scene;
