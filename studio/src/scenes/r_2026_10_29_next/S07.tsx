// Scene: 2026-10-29-next S07 — MECHANISM (action): the planted row now sits beside the real one.
// Top-down over a phone lying flat. The two history rows peel up out of the screen as magnified glass slabs:
// the planted "Received 0x7A3f…9c2E +0.00" (orange, the ONE accent) on "history", the real
// "Sent 0x7A3f…9c2E −0.25" (graphite) on "beside". Camera tracks down to the real row and back up.
import React, { useLayoutEffect, useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Phone, Mat, Callout, Disclaimer, type SceneProps } from "../../kit";
import { UI, SHORT } from "./_shared";

type Vec3 = [number, number, number];
const FPS = 30;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.45, 0, 0.25, 1);
const ORANGE = "#FF8000";
const FOV = 32;

/* ---------------- phone + screen geometry (phone lies flat, screen up, image-top toward -z) ---------------- */
const PHONE_SCALE = 1.3;
const PHONE_Y = 0.1;
const GLASS_Y = PHONE_Y + 0.076 * PHONE_SCALE; // world y of the screen surface
// screenshot is 700×1500 on a 1.4×3.0 glass. Row pixel bands: row1 238–362, row2 363–487.
const rowZ = (pxTop: number, pxBot: number) => -(1.5 - ((pxTop + pxBot) / 2 / 1500) * 3.0) * PHONE_SCALE;
const ROW1_Z = rowZ(238, 362); // ≈ -1.19
const ROW2_Z = rowZ(363, 487); // ≈ -0.86
const ROW_H = (124 / 1500) * 3.0 * PHONE_SCALE; // ≈ 0.32
const ROW_W = 1.4 * PHONE_SCALE;

/* ---------------- magnified slab layout ---------------- */
const SLAB_W = 1.55;
const SLAB_H = 0.42;
const SLAB1_END: Vec3 = [0, 1.2, -1.45];
const SLAB2_END: Vec3 = [0, 1.0, -0.55];

/* ---------------- camera path (keyframes in seconds) ---------------- */
type Key = { t: number; pos: Vec3; tgt: Vec3 };
const KEYS: Key[] = [
  { t: 0.0, pos: [0.3, 8.6, 1.0], tgt: [0.05, 0.6, -1.0] },
  { t: 1.55, pos: [0.1, 7.9, 0.5], tgt: [0, 0.8, -1.15] },    // push in on the planted row
  { t: 2.35, pos: [-0.1, 7.8, 1.0], tgt: [0, 0.8, -0.7] },    // "beside" → track down to the real row
  { t: 3.6, pos: [-0.25, 8.2, 0.6], tgt: [0, 0.8, -1.0] },    // back up, both rows in view
];
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const camAt = (sec: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && sec > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const p = ease(interpolate(sec, [a.t, b.t], [0, 1], clamp));
  const pos = a.pos.map((v, k) => lerp(v, b.pos[k], p)) as Vec3;
  const tgt = a.tgt.map((v, k) => lerp(v, b.tgt[k], p)) as Vec3;
  return { pos, tgt };
};
/** Overrides the kit Rig every frame with the keyframed path (rendered after the Rig, so it wins). */
const CamPath: React.FC = () => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { pos, tgt } = camAt(frame / FPS);
    camera.position.set(...pos);
    camera.up.set(0, 0, -1); // top-down: keep image-top = screen-top, no roll
    (camera as THREE.PerspectiveCamera).fov = FOV;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...tgt);
  });
  return null;
};
/** Project a world point to 1080×1920 px with the same camera (for Callout anchors). */
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 100);
projCam.up.set(0, 0, -1);
const project = (sec: number, p: Vec3): [number, number] => {
  const { pos, tgt } = camAt(sec);
  projCam.position.set(...pos);
  projCam.lookAt(...tgt);
  projCam.updateMatrixWorld();
  projCam.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(projCam);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};

/* ---------------- row face texture (big, readable version of the screenshot row) ---------------- */
const rowTexture = (kind: "received" | "sent", accent: boolean) => {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 266;
  const x = c.getContext("2d")!;
  x.fillStyle = accent ? "#16110c" : "#141518"; x.fillRect(0, 0, 1024, 266);
  // icon disc + arrow
  x.fillStyle = accent ? "#3a2614" : "#2a2b30";
  x.beginPath(); x.arc(108, 133, 62, 0, Math.PI * 2); x.fill();
  x.strokeStyle = accent ? ORANGE : "#bdbdbd"; x.lineWidth = 9; x.lineCap = "round";
  x.beginPath();
  if (kind === "received") { x.moveTo(132, 109); x.lineTo(86, 155); x.moveTo(86, 120); x.lineTo(86, 155); x.lineTo(121, 155); }
  else { x.moveTo(86, 155); x.lineTo(132, 109); x.moveTo(97, 109); x.lineTo(132, 109); x.lineTo(132, 144); }
  x.stroke();
  // label + address
  x.textBaseline = "alphabetic"; x.textAlign = "left";
  x.fillStyle = "#f2f2f0"; x.font = "500 46px 'Inter', 'DejaVu Sans', sans-serif";
  x.fillText(kind === "received" ? "Received" : "Sent", 208, 104);
  x.fillStyle = accent ? "#FFB066" : "#d8d8d8"; x.font = "600 64px 'DejaVu Sans Mono', monospace";
  x.fillText(SHORT, 206, 190);
  // amount
  x.textAlign = "right"; x.fillStyle = "#f2f2f0"; x.font = "700 50px 'Inter', 'DejaVu Sans', sans-serif";
  x.fillText(kind === "received" ? "+0.00" : "−0.25", 990, 118);
  x.fillStyle = "rgba(242,242,240,0.5)"; x.font = "500 34px 'Inter', 'DejaVu Sans', sans-serif";
  x.fillText(kind === "received" ? "just now" : "21 Oct", 990, 176);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** Soft halo (white, tinted by material colour): a blurred rounded rect on transparent canvas. */
let _glow: THREE.CanvasTexture | null = null;
const glowTexture = () => {
  if (_glow) return _glow;
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(256, 128, 10, 256, 128, 250);
  g.addColorStop(0, "rgba(255,255,255,0.55)"); g.addColorStop(0.45, "rgba(255,255,255,0.22)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.setTransform(1, 0, 0, 0.5, 0, 64); // squash the radial into an ellipse
  x.fillStyle = g; x.fillRect(0, -128, 512, 512);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
};

/** A history row lifted out of the screen as a glass slab. p: 0 = lying in the screen, 1 = at `end`. */
const RowSlab: React.FC<{ kind: "received" | "sent"; accent?: boolean; startZ: number; end: Vec3; p: number; tilt: number; glow?: number }> = ({
  kind, accent = false, startZ, end, p, tilt, glow = 0,
}) => {
  const tex = useMemo(() => rowTexture(kind, accent), [kind, accent]);
  const glowTex = useMemo(() => glowTexture(), []);
  const start: Vec3 = [0, GLASS_Y + 0.03, startZ];
  const pos: Vec3 = [lerp(start[0], end[0], p), lerp(start[1], end[1], p), lerp(start[2], end[2], p)];
  const w = lerp(ROW_W, SLAB_W, p), h = lerp(ROW_H, SLAB_H, p);
  return (
    <group position={pos} rotation={[-Math.PI / 2 + tilt, 0, 0]}>
      <RoundedBox args={[w + 0.06, h + 0.06, 0.06]} radius={0.03} smoothness={3} position={[0, 0, -0.035]}>
        <Mat kind={accent ? "accent" : "graphite"} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {accent && glow > 0 && (
        <>
          {/* emissive rim: the one glowing system */}
          <mesh position={[0, 0, -0.07]}>
            <planeGeometry args={[w * 1.5, h * 2.6]} />
            <meshBasicMaterial map={glowTex} color={ORANGE} transparent opacity={0.9 * glow} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight color={ORANGE} intensity={2.2 * glow} distance={2.6} position={[0, 0, -0.5]} />
        </>
      )}
    </group>
  );
};

/** Dark recess left in the screen where a row lifted out (cutaway). */
const Slot: React.FC<{ z: number; p: number }> = ({ z, p }) => (
  <mesh position={[0, GLASS_Y + 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[ROW_W - 0.04, ROW_H - 0.02]} />
    <meshBasicMaterial color="#030303" transparent opacity={0.88 * p} depthWrite={false} />
  </mesh>
);

const Scene: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = props.vo?.words ?? [];
  const at = (i: number, fb: number) => Math.round((w[i]?.start ?? fb) * fps);
  const fSits = at(2, 0.38), fHistory = at(5, 0.92), fBeside = at(6, 1.67), fReal = at(8, 2.25);

  // planted row: already peeling on frame 0, fully up on "history"
  const s1 = spring({ frame: frame - (fSits - 14), fps, config: { damping: 16, stiffness: 70 } });
  const p1 = Math.min(1, 0.12 + 0.88 * s1);
  const glow1 = interpolate(frame, [fHistory - 6, fHistory + 6], [0, 1], clamp);
  // real row: lifts on "beside", settles before "real"
  const p2 = spring({ frame: frame - fBeside, fps, config: { damping: 15, stiffness: 95 } });
  const sec = frame / fps;
  const tilt1 = 0.1 * p1 + Math.sin(sec * 2.1) * 0.025;
  const tilt2 = 0.08 * p2 + Math.sin(sec * 2.1 + 1.3) * 0.02;
  const drift = (ph: number) => Math.sin(sec * 1.7 + ph) * 0.03;

  // callout anchors from the live camera
  const e1: Vec3 = [SLAB1_END[0] - SLAB_W / 2 + 0.15, SLAB1_END[1] + drift(0), SLAB1_END[2] - SLAB_H / 2 - 0.02];
  const e2: Vec3 = [SLAB2_END[0] + SLAB_W / 2 - 0.15, SLAB2_END[1] + drift(2), SLAB2_END[2] - SLAB_H / 2 - 0.02];
  const a1 = project(sec, e1);
  const a2 = project(sec, e2);

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: KEYS[0].pos, to: KEYS[KEYS.length - 1].pos, target: KEYS[0].tgt, fov: FOV }}>
        <CamPath />
        <Phone screen={UI.historyPlanted} position={[0, PHONE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={PHONE_SCALE} />
        <Slot z={ROW1_Z} p={p1} />
        <Slot z={ROW2_Z} p={p2} />
        <group position={[0, drift(0), 0]}>
          <RowSlab kind="received" accent startZ={ROW1_Z} end={SLAB1_END} p={p1} tilt={tilt1} glow={glow1} />
        </group>
        {frame >= fBeside - 1 && (
          <group position={[0, drift(2) * p2, 0]}>
            <RowSlab kind="sent" startZ={ROW2_Z} end={SLAB2_END} p={p2} tilt={tilt2} />
          </group>
        )}
      </Studio3D>
      <Callout text="Lookalike" accent at={a1} label={[a1[0] + 70, a1[1] - 60]} startFrame={fHistory} />
      <Callout text="Real" at={a2} label={[a2[0] - 60, a2[1] - 70]} startFrame={fReal} />
      <Disclaimer text="Magnified illustration · addresses are made up" />
    </Shell>
  );
};

export default Scene;
