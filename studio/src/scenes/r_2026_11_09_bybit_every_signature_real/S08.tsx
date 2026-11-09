// Scene: 2026-11-09-bybit-every-signature-real S08 — "In 2024, signature scams drained $494 million from 332,000 wallets."
// Proof beat. Orange system = the totals. All 2D (documents, numbers, fields), hard cuts, camera always travelling.
// Shots: 1a report plate · 1b rising line chart · 2a signature cards stacking · 2b tilted run along the stack ·
//        3a giant $494M lands · 3b macro slide along $494,000,000 · 4a wallet dot field filling (tight) · 4b pulled back, 332,000.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Callout, Disclaimer, chromeFill, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { W, Sfx, rand, ORANGE, clamp } from "./_shared";

const out = Easing.out(Easing.cubic);
const MONO = "'DejaVu Sans Mono', monospace";
const BG = "rgba(11,11,11,";

/* camera for flat shots: scale S about world point (fx,fy), rotated; content in 1080×1920 world px */
const Cam2D: React.FC<{ S: number; fx: number; fy: number; rot?: number; children: React.ReactNode }> = ({ S, fx, fy, rot = 0, children }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: "0 0",
      transform: `translate(540px,960px) rotate(${rot}deg) scale(${S}) translate(${-fx}px,${-fy}px)` }}>{children}</div>
  </AbsoluteFill>
);
const w2s = (wx: number, wy: number, S: number, fx: number, fy: number, rot = 0): [number, number] => {
  const dx = (wx - fx) * S, dy = (wy - fy) * S, r = (rot * Math.PI) / 180;
  return [540 + dx * Math.cos(r) - dy * Math.sin(r), 960 + dx * Math.sin(r) + dy * Math.cos(r)];
};
/** keeps world content out of the caption band (soft mask above y≈390) */
const Keep: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ WebkitMaskImage: "linear-gradient(180deg, transparent 0px, transparent 350px, #000 405px, #000 1390px, transparent 1445px)", maskImage: "linear-gradient(180deg, transparent 0px, transparent 350px, #000 405px, #000 1390px, transparent 1445px)" }}>{children}</AbsoluteFill>
);

const Tick: React.FC<{ s?: number; on?: number }> = ({ s = 22, on = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ opacity: on, filter: "drop-shadow(0 0 6px rgba(255,128,0,0.8))" }}>
    <circle cx="12" cy="12" r="11" fill={ORANGE} />
    <path d="M6.5 12.5l3.8 3.8 7.2-8" stroke="#0b0b0b" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ============================ shot 1a: the report plate ============================ */
const Plate: React.FC<{ f: number; chart?: number }> = ({ f, chart = 0 }) => {
  const pop = interpolate(f, [0, 6], [0.94, 1], { ...clamp, easing: out });
  const glint = interpolate(f, [0, 40], [-20, 130], clamp);
  return (
    <div style={{ position: "absolute", left: 110, top: 640, width: 860, height: 640, borderRadius: 40, transform: `scale(${pop})`, transformOrigin: "50% 50%",
      background: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 55%, rgba(255,255,255,0.10))", border: "1.5px solid rgba(255,255,255,0.26)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3)", overflow: "hidden", fontFamily: brand.body, color: "#fff" }}>
      <div style={{ position: "absolute", left: 56, top: 50, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: "rgba(255,255,255,0.5)" }}>ANNUAL REPORT · JAN 2025</div>
      <div style={{ position: "absolute", left: 56, top: 96, fontWeight: 700, fontSize: 54, lineHeight: 1.08 }}>2024 Web3<br />Phishing Report</div>
      <div style={{ position: "absolute", left: 56, top: 238, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.65)" }}>Scam Sniffer</div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 296, height: 1.5, background: "rgba(255,255,255,0.18)" }} />
      <Chart x={56} y={330} w={748} h={250} p={chart} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${glint - 10}%, rgba(255,255,255,0.30) ${glint}%, transparent ${glint + 10}%)`, pointerEvents: "none" }} />
    </div>
  );
};
const PTS = [0.08, 0.14, 0.12, 0.2, 0.26, 0.24, 0.34, 0.41, 0.4, 0.52, 0.6, 0.72, 0.9];
const Chart: React.FC<{ x: number; y: number; w: number; h: number; p: number }> = ({ x, y, w, h, p }) => {
  const pts = PTS.map((v, i) => [x + (w * i) / (PTS.length - 1), y + h - v * h] as const);
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q[0] - x},${q[1] - y}`).join(" ");
  const tip = Math.min(PTS.length - 1, p * (PTS.length - 1));
  const i0 = Math.floor(tip), i1 = Math.min(PTS.length - 1, i0 + 1), fr = tip - i0;
  const tx = pts[i0][0] + (pts[i1][0] - pts[i0][0]) * fr - x, ty = pts[i0][1] + (pts[i1][1] - pts[i0][1]) * fr - y;
  return (
    <svg width={w} height={h + 20} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} x2={w} y1={h - g * h} y2={h - g * h} stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />)}
      <path d={d} fill="none" stroke="rgba(235,235,235,0.85)" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {p > 0.02 && <circle cx={tx} cy={ty} r={9} fill={ORANGE} style={{ filter: "drop-shadow(0 0 10px rgba(255,128,0,0.9))" }} />}
    </svg>
  );
};

const Shot1a: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = f / len;
  return (
    <Keep><Cam2D S={interpolate(t, [0, 1], [1.22, 1.02])} fx={interpolate(t, [0, 1], [440, 560])} fy={interpolate(t, [0, 1], [900, 960])} rot={interpolate(t, [0, 1], [-1.8, 0.5])}>
      <Plate f={f} chart={0.12} />
    </Cam2D></Keep>
  );
};
const Shot1b: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = f / len;
  const p = interpolate(f, [0, len - 2], [0.12, 1], { ...clamp, easing: Easing.bezier(0.3, 0.1, 0.5, 1) });
  return (
    <Keep><Cam2D S={interpolate(t, [0, 1], [1.9, 1.45])} fx={interpolate(t, [0, 1], [300, 780])} fy={interpolate(t, [0, 1], [1130, 1100])} rot={interpolate(t, [0, 1], [1.4, -1.2])}>
      <Plate f={f + 24} chart={p} />
    </Cam2D></Keep>
  );
};

/* ============================ shot 2: signature cards ============================ */
const KINDS = ["Permit", "Approve", "Sign", "Permit2", "Transfer"];
const CARD = { w: 290, h: 100, px: 310, py: 114, cxs: [230, 540, 850] };
const SigCard: React.FC<{ k: number; lit: number; x: number; y: number }> = ({ k, lit, x, y }) => (
  <div style={{ position: "absolute", left: x - CARD.w / 2, top: y - CARD.h / 2, width: CARD.w, height: CARD.h, borderRadius: 18, boxSizing: "border-box",
    background: "linear-gradient(135deg, #1c1d21, #131417)", border: "1.5px solid rgba(255,255,255,0.16)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", fontFamily: brand.body, color: "#fff", padding: "16px 20px" }}>
    <div style={{ fontWeight: 700, fontSize: 26 }}>{KINDS[k % KINDS.length]}</div>
    <div style={{ fontFamily: MONO, fontSize: 17, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>0x{(Math.floor(rand(k + 3) * 0xfffff)).toString(16).padStart(5, "0")}…{(Math.floor(rand(k + 9) * 0xff)).toString(16).padStart(2, "0")}</div>
    <div style={{ position: "absolute", right: 18, top: 16 }}><Tick s={26} on={lit} /></div>
  </div>
);
const cardXY = (k: number, rows: number) => ({ x: CARD.cxs[k % 3], y: 1400 - Math.floor(k / 3) * CARD.py - 0 * rows });

const Shot2a: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = f / len;
  const n = 33;
  return (
    <Keep><Cam2D S={interpolate(t, [0, 1], [1.0, 0.86])} fx={540} fy={interpolate(t, [0, 1], [1130, 1010])} rot={interpolate(t, [0, 1], [-1.2, 0.8])}>
      {Array.from({ length: n }).map((_, k) => {
        const a = f - k * 0.85;
        if (a < 0) return null;
        const { x, y } = cardXY(k, 0);
        const pop = interpolate(a, [0, 5], [0, 1], { ...clamp, easing: out });
        return <div key={k} style={{ opacity: pop, transform: `translateY(${(1 - pop) * 60}px)` }}><SigCard k={k} lit={interpolate(a, [3, 6], [0, 1], clamp)} x={x} y={y} /></div>;
      })}
    </Cam2D></Keep>
  );
};
const Shot2b: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = f / len;
  const q = t * 0.7 + out(t) * 0.3;
  const n = 90;
  return (
    <Keep>
      <AbsoluteFill style={{ perspective: 1000, perspectiveOrigin: "540px 900px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: "0 0",
          transform: `translate(540px,930px) rotateX(52deg) rotateZ(${interpolate(t, [0, 1], [5, 1])}deg) scale(${interpolate(t, [0, 1], [1.25, 1.0])}) translate(${-(540 - 14 * t)}px,${-interpolate(q, [0, 1], [1380, 760])}px)` }}>
          {Array.from({ length: n }).map((_, k) => {
            const { x, y } = cardXY(k, 0);
            return <SigCard key={k} k={k + 33} lit={1} x={x} y={y} />;
          })}
        </div>
      </AbsoluteFill>
    </Keep>
  );
};

/* ============================ shot 3: $494M ============================ */
const Shot3a: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = f / len;
  const land = interpolate(f, [0, 5], [1.5, 1], { ...clamp, easing: out });
  const op = interpolate(f, [0, 3], [0, 1], clamp);
  const sweep = interpolate(f, [6, 34], [-30, 130], clamp);
  return (
    <AbsoluteFill>
      <Cam2D S={interpolate(t, [0, 1], [0.96, 1.08])} fx={interpolate(t, [0, 1], [500, 560])} fy={interpolate(t, [0, 1], [930, 950])} rot={interpolate(t, [0, 1], [-1.4, 0.8])}>
        <div style={{ position: "absolute", left: 0, top: 800, width: 1080, textAlign: "center", opacity: op, transform: `scale(${land})`, transformOrigin: "50% 50%" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <span style={{ fontFamily: brand.display, fontWeight: 800, fontSize: 230, letterSpacing: -6, lineHeight: 1, ...chromeFill(true), filter: "drop-shadow(0 0 40px rgba(255,128,0,0.45))" }}>$494M</span>
            <span style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,0.55) ${sweep}%, transparent ${sweep + 12}%)`, mixBlendMode: "overlay" }} />
          </div>
          <div style={{ marginTop: 26, fontFamily: brand.body, fontWeight: 600, fontSize: 28, letterSpacing: 6, color: "rgba(255,255,255,0.62)" }}>SIGNATURE SCAMS · 2024</div>
        </div>
      </Cam2D>
    </AbsoluteFill>
  );
};
const Shot3b: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = f / len;
  const S = interpolate(t, [0, 1], [1.08, 1.0]);
  const rot = interpolate(t, [0, 1], [2.2, -1.6]);
  const fx = interpolate(t, [0, 1], [600, 500]);
  const fy = 930;
  const bar = interpolate(f, [0, len - 3], [0.1, 1], { ...clamp, easing: out });
  const at = w2s(540, 1030, S, fx, fy, rot);
  return (
    <AbsoluteFill>
      <Cam2D S={S} fx={fx} fy={fy} rot={rot}>
        <div style={{ position: "absolute", left: 0, top: 800, width: 1080, textAlign: "center", fontFamily: brand.display, fontWeight: 800, fontSize: 200, letterSpacing: -5, lineHeight: 1, ...chromeFill(true), filter: "drop-shadow(0 0 36px rgba(255,128,0,0.45))", whiteSpace: "nowrap" }}>$494M</div>
        <div style={{ position: "absolute", left: 160, top: 1040, width: 760, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", left: 160, top: 1040, width: 760 * bar, height: 14, borderRadius: 7, background: `linear-gradient(90deg, #B85400, ${ORANGE})`, boxShadow: "0 0 24px rgba(255,128,0,0.7)" }} />
      </Cam2D>
      <Callout text="DRAINED IN ONE YEAR" at={[at[0] + 120, at[1] + 28]} label={[at[0] + 120, at[1] + 190]} startFrame={4} />
    </AbsoluteFill>
  );
};

/* ============================ shot 4: 332,000 wallets ============================ */
const DOT = { cols: 30, rows: 30, pitch: 27, x0: 148, y0: 425 };
const NDOT = DOT.cols * DOT.rows;
const THR = Array.from({ length: NDOT }, (_, i) => rand(i * 1.7 + 4));
const Field: React.FC<{ p: number }> = ({ p }) => (
  <>
    {Array.from({ length: NDOT }).map((_, i) => {
      const cx = DOT.x0 + (i % DOT.cols) * DOT.pitch, cy = DOT.y0 + Math.floor(i / DOT.cols) * DOT.pitch;
      const lit = THR[i] < p;
      return <div key={i} style={{ position: "absolute", left: cx - 7, top: cy - 7, width: 14, height: 14, borderRadius: 4,
        background: lit ? ORANGE : "rgba(255,255,255,0.16)", boxShadow: lit ? "0 0 10px rgba(255,128,0,0.7)" : undefined }} />;
    })}
  </>
);
const Wallets: React.FC<{ g: number; end: number; start: number }> = ({ g, start, end }) => {
  const p = interpolate(g, [start, end], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0.1, 0.5, 1) });
  const n = Math.round(332000 * p);
  const land = interpolate(g, [end - 2, end + 4], [1.12, 1], { ...clamp, easing: out });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1285, textAlign: "center", transform: `scale(${land})` }}>
      <div style={{ fontFamily: brand.display, fontWeight: 800, fontSize: 96, letterSpacing: -1, lineHeight: 1, fontVariantNumeric: "tabular-nums", ...chromeFill(true), filter: "drop-shadow(0 0 26px rgba(255,128,0,0.45))" }}>{n.toLocaleString("en-US")}</div>
      <div style={{ marginTop: 14, fontFamily: brand.body, fontWeight: 600, fontSize: 26, letterSpacing: 6, color: "rgba(255,255,255,0.62)" }}>WALLETS</div>
    </div>
  );
};
const Shot4a: React.FC<{ len: number; start: number; litStart: number; litEnd: number }> = ({ len, start, litStart, litEnd }) => {
  const f = useCurrentFrame();
  const g = f + start;
  const t = f / len;
  const q = t * 0.6 + out(t) * 0.4;
  const p = interpolate(g, [litStart, litEnd], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0.1, 0.5, 1) });
  return (
    <AbsoluteFill>
      <Keep><Cam2D S={Math.exp(interpolate(q, [0, 1], [Math.log(1.7), Math.log(1.08)]))} fx={interpolate(q, [0, 1], [250, 540])} fy={interpolate(q, [0, 1], [640, 960])} rot={interpolate(t, [0, 1], [-2, 0])}>
        <Field p={p} />
      </Cam2D></Keep>
      <Wallets g={g} start={litStart} end={litEnd} />
    </AbsoluteFill>
  );
};
const Shot4b: React.FC<{ len: number; start: number; litStart: number; litEnd: number }> = ({ len, start, litStart, litEnd }) => {
  const f = useCurrentFrame();
  const g = f + start;
  const t = f / len;
  const p = interpolate(g, [litStart, litEnd], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0.1, 0.5, 1) });
  const S = interpolate(t, [0, 1], [1.07, 1.0]);
  const rot = interpolate(t, [0, 1], [0.5, -0.4]);
  const at = w2s(DOT.x0 + 22 * DOT.pitch, DOT.y0 + 24 * DOT.pitch, S, 540, 960, rot);
  return (
    <AbsoluteFill>
      <Keep><Cam2D S={S} fx={540} fy={960} rot={rot}><Field p={p} /></Cam2D></Keep>
      <Wallets g={g} start={litStart} end={litEnd} />
      <Callout text="WALLETS DRAINED" at={at} label={[905, 1310]} startFrame={14} />
    </AbsoluteFill>
  );
};

/* ============================ scene ============================ */
const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 253;
  const c1b = 22;
  const c2a = W(props, "signature", 0, 1.375);
  const c2b = W(props, "scams", 0, 2.275) - 4;
  const c3a = W(props, "$494", 0, 3.107);
  const c3b = W(props, "million", 0, 4.637);
  const c4a = W(props, "from", 0, 5.566);
  const fWal = W(props, "332,000", 0, 5.876);
  const c4b = fWal + 24;
  const litEnd = W(props, "wallets", 0, 7.639) - 2;

  const ticks: number[] = [];
  for (let k = c2a + 4; k < c3a - 2; k += 4) if (![c2b, c3a].includes(k)) ticks.push(k);
  const wTicks: number[] = [];
  for (let k = fWal + 2; k < litEnd; k += 4) if (![c4b].includes(k)) wTicks.push(k);

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c1b} layout="none"><Shot1a len={c1b} /></Sequence>
      <Sequence from={c1b} durationInFrames={c2a - c1b} layout="none"><Shot1b len={c2a - c1b} /></Sequence>
      <Sequence from={c2a} durationInFrames={c2b - c2a} layout="none"><Shot2a len={c2b - c2a} /></Sequence>
      <Sequence from={c2b} durationInFrames={c3a - c2b} layout="none"><Shot2b len={c3a - c2b} /></Sequence>
      <Sequence from={c3a} durationInFrames={c3b - c3a} layout="none"><Shot3a len={c3b - c3a} /></Sequence>
      <Sequence from={c3b} durationInFrames={c4a - c3b} layout="none"><Shot3b len={c4a - c3b} /></Sequence>
      <Sequence from={c4a} durationInFrames={c4b - c4a} layout="none"><Shot4a len={c4b - c4a} start={c4a} litStart={fWal} litEnd={litEnd} /></Sequence>
      <Sequence from={c4b} durationInFrames={total - c4b} layout="none"><Shot4b len={total - c4b} start={c4b} litStart={fWal} litEnd={litEnd} /></Sequence>

      {[c1b, c2a, c2b, c3b, c4a, c4b].map((f) => <Sfx key={f} name="whoosh_soft" at={f} volume={0.3} />)}
      <Sfx name="sub_drop" at={c3a} volume={0.55} />
      {ticks.map((f) => <Sfx key={`t${f}`} name="tick" at={f} volume={0.18} />)}
      {wTicks.map((f) => <Sfx key={`w${f}`} name="tick" at={f} volume={0.12} />)}
      <Sfx name="thud" at={litEnd} volume={0.4} />

      <Disclaimer text="Source: Scam Sniffer, 2024 report (Jan 2025)" />
    </Shell>
  );
};

export default Scene;
