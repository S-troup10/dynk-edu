// Scene: 2026-10-29-next S06 — MECHANISM (number): the +0.00 transfer.
// A glowing "+0.00 ETH" row slab flies in from the left and drops into the top of the phone's history list
// on "zero" (2.37 s). The list slides down to make room; on landing the screen becomes ui_history_planted.
// One accent system: the incoming row (orange rim + halo + spill light), settling to a soft orange edge.
import React, { useLayoutEffect, useMemo } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Phone, Callout, Disclaimer, asset, type SceneProps } from "../../kit";
import { UI } from "./_shared";

type Vec3 = [number, number, number];
const S = 30;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.45, 0, 0.25, 1);

/* ---------- phone placement + screen geometry (image is 700×1500 on a 1.4×3.0 glass) ---------- */
const PHONE_POS: Vec3 = [0, 1.65, 0];
const PHONE_ROT: Vec3 = [0, -0.22, 0];
const IMG_H = 1500, IMG_W = 700, GLASS_W = 1.4, GLASS_H = 3.0;
const pxY = (y: number) => GLASS_H / 2 - (y / IMG_H) * GLASS_H; // image px → local y
const pxX = (x: number) => (x / IMG_W - 0.5) * GLASS_W;
const ROW_TOP = 237, ROW_PX = 125;
const ROW_H = (ROW_PX / IMG_H) * GLASS_H; // 0.25
const ROW1_Y = pxY(ROW_TOP + ROW_PX / 2);  // 0.901
const Z_GLASS = 0.074;

const phoneMatrix = new THREE.Matrix4().compose(
  new THREE.Vector3(...PHONE_POS), new THREE.Quaternion().setFromEuler(new THREE.Euler(...PHONE_ROT)), new THREE.Vector3(1, 1, 1));
const toWorld = (v: Vec3) => new THREE.Vector3(...v).applyMatrix4(phoneMatrix);

/* ---------- timing (from VO words) ---------- */
const word = (props: SceneProps, w: string) => props.vo?.words?.find((x) => x.text.toLowerCase().replace(/[^a-z]/g, "") === w);

/* ---------- the incoming row's flight path (phone-local) ---------- */
const PATH = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-6.5, 2.6, 2.8),
  new THREE.Vector3(-3.2, 2.3, 2.4),
  new THREE.Vector3(-0.9, 1.1, 1.3),
  new THREE.Vector3(0, ROW1_Y, Z_GLASS + 0.012),
);

type Cam = { pos: THREE.Vector3; target: THREE.Vector3; fov: number };
const lerpV = (a: Vec3, b: Vec3, t: number) => new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);

/* ---------- camera: hard cuts between three angles, each always moving ---------- */
const makeCam = (f: number, launch: number, land: number): Cam => {
  const seg = (a: number, b: number) => ease(interpolate(f, [a, b], [0, 1], clamp));
  if (f < 36) {
    // A: low macro angle on the list, slow rise + push
    const t = seg(0, 36);
    return { pos: lerpV([1.7, 1.05, 8.4], [1.25, 1.35, 7.5], t), target: lerpV([0.05, 2.15, 0], [0, 2.3, 0], t), fov: 30 };
  }
  if (f < land + 1) {
    // B: follow the incoming row in from the left
    const t = seg(36, land + 1);
    const p = inOut(interpolate(f, [launch, land], [0, 1], clamp));
    const slab = toWorld(PATH.getPoint(p).toArray() as Vec3);
    const row = toWorld([0, ROW1_Y, Z_GLASS]);
    const target = slab.clone().lerp(row, 0.35 + 0.65 * t);
    return { pos: lerpV([-2.9, 2.75, 7.4], [-0.9, 2.55, 6.3], t), target, fov: 30 };
  }
  if (f < 100) {
    // C1: settle on the list as it lands, low and close
    const t = seg(land + 1, 100);
    return { pos: lerpV([1.0, 1.75, 6.3], [0.7, 1.95, 5.8], t), target: lerpV([0.1, 2.3, 0], [0.05, 2.38, 0], t), fov: 30 };
  }
  // C2: over-the-shoulder push onto the row's sender address ("from the lookalike")
  const t = seg(100, 150);
  return { pos: lerpV([-0.75, 2.95, 6.7], [-0.5, 2.85, 6.1], t), target: lerpV([0.0, 2.25, 0], [-0.02, 2.3, 0], t), fov: 30 };
};

const projCam = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.1, 200);
const project = (cam: Cam, local: Vec3): [number, number] => {
  projCam.fov = cam.fov; projCam.position.copy(cam.pos); projCam.lookAt(cam.target);
  projCam.updateProjectionMatrix(); projCam.updateMatrixWorld();
  const v = toWorld(local).project(projCam);
  return [(v.x + 1) * 540, (1 - v.y) * 960];
};

/** Overrides the Studio3D rig every frame (runs after it, as a later sibling). */
const CamRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(cam.pos); c.fov = cam.fov; c.updateProjectionMatrix(); c.lookAt(cam.target);
  });
  return null;
};

/* ---------- radial halo texture for the glow (no bloom in the pipeline) ---------- */
let haloTex: THREE.CanvasTexture | null = null;
const halo = () => {
  if (haloTex) return haloTex;
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,128,0,0.85)"); g.addColorStop(0.35, "rgba(255,110,0,0.35)"); g.addColorStop(1, "rgba(255,90,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  haloTex = new THREE.CanvasTexture(c); haloTex.colorSpace = THREE.SRGBColorSpace;
  return haloTex;
};

/** Crop of an image texture: image-px rows [y0, y1) of the full width. */
const useCrop = (tex: THREE.Texture, y0: number, y1: number) =>
  useMemo(() => {
    const t = tex.clone();
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    t.repeat.set(1, (y1 - y0) / IMG_H); t.offset.set(0, 1 - y1 / IMG_H);
    t.needsUpdate = true;
    return t;
  }, [tex, y0, y1]);

/* ---------- the screen: ui_history whose list slides down a row, then ui_history_planted ---------- */
const Screen: React.FC<{ shift: number; planted: boolean }> = ({ shift, planted }) => {
  const [hist, plant] = useTexture([asset(UI.history), asset(UI.historyPlanted)]);
  const listEnd = 1300;                             // list content ends ~y 860; crop short so the shifted list stays clear of the glass corners
  const list = useCrop(hist, ROW_TOP, listEnd);
  const full = useCrop(plant, 0, IMG_H);
  const listH = ((listEnd - ROW_TOP) / IMG_H) * GLASS_H;
  const listY = pxY(ROW_TOP) - listH / 2 - shift * ROW_H;
  return (
    <group>
      {planted ? (
        <mesh position={[0, 0, Z_GLASS + 0.002]}>
          <planeGeometry args={[GLASS_W, GLASS_H]} />
          <meshBasicMaterial map={full} toneMapped={false} />
        </mesh>
      ) : (
        <>
          {/* list region backdrop (hides the base screen while the list moves) */}
          <mesh position={[0, (pxY(ROW_TOP) + pxY(1425)) / 2, Z_GLASS + 0.002]}>
            <planeGeometry args={[GLASS_W, pxY(ROW_TOP) - pxY(1425)]} />
            <meshBasicMaterial color="#0b0c0e" toneMapped={false} />
          </mesh>
          <mesh position={[0, listY, Z_GLASS + 0.004]}>
            <planeGeometry args={[GLASS_W, listH]} />
            <meshBasicMaterial map={list} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
};

/* ---------- the incoming row slab: real row crop on an orange-rimmed slab ---------- */
const RowSlab: React.FC<{ pos: Vec3; rot: Vec3; glow: number; scale: number }> = ({ pos, rot, glow, scale }) => {
  const [plant] = useTexture([asset(UI.historyPlanted)]);
  const face = useCrop(plant, ROW_TOP + 1, ROW_TOP + ROW_PX);
  const hal = useMemo(() => halo(), []);
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <RoundedBox args={[GLASS_W + 0.05, ROW_H + 0.05, 0.03]} radius={0.02} smoothness={3} position={[0, 0, -0.012]}>
        <meshStandardMaterial color="#FF8000" metalness={0.4} roughness={0.3} emissive="#FF5A00" emissiveIntensity={0.15 + 0.45 * glow} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0045]}>
        <planeGeometry args={[GLASS_W - 0.01, ROW_H - 0.012]} />
        <meshBasicMaterial map={face} toneMapped={false} />
      </mesh>
      {/* halo behind the slab */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[GLASS_W * 2.0, ROW_H * 5]} />
        <meshBasicMaterial map={hal} transparent opacity={0.9 * glow} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight color="#FF8000" intensity={4 * glow} distance={2.2} position={[0, 0, 0.35]} />
    </group>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zero = word(props, "zero")?.start ?? 2.37;
  const look = word(props, "lookalike")?.start ?? 3.37;
  const sends = word(props, "sends")?.start ?? 0.31;
  const LAND = Math.round(zero * S);       // 71
  const LAUNCH = Math.round(sends * S);    // 9

  // flight
  const p = inOut(interpolate(f, [LAUNCH, LAND], [0, 1], clamp));
  const lp = PATH.getPoint(p);
  const k = 1 - p;
  const bump = f >= LAND ? 1 + 0.06 * Math.exp(-(f - LAND) / 3) * Math.cos((f - LAND) / 1.6) : 1;
  const slabRot: Vec3 = [-0.35 * k, 0.75 * k, 0.22 * k];
  // glow: full while travelling and ~1 s after landing, then a soft orange edge
  const glow = f < LAND + 30 ? 1 : interpolate(f, [LAND + 30, LAND + 48], [1, 0.12], clamp);
  // the list slides down one row to make room as the slab arrives
  const shift = ease(interpolate(f, [LAND - 12, LAND], [0, 1], clamp));
  const planted = f >= LAND + 1;

  const cam = makeCam(f, LAUNCH, LAND);

  // callout anchors (phone-local) → screen px
  const amountPt = project(cam, [pxX(583), pxY(284), Z_GLASS + 0.02]);
  const addrPt = project(cam, [pxX(150), pxY(320), Z_GLASS + 0.02]);

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: [1.7, 1.05, 8.4], to: [1.25, 1.35, 7.5], target: [0, 2.2, 0], fov: 30 }}>
        <group position={PHONE_POS} rotation={PHONE_ROT}>
          <Phone screen={UI.history} position={[0, 0, 0]} rotation={[0, 0, 0]} />
          <Screen shift={shift} planted={planted} />
          {f >= LAUNCH && (
            <RowSlab pos={[lp.x, lp.y, lp.z]} rot={slabRot} glow={glow} scale={bump} />
          )}
        </group>
        <CamRig cam={cam} />
      </Studio3D>

      {f >= LAND + 2 && (
        <Callout text="0.00 received" accent startFrame={Math.round(2.45 * fps)}
          at={amountPt} label={[770, 440]} size={26} />
      )}
      {f >= Math.round(look * fps) && (
        <Callout text="from lookalike" startFrame={Math.round(look * fps)}
          at={addrPt} label={[310, 440]} size={26} />
      )}
      <Disclaimer text="Magnified illustration · addresses are made up" />
    </Shell>
  );
};

export default Scene;
