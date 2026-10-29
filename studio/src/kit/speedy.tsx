// DYNK v3 kit additions: the "magnified explainer" grammar (hooks, captions and labels modelled on @speedy_devv).
// See references/style-speedy_devv.md. Works alongside the v2 kit (Shell, Studio3D, NameCard, Footage...).
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { brand } from "../brand";
import tokens from "../../../brand/tokens.json";
import type { Word } from "../components";

const V3 = (tokens as any).v3 ?? {};
const ORANGE = "#FF8000";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const asset = (src: string) => (src.startsWith("http") || src.startsWith("data:") ? src : staticFile(src));
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%¢']/g, "");

/* ---------- phrase splitting: break on punctuation / pauses, max N words ---------- */
export const toPhrases = (words: Word[], maxWords = 6, pauseSec = 0.35): Word[][] => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const endsClause = /[.,!?;:—]$/.test(w.text);
    const pause = next ? next.start - w.end > pauseSec : true;
    if (endsClause || pause || cur.length >= maxWords || !next) { out.push(cur); cur = []; }
  });
  return out;
};

/* ---------- PhraseCaption: sentence-building captions (speedy signature)
   current phrase top centre · spoken words dim grey · current word bright · ONE keyword per phrase
   gets a design-tool selection box with corner handles (DYNK orange) · optional inline emoji ---------- */
export const PhraseCaption: React.FC<{
  words: Word[];
  keywords?: string[];                 // words that get the selection box (first match per phrase only)
  emoji?: Record<string, string>;      // { phone: "📱", electricity: "⚡" } shown before that word
  tone?: "dark" | "light";
  y?: number; size?: number; maxWords?: number; offsetSec?: number;
}> = ({ words, keywords = [], emoji = {}, tone = "dark", y = V3.caption?.y ?? 250, size = V3.caption?.size ?? 46, maxWords = 6, offsetSec = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - offsetSec;
  const phrases = React.useMemo(() => toPhrases(words, maxWords), [words, maxWords]);
  const pIdx = phrases.findIndex((p, i) => t >= p[0].start - 0.03 && t < (phrases[i + 1]?.[0].start ?? p[p.length - 1].end + 0.6));
  if (pIdx < 0) return null;
  const phrase = phrases[pIdx];
  const keys = keywords.map(norm);
  const boxIdx = phrase.findIndex((w) => keys.includes(norm(w.text)));
  const emo: Record<string, string> = {};
  Object.entries(emoji).forEach(([k, v]) => (emo[norm(k)] = v));
  const bright = tone === "dark" ? "#FFFFFF" : "#111214";
  const dim = tone === "dark" ? "rgba(255,255,255,0.45)" : "rgba(17,18,20,0.42)";
  return (
    <div style={{ position: "absolute", top: y, left: 90, right: 90, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline",
      gap: "0.06em 0.28em", fontFamily: brand.body, fontSize: size, lineHeight: 1.22, letterSpacing: -0.2, textAlign: "center" }}>
      {phrase.map((w, i) => {
        const started = t >= w.start - 0.02;
        if (!started) return null;
        const isCurrent = i === phrase.length - 1 || t < phrase[i + 1].start;
        const age = (t - w.start) * fps;
        const op = interpolate(age, [0, 3], [0, 1], clamp);
        const boxed = i === boxIdx;
        const boxP = boxed ? ease(interpolate(age, [0, 6], [0, 1], clamp)) : 0;
        const txt = w.text.replace(/[“”"]/g, "");
        const e = emo[norm(w.text)];
        return (
          <span key={i} style={{ position: "relative", opacity: op, color: isCurrent || boxed ? bright : dim, fontWeight: isCurrent || boxed ? 600 : 500,
            padding: boxed ? "0 0.12em" : undefined }}>
            {e ? <span style={{ fontSize: "0.85em", marginRight: "0.18em" }}>{e}</span> : null}
            {txt}
            {boxed && <SelectionBox p={boxP} />}
          </span>
        );
      })}
    </div>
  );
};

const SelectionBox: React.FC<{ p: number; color?: string }> = ({ p, color = ORANGE }) => {
  const h = 7; // handle size px
  const handle = (s: React.CSSProperties) => (
    <div style={{ position: "absolute", width: h, height: h, background: "#fff", border: `1.5px solid ${color}`, ...s }} />
  );
  return (
    <div style={{ position: "absolute", inset: "-0.04em -0.02em -0.06em -0.02em", border: `1.5px solid ${color}`, opacity: p,
      transform: `scale(${0.92 + 0.08 * p})`, pointerEvents: "none" }}>
      {handle({ left: -h / 2 - 1, top: -h / 2 - 1 })}
      {handle({ right: -h / 2 - 1, top: -h / 2 - 1 })}
      {handle({ left: -h / 2 - 1, bottom: -h / 2 - 1 })}
      {handle({ right: -h / 2 - 1, bottom: -h / 2 - 1 })}
    </div>
  );
};

/* ---------- Callout: tiny tracked caps label with a thin leader line to a part ("GLASS", "WIRES", "CHARGE") ---------- */
export const Callout: React.FC<{
  text: string;
  at: [number, number];       // the point on the part (px)
  label: [number, number];    // where the label sits (px)
  startFrame?: number; accent?: boolean; tone?: "dark" | "light"; size?: number;
}> = ({ text, at, label, startFrame = 0, accent = false, tone = "dark", size = 24 }) => {
  const frame = useCurrentFrame();
  const f = frame - startFrame;
  const line = ease(interpolate(f, [0, 10], [0, 1], clamp));
  const op = interpolate(f, [4, 12], [0, 1], clamp);
  const col = accent ? ORANGE : tone === "dark" ? "rgba(255,255,255,0.92)" : "rgba(17,18,20,0.85)";
  const lineCol = tone === "dark" ? "rgba(255,255,255,0.55)" : "rgba(17,18,20,0.5)";
  const [x1, y1] = label, [x2, y2] = at;
  const xe = x1 + (x2 - x1) * line, ye = y1 + (y2 - y1) * line;
  if (f < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={lineCol} strokeWidth={1.5} />
        <circle cx={x2} cy={y2} r={3.5} fill={col} opacity={line > 0.98 ? 1 : 0} />
      </svg>
      <div style={{ position: "absolute", left: x1, top: y1 - size * 1.5, transform: "translateX(-50%)", fontFamily: brand.body, fontWeight: 700, fontSize: size,
        letterSpacing: size * 0.12, textTransform: "uppercase", color: col, opacity: op, whiteSpace: "nowrap" }}>{text}</div>
    </AbsoluteFill>
  );
};

/* ---------- Disclaimer: tiny grey honesty tag bottom-left ("Magnified illustration", "Values illustrative") ---------- */
export const Disclaimer: React.FC<{ text?: string; tone?: "dark" | "light"; y?: number }> = ({ text = "Magnified illustration", tone = "dark", y = 1470 }) => (
  <div style={{ position: "absolute", left: 70, top: y, fontFamily: brand.body, fontWeight: 500, fontSize: 20, letterSpacing: 0.2,
    color: tone === "dark" ? "rgba(255,255,255,0.42)" : "rgba(17,18,20,0.45)" }}>{text}</div>
);

/* ---------- EnergyArcs: glowing orange field lines rising from a point (his gold "charge" arcs, in DYNK orange) ---------- */
export const EnergyArcs: React.FC<{ x: number; y: number; width?: number; height?: number; count?: number; startFrame?: number; intensity?: number }> = ({
  x, y, width = 260, height = 140, count = 9, startFrame = 0, intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const f = frame - startFrame;
  const grow = ease(interpolate(f, [0, 18], [0, 1], clamp)) * intensity;
  if (grow <= 0) return null;
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen" }}>
      <defs>
        <filter id="arcglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {Array.from({ length: count }).map((_, i) => {
        const k = i / (count - 1) - 0.5;
        const w = width * (0.25 + Math.abs(k) * 1.2);
        const h = height * (1 - Math.abs(k) * 0.9) * grow * (0.85 + 0.15 * Math.sin(frame / 7 + i));
        const cx = x + k * width * 0.9;
        return <path key={i} d={`M ${cx - w / 2} ${y} Q ${cx} ${y - h * 2} ${cx + w / 2} ${y}`} fill="none" stroke={ORANGE} strokeWidth={2.2}
          opacity={0.55 + 0.4 * grow} filter="url(#arcglow)" />;
      })}
      <ellipse cx={x} cy={y} rx={width * 0.5} ry={14} fill={ORANGE} opacity={0.35 * grow} filter="url(#arcglow)" />
    </svg>
  );
};

/* ---------- ShareSheetEnd: Instagram-style share sheet sliding up over the profile, synced to "send this to someone…" ---------- */
export const ShareSheetEnd: React.FC<{ handle?: string; contacts?: { name: string; photo?: string }[]; startFrame?: number; selectIndex?: number }> = ({
  handle = "dynkeducation", contacts = [{ name: "sam" }, { name: "jordan.k" }, { name: "mia_" }, { name: "alex.r" }], startFrame = 0, selectIndex = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame;
  const s = spring({ frame: f, fps, config: { damping: 22, stiffness: 120 } });
  const picked = f > 26;
  return (
    <AbsoluteFill style={{ background: "#0c0d0f" }}>
      <div style={{ position: "absolute", top: 560, left: 110, right: 110, fontFamily: brand.body, color: "#fff", opacity: 0.35 }}>
        <div style={{ fontSize: 40, fontWeight: 600 }}>{handle}</div>
        <div style={{ display: "flex", gap: 90, marginTop: 40, fontSize: 34 }}><span>posts</span><span>followers</span><span>following</span></div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 820, transform: `translateY(${(1 - s) * 500}px)`, opacity: s, borderRadius: 40,
        background: "#1d1e21", padding: "34px 40px 46px", fontFamily: brand.body, color: "#fff", boxShadow: "0 -20px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 90, height: 8, borderRadius: 4, background: "#4a4b4f", margin: "0 auto 30px" }} />
        <div style={{ height: 70, borderRadius: 18, background: "#2a2b2f", display: "flex", alignItems: "center", padding: "0 26px", fontSize: 30, color: "#8a8b90" }}>Search</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
          {contacts.map((c, i) => (
            <div key={i} style={{ textAlign: "center", width: 180 }}>
              <div style={{ position: "relative", width: 130, height: 130, borderRadius: 65, margin: "0 auto", background: "#3a3b40", overflow: "hidden",
                outline: picked && i === selectIndex ? `4px solid ${ORANGE}` : "none", outlineOffset: 4 }}>
                {c.photo ? <Img src={asset(c.photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
              </div>
              <div style={{ fontSize: 26, marginTop: 14, opacity: 0.8 }}>{c.name}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 44, height: 92, borderRadius: 20, background: picked ? ORANGE : "#2f3034", color: picked ? "#111" : "#777",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700 }}>Send</div>
      </div>
    </AbsoluteFill>
  );
};
