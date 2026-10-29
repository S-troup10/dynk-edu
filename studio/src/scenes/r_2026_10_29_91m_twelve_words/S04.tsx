// Scene: 2026-10-29-91m-twelve-words S04 — "Abandon, to zoo. Pick twelve, and you get this many combinations."
// Four hard-cut shots:
//  (1) f0–23   3D macro on tile "1 abandon" in the top-left corner of the 64×32 word wall   · WORD #1
//  (2) f23–48  3D macro on "2048 zoo" in the bottom-right corner                              · WORD #2,048
//  (3) f48–75  3D: twelve orange tiles pop forward out of the wall (2-frame stagger), camera pulls back
//  (4) f75–140 2D: the 39-digit 2^128 builds group by group in chrome Orbitron; last group lands orange on "combinations"
// Orange = the words you're looking at (1–3) / the final group (4). One glowing system per shot.
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, chromeFill, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { BIG, CamRig, ORANGE, Sfx, W, WordTile, project, clamp, type Shot, type Vec3 } from "./_shared";
import { BIP39 } from "./bip39";

const out = Easing.out(Easing.cubic);

/* ---------- the wall: 64 cols × 32 rows, row-major BIP-39 order; world coords below are for the full wall ---------- */
const GX = 1.75, GY = 0.62, BASE = 1.0, ROWS = 32;
const wx = (c: number) => c * GX;
const wy = (r: number) => BASE + (ROWS - 1 - r) * GY;
const idxOf = (c: number, r: number) => r * 64 + c;

const WallPatch: React.FC<{ cols: [number, number]; rows: [number, number]; glow?: [number, number][]; pop?: { c: number; r: number; at: number }[]; f?: number }> = ({
  cols, rows, glow = [], pop = [], f = 0,
}) => {
  const tiles: React.ReactNode[] = [];
  for (let r = rows[0]; r <= rows[1]; r++) {
    for (let c = cols[0]; c <= cols[1]; c++) {
      const i = idxOf(c, r);
      const g = glow.some(([gc, gr]) => gc === c && gr === r);
      const p = pop.find((q) => q.c === c && q.r === r);
      let z = 0, sc = 1, on = g;
      if (p) {
        const t = interpolate(f, [p.at, p.at + 7], [0, 1], { ...clamp, easing: out });
        z = t * 2.6; sc = 1 + t * 0.3; on = f >= p.at;
      }
      tiles.push(<WordTile key={i} word={BIP39[i]} index={i + 1} position={[wx(c), wy(r), z]} glow={on} scale={sc} />);
    }
  }
  return <>{tiles}</>;
};

/* ---------- callout helper ---------- */
const Lbl: React.FC<{ text: string; shot: Shot; f: number; part: Vec3; dx?: number; dy: number; start: number }> = ({ text, shot, f, part, dx = 0, dy, start }) => {
  const at = project(shot, f, part);
  return <Callout text={text} at={at} label={[at[0] + dx, at[1] + dy]} startFrame={start} />;
};

/* dark scrim behind the caption band so wall text never fights the captions */
const CaptionScrim: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "linear-gradient(180deg, rgba(8,8,9,0.96) 0px, rgba(8,8,9,0.93) 330px, rgba(8,8,9,0.55) 420px, rgba(8,8,9,0) 520px)" }} />
);

/* ---------- Shot 1: top-left corner ---------- */
const T1: Vec3 = [wx(0), wy(0), 0];
const SHOT1: Shot = {
  from: [T1[0] + 1.3, T1[1] - 0.2, 9.6], to: [T1[0] - 0.5, T1[1] - 0.9, 6.4],
  tFrom: [T1[0] + 0.45, T1[1] - 0.5, 0], tTo: [T1[0] - 0.4, T1[1] - 0.85, 0], fov: 30, len: 23,
};
const ShotCornerTL: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" floor={false} shadows={false} camera={{ from: SHOT1.from, target: SHOT1.tFrom, fov: SHOT1.fov }}>
        <CamRig shot={SHOT1} />
        <WallPatch cols={[0, 4]} rows={[0, 5]} glow={[[0, 0]]} />
      </Studio3D>
      <CaptionScrim />
      <Lbl text="WORD #1" shot={SHOT1} f={f} part={[T1[0] + 0.2, T1[1] + 0.25, 0.05]} dx={-40} dy={-120} start={3} />
    </AbsoluteFill>
  );
};

/* ---------- Shot 2: bottom-right corner ---------- */
const T2: Vec3 = [wx(63), wy(31), 0];
const SHOT2: Shot = {
  from: [T2[0] - 1.2, T2[1] + 1.2, 9.2], to: [T2[0] + 0.6, T2[1] + 1.0, 6.5],
  tFrom: [T2[0] + 0.55, T2[1] + 0.45, 0], tTo: [T2[0] + 0.05, T2[1] + 0.3, 0], fov: 30, len: 25,
};
const ShotCornerBR: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" floor={false} shadows={false} camera={{ from: SHOT2.from, target: SHOT2.tFrom, fov: SHOT2.fov }}>
        <CamRig shot={SHOT2} />
        <WallPatch cols={[59, 63]} rows={[26, 31]} glow={[[63, 31]]} />
      </Studio3D>
      <CaptionScrim />
      <Lbl text="WORD #2,048" shot={SHOT2} f={f} part={[T2[0] + 0.8, T2[1], 0.05]} dx={110} dy={-90} start={3} />
    </AbsoluteFill>
  );
};

/* ---------- Shot 3: twelve tiles pop forward out of the wall ---------- */
const C0 = 20, R0 = 8;                  // patch origin inside the wall (any region will do: "pick any twelve")
const PC = 7, PR = 17;                  // patch size
const PICKS: [number, number][] = [[3, 8], [4, 5], [2, 11], [5, 8], [1, 7], [4, 12], [3, 3], [2, 6], [5, 13], [1, 10], [3, 14], [4, 9]];
const YC = wy(R0 + (PR - 1) / 2);
const XC = wx(C0 + (PC - 1) / 2);
const SHOT3: Shot = {
  from: [XC + 2.4, YC + 0.6, 10.5], to: [XC - 1.6, YC + 0.2, 20], tFrom: [XC, YC + 0.2, 0], tTo: [XC, YC, 0], fov: 30, len: 27,
};
const ShotPop: React.FC = () => {
  const f = useCurrentFrame();
  const pop = PICKS.map(([c, r], k) => ({ c: C0 + c, r: R0 + r, at: 1 + k * 2 }));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" floor={false} shadows={false} camera={{ from: SHOT3.from, target: SHOT3.tFrom, fov: SHOT3.fov }}>
        <CamRig shot={SHOT3} />
        <WallPatch cols={[C0, C0 + PC - 1]} rows={[R0, R0 + PR - 1]} pop={pop} f={f} />
      </Studio3D>
      <CaptionScrim />
    </AbsoluteFill>
  );
};

/* ---------- Shot 4: the 39-digit number ---------- */
const GROUPS = BIG.split(","); // 13 groups of 3 digits = 39 digits
const LINES: number[][] = [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]];
const DIGIT = 100;

const BigNumber: React.FC<{ landAt: number[] }> = ({ landAt }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {LINES.map((line, li) => (
        <div key={li} style={{ display: "flex", whiteSpace: "nowrap", fontFamily: brand.display, fontWeight: 800, fontSize: DIGIT, lineHeight: 1.05, letterSpacing: -2 }}>
          {line.map((gi) => {
            const age = f - landAt[gi];
            const p = interpolate(age, [0, 5], [0, 1], { ...clamp, easing: out });
            const last = gi === GROUPS.length - 1;
            const hot = interpolate(age, [0, 8], [1, 0], clamp);   // fresh group flares brighter, then settles to chrome
            const comma = !last;
            return (
              <span key={gi} style={{
                display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 34}px) scale(${1 + (1 - p) * 0.22})`, transformOrigin: "50% 60%",
                filter: `${last ? `drop-shadow(0 0 ${22 + hot * 30}px rgba(255,128,0,0.75))` : "drop-shadow(0 6px 18px rgba(0,0,0,0.6))"} brightness(${1 + hot * 0.9}) blur(${(1 - p) * 7}px)`,
              }}>
                <span style={{ ...chromeFill(last, "dark") }}>{GROUPS[gi]}</span>
                {comma && <span style={{ ...chromeFill(false, "dark"), opacity: 0.55 }}>,</span>}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ShotNumber: React.FC<{ landAt: number[]; lastAt: number }> = ({ landAt, lastAt }) => {
  const f = useCurrentFrame();   // shot-local
  const q = f / 65;
  // slow push-in + drift + a few degrees of perspective yaw: the camera is always travelling
  const sc = 0.97 + 0.1 * (q * 0.7 + out(q) * 0.3);
  const tx = interpolate(q, [0, 1], [-18, 16]);
  const ty = interpolate(q, [0, 1], [10, -14]);
  const ry = interpolate(q, [0, 1], [-5, 3]);
  const rz = interpolate(q, [0, 1], [-0.7, 0.5]);
  const labelOp = interpolate(f, [0, 6], [0, 1], clamp);
  const glow = interpolate(f, [lastAt, lastAt + 10], [0, 1], { ...clamp, easing: out });
  return (
    <AbsoluteFill style={{ background: "#060607" }}>
      {/* parallax backdrop: faint dot field drifting slower than the number */}
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.10) 1.5px, transparent 2px)", backgroundSize: "64px 64px",
        backgroundPosition: `${-tx * 0.6}px ${-ty * 0.6}px`, transform: `scale(${1 + q * 0.04})`,
        WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 50%, black 20%, transparent 80%)", maskImage: "radial-gradient(ellipse 70% 55% at 50% 50%, black 20%, transparent 80%)",
      }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 38% at 62% 62%, rgba(255,128,0,${0.2 * glow}) 0%, transparent 70%)` }} />
      <AbsoluteFill style={{ perspective: 1500, transform: `translate(${tx}px, ${ty}px)` }}>
        <AbsoluteFill style={{ transform: `scale(${sc}) rotateY(${ry}deg) rotateZ(${rz}deg)`, transformOrigin: "50% 50%" }}>
          <div style={{ position: "absolute", left: 96, top: 596, opacity: labelOp, fontFamily: brand.body, fontWeight: 600, fontSize: 28, letterSpacing: 7, color: "rgba(255,255,255,0.55)" }}>
            POSSIBLE 12-WORD PHRASES
          </div>
          <BigNumber landAt={landAt} />
          <Callout text="2¹²⁸" at={[900, 830]} label={[950, 1308]} startFrame={Math.max(0, lastAt - 22)} size={30} />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- scene ---------- */
const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 140;
  const cut2 = W(props, "to");                 // 23
  const cut3 = W(props, "pick");               // 48
  const cut4 = 75;                             // "and"
  const lastAt = W(props, "combinations");     // 110 (scene frame)
  // digit groups land left→right; the final group waits for "combinations"
  const landScene = GROUPS.map((_, k) => (k < GROUPS.length - 1 ? cut4 + 2 + Math.round(k * 2.7) : lastAt));
  const landLocal = landScene.map((x) => x - cut4);

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cut2} layout="none"><ShotCornerTL /></Sequence>
      <Sequence from={cut2} durationInFrames={cut3 - cut2} layout="none"><ShotCornerBR /></Sequence>
      <Sequence from={cut3} durationInFrames={cut4 - cut3} layout="none"><ShotPop /></Sequence>
      <Sequence from={cut4} durationInFrames={total - cut4} layout="none"><ShotNumber landAt={landLocal} lastAt={lastAt - cut4} /></Sequence>

      {/* disclaimers */}
      <Sequence from={0} durationInFrames={cut4} layout="none"><Disclaimer text="Illustration · BIP-39 word list" /></Sequence>
      <Sequence from={cut4} durationInFrames={total - cut4} layout="none"><Disclaimer text="2¹²⁸ — BIP-39, 128-bit entropy" /></Sequence>

      {/* sfx: never two on the same frame */}
      <Sfx name="tick" at={cut2} volume={0.28} />
      <Sfx name="click" at={cut3} volume={0.3} />
      <Sfx name="whoosh_soft" at={cut4} volume={0.3} />
      {landScene.slice(0, -1).map((fr, k) => (k % 2 === 0 ? <Sfx key={k} name="tick" at={fr} volume={0.2} /> : null))}
      <Sfx name="sub_drop" at={lastAt} volume={0.55} />
    </Shell>
  );
};

export default Scene;
