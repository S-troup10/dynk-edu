// Scene: 2026-11-09-bybit-every-signature-real S09 — "It's why you check what your wallet says, not what the website says."
// 1a f0–30   3D hardware-wallet device on a plinth, orbiting in ("It's why you check")
// 1b f30–64  3D push-in on its glowing screen, callout YOUR WALLET ("what your wallet says,")
// 2a f64–86  2D browser page "Routine transfer ✓", camera sliding down ("not what the")
// 2b f86–112 2D push-in; orange strike line draws through it in 4 frames, callout WEBSITE ("website says.")
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { Shell, Studio3D, Plinth, Mat, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { SignCard, CamRig, project, Sfx, W, ORANGE, clamp, type Shot } from "./_shared";

/* ---------- 3D: the wallet device ---------- */
const Device: React.FC = () => (
  <group rotation={[-0.12, -0.12, 0]} position={[0, 1.3, 0]}>
    <RoundedBox args={[2.15, 1.75, 0.22]} radius={0.12} smoothness={3} position={[0, 0, -0.1]}>
      <Mat kind="graphite" />
    </RoundedBox>
    <SignCard
      glow
      scale={0.82}
      position={[0, 0, 0.03]}
      lines={[
        { text: "Your wallet shows", size: 44, color: "#9a9a9a", weight: 500 },
        { text: "delegatecall", size: 70, mono: true, color: ORANGE, weight: 700 },
        { text: "Change wallet logic", size: 68, color: ORANGE, weight: 800 },
        { text: "Control → attacker contract", size: 40, color: "#cfcfcf", weight: 500 },
      ]}
    />
  </group>
);

const SHOT_A: Shot = { from: [-3.6, 1.7, 7.8], to: [-2.0, 1.55, 6.5], tFrom: [0, 1.15, 0], tTo: [0, 1.25, 0], fov: 32, len: 30 };
const SHOT_B: Shot = { from: [2.8, 1.6, 8.2], to: [0.9, 1.45, 6.6], tFrom: [0, 1.25, 0], tTo: [0, 1.25, 0], fov: 32, len: 34 };

const DeviceShot: React.FC<{ shot: Shot; callout?: boolean }> = ({ shot, callout }) => {
  const lf = useCurrentFrame();
  const [px, py] = project(shot, lf, [0.95, 1.95, 0.1]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, to: shot.to, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Plinth position={[0, 0, 0]} radius={1.7} height={0.5} mat="graphite" />
        <Device />
      </Studio3D>
      {callout && <Callout text="YOUR WALLET" at={[px - 30, py + 30]} label={[Math.min(px + 60, 800), Math.max(py - 130, 450)]} startFrame={0} />}
    </AbsoluteFill>
  );
};

/* ---------- 2D: the website ---------- */
const WIN = { x: 90, y: 410, w: 900, h: 1040 };
const TXT_Y = 860; // centre line of "Routine transfer ✓" in canvas px
const STRIKE_AT = 86;
type Cam = { cx: number; cy: number; s: number; r: number };
type Cam2 = { a: Cam; b: Cam; len: number };
const camAt = (sh: Cam2, f: number): Cam => {
  const p = interpolate(f, [0, sh.len], [0, 1], clamp);
  const q = p * 0.7 + Easing.out(Easing.cubic)(p) * 0.3;
  const m = (k: keyof Cam) => sh.a[k] + (sh.b[k] - sh.a[k]) * q;
  return { cx: m("cx"), cy: m("cy"), s: m("s"), r: m("r") };
};
const toScreen = (c: Cam, x: number, y: number): [number, number] => [(x - c.cx) * c.s + 540, (y - c.cy) * c.s + 940];
const SHOT_C: Cam2 = { len: 21, a: { cx: 500, cy: 640, s: 1.3, r: -1.2 }, b: { cx: 540, cy: 780, s: 1.15, r: 0 } };
const SHOT_D: Cam2 = { len: 26, a: { cx: 540, cy: 800, s: 1.15, r: 0.4 }, b: { cx: 540, cy: 880, s: 1.42, r: 0 } };

const Page: React.FC<{ f: number }> = ({ f }) => {
  const strike = interpolate(f, [STRIKE_AT, STRIKE_AT + 4], [0, 1], clamp);
  const sx0 = 150, sx1 = 930;
  return (
    <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 30, background: "#0b0c0e",
      border: "1.5px solid rgba(255,255,255,0.11)", boxShadow: "0 40px 120px rgba(0,0,0,0.65)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 90, background: "#17181b", borderBottom: "1.5px solid rgba(255,255,255,0.08)" }} />
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ position: "absolute", left: 34 + k * 30, top: 33, width: 18, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.2)" }} />
      ))}
      <div style={{ position: "absolute", left: 150, top: 17, width: 720, height: 56, borderRadius: 28, background: "#0b0c0e", border: "1.5px solid rgba(255,255,255,0.1)" }}>
        <div style={{ position: "absolute", left: 40, top: 0, height: 56, display: "flex", alignItems: "center", fontFamily: brand.body, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.9)" }}>
          wallet-app<span style={{ color: "rgba(255,255,255,0.45)" }}>.example</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: brand.body, fontWeight: 800, fontSize: 58, color: "#fff", letterSpacing: -0.5 }}>
        Confirm transaction
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: brand.body, fontWeight: 400, fontSize: 30, color: "rgba(255,255,255,0.5)" }}>
        Cold wallet → hot wallet
      </div>
      {/* Routine transfer ✓ */}
      <div style={{ position: "absolute", left: 60, right: 60, top: TXT_Y - WIN.y - 52, height: 104, display: "flex", alignItems: "center", justifyContent: "center", gap: 26,
        fontFamily: brand.body, fontWeight: 700, fontSize: 76, color: "rgba(255,255,255,0.62)", letterSpacing: -0.5 }}>
        Routine transfer
        <svg width="70" height="70" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 740, height: 84, borderRadius: 22, background: "#1a1b1e", border: "1.5px solid rgba(255,255,255,0.14)",
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: brand.body, fontWeight: 700, fontSize: 30, letterSpacing: 1, color: "rgba(255,255,255,0.5)" }}>
        Confirm
      </div>
      {/* strike line (orange, glowing), in canvas coords */}
      {strike > 0 && (
        <div style={{ position: "absolute", left: sx0 - WIN.x, top: TXT_Y - WIN.y - 5, width: (sx1 - sx0) * strike, height: 10, borderRadius: 5, background: ORANGE,
          boxShadow: "0 0 28px rgba(255,128,0,0.8), 0 0 8px rgba(255,128,0,0.9)", transform: "rotate(-1.2deg)", transformOrigin: "0 50%" }} />
      )}
    </div>
  );
};

const BrowserShot: React.FC<{ shot: Cam2; from: number; callout?: boolean }> = ({ shot, from, callout }) => {
  const lf = useCurrentFrame();
  const f = from + lf;
  const c = camAt(shot, lf);
  const [ax, ay] = toScreen(c, 330, TXT_Y + 50);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(900px 1100px at 50% 52%, #1a1c20 0%, #0e0f11 70%)" }} />
      <AbsoluteFill style={{
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, transparent 372px, #000 440px, #000 1400px, transparent 1462px)",
        maskImage: "linear-gradient(to bottom, transparent 0px, transparent 372px, #000 440px, #000 1400px, transparent 1462px)",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0",
          transform: `translate(540px, 940px) rotate(${c.r}deg) scale(${c.s}) translate(${-c.cx}px, ${-c.cy}px)` }}>
          <Page f={f} />
        </div>
      </AbsoluteFill>
      {callout && <Callout text="WEBSITE" at={[ax, ay]} label={[ax + 300, ay + 40]} startFrame={4} />}
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 112;
  const cutB = 30, cutC = 64, cutD = STRIKE_AT;
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutB} layout="none"><DeviceShot shot={SHOT_A} /></Sequence>
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none"><DeviceShot shot={SHOT_B} callout /></Sequence>
      <Sequence from={cutC} durationInFrames={cutD - cutC} layout="none"><BrowserShot shot={SHOT_C} from={cutC} /></Sequence>
      <Sequence from={cutD} durationInFrames={total - cutD} layout="none"><BrowserShot shot={SHOT_D} from={cutD} callout /></Sequence>
      <Disclaimer text="Illustration" />
      <Sfx name="whoosh_soft" at={cutB} volume={0.3} />
      <Sfx name="whoosh_soft" at={cutC} volume={0.3} />
      <Sfx name="whoosh_soft" at={cutD - 1} volume={0.3} />
      <Sfx name="tick" at={cutD + 2} volume={0.28} />
    </Shell>
  );
};

export default Scene;
