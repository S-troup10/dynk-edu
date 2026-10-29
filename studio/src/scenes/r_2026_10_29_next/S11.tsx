// Scene: 2026-10-29-next S11 — PROOF: "It was returned after a negotiation. That campaign had over eighty-two thousand lookalikes."
// 0–2.49 s: B&W Chainalysis plate (returned … May 9th), slow push + grey return arc (NOT orange) + callout.
// 2.49 s: hard cut to 3D — a grey wall of short tile-row fragments receding into fog; orange 82,031 counts up
//         from "campaign" and lands on "lookalikes". The counter is the ONE orange thing.
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Shell, Studio3D, Enter, Callout, Disclaimer, asset, chromeFill, type SceneProps } from "../../kit";
import { PROOF, TileRow } from "./_shared";
import { brand } from "../../brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
type V3 = [number, number, number];

const wordAt = (props: SceneProps, w: string, fallback: number) => {
  const hit = props.vo?.words?.find((x) => x.text.toLowerCase().replace(/[^a-z-]/g, "") === w);
  return hit ? hit.start : fallback;
};

/* ---------------- Plate: B&W proof paragraph, slow push, grey return arc ---------------- */
const PLATE_W = 880;
const PLATE_H = Math.round((339 / 1170) * PLATE_W); // 278
const PLATE_X = 100;
const PLATE_Y = 800;
const imgPt = (x: number, y: number): [number, number] => [PLATE_X + (x / 1170) * PLATE_W, PLATE_Y + (y / 339) * PLATE_H];

const Plate: React.FC<{ returnedF: number }> = ({ returnedF }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const push = interpolate(f, [0, 2.5 * fps], [1.0, 1.06], clamp);
  const panX = interpolate(f, [0, 2.5 * fps], [18, -10], clamp);
  const panY = interpolate(f, [0, 2.5 * fps], [10, -14], clamp);
  const inS = spring({ frame: f + 6, fps, config: { damping: 22, stiffness: 120 } }); // already mid-settle on frame 0
  // return arc: drawn right → left on "returned"
  const draw = easeIO(interpolate(f, [returnedF, returnedF + 16], [0, 1], clamp));
  const [ax, ay] = imgPt(1100, 20);
  const [bx, by] = imgPt(110, 168); // lands at "May 9th"
  const path = `M ${ax} ${ay} C ${ax - 120} ${ay - 230}, ${bx + 260} ${by - 380}, ${bx} ${by - 30}`;
  const len = 1500;
  const [mx, my] = imgPt(130, 168);
  // arrow head at the end of the path (pointing down-left)
  const head = draw > 0.97 ? 1 : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${panX}px, ${panY}px) scale(${push})`, transformOrigin: "540px 940px" }}>
      <div style={{ position: "absolute", left: PLATE_X - 28, top: PLATE_Y - 34, width: PLATE_W + 56, height: PLATE_H + 68, borderRadius: 18,
        background: "#ECECEC", boxShadow: "0 30px 80px rgba(0,0,0,0.65)", opacity: inS, transform: `translateY(${(1 - inS) * 30}px)` }} />
      <Img src={asset(PROOF.returned)} style={{ position: "absolute", left: PLATE_X, top: PLATE_Y, width: PLATE_W, height: PLATE_H,
        filter: "grayscale(1) contrast(1.08) brightness(0.96)", opacity: inS, transform: `translateY(${(1 - inS) * 30}px)` }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path d={path} fill="none" stroke="#8C8C8C" strokeWidth={3} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        <circle cx={ax} cy={ay} r={5} fill="#8C8C8C" opacity={draw > 0 ? 1 : 0} />
        <path d={`M ${bx - 13} ${by - 46} L ${bx} ${by - 26} L ${bx + 15} ${by - 44}`} fill="none" stroke="#8C8C8C" strokeWidth={3}
          strokeLinecap="round" strokeLinejoin="round" opacity={head} />
        {/* soft grey ring on "May 9th" */}
        <rect x={mx - 62} y={my - 26} width={150} height={52} rx={10} fill="none" stroke="#6E6E6E" strokeWidth={2}
          opacity={interpolate(f, [returnedF + 12, returnedF + 20], [0, 1], clamp)} />
      </svg>
      <Callout text="RETURNED · 9 MAY 2024" at={[mx + 13, my + 27]} label={[mx + 200, 1190]} startFrame={returnedF + 2} />
    </AbsoluteFill>
  );
};

/* ---------------- 3D: piecewise camera (dolly back, then drift up) ---------------- */
const Cam: React.FC<{ keys: { f: number; pos: V3; tgt: V3 }[]; fov: number }> = ({ keys, fov }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  let i = 0;
  while (i < keys.length - 2 && frame > keys[i + 1].f) i++;
  const a = keys[i], b = keys[i + 1];
  const p = easeIO(interpolate(frame, [a.f, b.f], [0, 1], clamp));
  const lerp = (u: V3, v: V3): V3 => [u[0] + (v[0] - u[0]) * p, u[1] + (v[1] - u[1]) * p, u[2] + (v[2] - u[2]) * p];
  const pos = lerp(a.pos, b.pos), tgt = lerp(a.tgt, b.tgt);
  React.useLayoutEffect(() => {
    camera.position.set(pos[0], pos[1], pos[2]);
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(tgt[0], tgt[1], tgt[2]);
  });
  return null;
};

// Made-up 12-character address fragments (never real). Each row = a different seeded lookalike.
const FRAGS = [
  "0x7A3fe05B71", "0x9c4E1d8A2f", "0x3B7a0F6c95", "0xD12e8b4C07",
  "0x5f0A93cE6d", "0xA8d24F1b3C", "0x61Ce7a0D4b", "0xE40b9C2a8F",
];
// Bleachers: each row further back and higher, alternating x so the wall reads as many, not a grid.
const ROWS: { pos: V3; frag: string }[] = FRAGS.map((frag, i) => ({
  frag,
  pos: [(i % 2 ? 0.23 : -0.23) + (i % 3) * 0.15, 0.27 + i * 0.24, -i * 1.6],
}));

const Wall: React.FC<{ campaignF: number; landF: number }> = ({ campaignF, landF }) => {
  // rows rise in one after another as the count climbs (front row already there on the cut)
  const span = Math.max(1, landF - campaignF);
  return (
    <>
      {ROWS.map((r, i) => (
        <Enter key={i} at={i < 3 ? -8 - i * 3 : Math.round(campaignF + ((i - 3) / (ROWS.length - 3)) * span)} position={r.pos} from={[0, -0.5, 0]} float={0.02}>
          <TileRow chars={r.frag} position={[0, 0, 0]} />
        </Enter>
      ))}
    </>
  );
};

const CountNumber: React.FC<{ startF: number; landF: number }> = ({ startF, landF }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(f, [startF, landF], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - p, 2.2);
  const v = Math.round(82031 * eased);
  const s = spring({ frame: f - startF, fps, config: { damping: 20, stiffness: 120 } });
  const land = spring({ frame: f - landF, fps, config: { damping: 14, stiffness: 140 } });
  const sweep = interpolate(f - landF, [0, 26], [-30, 130], clamp);
  if (f < startF - 1) return null;
  return (
    <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center", opacity: s,
      transform: `translateY(${(1 - s) * 30}px) scale(${0.97 + 0.03 * land})` }}>
      <div style={{ display: "inline-block", position: "relative" }}>
        <span style={{ fontFamily: brand.display, fontWeight: 800, fontSize: 170, letterSpacing: -2, lineHeight: 1,
          fontVariantNumeric: "tabular-nums", ...chromeFill(true), filter: `drop-shadow(0 0 ${18 * land}px rgba(255,128,0,0.45)) drop-shadow(0 10px 30px rgba(0,0,0,0.6))` }}>
          {v.toLocaleString("en-US")}
        </span>
        <span style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,0.5) ${sweep}%, transparent ${sweep + 12}%)`,
          mixBlendMode: "overlay", pointerEvents: "none" }} />
      </div>
    </div>
  );
};

const Lookalikes: React.FC<{ campaignF: number; landF: number }> = ({ campaignF, landF }) => {
  const { fps } = useVideoConfig();
  const keys = [
    { f: 0, pos: [0.3, 2.0, 6.2] as V3, tgt: [0, 1.2, -3] as V3 },
    { f: Math.round(1.55 * fps), pos: [0.15, 2.5, 8.8] as V3, tgt: [0, 1.1, -3] as V3 },
    { f: Math.round(3.75 * fps), pos: [-0.2, 3.1, 10.2] as V3, tgt: [0, 0.98, -3] as V3 },
  ];
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: [0, 1.6, 5], target: [0, 1.5, -2], fov: 32 }}>
        <Cam keys={keys} fov={32} />
        <group scale={0.55}>
          <Wall campaignF={campaignF} landF={landF} />
        </group>
      </Studio3D>
      <CountNumber startF={campaignF} landF={landF} />
      <Callout text="ONE CAMPAIGN" at={[600, 900]} label={[540, 800]} startFrame={campaignF} />
      <Disclaimer text="Values illustrative · addresses are made up" y={1482} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();
  const cut = Math.round(wordAt(props, "that", 2.487) * fps);
  const returnedF = Math.round(wordAt(props, "returned", 0.332) * fps);
  const campaignF = Math.round(wordAt(props, "campaign", 2.64) * fps) - cut;
  const landF = Math.round(wordAt(props, "lookalikes", 4.719) * fps) - cut;
  return (
    <Shell props={props} tone="dark">
      <Sequence durationInFrames={cut}>
        <Plate returnedF={returnedF} />
      </Sequence>
      <Sequence from={cut} durationInFrames={durationInFrames - cut}>
        <Lookalikes campaignF={campaignF} landF={landF} />
      </Sequence>
    </Shell>
  );
};

export default Scene;
