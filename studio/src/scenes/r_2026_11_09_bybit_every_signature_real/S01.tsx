// Scene: 2026-11-09-bybit-every-signature-real S01 — HOOK (v2, ink & signatures).
// "The biggest crypto theft ever. $1.5 billion. And every signature was real."
// Five hard cuts, each one smooth eased move: (1) pen lays a glowing ink stroke (cover frame is mid-stroke)
// (2) vault door, three keyholes light + click (3) "$1.5B" handwritten in ink (2D) (4) three sign cards, dolly
// (5) a signature writes itself on the front card. Orange = ink in every shot.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import {
  CamRig, Cam2D, InkStroke, InkPath2D, Pen, VaultDoor, SignCard, Sfx, W, project, clamp, ORANGE, SAW, SIG_POINTS,
  type Shot, type Vec3,
} from "./_shared";

const camEase = Easing.bezier(0.33, 0.12, 0.25, 1);

/* ---------- shot 1: pen path (XZ plane on the glass floor) ---------- */
const PEN_PTS: Vec3[] = [[-2.6, 0.05, 0.35], [-1.7, 0.05, -0.1], [-0.8, 0.05, 0.4], [0.1, 0.05, 0.0], [1.0, 0.05, 0.45], [1.9, 0.05, -0.05], [2.7, 0.05, 0.25]];
const penCurve = new THREE.CatmullRomCurve3(PEN_PTS.map((p) => new THREE.Vector3(...p)));

const ShotPen: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const q = camEase(interpolate(f, [0, len], [0, 1], clamp));
  const p = 0.16 + 0.84 * q;
  const nib = penCurve.getPointAt(p);
  const shot: Shot = { from: [-2.9, 0.75, 3.7], to: [2.2, 0.7, 3.5], tFrom: [-2.55, 0.3, 0.3], tTo: [2.5, 0.3, 0.3], fov: 34, len };
  return (
    <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <InkStroke points={PEN_PTS} progress={p} radius={0.055} />
      <Pen position={[nib.x, 0.02, nib.z]} rotation={[0.38, 0, 0.72]} scale={1.15} />
    </Studio3D>
  );
};

/* ---------- shot 2: vault, keys turn ---------- */
const ShotVault: React.FC<{ len: number; keyAt: number[] }> = ({ len, keyAt }) => {
  const f = useCurrentFrame();
  const shot: Shot = { from: [0, 1.7, 10.2], to: [0, 1.5, 7.2], tFrom: [0, 1.0, 0], tTo: [0, 0.95, 0], fov: 30, len };
  const keys = keyAt.reduce((s, a) => s + interpolate(f, [a, a + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }), 0);
  return (
    <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <VaultDoor position={[0, 1.65, 0]} keys={keys} />
    </Studio3D>
  );
};

/* ---------- shot 3: "$1.5B" handwritten, 2D ---------- */
// viewBox 0 0 580 290 — bold, slightly slanted hand: $ 1 . 5 B
const GLYPHS: { d: string[]; w: number }[] = [
  { d: ["M92 84 C 74 38, 16 46, 20 90 C 24 134, 90 126, 90 178 C 90 228, 24 230, 6 188", "M54 18 C 53 90, 51 180, 50 266"], w: 1 },
  { d: ["M132 100 C 158 86, 178 62, 194 36 C 192 110, 188 190, 184 262"], w: 1 },
  { d: ["M232 250 C 236 246, 244 248, 242 258 C 238 266, 230 262, 232 250"], w: 0.4 },
  { d: ["M368 44 C 340 50, 314 48, 292 46 C 290 80, 286 106, 282 130 C 312 108, 360 118, 366 168 C 372 222, 318 266, 268 234"], w: 1 },
  { d: ["M424 38 C 422 110, 420 190, 416 262", "M426 44 C 488 26, 548 46, 534 102 C 526 134, 474 142, 424 144 C 494 136, 574 152, 566 206 C 558 258, 482 268, 416 258"], w: 1.3 },
];
const ShotInk: React.FC<{ len: number; written: number }> = ({ len, written }) => {
  const f = useCurrentFrame();
  const start = 2, dur = 25;
  const t = (f - start) / dur; // 0..1 over all glyphs
  const wts = GLYPHS.map((g) => g.w);
  const tot = wts.reduce((a, b) => a + b, 0);
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #121316 0%, #050506 75%)" }}>
      <Cam2D shot={{ from: { s: 1.0, y: 10 }, to: { s: 1.09, y: -6 }, len }}>
        <div style={{ position: "absolute", left: 210, top: 740, width: 660, height: 330 }}>
          {GLYPHS.map((g, i) => {
            const a = acc / tot; acc += g.w; const b = acc / tot;
            const pr = interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
            return <InkPath2D key={i} d={g.d} progress={pr} width={22} viewBox="0 0 580 290" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1130, textAlign: "center", fontFamily: brand.body, fontWeight: 600, fontSize: 26,
          letterSpacing: 5, color: "rgba(255,255,255,0.5)", opacity: interpolate(f, [written - 6, written + 4], [0, 1], clamp), fontVariantNumeric: "tabular-nums" }}>
          401,347 ETH · 21 FEB 2025
        </div>
      </Cam2D>
    </AbsoluteFill>
  );
};

/* ---------- shots 4 + 5: three sign cards ---------- */
const CARD_X = [-3.3, 0, 3.3];
const cardLines = (n: number) => [
  { text: "Approve request", size: 56, weight: 700 },
  { text: `Signer ${n} of 3 · ${SAW[0]}`, size: 34, color: "#8a8a8a", weight: 500 },
  { text: "", size: 110 },
  { text: "x " + "_".repeat(38), size: 44, color: "#6a6a6a", weight: 500 },
];
const SIG_POS: Vec3 = [-0.1, -0.02, 0.07];
const Cards: React.FC<{ sig?: number }> = ({ sig = 0 }) => (
  <>
    {CARD_X.map((x, i) => (
      <group key={i}>
        <SignCard lines={cardLines(i + 1)} position={[x, 0.78, 0]} rotation={[0, i === 2 ? -0.12 : 0.1, 0]} dim={i < 2} />
      </group>
    ))}
    {sig > 0 && (
      <group position={[CARD_X[2], 0.78, 0]} rotation={[0, -0.12, 0]}>
        <group position={SIG_POS} scale={0.52}>
          <InkStroke points={SIG_POINTS} progress={sig} radius={0.045} />
        </group>
      </group>
    )}
  </>
);

const ShotCards: React.FC<{ len: number }> = ({ len }) => {
  const shot: Shot = { from: [-4.4, 1.0, 8.2], to: [3.7, 1.0, 7.6], tFrom: [-3.5, 0.8, 0], tTo: [3.3, 0.8, 0], fov: 36, len };
  return (
    <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <Cards />
    </Studio3D>
  );
};
const ShotSign: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const shot: Shot = { from: [2.3, 0.85, 7.2], to: [3.2, 0.9, 6.5], tFrom: [3.2, 0.8, 0], tTo: [3.3, 0.78, 0], fov: 36, len };
  const sig = interpolate(f, [1, 24], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const end = project(shot, f, [CARD_X[2] + 0.45, 0.78 - 0.05, 0.1]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Cards sig={sig} />
      </Studio3D>
      <Callout text="SIGNED" at={end} label={[end[0] + 40, end[1] + 190]} startFrame={14} accent />
    </AbsoluteFill>
  );
};

/* ---------- big text hook f0–40 ---------- */
const BigText: React.FC = () => {
  const f = useCurrentFrame();
  const e = (a: number) => Easing.out(Easing.cubic)(interpolate(f, [a, a + 7], [0, 1], clamp));
  const row = (a: number, color: string, text: string) => (
    <div style={{ opacity: e(a), transform: `translateY(${(1 - e(a)) * 22}px)`, color, textShadow: color === ORANGE ? "0 0 28px rgba(255,128,0,0.45)" : "none" }}>{text}</div>
  );
  return (
    <div style={{ position: "absolute", left: 90, top: 1130, fontFamily: brand.body, fontWeight: 800, fontSize: 84, lineHeight: 1.08, letterSpacing: -1 }}>
      {row(0, "#ffffff", "$1.5 BILLION.")}
      {row(10, ORANGE, "EVERY SIGNATURE")}
      {row(13, ORANGE, "REAL.")}
    </div>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 167;
  const c2 = 22, c3 = 52, c4 = 112, c5 = W(props, "signature", 0, 4.485); // 135
  const keyAt = [4, 11, 18];
  const written = c3 + 2 + 25;
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c2} layout="none"><ShotPen len={c2} /></Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="none"><ShotVault len={c3 - c2} keyAt={keyAt} /></Sequence>
      <Sequence from={c3} durationInFrames={c4 - c3} layout="none"><ShotInk len={c4 - c3} written={written - c3} /></Sequence>
      <Sequence from={c4} durationInFrames={c5 - c4} layout="none"><ShotCards len={c5 - c4} /></Sequence>
      <Sequence from={c5} durationInFrames={total - c5} layout="none"><ShotSign len={total - c5} /></Sequence>
      <Sequence from={0} durationInFrames={40} layout="none"><BigText /></Sequence>
      <Disclaimer text="Illustration · amount per FBI, 26 Feb 2025" />
      {keyAt.map((k) => <Sfx key={k} name="click" at={c2 + k + 2} volume={0.4} />)}
      <Sfx name="sub_drop" at={written} volume={0.55} />
      <Sfx name="thud" at={W(props, "real", 0, 5.265)} volume={0.4} />
    </Shell>
  );
};

export default Scene;
