// Scene: 2026-10-29-next S03 — IMAGINE (light passage).
// The phone lies almost flat on a pale clay plinth like a café table. Long-press on last week's
// "Sent 0x7A3f…9c2E" row on "address", the "Copy address" menu pops on "copied" with a thin orange outline.
// Two angles: overhead 3/4 drift (0–2.0 s), hard cut to a closer, lower angle on the top row (2.0 s → end).
import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { useTexture } from "@react-three/drei";
import { Shell, Studio3D, Phone, Plinth, Callout, Disclaimer, roundedRect, shapeWithUV, type SceneProps } from "../../kit";
import { UI } from "./_shared";

type Vec3 = [number, number, number];
const S = 30;
const CUT = 60; // 2.0 s new angle
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/* ---------- table layout ---------- */
const PLINTH_H = 0.6;
const YAW = 0.32; // phone turned a little on the table
const PHONE_Y = PLINTH_H + 0.075; // back of the phone rests on the plinth top
// screen image 700×1500 maps onto the 1.4×3.0 glass. px → phone-local (x, y)
const px = (x: number, y: number): [number, number] => [(x / 700 - 0.5) * 1.4, (0.5 - y / 1500) * 3.0];
// phone-local (x, y, z above glass) → world
const toWorld = (lx: number, ly: number, lz = 0.08): Vec3 => {
  // phone group: rotation y = YAW, then x = -PI/2 (lying flat, screen up, top of phone away from camera)
  const v = new THREE.Vector3(lx, ly, lz).applyEuler(new THREE.Euler(-Math.PI / 2, YAW, 0, "YXZ"));
  return [v.x, v.y + PHONE_Y, v.z];
};

/* ---------- camera paths (we drive from=to per frame so we can project callouts exactly) ---------- */
const ROW = toWorld(...px(330, 300)); // top row "Sent 0x7A3f…9c2E"
const MENU = toWorld(...px(315, 396)); // "Copy address" item
const shotA = { from: [-2.1, 7.4, 7.4] as Vec3, to: [-0.8, 6.5, 6.1] as Vec3, target: [0, PHONE_Y, 0.15] as Vec3, fov: 32 };
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const shotB = { from: add(MENU, [2.0, 4.2, 5.0]), to: add(MENU, [1.45, 3.7, 4.35]), target: [MENU[0] + 0.3, MENU[1], MENU[2] + 0.85] as Vec3, fov: 32 };
const camAt = (f: number) => {
  if (f < CUT) {
    const t = smooth(interpolate(f, [0, CUT], [0, 1], clamp));
    return { pos: lerp3(shotA.from, shotA.to, t), target: shotA.target, fov: shotA.fov };
  }
  const t = interpolate(f, [CUT, 135], [0, 1], clamp);
  const e = 1 - Math.pow(1 - t, 1.6); // keeps drifting to the last frame
  return { pos: lerp3(shotB.from, shotB.to, e), target: shotB.target, fov: shotB.fov };
};
const project = (p: Vec3, f: number): [number, number] => {
  const c = camAt(f);
  const cam = new THREE.PerspectiveCamera(c.fov, 1080 / 1920, 0.1, 100);
  cam.position.set(...c.pos);
  cam.lookAt(...c.target);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(cam);
  return [(v.x * 0.5 + 0.5) * 1080, (0.5 - v.y * 0.5) * 1920];
};

/* ---------- screen: both textures stay mounted, the copy-menu one shows from `swapAt` ---------- */
const ScreenTex: React.FC<{ src: string; visible: boolean; z: number }> = ({ src, visible, z }) => {
  const tex = useTexture(staticFile(src));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const geo = useMemo(() => shapeWithUV(roundedRect(1.4, 3.0, 0.15)), []);
  return (
    <mesh geometry={geo} position={[0, 0, z]} visible={visible}>
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

/** Thin orange outline around the "Copy address" item (the ONE accent). Pops on "copied". */
const MenuOutline: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 160 } });
  const [x0, y0] = px(150, 355), [x1, y1] = px(480, 437);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y0 - y1, t = 0.012;
  const mat = <meshBasicMaterial color="#FF8000" toneMapped={false} transparent opacity={Math.min(1, s * 1.4)} />;
  return (
    <group position={[cx, cy, 0.085]} scale={1.12 - 0.12 * s}>
      <mesh position={[0, h / 2, 0]}><planeGeometry args={[w + t, t]} />{mat}</mesh>
      <mesh position={[0, -h / 2, 0]}><planeGeometry args={[w + t, t]} />{mat}</mesh>
      <mesh position={[-w / 2, 0, 0]}><planeGeometry args={[t, h]} />{mat}</mesh>
      <mesh position={[w / 2, 0, 0]}><planeGeometry args={[t, h]} />{mat}</mesh>
    </group>
  );
};

/** Long-press ripple (neutral white, not orange) on the "Sent" row, from "address" until the menu pops. */
const PressRing: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 10) return null;
  const grow = interpolate(f, [from, to], [0.03, 0.16], clamp);
  const op = interpolate(f, [from, from + 4, to, to + 10], [0, 0.85, 0.85, 0], clamp);
  const [x, y] = px(300, 300);
  return (
    <group position={[x, y, 0.09]}>
      <mesh><ringGeometry args={[grow * 0.82, grow, 48]} /><meshBasicMaterial color="#ffffff" transparent opacity={op * 0.8} toneMapped={false} /></mesh>
      <mesh><circleGeometry args={[grow * 0.82, 48]} /><meshBasicMaterial color="#ffffff" transparent opacity={op * 0.12} toneMapped={false} /></mesh>
    </group>
  );
};

const Table: React.FC<{ swapAt: number; pressAt: number }> = ({ swapAt, pressAt }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Plinth radius={2.4} height={PLINTH_H} mat="clay" />
      <group position={[0, PHONE_Y, 0]} rotation={[-Math.PI / 2, YAW, 0, "YXZ"]}>
        <Phone position={[0, 0, 0]} rotation={[0, 0, 0]} />
        <ScreenTex src={UI.history} visible={f < swapAt} z={0.076} />
        <ScreenTex src={UI.historyCopy} visible={f >= swapAt} z={0.077} />
        <PressRing from={pressAt} to={swapAt} />
        <MenuOutline at={swapAt} />
      </group>
    </>
  );
};

const Shot: React.FC<{ swapAt: number; pressAt: number; offset: number; dur: number }> = ({ swapAt, pressAt, offset, dur }) => {
  const f = useCurrentFrame() + offset; // scene frame
  const c = camAt(f);
  return (
    <Studio3D tone="light" camera={{ from: c.pos, to: c.pos, target: c.target, fov: c.fov, durationFrames: dur }}>
      <Table swapAt={swapAt - offset} pressAt={pressAt - offset} />
    </Studio3D>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const w = props.vo?.words ?? [];
  const at = (txt: string, fb: number) => {
    const x = w.find((q) => q.text.toLowerCase().replace(/[^a-z]/g, "") === txt);
    return x ? Math.round(x.start * S) : fb;
  };
  const pressAt = at("address", 60);
  const swapAt = at("copied", 78);
  const [mx, my] = project(toWorld(...px(440, 396)), f); // right part of the "Copy address" item
  return (
    <Shell props={props} tone="light">
      <Sequence durationInFrames={CUT} layout="none">
        <Shot swapAt={swapAt} pressAt={pressAt} offset={0} dur={CUT} />
      </Sequence>
      <Sequence from={CUT} durationInFrames={durationInFrames - CUT} layout="none">
        <Shot swapAt={swapAt} pressAt={pressAt} offset={CUT} dur={durationInFrames - CUT} />
      </Sequence>
      {f >= swapAt && <Callout text="COPY" at={[mx, my]} label={[Math.max(160, Math.min(920, mx + 60)), my - 230]} startFrame={swapAt} accent tone="light" />}
      <Disclaimer text="Illustration" tone="light" />
    </Shell>
  );
};

export default Scene;
