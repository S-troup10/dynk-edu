// Scene: 2026-11-09-bybit-every-signature-real S10 — "And if it says unlimited, or you can't tell what it does, don't sign."
//  A1 f0–24   2D approval panel, camera sliding down            ("And if it says")
//  A2 f24–46  2D macro on `Amount: UNLIMITED`, UNLIMITED orange  ("unlimited,")
//  B1 f46–68  2D blurred grey HEX blob sliding, `?` callout      ("or you can't tell")
//  B2 f68–92  push-in on the blob                                ("what it does,")
//  C  f92–end 3D SignCard "Sign", card dims + chrome Padlock thuds onto it ("don't sign.")
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Padlock, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { ORANGE, HEX, SignCard, CamRig, project, Sfx, W, clamp, type Shot } from "./_shared";

const MONO = "'DejaVu Sans Mono', monospace";
const out = Easing.out(Easing.cubic);

/* ---------- 2D camera (focus point + zoom + roll), never at rest ---------- */
type Cam = { cx: number; cy: number; s: number; r: number };
type Cam2 = { a: Cam; b: Cam; len: number };
const camAt = (sh: Cam2, f: number): Cam => {
  const p = interpolate(f, [0, sh.len], [0, 1], clamp);
  const q = p * 0.7 + out(p) * 0.3;
  const m = (k: keyof Cam) => sh.a[k] + (sh.b[k] - sh.a[k]) * q;
  return { cx: m("cx"), cy: m("cy"), s: m("s"), r: m("r") };
};
const toScreen = (c: Cam, x: number, y: number): [number, number] => [(x - c.cx) * c.s + 540, (y - c.cy) * c.s + 940];

const Stage: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(900px 1100px at 50% 52%, #1a1c20 0%, #0e0f11 70%)" }} />
    <AbsoluteFill style={{
      WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, transparent 372px, #000 440px, #000 1400px, transparent 1462px)",
      maskImage: "linear-gradient(to bottom, transparent 0px, transparent 372px, #000 440px, #000 1400px, transparent 1462px)",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0",
        transform: `translate(540px, 940px) rotate(${cam.r}deg) scale(${cam.s}) translate(${-cam.cx}px, ${-cam.cy}px)` }}>
        {children}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ---------- A: approval panel (design px) ---------- */
const PANEL = { x: 110, y: 560, w: 860, h: 700 };
const Row: React.FC<{ y: number; label: string; value: string; hot?: boolean; hotOp?: number; hotScale?: number }> = ({ y, label, value, hot, hotOp = 1, hotScale = 1 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, height: 130, borderRadius: 22, background: "#131417",
    border: `${hot ? 2.5 : 1.5}px solid ${hot ? ORANGE : "rgba(255,255,255,0.12)"}`,
    boxShadow: hot ? `0 0 ${40 * hotOp}px rgba(255,128,0,${0.5 * hotOp})` : "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px" }}>
    <span style={{ fontFamily: brand.body, fontWeight: 500, fontSize: 36, color: "rgba(255,255,255,0.5)" }}>{label}</span>
    <span style={{ fontFamily: brand.body, fontWeight: hot ? 800 : 600, fontSize: hot ? 66 : 38, letterSpacing: hot ? 2 : 0, color: hot ? ORANGE : "#f2f2f2",
      opacity: hot ? hotOp : 1, transform: `scale(${hotScale})`, transformOrigin: "right center" }}>{value}</span>
  </div>
);
const Panel: React.FC<{ f: number; hotAt: number }> = ({ f, hotAt }) => {
  const t = interpolate(f, [hotAt, hotAt + 5], [0, 1], { ...clamp, easing: out });
  return (
    <div style={{ position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, borderRadius: 34, background: "#0b0c0e",
      border: "1.5px solid rgba(255,255,255,0.11)", boxShadow: "0 40px 120px rgba(0,0,0,0.65)" }}>
      <div style={{ position: "absolute", left: 40, top: 40, fontFamily: brand.body, fontWeight: 800, fontSize: 52, color: "#fff", letterSpacing: -0.5 }}>Approve token spending</div>
      <div style={{ position: "absolute", left: 40, top: 112, fontFamily: brand.body, fontWeight: 400, fontSize: 28, color: "rgba(255,255,255,0.45)" }}>Permit · 1 signature</div>
      <Row y={190} label="Spender" value="0x9f…e2 (unknown)" />
      <Row y={350} label="Token" value="USDC-like" />
      <Row y={510} label="Amount" value={t > 0 ? "UNLIMITED" : "1,000"} hot={t > 0} hotOp={t} hotScale={0.9 + 0.1 * t} />
    </div>
  );
};
const AMT_Y = PANEL.y + 510 + 65; // centre of Amount row

const A1: Cam2 = { len: 24, a: { cx: 540, cy: 700, s: 1.05, r: -1.2 }, b: { cx: 540, cy: 900, s: 1.12, r: 0 } };
const A2: Cam2 = { len: 22, a: { cx: 420, cy: AMT_Y - 30, s: 1.2, r: 1.0 }, b: { cx: 640, cy: AMT_Y, s: 1.45, r: 0 } };

const ShotA: React.FC<{ sh: Cam2; from: number; hotAt: number; callout?: boolean }> = ({ sh, from, hotAt, callout }) => {
  const lf = useCurrentFrame();
  const c = camAt(sh, lf);
  const [x, y] = toScreen(c, 840, AMT_Y);
  return (
    <AbsoluteFill>
      <Stage cam={c}><Panel f={from + lf} hotAt={hotAt} /></Stage>
      {callout && <Callout text="NO LIMIT" at={[Math.min(x, 960), y + 42]} label={[760, Math.min(y + 260, 1300)]} startFrame={8} accent />}
    </AbsoluteFill>
  );
};

/* ---------- B: blurred calldata blob ---------- */
const HEXL = HEX.slice(2);
const hexLine = (i: number) => {
  const n = 28;
  const s = (HEXL + HEXL + HEXL).slice((i * 17) % HEXL.length, (i * 17) % HEXL.length + n);
  return (i % 5 === 0 ? "0x" : "") + s;
};
const HexBlob: React.FC<{ blur: number }> = ({ blur }) => (
  <div style={{ position: "absolute", left: 90, top: 440, width: 900, height: 1020, overflow: "hidden", filter: `blur(${blur}px)` }}>
    {Array.from({ length: 26 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 0, top: i * 40, whiteSpace: "nowrap", fontFamily: MONO, fontWeight: 700, fontSize: 34,
        color: i % 7 === 3 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.28)", letterSpacing: 1 }}>{hexLine(i)}</div>
    ))}
  </div>
);
const B1: Cam2 = { len: 22, a: { cx: 430, cy: 760, s: 1.25, r: -1.5 }, b: { cx: 600, cy: 1000, s: 1.2, r: 0 } };
const B2: Cam2 = { len: 24, a: { cx: 620, cy: 1000, s: 1.0, r: 0.8 }, b: { cx: 520, cy: 950, s: 1.4, r: 0 } };
const ShotB: React.FC<{ sh: Cam2; blur: number; q: boolean }> = ({ sh, blur, q }) => {
  const lf = useCurrentFrame();
  const c = camAt(sh, lf);
  return (
    <AbsoluteFill>
      <Stage cam={c}><HexBlob blur={blur} /></Stage>
      {q && <Callout text="?" at={[540, 960]} label={[540, 700]} startFrame={4} accent size={72} />}
    </AbsoluteFill>
  );
};

/* ---------- C: 3D sign card + padlock ---------- */
const LAND = 104; // "sign." (scene frame)
const SHOT_C: Shot = { from: [1.8, 2.3, 10.4], to: [0.3, 1.9, 8.8], tFrom: [0.1, 1.3, 0], tTo: [0, 1.25, 0], fov: 32, len: 29 };
const ShotC: React.FC<{ from: number }> = ({ from }) => {
  const lf = useCurrentFrame();
  const f = from + lf;
  const dim = f >= LAND;
  const drop = interpolate(f, [LAND - 9, LAND], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const bounce = f > LAND ? Math.max(0, 0.06 * Math.sin((f - LAND) * 1.1) * Math.exp(-(f - LAND) * 0.3)) : 0;
  const lockY = 0.95 + drop * 3.2 + bounce;
  const lockVisible = f >= LAND - 9;
  const [tx, ty] = project(SHOT_C, lf, [0.95, 1.95, 0.05]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: SHOT_C.from, target: SHOT_C.tFrom, fov: SHOT_C.fov }}>
        <CamRig shot={SHOT_C} />
        <SignCard position={[0, 1.25, 0]} rotation={[-0.06, -0.12, 0]} lines={[
          { text: "Permit", size: 70, weight: 800 },
          { text: "Spender: 0x9f…e2 (unknown)", size: 48 },
          { text: "Amount: Unlimited", size: 52, weight: 700, color: ORANGE },
        ]} button="Sign" dim={dim} />
        {lockVisible && <Padlock position={[0.1, lockY, 0.45]} scale={0.62} />}
      </Studio3D>
      <Callout text="DON'T SIGN" at={[tx, ty]} label={[Math.min(880, tx + 40), Math.max(500, ty - 130)]} startFrame={LAND - from + 2} size={28} accent />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 121;
  const cutA2 = W(props, "unlimited", 0, 0.809);
  const cutB1 = W(props, "or", 0, 1.529) - 0;
  const cutB2 = cutB1 + 22;
  const cutC = W(props, "don't", 0, 3.074);
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutA2} layout="none"><ShotA sh={{ ...A1, len: cutA2 }} from={0} hotAt={9999} /></Sequence>
      <Sequence from={cutA2} durationInFrames={cutB1 - cutA2} layout="none"><ShotA sh={{ ...A2, len: cutB1 - cutA2 }} from={cutA2} hotAt={cutA2 + 1} callout /></Sequence>
      <Sequence from={cutB1} durationInFrames={cutB2 - cutB1} layout="none"><ShotB sh={B1} blur={7} q /></Sequence>
      <Sequence from={cutB2} durationInFrames={cutC - cutB2} layout="none"><ShotB sh={{ ...B2, len: cutC - cutB2 }} blur={6} q={false} /></Sequence>
      <Sequence from={cutC} durationInFrames={total - cutC} layout="none"><ShotC from={cutC} /></Sequence>

      <Disclaimer text="Illustration · simplified" />

      <Sfx name="whoosh_soft" at={cutA2} volume={0.3} />
      <Sfx name="tick" at={cutA2 + 2} volume={0.25} />
      <Sfx name="whoosh_soft" at={cutB1} volume={0.3} />
      <Sfx name="whoosh_soft" at={cutB2} volume={0.25} />
      <Sfx name="whoosh_soft" at={cutC} volume={0.3} />
      <Sfx name="thud" at={LAND} volume={0.5} />
    </Shell>
  );
};

export default Scene;
