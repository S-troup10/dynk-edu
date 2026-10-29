// DYNK v2 3D kit: the "monochrome studio" look (modelled on @0x100x).
// Greyscale chrome / clay / graphite objects on a seamless backdrop that fades into fog,
// soft top light, contact shadows, ONE orange accent per shot.
// Everything is procedural and local: no HDR downloads, no 3D text fonts from a CDN.
//
// Usage (inside a scene):
//   <Studio3D tone="dark" camera={{ from: [0, 2, 9], to: [0, 1.6, 7], target: [0, 0.8, 0] }}>
//     <CoinStack count={8} accentTop />
//   </Studio3D>
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing, staticFile, delayRender, continueRender } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import tokens from "../../../brand/tokens.json";

const V2 = tokens.v2;
export type Tone = "dark" | "light";
export type MatName = keyof typeof V2.materials;
type Vec3 = [number, number, number];

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/* ---------- materials ---------- */
export const Mat: React.FC<{ kind?: MatName; color?: string; opacity?: number }> = ({ kind = "chrome", color, opacity }) => {
  const m = V2.materials[kind] as { color: string; metalness: number; roughness: number; emissive?: string; emissiveIntensity?: number };
  return (
    <meshStandardMaterial
      color={color ?? m.color}
      metalness={m.metalness}
      roughness={m.roughness}
      emissive={m.emissive ?? "#000000"}
      emissiveIntensity={m.emissiveIntensity ?? 0}
      transparent={opacity !== undefined && opacity < 1}
      opacity={opacity ?? 1}
      envMapIntensity={1}
    />
  );
};

/* ---------- glyph textures (for "$", "D", labels on objects) ---------- */
const texCache = new Map<string, THREE.CanvasTexture>();
export const glyphTexture = (text: string, opts: { font?: string; fg?: string; bg?: string; size?: number; w?: number; h?: number } = {}) => {
  const { font = "700 360px Outfit, sans-serif", fg = "#ffffff", bg = "#000000", w = 512, h = 512 } = opts;
  const key = [text, font, fg, bg, w, h].join("|");
  if (texCache.has(key)) return texCache.get(key)!;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const x = c.getContext("2d")!;
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle"; x.font = font;
  x.fillText(text, w / 2, h / 2 + h * 0.03);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(key, t);
  return t;
};

/* ---------- camera rig: slow documentary push from `from` to `to`, always looking at target ---------- */
export type CameraMove = { from: Vec3; to?: Vec3; target?: Vec3; fov?: number; startFrame?: number; durationFrames?: number };
const Rig: React.FC<{ move: CameraMove }> = ({ move }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { camera } = useThree();
  const { from, to = from, target = [0, 0.6, 0], fov = 28, startFrame = 0, durationFrames = durationInFrames } = move;
  const p = ease(interpolate(frame - startFrame, [0, durationFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  useLayoutEffect(() => {
    camera.position.set(from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p, from[2] + (to[2] - from[2]) * p);
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
};

/* ---------- renderer setup ---------- */
const GL: React.FC = () => {
  const { gl } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);
  return null;
};

/* ---------- Studio3D: the stage every 3D shot sits on ---------- */
export const Studio3D: React.FC<{
  tone?: Tone;
  camera?: CameraMove;
  floor?: boolean;
  shadows?: boolean;
  /** extra soft light from the side in DYNK orange (use on the accent shot only) */
  accentRim?: boolean;
  children: React.ReactNode;
}> = ({ tone = "dark", camera = { from: [0, 2.2, 10], to: [0, 1.9, 8.6], target: [0, 0.8, 0] }, floor = true, shadows = true, accentRim = false, children }) => {
  const { width, height } = useVideoConfig();
  const t = V2.tones[tone];
  const dark = tone === "dark";
  const camDist = Math.hypot(camera.from[0] - (camera.target?.[0] ?? 0), camera.from[1] - (camera.target?.[1] ?? 0.6), camera.from[2] - (camera.target?.[2] ?? 0));
  return (
    <AbsoluteFill style={{ backgroundColor: t.bg }}>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: camera.fov ?? 28, position: camera.from }}>
        <GL />
        <Rig move={camera} />
        <fog attach="fog" args={[t.bg, camDist + 3, camDist + 16]} />
        <color attach="background" args={[t.bg]} />
        {/* local studio environment: one big softbox overhead, two strip lights, a floor bounce */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={dark ? 3.2 : 1.6} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
          <Lightformer form="rect" intensity={dark ? 0.9 : 0.6} position={[0, 2, 8]} scale={[12, 3, 1]} />
          <Lightformer form="rect" intensity={dark ? 3 : 2} position={[-6, 2, 1]} rotation-y={Math.PI / 2} scale={[2, 8, 1]} />
          <Lightformer form="rect" intensity={dark ? 1.4 : 1.2} position={[6, 2, -1]} rotation-y={-Math.PI / 2} scale={[2, 8, 1]} />
          <Lightformer form="ring" intensity={dark ? 0.6 : 0.4} position={[0, -3, 4]} scale={4} />
          {accentRim && <Lightformer form="rect" color="#FF8000" intensity={2.4} position={[5, 1, 3]} rotation-y={-Math.PI / 3} scale={[2, 6, 1]} />}
        </Environment>
        <ambientLight intensity={dark ? 0.15 : 0.35} />
        <directionalLight position={[2, 9, 4]} intensity={dark ? 1.4 : 1.1} />
        {floor && (
          <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
            <planeGeometry args={[80, 80]} />
            <meshStandardMaterial color={t.floor} metalness={dark ? 0.35 : 0.05} roughness={dark ? 0.4 : 0.6} />
          </mesh>
        )}
        {shadows && <ContactShadows position={[0, 0.005, 0]} opacity={dark ? 0.85 : 0.45} scale={14} blur={2.6} far={4} resolution={1024} color="#000000" frames={Infinity} />}
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/* ---------- motion helpers for objects ---------- */
/** Springs an object up into place (from below + slightly scaled), then lets it drift. */
export const Enter: React.FC<{ at?: number; from?: Vec3; spin?: number; float?: number; position?: Vec3; rotation?: Vec3; scale?: number; children: React.ReactNode }> = ({
  at = 0, from = [0, -0.6, 0], spin = 0, float = 0.04, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 120 } });
  const bob = Math.sin((frame - at) / 28) * float;
  return (
    <group
      position={[position[0] + from[0] * (1 - s), position[1] + from[1] * (1 - s) + bob * s, position[2] + from[2] * (1 - s)]}
      rotation={[rotation[0], rotation[1] + spin * (1 - s) + (frame - at) * 0.002, rotation[2]]}
      scale={Math.max(0.0001, scale * (0.85 + 0.15 * s)) * (s > 0.01 ? 1 : 0.0001)}
    >
      {children}
    </group>
  );
};

/* ================================ OBJECT LIBRARY ================================ */
// All objects sit on the floor at y=0 unless noted. Size ~1–2 units. Pass `accent` to paint
// the one thing the viewer should look at in DYNK orange.

/** Coin with bevelled rim and an embossed glyph on the face (default "$"). */
export const Coin: React.FC<{ glyph?: string; accent?: boolean; radius?: number; position?: Vec3; rotation?: Vec3; mat?: MatName }> = ({
  glyph = "$", accent = false, radius = 1, position = [0, 0.09, 0], rotation = [0, 0, 0], mat = "chrome",
}) => {
  const profile = useMemo(() => {
    const r = radius, h = 0.09;
    return [new THREE.Vector2(0, -h), new THREE.Vector2(r * 0.97, -h), new THREE.Vector2(r, -h * 0.6), new THREE.Vector2(r, h * 0.6), new THREE.Vector2(r * 0.97, h),
      new THREE.Vector2(r * 0.86, h), new THREE.Vector2(r * 0.84, h * 0.7), new THREE.Vector2(0, h * 0.7)];
  }, [radius]);
  const bump = useMemo(() => glyphTexture(glyph), [glyph]);
  const k = accent ? "accent" : mat;
  const m = V2.materials[k] as { color: string; metalness: number; roughness: number };
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <latheGeometry args={[profile, 96]} />
        <Mat kind={k} />
      </mesh>
      {/* face with embossed glyph (bump + roughness map so it reads in chrome) */}
      <mesh position={[0, 0.0635, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[radius * 0.84, 96]} />
        <meshStandardMaterial color={m.color} metalness={m.metalness} roughness={m.roughness} bumpMap={bump} bumpScale={6} roughnessMap={bump} />
      </mesh>
    </group>
  );
};

/** Stack of coins, slightly irregular like a real stack. */
export const CoinStack: React.FC<{ count?: number; accentTop?: boolean; radius?: number; position?: Vec3; glyph?: string; growAt?: number; mat?: MatName }> = ({
  count = 8, accentTop = false, radius = 1, position = [0, 0, 0], glyph = "$", growAt, mat = "chrome",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => {
        const s = growAt === undefined ? 1 : spring({ frame: frame - growAt - i * 3, fps, config: { damping: 14, stiffness: 160 } });
        const jitter = [Math.sin(i * 7.3) * 0.04, 0, Math.cos(i * 3.1) * 0.04] as const;
        return s > 0.01 ? (
          <Coin key={i} glyph={glyph} radius={radius} mat={mat} accent={accentTop && i === count - 1}
            position={[jitter[0], 0.09 + i * 0.185 + (1 - s) * 1.2, jitter[2]]} rotation={[0, i * 0.7, 0]} />
        ) : null;
      })}
    </group>
  );
};

/** Chrome sphere token with a glyph (the 0x100x "$ ball"). */
export const TokenSphere: React.FC<{ glyph?: string; accent?: boolean; radius?: number; position?: Vec3 }> = ({ glyph = "$", accent = false, radius = 1, position = [0, 1.1, 0] }) => {
  const tex = useMemo(() => glyphTexture(glyph, { fg: "#ffffff", bg: "#202020", font: "600 300px Outfit, sans-serif", w: 1024, h: 512 }), [glyph]);
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius, 96, 64]} />
        <meshStandardMaterial color={accent ? "#FF8000" : "#1a1a1a"} metalness={0.9} roughness={0.18} map={accent ? undefined : tex} />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[radius * 1.02, 0.025, 16, 128]} />
        <Mat kind="chrome" />
      </mesh>
    </group>
  );
};

/** Phone slab. Pass `screen` (a staticFile URL to an app screenshot) to show the DYNK app. */
export const Phone: React.FC<{ screen?: string; position?: Vec3; rotation?: Vec3; scale?: number; accentEdge?: boolean }> = ({
  screen, position = [0, 1.6, 0], rotation = [0, -0.25, 0], scale = 1, accentEdge = false,
}) => {
  // Body = extruded rounded rectangle (front face at z = +0.07); screen = rounded shape just in front of it.
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(1.5, 3.1, 0.2), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4, curveSegments: 16 });
    g.translate(0, 0, -0.05);
    return g;
  }, []);
  const glass = useMemo(() => shapeWithUV(roundedRect(1.4, 3.0, 0.15)), []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={body}>
        <Mat kind={accentEdge ? "accent" : "graphite"} />
      </mesh>
      <mesh geometry={glass} position={[0, 0, 0.074]}>
        {screen ? <ScreenMaterial src={screen} /> : <meshStandardMaterial color="#0d0d0d" metalness={0.2} roughness={0.15} />}
      </mesh>
    </group>
  );
};

/** Texture material for a screen. useTexture suspends; Remotion's ThreeCanvas waits for it before capturing. */
const ScreenMaterial: React.FC<{ src: string }> = ({ src }) => {
  const url = /^(https?:|data:|\/)/.test(src) ? src : staticFile(src);
  const tex = useTexture(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return <meshBasicMaterial map={tex} toneMapped={false} />;
};

/** Rounded rectangle shape centred on the origin. */
export function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
/** ShapeGeometry with UVs normalised to 0..1 so a texture fills it. */
export function shapeWithUV(shape: THREE.Shape) {
  const g = new THREE.ShapeGeometry(shape, 16);
  g.computeBoundingBox();
  const b = g.boundingBox!, pos = g.attributes.position, uv = [] as number[];
  for (let i = 0; i < pos.count; i++) uv.push((pos.getX(i) - b.min.x) / (b.max.x - b.min.x), (pos.getY(i) - b.min.y) / (b.max.y - b.min.y));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

/** Card slab: bank card / hardware card / ID. `label` prints small text on it. */
export const Card: React.FC<{ label?: string; accent?: boolean; position?: Vec3; rotation?: Vec3; mat?: MatName }> = ({
  label, accent = false, position = [0, 1, 0], rotation = [-0.2, 0.3, 0], mat = "graphite",
}) => {
  const tex = useMemo(() => (label ? glyphTexture(label, { font: "700 230px Outfit, sans-serif", w: 1024, h: 640, fg: accent ? "#1a1a1a" : "#e6e6e6", bg: accent ? "#FF8000" : "#2b2b2b" }) : null), [label, accent]);
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[2.4, 1.5, 0.05]} radius={0.1} smoothness={6}>
        <Mat kind={accent ? "accent" : mat} />
      </RoundedBox>
      {tex && (
        <mesh position={[0, 0, 0.0265]}>
          <planeGeometry args={[2.2, 1.3]} />
          <meshStandardMaterial map={tex} metalness={0.3} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
};

/** Classical bank / institution building (columns + pediment). `label` on the frieze. */
export const Bank: React.FC<{ label?: string; position?: Vec3; scale?: number; accentDoor?: boolean }> = ({ label = "BANK", position = [0, 0, 0], scale = 1, accentDoor = false }) => {
  const tex = useMemo(() => glyphTexture(label, { font: "600 120px Outfit, sans-serif", w: 1024, h: 256, fg: "#f0f0f0", bg: "#3a3a3a" }), [label]);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.1, 0]}><boxGeometry args={[3.2, 0.2, 2]} /><Mat kind="clay" /></mesh>
      <mesh position={[0, 0.25, 0]}><boxGeometry args={[3, 0.1, 1.8]} /><Mat kind="clay" /></mesh>
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.1, 0.6]}><cylinderGeometry args={[0.12, 0.13, 1.6, 32]} /><Mat kind="clay" /></mesh>
      ))}
      <mesh position={[0, 1.1, -0.2]}><boxGeometry args={[2.6, 1.6, 1]} /><Mat kind="clay" color="#d9d9d6" /></mesh>
      <mesh position={[0, 0.75, 0.31]}><boxGeometry args={[0.5, 0.9, 0.02]} /><Mat kind={accentDoor ? "accent" : "ink"} /></mesh>
      <mesh position={[0, 2.05, 0.1]}><boxGeometry args={[3.1, 0.3, 1.9]} /><Mat kind="graphite" /></mesh>
      <mesh position={[0, 2.05, 1.06]}><planeGeometry args={[2.6, 0.24]} /><meshStandardMaterial map={tex} roughness={0.5} /></mesh>
      <mesh position={[0, 2.45, 0.1]} rotation-y={Math.PI / 4}>
        <coneGeometry args={[2.25, 0.5, 4]} />
        <Mat kind="clay" />
      </mesh>
    </group>
  );
};

/** Vault door: thick ring, spokes, handle. Rotate `open` 0→1 to swing it. */
export const Vault: React.FC<{ position?: Vec3; open?: number; accent?: boolean; scale?: number }> = ({ position = [0, 1.4, 0], open = 0, accent = false, scale = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <group position={position} scale={scale}>
      <mesh><cylinderGeometry args={[1.45, 1.45, 0.35, 96]} /><Mat kind="graphite" /></mesh>
      <group rotation-x={Math.PI / 2}>
        <mesh position={[0, 0, 0]}><torusGeometry args={[1.45, 0.12, 24, 96]} /><Mat kind="chrome" /></mesh>
      </group>
      <group position={[-1.2 * open, 0, 0.2]} rotation-y={-open * 1.4}>
        <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[1.2, 1.2, 0.3, 96]} /><Mat kind={accent ? "accent" : "chrome"} /></mesh>
        <group position={[0, 0, 0.2]} rotation-z={frame * 0.01}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation-z={(i * Math.PI) / 3}><boxGeometry args={[1.6, 0.08, 0.08]} /><Mat kind="ink" /></mesh>
          ))}
          <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.18, 0.18, 0.2, 32]} /><Mat kind="ink" /></mesh>
        </group>
      </group>
    </group>
  );
};

/** Key: ring bow + shaft + bits. The self-custody symbol. */
export const Key: React.FC<{ position?: Vec3; rotation?: Vec3; accent?: boolean; scale?: number }> = ({ position = [0, 1.2, 0], rotation = [0, 0, Math.PI / 2], accent = true, scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 1, 0]}><torusGeometry args={[0.42, 0.13, 32, 96]} /><Mat kind={accent ? "accent" : "chrome"} /></mesh>
    <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.09, 0.09, 1.9, 32]} /><Mat kind={accent ? "accent" : "chrome"} /></mesh>
    {[[-0.85, 0.22], [-1.05, 0.32], [-0.62, 0.16]].map(([y, w], i) => (
      <mesh key={i} position={[w / 2, y, 0]}><boxGeometry args={[w, 0.12, 0.12]} /><Mat kind={accent ? "accent" : "chrome"} /></mesh>
    ))}
  </group>
);

/** Padlock. `open` 0→1 lifts the shackle. */
export const Padlock: React.FC<{ position?: Vec3; open?: number; accent?: boolean; scale?: number }> = ({ position = [0, 0.9, 0], open = 0, accent = false, scale = 1 }) => (
  <group position={position} scale={scale}>
    <RoundedBox args={[1.5, 1.2, 0.6]} radius={0.16} smoothness={6}><Mat kind={accent ? "accent" : "chrome"} /></RoundedBox>
    <group position={[0, 0.6 + open * 0.45, 0]} rotation-y={open * 0.9}>
      <mesh position={[0, 0.35, 0]}><torusGeometry args={[0.45, 0.1, 24, 64, Math.PI]} /><Mat kind="chrome" /></mesh>
      <mesh position={[-0.45, 0.1, 0]}><cylinderGeometry args={[0.1, 0.1, 0.5, 24]} /><Mat kind="chrome" /></mesh>
      <mesh position={[0.45, 0.1, 0]}><cylinderGeometry args={[0.1, 0.1, 0.5, 24]} /><Mat kind="chrome" /></mesh>
    </group>
    <mesh position={[0, -0.05, 0.31]}><cylinderGeometry args={[0.09, 0.09, 0.02, 24]} /><Mat kind="ink" /></mesh>
  </group>
);

/** Abstract person token (head + rounded body), the 0x100x "seller / you" figure. */
export const Person: React.FC<{ position?: Vec3; accent?: boolean; scale?: number; mat?: MatName }> = ({ position = [0, 0, 0], accent = false, scale = 1, mat = "clay" }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.6, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Mat kind={accent ? "accent" : mat} />
    </mesh>
    <mesh position={[0, 1.45, 0]}><sphereGeometry args={[0.32, 64, 32]} /><Mat kind={accent ? "accent" : mat} /></mesh>
  </group>
);

/** Plinth / pedestal to hero an object. */
export const Plinth: React.FC<{ position?: Vec3; radius?: number; height?: number; mat?: MatName }> = ({ position = [0, 0, 0], radius = 1.3, height = 0.5, mat = "clay" }) => (
  <mesh position={[position[0], position[1] + height / 2, position[2]]}><cylinderGeometry args={[radius, radius * 1.03, height, 96]} /><Mat kind={mat} /></mesh>
);

/** Paper document stack (contracts, records, statements). */
export const Documents: React.FC<{ count?: number; position?: Vec3; rotation?: Vec3 }> = ({ count = 4, position = [0, 0, 0], rotation = [0, 0.4, 0] }) => {
  const lines = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 680;
    const x = c.getContext("2d")!; x.fillStyle = "#f4f4f2"; x.fillRect(0, 0, 512, 680); x.fillStyle = "#9a9a9a";
    for (let i = 0; i < 16; i++) x.fillRect(56, 80 + i * 34, i % 4 === 3 ? 240 : 400, 10);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i) * 0.06, 0.02 + i * 0.03, Math.cos(i * 2) * 0.05]} rotation={[-Math.PI / 2, 0, i * 0.05]}>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial map={lines} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

/** Node network: N chrome nodes on a ring, linked; one accent node. Good for "the blockchain". */
export const NodeNetwork: React.FC<{ count?: number; radius?: number; accentIndex?: number; position?: Vec3; revealAt?: number }> = ({
  count = 7, radius = 2.2, accentIndex = 0, position = [0, 1.2, 0], revealAt = 0,
}) => {
  const frame = useCurrentFrame();
  const pts = useMemo(() => Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(i * 1.7) * 0.35, Math.sin(a) * radius * 0.6);
  }), [count, radius]);
  const lineGeo = useMemo(() => {
    const seg: number[] = [];
    pts.forEach((p, i) => { [1, 2].forEach((k) => { const q = pts[(i + k) % count]; seg.push(p.x, p.y, p.z, q.x, q.y, q.z); }); });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3)); return g;
  }, [pts, count]);
  const show = interpolate(frame - revealAt, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <group position={position} rotation-y={frame * 0.004}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#9a9a9a" transparent opacity={0.55 * show} />
      </lineSegments>
      {pts.map((p, i) => (
        <mesh key={i} position={p} scale={show * (i === accentIndex ? 1.25 : 1)}>
          <sphereGeometry args={[0.22, 48, 32]} />
          <Mat kind={i === accentIndex ? "accent" : "chrome"} />
        </mesh>
      ))}
    </group>
  );
};

/** A coin travelling along an arc from A to B (money moving). p = 0→1 progress. */
export const ArcTravel: React.FC<{ from: Vec3; to: Vec3; p: number; height?: number; accent?: boolean; trail?: boolean }> = ({ from, to, p, height = 1.6, accent = true, trail = true }) => {
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(new THREE.Vector3(...from), new THREE.Vector3((from[0] + to[0]) / 2, Math.max(from[1], to[1]) + height, (from[2] + to[2]) / 2), new THREE.Vector3(...to)), [from, to, height]);
  const pos = curve.getPoint(Math.min(1, Math.max(0, p)));
  const dots = useMemo(() => curve.getPoints(40), [curve]);
  return (
    <group>
      {trail && dots.map((d, i) => (i / 40 <= p ? <mesh key={i} position={d}><sphereGeometry args={[0.025, 8, 8]} /><meshBasicMaterial color="#8a8a8a" /></mesh> : null))}
      <group position={pos.toArray() as Vec3} rotation={[Math.PI / 2, 0, p * 6]}>
        <Coin radius={0.32} accent={accent} position={[0, 0, 0]} />
      </group>
    </group>
  );
};

/** Bars for a 3D bar chart. values 0..1, one accent index. grow = 0→1. */
export const Bars3D: React.FC<{ values: number[]; accentIndex?: number; grow?: number; position?: Vec3; maxHeight?: number; gap?: number }> = ({
  values, accentIndex = -1, grow = 1, position = [0, 0, 0], maxHeight = 3, gap = 0.9,
}) => (
  <group position={position}>
    {values.map((v, i) => {
      const h = Math.max(0.02, v * maxHeight * grow);
      return (
        <mesh key={i} position={[(i - (values.length - 1) / 2) * gap, h / 2, 0]}>
          <boxGeometry args={[gap * 0.62, h, gap * 0.62]} />
          <Mat kind={i === accentIndex ? "accent" : "chrome"} />
        </mesh>
      );
    })}
  </group>
);
