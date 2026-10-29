// Scene: 2026-10-29-next S14 — "And it's why paying a saved contact, username or QR code beats pasting."
// Generic "Send to" screen on a 3D phone (no logo / no app name). ONE accent: orange outline on the Sam row.
// A clay fingertip taps on the words: Sam row ("contact"), search field ("username"), QR button ("QR").
// Four camera shots with hard cuts; callouts are pinned to the screen parts by projecting them through
// the same camera the 3D rig uses, so leader lines stay on their part while the camera moves.
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Phone, Callout, Disclaimer, roundedRect, type SceneProps } from "../../kit";
import { UI } from "./_shared";

type Vec3 = [number, number, number];
const FPS = 30;
const W = 1080, H = 1920;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.45, 0, 0.25, 1);

/* ---------- phone placement + screen-pixel → phone-local mapping (screen png is 700×1500 on a 1.4×3.0 glass) ---------- */
const PHONE_POS: Vec3 = [0, 1.62, 0];
const phoneRotY = (f: number) => interpolate(f, [0, 161], [-0.34, -0.12], clamp);
const SZ = 0.074; // glass z (phone local)
const sp = (u: number, v: number, z = SZ): Vec3 => [(u / 700 - 0.5) * 1.4, (0.5 - v / 1500) * 3.0, z];

// parts on the screen (image px)
const ROW_SAM = sp(350, 518);       // Sam row centre
const SEARCH = sp(260, 306);        // "@username" text in the search field
const QR = sp(593, 306);            // QR button
const SAM_TAP = sp(470, 530);
const CONTINUE = sp(350, 1358);

/* ---------- camera shots (hard cuts) ---------- */
type Shot = { a: number; b: number; from: Vec3; to: Vec3; tFrom: Vec3; tTo: Vec3; fov: number };
const SHOTS: Shot[] = [
  // 0.0–1.2 s: 3/4 low, slow push on the whole phone
  { a: 0, b: 36, from: [3.2, 0.9, 10.8], to: [2.6, 1.2, 10.0], tFrom: [0, 1.62, 0], tTo: [0, 1.68, 0], fov: 30 },
  // 1.2–2.1 s: push toward the saved-contact row
  { a: 36, b: 63, from: [1.6, 2.0, 7.6], to: [1.1, 2.25, 6.6], tFrom: [0.05, 2.12, 0], tTo: [0.1, 2.15, 0], fov: 30 },
  // 2.1–3.8 s: higher angle, drifting across the search field from @username to the QR button
  { a: 63, b: 114, from: [-1.6, 4.6, 7.4], to: [-0.5, 4.3, 6.8], tFrom: [-0.15, 2.35, 0], tTo: [0.25, 2.3, 0], fov: 30 },
  // 3.8–5.37 s: slow pull back, near front-on
  { a: 114, b: 161, from: [0.7, 2.2, 9.2], to: [1.6, 1.8, 11.8], tFrom: [0, 1.8, 0], tTo: [0, 1.66, 0], fov: 30 },
];
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
const camAt = (f: number) => {
  const s = SHOTS.find((x) => f >= x.a && f < x.b) ?? SHOTS[SHOTS.length - 1];
  const p = ease(interpolate(f, [s.a, s.b], [0, 1], clamp));
  return { pos: lerp3(s.from, s.to, p), target: lerp3(s.tFrom, s.tTo, p), fov: s.fov };
};

/** Overrides the Studio3D rig every frame (runs after it, so it wins). */
const ShotRig: React.FC = () => {
  const f = useCurrentFrame();
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

/** Project a phone-local point to output pixels with the same camera. */
const project = (f: number, local: Vec3): [number, number] => {
  const c = camAt(f);
  const cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.1, 100);
  cam.position.set(...c.pos);
  cam.lookAt(...c.target);
  cam.updateMatrixWorld(true);
  const o = new THREE.Object3D();
  o.position.set(...PHONE_POS);
  o.rotation.set(0, phoneRotY(f), 0);
  o.updateMatrixWorld(true);
  const v = new THREE.Vector3(...local).applyMatrix4(o.matrixWorld).project(cam);
  return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H];
};

/* ---------- the accent: orange selection outline drawn on the Sam row ---------- */
const RowOutline: React.FC<{ p: number }> = ({ p }) => {
  const geo = useMemo(() => {
    const w = 1.33, h = 0.235, t = 0.016;
    const outer = roundedRect(w, h, 0.05);
    outer.holes.push(new THREE.Path(roundedRect(w - 2 * t, h - 2 * t, 0.05 - t).getPoints(24).reverse()));
    return new THREE.ShapeGeometry(outer, 24);
  }, []);
  if (p <= 0) return null;
  return (
    <group position={[ROW_SAM[0], ROW_SAM[1], SZ + 0.004]} scale={[0.96 + 0.04 * p, 0.9 + 0.1 * p, 1]}>
      <mesh geometry={geo}>
        <meshBasicMaterial color="#FF8000" transparent opacity={p} toneMapped={false} />
      </mesh>
      {/* soft inner wash so the row reads "selected" */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[1.31, 0.215]} />
        <meshBasicMaterial color="#FF8000" transparent opacity={0.07 * p} toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ---------- fingertip (clay): tip at the group origin, finger runs down-right toward the viewer ---------- */
type Key = { f: number; at: Vec3; lift: number };
const FINGER_KEYS: Key[] = [
  { f: 0, at: [2.6, -3.6, 0], lift: 1.8 },
  { f: 14, at: [2.2, -2.9, 0], lift: 1.4 },
  { f: 28, at: [0.9, -0.6, 0], lift: 0.6 },
  { f: 36, at: [SAM_TAP[0], SAM_TAP[1], 0], lift: 0.28 },
  { f: 39, at: [SAM_TAP[0], SAM_TAP[1], 0], lift: 0.0 },   // tap "contact" (click sfx 1.3 s)
  { f: 46, at: [SAM_TAP[0] + 0.05, SAM_TAP[1] - 0.05, 0], lift: 0.3 },
  { f: 58, at: [SEARCH[0] + 0.05, SEARCH[1] - 0.12, 0], lift: 0.3 },
  { f: 66, at: [SEARCH[0], SEARCH[1], 0], lift: 0.0 },      // tap "username" (tick 2.2 s)
  { f: 72, at: [SEARCH[0] + 0.1, SEARCH[1] - 0.05, 0], lift: 0.32 },
  { f: 86, at: [QR[0] - 0.02, QR[1] - 0.06, 0], lift: 0.3 },
  { f: 92, at: [QR[0], QR[1], 0], lift: 0.0 },              // tap "QR" (tick 3.1 s)
  { f: 100, at: [QR[0] + 0.05, QR[1] - 0.15, 0], lift: 0.4 },
  { f: 124, at: [1.4, -1.9, 0], lift: 1.0 },
  { f: 161, at: [2.2, -3.2, 0], lift: 1.4 },
];
const fingerAt = (f: number) => {
  let i = 0;
  while (i < FINGER_KEYS.length - 2 && f > FINGER_KEYS[i + 1].f) i++;
  const k0 = FINGER_KEYS[i], k1 = FINGER_KEYS[i + 1];
  const p = ease(interpolate(f, [k0.f, k1.f], [0, 1], clamp));
  const at = lerp3(k0.at, k1.at, p);
  const lift = k0.lift + (k1.lift - k0.lift) * p;
  return { pos: [at[0], at[1], SZ + 0.012 + lift] as Vec3 };
};
const Fingertip: React.FC<{ f: number }> = ({ f }) => {
  const { pos } = fingerAt(f);
  return (
    <group position={pos} rotation={[-0.9, 0, 0.62]}>
      {/* a plain matte clay finger: one capsule, tip at the origin */}
      <mesh position={[0, -0.56, 0]}>
        <capsuleGeometry args={[0.095, 0.95, 10, 24]} />
        <meshStandardMaterial color="#8f8a84" roughness={0.62} metalness={0.05} />
      </mesh>
    </group>
  );
};

/* ---------- scene ---------- */
const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const words = props.vo?.words ?? [];
  const at = (txt: string, fallback: number) => Math.round((words.find((w) => w.text.toLowerCase().replace(/[^a-z]/g, "") === txt)?.start ?? fallback) * FPS);
  const fContact = at("contact", 1.3), fUser = at("username", 2.19), fQR = at("qr", 3.05), fPaste = at("pasting", 4.09);
  const outline = ease(interpolate(f, [fContact, fContact + 8], [0, 1], clamp));

  // callout anchors follow the parts on screen
  const pSam = project(f, sp(600, 572));
  const top = project(f, sp(60, 0))[1]; // phone screen top edge (px)
  const pUser = project(f, SEARCH);
  const pQR = project(f, QR);
  const pPaste = project(f, sp(120, 306));
  void CONTINUE;

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: SHOTS[0].from, to: SHOTS[0].to, target: SHOTS[0].tFrom, fov: 30 }}>
        <ShotRig />
        <group position={PHONE_POS} rotation={[0, phoneRotY(f), 0]}>
          <Phone screen={UI.contacts} position={[0, 0, 0]} rotation={[0, 0, 0]} />
          <RowOutline p={outline} />
          <Fingertip f={f} />
        </group>
      </Studio3D>

      {/* callouts on their words; each lives until the next shot replaces it */}
      {f >= fContact && f < 63 && (
        <Callout text="Saved contact" accent at={pSam} label={[Math.min(pSam[0], 800), pSam[1] + 230]} startFrame={fContact} />
      )}
      {f >= fUser && f < 114 && (
        <Callout text="@username" at={pUser} label={[Math.max(pUser[0] - 40, 230), Math.max(top - 40, 440)]} startFrame={fUser} />
      )}
      {f >= fQR && f < 114 && (
        <Callout text="QR" at={pQR} label={[Math.min(pQR[0] + 20, 880), Math.max(top - 40, 440)]} startFrame={fQR} />
      )}
      {f >= fPaste && (
        <Callout text="Nothing to paste" at={pPaste} label={[Math.max(pPaste[0] + 40, 300), Math.max(top - 40, 440)]} startFrame={fPaste} />
      )}
      <Disclaimer text="Illustration · generic wallet screen" />
    </Shell>
  );
};

export default Scene;
