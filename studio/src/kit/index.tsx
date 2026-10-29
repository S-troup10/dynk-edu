// DYNK v2 2D kit: the "monochrome studio" grammar (modelled on @0x100x).
// Rules baked in: tiny one-word captions, greyscale everything, ONE orange accent per shot,
// real B&W footage for cold opens, numbers as the hero, slow and calm motion, film grain.
// 3D objects live in ./three.tsx. Legacy v1 blocks are still in ../components.
import React from "react";
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Easing, random,
} from "remotion";
import { brand, SAFE } from "../brand";
import tokens from "../../../brand/tokens.json";
import type { SceneProps, Word } from "../components";

export * from "./three";
export * from "./speedy";
import { PhraseCaption } from "./speedy";
export type { SceneProps, Word };

const V2 = tokens.v2;
export type Tone = "dark" | "light";
const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const asset = (src: string) => (src.startsWith("http") || src.startsWith("data:") ? src : staticFile(src));
export const toneOf = (t: Tone = "dark") => V2.tones[t];
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/* ---------- texture: film grain + vignette (what stops flat renders looking "AI clean") ---------- */
export const Grain: React.FC<{ amount?: number }> = ({ amount = V2.grain }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 50; // grain changes every 2 frames, like film at 12fps
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: amount, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
export const Vignette: React.FC<{ amount?: number }> = ({ amount = V2.vignette }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,${amount}) 100%)` }} />
);

/** Soft light-leak flash for act changes (max once per act). */
export const LightLeak: React.FC<{ at: number; duration?: number; warm?: boolean }> = ({ at, duration = 14, warm = true }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, duration * 0.4, duration], [0, 1, 0], clamp);
  if (p <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: p,
      background: `radial-gradient(ellipse 70% 90% at ${30 + p * 40}% 50%, ${warm ? "rgba(255,190,130,0.9)" : "rgba(255,255,255,0.9)"} 0%, rgba(255,128,0,0.25) 40%, transparent 75%)` }} />
  );
};

/* ---------- WordCaption: ONE small lowercase word at a time, top centre (0x100x signature) ---------- */
export const WordCaption: React.FC<{ words: Word[]; tone?: Tone; y?: number; size?: number; offsetSec?: number }> = ({ words, tone = "dark", y = V2.type.caption.y, size = V2.type.caption.size, offsetSec = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - offsetSec;
  const idx = words.findIndex((w, i) => t >= w.start - 0.02 && (t < (words[i + 1]?.start ?? w.end + 0.4)));
  if (idx < 0) return null;
  const w = words[idx];
  const age = (t - w.start) * fps;
  const op = interpolate(age, [0, V2.motion.wordFadeFrames], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: brand.body, fontWeight: V2.type.caption.weight,
      fontSize: size, letterSpacing: V2.type.caption.tracking, color: toneOf(tone).text, opacity: op * 0.92, textTransform: "lowercase" }}>
      {w.text.replace(/[.,!?;:"“”]/g, "")}
    </div>
  );
};

/* ---------- Typewriter: small all-caps line typed with a cursor (cold-open hook text) ---------- */
export const Typewriter: React.FC<{ text: string; startFrame?: number; cps?: number; y?: number; size?: number; color?: string; maxWidth?: number }> = ({
  text, startFrame = 0, cps = 22, y = 900, size = V2.type.typewriter.size, color = "#FFFFFF", maxWidth = 820,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - startFrame) / fps) * cps));
  const shown = text.slice(0, n);
  const cursorOn = Math.floor(frame / 8) % 2 === 0 || n < text.length;
  return (
    <div style={{ position: "absolute", top: y, left: (1080 - maxWidth) / 2, width: maxWidth, textAlign: "center", fontFamily: brand.body,
      fontWeight: V2.type.typewriter.weight, fontSize: size, letterSpacing: V2.type.typewriter.tracking, lineHeight: 1.2, color, textTransform: "uppercase", isolation: "isolate",
      textShadow: "0 0 2px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.85), 0 0 40px rgba(0,0,0,0.6)" }}>
      {/* soft dark backing so the line reads over bright footage (white signs, paper) */}
      <div style={{ position: "absolute", inset: "-110px -140px", background: "radial-gradient(ellipse 50% 50% at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.28) 45%, transparent 100%)", filter: "blur(18px)", zIndex: -1 }} />
      <span style={{ position: "relative" }}>{shown}<span style={{ opacity: cursorOn ? 1 : 0, fontWeight: 300 }}>|</span></span>
    </div>
  );
};

/* ---------- Line: a calm centred sentence, words fade up one by one. accent → orange, muted → grey ---------- */
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%¢]/g, "");
export const Line: React.FC<{ text: string; startFrame?: number; tone?: Tone; y?: number; size?: number; accentWords?: string[]; mutedWords?: string[]; stagger?: number; align?: "center" | "left" }> = ({
  text, startFrame = 0, tone = "dark", y = 860, size = V2.type.line.size, accentWords = [], mutedWords = [], stagger = 3, align = "center",
}) => {
  const frame = useCurrentFrame();
  const t = toneOf(tone);
  const acc = accentWords.map(norm), mut = mutedWords.map(norm);
  return (
    <div style={{ position: "absolute", top: y, left: SAFE.left + 30, right: SAFE.left + 30, display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start",
      gap: "0 0.26em", fontFamily: brand.body, fontWeight: V2.type.line.weight, fontSize: size, lineHeight: V2.type.line.lineHeight, color: t.text, textAlign: align }}>
      {text.split(" ").map((w, i) => {
        const p = interpolate(frame - startFrame - i * stagger, [0, 8], [0, 1], clamp);
        const k = norm(w);
        return (
          <span key={i} style={{ opacity: p * (mut.includes(k) ? 0.4 : 1), transform: `translateY(${(1 - p) * 14}px)`, filter: `blur(${(1 - p) * 6}px)`,
            color: acc.includes(k) ? t.accent : undefined }}>{w}</span>
        );
      })}
    </div>
  );
};

/* ---------- Label: tiny tracked caps (e.g. "THE BLOCKCHAIN RACE", "EXPLAINER") ---------- */
export const Label2: React.FC<{ text: string; y: number; tone?: Tone; accent?: boolean; delay?: number }> = ({ text, y, tone = "dark", accent = false, delay = 0 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: brand.body, fontWeight: V2.type.label.weight, fontSize: V2.type.label.size,
      letterSpacing: V2.type.label.tracking, color: accent ? toneOf(tone).accent : toneOf(tone).muted, opacity: op, textTransform: "uppercase" }}>{text}</div>
  );
};

/* ---------- ChromeNumber: big Orbitron figure with a chrome gradient + optional unit ("$10 TRILLION") ---------- */
export const chromeFill = (accent = false, tone: Tone = "dark") =>
  !accent && tone === "light"
    ? { background: "linear-gradient(180deg,#4a4a4a 0%,#111111 45%,#2c2c2c 70%,#6a6a6a 100%)", WebkitBackgroundClip: "text" as const, color: "transparent" }
    : accent
    ? { background: "linear-gradient(180deg,#FFD2A6 0%,#FF8000 45%,#B85400 70%,#FFB066 100%)", WebkitBackgroundClip: "text" as const, color: "transparent" }
    : { background: `linear-gradient(180deg,${V2.chrome.join(",")})`, WebkitBackgroundClip: "text" as const, color: "transparent" };

export const ChromeNumber: React.FC<{ value: string; unit?: string; y?: number; size?: number; accent?: boolean; delay?: number; tone?: Tone }> = ({
  value, unit, y = 380, size = V2.type.number.size, accent = false, delay = 0, tone = "dark",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 110 } });
  const sweep = interpolate(frame - delay, [8, 40], [-30, 130], clamp);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", opacity: s, transform: `translateY(${(1 - s) * 40}px) scale(${0.96 + 0.04 * s})` }}>
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 22, position: "relative" }}>
        <span style={{ fontFamily: brand.display, fontWeight: V2.type.number.weight, fontSize: size, letterSpacing: -4, lineHeight: 1, ...chromeFill(accent, tone),
          filter: tone === "dark" ? "drop-shadow(0 10px 30px rgba(0,0,0,0.6))" : "drop-shadow(0 6px 14px rgba(0,0,0,0.25))" }}>{value}</span>
        {unit && <span style={{ fontFamily: brand.display, fontWeight: V2.type.numberUnit.weight, fontSize: V2.type.numberUnit.size, letterSpacing: V2.type.numberUnit.tracking, ...chromeFill(false, tone) }}>{unit}</span>}
        {/* specular sweep */}
        <span style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,0.55) ${sweep}%, transparent ${sweep + 12}%)`, mixBlendMode: "overlay", pointerEvents: "none" }} />
      </div>
    </div>
  );
};

/* ---------- Counter: a live ticking figure ($2,362,694,300,525 → …). Tabular digits so it doesn't jitter ---------- */
export const Counter: React.FC<{ from: number; to: number; startFrame?: number; durationFrames?: number; prefix?: string; suffix?: string; decimals?: number; y?: number; size?: number; tone?: Tone; accent?: boolean; keepTicking?: number }> = ({
  from, to, startFrame = 0, durationFrames = 60, prefix = "", suffix = "", decimals = 0, y = 640, size = 64, tone = "dark", accent = false, keepTicking = 0,
}) => {
  const frame = useCurrentFrame();
  const p = ease(interpolate(frame - startFrame, [0, durationFrames], [0, 1], clamp));
  const extra = Math.max(0, frame - startFrame - durationFrames) * keepTicking;
  const v = from + (to - from) * p + extra;
  const txt = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: brand.body, fontWeight: 600, fontSize: size,
      fontVariantNumeric: "tabular-nums", letterSpacing: 0.5, color: accent ? toneOf(tone).accent : toneOf(tone).text }}>
      {prefix}{txt}{suffix}
    </div>
  );
};

/* ---------- NameCard: glass plate with B&W headshot, name, role, optional logo; light glint sweeps across ---------- */
export const NameCard: React.FC<{ photo?: string; name: string; role?: string; logo?: string; y?: number; delay?: number; width?: number }> = ({
  photo, name, role, logo, y = 520, delay = 0, width = 860,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 120 } });
  const glint = interpolate(frame - delay, [10, 46], [-20, 120], clamp);
  const h = width * 0.27;
  return (
    <div style={{ position: "absolute", top: y, left: (1080 - width) / 2, width, height: h, borderRadius: h * 0.28, opacity: s,
      transform: `translateY(${(1 - s) * 30}px) perspective(1200px) rotateX(${(1 - s) * 18}deg)`,
      background: "linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.12))",
      border: "1.5px solid rgba(255,255,255,0.28)", boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
      backdropFilter: "blur(18px)", display: "flex", alignItems: "center", gap: 34, padding: `0 ${h * 0.22}px`, overflow: "hidden" }}>
      {photo && <Img src={asset(photo)} style={{ width: h * 0.66, height: h * 0.66, borderRadius: "50%", objectFit: "cover", filter: "grayscale(1) contrast(1.1)", border: "2px solid rgba(255,255,255,0.4)" }} />}
      <div style={{ flex: 1, color: "#fff", fontFamily: brand.body }}>
        <div style={{ fontWeight: 600, fontSize: h * 0.2 }}>{name}</div>
        {role && <div style={{ fontWeight: 500, fontSize: h * 0.1, opacity: 0.6, marginTop: 6 }}>{role}</div>}
      </div>
      {logo && <div style={{ width: h * 0.48, height: h * 0.48, borderRadius: h * 0.12, background: "#111", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <Img src={asset(logo)} style={{ width: "75%", height: "75%", objectFit: "contain", filter: "grayscale(1) brightness(1.6)" }} />
      </div>}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${glint - 10}%, rgba(255,255,255,0.35) ${glint}%, transparent ${glint + 10}%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: `${glint}%`, bottom: -6, width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 0 24px 8px rgba(255,255,255,0.8)", opacity: glint > 0 && glint < 100 ? 1 : 0 }} />
    </div>
  );
};

/* ---------- Footage: real clip graded to the house look (B&W, contrast, slow push, grain on top) ---------- */
export const Footage: React.FC<{ src: string; startFromSec?: number; bw?: boolean; push?: number; muted?: boolean; volume?: number; fit?: "cover" | "contain"; objectPosition?: string }> = ({
  src, startFromSec = 0, bw = true, push = 0.05, muted = true, volume = 1, fit = "cover", objectPosition = "50% 35%",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sc = 1 + push * (frame / Math.max(1, durationInFrames));
  const isImg = /\.(png|jpe?g|webp)$/i.test(src);
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: fit, objectPosition, transform: `scale(${sc})`,
    filter: bw ? "grayscale(1) contrast(1.18) brightness(0.9)" : "contrast(1.05) saturate(0.85)" };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {isImg ? <Img src={asset(src)} style={style} /> : <OffthreadVideo src={asset(src)} startFrom={Math.round(startFromSec * fps)} muted={muted} volume={volume} style={style} />}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------- HookMontage: 3–5 hard-cut B&W clips of real people + one typewriter line over all of them ---------- */
export type ClipSpec = { src: string; frames: number; startFromSec?: number; objectPosition?: string; audio?: boolean };
export const HookMontage: React.FC<{ clips: ClipSpec[]; text?: string; textY?: number; cps?: number }> = ({ clips, text, textY = 880, cps = 20 }) => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {clips.map((c, i) => {
        const from = at; at += c.frames;
        return (
          <Sequence key={i} from={from} durationInFrames={c.frames}>
            <Footage src={c.src} startFromSec={c.startFromSec} objectPosition={c.objectPosition} muted={!c.audio} volume={0.9} push={0.06} />
          </Sequence>
        );
      })}
      {text && <Typewriter text={text} y={textY} cps={cps} startFrame={4} />}
    </AbsoluteFill>
  );
};

/* ---------- Timeline: thin line with dated ticks drawing left→right ---------- */
export const Timeline: React.FC<{ points: { label: string; sub?: string; accent?: boolean }[]; y?: number; startFrame?: number; tone?: Tone; title?: string }> = ({
  points, y = 980, startFrame = 0, tone = "dark", title,
}) => {
  const frame = useCurrentFrame();
  const t = toneOf(tone);
  const p = ease(interpolate(frame - startFrame, [0, 40], [0, 1], clamp));
  const L = 140, R = 940;
  return (
    <AbsoluteFill>
      {title && <div style={{ position: "absolute", top: y - 170, left: 0, right: 0, textAlign: "center", fontFamily: brand.body, fontWeight: 500, fontSize: 56, letterSpacing: 8, color: t.text, opacity: p }}>{title}</div>}
      <div style={{ position: "absolute", top: y, left: L, width: (R - L) * p, height: 2, background: t.muted }} />
      {points.map((pt, i) => {
        const x = L + ((R - L) * i) / Math.max(1, points.length - 1);
        const show = interpolate(frame - startFrame - 8 - i * 8, [0, 10], [0, 1], clamp);
        return (
          <div key={i} style={{ position: "absolute", top: y - 9, left: x - 9, opacity: show }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: pt.accent ? t.accent : t.text, boxShadow: pt.accent ? "0 0 24px rgba(255,128,0,0.8)" : "none" }} />
            <div style={{ position: "absolute", top: 34, left: -150, width: 318, textAlign: "center", fontFamily: brand.body, fontWeight: 600, fontSize: 34, color: pt.accent ? t.accent : t.text }}>{pt.label}</div>
            {pt.sub && <div style={{ position: "absolute", top: 80, left: -150, width: 318, textAlign: "center", fontFamily: brand.body, fontSize: 26, color: t.muted }}>{pt.sub}</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- ProfileEndCard: an Instagram-profile mock for @dynkeducation with a cursor tapping Follow ---------- */
export const ProfileEndCard: React.FC<{ handle?: string; name?: string; bio?: string; line?: string; avatar?: string; startFrame?: number }> = ({
  handle = "dynkeducation", name = "DYNK Education", bio = "Self-custody, explained.", line = "we're just an education page.", avatar = "dynk-d-mark.png", startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame;
  const s = spring({ frame: f, fps, config: { damping: 20, stiffness: 110 } });
  const cur = ease(interpolate(f, [18, 42], [0, 1], clamp));
  const tapped = f > 46;
  const press = interpolate(f, [42, 46, 50], [1, 0.94, 1], clamp);
  // layout constants (px): card spans x 90..990, Follow button centre ≈ (315, 1004)
  const L = 90, W = 900, TOP = 620, AV = 190, BTN_Y = TOP + AV + 40 + 50 + 40, BTN_H = 104;
  const target = { x: L + (W - 24) / 4, y: BTN_Y + BTN_H / 2 };
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1b1b1b, #0a0a0a 75%)" }}>
      <div style={{ position: "absolute", top: TOP, left: L, width: W, opacity: s, transform: `translateY(${(1 - s) * 30}px)`, fontFamily: brand.body, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 44, height: AV }}>
          <div style={{ width: AV, height: AV, borderRadius: AV / 2, background: "#141414", border: "4px solid #FF8000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Img src={asset(avatar)} style={{ width: AV * 0.56, height: AV * 0.7, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.1 }}>{handle}</div>
            <div style={{ fontSize: 38, opacity: 0.55, marginTop: 8 }}>{name}</div>
          </div>
        </div>
        <div style={{ fontSize: 38, opacity: 0.78, marginTop: 40, height: 50, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bio}</div>
        <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
          <div style={{ flex: 1, height: BTN_H, borderRadius: 22, background: tapped ? "#262626" : "#FF8000", color: tapped ? "#fff" : "#111", fontSize: 40, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})` }}>{tapped ? "Following" : "Follow"}</div>
          <div style={{ flex: 1, height: BTN_H, borderRadius: 22, background: "#262626", fontSize: 40, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>Message</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 42, opacity: interpolate(f, [56, 70], [0, 0.8], clamp), marginTop: 110 }}>{line}</div>
      </div>
      {/* cursor: tip of the arrow lands on the Follow button */}
      <div style={{ position: "absolute", left: 700 + (target.x - 700) * cur, top: 1560 + (target.y - 1560) * cur, opacity: interpolate(f, [16, 22], [0, 1], clamp) }}>
        <svg width="64" height="64" viewBox="0 0 24 24"><path d="M2 1l16 9-7 2-3 7z" fill="#fff" stroke="#000" strokeWidth="1.2" /></svg>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- EndMark: the D mark with a thin audio-wave line (0x100x-style outro) ---------- */
export const EndMark: React.FC<{ startFrame?: number; light?: boolean }> = ({ startFrame = 0, light = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame;
  const s = spring({ frame: f, fps, config: { damping: 18, stiffness: 120 } });
  const bars = Array.from({ length: 34 });
  return (
    <AbsoluteFill style={{ background: light ? "#EFEFEC" : "#0B0B0B", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 230, height: 230, borderRadius: 115, background: "#141414", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})` }}>
        <Img src={staticFile("dynk-d-mark.png")} style={{ width: 120, height: 150, objectFit: "contain" }} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", height: 60, marginTop: 50 }}>
        {bars.map((_, i) => {
          const h = 4 + Math.abs(Math.sin(i * 0.9 + f / 4)) * 34 * random(`b${i}`) * (1 - Math.abs(i - 17) / 18);
          return <div key={i} style={{ width: 4, height: h, borderRadius: 2, background: light ? "#222" : "#ddd", opacity: 0.8 }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Shell: every v2 scene sits in this. Handles VO, SFX, one-word captions, grain, vignette ---------- */
export const Shell: React.FC<{
  props: SceneProps;
  tone?: Tone;
  captions?: boolean;
  /** v3 default "phrase" (speedy sentence-building). "word" = v2 one-word whisper. */
  captionStyle?: "phrase" | "word";
  grain?: boolean;
  vignette?: boolean;
  children: React.ReactNode;
}> = ({ props, tone = "dark", captions, captionStyle, grain = true, vignette = true, children }) => {
  const { fps } = useVideoConfig();
  const showCaps = captions ?? (props.showCaptions !== false);
  return (
    <AbsoluteFill style={{ background: toneOf(tone).bg, overflow: "hidden" }}>
      {children}
      {vignette && <Vignette amount={tone === "dark" ? V2.vignette : V2.vignette * 0.35} />}
      {grain && <Grain amount={tone === "dark" ? V2.grain : V2.grain * 0.7} />}
      {showCaps && props.vo?.words?.length ? (
        (captionStyle ?? (props.captionStyle as "phrase" | "word" | undefined) ?? "phrase") === "phrase"
          ? <PhraseCaption words={props.vo.words} tone={tone} keywords={(props.captionKeywords as string[]) ?? []} emoji={(props.captionEmoji as Record<string, string>) ?? {}} />
          : <WordCaption words={props.vo.words} tone={tone} />
      ) : null}
      {props.vo?.src ? <Audio src={asset(props.vo.src)} /> : null}
      {(props.sfx ?? []).map((s, i) => (
        <Sequence key={i} from={Math.round(s.atSec * fps)}>
          <Audio src={asset(s.src)} volume={s.volume ?? 0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
