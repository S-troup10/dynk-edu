// Scene: 2026-10-29-next S12 — THAT'S ALSO WHY #1: strangers send tiny or zero amounts.
// Lock screen on a 3D phone. A "+0.00 ETH" notification card (separate 3D plane) slides in on "strangers",
// carries the ONE orange system (emissive outline) until "Never", then greys out and a white strike crosses it on "copy".
// Two hard-cut angles: 3/4 front (0–1.5 s), then a push into the notification from the other side (1.5 s → end).
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Phone, Callout, Disclaimer, roundedRect, shapeWithUV, type SceneProps } from "../../kit";

type Vec3 = [number, number, number];
const FPS = 30;
const CUT = 45; // 1.5 s
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const BG = "runs/2026-10-29-next/S12-lock-bg.png"; // ui-lock with the card painted out
const NOTIF = "runs/2026-10-29-next/S12-notif.png"; // the card itself (3x, rounded alpha)

// phone placement (shared by both shots)
const PH_POS: Vec3 = [0, 1.45, 0];
const PH_SCALE = 0.85;
// notification card in phone-local units (screen is 1.4 × 3.0; image is 700 × 1500 px → 0.002 u/px)
const N_W = 1.28, N_H = 0.318, N_R = 0.06, N_Y = 0.375, N_Z = 0.086;

// camera moves (Studio3D's Rig eases from→to over durationFrames with this same bezier)
const CAM_A = { from: [0.8, 1.95, 7.6] as Vec3, to: [0.4, 1.85, 6.8] as Vec3, target: [-0.1, 1.75, 0] as Vec3, fov: 32, startFrame: 0, durationFrames: 70 };
const B_LEN = 169 - CUT;
const CAM_B = { from: [-0.75, 2.55, 6.8] as Vec3, to: [0.05, 2.05, 5.3] as Vec3, target: [0, 1.9, 0] as Vec3, fov: 30, startFrame: 0, durationFrames: B_LEN };
const ROT_B = 0.08;

/** project a world point to 1080×1920 px for a given camera move at a given (shot-local) frame */
const project = (cam: typeof CAM_B, f: number, p: Vec3): [number, number] => {
  const k = ease(interpolate(f - cam.startFrame, [0, cam.durationFrames], [0, 1], clamp));
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 100);
  c.position.set(...(cam.from.map((v, i) => v + (cam.to[i] - v) * k) as Vec3));
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};
/** phone-local → world (phone rotated about Y) */
const toWorld = (lx: number, ly: number, lz: number, ry: number): Vec3 => [
  PH_POS[0] + PH_SCALE * (lx * Math.cos(ry) + lz * Math.sin(ry)),
  PH_POS[1] + PH_SCALE * ly,
  PH_POS[2] + PH_SCALE * (-lx * Math.sin(ry) + lz * Math.cos(ry)),
];

/* ---------- the notification card: texture plane + orange emissive outline + strike line ---------- */
const ring = (w: number, h: number, r: number, t: number) => {
  const s = roundedRect(w + 2 * t, h + 2 * t, r + t);
  s.holes.push(roundedRect(w, h, r));
  return new THREE.ShapeGeometry(s, 16);
};

const NotifCard: React.FC<{ frame: number }> = ({ frame }) => {
  const tex = useTexture(staticFile(NOTIF));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const plane = useMemo(() => shapeWithUV(roundedRect(N_W, N_H, N_R)), []);
  const edge = useMemo(() => ring(N_W, N_H, N_R, 0.014), []);
  // soft falloff: three thin translucent rings outside the hard edge
  const halos = useMemo(() => [0.018, 0.04, 0.07].map((t, i, a) => {
    const inner = i === 0 ? 0.014 : 0.014 + a[i - 1];
    return ring(N_W + 2 * inner, N_H + 2 * inner, N_R + inner, t - (i === 0 ? 0 : a[i - 1]));
  }), []);
  const fStr = Math.round(0.765 * FPS); // "strangers"
  const fNever = Math.round(3.941 * FPS); // "Never"
  const fCopy = Math.round(4.158 * FPS); // "copy"
  const s = spring({ frame: frame - fStr, fps: FPS, config: { damping: 16, stiffness: 110 } });
  const glowIn = interpolate(frame, [fStr + 1, fStr + 8], [0, 1], clamp);
  const glowOut = interpolate(frame, [fNever, fNever + 7], [1, 0], clamp);
  const pulse = 0.85 + 0.15 * Math.sin(frame / 5);
  const glow = glowIn * glowOut;
  const grey = interpolate(frame, [fNever, fNever + 8], [0, 1], clamp);
  const strike = ease(interpolate(frame, [fCopy, fCopy + 10], [0, 1], clamp));
  if (s < 0.005) return null;
  const col = new THREE.Color("#ffffff").lerp(new THREE.Color("#7c7d80"), grey);
  return (
    <group position={[0, N_Y + 0.24 * (1 - s), N_Z]}>
      <mesh geometry={plane}>
        <meshBasicMaterial map={tex} transparent opacity={Math.min(1, s * 1.3) * (1 - 0.3 * grey)} color={col} toneMapped={false} />
      </mesh>
      {glow > 0.001 && (
        <>
          <mesh geometry={edge} position={[0, 0, 0.002]}>
            <meshBasicMaterial color="#FF8000" transparent opacity={glow} toneMapped={false} />
          </mesh>
          {halos.map((g, i) => (
            <mesh key={i} geometry={g} position={[0, 0, 0.001]}>
              <meshBasicMaterial color="#FF8000" transparent opacity={[0.2, 0.09, 0.04][i] * glow * pulse} toneMapped={false} depthWrite={false} />
            </mesh>
          ))}
        </>
      )}
      {strike > 0 && (
        <group position={[-(N_W / 2) - 0.03, 0, 0.004]}>
          <mesh position={[((N_W + 0.06) * strike) / 2, 0, 0]} scale={[strike, 1, 1]}>
            <planeGeometry args={[N_W + 0.06, 0.009]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Stage: React.FC<{ offset: number; ry: number }> = ({ offset, ry }) => {
  const frame = useCurrentFrame() + offset; // global scene frame
  return (
    <group position={PH_POS} rotation={[0, ry, 0]} scale={PH_SCALE}>
      <Phone screen={BG} position={[0, 0, 0]} rotation={[0, 0, 0]} />
      <NotifCard frame={frame} />
    </group>
  );
};

const ShotA: React.FC = () => {
  const f = useCurrentFrame();
  const ry = interpolate(f, [0, CUT], [-0.3, -0.18]);
  return (
    <Studio3D tone="dark" camera={CAM_A}>
      <Stage offset={0} ry={ry} />
    </Studio3D>
  );
};

const ShotB: React.FC = () => {
  const f = useCurrentFrame(); // shot-local
  const g = f + CUT;
  // callout DUST on "tiny" → leader to the "+0.00" on the card
  const fTiny = Math.round(1.722 * FPS);
  const fNever = Math.round(3.941 * FPS);
  const at = project(CAM_B, f, toWorld(-0.054, N_Y - N_H / 2, N_Z, ROT_B));
  const calloutOp = interpolate(g, [fNever, fNever + 7], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={CAM_B}>
        <Stage offset={CUT} ry={ROT_B} />
      </Studio3D>
      {calloutOp > 0 && (
        <AbsoluteFill style={{ opacity: calloutOp }}>
          <Callout text="DUST" at={[at[0], at[1]]} label={[at[0] + 170, at[1] + 230]} startFrame={fTiny - CUT} accent />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => (
  <Shell props={props} tone="dark">
    <Sequence from={0} durationInFrames={CUT}>
      <ShotA />
    </Sequence>
    <Sequence from={CUT}>
      <ShotB />
    </Sequence>
    <Disclaimer text="Illustration" />
  </Shell>
);

export default Scene;
