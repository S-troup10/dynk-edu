// S04 "Hackers had slipped code into the wallet's website. The screen showed one transaction. The signature said another."
// The mechanism. Orange = the injected code / the real transaction.
//  A f0–24   2D tight on grey code, orange JS block slides in                 ("Hackers had slipped")
//  B f24–46  2D wider, block typed out fast, callout INJECTED CODE            ("code into the")
//  C f46–84  2D pull back: friendly page renders over it, orange glows through ("wallet's website.")
//  D f84–111 3D grey SignCard (SAW), camera left of centre                    ("The screen showed")
//  E f111–138 3D closer push on the rows                                       ("one transaction.")
//  F f138–182 3D other angle; card FLIPS to the orange SIGNED card on "another"
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { SignCard, CamRig, project, Sfx, W, SAW, SIGNED, ORANGE, clamp, type Shot } from "./_shared";

const MONO = "'DejaVu Sans Mono', monospace";
const cut = (t: number) => Easing.out(Easing.cubic)(t);

/* ---------- 2D browser geometry (canvas px) ---------- */
const WIN = { x: 90, y: 410, w: 900, h: 1040 };
const LH = 44;
const CODE_TOP = 90 + 34; // window-local
const GREY = [
  "function renderPage(state) {",
  "  const ui = mount('#app');",
  "  ui.header(state.title);",
  "  ui.list(state.items);",
  "  ui.footer(state.links);",
  "}",
  "",
  "async function loadSigners() {",
  "  const res = await api.get('/s');",
  "  return res.json();",
  "}",
  "",
  "export function confirmFlow(tx) {",
  "  const ok = validate(tx);",
  "  if (!ok) return reject(tx);",
  "  return collect(tx.id);",
  "}",
  "",
  "window.addEventListener('load',",
  "  () => renderPage(initial));",
  "const BUILD = '2025.02.21';",
  "export default confirmFlow;",
];
const INJ = [
  "// added by attacker",
  "const real = buildTx(target);",
  "const shown = routineView();",
  "ui.render(shown);",
  "onConfirm(() => sign(real));",
  "hideTraces();",
];
const INJ_FIRST = 7; // grey line index where the orange block sits
const INJ_Y = CODE_TOP + INJ_FIRST * LH - 8;
const INJ_H = INJ.length * LH + 16;
const CPF = 4.6; // typed chars per frame
const TYPE0 = 6;
const TOTAL_CH = INJ.reduce((a, l) => a + l.length, 0);

/* ---------- 2D camera: focus point + zoom + roll ---------- */
type Cam = { cx: number; cy: number; s: number; r: number };
type Shot2 = { a: Cam; b: Cam; len: number };
const camAt2 = (sh: Shot2, f: number): Cam => {
  const p = interpolate(f, [0, sh.len], [0, 1], clamp);
  const q = p * 0.7 + cut(p) * 0.3;
  const m = (k: keyof Cam) => sh.a[k] + (sh.b[k] - sh.a[k]) * q;
  return { cx: m("cx"), cy: m("cy"), s: m("s"), r: m("r") };
};
const toScreen = (c: Cam, x: number, y: number): [number, number] => [(x - c.cx) * c.s + 540, (y - c.cy) * c.s + 940];

const SA: Shot2 = { len: 24, a: { cx: 520, cy: 880, s: 1.5, r: -1.4 }, b: { cx: 540, cy: 1010, s: 1.42, r: 0 } };
const SB: Shot2 = { len: 22, a: { cx: 600, cy: 1000, s: 1.12, r: 1.0 }, b: { cx: 540, cy: 960, s: 1.02, r: 0 } };
const SC: Shot2 = { len: 38, a: { cx: 540, cy: 940, s: 1.02, r: -0.6 }, b: { cx: 540, cy: 930, s: 0.9, r: 0.4 } };

/* ---------- the browser page (window-local layout) ---------- */
const CodeLayer: React.FC<{ f: number; ghost?: number }> = ({ f, ghost }) => {
  const slideT = cut(interpolate(f, [2, 9], [0, 1], clamp));
  const shown = Math.max(0, Math.floor((f - TYPE0) * CPF));
  let left = shown;
  const lines = INJ.map((l) => {
    const n = Math.max(0, Math.min(l.length, left));
    left -= l.length;
    return l.slice(0, n);
  });
  const typing = shown < TOTAL_CH;
  const caretOn = Math.floor(f / 3) % 2 === 0;
  const lastIdx = Math.max(0, lines.findIndex((l, i) => l.length < INJ[i].length));
  const glow = ghost === undefined;
  const op = ghost ?? 1;
  return (
    <>
      {ghost === undefined &&
        GREY.map((t, i) => (
          <div key={i} style={{ position: "absolute", left: 30, top: CODE_TOP + i * LH, fontFamily: MONO, fontSize: 28, lineHeight: `${LH}px`, whiteSpace: "pre",
            color: i % 5 === 3 ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.22)" }}>
            <span style={{ display: "inline-block", width: 52, color: "rgba(255,255,255,0.14)" }}>{i + 1}</span>{t}
          </div>
        ))}
      <div style={{ position: "absolute", left: 14 + (1 - slideT) * 940, top: INJ_Y, width: 872, height: INJ_H, borderRadius: 14, boxSizing: "border-box",
        background: glow ? "#1a0f05" : "rgba(26,15,5,0.0)", border: `2.5px solid ${ORANGE}`, opacity: op,
        boxShadow: `0 0 ${glow ? 44 : 30}px rgba(255,128,0,${glow ? 0.5 : 0.7}), inset 0 0 26px rgba(255,128,0,0.14)` }}>
        {ghost === undefined && INJ.map((full, i) => (
          <div key={i} style={{ position: "absolute", left: 22, top: 8 + i * LH, fontFamily: MONO, fontWeight: 700, fontSize: 28, lineHeight: `${LH}px`, whiteSpace: "pre", color: ORANGE }}>
            {lines[i]}
            {typing && i === lastIdx && caretOn && <span style={{ display: "inline-block", width: 14, height: 30, marginLeft: 2, background: ORANGE, verticalAlign: "middle" }} />}
            {lines[i].length === 0 && <span style={{ opacity: 0 }}>{full}</span>}
          </div>
        ))}
      </div>
    </>
  );
};

const PageLayer: React.FC<{ f: number }> = ({ f }) => {
  const t = cut(interpolate(f, [46, 58], [0, 1], clamp));
  const t2 = cut(interpolate(f, [52, 64], [0, 1], clamp));
  return (
    <div style={{ position: "absolute", left: 0, top: 90, right: 0, bottom: 0, background: `rgba(15,16,18,${0.9 * t})`, opacity: t }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: brand.body, fontWeight: 800, fontSize: 60, color: "#fff", letterSpacing: -0.5,
        transform: `translateY(${(1 - t) * 24}px)` }}>Confirm transaction</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 152, textAlign: "center", fontFamily: brand.body, fontWeight: 400, fontSize: 28, color: "rgba(255,255,255,0.5)" }}>
        Review and approve with your signers
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 250, transform: `translateY(${(1 - t2) * 30}px)`, opacity: t2 }}>
        {[["Transfer", 44, 700, "#fff"], [SAW[1], 34, 500, "rgba(255,255,255,0.65)"], [SAW[2], 38, 700, "#fff"]].map(([txt, sz, w, col], i) => (
          <div key={i} style={{ height: 96, borderBottom: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", fontFamily: brand.body,
            fontWeight: w as number, fontSize: sz as number, color: col as string }}>{txt}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 760, height: 96, borderRadius: 48, background: "#f2f2f2", opacity: t2, display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: brand.body, fontWeight: 700, fontSize: 38, color: "#0b0b0b" }}>Confirm</div>
    </div>
  );
};

const Browser: React.FC<{ f: number; page: boolean }> = ({ f, page }) => (
  <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 30, background: "#0b0c0e", border: "1.5px solid rgba(255,255,255,0.11)",
    boxShadow: "0 40px 120px rgba(0,0,0,0.65)", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 90, background: "#17181b", borderBottom: "1.5px solid rgba(255,255,255,0.08)" }} />
    {[0, 1, 2].map((k) => (
      <div key={k} style={{ position: "absolute", left: 34 + k * 30, top: 33, width: 18, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.2)" }} />
    ))}
    <div style={{ position: "absolute", left: 150, top: 17, width: 720, height: 56, borderRadius: 28, background: "#0b0c0e", border: "1.5px solid rgba(255,255,255,0.1)" }}>
      <svg width="26" height="26" viewBox="0 0 24 24" style={{ position: "absolute", left: 22, top: 14 }}>
        <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" />
      </svg>
      <div style={{ position: "absolute", left: 64, top: 0, height: 56, display: "flex", alignItems: "center", fontFamily: brand.body, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.9)" }}>
        wallet-app<span style={{ color: "rgba(255,255,255,0.45)" }}>.example</span>
      </div>
    </div>
    {/* code layer (grey source + the orange block) */}
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}>
      <CodeLayer f={f} />
    </div>
    {page && (
      <>
        <PageLayer f={f} />
        {/* the orange code still glows through the page */}
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, opacity: interpolate(f, [50, 62], [0, 1], clamp) * 0.5, pointerEvents: "none" }}>
          <CodeLayer f={f} ghost={1} />
        </div>
      </>
    )}
  </div>
);

const BrowserShot: React.FC<{ shot: Shot2; from: number; page?: boolean; callout?: { text: string; at: number; pt: [number, number]; lab: [number, number] } }> = ({ shot, from, page = false, callout }) => {
  const lf = useCurrentFrame();
  const f = from + lf;
  const c = camAt2(shot, lf);
  const co = callout ? { at: toScreen(c, callout.pt[0], callout.pt[1]), lab: callout.lab } : null;
  const mask = "linear-gradient(to bottom, transparent 0px, transparent 372px, #000 440px, #000 1400px, transparent 1462px)";
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(900px 1100px at 50% 52%, #1a1c20 0%, #0e0f11 70%)" }} />
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0",
          transform: `translate(540px, 940px) rotate(${c.r}deg) scale(${c.s}) translate(${-c.cx}px, ${-c.cy}px)` }}>
          <Browser f={f} page={page} />
        </div>
      </AbsoluteFill>
      {callout && co && <Callout text={callout.text} at={co.at} label={co.lab} startFrame={callout.at - from} accent size={26} />}
    </AbsoluteFill>
  );
};

/* ---------- 3D shots ---------- */
const FRONT = [
  { text: "Confirm transaction", size: 56, weight: 700 },
  { text: SAW[0], size: 46, color: "#cfcfcf" },
  { text: SAW[1], size: 40, color: "#a8a8a8" },
  { text: SAW[2], size: 44, weight: 700 },
];
const BACK = [
  { text: "Actually signing", size: 56, weight: 700, color: "#ffffff" },
  { text: SIGNED[0], size: 48, weight: 700, mono: true, color: ORANGE },
  { text: SIGNED[1], size: 42, weight: 600, color: "#ffd2a6" },
  { text: SIGNED[2], size: 40, weight: 600, color: "#ffd2a6" },
];
const CY = 1.2;
const D: Shot = { from: [-3.0, 2.3, 9.6], to: [-1.8, 1.9, 8.5], tFrom: [0.1, 1.2, 0], tTo: [0, 1.25, 0], fov: 32, len: 27 };
const E: Shot = { from: [-1.5, 1.5, 4.9], to: [-0.7, 1.35, 3.7], tFrom: [-0.45, 1.33, 0], tTo: [-0.55, 1.28, 0], fov: 32, len: 27 };
const F: Shot = { from: [-2.6, 1.6, 9.8], to: [-1.1, 1.45, 8.9], tFrom: [0, 1.2, 0], tTo: [0, 1.22, 0], fov: 32, len: 44 };

const FlipCard: React.FC<{ flipAt: number; len?: number }> = ({ flipAt, len = 8 }) => {
  const f = useCurrentFrame();
  const t = Easing.inOut(Easing.cubic)(interpolate(f, [flipAt, flipAt + len], [0, 1], clamp));
  // slight lift mid-flip so the turn reads
  const lift = Math.sin(Math.PI * t) * 0.12;
  const sc = 1 + Math.sin(Math.PI * t) * 0.05;
  return (
    <group position={[0, CY + lift, 0]} rotation={[0, Math.PI * t, 0]} scale={sc}>
      <SignCard lines={FRONT} button="Confirm" position={[0, 0, 0.045]} />
      {t > 0.001 && <SignCard lines={BACK} button="Sign" glow rotation={[0, Math.PI, 0]} position={[0, 0, -0.045]} />}
    </group>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const bAt = 24, cAt = 46, dAt = 84, eAt = 111, fAt = 138;
  const total = props.durationInFrames ?? 182;
  const code = W(props, "code", 0, 0.82);
  const screen = W(props, "screen", 0, 2.83);
  const another = W(props, "another", 0, 5.49);
  const flipAt = another - 2 - fAt; // shot-local
  const [px, py] = project(F, another + 8 - fAt, [0, 0.55, 0.1]);
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={bAt} layout="none"><BrowserShot shot={SA} from={0} /></Sequence>
      <Sequence from={bAt} durationInFrames={cAt - bAt} layout="none">
        <BrowserShot shot={SB} from={bAt} callout={{ text: "INJECTED CODE", at: Math.max(code, bAt + 3), pt: [930, 1060], lab: [790, 1545] }} />
      </Sequence>
      <Sequence from={cAt} durationInFrames={dAt - cAt} layout="none"><BrowserShot shot={SC} from={cAt} page /></Sequence>

      <Sequence from={dAt} durationInFrames={eAt - dAt} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: D.from, target: D.tFrom, fov: D.fov }}>
          <CamRig shot={D} />
          <FlipCard flipAt={999} />
        </Studio3D>
        <Callout text="WHAT THE SCREEN SHOWED" at={[540, 1285]} label={[540, 1395]} startFrame={screen - dAt + 2} size={24} />
      </Sequence>
      <Sequence from={eAt} durationInFrames={fAt - eAt} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: E.from, target: E.tFrom, fov: E.fov }}>
          <CamRig shot={E} />
          <FlipCard flipAt={999} />
        </Studio3D>
      </Sequence>
      <Sequence from={fAt} durationInFrames={total - fAt} layout="none">
        <Studio3D tone="dark" shadows={false} accentRim camera={{ from: F.from, target: F.tFrom, fov: F.fov }}>
          <CamRig shot={F} />
          <FlipCard flipAt={flipAt} />
        </Studio3D>
        <Callout text="WHAT THEY REALLY SIGNED" at={[540, 1300]} label={[540, 1410]} startFrame={another - fAt} accent size={26} />
      </Sequence>

      <Sequence from={0} durationInFrames={eAt} layout="none"><Disclaimer text="Illustration · per NCC Group analysis, Mar 2025" /></Sequence>
      <Sequence from={fAt} layout="none"><Disclaimer text="Illustration · per NCC Group analysis, Mar 2025" /></Sequence>

      <Sfx name="type" at={TYPE0 + 2} volume={0.25} />
      <Sfx name="whoosh_soft" at={bAt} volume={0.28} />
      <Sfx name="type" at={bAt + 6} volume={0.22} />
      <Sfx name="whoosh_soft" at={cAt} volume={0.3} />
      <Sfx name="whoosh_soft" at={dAt} volume={0.3} />
      <Sfx name="tick" at={eAt + 1} volume={0.22} />
      <Sfx name="whoosh_soft" at={fAt} volume={0.25} />
      <Sfx name="whoosh_soft" at={another - 2} volume={0.35} />
    </Shell>
  );
};

export default Scene;
