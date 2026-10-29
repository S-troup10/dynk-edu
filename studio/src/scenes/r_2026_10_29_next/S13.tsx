// Scene: 2026-10-29-next S13 — "AND IT'S WHY #2: the three dots hide exactly what's different"
// Shortened address as tiles (0x7A3f · … · 9c2E). On "dots" the … tile splits open like a cutaway and shows the
// 32 hidden characters packed inside it as thin orange slices (an accordion). On "hide" the accordion unfolds:
// the 32 FAKE middle tiles fan out into four rows of 8 between "0x7A3f" (top row) and "9c2E" (bottom row),
// in a slight arc toward camera. Orange = the hidden middle (the ONE glowing system). Ends stay white.
import React, { useLayoutEffect, useMemo } from "react";
import { Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, Mat, glyphTexture, type SceneProps } from "../../kit";
import { Tile, FAKE } from "./_shared";

type Vec3 = [number, number, number];
const FPS = 30;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const prog = (f: number, a: number, b: number, e = ease) => e(interpolate(f, [a, b], [0, 1], cl));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

const SC = 0.85;          // whole subject scale (keeps the unfolded block inside the 9:16 safe zone)
const GAP = 0.46;         // tile pitch
const ROW = 0.6;          // row pitch in the unfolded block
const Y0 = 0.25;          // tile centre height when standing on the floor
const LEFT = "0x7A3f";
const RIGHT = "9c2E";
const MID = FAKE.slice(6, 38); // the 32 characters the dots hide (made-up lookalike address)

/* ---------- camera: hard cut at 1.5 s, pull back on "hide", slow drift to the end ---------- */
type Cam = { pos: Vec3; target: Vec3; fov: number };
const camAt = (f: number, tDots: number, tHide: number): Cam => {
  const fov = 30;
  if (f < 45) {
    const p = prog(f, 0, 45, inOut);
    // macro on the "…" tile, low and close, creeping in
    return { pos: lerp3([0.24, 0.58, 2.9], [0.04, 0.47, 2.25], p), target: [0, 0.2, 0], fov };
  }
  if (f < tHide) {
    const p = prog(f, 45, tHide, inOut);
    // higher 3/4 as it opens
    return { pos: lerp3([1.45, 1.5, 3.2], [1.05, 1.62, 2.7], p), target: lerp3([0, 0.2, 0], [0, 0.22, 0], p), fov };
  }
  if (f < 116) {
    const p = prog(f, tHide, 116, inOut);
    return { pos: lerp3([1.05, 1.62, 2.7], [0.55, 2.05, 13.9], p), target: lerp3([0, 0.22, 0], [0.1, 1.5, 0], p), fov };
  }
  const p = prog(f, 116, 160, (x) => x);
  return { pos: lerp3([0.55, 2.05, 13.9], [-0.45, 1.85, 13.3], p), target: [0.1, 1.5, 0], fov };
};

const CamRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    (camera as THREE.PerspectiveCamera).fov = cam.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...cam.target);
  });
  return null;
};

const projCam = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.1, 100);
const project = (cam: Cam, p: Vec3): [number, number] => {
  projCam.fov = cam.fov;
  projCam.position.set(...cam.pos);
  projCam.lookAt(...cam.target);
  projCam.updateProjectionMatrix();
  projCam.updateMatrixWorld();
  const v = new THREE.Vector3(p[0] * SC, p[1] * SC, p[2] * SC).project(projCam);
  return [(v.x + 1) / 2 * 1080, (1 - v.y) / 2 * 1920];
};
const clampPx = ([x, y]: [number, number]): [number, number] => [Math.min(1000, Math.max(80, x)), Math.min(1480, Math.max(400, y))];

/* ---------- the "…" tile, built as two halves that split open ---------- */
const HalfTile: React.FC<{ side: -1 | 1; position: Vec3; rotY: number; scale: number }> = ({ side, position, rotY, scale }) => {
  const tex = useMemo(() => {
    const base = glyphTexture("…", { font: "600 300px 'DejaVu Sans Mono', monospace", w: 256, h: 320, fg: "#f1f1f1", bg: "#1b1c1f" });
    const t = base.clone();
    t.repeat.set(0.5, 1);
    t.offset.set(side < 0 ? 0 : 0.5, 0);
    t.needsUpdate = true;
    return t;
  }, [side]);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={Math.max(0.0001, scale)}>
      {/* hinge sits on the outer edge so the half swings open like a door */}
      <group position={[side * 0.1, 0, 0]}>
        <RoundedBox args={[0.19, 0.5, 0.08]} radius={0.035} smoothness={2}>
          <Mat kind="graphite" />
        </RoundedBox>
        <mesh position={[side * 0.0, 0, 0.041]}>
          <planeGeometry args={[0.17, 0.44]} />
          <meshStandardMaterial map={tex} metalness={0.2} roughness={0.35} />
        </mesh>
        {/* cut face: bright orange inner edge where the tile was sliced */}
        <mesh position={[-side * 0.096, 0, 0]} rotation={[0, side * -Math.PI / 2, 0]}>
          <planeGeometry args={[0.07, 0.46]} />
          <meshStandardMaterial color="#FF8000" emissive="#FF6A00" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const w = props.vo?.words ?? [];
  const at = (txt: string, fallback: number) => Math.round((w.find((x) => x.text.toLowerCase().replace(/[^a-z]/g, "") === txt)?.start ?? fallback) * FPS);
  const tDots = at("dots", 0.944);          // 28
  const tShort = at("shortened", 1.556);    // 47
  const tHide = at("hide", 2.691);          // 81
  const cam = camAt(f, tDots, tHide);

  // split of the "…" tile
  const open = prog(f, tDots, tDots + 14);
  const gone = prog(f, tHide, tHide + 12);
  const halfX = 0.1 + 0.2 * open + 0.35 * gone;   // hinge offset from centre

  // ends: left group rises to the top row, right group drops into the bottom row
  const qL = prog(f, tHide, tHide + 24, inOut);
  const qR = prog(f, tHide + 14, tHide + 40, inOut);

  const midTiles = MID.split("").map((ch, k) => {
    const r = Math.floor(k / 8), c = k % 8;
    const final: Vec3 = [(c - 3.5) * GAP, Y0 + (4 - r) * ROW, 0.45 * (1 - ((c - 3.5) / 3.5) ** 2)];
    const packed: Vec3 = [(k - 15.5) * 0.0105 * open, Y0, 0];
    const p = prog(f, tHide + 2 + k * 0.9, tHide + 19 + k * 0.9);
    const pos = lerp3(packed, final, p);
    pos[2] += Math.sin(p * Math.PI) * 0.7;           // swings toward camera as it unfolds
    const sx = lerp(0.025, 1, p), syz = lerp(0.88, 1, p);
    const bob = p >= 1 ? Math.sin((f + k * 5) / 18) * 0.015 : 0;
    return (
      <group key={k} position={[pos[0], pos[1] + bob, pos[2]]} rotation={[0, (1 - p) * 0.9, 0]} scale={[sx, syz, syz]}>
        <Tile ch={ch} glow />
      </group>
    );
  });

  // callout anchors (tracked through the camera move)
  const shortAnchor = project(cam, [0, Y0 + 0.27, 0.04]);
  const k0 = (() => {
    const p = prog(f, tHide + 2, tHide + 19);
    const fin: Vec3 = [-3.5 * GAP - 0.2, Y0 + 4 * ROW, 0];
    return lerp3([0, Y0, 0], fin, p);
  })();
  const hiddenAnchor = clampPx(project(cam, k0));

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: [0.55, 2.05, 13.9], to: [0.55, 2.05, 13.9], target: [0.1, 1.5, 0], fov: 30 }}>
        <CamRig cam={cam} />
        <group scale={SC} rotation={[0, Math.sin(f / 60) * 0.03, 0]}>
          {/* 0x7A3f */}
          {LEFT.split("").map((ch, j) => {
            const a: Vec3 = [(j - 6) * GAP, Y0, 0], b: Vec3 = [(j - 2.5) * GAP, Y0 + 5 * ROW, 0];
            const p = lerp3(a, b, qL);
            p[2] += Math.sin(qL * Math.PI) * 0.4;
            return <Tile key={`l${j}`} ch={ch} position={p} />;
          })}
          {/* 9c2E */}
          {RIGHT.split("").map((ch, j) => {
            const a: Vec3 = [(j + 1) * GAP, Y0, 0], b: Vec3 = [(j - 1.5) * GAP, Y0, 0];
            const p = lerp3(a, b, qR);
            p[2] -= Math.sin(qR * Math.PI) * 0.7;           // passes behind the unfolding tiles
            return <Tile key={`r${j}`} ch={ch} position={p} />;
          })}
          {/* the "…" tile, splitting */}
          {gone < 1 && (
            <>
              <HalfTile side={-1} position={[-halfX + 0.1, Y0, 0]} rotY={-0.55 * open} scale={1 - gone} />
              <HalfTile side={1} position={[halfX - 0.1, Y0, 0]} rotY={0.55 * open} scale={1 - gone} />
            </>
          )}
          {/* the hidden middle: packed inside the dots, then unfolding */}
          {f >= tDots && midTiles}
        </group>
      </Studio3D>

      <Sequence from={tShort} durationInFrames={tHide - tShort}>
        <Callout text="SHORTENED" at={shortAnchor} label={[300, 700]} />
      </Sequence>
      <Sequence from={tHide + 7}>
        <Callout text="HIDDEN" accent at={hiddenAnchor} label={[205, 470]} />
      </Sequence>
      <Disclaimer text="Magnified illustration · addresses are made up" />
    </Shell>
  );
};

export default Scene;
