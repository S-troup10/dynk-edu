// The "blank board" the talking head cuts to. Elements are laid out once (space for every
// element is reserved from the start, so nothing shoves the layout when it lands) and each
// one draws in on the frame its word is spoken.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { icons } from "lucide";
import { brand } from "../brand";
import type { Board as BoardT, BoardElement, Mark, CompareSide } from "./types";

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const prog = (f: number, at: number, dur = 12) => EASE(clamp01((f - at) / dur));
const pop = (f: number, at: number, fps: number) =>
  f < at ? 0 : spring({ frame: f - at, fps, config: { damping: 14, stiffness: 190, mass: 0.8 } });

type Pal = { bg: string; ink: string; muted: string; accent: string; line: string; card: string };
const PAL: Record<"paper" | "ink", Pal> = {
  paper: { bg: brand.color.paper, ink: brand.color.ink, muted: brand.color.ink60, accent: brand.color.orange, line: brand.color.ink, card: "#FFFFFF" },
  ink: { bg: brand.color.ink, ink: "#FFFFFF", muted: brand.color.onInk70, accent: brand.color.orange, line: "#FFFFFF", card: "rgba(255,255,255,0.06)" },
};
const PalCtx = React.createContext<Pal>(PAL.paper);
const usePal = () => React.useContext(PalCtx);
const normWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%']/g, "");

/* ---------------- Lucide icon, drawn on stroke by stroke ---------------- */
const pascal = (n: string) =>
  n.split(/[-_ ]+/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
export const iconExists = (n: string) => Boolean((icons as Record<string, unknown>)[pascal(n)]);

export const DrawIcon: React.FC<{ name: string; size: number; p: number; color: string; stroke?: number }> = ({
  name, size, p, color, stroke = 1.6,
}) => {
  const node = ((icons as Record<string, unknown>)[pascal(name)] ?? (icons as Record<string, unknown>)["CircleHelp"]) as [string, Record<string, string>][];
  const n = node.length;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {node.map(([tag, attrs], k) => {
        // stagger the strokes so the icon is "drawn", not faded
        const local = clamp01(p * (n + 1) - k * 0.8);
        return React.createElement(tag, { ...attrs, key: k, pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - local });
      })}
    </svg>
  );
};


/* Reveal a stroke left→right. (pathLength dashing breaks when vectorEffect=non-scaling-stroke.) */
let clipSeq = 0;
const Reveal: React.FC<{ p: number; children: React.ReactNode; vertical?: boolean }> = ({ p, children, vertical }) => {
  const id = React.useMemo(() => `rv${clipSeq++}`, []);
  return (
    <g>
      <defs><clipPath id={id}><rect x={-10} y={-10} width={vertical ? 120 : 120 * p} height={vertical ? 120 * p : 120} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </g>
  );
};

/* ---------------- Marker marks drawn over any element ---------------- */
const MarkLayer: React.FC<{ marks?: Mark[] }> = ({ marks }) => {
  const f = useCurrentFrame();
  const pal = usePal();
  if (!marks?.length) return null;
  return (
    <svg style={{ position: "absolute", inset: -24, width: "calc(100% + 48px)", height: "calc(100% + 48px)", overflow: "visible", pointerEvents: "none" }}
      viewBox="0 0 100 100" preserveAspectRatio="none">
      {marks.map((m, k) => {
        const p = prog(f, m.atF, m.kind === "circle" ? 14 : 9);
        if (p <= 0) return null;
        const common = { fill: "none", strokeLinecap: "round" as const, vectorEffect: "non-scaling-stroke" as const };
        if (m.kind === "circle")
          return <Reveal key={k} p={p}><path d="M 52 4 C 82 3 99 22 98 50 C 97 80 75 97 48 96 C 20 95 2 78 3 50 C 4 24 22 6 56 7" stroke={pal.accent} strokeWidth={7} {...common} /></Reveal>;
        if (m.kind === "underline")
          return <Reveal key={k} p={p}><path d="M 4 94 C 25 90 50 97 75 92 C 85 90 92 93 97 91" stroke={pal.accent} strokeWidth={9} {...common} /></Reveal>;
        if (m.kind === "cross")
          return (
            <g key={k}>
              <Reveal p={clamp01(p * 2)}><path d="M 8 10 L 92 90" stroke={brand.color.danger} strokeWidth={10} {...common} /></Reveal>
              <Reveal p={clamp01(p * 2 - 1)}><path d="M 92 10 L 8 90" stroke={brand.color.danger} strokeWidth={10} {...common} /></Reveal>
            </g>
          );
        return <Reveal key={k} p={p}><path d="M 14 52 L 40 78 L 88 18" stroke={brand.color.success} strokeWidth={11} strokeLinejoin="round" {...common} /></Reveal>;
      })}
    </svg>
  );
};

/* ---------------- Text with accent + underline words ---------------- */
const Words: React.FC<{ text: string; accent?: string[]; underline?: string[]; atF: number; stagger?: number; style: React.CSSProperties }> = ({
  text, accent = [], underline = [], atF, stagger = 2, style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pal = usePal();
  const acc = accent.map(normWord);
  const und = underline.map(normWord);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.26em", ...style }}>
      {text.split(" ").map((w, i) => {
        const s = pop(f, atF + i * stagger, fps);
        const k = normWord(w);
        const u = und.includes(k) ? prog(f, atF + i * stagger + 8, 10) : 0;
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 30}px)`, color: acc.includes(k) ? pal.accent : undefined }}>
            {w}
            {u > 0 && (
              <svg style={{ position: "absolute", left: -6, right: -6, bottom: -14, width: "calc(100% + 12px)", height: 22, overflow: "visible" }} viewBox="0 0 100 20" preserveAspectRatio="none">
                <Reveal p={u}><path d="M 2 12 C 30 6 60 16 98 9" stroke={pal.accent} strokeWidth={6} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></Reveal>
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
};

/* ---------------- Hand-drawn arrow between flow nodes ---------------- */
const FlowArrow: React.FC<{ p: number; dir: "row" | "column"; len: number }> = ({ p, dir, len }) => {
  const pal = usePal();
  const body = clamp01(p * 1.4);
  const head = clamp01(p * 1.4 - 0.75) * 4;
  const w = dir === "row" ? len : 60;
  const h = dir === "row" ? 60 : len;
  const d = dir === "row" ? `M 4 ${h / 2 + 3} C ${w * 0.35} ${h / 2 - 6}, ${w * 0.65} ${h / 2 + 6}, ${w - 8} ${h / 2}` : `M ${w / 2 + 3} 4 C ${w / 2 - 6} ${h * 0.35}, ${w / 2 + 6} ${h * 0.65}, ${w / 2} ${h - 8}`;
  const hd = dir === "row" ? `M ${w - 26} ${h / 2 - 16} L ${w - 6} ${h / 2} L ${w - 26} ${h / 2 + 16}` : `M ${w / 2 - 16} ${h - 26} L ${w / 2} ${h - 6} L ${w / 2 + 16} ${h - 26}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible", flex: "none", alignSelf: "center" }}>
      <path d={d} stroke={pal.accent} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - body} />
      <path d={hd} stroke={pal.accent} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, head)} />
    </svg>
  );
};

/* ---------------- Element renderers ---------------- */
const IconTile: React.FC<{ icon: string; label?: string; atF: number; size: number; accent?: boolean; marks?: Mark[] }> = ({ icon, label, atF, size, accent, marks }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pal = usePal();
  const p = prog(f, atF, 16);
  const s = pop(f, atF, fps);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: f < atF ? 0 : 1 }}>
      <div style={{ position: "relative", width: size * 1.25, height: size * 1.25, borderRadius: size * 0.36, background: pal.card,
        border: `3px solid ${accent ? pal.accent : pal.line}`, display: "grid", placeItems: "center", transform: `scale(${0.85 + 0.15 * s})`,
        boxShadow: pal === PAL.paper ? "6px 8px 0 rgba(33,35,32,0.12)" : "none" }}>
        <DrawIcon name={icon} size={size * 0.72} p={p} color={accent ? pal.accent : pal.ink} />
        <MarkLayer marks={marks} />
      </div>
      {label && (
        <div style={{ fontFamily: brand.body, fontWeight: 700, fontSize: Math.max(38, size * 0.26), color: pal.ink, opacity: prog(f, atF + 5, 8), textAlign: "center", lineHeight: 1.1, maxWidth: size * 1.9 }}>
          {label}
        </div>
      )}
    </div>
  );
};

const CompareCol: React.FC<{ side: CompareSide; width: number }> = ({ side, width }) => {
  const f = useCurrentFrame();
  const pal = usePal();
  const vp = side.verdict && side.verdictAtF !== undefined ? side.verdictAtF : null;
  return (
    <div style={{ width, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: f < side.atF ? 0 : 1 }}>
      <div style={{ fontFamily: brand.display, fontWeight: 800, fontSize: 40, color: pal.ink, textAlign: "center", lineHeight: 1.05, opacity: prog(f, side.atF, 8) }}>{side.title}</div>
      {side.icon && (
        <div style={{ position: "relative" }}>
          <IconTile icon={side.icon} atF={side.atF + 3} size={150} accent={side.verdict === "good"} />
          {vp !== null && <MarkLayer marks={[{ kind: side.verdict === "good" ? "check" : "cross", atF: vp }]} />}
        </div>
      )}
      {(side.lines ?? []).map((l, k) => (
        <div key={k} style={{ fontFamily: brand.body, fontWeight: 600, fontSize: 38, color: pal.muted, textAlign: "center", opacity: prog(f, side.atF + 6 + k * 4, 8) }}>{l}</div>
      ))}
      {!side.icon && vp !== null && (
        <div style={{ position: "relative", width: 120, height: 120 }}><MarkLayer marks={[{ kind: side.verdict === "good" ? "check" : "cross", atF: vp }]} /></div>
      )}
    </div>
  );
};

const Element: React.FC<{ el: BoardElement; contentW: number; horizontal: boolean }> = ({ el, contentW, horizontal }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pal = usePal();
  const visible = f >= el.atF - 1;
  const wrap = (child: React.ReactNode) => (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", visibility: visible ? "visible" : "hidden" }}>
      <div style={{ position: "relative" }}>
        {child}
        {el.type !== "icon" && <MarkLayer marks={el.marks} />}
      </div>
    </div>
  );
  switch (el.type) {
    case "title": {
      const size = { xl: horizontal ? 104 : 96, l: horizontal ? 84 : 80, m: horizontal ? 64 : 64 }[el.size ?? "l"];
      return wrap(
        <Words text={el.text} accent={el.accent} underline={el.underline} atF={el.atF}
          style={{ fontFamily: brand.display, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: -1.5, color: pal.ink, textAlign: "center", maxWidth: contentW }} />
      );
    }
    case "text": {
      const size = { l: 60, m: 50, s: 40 }[el.size ?? "m"];
      return wrap(
        <Words text={el.text} accent={el.accent} atF={el.atF} stagger={1}
          style={{ fontFamily: brand.body, fontWeight: 600, fontSize: size, lineHeight: 1.18, color: pal.muted, textAlign: "center", maxWidth: contentW * 0.92 }} />
      );
    }
    case "icon":
      return wrap(<IconTile icon={el.icon} label={el.label} atF={el.atF} size={el.size ?? 190} accent={el.accent} marks={el.marks} />);
    case "flow": {
      const dir = el.direction ?? "row";
      const n = el.nodes.length;
      const arrowLen = dir === "row" ? (horizontal ? 120 : 70) : 70;
      const nodeSize = dir === "row" ? Math.min(170, (contentW - (n - 1) * arrowLen) / n / 1.35) : 140;
      return wrap(
        <div style={{ display: "flex", flexDirection: dir === "row" ? "row" : "column", alignItems: "flex-start", gap: 8 }}>
          {el.nodes.map((node, k) => (
            <React.Fragment key={k}>
              {k > 0 && <div style={{ alignSelf: dir === "row" ? "flex-start" : "center", marginTop: dir === "row" ? nodeSize * 0.62 - 30 : 0 }}>
                <FlowArrow p={prog(f, node.atF - 6, 12)} dir={dir} len={arrowLen} />
              </div>}
              <IconTile icon={node.icon ?? "circle"} label={node.label} atF={node.atF} size={nodeSize} accent={node.accent} marks={node.marks} />
            </React.Fragment>
          ))}
        </div>
      );
    }
    case "list":
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", gap: 26, width: Math.min(contentW, 860) }}>
          {el.items.map((it, k) => {
            const s = pop(f, it.atF, fps);
            return (
              <div key={k} style={{ position: "relative", display: "flex", alignItems: "center", gap: 26, opacity: f < it.atF ? 0 : Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * -60}px)` }}>
                <div style={{ flex: "none", width: 74, height: 74, borderRadius: 999, background: pal.accent, color: "#fff", display: "grid", placeItems: "center", fontFamily: brand.display, fontWeight: 800, fontSize: 36 }}>
                  {el.numbered === false ? "•" : k + 1}
                </div>
                <div style={{ position: "relative", fontFamily: brand.body, fontWeight: 700, fontSize: 50, lineHeight: 1.12, color: pal.ink }}>
                  {it.text}
                  <MarkLayer marks={it.marks} />
                </div>
              </div>
            );
          })}
        </div>
      );
    case "compare": {
      const colW = (Math.min(contentW, horizontal ? 1000 : 800) - 60) / 2;
      const divider = prog(f, Math.min(el.left.atF, el.right.atF), 14);
      return wrap(
        <div style={{ display: "flex", gap: 60, alignItems: "flex-start", position: "relative" }}>
          <CompareCol side={el.left} width={colW} />
          <div style={{ position: "absolute", left: colW + 28, top: 0, width: 4, height: `${divider * 100}%`, background: pal.line, opacity: 0.18, borderRadius: 4 }} />
          <CompareCol side={el.right} width={colW} />
        </div>
      );
    }
    case "stat": {
      const p = prog(f, el.atF, 26);
      const val = el.value * p;
      const txt = val.toLocaleString("en-US", { minimumFractionDigits: el.decimals ?? 0, maximumFractionDigits: el.decimals ?? 0 });
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: brand.display, fontWeight: 800, fontSize: horizontal ? 190 : 200, letterSpacing: -4, lineHeight: 1, color: pal.ink }}>
            {el.prefix}{txt}<span style={{ color: pal.accent, fontSize: "0.42em", marginLeft: 10 }}>{el.unit}</span>
          </div>
          {el.label && <div style={{ fontFamily: brand.body, fontWeight: 600, fontSize: 44, color: pal.muted, marginTop: 10, opacity: prog(f, el.atF + 10, 10) }}>{el.label}</div>}
        </div>
      );
    }
    case "strike": {
      const sp = prog(f, el.strikeAtF ?? el.atF + 18, 10);
      const ap = el.after ? pop(f, el.afterAtF ?? (el.strikeAtF ?? el.atF + 18) + 6, fps) : 0;
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative", fontFamily: brand.display, fontWeight: 800, fontSize: 72, color: sp > 0.5 ? pal.muted : pal.ink, opacity: prog(f, el.atF, 8) }}>
            {el.before}
            <svg style={{ position: "absolute", left: -10, top: "50%", width: "calc(100% + 20px)", height: 30, marginTop: -15, overflow: "visible" }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <Reveal p={sp}><path d="M 0 18 C 30 10 70 22 100 12" stroke={brand.color.danger} strokeWidth={8} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></Reveal>
            </svg>
          </div>
          {el.after && <div style={{ fontFamily: brand.display, fontWeight: 800, fontSize: 84, color: pal.accent, opacity: Math.min(1, ap * 1.5), transform: `scale(${0.8 + 0.2 * ap})` }}>{el.after}</div>}
        </div>
      );
    }
    case "image": {
      const s = pop(f, el.atF, fps);
      const w = el.width ?? (el.phone ? 460 : contentW * 0.9);
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, transform: `translateY(${(1 - s) * 80}px) scale(${0.92 + 0.08 * s})`, opacity: Math.min(1, s * 1.4) }}>
          <div style={{ width: w, borderRadius: el.phone ? 64 : 28, overflow: "hidden", border: el.phone ? `14px solid ${brand.color.ink}` : `3px solid ${pal.line}`, boxShadow: "10px 14px 0 rgba(33,35,32,0.12)", background: "#fff" }}>
            <Img src={staticFile(el.src)} style={{ width: "100%", display: "block" }} />
          </div>
          {el.caption && <div style={{ fontFamily: brand.body, fontWeight: 600, fontSize: 38, color: pal.muted }}>{el.caption}</div>}
        </div>
      );
    }
    case "chips":
      return wrap(
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, maxWidth: contentW }}>
          {el.items.map((c, k) => {
            const s = pop(f, c.atF, fps);
            return (
              <div key={k} style={{ padding: "18px 34px", borderRadius: 999, background: k % 2 ? pal.card : pal.accent, color: k % 2 ? pal.ink : "#fff",
                border: k % 2 ? `3px solid ${pal.line}` : "none", fontFamily: brand.body, fontWeight: 700, fontSize: 40, opacity: f < c.atF ? 0 : Math.min(1, s * 1.5), transform: `scale(${0.7 + 0.3 * s})` }}>
                {c.text}
              </div>
            );
          })}
        </div>
      );
  }
};

/* ---------------- The board ---------------- */
export const BoardView: React.FC<{
  board: BoardT;
  area: { top: number; bottom: number; left: number; right: number };
  enterF: number; // frame this board appearance started
  enter: "slide" | "cut";
  horizontal: boolean;
}> = ({ board, area, enterF, enter, horizontal }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pal = PAL[board.theme ?? "paper"];
  const e = enter === "slide" ? prog(f, enterF, 8) : 1;
  const drift = interpolate(f - enterF, [0, 240], [1, 1.035], { extrapolateRight: "clamp" });
  const contentW = width - area.left - area.right;
  const els = board.elements;
  return (
    <PalCtx.Provider value={pal}>
      <AbsoluteFill style={{ background: pal.bg, transform: `translateY(${(1 - e) * height * 0.12}px)`, opacity: enter === "slide" ? Math.min(1, e * 2.5) : 1 }}>
        {/* dot grid, like a fresh sheet of dotted paper */}
        <AbsoluteFill style={{ backgroundImage: `radial-gradient(${board.theme === "ink" ? "rgba(255,255,255,0.10)" : "rgba(33,35,32,0.13)"} 2.2px, transparent 2.6px)`, backgroundSize: "48px 48px", backgroundPosition: "24px 24px" }} />
        {board.label && (
          <div style={{ position: "absolute", top: area.top - 6, left: area.left, right: area.right, display: "flex", justifyContent: "center", alignItems: "center", gap: 18,
            fontFamily: brand.body, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: pal.muted, textTransform: "uppercase" }}>
            <div style={{ width: 54, height: 3, background: pal.accent }} />
            {board.label}
            <div style={{ width: 54, height: 3, background: pal.accent }} />
          </div>
        )}
        <div style={{ position: "absolute", top: area.top + (board.label ? 70 : 0), bottom: area.bottom, left: area.left, right: area.right,
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: horizontal ? 44 : 64,
          transform: `scale(${drift * (horizontal ? 1.12 : 1.22)})`, transformOrigin: "50% 45%" }}>
          {els.map((el, k) => (
            <Element key={k} el={el} contentW={contentW} horizontal={horizontal} />
          ))}
        </div>
      </AbsoluteFill>
    </PalCtx.Provider>
  );
};
