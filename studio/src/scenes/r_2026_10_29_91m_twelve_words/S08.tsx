// Scene: 2026-10-29-91m-twelve-words S08 — proof beat.
// "It's why screenshots are risky. In 2025, Kaspersky found apps on the App Store and Google Play scanning people's photos for those words."
// Eight hard-cut 2D shots (no fades), every one already travelling:
//  A camera roll scrolls, the 12-word screenshot glows · B push into the screenshot · C "2025" plate · D Kaspersky name card + typed finding
//  E1/E2 two plain store cards, infected app tile (orange) · F orange scan line sweeps the roll, OCR boxes flick on text-like photos
//  G the screenshot: 12 OCR boxes in sequence, words lift off and stream up-right.
// Orange system per shot: A/B the screenshot glow · C the underline · D "SparkCat" · E the infected tile · F the scan · G OCR boxes + words.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Callout, Disclaimer, NameCard, chromeFill, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { PHRASE, W, Sfx, rand, ORANGE, clamp } from "./_shared";

const out3 = Easing.out(Easing.cubic);
const lerp = (a: number, b: number, q: number) => a + (b - a) * q;
/** never starts from rest: mostly linear with a little ease-out */
const mixq = (p: number) => p * 0.7 + out3(p) * 0.3;
const arrive = (f: number, at: number, len = 6) => out3(interpolate(f, [at, at + len], [0, 1], clamp));
const rgba = (a: number) => `rgba(255,128,0,${a})`;

/* ================= camera roll (panel 940×1050 at 70,400) ================= */
const PX = 70, PY = 400, PW = 940, PH = 1050;
const CELL = 230.5, GAP = 6, HEAD = 56, N = 32;
const cellXY = (i: number): [number, number] => [(i % 4) * (CELL + GAP), HEAD + Math.floor(i / 4) * (CELL + GAP)];
const SS = 18; // the screenshot thumbnail
const TEXTY = [5, 7, 10, 12, 15, 17, 21];
type GCam = { s: number; r: number; ax: number; ay: number; px: number; py: number };
const toPanel = (x: number, y: number, c: GCam): [number, number] => {
  const dx = x - c.px, dy = y - c.py, cr = Math.cos((c.r * Math.PI) / 180), sr = Math.sin((c.r * Math.PI) / 180);
  return [c.ax + c.s * (dx * cr - dy * sr), c.ay + c.s * (dx * sr + dy * cr)];
};
const toScreen = (x: number, y: number, c: GCam): [number, number] => {
  const [a, b] = toPanel(x, y, c);
  return [PX + a, PY + b];
};

/** 230×230 design-space screenshot of a generic recovery-phrase screen (made-up words, nobody's wallet). */
export const wordRect = (i: number) => ({ x: 14 + (i % 2) * 108, y: 58 + Math.floor(i / 2) * 26, w: 96, h: 21 });
const ShotImg: React.FC<{ glow?: number; hidden?: number[] }> = ({ glow = 0, hidden = [] }) => (
  <div style={{ position: "relative", width: 230, height: 230, background: "#0b0c0e", borderRadius: 10, overflow: "visible",
    boxShadow: glow > 0 ? `0 0 ${22 * glow}px ${3 * glow}px ${rgba(0.55 * glow)}, 0 0 0 ${1.6 * glow}px ${rgba(glow)}` : "0 0 0 1px rgba(255,255,255,0.06)", fontFamily: brand.body }}>
    <div style={{ position: "absolute", left: 14, top: 11, fontSize: 15, fontWeight: 700, color: "#fff" }}>Recovery phrase</div>
    <div style={{ position: "absolute", left: 14, top: 33, fontSize: 8.2, fontWeight: 500, color: "#8d8e93" }}>Write these down. Never share them.</div>
    {PHRASE.map((w, i) => {
      const r = wordRect(i);
      const gone = hidden.includes(i);
      return (
        <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 6, background: gone ? "#101113" : "#1a1b1f",
          border: gone ? "0.6px dashed rgba(255,255,255,0.12)" : "none", display: "flex", alignItems: "center", gap: 7, paddingLeft: 8, boxSizing: "border-box" }}>
          {!gone && <span style={{ fontSize: 9.5, color: "#6c6d72", width: 11 }}>{i + 1}</span>}
          {!gone && <span style={{ fontSize: 13.5, fontWeight: 600, color: "#f1f1f2" }}>{w}</span>}
        </div>
      );
    })}
  </div>
);

const Thumb: React.FC<{ i: number }> = ({ i }) => {
  const hue = 190 + rand(i * 1.7) * 70, sat = 5 + rand(i * 2.3) * 9, l1 = 13 + rand(i * 3.1) * 9, l2 = l1 + 6 + rand(i * 4.7) * 9;
  const texty = TEXTY.includes(i);
  const bg = [
    `radial-gradient(circle at ${20 + rand(i * 5.3) * 60}% ${15 + rand(i * 6.1) * 50}%, hsla(${hue},${sat + 5}%,${l2 + 17}%,0.5) 0, transparent ${30 + rand(i * 7.7) * 25}%)`,
    `radial-gradient(circle at ${10 + rand(i * 8.3) * 80}% ${55 + rand(i * 9.7) * 40}%, hsla(${hue + 30},${sat}%,${l1 + 4}%,0.7) 0, transparent 55%)`,
    `linear-gradient(${Math.round(rand(i * 9.1) * 360)}deg, hsl(${hue} ${sat}% ${l1}%), hsl(${hue + 20} ${sat}% ${l2}%))`,
  ].join(",");
  return (
    <div style={{ width: "100%", height: "100%", background: texty ? "linear-gradient(160deg,#2d2e32,#222326)" : bg, position: "relative", overflow: "hidden" }}>
      {texty && [0, 1, 2, 3, 4, 5].map((k) => (
        <div key={k} style={{ position: "absolute", left: 28, top: 40 + k * 26, height: k === 0 ? 13 : 8, borderRadius: 3, background: "rgba(228,228,231,0.5)",
          width: k === 0 ? 110 : 90 + rand(i * 11 + k) * 88 }} />
      ))}
    </div>
  );
};

const Roll: React.FC<{ cam: GCam; glow?: number; boxes?: Record<number, number>; f: number; scanY?: number | null }> = ({ cam, glow = 0, boxes = {}, f, scanY = null }) => (
  <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, overflow: "hidden", borderRadius: 30, background: "#0d0e10" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: 2000, transformOrigin: "0 0",
      transform: `translate(${cam.ax}px,${cam.ay}px) rotate(${cam.r}deg) scale(${cam.s}) translate(${-cam.px}px,${-cam.py}px)` }}>
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = cellXY(i);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: CELL, height: CELL, zIndex: i === SS ? 2 : 1 }}>
            {i === SS ? <ShotImg glow={glow} /> : <Thumb i={i} />}
          </div>
        );
      })}
      {Object.entries(boxes).map(([k, at]) => {
        const i = Number(k);
        if (f < at) return null;
        const [x, y] = cellXY(i);
        const q = out3(interpolate(f, [at, at + 4], [0, 1], clamp));
        const r = i === SS ? { x: 6, y: 6, w: 218, h: 218 } : { x: 18, y: 32, w: 194, h: 170 };
        return (
          <div key={k} style={{ position: "absolute", left: x + r.x, top: y + r.y, width: r.w, height: r.h, zIndex: 3, opacity: Math.min(1, q * 1.6),
            transform: `scale(${1.18 - 0.18 * q})`, border: `${1.6 / Math.max(1, cam.s * 0.9)}px solid ${ORANGE}`, background: rgba(0.1),
            boxShadow: `0 0 12px ${rgba(0.65)}`, borderRadius: 4 }} />
        );
      })}
    </div>
    {/* fixed header */}
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: HEAD, background: "linear-gradient(180deg,rgba(13,14,16,0.97),rgba(13,14,16,0.82))", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 26px", fontFamily: brand.body, color: "#fff", zIndex: 5 }}>
      <span style={{ fontSize: 25, fontWeight: 700 }}>Recents</span>
      <span style={{ fontSize: 20, fontWeight: 500, color: "#9a9ba0" }}>Select</span>
    </div>
    {scanY !== null && (
      <div style={{ position: "absolute", left: 0, right: 0, top: scanY - 150, height: 150, zIndex: 6, background: "linear-gradient(180deg, transparent, rgba(255,128,0,0.16))" }} />
    )}
    {scanY !== null && (
      <div style={{ position: "absolute", left: 0, right: 0, top: scanY - 1.5, height: 3, zIndex: 7, background: ORANGE, boxShadow: `0 0 18px 4px ${rgba(0.8)}, 0 0 60px 12px ${rgba(0.4)}` }} />
    )}
    <div style={{ position: "absolute", inset: 0, borderRadius: 30, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09)", zIndex: 8, pointerEvents: "none" }} />
  </div>
);

const Bg: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 55% at 50% 30%, #1d1f23 0%, #101113 62%, #0b0c0e 100%)" }} />
);

/* ================= shot A: the roll scrolls, screenshot glows ================= */
const shotA = (f: number, len: number): GCam => {
  const p = interpolate(f, [0, len], [0, 1], clamp);
  return { s: 1 + 0.04 * p, r: 0, ax: 470, ay: 525, px: 470, py: 642 + 15 * f };
};
const ShotA: React.FC<{ fScreens: number }> = ({ fScreens }) => {
  const f = useCurrentFrame();
  const cam = shotA(f, 30);
  const [sx, sy] = toScreen(cellXY(SS)[0] + 115, cellXY(SS)[1] + 115, cam);
  return (
    <AbsoluteFill>
      <Bg />
      <Roll cam={cam} f={f} glow={arrive(f, fScreens, 8) * 0.95} />
      <Callout text="SCREENSHOT" at={[sx + 40, sy - 20]} label={[Math.min(900, sx + 270), sy - 230]} startFrame={fScreens} accent />
    </AbsoluteFill>
  );
};

/* ================= shot B: push into the screenshot ================= */
const ShotB: React.FC<{ len: number; fRisky: number }> = ({ len, fRisky }) => {
  const f = useCurrentFrame();
  const q = mixq(interpolate(f, [0, len], [0, 1], clamp));
  const cam: GCam = { s: lerp(2.3, 3.75, q), r: lerp(-2.6, -0.8, q), ax: lerp(470, 452, q), ay: lerp(525, 520, q), px: cellXY(SS)[0] + 115, py: cellXY(SS)[1] + 115 };
  const pulse = interpolate(f, [fRisky, fRisky + 4, fRisky + 10], [0.85, 1.25, 1], clamp);
  return (
    <AbsoluteFill>
      <Bg />
      <Roll cam={cam} f={f} glow={Math.min(1, pulse)} />
    </AbsoluteFill>
  );
};

/* ================= shot C: "2025" plate ================= */
const ShotC: React.FC<{ len: number; at: number }> = ({ len, at }) => {
  const f = useCurrentFrame();
  const q = mixq(interpolate(f, [0, len], [0, 1], clamp));
  const land = arrive(f, at, 5);
  const line = out3(interpolate(f, [at + 4, at + 14], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{ transformOrigin: "50% 52%", transform: `translate(${lerp(40, -30, q)}px,${lerp(28, -14, q)}px) rotate(${lerp(-1.6, 0.4, q)}deg) scale(${lerp(1.14, 1.0, q)})` }}>
        <div style={{ position: "absolute", left: 100, top: 560, width: 880, height: 700, borderRadius: 36, background: "linear-gradient(160deg,#1b1c20,#131416)",
          boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.12), 0 40px 90px rgba(0,0,0,0.55)" }}>
          <div style={{ position: "absolute", left: 48, top: 44, fontFamily: brand.body, fontWeight: 700, fontSize: 24, letterSpacing: 3.2, color: "rgba(255,255,255,0.5)" }}>THREAT RESEARCH REPORT</div>
          <div style={{ position: "absolute", right: 48, top: 44, fontFamily: brand.body, fontWeight: 700, fontSize: 24, letterSpacing: 3.2, color: "rgba(255,255,255,0.5)" }}>05 FEB</div>
          <div style={{ position: "absolute", left: 48, right: 48, top: 98, height: 1.5, background: "rgba(255,255,255,0.14)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", opacity: land, transform: `scale(${1.22 - 0.22 * land})` }}>
            <span style={{ fontFamily: brand.display, fontWeight: 900, fontSize: 250, letterSpacing: -4, lineHeight: 1, ...chromeFill(false, "dark") }}>2025</span>
          </div>
          <div style={{ position: "absolute", left: 130, top: 560, width: 620 * line, height: 5, background: ORANGE, boxShadow: `0 0 18px 3px ${rgba(0.7)}` }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= shot D: Kaspersky name card + typed finding ================= */
const FINDING = "SparkCat: malware that reads screenshots to steal recovery phrases";
const ShotD: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const q = mixq(interpolate(f, [0, len], [0, 1], clamp));
  const t0 = 5, t1 = len - 5;
  const n = Math.round(interpolate(f, [t0, t1], [0, FINDING.length], clamp));
  const shown = FINDING.slice(0, n);
  const split = "SparkCat:".length;
  const part = (s: string, from: number) => s.slice(from);
  const cur = f % 8 < 5;
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{ transformOrigin: "50% 55%", transform: `translate(${lerp(-24, 18, q)}px,${lerp(26, -10, q)}px) scale(${lerp(1.0, 1.1, q)})` }}>
        <NameCard name="Kaspersky" role="Security researchers · 5 Feb 2025" y={680} width={860} />
        <div style={{ position: "absolute", left: 110, top: 980, width: 860, minHeight: 300, borderRadius: 28, padding: "40px 46px", boxSizing: "border-box",
          background: "linear-gradient(160deg,#1a1b1f,#131416)", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.12), 0 30px 70px rgba(0,0,0,0.5)", fontFamily: brand.body }}>
          <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 3, color: "rgba(255,255,255,0.45)", marginBottom: 18 }}>FINDING</div>
          <div style={{ position: "relative", fontWeight: 600, fontSize: 52, lineHeight: 1.22, color: "#fff", letterSpacing: -0.4 }}>
            <span style={{ opacity: 0 }}>{FINDING}</span>
            <span style={{ position: "absolute", left: 0, top: 0 }}>
              <span style={{ color: ORANGE }}>{shown.slice(0, split)}</span>
              {part(shown, split)}
              <span style={{ color: ORANGE, opacity: cur || n < FINDING.length ? 1 : 0, fontWeight: 300 }}>|</span>
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= shots E1 / E2: two plain store cards ================= */
const CW = 420, CH = 640, CY = 610, CXL = 100, CXR = 560;
const ROW0 = 112, ROWH = 150;
const StoreCard: React.FC<{ x: number; title: string; cta: string; glow: number }> = ({ x, title, cta, glow }) => (
  <div style={{ position: "absolute", left: x, top: CY, width: CW, height: CH, borderRadius: 34, background: "linear-gradient(165deg,#1b1c20,#131416)",
    boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.12), 0 36px 80px rgba(0,0,0,0.55)", fontFamily: brand.body }}>
    <div style={{ position: "absolute", left: 30, top: 30, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(145deg,#8b8c92,#4a4b50)", position: "relative" }}>
        <div style={{ position: "absolute", left: 9, right: 9, top: 11, height: 4, borderRadius: 2, background: "#17181b" }} />
        <div style={{ position: "absolute", left: 9, right: 14, top: 21, height: 4, borderRadius: 2, background: "#17181b" }} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 3.4, color: "rgba(255,255,255,0.86)" }}>{title}</div>
    </div>
    <div style={{ position: "absolute", left: 30, right: 30, top: 88, height: 1.5, background: "rgba(255,255,255,0.1)" }} />
    {[0, 1, 2].map((k) => {
      const bad = k === 1;
      const top = ROW0 + k * ROWH;
      return (
        <div key={k} style={{ position: "absolute", left: 30, right: 30, top, height: 118 }}>
          <div style={{ position: "absolute", left: 0, top: 6, width: 90, height: 90, borderRadius: 22,
            background: bad ? "linear-gradient(145deg,#2a1c10,#15100b)" : "linear-gradient(145deg,#4b4c52,#2b2c30)",
            boxShadow: bad ? `inset 0 0 0 ${2.5 * glow}px ${rgba(glow)}, 0 0 ${34 * glow}px ${6 * glow}px ${rgba(0.55 * glow)}` : "none" }}>
            {bad && <div style={{ position: "absolute", inset: 24, borderRadius: 10, border: `3px solid ${rgba(0.9 * glow)}` }} />}
          </div>
          <div style={{ position: "absolute", left: 112, top: 14, width: 150 + (k === 2 ? -30 : 0), height: 15, borderRadius: 8, background: "#44454a" }} />
          {bad ? (
            <div style={{ position: "absolute", left: 112, top: 48, fontWeight: 700, fontSize: 19, letterSpacing: 2.6, color: ORANGE, opacity: glow }}>INFECTED APP</div>
          ) : (
            <div style={{ position: "absolute", left: 112, top: 48, width: 104, height: 11, borderRadius: 6, background: "#2f3034" }} />
          )}
          <div style={{ position: "absolute", left: 112, top: 76, width: 86, height: 30, borderRadius: 15, background: "#2a2b2f", color: "#a9aab0", fontWeight: 700, fontSize: 14,
            letterSpacing: 1.6, textAlign: "center", lineHeight: "30px" }}>{cta}</div>
        </div>
      );
    })}
  </div>
);

const ShotE1: React.FC<{ len: number; fApp: number }> = ({ len, fApp }) => {
  const f = useCurrentFrame();
  const q = mixq(interpolate(f, [0, len], [0, 1], clamp));
  const s = lerp(1.22, 1.0, q), fx = lerp(330, 540, q), fy = 920, ax = 540, ay = 940;
  const sc = (x: number, y: number): [number, number] => [ax + s * (x - fx), ay + s * (y - fy)];
  const gl = arrive(f, fApp, 7);
  const tile = sc(CXL + 30 + 45, CY + ROW0 + ROWH + 6 + 45);
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${ax}px,${ay}px) scale(${s}) translate(${-fx}px,${-fy}px)` }}>
        <StoreCard x={CXL} title="APP STORE" cta="GET" glow={gl} />
        <StoreCard x={CXR} title="GOOGLE PLAY" cta="INSTALL" glow={0} />
      </AbsoluteFill>
      <Callout text="FIRST OCR STEALER ON THE APP STORE" at={tile} label={[540, 500]} startFrame={fApp + 3} accent />
    </AbsoluteFill>
  );
};

const ShotE2: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const q = mixq(interpolate(f, [0, len], [0, 1], clamp));
  const s = lerp(1.32, 1.46, q), fx = lerp(800, 770, q), fy = 900, ax = 540, ay = 940;
  const gl = arrive(f, 1, 7);
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${ax}px,${ay}px) scale(${s}) translate(${-fx}px,${-fy}px)` }}>
        <StoreCard x={CXL} title="APP STORE" cta="GET" glow={1} />
        <StoreCard x={CXR} title="GOOGLE PLAY" cta="INSTALL" glow={gl} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= shot F: orange scan line sweeps the roll ================= */
const SCAN_LEN = 38;
const camF = (f: number): GCam => ({ s: lerp(1.08, 1.17, f / 40), r: lerp(2, 0.4, f / 40), ax: 470, ay: 525, px: 470, py: 820 + 6 * f });
const scanYat = (f: number) => lerp(30, 1030, Math.min(1, f / SCAN_LEN));
/** local frame at which the scan line first passes each text-like thumbnail */
const flicks = (): Record<number, number> => {
  const o: Record<number, number> = {};
  [...TEXTY, SS].forEach((i) => {
    const cy = cellXY(i)[1] + 115;
    for (let f = 0; f < 44; f++) {
      if (scanYat(f) >= toPanel(0, cy, camF(f))[1]) { o[i] = f; break; }
    }
  });
  return o;
};
const ShotF: React.FC = () => {
  const f = useCurrentFrame();
  const fl = flicks();
  const vis: Record<number, number> = {};
  Object.entries(fl).forEach(([k, v]) => { if (f >= v) vis[Number(k)] = v; });
  return (
    <AbsoluteFill>
      <Bg />
      <Roll cam={camF(f)} f={f} boxes={vis} scanY={f <= SCAN_LEN + 4 ? scanYat(f) : null} glow={vis[SS] !== undefined ? 0.6 : 0} />
    </AbsoluteFill>
  );
};

/* ================= shot G: OCR boxes on the 12 words, then they stream away ================= */
const GS = 3.9, GX = 90, GY = 450;
const ShotG: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const q = mixq(interpolate(f, [0, len], [0, 1], clamp));
  const boxAt = (i: number) => 1 + i * 1.3;
  const liftAt = (i: number) => 12 + i * 0.85;
  const FLIGHT = 11;
  const hidden = PHRASE.map((_, i) => i).filter((i) => f >= liftAt(i));
  const wr = (i: number) => {
    const r = wordRect(i);
    return { x: GX + r.x * GS, y: GY + r.y * GS, w: r.w * GS, h: r.h * GS };
  };
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{ transformOrigin: "50% 50%", transform: `translate(${lerp(18, -14, q)}px,${lerp(22, -8, q)}px) rotate(${lerp(-1.2, 0.3, q)}deg) scale(${lerp(1.0, 1.06, q)})` }}>
        <div style={{ position: "absolute", left: GX, top: GY, width: 230, height: 230, transformOrigin: "0 0", transform: `scale(${GS})` }}>
          <ShotImg glow={0} hidden={hidden} />
        </div>
        {PHRASE.map((w, i) => {
          const r = wr(i);
          const b = out3(interpolate(f, [boxAt(i), boxAt(i) + 3], [0, 1], clamp));
          const lifted = f >= liftAt(i);
          const t = interpolate(f, [liftAt(i), liftAt(i) + FLIGHT], [0, 1], clamp);
          const te = Math.pow(t, 1.7);
          const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
          const dx = (940 + 40 * (i % 4)) * te, dy = -(780 + 30 * (i % 3)) * te;
          const ang = (Math.atan2(-(780 + 30 * (i % 3)), 940 + 40 * (i % 4)) * 180) / Math.PI;
          return (
            <React.Fragment key={i}>
              {f >= boxAt(i) && !lifted && (
                <div style={{ position: "absolute", left: r.x - 6, top: r.y - 6, width: r.w + 12, height: r.h + 12, opacity: Math.min(1, b * 1.6), transform: `scale(${1.2 - 0.2 * b})`,
                  border: `3px solid ${ORANGE}`, borderRadius: 14, background: rgba(0.1), boxShadow: `0 0 20px ${rgba(0.7)}` }} />
              )}
              {lifted && t < 1 && (
                <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(${dx}px,${dy}px) rotate(${ang}deg)`, opacity: interpolate(t, [0.75, 1], [1, 0], clamp) }}>
                  <div style={{ position: "absolute", right: 0, top: -3, width: 190 * te + 20, height: 6, borderRadius: 3, background: `linear-gradient(90deg, transparent, ${rgba(0.55)})`, transform: "translate(-120px,0)" }} />
                  <div style={{ transform: `translate(-50%,-50%) rotate(${-ang}deg) scale(${lerp(0.82, 0.55, te)})`, whiteSpace: "nowrap", padding: "14px 34px", borderRadius: 22, background: ORANGE,
                    color: "#0b0703", fontFamily: brand.body, fontWeight: 700, fontSize: 54, boxShadow: `0 0 36px 6px ${rgba(0.55)}` }}>
                    <span style={{ opacity: 0.55, fontSize: 36, marginRight: 14 }}>{i + 1}</span>{w}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <Callout text="OCR" at={[wr(1).x + wr(1).w - 10, wr(1).y + 6]} label={[900, 540]} startFrame={3} accent />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================= scene ================= */
const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 275;
  const fScreens = W(props, "screenshots");
  const cutB = W(props, "are");
  const cutC = W(props, "In");
  const cutD = W(props, "Kaspersky");
  const cutE1 = W(props, "App") - 5;
  const cutE2 = W(props, "Google");
  const cutF = W(props, "scanning");
  const cutG = W(props, "for");
  const fRisky = W(props, "risky");
  const f2025 = W(props, "2025");
  const seq = (from: number, to: number, node: React.ReactNode) => (
    <Sequence from={from} durationInFrames={to - from} layout="none">{node}</Sequence>
  );
  // scan ticks: first-pass frames, one per distinct frame, never on a cue frame
  const used = new Set<number>([cutB, cutC, cutD, cutE1, cutF, cutG + 12, f2025, cutD + 6]);
  const ticks: number[] = [];
  Object.values(flicks()).sort((a, b) => a - b).forEach((v) => {
    let t = cutF + v;
    while (used.has(t)) t++;
    used.add(t);
    ticks.push(t);
  });
  return (
    <Shell props={props} tone="dark">
      {seq(0, cutB, <ShotA fScreens={fScreens} />)}
      {seq(cutB, cutC, <ShotB len={cutC - cutB} fRisky={fRisky - cutB} />)}
      {seq(cutC, cutD, <ShotC len={cutD - cutC} at={f2025 - cutC} />)}
      {seq(cutD, cutE1, <ShotD len={cutE1 - cutD} />)}
      {seq(cutE1, cutE2, <ShotE1 len={cutE2 - cutE1} fApp={W(props, "App") - cutE1} />)}
      {seq(cutE2, cutF, <ShotE2 len={cutF - cutE2} />)}
      {seq(cutF, cutG, <ShotF />)}
      {seq(cutG, total, <ShotG len={total - cutG} />)}

      <Disclaimer text="Source: Kaspersky, 5 Feb 2025 · illustration" />

      {[cutB, cutC, cutD, cutE1].map((c) => <Sfx key={c} name="whoosh_soft" at={c} volume={0.28} />)}
      <Sfx name="click" at={f2025} volume={0.25} />
      <Sfx name="type" at={cutD + 6} volume={0.22} />
      <Sfx name="whoosh_soft" at={cutF} volume={0.3} />
      {ticks.map((t) => <Sfx key={t} name="tick" at={t} volume={0.22} />)}
      {[1, 4, 7, 10].map((k) => <Sfx key={`g${k}`} name="tick" at={cutG + Math.round(1 + k * 1.3)} volume={0.2} />)}
      <Sfx name="whoosh_soft" at={cutG + 12} volume={0.32} />
    </Shell>
  );
};

export default Scene;
