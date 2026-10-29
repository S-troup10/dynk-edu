// Scene: 2026-10-29-next S04 · MECHANISM: an address = long string; start / middle / end.
// 0.0–1.6 s macro track along the start of the row while the 42 tiles drop in L→R ("a long string").
// 1.6 s hard cut: wide 3/4 side-on of the whole row, slow orbit + push. Ends glow orange on
// "string" (START) and "characters" (END). 3.56 s "skip": a thin grey bracket sweeps the middle 32,
// they dim behind it; "middle" → MIDDLE callout. Camera keeps drifting down toward the middle.
import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { REAL, FIRST4, LAST4, MIDDLE, Tile, tileX } from "./_shared";

type Vec3 = [number, number, number];
const S = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/* ---------- timing (from props.vo.words) ---------- */
const CUT = 48;          // "string" 1.594 s
const END_ON = 60;       // "characters" 1.99 s
const SKIP = 107;        // "skip" 3.559 s
const MID = 118;         // "middle" 3.929 s
const START_IDX = [0, 1, ...FIRST4];      // "0x7A3f"
const END_IDX = LAST4;                    // "9c2E"

/* ---------- camera path (one function drives both the 3D rig and the 2D callout projection) ---------- */
type Cam = { pos: Vec3; target: Vec3; fov: number };
const B0: Vec3 = [-22, 4.4, 82], B1: Vec3 = [-13, 2.8, 78.5], C1: Vec3 = [-7, 1.0, 77];
const T0: Vec3 = [1.4, -0.9, 0], T1: Vec3 = [1.2, -0.8, 0], T2: Vec3 = [1.0, -0.6, 0];
const cam = (f: number): Cam => {
  if (f < CUT) {
    const p = f / (CUT - 1);
    const pos = lerp([tileX(0) + 1.5, 0.8, 5.0], [tileX(8), 0.55, 6.6], p);
    return { pos, target: [pos[0] - 1.45, -0.02, 0], fov: 30 };
  }
  if (f < 105) { const q = (f - CUT) / (105 - CUT); return { pos: lerp(B0, B1, q), target: lerp(T0, T1, q), fov: 32 }; }
  const r = Math.min(1, (f - 105) / 45);
  return { pos: lerp(B1, C1, r), target: lerp(T1, T2, r), fov: 32 };
};
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec3): Vec3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l]; };
/** world point → 1080×1920 px, same math as THREE.PerspectiveCamera.lookAt */
const project = (P: Vec3, c: Cam): [number, number] => {
  const fw = norm(sub(c.target, c.pos)); const r = norm(cross(fw, [0, 1, 0])); const u = cross(r, fw);
  const d = sub(P, c.pos); const z = dot(d, fw); const t = Math.tan((c.fov * Math.PI) / 360);
  return [((dot(d, r) / (z * t * (1080 / 1920)) + 1) / 2) * 1080, ((1 - dot(d, u) / (z * t)) / 2) * 1920];
};

/* ---------- soft additive orange halo behind a group of tiles (the ONE glowing system: the two ends) ---------- */
const haloTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const cv = document.createElement("canvas"); cv.width = cv.height = 128;
    const g = cv.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,128,0,0.9)"); gr.addColorStop(0.45, "rgba(255,110,0,0.28)"); gr.addColorStop(1, "rgba(255,100,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(cv); return t;
  };
})();
const Halo: React.FC<{ x: number; w: number; k: number }> = ({ x, w, k }) => {
  const tex = useMemo(() => haloTex(), []);
  if (k <= 0) return null;
  return (
    <mesh position={[x, 0, -0.12]}>
      <planeGeometry args={[w * 1.9, 1.5]} />
      <meshBasicMaterial map={tex} transparent opacity={0.75 * k} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/* ---------- the address row: tiles drop in L→R, ends glow, middle dims behind the bracket sweep ---------- */
const sweepAt = (f: number) => interpolate(f, [SKIP, SKIP + 12], [0, 1], clamp); // 0..1 along the middle 32
const AddressRow: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sw = sweepAt(f);
  const startOn = f >= CUT, endOn = f >= END_ON;
  const kS = interpolate(f, [CUT, CUT + 8], [0, 1], clamp), kE = interpolate(f, [END_ON, END_ON + 8], [0, 1], clamp);
  return (
    <group>
      {REAL.split("").map((ch, i) => {
        const at = -4 + i * 1.05;                     // build front: frame 0 already mid-build
        const s = spring({ frame: f - at, fps, config: { damping: 16, stiffness: 150 } });
        if (f < at) return null;
        const mi = MIDDLE.indexOf(i);
        const dim = mi >= 0 && sw > 0 && mi / 31 <= sw;
        const glow = (startOn && START_IDX.includes(i)) || (endOn && END_IDX.includes(i));
        return (
          <group key={i} position={[0, 0.35 * (1 - s), 0]} scale={Math.max(0.001, 0.7 + 0.3 * s)}>
            <Tile ch={ch} position={[tileX(i), 0, 0]} glow={glow} dim={dim} />
          </group>
        );
      })}
      <Halo x={(tileX(0) + tileX(5)) / 2} w={tileX(5) - tileX(0) + 0.46} k={kS} />
      <Halo x={(tileX(38) + tileX(41)) / 2} w={tileX(41) - tileX(38) + 0.46} k={kE} />
    </group>
  );
};

/* ---------- 2D overlay: grey bracket under the middle 32 + callouts, all projected from 3D ---------- */
const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  if (f < CUT) return null;
  const c = cam(f);
  const yB = -0.42, yT = -0.3;
  const x0 = tileX(MIDDLE[0]) - 0.2, x1 = tileX(MIDDLE[31]) + 0.2;
  const sw = sweepAt(f);
  const a = project([x0, yT, 0], c), b = project([x0, yB, 0], c);
  const e = project([x0 + (x1 - x0) * sw, yB, 0], c), eT = project([x1, yT, 0], c), eB = project([x1, yB, 0], c);
  const mid = project([(x0 + x1) / 2, yB, 0], c);
  const sTop = project([(tileX(0) + tileX(5)) / 2, 0.3, 0], c);
  const eTop = project([(tileX(38) + tileX(41)) / 2, 0.3, 0], c);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {sw > 0 && (
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          <g stroke="rgba(214,216,220,0.78)" strokeWidth={2} fill="none" strokeLinecap="round">
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            <line x1={b[0]} y1={b[1]} x2={e[0]} y2={e[1]} />
            {sw >= 1 && <line x1={eB[0]} y1={eB[1]} x2={eT[0]} y2={eT[1]} />}
          </g>
        </svg>
      )}
      <Callout text="Start" at={[sTop[0], sTop[1]]} label={[sTop[0] + 30, sTop[1] - 120]} startFrame={51} />
      <Callout text="End" at={[eTop[0], eTop[1]]} label={[eTop[0] - 30, eTop[1] - 120]} startFrame={END_ON} />
      <Callout text="" at={[mid[0], mid[1]]} label={[mid[0], mid[1] + 110]} startFrame={MID} />
      <div style={{ position: "absolute", left: mid[0], top: mid[1] + 122, transform: "translateX(-50%)", fontFamily: brand.body, fontWeight: 700, fontSize: 24,
        letterSpacing: 24 * 0.12, textTransform: "uppercase", color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap",
        opacity: interpolate(f - MID, [4, 12], [0, 1], clamp) }}>Middle</div>
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const c = cam(f);
  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" floor={false} shadows={false} camera={{ from: c.pos, to: c.pos, target: c.target, fov: c.fov }}>
        <AddressRow />
      </Studio3D>
      <Overlay />
      <Disclaimer text="Magnified illustration · addresses are made up" />
    </Shell>
  );
};

export default Scene;
