// DYNK scene kit — matches dynk.io (Orbitron + Outfit, white/ink/orange, pill buttons,
// dark cards, rotating badge, ticker, count-up stats). Composer agents build scenes from
// these blocks so every scene shares one look. Add reusable blocks here, not in scenes.
import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand, SAFE, theme as getTheme, type ThemeName } from "../brand";

export type Word = { text: string; start: number; end: number };
export type SfxCue = { src: string; atSec: number; volume?: number };

export type SceneProps = {
  runId: string;
  sceneId: string;
  durationInFrames: number;
  vo?: { src: string; words: Word[] } | null;
  sfx?: SfxCue[];
  showCaptions?: boolean;
  debugSafeZone?: boolean;
  [key: string]: unknown;
};

const asset = (src: string) => (src.startsWith("http") ? src : staticFile(src));
const ThemeCtx = createContext<ThemeName>("paper");
export const useTheme = () => {
  const name = useContext(ThemeCtx);
  return { name, ...getTheme(name) };
};
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%¢.]/g, "").replace(/\.$/, "");
const springIn = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: brand.motion.springDamping, stiffness: brand.motion.springStiffness } });

/* ---------- Background: paper / ink / orange with the site's soft orange glow ---------- */
export const Background: React.FC<{ glow?: boolean; grid?: boolean }> = ({ glow = true, grid = false }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 50) * 4;
  return (
    <AbsoluteFill style={{ backgroundColor: t.bg }}>
      {glow && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 90% 45% at ${50 + drift}% 100%, ${
              t.name === "orange" ? "rgba(255,231,207,0.35)" : brand.gradient.glow[0]
            } 0%, transparent 70%)`,
          }}
        />
      )}
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${t.name === "paper" ? brand.color.ink15 : "rgba(255,255,255,0.06)"} 1px, transparent 1px), linear-gradient(90deg, ${t.name === "paper" ? brand.color.ink15 : "rgba(255,255,255,0.06)"} 1px, transparent 1px)`,
            backgroundSize: "90px 90px",
            opacity: 0.35,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/* ---------- Section label: "THE WALLET ——" (small tracked caps, as on the site) ---------- */
export const Label: React.FC<{ text: string; y?: number; delay?: number }> = ({ text, y = 0, delay = 0 }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springIn(frame, fps, delay);
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top + y,
        left: SAFE.left,
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontFamily: brand.body,
        fontWeight: 600,
        fontSize: brand.type.labelSize,
        letterSpacing: brand.type.labelTracking,
        color: t.muted,
        opacity: s,
        textTransform: "uppercase",
      }}
    >
      {text}
      <div style={{ width: 90 * s, height: 2, background: t.muted }} />
    </div>
  );
};

/* ---------- Kinetic headline (Orbitron). accentWords → orange, mutedWords → faded grey ---------- */
export const KineticText: React.FC<{
  text: string;
  accentWords?: string[];
  mutedWords?: string[];
  startFrame?: number;
  size?: number;
  align?: "left" | "center";
  y?: number;
  upper?: boolean;
  color?: string;
}> = ({ text, accentWords = [], mutedWords = [], startFrame = 0, size, align = "left", y = 0, upper = false, color }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const acc = accentWords.map(norm);
  const mut = mutedWords.map(norm);
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top + y,
        left: SAFE.left,
        right: SAFE.right,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: "0 0.28em",
        fontFamily: brand.display,
        fontWeight: brand.type.displayWeight,
        fontSize: size ?? brand.type.headlineSize,
        letterSpacing: brand.type.letterSpacingHeadline,
        lineHeight: brand.type.lineHeightHeadline,
        color: color ?? t.text,
        textAlign: align,
        textTransform: upper ? "uppercase" : "none",
      }}
    >
      {text.split(" ").map((w, i) => {
        const s = springIn(frame, fps, startFrame + i * brand.motion.wordStaggerFrames);
        const k = norm(w);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${(1 - s) * 70}px)`,
              opacity: s,
              color: acc.includes(k) ? t.accent : mut.includes(k) ? t.muted : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Word-timed captions (Outfit, small, bottom — like the top education reels) ---------- */
export const Captions: React.FC<{ words: Word[]; maxWords?: number; bottomOffset?: number }> = ({
  words,
  maxWords = 4,
  bottomOffset = 0,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;
  const idx = words.findIndex((w) => now >= w.start && now < w.end + 0.15);
  if (idx < 0) return null;
  const chunkStart = Math.floor(idx / maxWords) * maxWords;
  const chunk = words.slice(chunkStart, chunkStart + maxWords);
  const onLight = t.name === "paper";
  return (
    <div
      style={{
        position: "absolute",
        bottom: SAFE.bottom + bottomOffset,
        left: SAFE.left,
        right: SAFE.right,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 0.26em",
        fontFamily: brand.body,
        fontWeight: 700,
        fontSize: brand.type.captionSize,
        lineHeight: 1.15,
        color: t.text,
        textShadow: onLight ? "none" : "0 3px 14px rgba(0,0,0,0.55)",
      }}
    >
      {chunk.map((w, i) => (
        <span key={i} style={{ color: chunkStart + i === idx ? (t.name === "orange" ? brand.color.ink : brand.color.orange) : undefined }}>
          {w.text}
        </span>
      ))}
    </div>
  );
};

/* ---------- Media: dropped-in footage, screen recordings, images ---------- */
export const Media: React.FC<{
  src: string;
  kind?: "video" | "image";
  fit?: "cover" | "contain";
  kenBurns?: boolean;
  startFromSec?: number;
  muted?: boolean;
  style?: React.CSSProperties;
}> = ({ src, kind, fit = "cover", kenBurns = true, startFromSec = 0, muted = true, style }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = kenBurns ? interpolate(frame, [0, durationInFrames], [1.0, 1.08]) : 1;
  const isVideo = kind ? kind === "video" : /\.(mp4|mov|webm|m4v)$/i.test(src);
  const common: React.CSSProperties = { width: "100%", height: "100%", objectFit: fit, transform: `scale(${scale})`, ...style };
  return isVideo ? (
    <OffthreadVideo src={asset(src)} startFrom={Math.round(startFromSec * fps)} muted={muted} style={common} />
  ) : (
    <Img src={asset(src)} style={common} />
  );
};

/* ---------- Phone mockup (as on the site: dark bezel, big radius, soft shadow) ---------- */
export const PhoneFrame: React.FC<{ children: React.ReactNode; width?: number; y?: number; tilt?: number; enterFrame?: number }> = ({
  children,
  width = 620,
  y = 120,
  tilt = 0,
  enterFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springIn(frame, fps, enterFrame);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width,
          height: width * 2.05,
          marginTop: y,
          borderRadius: width * 0.14,
          padding: width * 0.028,
          background: brand.color.ink,
          boxShadow: "0 50px 120px rgba(33,35,32,0.35)",
          transform: `translateY(${(1 - s) * 400}px) rotate(${tilt * s}deg)`,
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: width * 0.115, overflow: "hidden", background: brand.color.paper }}>
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Ink card (the site's dark rounded feature cards) ---------- */
export const InkCard: React.FC<{ children: React.ReactNode; x?: number; y: number; w?: number; h: number; enterFrame?: number }> = ({
  children,
  x = SAFE.left,
  y,
  w = 1080 - SAFE.left - SAFE.right,
  h,
  enterFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springIn(frame, fps, enterFrame);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: brand.radius.card,
        background: brand.color.ink,
        color: brand.color.white,
        padding: 48,
        boxSizing: "border-box",
        transform: `translateY(${(1 - s) * 120}px) scale(${0.96 + s * 0.04})`,
        opacity: s,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Pill chip (site's orange pill button) ---------- */
export const Chip: React.FC<{ label: string; value?: string; x: number; y: number; enterFrame?: number; variant?: "orange" | "ink" | "white" }> = ({
  label,
  value,
  x,
  y,
  enterFrame = 0,
  variant = "orange",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - enterFrame, fps, config: { damping: 12, stiffness: 190 } });
  const float = Math.sin((frame - enterFrame) / 20) * 6;
  const bg = variant === "orange" ? brand.color.orange : variant === "ink" ? brand.color.ink : brand.color.white;
  const fg = variant === "white" ? brand.color.ink : brand.color.white;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + float,
        transform: `scale(${s}) rotate(${(1 - s) * -6}deg)`,
        padding: "24px 40px",
        borderRadius: brand.radius.pill,
        background: bg,
        color: fg,
        fontFamily: brand.body,
        fontWeight: 700,
        fontSize: 44,
        boxShadow: "0 18px 50px rgba(33,35,32,0.22)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {value && <span style={{ marginLeft: 14, fontFamily: brand.display, fontWeight: 800 }}>{value}</span>}
    </div>
  );
};

/* ---------- Count-up stat: "400ms", "1¢", "3,800" with orange unit + label ---------- */
export const Stat: React.FC<{ value: number; unit?: string; prefix?: string; label: string; x?: number; y: number; delay?: number; decimals?: number }> = ({
  value,
  unit = "",
  prefix = "",
  label,
  x = SAFE.left,
  y,
  delay = 0,
  decimals = 0,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, brand.motion.countUpFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: brand.ease });
  const n = (value * p).toLocaleString("en-AU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: p > 0 ? 1 : 0 }}>
      <div style={{ fontFamily: brand.display, fontWeight: 800, fontSize: brand.type.statSize, lineHeight: 1, color: t.text, letterSpacing: -4 }}>
        {prefix}
        {n}
        <span style={{ color: t.accent, fontSize: brand.type.statSize * 0.42, marginLeft: 8 }}>{unit}</span>
      </div>
      <div style={{ fontFamily: brand.body, fontWeight: 500, fontSize: 40, color: t.muted, marginTop: 12 }}>{label}</div>
    </div>
  );
};

/* ---------- Strike compare: "2–3% card fees" struck out → "1¢ flat" ---------- */
export const StrikeCompare: React.FC<{ before: string; after: string; y: number; delay?: number }> = ({ before, after, y, delay = 0 }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = interpolate(frame - delay, [6, 18], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: brand.ease });
  const s = springIn(frame, fps, delay + 18);
  return (
    <div style={{ position: "absolute", top: SAFE.top + y, left: SAFE.left, right: SAFE.right }}>
      <div style={{ position: "relative", display: "inline-block", fontFamily: brand.display, fontWeight: 700, fontSize: 76, color: t.muted }}>
        {before}
        <div style={{ position: "absolute", left: 0, top: "52%", height: 8, width: `${line}%`, background: brand.color.danger, borderRadius: 4 }} />
      </div>
      <div style={{ fontFamily: brand.display, fontWeight: 900, fontSize: brand.type.punchSize, color: t.accent, transform: `scale(${0.6 + s * 0.4})`, transformOrigin: "left center", opacity: s }}>
        {after}
      </div>
    </div>
  );
};

/* ---------- Rotating badge: "SELF-CUSTODY • OWN IT • BUILT ON SOLANA" round the D mark ---------- */
export const Badge: React.FC<{ x: number; y: number; size?: number; text?: string }> = ({ x, y, size = 300, text = brand.badge }) => {
  const frame = useCurrentFrame();
  const r = size / 2 - 34;
  const chars = text.split("");
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: brand.color.ink, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${frame * 1.2}deg)` }}>
        {chars.map((c, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              fontFamily: brand.body,
              fontWeight: 600,
              fontSize: size * 0.075,
              color: brand.color.white,
              transform: `rotate(${(i / chars.length) * 360}deg) translateY(${-r}px) translateX(-50%)`,
              transformOrigin: "0 0",
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <Img src={staticFile("dynk-d-mark.png")} style={{ position: "absolute", left: "50%", top: "50%", height: size * 0.36, transform: "translate(-50%,-50%)" }} />
    </div>
  );
};

/* ---------- Ticker band: "OWN IT • GROW IT • SELF-CUSTODY • …" ---------- */
export const Ticker: React.FC<{ y: number; items?: string[]; variant?: "orange" | "ink"; tilt?: number }> = ({ y, items = brand.ticker, variant = "orange", tilt = -4 }) => {
  const frame = useCurrentFrame();
  const row = Array(4).fill(items).flat().join("  •  ");
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: -100,
        right: -100,
        padding: "22px 0",
        background: variant === "orange" ? brand.color.orange : brand.color.ink,
        color: brand.color.white,
        transform: `rotate(${tilt}deg)`,
        overflow: "hidden",
        whiteSpace: "nowrap",
        fontFamily: brand.display,
        fontWeight: 800,
        fontSize: 44,
        letterSpacing: 2,
      }}
    >
      <div style={{ transform: `translateX(${-(frame * 6) % 1600}px)` }}>{row}</div>
    </div>
  );
};

/* ---------- Annotation arrow (the big-pointer move top explainers use) ---------- */
export const Arrow: React.FC<{ x: number; y: number; rotate?: number; size?: number; delay?: number }> = ({ x, y, rotate = 135, size = 180, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 220 } });
  const bob = Math.sin((frame - delay) / 6) * 10;
  return (
    <svg
      viewBox="0 0 100 100"
      style={{ position: "absolute", left: x, top: y, width: size, height: size, transform: `rotate(${rotate}deg) translateY(${bob}px) scale(${s})` }}
    >
      <path d="M50 4 L92 52 L64 52 L64 96 L36 96 L36 52 L8 52 Z" fill={brand.color.orange} stroke={brand.color.ink} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
};

/* ---------- Rehook punch: zoom + flash ---------- */
export const RehookPunch: React.FC<{ atFrame: number; children: React.ReactNode }> = ({ atFrame, children }) => {
  const frame = useCurrentFrame();
  const d = frame - atFrame;
  const zoom = d >= 0 && d < 8 ? interpolate(d, [0, 8], [1.12, 1]) : 1;
  const flash = d >= 0 && d < 4 ? interpolate(d, [0, 4], [0.6, 0]) : 0;
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      {children}
      <AbsoluteFill style={{ backgroundColor: brand.color.orange100, opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ---------- Orange wipe transition (pattern interrupt into the orange theme) ---------- */
export const OrangeWipe: React.FC<{ atFrame: number; durationFrames?: number }> = ({ atFrame, durationFrames = 10 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - atFrame, [0, durationFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: brand.ease });
  if (p <= 0 || p >= 1) return null;
  return <AbsoluteFill style={{ background: brand.color.orange, clipPath: `inset(0 ${100 - p * 200}% 0 ${Math.max(0, p * 200 - 100)}%)` }} />;
};

/* ---------- Logo mark (end card / corner only) ---------- */
export const LogoMark: React.FC<{ size?: number; corner?: boolean }> = ({ size = 220, corner = false }) => (
  <Img
    src={staticFile("dynk-d-mark.png")}
    style={corner ? { position: "absolute", top: SAFE.top - 130, left: SAFE.left, height: 64 } : { height: size, display: "block", margin: "0 auto" }}
  />
);

/* ---------- Scene shell: theme + background + content + captions + VO + SFX ---------- */
export const SceneShell: React.FC<{
  props: SceneProps;
  theme?: ThemeName;
  background?: boolean;
  glow?: boolean;
  grid?: boolean;
  children: React.ReactNode;
}> = ({ props, theme = "paper", background = true, glow = true, grid = false, children }) => {
  const { fps } = useVideoConfig();
  return (
    <ThemeCtx.Provider value={theme}>
      <AbsoluteFill style={{ fontFamily: brand.body }}>
        {background && <Background glow={glow} grid={grid} />}
        {children}
        {props.showCaptions !== false && props.vo?.words?.length ? <Captions words={props.vo.words} /> : null}
        {props.vo?.src ? <Audio src={asset(props.vo.src)} /> : null}
        {(props.sfx ?? []).map((c, i) => (
          <Sequence key={i} from={Math.round(c.atSec * fps)}>
            <Audio src={asset(c.src)} volume={c.volume ?? 0.6} />
          </Sequence>
        ))}
        {props.debugSafeZone && (
          <div style={{ position: "absolute", top: SAFE.top, bottom: SAFE.bottom, left: SAFE.left, right: SAFE.right, border: "4px dashed #00b7ff" }} />
        )}
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};

/** Optional: wrap part of a scene in a different theme (e.g. an ink card section). */
export const Themed: React.FC<{ theme: ThemeName; children: React.ReactNode }> = ({ theme, children }) => (
  <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>
);
