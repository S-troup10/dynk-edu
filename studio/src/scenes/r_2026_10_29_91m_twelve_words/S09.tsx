// Scene: 2026-10-29-91m-twelve-words S09 — "And it's why any site asking you to verify your phrase is the thief."
// All 2D (cheap to render). One fake browser page ("verify-wallet-secure.example"), four hard-cut camera shots:
//  A f0–28   tight on URL bar + title, sliding down the page            ("And it's why any")
//  B f28–56  wider, sliding down to the 12 empty boxes, cursor clicks box 1 ("site asking you")
//  C f56–92  push-in on the grid, words typed in ~2.4 f apart, cursor hits Verify ("to verify your phrase")
//  D f92–116 pull back; boxes glow orange, words detach as chips and drain off to the right; PHISHING SITE ("is the thief.")
// Orange = the typing/draining words (one system per shot). Callout lands on "thief".
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { PHRASE, ORANGE, clamp, W, Sfx } from "./_shared";

const MONO = "'DejaVu Sans Mono', monospace";
const cut = (t: number) => Easing.out(Easing.cubic)(t);

/* ---------- page geometry in design px (the 1080×1920 canvas at camera scale 1) ---------- */
const WIN = { x: 90, y: 410, w: 900, h: 1040 };
const GRID = { x: 130, y: 760, cw: 260, ch: 100, gx: 20, gy: 18 };
const boxPos = (i: number) => ({
  x: GRID.x + (i % 3) * (GRID.cw + GRID.gx),
  y: GRID.y + Math.floor(i / 3) * (GRID.ch + GRID.gy),
});
const boxCentre = (i: number): [number, number] => {
  const p = boxPos(i);
  return [p.x + GRID.cw / 2, p.y + GRID.ch / 2];
};
const BTN = { x: 130, y: 1272, w: 820, h: 84 };

/* ---------- camera: focus point (cx,cy) + zoom s + roll r, from→to over the shot, never at rest ---------- */
type Cam = { cx: number; cy: number; s: number; r: number };
type Shot = { a: Cam; b: Cam; len: number };
const camAt = (sh: Shot, f: number): Cam => {
  const p = interpolate(f, [0, sh.len], [0, 1], clamp);
  const q = p * 0.7 + cut(p) * 0.3;
  const m = (k: keyof Cam) => sh.a[k] + (sh.b[k] - sh.a[k]) * q;
  return { cx: m("cx"), cy: m("cy"), s: m("s"), r: m("r") };
};
const toScreen = (c: Cam, x: number, y: number): [number, number] => [(x - c.cx) * c.s + 540, (y - c.cy) * c.s + 940];

const SHOT_A: Shot = { len: 28, a: { cx: 540, cy: 590, s: 1.55, r: -1.6 }, b: { cx: 540, cy: 740, s: 1.45, r: 0 } };
const SHOT_B: Shot = { len: 28, a: { cx: 520, cy: 700, s: 1.05, r: 1.2 }, b: { cx: 470, cy: 930, s: 1.3, r: 0 } };
const SHOT_C: Shot = { len: 36, a: { cx: 560, cy: 1000, s: 1.0, r: -0.8 }, b: { cx: 520, cy: 1040, s: 1.27, r: 0.6 } };
const SHOT_D: Shot = { len: 24, a: { cx: 520, cy: 1040, s: 1.27, r: 0.6 }, b: { cx: 540, cy: 880, s: 0.92, r: 0 } };

/* ---------- timeline (absolute scene frames) ---------- */
const FILL_START = 58; // first word typed
const fillAt = (i: number) => FILL_START + Math.round(i * 2.4);
const CLICK_BTN = 89;
const D0 = 92;
const chipLeave = (i: number) => D0 + 1 + i * 0.8;
const CHIP_LEN = 13;

/* ---------- cursor path: segments with ease ---------- */
const CURSOR: [number, number, number][] = [
  [0, 950, 1190],
  [20, 940, 1180],
  [46, 282, 842],
  [64, 282, 842],
  [88, 760, 1322],
];
const cursorAt = (f: number): [number, number] => {
  for (let k = 0; k < CURSOR.length - 1; k++) {
    const [f0, x0, y0] = CURSOR[k], [f1, x1, y1] = CURSOR[k + 1];
    if (f <= f1) {
      const t = Easing.inOut(Easing.quad)(interpolate(f, [f0, f1], [0, 1], clamp));
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    }
  }
  const l = CURSOR[CURSOR.length - 1];
  return [l[1], l[2]];
};

/* ---------- the fake page ---------- */
const InputBox: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const p = boxPos(i);
  const filled = f >= fillAt(i);
  const count = PHRASE.filter((_, k) => f >= fillAt(k)).length;
  const active = f >= 38 && count === i && f < D0; // next box to be typed (box 1 is focused after the click)
  const focus1 = i === 0 && f >= 46 && !filled;
  const inD = f >= D0;
  const left = inD && f >= chipLeave(i) + 1;
  const pop = filled ? interpolate(f, [fillAt(i), fillAt(i) + 3], [0, 1], clamp) : 0;
  const hot = inD && !left;
  const caretOn = Math.floor(f / 6) % 2 === 0;
  const border = hot ? ORANGE : active || focus1 ? (f >= FILL_START ? ORANGE : "rgba(255,255,255,0.75)") : filled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.13)";
  return (
    <div style={{
      position: "absolute", left: p.x, top: p.y, width: GRID.cw, height: GRID.ch, boxSizing: "border-box", borderRadius: 18,
      background: hot ? "rgba(255,128,0,0.10)" : "#131417", border: `${hot || active || focus1 ? 2.5 : 1.5}px solid ${border}`,
      boxShadow: hot ? "0 0 26px rgba(255,128,0,0.45), inset 0 0 18px rgba(255,128,0,0.12)" : "none",
      opacity: left ? 0.55 : 1,
    }}>
      <div style={{ position: "absolute", left: 16, top: 12, fontFamily: brand.body, fontWeight: 600, fontSize: 20, color: "rgba(255,255,255,0.38)" }}>{i + 1}</div>
      {filled && !left && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 36, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 36,
          color: hot ? ORANGE : "#f4f4f4", opacity: pop, transform: `translateY(${(1 - pop) * 8}px)` }}>{PHRASE[i]}</div>
      )}
      {!filled && (active || focus1) && caretOn && (
        <div style={{ position: "absolute", left: GRID.cw / 2 - 1.5, top: 38, width: 3, height: 40, background: f >= FILL_START ? ORANGE : "#fff" }} />
      )}
    </div>
  );
};

const Page: React.FC<{ f: number }> = ({ f }) => {
  const inD = f >= D0;
  const pressed = f >= CLICK_BTN;
  const btnHot = pressed && f < D0 + 10;
  const pageDim = inD ? interpolate(f, [D0, D0 + 20], [1, 0.62], clamp) : 1;
  return (
    <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 30, background: "#0b0c0e",
      border: "1.5px solid rgba(255,255,255,0.11)", boxShadow: "0 40px 120px rgba(0,0,0,0.65)", overflow: "hidden" }}>
      {/* browser chrome */}
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 90, background: "#17181b", borderBottom: "1.5px solid rgba(255,255,255,0.08)" }} />
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ position: "absolute", left: 34 + k * 30, top: 33, width: 18, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.2)" }} />
      ))}
      <div style={{ position: "absolute", left: 150, top: 17, width: 720, height: 56, borderRadius: 28, background: "#0b0c0e", border: "1.5px solid rgba(255,255,255,0.1)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" style={{ position: "absolute", left: 22, top: 14 }}>
          <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" />
        </svg>
        <div style={{ position: "absolute", left: 64, top: 0, height: 56, display: "flex", alignItems: "center", fontFamily: brand.body, fontWeight: 500, fontSize: 28,
          color: "rgba(255,255,255,0.9)", letterSpacing: 0.2 }}>
          verify-wallet-secure<span style={{ color: "rgba(255,255,255,0.45)" }}>.example</span>
        </div>
      </div>

      {/* page body */}
      <div style={{ position: "absolute", left: 0, top: 90, right: 0, bottom: 0, opacity: pageDim }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 88, textAlign: "center", fontFamily: brand.body, fontWeight: 800, fontSize: 62, color: "#fff", letterSpacing: -0.5 }}>
          Verify your wallet
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 176, textAlign: "center", fontFamily: brand.body, fontWeight: 400, fontSize: 28, color: "rgba(255,255,255,0.5)" }}>
          Enter your 12-word recovery phrase to continue.
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1398 - WIN.y - 90 + 20, textAlign: "center", fontFamily: brand.body, fontWeight: 500, fontSize: 22,
          color: "rgba(255,255,255,0.28)", letterSpacing: 2 }}>
          SECURE  ·  ENCRYPTED  ·  INSTANT
        </div>
      </div>

      {/* inputs live in canvas coords: offset by window origin */}
      <div style={{ position: "absolute", left: -WIN.x, top: -WIN.y, width: 1080, height: 1920, opacity: pageDim }}>
        {PHRASE.map((_, i) => <InputBox key={i} i={i} f={f} />)}
        <div style={{
          position: "absolute", left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 22, boxSizing: "border-box",
          background: btnHot ? ORANGE : "#1a1b1e", border: btnHot ? "none" : "1.5px solid rgba(255,255,255,0.14)",
          boxShadow: btnHot ? "0 0 34px rgba(255,128,0,0.55)" : "none",
          transform: `scale(${f >= CLICK_BTN && f < CLICK_BTN + 3 ? 0.975 : 1})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: brand.body, fontWeight: 700, fontSize: 30, letterSpacing: 1,
          color: btnHot ? "#150a02" : "rgba(255,255,255,0.7)",
        }}>Verify wallet</div>
      </div>
    </div>
  );
};

/* ---------- mouse cursor ---------- */
const Cursor: React.FC<{ f: number }> = ({ f }) => {
  if (f >= D0 + 4) return null;
  const [x, y] = cursorAt(f);
  const down = (f >= 44 && f < 48) || (f >= CLICK_BTN && f < CLICK_BTN + 3);
  return (
    <svg width="44" height="52" viewBox="0 0 22 26" style={{ position: "absolute", left: x - 2, top: y - 2, transform: `scale(${down ? 0.88 : 1})`, transformOrigin: "2px 2px",
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}>
      <path d="M2 2 L2 20 L7 15.5 L10.5 23.5 L14 22 L10.6 14.2 L17.5 14 Z" fill="#fff" stroke="#0b0c0e" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
};

/* ---------- draining chips (D) ---------- */
const Chip: React.FC<{ i: number; f: number; t: number; alpha: number; k: number }> = ({ i, t, alpha, k }) => {
  const [x0, y0] = boxCentre(i);
  const p = Easing.in(Easing.quad)(Math.min(1, Math.max(0, t)));
  const x = x0 + (1900 - x0) * p;
  const y = y0 - 230 * p - 40 * Math.sin(Math.PI * p);
  const sc = 1 - k * 0.06;
  return (
    <div style={{
      position: "absolute", left: x - 80, top: y - 26, width: 160, height: 52, borderRadius: 14, background: ORANGE, opacity: alpha, transform: `scale(${sc})`,
      boxShadow: k === 0 ? "0 0 30px rgba(255,128,0,0.7)" : "0 0 18px rgba(255,128,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 28, color: "#150a02",
    }}>{PHRASE[i]}</div>
  );
};
const Chips: React.FC<{ f: number }> = ({ f }) => (
  <>
    {PHRASE.map((_, i) => {
      const t = (f - chipLeave(i)) / CHIP_LEN;
      if (t < 0) return null;
      return (
        <React.Fragment key={i}>
          {[5, 4, 3, 2, 1, 0].map((k) => {
            const tk = t - k * 0.07;
            if (tk < 0 || tk > 1.05) return null;
            return <Chip key={k} i={i} f={f} t={tk} k={k} alpha={k === 0 ? 1 : 0.38 - k * 0.05} />;
          })}
        </React.Fragment>
      );
    })}
  </>
);

/* ---------- one camera shot ---------- */
const BrowserShot: React.FC<{ shot: Shot; from: number; calloutAt?: number }> = ({ shot, from, calloutAt }) => {
  const lf = useCurrentFrame();
  const f = from + lf;
  const c = camAt(shot, lf);
  const [urlX, urlY] = toScreen(c, 600, 456);
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
          <Chips f={f} />
          <Cursor f={f} />
        </div>
      </AbsoluteFill>
      {calloutAt !== undefined && <Callout text="PHISHING SITE" at={[urlX, urlY - 4]} label={[urlX + 150, urlY - 108]} startFrame={calloutAt - from} />}
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const cutB = 28, cutC = 56, cutD = D0;
  const total = props.durationInFrames ?? 116;
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutB} layout="none"><BrowserShot shot={SHOT_A} from={0} /></Sequence>
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none"><BrowserShot shot={SHOT_B} from={cutB} /></Sequence>
      <Sequence from={cutC} durationInFrames={cutD - cutC} layout="none"><BrowserShot shot={SHOT_C} from={cutC} /></Sequence>
      <Sequence from={cutD} durationInFrames={total - cutD} layout="none"><BrowserShot shot={SHOT_D} from={cutD} calloutAt={W(props, "thief", 0, 3.47)} /></Sequence>

      <Disclaimer text="Illustration · made-up site" />

      {/* SFX: soft whoosh on cuts, typing under the fill, click on the button; never two on one frame */}
      <Sfx name="whoosh_soft" at={cutB} volume={0.3} />
      <Sfx name="click" at={46} volume={0.25} />
      <Sfx name="whoosh_soft" at={cutC} volume={0.28} />
      {[0, 1, 2, 3, 4, 5].map((k) => <Sfx key={k} name="type" at={fillAt(k * 2) + 1} volume={0.22} />)}
      <Sfx name="click" at={CLICK_BTN} volume={0.3} />
      <Sfx name="whoosh_soft" at={cutD + 1} volume={0.35} />
    </Shell>
  );
};

export default Scene;
