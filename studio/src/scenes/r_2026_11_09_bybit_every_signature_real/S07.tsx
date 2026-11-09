// Scene: 2026-11-09-bybit-every-signature-real S07 — "That's why fake airdrop sites just ask you to sign. One signature can let them spend your tokens."
// Six hard cuts. A f0–26 / B f26–56 / C f56–91: 2D fake-airdrop browser (page → Claim click → signature sheet).
// D f91–118: 3D orange "Permit" SignCard orbiting. E f118–145 / F f145–171: 3D chrome coins slide off a stack in a line
// toward an orange unknown-spender slab. Orange = Claim/Sign button (2D), the Permit card, the spender slab.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Coin, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { ORANGE, clamp, W, Sfx, rand, CamRig, project, SignCard, type Shot, type Vec3 } from "./_shared";

const cut = (t: number) => Easing.out(Easing.cubic)(t);
const eo = (f: number, a: number, b: number) => cut(interpolate(f, [a, b], [0, 1], clamp));

/* ---------------- 2D browser ---------------- */
const WIN = { x: 90, y: 410, w: 900, h: 1040 };
const CLAIM = { x: 190, y: 1000, w: 700, h: 112 }; // canvas coords
const T_CLICK = 61;      // Claim pressed
const T_SHEET = 63;      // sheet starts sliding up
const T_SIGN = 84;       // Sign button lit

type Cam = { cx: number; cy: number; s: number; r: number };
type Shot2 = { a: Cam; b: Cam; len: number };
const camAt2 = (sh: Shot2, f: number): Cam => {
  const p = interpolate(f, [0, sh.len], [0, 1], clamp);
  const q = p * 0.7 + cut(p) * 0.3;
  const m = (k: keyof Cam) => sh.a[k] + (sh.b[k] - sh.a[k]) * q;
  return { cx: m("cx"), cy: m("cy"), s: m("s"), r: m("r") };
};
const toScreen = (c: Cam, x: number, y: number): [number, number] => {
  const rad = (c.r * Math.PI) / 180;
  const dx = (x - c.cx) * c.s, dy = (y - c.cy) * c.s;
  return [540 + dx * Math.cos(rad) - dy * Math.sin(rad), 940 + dx * Math.sin(rad) + dy * Math.cos(rad)];
};
const SHOT_A: Shot2 = { len: 26, a: { cx: 600, cy: 600, s: 1.55, r: -1.4 }, b: { cx: 540, cy: 720, s: 1.42, r: 0 } };
const SHOT_B: Shot2 = { len: 30, a: { cx: 520, cy: 880, s: 1.05, r: 1.2 }, b: { cx: 540, cy: 1010, s: 1.25, r: 0 } };
const SHOT_C: Shot2 = { len: 35, a: { cx: 560, cy: 1040, s: 1.18, r: -0.8 }, b: { cx: 540, cy: 1150, s: 1.32, r: 0.4 } };

const Gift: React.FC = () => (
  <svg width="170" height="170" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
    <rect x="3.5" y="9" width="17" height="11.5" rx="1.6" />
    <rect x="2.5" y="6.5" width="19" height="3.6" rx="1.2" />
    <path d="M12 6.5V20.5" />
    <path d="M12 6.5C10 6.5 7.6 6 7.6 4.2C7.6 2.8 9.8 2.6 12 6.5C14.2 2.6 16.4 2.8 16.4 4.2C16.4 6 14 6.5 12 6.5Z" />
  </svg>
);

const CONFETTI = Array.from({ length: 26 }, (_, i) => ({
  x: 40 + rand(i + 1) * 820, y: 120 + rand(i + 40) * 820, r: rand(i + 80) * 360, k: Math.floor(rand(i + 120) * 3),
  s: 14 + rand(i + 160) * 22, v: 0.6 + rand(i + 200) * 1.4, g: 0.12 + rand(i + 240) * 0.3,
}));

const Page: React.FC<{ f: number }> = ({ f }) => {
  const pressed = f >= T_CLICK;
  const sheetT = eo(f, T_SHEET, T_SHEET + 7);
  const scrim = pressed ? interpolate(f, [T_SHEET, T_SHEET + 7], [0, 0.55], clamp) : 0;
  const btnHot = f < T_CLICK + 2;
  const signHot = f >= T_SIGN;
  return (
    <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 30, background: "#0b0c0e",
      border: "1.5px solid rgba(255,255,255,0.11)", boxShadow: "0 40px 120px rgba(0,0,0,0.65)", overflow: "hidden" }}>
      {/* chrome */}
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 90, background: "#17181b", borderBottom: "1.5px solid rgba(255,255,255,0.08)" }} />
      {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 34 + k * 30, top: 33, width: 18, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.2)" }} />)}
      <div style={{ position: "absolute", left: 150, top: 17, width: 720, height: 56, borderRadius: 28, background: "#0b0c0e", border: "1.5px solid rgba(255,255,255,0.1)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" style={{ position: "absolute", left: 22, top: 14 }}>
          <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" />
        </svg>
        <div style={{ position: "absolute", left: 64, top: 0, height: 56, display: "flex", alignItems: "center", fontFamily: brand.body, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.9)" }}>
          claim-airdrop<span style={{ color: "rgba(255,255,255,0.45)" }}>.example</span>
        </div>
      </div>
      {/* confetti (greys, drifting) */}
      <div style={{ position: "absolute", left: 0, top: 90, right: 0, bottom: 0, overflow: "hidden" }}>
        {CONFETTI.map((c, i) => {
          const y = (c.y + f * c.v * 2.2) % 900;
          const col = `rgba(255,255,255,${c.g})`;
          return (
            <div key={i} style={{ position: "absolute", left: c.x, top: y, width: c.k === 2 ? c.s * 0.5 : c.s, height: c.k === 0 ? c.s : c.k === 1 ? c.s : c.s * 1.6,
              borderRadius: c.k === 1 ? "50%" : 3, background: col, transform: `rotate(${c.r + f * c.v * 4}deg)` }} />
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", transform: `translateY(${Math.sin(f / 6) * 4}px)` }}><Gift /></div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 272, textAlign: "center", fontFamily: brand.body, fontWeight: 800, fontSize: 68, color: "#fff", letterSpacing: -0.6 }}>Claim your airdrop</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 366, textAlign: "center", fontFamily: brand.body, fontWeight: 400, fontSize: 30, color: "rgba(255,255,255,0.55)" }}>5,000 free tokens · ends in 02:14:09</div>
      </div>
      {/* Claim button (canvas coords offset) */}
      <div style={{ position: "absolute", left: -WIN.x, top: -WIN.y, width: 1080, height: 1920 }}>
        <div style={{ position: "absolute", left: CLAIM.x, top: CLAIM.y, width: CLAIM.w, height: CLAIM.h, borderRadius: 30,
          background: btnHot ? ORANGE : "#2a2b2e", boxShadow: btnHot ? "0 0 40px rgba(255,128,0,0.6)" : "none",
          transform: `scale(${f >= T_CLICK - 2 && f < T_CLICK + 2 ? 0.965 : 1})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: brand.body, fontWeight: 800, fontSize: 42, letterSpacing: 1, color: btnHot ? "#150a02" : "rgba(255,255,255,0.35)" }}>Claim</div>
      </div>
      {/* scrim + signature sheet */}
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${scrim})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, borderRadius: "34px 34px 0 0", background: "#17181b", borderTop: "1.5px solid rgba(255,255,255,0.14)",
        transform: `translateY(${(1 - sheetT) * 600}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 18, display: "flex", justifyContent: "center" }}><div style={{ width: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.2)" }} /></div>
        <div style={{ position: "absolute", left: 60, top: 60, fontFamily: brand.body, fontWeight: 800, fontSize: 52, color: "#fff" }}>Signature request</div>
        <div style={{ position: "absolute", left: 60, top: 130, fontFamily: brand.body, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.45)" }}>claim-airdrop.example</div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 190, height: 1.5, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", left: 60, top: 220, fontFamily: brand.body, fontWeight: 500, fontSize: 32, color: "rgba(255,255,255,0.8)" }}>Sign to verify you own this wallet</div>
        <div style={{ position: "absolute", left: 60, top: 280, fontFamily: brand.body, fontWeight: 600, fontSize: 32, color: "rgba(255,255,255,0.5)" }}>Network fee</div>
        <div style={{ position: "absolute", right: 60, top: 280, fontFamily: brand.body, fontWeight: 700, fontSize: 32, color: "#fff" }}>$0.00</div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 390, height: 104, borderRadius: 52, boxSizing: "border-box",
          background: signHot ? ORANGE : "#f2f2f2", boxShadow: signHot ? "0 0 36px rgba(255,128,0,0.55)" : "none",
          transform: `scale(${f >= T_SIGN && f < T_SIGN + 3 ? 0.97 : 1})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: brand.body, fontWeight: 800, fontSize: 40, letterSpacing: 1, color: "#0b0b0b" }}>Sign</div>
      </div>
    </div>
  );
};

const Cursor: React.FC<{ f: number }> = ({ f }) => {
  const P: [number, number, number][] = [[26, 860, 1330], [58, 560, 1070], [66, 560, 1070], [78, 560, 1330], [84, 540, 1396]];
  let x = P[P.length - 1][1], y = P[P.length - 1][2];
  for (let k = 0; k < P.length - 1; k++) {
    const [f0, x0, y0] = P[k], [f1, x1, y1] = P[k + 1];
    if (f <= f1) { const t = Easing.inOut(Easing.quad)(interpolate(f, [f0, f1], [0, 1], clamp)); x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t; break; }
  }
  const down = (f >= T_CLICK - 2 && f < T_CLICK + 2) || (f >= T_SIGN && f < T_SIGN + 3);
  if (f < 26 || f > 90) return null;
  return (
    <svg width="46" height="54" viewBox="0 0 22 26" style={{ position: "absolute", left: x - 2, top: y - 2, transform: `scale(${down ? 0.88 : 1})`, transformOrigin: "2px 2px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}>
      <path d="M2 2 L2 20 L7 15.5 L10.5 23.5 L14 22 L10.6 14.2 L17.5 14 Z" fill="#fff" stroke="#0b0c0e" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
};

const BrowserShot: React.FC<{ shot: Shot2; from: number; callout?: { text: string; at: [number, number]; off: [number, number]; frame: number } }> = ({ shot, from, callout }) => {
  const lf = useCurrentFrame();
  const f = from + lf;
  const c = camAt2(shot, lf);
  const sp = callout ? toScreen(c, callout.at[0], callout.at[1]) : [0, 0];
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
          <Cursor f={f} />
        </div>
      </AbsoluteFill>
      {callout && <Callout text={callout.text} at={[sp[0], sp[1]]} label={[sp[0] + callout.off[0], sp[1] + callout.off[1]]} startFrame={callout.frame - from} />}
    </AbsoluteFill>
  );
};

/* ---------------- 3D ---------------- */
const SHOT_D: Shot = { len: 27, from: [-4.6, 2.4, 8.4], to: [3.8, 2.2, 8.8], tFrom: [0, 1.65, 0], tTo: [0, 1.65, 0], fov: 32 };
const SHOT_E: Shot = { len: 27, from: [-1.6, 2.2, 6.6], to: [0.9, 1.7, 5.2], tFrom: [0, 0.6, -2], tTo: [0, 0.6, -3], fov: 32 };
const SHOT_F: Shot = { len: 26, from: [2.6, 1.9, -0.6], to: [1.4, 1.6, -1.8], tFrom: [0, 0.8, -4], tTo: [0, 0.8, -5], fov: 32 };
const SPENDER: Vec3 = [0, 0.7, -5];
const STACK_Z = 2, N_COINS = 11, COIN_R = 0.38;
const E0 = 118; // first coin leaves
const coinStart = (i: number) => E0 + 2 + (N_COINS - 1 - i) * 2.7; // top coin (i = N-1) leaves first
const COIN_LEN = 16;

const Coins: React.FC<{ from: number }> = ({ from }) => {
  const f = from + useCurrentFrame();
  return (
    <>
      {Array.from({ length: N_COINS }).map((_, i) => {
        const y0 = 0.1 + i * 0.19;
        const t = interpolate(f, [coinStart(i), coinStart(i) + COIN_LEN], [0, 1], clamp);
        const p = Easing.in(Easing.quad)(t);
        const z = STACK_Z + (SPENDER[2] + 0.5 - STACK_Z) * p;
        const y = y0 + (0.1 - y0) * eo(f, coinStart(i), coinStart(i) + 5);
        const sc = 1 - interpolate(t, [0.88, 1], [0, 1], clamp);
        if (sc < 0.02) return null;
        return <Coin key={i} radius={COIN_R} position={[0, y, z]} rotation={[0, i * 0.7 + p * 5, 0]} />;
      }).map((el, i) => el && <group key={i} scale={1}>{el}</group>)}
    </>
  );
};

const Spender: React.FC<{ glow?: number }> = () => (
  <SignCard
    glow
    position={SPENDER} rotation={[0, 0, 0]} scale={0.8}
    lines={[{ text: "Spender", size: 40, color: "#9a9a9a", weight: 500 }, { text: "0x9f…e2", size: 78, mono: true, weight: 700 }, { text: "unknown", size: 44, color: ORANGE, weight: 600 }]}
  />
);

const ShotD: React.FC = () => {
  const lf = useCurrentFrame();
  const enter = eo(lf, 0, 6);
  const bob = Math.sin(lf / 5) * 0.04;
  const pos: Vec3 = [0, 1.65 + bob, 0];
  const cardPt = (p: Vec3) => project(SHOT_D, lf, p);
  const [px, py] = cardPt([-0.6, 1.65 + 0.12, 0.05]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: SHOT_D.from, to: SHOT_D.to, target: SHOT_D.tFrom, fov: 32, startFrame: 0, durationFrames: 1 }}>
        <CamRig shot={SHOT_D} />
        <group scale={0.92 + 0.08 * enter}>
          <SignCard glow position={pos} rotation={[0, 0, 0]} scale={1}
            lines={[{ text: "Permit", size: 70, weight: 800 }, { text: "Spender: 0x9f…e2 (unknown)", size: 46, weight: 500, color: "#d8d8d8" }, { text: "Amount: Unlimited", size: 56, weight: 700, color: ORANGE }]}
            button="Sign" />
        </group>
      </Studio3D>
      {void px}{void py}
    </AbsoluteFill>
  );
};

const ShotCoins: React.FC<{ shot: Shot; from: number; callout?: boolean }> = ({ shot, from, callout }) => {
  const lf = useCurrentFrame();
  const [sx, sy] = project(shot, lf, [SPENDER[0], SPENDER[1] + 0.5, 0]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, to: shot.to, target: shot.tFrom, fov: 32, startFrame: 0, durationFrames: 1 }}>
        <CamRig shot={shot} />
        {Array.from({ length: 1 }).map((_, k) => <React.Fragment key={k}><Spender /></React.Fragment>)}
        <Coins from={from} />
      </Studio3D>
      {callout && <Callout text="PERMISSION TO SPEND" at={[sx, sy]} label={[Math.min(780, Math.max(330, sx + 120)), Math.max(560, sy - 230)]} startFrame={W0 - from} accent />}
    </AbsoluteFill>
  );
};
let W0 = 141;

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 171;
  const cB = 26, cC = 56, cD = 91, cE = 118, cF = 145;
  W0 = Math.max(cF + 2, W(props, "spend", 0, 4.7));
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cB} layout="none">
        <BrowserShot shot={SHOT_A} from={0} callout={{ text: "FAKE AIRDROP", at: [600, 456], off: [160, -110], frame: W(props, "fake", 0, 0.48) }} />
      </Sequence>
      <Sequence from={cB} durationInFrames={cC - cB} layout="none"><BrowserShot shot={SHOT_B} from={cB} /></Sequence>
      <Sequence from={cC} durationInFrames={cD - cC} layout="none"><BrowserShot shot={SHOT_C} from={cC} /></Sequence>
      <Sequence from={cD} durationInFrames={cE - cD} layout="none"><ShotD /></Sequence>
      <Sequence from={cE} durationInFrames={cF - cE} layout="none"><ShotCoins shot={SHOT_E} from={cE} /></Sequence>
      <Sequence from={cF} durationInFrames={total - cF} layout="none"><ShotCoins shot={SHOT_F} from={cF} callout /></Sequence>

      <Disclaimer text="Illustration · simplified" />

      <Sfx name="whoosh_soft" at={cB} volume={0.3} />
      <Sfx name="whoosh_soft" at={cC} volume={0.28} />
      <Sfx name="click" at={T_CLICK} volume={0.3} />
      <Sfx name="tick" at={T_SHEET + 6} volume={0.22} />
      <Sfx name="click" at={T_SIGN} volume={0.28} />
      <Sfx name="whoosh_soft" at={cD} volume={0.32} />
      <Sfx name="whoosh_soft" at={cE} volume={0.3} />
      {[0, 3, 6, 9].map((k) => <Sfx key={k} name="tick" at={Math.round(coinStart(N_COINS - 1 - k * 1)) + 8 + k} volume={0.2} />)}
      <Sfx name="whoosh_soft" at={cF} volume={0.3} />
    </Shell>
  );
};

export default Scene;
