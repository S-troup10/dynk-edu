// Scene: 2026-10-29-91m-twelve-words S07 — "That's why real support will never ask for your twelve words."
// Shots (hard cuts): A f0–24 2D macro, chat bubble types itself out · B f24–46 2D, other angle, typing finishes ·
// C f46–62 2D, orange strike draws through the bubble on "never" + callout · D f62–84 3D, 12 orange tiles, chrome padlock
// lowers in front, camera rising · E f84–end 3D, closer, shackle closes on "words." (thud).
// Accent per shot: A/B the requested phrase, C the strike line, D/E the 12 tiles.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, Padlock, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { PhraseGrid, CamRig, project, W, Sfx, ORANGE, clamp, type Shot } from "./_shared";

const out = Easing.out(Easing.cubic);

/* ---------- 2D chat ---------- */
const TEXT_A = "To fix this, please enter your ";
const TEXT_B = "12-word recovery phrase.";
const FULL = TEXT_A.length + TEXT_B.length;
const BUBBLE = { x: 190, y: 780, w: 700 }; // unscaled layout, screen space of a 1080×1920 canvas
const STRIKE = { x0: 150, y0: 932, x1: 930, y1: 902 };

type Cam2D = { s: [number, number]; t: [[number, number], [number, number]]; r: [number, number]; len: number };
const cam2d = (c: Cam2D, f: number) => {
  const p = interpolate(f, [0, c.len], [0, 1], clamp);
  const q = p * 0.7 + out(p) * 0.3;
  const m = (a: number, b: number) => a + (b - a) * q;
  return { s: m(c.s[0], c.s[1]), tx: m(c.t[0][0], c.t[1][0]), ty: m(c.t[0][1], c.t[1][1]), r: m(c.r[0], c.r[1]) };
};
const ORIGIN: [number, number] = [540, 920];
/** layout point → screen px under camera `c` at local frame f (matches CSS transform: translate · rotate · scale about ORIGIN) */
const xf = (c: Cam2D, f: number, p: [number, number]): [number, number] => {
  const k = cam2d(c, f);
  const dx = (p[0] - ORIGIN[0]) * k.s, dy = (p[1] - ORIGIN[1]) * k.s;
  const a = (k.r * Math.PI) / 180;
  return [ORIGIN[0] + dx * Math.cos(a) - dy * Math.sin(a) + k.tx, ORIGIN[1] + dx * Math.sin(a) + dy * Math.cos(a) + k.ty];
};

const Chat: React.FC<{ n: number; strike: number; cam: Cam2D; f: number }> = ({ n, strike, cam, f }) => {
  const k = cam2d(cam, f);
  const dim = strike > 0.99 ? 0.42 : 1;
  const ch = (txt: string, off: number, accent: boolean) =>
    txt.split("").map((c, i) => (
      <span key={i} style={{ visibility: off + i < n ? "visible" : "hidden", color: accent ? ORANGE : "#f2f2f2" }}>{c}</span>
    ));
  const cursorAt = n < FULL ? n : -1;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${ORIGIN[0]}px ${ORIGIN[1]}px`,
        transform: `translate(${k.tx}px, ${k.ty}px) rotate(${k.r}deg) scale(${k.s})` }}>
        {/* chat header */}
        <div style={{ position: "absolute", left: BUBBLE.x - 40, top: 590, width: BUBBLE.w + 80, height: 120, borderRadius: 28, background: "#131417",
          border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", padding: "0 32px", fontFamily: brand.body }}>
          <div style={{ width: 68, height: 68, borderRadius: 34, background: "#2a2c31", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#8c8f96", fontWeight: 700, fontSize: 30 }}>S</div>
          <div style={{ marginLeft: 22 }}>
            <div style={{ color: "#f2f2f2", fontWeight: 600, fontSize: 36, lineHeight: 1.1 }}>Support</div>
            <div style={{ color: "#7b7e86", fontWeight: 400, fontSize: 24, marginTop: 4 }}>typing…</div>
          </div>
        </div>
        {/* bubble */}
        <div style={{ position: "absolute", left: BUBBLE.x, top: BUBBLE.y, width: BUBBLE.w, boxSizing: "border-box", padding: "46px 48px 52px",
          borderRadius: "36px 36px 36px 10px", background: "#1b1c20", border: "1px solid rgba(255,255,255,0.08)",
          fontFamily: brand.body, fontWeight: 500, fontSize: 56, lineHeight: 1.3, opacity: dim, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "relative" }}>
            {ch(TEXT_A, 0, false)}
            {ch(TEXT_B, TEXT_A.length, true)}
            {cursorAt >= 0 && (
              <span style={{ display: "inline-block", width: 0, height: 0 }} />
            )}
          </div>
        </div>
        <div style={{ position: "absolute", left: BUBBLE.x + 8, top: BUBBLE.y + 350, fontFamily: brand.body, fontSize: 22, color: "#6b6e75" }}>now</div>
        {/* strike line, orange, draws left → right */}
        {strike > 0 && (
          <div style={{ position: "absolute", left: STRIKE.x0, top: STRIKE.y0, width: Math.hypot(STRIKE.x1 - STRIKE.x0, STRIKE.y1 - STRIKE.y0) * strike, height: 14,
            borderRadius: 7, background: ORANGE, transformOrigin: "0 50%",
            transform: `rotate(${(Math.atan2(STRIKE.y1 - STRIKE.y0, STRIKE.x1 - STRIKE.x0) * 180) / Math.PI}deg)`,
            boxShadow: "0 0 24px rgba(255,128,0,0.85), 0 0 70px rgba(255,128,0,0.45)" }} />
        )}
      </div>
    </AbsoluteFill>
  );
};

const typed = (g: number) => Math.min(FULL, 7 + g * 1.3);

const CAM_A: Cam2D = { s: [1.42, 1.55], t: [[150, 150], [90, 110]], r: [-2, 0], len: 24 };
const CAM_B: Cam2D = { s: [1.55, 1.38], t: [[-10, -20], [30, 40]], r: [3, 1], len: 22 };
const CAM_C: Cam2D = { s: [1.0, 1.16], t: [[10, 30], [-10, 70]], r: [-1.5, -0.5], len: 16 };

const ShotA: React.FC = () => {
  const f = useCurrentFrame();
  return <Chat n={typed(f)} strike={0} cam={CAM_A} f={f} />;
};
const ShotB: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  return <Chat n={typed(f + at)} strike={0} cam={CAM_B} f={f} />;
};
const ShotC: React.FC<{ strikeAt: number }> = ({ strikeAt }) => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [strikeAt, strikeAt + 4], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const end = xf(CAM_C, f, [STRIKE.x1 - 30, STRIKE.y1 + 10]);
  return (
    <AbsoluteFill>
      <Chat n={FULL} strike={strike} cam={CAM_C} f={f} />
      <Callout text="REAL SUPPORT NEVER ASKS" at={end} label={[740, 1310]} startFrame={strikeAt + 2} accent />
    </AbsoluteFill>
  );
};

/* ---------- 3D ---------- */
const SHOT_D: Shot = { from: [-3.6, 3.6, 20], to: [1.8, 5.6, 17.2], tFrom: [0, 1.2, 0], tTo: [0, 1.6, 1], fov: 32, len: 22 };
const SHOT_E: Shot = { from: [3.4, 1.9, 12.8], to: [-0.8, 3.0, 11.8], tFrom: [0, 1.7, 2.4], tTo: [0, 1.9, 2.4], fov: 32, len: 27 };
const LOCK_Z = 2.4;

const ShotD: React.FC = () => {
  const f = useCurrentFrame();
  const drop = out(interpolate(f, [0, 16], [0, 1], clamp));
  const y = 1.25 + (1 - drop) * 5.5;
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: SHOT_D.from, target: SHOT_D.tFrom, fov: SHOT_D.fov }}>
        <CamRig shot={SHOT_D} />
        <PhraseGrid glow="all" />
        <Padlock position={[0, y, LOCK_Z]} open={1} scale={1.05} />
      </Studio3D>
    </AbsoluteFill>
  );
};
const ShotE: React.FC<{ closeFrom: number; closeTo: number }> = ({ closeFrom, closeTo }) => {
  const f = useCurrentFrame();
  const open = 1 - interpolate(f, [closeFrom, closeTo], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const settle = f > closeTo ? Math.sin((f - closeTo) / 1.8) * Math.exp(-(f - closeTo) / 4) * 0.04 : 0;
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: SHOT_E.from, target: SHOT_E.tFrom, fov: SHOT_E.fov }}>
        <CamRig shot={SHOT_E} />
        <PhraseGrid glow="all" />
        <Padlock position={[0, 1.25 - settle, LOCK_Z]} open={open} scale={1.05} />
      </Studio3D>
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 111;
  const fNever = W(props, "never", 0, 1.545);
  const fWords = W(props, "words", 0, 3.243);
  const fTwelve = W(props, "twelve", 0, 2.796);
  const fFor = W(props, "for", 0, 2.255);
  const cutB = 24, cutC = fNever, cutD = fFor - 6, cutE = fTwelve;
  const closeTo = fWords - cutE; // shackle shut as "words." starts
  const typeHits = Array.from({ length: 14 }, (_, i) => 1 + i * 3).filter((x) => x !== cutB);
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutB} layout="none"><ShotA /></Sequence>
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none"><ShotB at={cutB} /></Sequence>
      <Sequence from={cutC} durationInFrames={cutD - cutC} layout="none"><ShotC strikeAt={0} /></Sequence>
      <Sequence from={cutD} durationInFrames={cutE - cutD} layout="none"><ShotD /></Sequence>
      <Sequence from={cutE} durationInFrames={total - cutE} layout="none"><ShotE closeFrom={closeTo - 8} closeTo={closeTo} /></Sequence>
      {typeHits.map((x) => <Sfx key={x} name="type" at={x} volume={0.22} />)}
      <Sfx name="click" at={cutC} volume={0.3} />
      <Sfx name="whoosh_soft" at={cutD} volume={0.3} />
      <Sfx name="thud" at={fWords + 1} volume={0.45} />
      <Disclaimer text="Illustration" />
    </Shell>
  );
};

export default Scene;
