// Scene: 2026-10-29-next S02 — LOOP "So what did you miss?" + REFRAME "a lookalike planted in your own history".
// Shot A (0–1.36 s): macro on the Send screen's To field, pulling back to the whole phone. Nothing orange.
// Shot B (1.36 s–end): hard cut to a low 3/4 angle on the Activity screen, slow push; on "lookalike" (3.30 s)
// the planted TOP row lights orange and lifts 0.15 toward camera; on "planted" (4.13 s) the PLANTED callout;
// then a gentle drift right toward the risen row.
import React, { useLayoutEffect, useMemo } from "react";
import { Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Phone, Callout, Disclaimer, roundedRect, type SceneProps } from "../../kit";
import { UI } from "./_shared";

type Vec3 = [number, number, number];
const FPS = 30;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.35, 1);

// Assets cut from ui-history-planted.png (rows 239–361 px of 700×1500): the planted row alone, and the screen with that slot empty.
const ROW_IMG = "runs/2026-10-29-next/S02-row.png";
const GAP_IMG = "runs/2026-10-29-next/S02-history-gap.png";

// Phone placement (kit Phone: screen 1.4 × 3.0 units ↔ 700 × 1500 px, glass at local z = 0.074).
const PHONE_POS: Vec3 = [0, 1.6, 0];
const PHONE_ROT_Y = -0.12;
const pxY = (py: number) => (0.5 - py / 1500) * 3.0; // screenshot px → local y
const ROW_Y = pxY(300); // planted row centre (≈ 0.90)
const ROW_H = (123 / 1500) * 3.0; // ≈ 0.246
const TO_Y = pxY(340); // To field centre on the Send screen (≈ 0.82)

/* ---------- camera: keyframed per shot, as a pure function of frame (also used to project callouts) ---------- */
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const bez3 = (a: Vec3, b: Vec3, c: Vec3, t: number): Vec3 => lerp3(lerp3(a, b, t), lerp3(b, c, t), t);
type Pose = { pos: Vec3; target: Vec3; fov: number };
const CUT = 41; // "It" at 1.365 s

const poseAt = (f: number, dur: number): Pose => {
  if (f < CUT) {
    // macro of the To field → whole phone (pull back and up)
    const p = easeOut(interpolate(f, [0, CUT], [0, 1], clamp));
    return {
      pos: lerp3([0.1, PHONE_POS[1] + TO_Y - 0.08, 3.5], [0.05, 1.8, 10.4], p),
      target: lerp3([0.0, PHONE_POS[1] + TO_Y - 0.05, 0], [0, 1.36, 0], p),
      fov: 30,
    };
  }
  // low 3/4 on the history list: push in, then drift right toward the risen row (one smooth curve, never stops)
  const u = easeInOut(interpolate(f, [CUT, dur], [0, 1], clamp));
  const v = 0.18 + 0.82 * u; // start already moving
  const w = interpolate(f, [CUT, dur], [0, 1], clamp);
  return {
    pos: bez3([1.9, 1.75, 8.2], [0.6, 1.7, 6.6], [1.5, 1.95, 6.1], v),
    target: lerp3([0.02, 2.05, 0], [0.1, 2.2, 0.1], w),
    fov: 31,
  };
};

const CamRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { camera } = useThree();
  const { pos, target, fov } = poseAt(frame, durationInFrames);
  useLayoutEffect(() => {
    camera.position.set(...pos);
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...target);
  });
  return null;
};

/** World point (in phone-local coords) → 1080×1920 px, using the same camera pose. */
const projectPx = (local: Vec3, f: number, dur: number): [number, number] => {
  const { pos, target, fov } = poseAt(f, dur);
  const cam = new THREE.PerspectiveCamera(fov, 1080 / 1920, 0.1, 100);
  cam.position.set(...pos);
  cam.lookAt(...target);
  cam.updateMatrixWorld();
  const g = new THREE.Object3D();
  g.position.set(...PHONE_POS);
  g.rotation.set(0, PHONE_ROT_Y, 0);
  g.updateMatrixWorld();
  const v = new THREE.Vector3(...local).applyMatrix4(g.matrixWorld).project(cam);
  return [(v.x * 0.5 + 0.5) * 1080, (-v.y * 0.5 + 0.5) * 1920];
};

/* ---------- soft glow sprite texture (radial orange falloff) ---------- */
const useGlowTex = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 128;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(128, 64, 4, 128, 64, 128);
    g.addColorStop(0, "rgba(255,128,0,0.9)");
    g.addColorStop(0.45, "rgba(255,110,0,0.35)");
    g.addColorStop(1, "rgba(255,100,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

/* ---------- LiftedRow: one UI row peeled off the screen, sitting on an orange-lit slab (promotable to kit) ---------- */
const LiftedRow: React.FC<{ lift: number; glow: number }> = ({ lift, glow }) => {
  const tex = useTexture(staticFile(ROW_IMG));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const glowTex = useGlowTex();
  const frame = useCurrentFrame();
  const pulse = 0.9 + 0.1 * Math.sin(frame / 6);
  const rim = useMemo(() => {
    const outer = roundedRect(1.43, ROW_H + 0.034, 0.045);
    const hole = roundedRect(1.4, ROW_H + 0.006, 0.035);
    outer.holes.push(hole as unknown as THREE.Path);
    return new THREE.ShapeGeometry(outer, 12);
  }, []);
  const z = 0.076 + lift;
  return (
    <group position={[0, ROW_Y, 0]}>
      {/* soft orange bloom on the screen under the row */}
      <mesh position={[0, 0, 0.0755]} scale={[1 + 0.08 * lift / 0.15, 1, 1]}>
        <planeGeometry args={[1.75, 0.55]} />
        <meshBasicMaterial map={glowTex} transparent opacity={0.32 * glow * pulse} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* side walls: the row rises out of its slot as a block */}
      <RoundedBox args={[1.38, ROW_H - 0.01, Math.max(0.006, lift + 0.004)]} radius={0.003} smoothness={2} position={[0, 0, 0.074 + (lift + 0.004) / 2]}>
        <meshStandardMaterial color="#0b0c0e" metalness={0.3} roughness={0.5} />
      </RoundedBox>
      {/* the row itself */}
      <mesh position={[0, 0, z]}>
        <planeGeometry args={[1.4, ROW_H]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* orange rim — the ONE glowing system */}
      <mesh geometry={rim} position={[0, 0, z + 0.002]}>
        <meshStandardMaterial color="#FF8000" emissive="#FF6A00" emissiveIntensity={1.2 * glow} transparent opacity={glow} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = props.vo?.words ?? [];
  const at = (txt: string, nth = 0, fallback = 0) => {
    const hits = words.filter((w) => w.text.toLowerCase().replace(/[^a-z]/g, "") === txt);
    return Math.round((hits[nth]?.start ?? fallback) * FPS);
  };
  const fLook = at("lookalike", 0, 3.304); // 99
  const fPlanted = at("planted", 0, 4.133); // 124

  const lift = 0.15 * spring({ frame: f - fLook, fps, config: { damping: 16, stiffness: 90 } });
  const glow = interpolate(f, [fLook, fLook + 8], [0, 1], clamp);
  const lifted = f >= fLook;
  const screen = f < CUT ? UI.send : lifted ? GAP_IMG : UI.historyPlanted;

  // callout: dot on the row's right end (the "…9c2E"), label up-right of it, tracking the camera.
  const dot = projectPx([-0.14, ROW_Y - 0.03, 0.08 + lift], f, durationInFrames);
  const label: [number, number] = [Math.min(800, dot[0] + 300), dot[1] - 170];

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" floor={false} camera={{ from: [0, 1.9, 8], target: [0, 1.8, 0], fov: 30 }}>
        <CamRig />
        <group position={PHONE_POS} rotation={[0, PHONE_ROT_Y, 0]}>
          <Phone screen={screen} position={[0, 0, 0]} rotation={[0, 0, 0]} />
          {lifted && <LiftedRow lift={lift} glow={glow} />}
        </group>
        {/* preload the later screens so the cut is clean */}
        <Preload srcs={[UI.historyPlanted, GAP_IMG, ROW_IMG]} />
      </Studio3D>
      <Callout text="Planted" at={dot} label={label} startFrame={fPlanted} accent />
      <Disclaimer text="Magnified illustration · addresses are made up" y={1480} />
    </Shell>
  );
};

const Preload: React.FC<{ srcs: string[] }> = ({ srcs }) => {
  useTexture(srcs.map((s) => staticFile(s)));
  return null;
};

export default Scene;
