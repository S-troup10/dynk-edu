// Shared props + objects for run 2026-11-12-wallet-holds-a-key ("8,000 bitcoin in a rubbish tip. Except they're not.").
// Written by the director. Composers IMPORT from here and never edit it, so every scene shares one world:
// GLASS LETTERBOXES ON THE LEDGER. A wallet address = a glass letterbox anyone can look into; the coins (plain
// chrome discs) sit inside it on the public ledger; ORANGE = THE KEY (a key whose blade is a long number) and whatever
// that key controls. Supporting props: the ledger wall, a field of computers, the hard drive, a wheelie bin, a
// rubbish heap, a see-through phone, a steel plate stamped with 12 words.
// NOTHING from the earlier videos' sets: no word tiles, kit Coin/CoinStack/Padlock/Phone/ShareSheetEnd, pens, ink
// signatures, sign cards, vault doors, gift boxes, paper towers, CONFIRM keycaps, chrome $ slams.
//
//   import { STORY, WORDS, KEY_DIGITS, LEDGER_ROWS, Letterbox, Discs, LedgerWall, NodeField, NumberKey, HardDrive, Bin,
//            RubbishHeap, Handset, WordPlate, HookText, Cam2D, ease, CamRig, project, Sfx, W, rand, clamp, ORANGE,
//            type Shot, type Shot2D, type Vec3 } from "./_shared";
//
// SMOOTH MOTION RULES (learnt the hard way):
//  - 3D camera only through <CamRig shot> (writes the camera in useFrame(-10): one writer, no alternate-frame flips).
//  - 2D layers move only through <Cam2D> (sub-pixel). Never hand-animate translate/scale on text slowly.
//  - Text on 3D objects uses mipmapped power-of-two textures (all textures here do); keep it within ~35° of face-on.
//
// Story facts: James Howells, Newport (Wales): hard drive with the private key to 8,000 BTC binned in 2013; landfill
// holds ~1.4 million tonnes; High Court struck the claim out 9 Jan 2025; Court of Appeal refused permission Mar 2025.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { glyphTexture, Mat, type SceneProps } from "../../kit";
import { brand } from "../../brand";

export type Vec3 = [number, number, number];
export const FPS = 30;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ORANGE = "#FF8000";

export const STORY = {
  btc: "8,000", btcLabel: "8,000 BTC", year: "2013", place: "NEWPORT, WALES", tonnes: "1,400,000", tonnesShort: "1.4M TONNES",
  court1: "HIGH COURT · 9 JAN 2025", court1b: "CLAIM STRUCK OUT", court2: "COURT OF APPEAL · MAR 2025", court2b: "APPEAL REFUSED",
};
/** Example recovery words (random BIP-39 words, nobody's wallet). Always show with "Example words" disclaimer. */
export const WORDS = ["orbit", "velvet", "garden", "museum", "ripple", "candle", "anchor", "puzzle", "silver", "lemon", "harbor", "window"];
/** A 77-digit example number (a private key is a number about this long). Random digits, not a real key. */
export const KEY_DIGITS = "83917265048271936450172839465102738495061728394650918273645091827364509182736";
/** Made-up ledger rows (illustrative addresses; `his` = the story's letterbox). */
export const LEDGER_ROWS: { addr: string; bal: string; his?: boolean }[] = [
  { addr: "bc1q7m…x4ka", bal: "0.4120" }, { addr: "1Hq9Zt…mP2e", bal: "12.0000" }, { addr: "bc1p3d…9wuv", bal: "0.0031" },
  { addr: "1Jh0we…L1s8", bal: "8,000.0000", his: true }, { addr: "3Fk2Ra…n7Qy", bal: "1.2500" }, { addr: "bc1qz8…t0cd", bal: "0.0900" },
  { addr: "1Mv4Bn…e6Tx", bal: "250.0000" }, { addr: "bc1q5s…h2jr", bal: "0.0007" }, { addr: "3Lp8Yc…a9Wd", bal: "3.3300" },
];

/* ---------- word timing: frame of the n-th occurrence of a word in this scene's VO ---------- */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9$]/g, "");
export const W = (props: SceneProps, word: string, n = 0, fallbackSec = 0): number => {
  const hit = (props.vo?.words ?? []).filter((w) => norm(w.text) === norm(word))[n];
  return Math.round((hit?.start ?? fallbackSec) * FPS);
};

/* ---------- SFX helper: <Sfx name="whoosh_soft" at={frame} /> (files in studio/public/sfx) ---------- */
export type SfxName = "air_rise" | "click" | "glint" | "sub_drop" | "thud" | "tick" | "type" | "whoosh_soft";
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.5 }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/* ---------- camera ---------- */
export type Shot = { from: Vec3; to: Vec3; tFrom: Vec3; tTo: Vec3; fov: number; len: number };
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
export const camAt = (s: Shot, f: number) => {
  const p = interpolate(f, [0, s.len], [0, 1], clamp);
  const q = Easing.bezier(0.33, 0.12, 0.25, 1)(p); // already moving on frame 0, long smooth settle
  return { pos: lerp3(s.from, s.to, q), tgt: lerp3(s.tFrom, s.tTo, q) };
};
/** Put inside <Studio3D camera={{from: shot.from, target: shot.tFrom, fov: shot.fov}}>. Drives the camera for `shot`
 *  from the Sequence-local frame, in useFrame(-10) so it is the ONLY effective camera writer. Set shot.len = the
 *  Sequence's length so the camera never stops before the cut. */
export const CamRig: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  useFrame(({ camera }) => {
    const { pos, tgt } = camAt(shot, f);
    camera.position.set(...pos);
    (camera as THREE.PerspectiveCamera).fov = shot.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...tgt);
  }, -10);
  return null;
};
/** World point → screen px (1080×1920) for the same camera, so Callouts track 3D parts. */
export const project = (shot: Shot, f: number, p: Vec3): [number, number] => {
  const { pos, tgt } = camAt(shot, f);
  const c = new THREE.PerspectiveCamera(shot.fov, 1080 / 1920, 0.1, 400);
  c.position.set(...pos);
  c.lookAt(...tgt);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 540, (1 - v.y) * 960];
};

/** Cheap deterministic pseudo-random — never use Math.random() in scenes. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------- SMOOTH 2D CAMERA: <Cam2D shot={{from:{x:0,y:40,s:1.04}, to:{x:-20,y:0,s:1.1}, len: 36}}> ---------- */
export const ease = Easing.bezier(0.45, 0, 0.2, 1);
export type Cam2DKey = { x?: number; y?: number; s?: number; r?: number };
export type Shot2D = { from: Cam2DKey; to: Cam2DKey; len: number };
export const Cam2D: React.FC<{ shot: Shot2D; children: React.ReactNode; originX?: number; originY?: number }> = ({ shot, children, originX = 540, originY = 960 }) => {
  const f = useCurrentFrame();
  const p = ease(interpolate(f, [0, shot.len], [0, 1], clamp));
  const k = (key: keyof Cam2DKey, d: number) => (shot.from[key] ?? d) + ((shot.to[key] ?? shot.from[key] ?? d) - (shot.from[key] ?? d)) * p;
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `${originX}px ${originY}px`, willChange: "transform",
      transform: `perspective(2000px) translate3d(${k("x", 0)}px, ${k("y", 0)}px, 0) scale(${k("s", 1)}) rotate(${k("r", 0)}deg) rotateX(0.01deg)` }}>
      {children}
    </div>
  );
};

/* ---------- canvas text panels (mipmapped, cached) ---------- */
export type PanelLine = { text: string; size?: number; color?: string; weight?: number; mono?: boolean; align?: "left" | "center" };
const panelCache = new Map<string, THREE.CanvasTexture>();
export const panelTexture = (lines: PanelLine[], o: { w?: number; h?: number; bg?: string; pad?: number; top?: number; border?: string } = {}) => {
  const { w = 1024, h = 512, bg = "#141518", pad = 70, top = 90, border } = o;
  const key = JSON.stringify([lines, w, h, bg, pad, top, border]);
  const hit = panelCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d")!;
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  if (border) { x.strokeStyle = border; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10); }
  let y = top;
  for (const l of lines) {
    const size = l.size ?? 56;
    x.font = `${l.weight ?? 600} ${size}px ${l.mono ? "'DejaVu Sans Mono', monospace" : "Outfit, 'DejaVu Sans', sans-serif"}`;
    x.fillStyle = l.color ?? "#f2f2f2"; x.textBaseline = "middle";
    x.textAlign = l.align === "center" ? "center" : "left";
    x.fillText(l.text, l.align === "center" ? w / 2 : pad, y);
    y += size * 1.5;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 16;
  panelCache.set(key, t);
  return t;
};

/* =====================================================================================================================
   DISCS: plain chrome coin discs (no glyphs, no logos) piled in a w×d footprint from y=0 up. count shown = floor(n).
   warm = slightly orange-lit (inside a glowing letterbox). Deterministic pile. Instanced, cheap.
   ===================================================================================================================== */
export const Discs: React.FC<{ n?: number; max?: number; w?: number; d?: number; position?: Vec3; warm?: boolean; radius?: number; seed?: number }> = ({
  n = 40, max = 60, w = 0.8, d = 0.5, position = [0, 0, 0], warm = false, radius = 0.11, seed = 1 }) => {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const shown = Math.max(0, Math.min(max, Math.floor(n)));
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const perLayer = Math.max(1, Math.floor((w / (radius * 2.1)) * (d / (radius * 2.1))));
    for (let i = 0; i < max; i++) {
      const layer = Math.floor(i / perLayer);
      const px = (rand(i * 3.1 + seed) - 0.5) * (w - radius * 2);
      const pz = (rand(i * 5.7 + seed + 2) - 0.5) * (d - radius * 2);
      e.set((rand(i + seed + 7) - 0.5) * 0.5, rand(i + seed) * 6.28, (rand(i + seed + 11) - 0.5) * 0.5);
      q.setFromEuler(e);
      m.compose(new THREE.Vector3(px, 0.03 + layer * 0.07 + rand(i + seed + 4) * 0.03, pz), q, new THREE.Vector3(1, 1, 1));
      ref.current.setMatrixAt(i, m);
    }
    ref.current.count = shown;
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={position}>
      <instancedMesh ref={ref} args={[undefined as any, undefined as any, max]}>
        <cylinderGeometry args={[radius, radius, 0.03, 28]} />
        <meshStandardMaterial color={warm ? "#ffd9ad" : "#e6e6e6"} metalness={0.95} roughness={0.22}
          emissive={warm ? "#FF6A00" : "#000000"} emissiveIntensity={warm ? 0.18 : 0} />
      </instancedMesh>
    </group>
  );
};
/** One loose disc (for drops through the slot). */
export const Disc: React.FC<{ position?: Vec3; rotation?: Vec3; radius?: number; warm?: boolean }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], radius = 0.11, warm = false }) => (
  <mesh position={position} rotation={rotation}>
    <cylinderGeometry args={[radius, radius, 0.03, 28]} />
    <meshStandardMaterial color={warm ? "#ffd9ad" : "#e6e6e6"} metalness={0.95} roughness={0.22} emissive={warm ? "#FF6A00" : "#000"} emissiveIntensity={warm ? 0.18 : 0} />
  </mesh>
);

/* =====================================================================================================================
   LETTERBOX: the hero. A glass box on a short post: 1.2 wide × 1.5 tall × 0.8 deep, base of the box at y = 0.5 above
   `position` (so position = floor point). Coin slot on top, front glass door (hinge left) with a keyhole plate,
   address plate under the door. coins = how many discs inside (0–60). open 0..1 swings the door.
   glow = orange frame (it is "yours"/the story's box). keyGlow = keyhole lit orange. dim = dark, lifeless.
   Front face is +Z. Keyhole centre (local): [0.38, 1.1, 0.43]. Slot centre: [0, 2.0, 0.1]. Body centre: [0, 1.25, 0].
   ===================================================================================================================== */
export const LB = { keyhole: [0.38, 1.1, 0.43] as Vec3, slot: [0, 2.02, 0.1] as Vec3, centre: [0, 1.25, 0] as Vec3, floorIn: 0.52 };
export const Letterbox: React.FC<{
  position?: Vec3; rotation?: Vec3; scale?: number; coins?: number; open?: number; glow?: boolean; keyGlow?: boolean; dim?: boolean;
  address?: string; post?: boolean; seed?: number;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, coins = 30, open = 0, glow = false, keyGlow = false, dim = false,
  address = "1Jh0we…L1s8", post = true, seed = 1 }) => {
  const Wd = 1.2, H = 1.5, D = 0.8, t = 0.05, y0 = 0.5;
  const frame = glow ? "accent" : dim ? "ink" : "chrome";
  const plate = useMemo(() => glyphTexture(address, { font: "600 84px 'DejaVu Sans Mono', monospace", w: 1024, h: 128, fg: glow ? "#1a0c00" : dim ? "#555" : "#e8e8e8", bg: glow ? ORANGE : "#1b1c1f" }), [address, glow, dim]);
  const glass = (
    <meshStandardMaterial color={glow ? "#ffb060" : "#b9cde0"} metalness={0.2} roughness={0.08} transparent opacity={dim ? 0.06 : 0.11} depthWrite={false} side={THREE.DoubleSide}
      emissive={glow ? "#FF6A00" : "#5a7088"} emissiveIntensity={dim ? 0.05 : glow ? 0.25 : 0.35} />
  );
  const bars: { p: Vec3; s: Vec3 }[] = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bars.push({ p: [sx * (Wd / 2), y0 + H / 2, sz * (D / 2)], s: [t, H + t, t] });
  for (const sy of [0, 1]) for (const sz of [-1, 1]) bars.push({ p: [0, y0 + sy * H, sz * (D / 2)], s: [Wd + t, t, t] });
  for (const sy of [0, 1]) for (const sx of [-1, 1]) bars.push({ p: [sx * (Wd / 2), y0 + sy * H, 0], s: [t, t, D + t] });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {post && <mesh position={[0, y0 / 2, 0]}><cylinderGeometry args={[0.07, 0.09, y0, 20]} /><Mat kind="ink" /></mesh>}
      {post && <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.32, 0.36, 0.04, 32]} /><Mat kind="ink" /></mesh>}
      {/* floor of the box + coins */}
      <mesh position={[0, y0 + 0.01, 0]}><boxGeometry args={[Wd, 0.02, D]} /><Mat kind="ink" /></mesh>
      <Discs n={coins} max={60} w={Wd - 0.12} d={D - 0.12} position={[0, y0 + 0.02, 0]} warm={glow} seed={seed} />
      {/* frame */}
      {bars.map((b, i) => <mesh key={i} position={b.p}><boxGeometry args={b.s} /><Mat kind={frame} /></mesh>)}
      {/* glass: back, sides */}
      <mesh position={[0, y0 + H / 2, -D / 2]} renderOrder={5}><planeGeometry args={[Wd, H]} />{glass}</mesh>
      <mesh position={[-Wd / 2, y0 + H / 2, 0]} rotation={[0, Math.PI / 2, 0]} renderOrder={5}><planeGeometry args={[D, H]} />{glass}</mesh>
      <mesh position={[Wd / 2, y0 + H / 2, 0]} rotation={[0, Math.PI / 2, 0]} renderOrder={5}><planeGeometry args={[D, H]} />{glass}</mesh>
      {/* top with slot */}
      <mesh position={[0, y0 + H, -0.17]}><boxGeometry args={[Wd, 0.03, D - 0.34]} /><Mat kind={glow ? "accent" : "graphite"} /></mesh>
      <mesh position={[0, y0 + H, 0.31]}><boxGeometry args={[Wd, 0.03, 0.18]} /><Mat kind={glow ? "accent" : "graphite"} /></mesh>
      <mesh position={[-0.45, y0 + H, 0.1]}><boxGeometry args={[0.3, 0.03, 0.24]} /><Mat kind={glow ? "accent" : "graphite"} /></mesh>
      <mesh position={[0.45, y0 + H, 0.1]}><boxGeometry args={[0.3, 0.03, 0.24]} /><Mat kind={glow ? "accent" : "graphite"} /></mesh>
      {/* front door (hinge on the left edge) */}
      <group position={[-Wd / 2, y0, D / 2]} rotation={[0, -open * 1.75, 0]}>
        <mesh position={[Wd / 2, H / 2, 0]} renderOrder={6}><planeGeometry args={[Wd, H]} />{glass}</mesh>
        <group position={[Wd / 2 + 0.38, 0.6, 0.015]}>
          <RoundedBox args={[0.26, 0.36, 0.03]} radius={0.012} smoothness={2}><Mat kind={glow || keyGlow ? "accent" : dim ? "ink" : "chrome"} /></RoundedBox>
          <mesh position={[0, 0.03, 0.017]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.004, 20]} /><meshStandardMaterial color={keyGlow ? "#FFB060" : "#060606"} emissive={keyGlow ? "#FF6A00" : "#000"} emissiveIntensity={keyGlow ? 2 : 0} toneMapped={false} /></mesh>
          <mesh position={[0, -0.04, 0.017]}><boxGeometry args={[0.026, 0.1, 0.004]} /><meshStandardMaterial color={keyGlow ? "#FFB060" : "#060606"} emissive={keyGlow ? "#FF6A00" : "#000"} emissiveIntensity={keyGlow ? 2 : 0} toneMapped={false} /></mesh>
        </group>
      </group>
      {/* address plate under the box */}
      <mesh position={[0, y0 - 0.12, D / 2 + 0.005]}><planeGeometry args={[1.0, 0.125]} /><meshStandardMaterial map={plate} emissive="#ffffff" emissiveMap={plate} emissiveIntensity={glow ? 0.5 : 0.3} /></mesh>
      {glow && <pointLight position={[0, y0 + 0.7, 0]} color={ORANGE} intensity={2.2} distance={4} />}
    </group>
  );
};

/* =====================================================================================================================
   LEDGER WALL: rows × cols of small letterboxes (0.5 cubes, pitch 0.72) standing as a wall in the XY plane facing +Z,
   bottom row at y≈0.35, centred on x=0. `hot` = index (row*cols+col) of the orange one (or -1). Instanced; the
   "public ledger" seen from afar. hotPos(rows, cols, hot) gives its world centre (relative to `position`).
   ===================================================================================================================== */
export const wallPos = (rows: number, cols: number, i: number, pitch = 0.72): Vec3 => {
  const r = Math.floor(i / cols), c = i % cols;
  return [(c - (cols - 1) / 2) * pitch, 0.35 + r * pitch, 0];
};
export const LedgerWall: React.FC<{ rows?: number; cols?: number; hot?: number; position?: Vec3; rotation?: Vec3; pitch?: number; reveal?: number }> = ({
  rows = 6, cols = 9, hot = -1, position = [0, 0, 0], rotation = [0, 0, 0], pitch = 0.72, reveal = 1 }) => {
  const body = useRef<THREE.InstancedMesh>(null!), coin = useRef<THREE.InstancedMesh>(null!);
  const total = rows * cols;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
    const shown = Math.floor(total * Math.min(1, Math.max(0, reveal)));
    let k = 0;
    for (let i = 0; i < total; i++) {
      if (i === hot || i >= shown) continue;
      const p = wallPos(rows, cols, i, pitch);
      m.compose(new THREE.Vector3(p[0], p[1], p[2]), q, s); body.current.setMatrixAt(k, m);
      const fill = 0.08 + rand(i * 7.3) * 0.26;
      m.compose(new THREE.Vector3(p[0], p[1] - 0.25 + fill / 2 + 0.02, p[2]), q, new THREE.Vector3(1, fill / 0.1, 1)); coin.current.setMatrixAt(k, m);
      k++;
    }
    body.current.count = k; coin.current.count = k;
    body.current.instanceMatrix.needsUpdate = true; coin.current.instanceMatrix.needsUpdate = true;
  });
  const hp = hot >= 0 ? wallPos(rows, cols, hot, pitch) : null;
  return (
    <group position={position} rotation={rotation}>
      <instancedMesh ref={coin} args={[undefined as any, undefined as any, total]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#d8d8d8" metalness={0.95} roughness={0.25} />
      </instancedMesh>
      <instancedMesh ref={body} args={[undefined as any, undefined as any, total]} renderOrder={4}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#9fb4c8" metalness={0.3} roughness={0.1} transparent opacity={0.16} depthWrite={false} />
      </instancedMesh>
      {hp && (
        <group position={hp}>
          <mesh position={[0, -0.08, 0]}><boxGeometry args={[0.4, 0.3, 0.4]} /><meshStandardMaterial color="#ffd9ad" metalness={0.9} roughness={0.25} emissive="#FF6A00" emissiveIntensity={0.5} /></mesh>
          <mesh renderOrder={5}><boxGeometry args={[0.52, 0.52, 0.52]} /><meshStandardMaterial color={ORANGE} emissive="#FF6A00" emissiveIntensity={0.9} transparent opacity={0.3} depthWrite={false} /></mesh>
          <pointLight color={ORANGE} intensity={1.6} distance={3} />
        </group>
      )}
    </group>
  );
};

/* =====================================================================================================================
   NODE FIELD: rows × cols of tiny computers (a screen on a stand) on the floor, pitch 1.1, centred on `position`,
   screens facing +Z and tilted back. wave 0..1 = an orange "copy arrived" ripple spreading from the centre outwards;
   screens behind the wavefront stay lit white (they hold a copy), ahead are dark. Instanced (≤ 600).
   ===================================================================================================================== */
export const NodeField: React.FC<{ rows?: number; cols?: number; wave?: number; position?: Vec3; pitch?: number }> = ({ rows = 14, cols = 12, wave = 1, position = [0, 0, 0], pitch = 1.1 }) => {
  const scr = useRef<THREE.InstancedMesh>(null!), std = useRef<THREE.InstancedMesh>(null!);
  const total = rows * cols;
  const tex = useMemo(() => panelTexture(
    [0, 1, 2, 3, 4].map((i) => ({ text: "▬▬▬▬▬  ▬▬".slice(0, 9 - (i % 3)), size: 40, color: "#ffffff" })), { w: 256, h: 256, bg: "#0c0d0f", pad: 26, top: 44 }), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.28, 0, 0)), q0 = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
    const col = new THREE.Color();
    const maxD = Math.hypot((cols - 1) / 2, (rows - 1) / 2) * pitch;
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      const x = (c - (cols - 1) / 2) * pitch, z = (r - (rows - 1) / 2) * pitch;
      m.compose(new THREE.Vector3(x, 0.42, z), q, one); scr.current.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, 0.13, z - 0.05), q0, one); std.current.setMatrixAt(i, m);
      const dist = Math.hypot(x, z) / maxD;         // 0 centre .. 1 corner
      const front = wave * 1.25;                     // wavefront position
      const k = front - dist;                        // >0 = wave has passed
      if (k < 0) col.setRGB(0.05, 0.05, 0.055);
      else if (k < 0.12) col.setRGB(1.0, 0.5, 0.0);
      else col.setRGB(0.62, 0.64, 0.68);
      scr.current.setColorAt(i, col);
    }
    scr.current.instanceMatrix.needsUpdate = true; std.current.instanceMatrix.needsUpdate = true;
    if (scr.current.instanceColor) scr.current.instanceColor.needsUpdate = true;
  });
  return (
    <group position={position}>
      <instancedMesh ref={std} args={[undefined as any, undefined as any, total]}>
        <boxGeometry args={[0.08, 0.26, 0.08]} /><meshStandardMaterial color="#1a1b1e" metalness={0.6} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={scr} args={[undefined as any, undefined as any, total]}>
        <boxGeometry args={[0.62, 0.42, 0.03]} /><meshBasicMaterial map={tex} toneMapped={false} />
      </instancedMesh>
    </group>
  );
};

/* =====================================================================================================================
   NUMBER KEY: THE orange object. A key whose blade is a strip of digits. Lies along +X: bow (ring) centred at the
   origin, blade from x≈0.3 to x≈2.1, tip at [2.1, 0, 0]; flat in the XY plane (faces ±Z). dim = cold graphite
   (a stranger's/dead key). digits = string shown on the blade. Scale it; rotate it to insert (tip first).
   ===================================================================================================================== */
export const NumberKey: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number; dim?: boolean; digits?: string; glowLight?: boolean }> = ({
  position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, dim = false, digits = KEY_DIGITS.slice(0, 22), glowLight = false }) => {
  const tex = useMemo(() => glyphTexture(digits, { font: "700 92px 'DejaVu Sans Mono', monospace", w: 2048, h: 128, fg: dim ? "#8a8a8a" : "#1a0c00", bg: dim ? "#232427" : ORANGE }), [digits, dim]);
  const kind = dim ? "graphite" : "accent";
  const teeth = digits.replace(/\D/g, "").slice(0, 12).split("").map(Number);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh><torusGeometry args={[0.27, 0.075, 18, 56]} /><Mat kind={kind} /></mesh>
      <mesh position={[0.36, 0, 0]}><boxGeometry args={[0.16, 0.2, 0.07]} /><Mat kind={kind} /></mesh>
      <mesh position={[1.25, 0.02, 0]}><boxGeometry args={[1.7, 0.2, 0.06]} /><Mat kind={kind} /></mesh>
      <mesh position={[1.25, 0.02, 0.031]}><planeGeometry args={[1.64, 0.1025]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={dim ? 0.15 : 0.55} toneMapped={false} /></mesh>
      <mesh position={[1.25, 0.02, -0.031]} rotation={[0, Math.PI, 0]}><planeGeometry args={[1.64, 0.1025]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={dim ? 0.15 : 0.55} toneMapped={false} /></mesh>
      {teeth.map((d, i) => (
        <mesh key={i} position={[0.62 + i * 0.125, -0.08 - (0.03 + d * 0.012) / 2, 0]}><boxGeometry args={[0.085, 0.03 + d * 0.012, 0.05]} /><Mat kind={kind} /></mesh>
      ))}
      {glowLight && !dim && <pointLight position={[1.1, 0.2, 0.4]} color={ORANGE} intensity={1.8} distance={3.5} />}
    </group>
  );
};

/* =====================================================================================================================
   HARD DRIVE: an old 3.5" drive lying flat (1.0 × 0.26 × 1.47), centre at `position`. xray 0..1 fades the lid to
   glass, showing the platter + arm; keyInside puts a small glowing NumberKey on the platter (the only copy).
   seam = thin orange glow line round the lid (use it on frame 0 of the hook).
   ===================================================================================================================== */
export const HardDrive: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number; xray?: number; keyInside?: boolean; seam?: boolean; label?: string }> = ({
  position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, xray = 0, keyInside = false, seam = false, label = "500 GB" }) => {
  const lab = useMemo(() => panelTexture([{ text: "HARD DISK DRIVE", size: 44, weight: 700, color: "#222" }, { text: label, size: 84, weight: 800, color: "#111" }, { text: "S/N 2009-0215", size: 36, mono: true, color: "#444" }],
    { w: 512, h: 512, bg: "#d6d6d2", pad: 44, top: 110 }), [label]);
  const lidOp = 1 - xray * 0.88;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[1.0, 0.2, 1.47]} radius={0.03} smoothness={2} position={[0, -0.03, 0]}><Mat kind="ink" /></RoundedBox>
      {/* inside (visible when xray) */}
      <mesh position={[0, 0.075, -0.2]}><cylinderGeometry args={[0.44, 0.44, 0.02, 64]} /><meshStandardMaterial color="#f0f0f0" metalness={1} roughness={0.08} /></mesh>
      <mesh position={[0, 0.09, -0.2]}><cylinderGeometry args={[0.1, 0.1, 0.03, 32]} /><Mat kind="graphite" /></mesh>
      <group position={[0.34, 0.1, 0.52]} rotation={[0, 0.55, 0]}>
        <mesh position={[0, 0, -0.26]}><boxGeometry args={[0.05, 0.015, 0.56]} /><Mat kind="chrome" /></mesh>
        <mesh><cylinderGeometry args={[0.07, 0.07, 0.04, 24]} /><Mat kind="graphite" /></mesh>
      </group>
      {keyInside && <NumberKey position={[-0.3, 0.1, -0.2]} rotation={[-Math.PI / 2, 0, 0.5]} scale={0.3} glowLight />}
      {/* lid */}
      <mesh position={[0, 0.105, 0]} renderOrder={7}><boxGeometry args={[0.96, 0.02, 1.43]} />
        <meshStandardMaterial color="#c9ccd0" metalness={0.9} roughness={0.3} transparent={xray > 0} opacity={lidOp} depthWrite={xray < 0.05} /></mesh>
      {xray < 0.6 && <mesh position={[0, 0.117, 0.3]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.62, 0.62]} /><meshStandardMaterial map={lab} roughness={0.8} transparent opacity={1 - xray / 0.6} /></mesh>}
      {[[-0.43, -0.66], [0.43, -0.66], [-0.43, 0.66], [0.43, 0.66]].map(([x, z], i) => <mesh key={i} position={[x, 0.117, z]}><cylinderGeometry args={[0.025, 0.025, 0.006, 12]} /><Mat kind="graphite" /></mesh>)}
      {seam && <mesh position={[0, 0.09, 0]}><boxGeometry args={[1.012, 0.012, 1.482]} /><meshStandardMaterial color={ORANGE} emissive="#FF6A00" emissiveIntensity={2.2} toneMapped={false} /></mesh>}
      {seam && <pointLight position={[0, 0.3, 0]} color={ORANGE} intensity={1.2} distance={3} />}
    </group>
  );
};

/* ---------- BIN: a wheelie bin (≈ 1.0 wide × 1.5 tall), standing on the floor at `position`, opening faces up.
   lid 0..1 = open angle. Drop things in from above (inside floor y ≈ 0.2; mouth y ≈ 1.4). ---------- */
export const Bin: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number; lid?: number }> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, lid = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]}><cylinderGeometry args={[0.74, 0.56, 1.3, 4, 1, true]} /><meshStandardMaterial color="#1c1d20" metalness={0.3} roughness={0.55} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.14, 0]}><boxGeometry args={[0.78, 0.04, 0.78]} /><Mat kind="ink" /></mesh>
    <mesh position={[0, 1.43, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}><torusGeometry args={[0.74, 0.035, 8, 4]} /><Mat kind="graphite" /></mesh>
    {[-0.42, 0.42].map((x, i) => <mesh key={i} position={[x, 0.13, -0.42]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.13, 0.08, 20]} /><Mat kind="ink" /></mesh>)}
    <group position={[0, 1.46, -0.53]} rotation={[-lid * 1.9, 0, 0]}>
      <mesh position={[0, 0.02, 0.54]}><boxGeometry args={[1.1, 0.05, 1.1]} /><Mat kind="graphite" /></mesh>
      <mesh position={[0, 0.06, 1.02]}><boxGeometry args={[0.4, 0.04, 0.08]} /><Mat kind="ink" /></mesh>
    </group>
  </group>
);

/* =====================================================================================================================
   RUBBISH HEAP: a hill of dark bags/boxes/scrap (instanced, default 900 pieces), base radius R, height H, centred on
   `position` on the floor. grow 0..1 = fraction present (builds bottom-up). glowAt = local point of a faint orange
   glow buried inside (the drive) — visible through gaps and as light on nearby pieces.
   ===================================================================================================================== */
export const RubbishHeap: React.FC<{ position?: Vec3; R?: number; H?: number; count?: number; grow?: number; glowAt?: Vec3 | null; glow?: number; seed?: number }> = ({
  position = [0, 0, 0], R = 5, H = 3.2, count = 900, grow = 1, glowAt = null, glow = 1, seed = 3 }) => {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const order = useMemo(() => {
    const a = Array.from({ length: count }, (_, i) => {
      const r = R * Math.sqrt(rand(i * 1.7 + seed)) , th = rand(i * 2.9 + seed) * Math.PI * 2;
      const top = H * Math.exp(-(r * r) / (2 * (R * 0.42) ** 2));
      const y = top * (0.55 + 0.45 * rand(i * 4.3 + seed)) + 0.08;   // shell of the hill
      return { x: Math.cos(th) * r, z: Math.sin(th) * r, y, i };
    });
    return a.sort((p, q) => p.y - q.y);
  }, [count, R, H, seed]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
    order.forEach((p, k) => {
      const i = p.i;
      e.set(rand(i + 1) * 6.28, rand(i + 2) * 6.28, rand(i + 3) * 6.28); q.setFromEuler(e);
      const s = 0.28 + rand(i + 5) * 0.5;
      m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(s * (0.7 + rand(i + 6) * 0.9), s * (0.5 + rand(i + 7) * 0.7), s));
      ref.current.setMatrixAt(k, m);
      const g = 0.022 + rand(i + 8) * 0.05; const tint = rand(i + 9);
      col.setRGB(g * (tint > 0.88 ? 1.25 : 1), g * (tint < 0.1 ? 1.15 : 1), g * (tint > 0.4 && tint < 0.5 ? 1.3 : 1.05));
      ref.current.setColorAt(k, col);
    });
    ref.current.count = Math.floor(count * Math.min(1, Math.max(0, grow)));
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return (
    <group position={position}>
      <instancedMesh ref={ref} args={[undefined as any, undefined as any, count]}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial metalness={0.25} roughness={0.7} flatShading />
      </instancedMesh>
      {glowAt && glow > 0 && (
        <group position={glowAt}>
          <mesh><sphereGeometry args={[0.16, 16, 12]} /><meshStandardMaterial color={ORANGE} emissive="#FF6A00" emissiveIntensity={3 * glow} toneMapped={false} /></mesh>
          <pointLight color={ORANGE} intensity={5 * glow} distance={3.2} />
        </group>
      )}
    </group>
  );
};

/* =====================================================================================================================
   HANDSET: a plain phone slab (0.92 × 1.9 × 0.1), centre at `position`, screen faces +Z. lines = text on the screen.
   xray 0..1 turns the whole phone to glass (screen fades) so `children` placed inside (local coords, z≈0) show.
   ===================================================================================================================== */
export const Handset: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number; lines?: PanelLine[]; xray?: number; children?: React.ReactNode }> = ({
  position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, lines = [{ text: "Wallet", size: 64, weight: 700 }], xray = 0, children }) => {
  const tex = useMemo(() => panelTexture(lines, { w: 512, h: 1024, bg: "#101114", pad: 48, top: 150 }), [JSON.stringify(lines)]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {children}
      <RoundedBox args={[0.92, 1.9, 0.1]} radius={0.09} smoothness={3} renderOrder={6}>
        <meshStandardMaterial color={xray > 0.02 ? "#b9cde0" : "#0c0c0e"} metalness={0.5} roughness={0.2} transparent={xray > 0.02} opacity={1 - xray * 0.84} depthWrite={xray < 0.05}
          emissive="#5a7088" emissiveIntensity={xray * 0.4} />
      </RoundedBox>
      {xray < 0.98 && <mesh position={[0, 0, 0.0515]} renderOrder={7}><planeGeometry args={[0.82, 1.76]} />
        <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.55} transparent opacity={1 - xray} /></mesh>}
    </group>
  );
};

/* =====================================================================================================================
   WORD PLATE: a brushed steel backup plate (2.3 × 1.5 × 0.06) with the 12 example words stamped in a 3 × 4 grid,
   numbered. count 0..12 = how many are stamped so far. Faces +Z, centre at `position`. hot = orange rim.
   ===================================================================================================================== */
export const WordPlate: React.FC<{ position?: Vec3; rotation?: Vec3; scale?: number; count?: number; hot?: boolean; words?: string[] }> = ({
  position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, count = 12, hot = false, words = WORDS }) => {
  const n = Math.max(0, Math.min(12, Math.floor(count)));
  const tex = useMemo(() => {
    const key = "plate" + n + hot + words.join();
    const hit = panelCache.get(key); if (hit) return hit;
    const c = document.createElement("canvas"); c.width = 2048; c.height = 1024; const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, 2048, 1024); g.addColorStop(0, "#8a8d92"); g.addColorStop(0.5, "#b4b7bc"); g.addColorStop(1, "#7e8186");
    x.fillStyle = g; x.fillRect(0, 0, 2048, 1024);
    x.textBaseline = "middle";
    for (let i = 0; i < n; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const px = 130 + col * 620, py = 170 + row * 228;
      x.font = "600 54px 'DejaVu Sans Mono', monospace"; x.fillStyle = "#3a3c40"; x.textAlign = "right"; x.fillText(String(i + 1), px + 60, py);
      x.font = "700 96px 'DejaVu Sans Mono', monospace"; x.fillStyle = "#101113"; x.textAlign = "left"; x.fillText(words[i], px + 92, py + 3);
      x.fillStyle = "rgba(255,255,255,0.22)"; x.fillText(words[i], px + 92, py + 7);
      x.fillStyle = "#101113"; x.fillText(words[i], px + 92, py + 3);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 16;
    panelCache.set(key, t); return t;
  }, [n, hot, words.join()]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[2.3, 1.5, 0.06]} radius={0.05} smoothness={2}><Mat kind={hot ? "accent" : "chrome"} /></RoundedBox>
      <mesh position={[0, 0, 0.031]}><planeGeometry args={[2.2, 1.1]} /><meshStandardMaterial map={tex} metalness={0.35} roughness={0.5} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.22} /></mesh>
      {[[-1.05, 0.65], [1.05, 0.65], [-1.05, -0.65], [1.05, -0.65]].map(([x, y], i) => <mesh key={i} position={[x, y, 0.032]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.01, 16]} /><Mat kind="ink" /></mesh>)}
    </group>
  );
};

/* ---------- HOOK TEXT (2D): the big 2-line text hook. white line then orange line (from +10 f). Put over the first
   ~40 frames of S01 only. y = top of the block. ---------- */
export const HookText: React.FC<{ a: string; b: string; y?: number; x?: number; size?: number; from?: number; to?: number }> = ({ a, b, y = 1130, x = 90, size = 84, from = 0, to = 40 }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const e = (s: number) => Easing.out(Easing.cubic)(interpolate(f, [s, s + 6], [0, 1], clamp));
  const line = (t: string, color: string, s: number) => (
    <div style={{ fontFamily: brand.body, fontWeight: 800, fontSize: size, lineHeight: 1.06, letterSpacing: -1, color, opacity: e(s),
      transform: `translate3d(0, ${(1 - e(s)) * 18}px, 0)`, textShadow: "0 4px 30px rgba(0,0,0,0.85)" }}>{t}</div>
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 900 }}>
      {line(a, "#ffffff", from)}
      {line(b, ORANGE, from + 10)}
    </div>
  );
};
