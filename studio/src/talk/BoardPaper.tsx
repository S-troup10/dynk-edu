// "Paper" board: a sheet of real-looking paper that gets drawn on with marker while you talk.
// Built against what reads as AI-made: nothing is perfectly straight, centred or clean.
//  - wobbly marker strokes (rough.js) that "boil" (re-jitter every 4 frames, like hand animation)
//  - element motion on twos (12–15 fps steps), stop-motion style, never smooth tweens
//  - paper fibre + grain, highlighter swipes, sticky notes, taped cut-outs, torn clippings
//  - editorial serif titles (Instrument Serif) + readable marker handwriting (Shantell Sans)
// Same element schema as the clean board, plus `note` and `clipping`.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import rough from "roughjs";
import { icons } from "lucide";
import { SERIF, HAND, INK } from "./fonts";
import type { Board as BoardT, BoardElement, Mark, CompareSide } from "./types";

const gen = rough.generator();
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const useTwos = () => Math.floor(useCurrentFrame() / 2) * 2; // stop-motion: animate on twos
const appear = (f: number, at: number, dur: number) => clamp01((f - at) / Math.max(1, dur));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const ROT = [-1.6, 1.2, -0.6, 1.8, -1.1, 0.7];
const DX = [-16, 14, -6, 20, -12, 8];
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%']/g, "");

/* ---------- boil: shared displacement filters, the line wobble of hand-drawn animation ---------- */
const BoilDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      {[0, 1, 2].map((s) => (
        <React.Fragment key={s}>
          <filter id={`boil${s}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={s * 7 + 3} />
            <feDisplacementMap in="SourceGraphic" scale={4.5} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`boilS${s}`} x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={1} seed={s * 5 + 11} />
            <feDisplacementMap in="SourceGraphic" scale={1.8} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </React.Fragment>
      ))}
    </defs>
  </svg>
);
const useBoil = (small = false) => {
  const f = useCurrentFrame();
  return `url(#${small ? "boilS" : "boil"}${Math.floor(f / 4) % 3})`;
};

/* ---------- rough shapes ---------- */
type RP = { d: string; stroke: string; strokeWidth: number; fill?: string };
const toPaths = (d: ReturnType<typeof gen.ellipse>) => gen.toPaths(d) as RP[];

// reveal any svg content left→right (works with non-scaling strokes)
let clipSeq = 0;
const Reveal: React.FC<{ p: number; children: React.ReactNode; w?: number; h?: number }> = ({ p, children, w = 100, h = 100 }) => {
  const id = React.useMemo(() => `prv${clipSeq++}`, []);
  return (
    <g>
      <defs><clipPath id={id}><rect x={-w * 0.2} y={-h * 0.2} width={w * 1.4 * p} height={h * 1.4} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </g>
  );
};

const RoughSvgPaths: React.FC<{ paths: RP[]; color?: string; width?: number; nonScaling?: boolean; draw?: number }> = ({ paths, color, width, nonScaling, draw }) => (
  <>
    {paths.map((p, k) => (
      <path key={k} d={p.d} fill="none" stroke={p.stroke === "none" ? "none" : color ?? p.stroke} strokeWidth={width ?? p.strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" vectorEffect={nonScaling ? "non-scaling-stroke" : undefined}
        {...(draw !== undefined ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw } : {})} />
    ))}
  </>
);

/* ---------- marks: circled, underlined, crossed, ticked — over any element ---------- */
const markPaths = (kind: Mark["kind"], seed: number): { paths: RP[]; color: string; w: number } => {
  const o = { seed, roughness: 1.3, bowing: 1.4 };
  if (kind === "circle") return { paths: toPaths(gen.ellipse(50, 50, 104, 98, o)), color: INK.orange, w: 7 };
  if (kind === "underline") return { paths: toPaths(gen.curve([[2, 96], [35, 93], [70, 98], [99, 94]], o)), color: INK.orange, w: 9 };
  if (kind === "cross") return { paths: [...toPaths(gen.line(8, 8, 92, 92, o)), ...toPaths(gen.line(92, 8, 8, 92, { ...o, seed: seed + 1 }))], color: INK.red, w: 10 };
  return { paths: toPaths(gen.linearPath([[10, 52], [38, 82], [92, 12]], o)), color: INK.green, w: 11 };
};
const MarkLayer: React.FC<{ marks?: Mark[]; seed?: number }> = ({ marks, seed = 1 }) => {
  const f = useTwos();
  const boil = useBoil();
  const shapes = React.useMemo(() => (marks ?? []).map((m, k) => markPaths(m.kind, seed * 13 + k)), [marks, seed]);
  if (!marks?.length) return null;
  return (
    <svg style={{ position: "absolute", inset: -26, width: "calc(100% + 52px)", height: "calc(100% + 52px)", overflow: "visible", pointerEvents: "none", filter: boil }}
      viewBox="0 0 100 100" preserveAspectRatio="none">
      {marks.map((m, k) => {
        const p = easeOut(appear(f, m.atF, m.kind === "circle" ? 12 : 8));
        if (p <= 0) return null;
        const s = shapes[k];
        return <Reveal key={k} p={p}><RoughSvgPaths paths={s.paths} color={s.color} width={s.w} nonScaling /></Reveal>;
      })}
    </svg>
  );
};

/* ---------- highlighter swipe behind a word ---------- */
const Highlighter: React.FC<{ p: number; seed: number; tall?: boolean }> = ({ p, seed, tall }) => {
  const r = (k: number) => ((Math.sin(seed * 9.1 + k * 3.7) + 1) / 2);
  return (
    <span style={{ position: "absolute", left: -8 - r(1) * 6, right: -8 - r(2) * 6, top: tall ? "18%" : "38%", bottom: tall ? "4%" : "2%",
      background: INK.highlighter, mixBlendMode: "multiply", borderRadius: "6px 14px 8px 18px",
      transform: `rotate(${(r(3) - 0.5) * 2.4}deg) scaleX(${p})`, transformOrigin: "left center", zIndex: -1 }} />
  );
};

/* ---------- serif title: words land on twos; accent words go italic with a highlighter swipe ---------- */
const Title: React.FC<{ text: string; atF: number; accent?: string[]; underline?: string[]; size: number; maxW: number }> = ({ text, atF, accent = [], underline = [], size, maxW }) => {
  const f = useTwos();
  const acc = accent.map(norm);
  const und = underline.map(norm);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.22em", maxWidth: maxW, fontFamily: SERIF, fontSize: size, lineHeight: 0.98, color: INK.ink, letterSpacing: -1, textAlign: "center" }}>
      {text.split(" ").map((w, i) => {
        const at = atF + i * 2;
        const vis = f >= at;
        const isAcc = acc.includes(norm(w));
        const u = und.includes(norm(w)) ? easeOut(appear(f, at + 6, 8)) : 0;
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", isolation: "isolate", opacity: vis ? 1 : 0,
            transform: `translateY(${vis && f - at < 2 ? 6 : 0}px)`, fontStyle: isAcc ? "italic" : "normal" }}>
            {isAcc && <Highlighter p={easeOut(appear(f, at + 4, 8))} seed={i + atF} tall />}
            {w}
            {u > 0 && <span style={{ position: "absolute", left: 0, right: 0, bottom: -10, height: 18 }}><MarkLayer marks={[{ kind: "underline", atF: at + 6 }]} seed={i} /></span>}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- handwriting: revealed left→right like it's being written ---------- */
const Hand: React.FC<{ text: string; atF: number; size: number; color?: string; weight?: number; highlight?: string[]; maxW?: number; align?: "center" | "left" }> = ({
  text, atF, size, color = INK.ink, weight = 600, highlight = [], maxW, align = "center",
}) => {
  const f = useTwos();
  const boil = useBoil(true);
  const dur = Math.min(30, Math.max(8, text.length * 0.7));
  const p = appear(f, atF, dur);
  const hl = highlight.map(norm);
  return (
    <div style={{ position: "relative", maxWidth: maxW, fontFamily: HAND, fontWeight: weight, fontSize: size, lineHeight: 1.12, color, textAlign: align,
      clipPath: `inset(-20% ${100 - p * 100}% -20% -5%)`, filter: boil }}>
      {text.split(" ").map((w, i, arr) => (
        <span key={i} style={{ position: "relative", display: "inline-block", isolation: "isolate" }}>
          {hl.includes(norm(w)) && <Highlighter p={easeOut(appear(f, atF + dur * (i / arr.length) + 3, 8))} seed={i} />}
          {w}{i < arr.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

/* ---------- doodle icon: Lucide geometry drawn on with a marker, boiling ---------- */
const pascal = (n: string) => n.split(/[-_ ]+/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
const Doodle: React.FC<{ name: string; size: number; atF: number; accent?: boolean; seed?: number }> = ({ name, size, atF, accent, seed = 1 }) => {
  const f = useTwos();
  const boil = useBoil();
  const node = ((icons as Record<string, unknown>)[pascal(name)] ?? (icons as Record<string, unknown>)["CircleHelp"]) as [string, Record<string, string>][];
  const p = appear(f, atF, 14);
  const blob = React.useMemo(() => toPaths(gen.ellipse(50, 52, 92, 86, { seed: seed + 4, fill: INK.orange, fillStyle: "hachure", hachureGap: 7, fillWeight: 3.2, hachureAngle: -38, stroke: "none", roughness: 1.6 })), [seed]);
  return (
    <div style={{ position: "relative", width: size, height: size, filter: boil }}>
      {accent && (
        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: -size * 0.12, width: size * 1.24, height: size * 1.24, opacity: 0.55 }}>
          <Reveal p={easeOut(appear(f, atF, 8))}><RoughSvgPaths paths={blob} color={INK.orange} /></Reveal>
        </svg>
      )}
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={INK.ink} strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
        {node.map(([tag, attrs], k) => {
          const local = clamp01(p * (node.length + 1) - k * 0.8);
          return React.createElement(tag, { ...attrs, key: k, pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - local });
        })}
      </svg>
    </div>
  );
};

const DoodleWithLabel: React.FC<{ icon: string; label?: string; atF: number; size: number; accent?: boolean; marks?: Mark[]; seed: number }> = ({ icon, label, atF, size, accent, marks, seed }) => {
  const f = useTwos();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: f >= atF ? 1 : 0 }}>
      <div style={{ position: "relative" }}>
        <Doodle name={icon} size={size} atF={atF} accent={accent} seed={seed} />
        <MarkLayer marks={marks} seed={seed} />
      </div>
      {label && <Hand text={label} atF={atF + 6} size={Math.max(40, size * 0.27)} maxW={size * 2} />}
    </div>
  );
};

/* ---------- marker arrow between flow nodes ---------- */
const MarkerArrow: React.FC<{ p: number; dir: "row" | "column"; len: number; seed: number }> = ({ p, dir, len, seed }) => {
  const boil = useBoil();
  const w = dir === "row" ? len : 70, h = dir === "row" ? 70 : len;
  const paths = React.useMemo(() => {
    const o = { seed, roughness: 1.2, bowing: 2 };
    if (dir === "row")
      return { body: toPaths(gen.curve([[4, h / 2 + 8], [w * 0.5, h / 2 - 10], [w - 8, h / 2]], o)), head: toPaths(gen.linearPath([[w - 30, h / 2 - 18], [w - 6, h / 2], [w - 28, h / 2 + 18]], o)) };
    return { body: toPaths(gen.curve([[w / 2 + 8, 4], [w / 2 - 10, h * 0.5], [w / 2, h - 8]], o)), head: toPaths(gen.linearPath([[w / 2 - 18, h - 30], [w / 2, h - 6], [w / 2 + 18, h - 28]], o)) };
  }, [dir, w, h, seed]);
  return (
    <svg width={w} height={h} style={{ overflow: "visible", flex: "none", filter: boil }}>
      <RoughSvgPaths paths={paths.body} color={INK.ink} width={4.5} draw={clamp01(p * 1.4)} />
      <RoughSvgPaths paths={paths.head} color={INK.ink} width={4.5} draw={clamp01(p * 1.4 - 0.8) * 5} />
    </svg>
  );
};

/* ---------- tape strip ---------- */
const Tape: React.FC<{ rot?: number; top?: number; left?: string }> = ({ rot = -6, top = -26, left = "50%" }) => (
  <div style={{ position: "absolute", top, left, width: 150, height: 46, marginLeft: -75, background: "rgba(232,224,204,0.82)",
    transform: `rotate(${rot}deg)`, boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
    clipPath: "polygon(2% 8%, 10% 0, 20% 6%, 32% 1%, 45% 7%, 58% 0, 70% 5%, 83% 1%, 98% 6%, 100% 92%, 88% 100%, 75% 94%, 62% 100%, 48% 95%, 35% 100%, 22% 94%, 10% 100%, 0 93%)" }} />
);

/* ---------- elements ---------- */
const CompareCol: React.FC<{ side: CompareSide; width: number; seed: number }> = ({ side, width, seed }) => {
  const f = useTwos();
  const vp = side.verdict && side.verdictAtF !== undefined ? side.verdictAtF : null;
  return (
    <div style={{ width, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: f >= side.atF ? 1 : 0 }}>
      <div style={{ position: "relative" }}>
        <Hand text={side.title} atF={side.atF} size={46} weight={700} maxW={width} />
      </div>
      {side.icon && (
        <div style={{ position: "relative", marginTop: 6 }}>
          <Doodle name={side.icon} size={160} atF={side.atF + 4} accent={side.verdict === "good"} seed={seed} />
          {vp !== null && <MarkLayer marks={[{ kind: side.verdict === "good" ? "check" : "cross", atF: vp }]} seed={seed + 3} />}
        </div>
      )}
      {(side.lines ?? []).map((l, k) => <Hand key={k} text={l} atF={side.atF + 8 + k * 6} size={38} color={INK.soft} maxW={width} />)}
      {!side.icon && vp !== null && <div style={{ position: "relative", width: 110, height: 110 }}><MarkLayer marks={[{ kind: side.verdict === "good" ? "check" : "cross", atF: vp }]} seed={seed} /></div>}
    </div>
  );
};

const Element: React.FC<{ el: BoardElement; k: number; contentW: number; horizontal: boolean }> = ({ el, k, contentW, horizontal }) => {
  const f = useTwos();
  const { fps } = useVideoConfig();
  const visible = f >= el.atF - 1;
  const rot = ROT[k % ROT.length] * (el.type === "title" || el.type === "flow" || el.type === "compare" ? 0.4 : 1);
  const wrap = (child: React.ReactNode) => (
    <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", visibility: visible ? "visible" : "hidden" }}>
      <div style={{ position: "relative", transform: `translateX(${DX[k % DX.length]}px) rotate(${rot}deg)` }}>
        {child}
        {el.type !== "icon" && <MarkLayer marks={el.marks} seed={k + 1} />}
      </div>
    </div>
  );
  switch (el.type) {
    case "title": {
      const size = { xl: horizontal ? 128 : 132, l: horizontal ? 108 : 112, m: horizontal ? 86 : 90 }[el.size ?? "l"];
      return wrap(<Title text={el.text} atF={el.atF} accent={el.accent} underline={el.underline} size={size} maxW={contentW} />);
    }
    case "text": {
      const size = { l: 64, m: 54, s: 44 }[el.size ?? "m"];
      return wrap(<Hand text={el.text} atF={el.atF} size={size} highlight={(el as { highlight?: string[] }).highlight ?? el.accent} maxW={contentW * 0.92} />);
    }
    case "icon":
      return wrap(<DoodleWithLabel icon={el.icon} label={el.label} atF={el.atF} size={el.size ?? 230} accent={el.accent} marks={el.marks} seed={k + 2} />);
    case "flow": {
      const dir = el.direction ?? "row";
      const n = el.nodes.length;
      const arrowLen = dir === "row" ? (horizontal ? 140 : 90) : 90;
      const node = dir === "row" ? Math.min(200, (contentW - (n - 1) * arrowLen) / n / 1.15) : 160;
      return wrap(
        <div style={{ display: "flex", flexDirection: dir === "row" ? "row" : "column", alignItems: dir === "row" ? "flex-start" : "center", gap: 4 }}>
          {el.nodes.map((nd, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ marginTop: dir === "row" ? node * 0.5 - 35 : 0 }}><MarkerArrow p={appear(f, nd.atF - 6, 10)} dir={dir} len={arrowLen} seed={k * 7 + i} /></div>}
              <DoodleWithLabel icon={nd.icon ?? "circle"} label={nd.label} atF={nd.atF} size={node} accent={nd.accent} marks={nd.marks} seed={k * 5 + i} />
            </React.Fragment>
          ))}
        </div>
      );
    }
    case "list":
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", gap: 30, width: Math.min(contentW, 880) }}>
          {el.items.map((it, i) => <ListRow key={i} text={it.text} atF={it.atF} n={i + 1} numbered={el.numbered !== false} marks={it.marks} seed={k * 11 + i} />)}
        </div>
      );
    case "compare": {
      const colW = (Math.min(contentW, horizontal ? 1100 : 900) - 50) / 2;
      return wrap(
        <div style={{ display: "flex", gap: 50, alignItems: "flex-start" }}>
          <CompareCol side={el.left} width={colW} seed={k * 3} />
          <CompareCol side={el.right} width={colW} seed={k * 3 + 1} />
        </div>
      );
    }
    case "stat": {
      const p = easeOut(appear(f, el.atF, 22));
      const txt = (el.value * p).toLocaleString("en-US", { minimumFractionDigits: el.decimals ?? 0, maximumFractionDigits: el.decimals ?? 0 });
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", isolation: "isolate", fontFamily: SERIF, fontSize: horizontal ? 220 : 240, lineHeight: 0.95, letterSpacing: -4, color: INK.ink }}>
            {el.prefix}{txt}
            {el.unit && <span style={{ position: "relative", fontStyle: "italic", fontSize: "0.5em", marginLeft: 12, display: "inline-block", isolation: "isolate" }}>
              <Highlighter p={easeOut(appear(f, el.atF + 16, 8))} seed={3} tall />{el.unit}</span>}
          </div>
          {el.label && <Hand text={el.label} atF={el.atF + 12} size={46} color={INK.soft} maxW={contentW} />}
        </div>
      );
    }
    case "strike": {
      const sAt = el.strikeAtF ?? el.atF + 18;
      const sp = easeOut(appear(f, sAt, 8));
      return wrap(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative" }}>
            <Hand text={el.before} atF={el.atF} size={66} color={sp > 0.5 ? INK.soft : INK.ink} />
            <Scribble p={sp} seed={k} />
          </div>
          {el.after && f >= (el.afterAtF ?? sAt + 6) && (
            <div style={{ position: "relative", isolation: "isolate", fontFamily: SERIF, fontStyle: "italic", fontSize: 100, color: INK.ink, lineHeight: 1 }}>
              <Highlighter p={easeOut(appear(f, (el.afterAtF ?? sAt + 6) + 2, 8))} seed={k} tall />{el.after}
            </div>
          )}
        </div>
      );
    }
    case "image": {
      const p = appear(f, el.atF, 6);
      const w = el.width ?? (el.phone ? 480 : contentW * 0.86);
      return wrap(
        <div style={{ position: "relative", transform: `translateY(${(1 - easeOut(p)) * 40}px) rotate(${(1 - p) * 4}deg)`, opacity: p > 0 ? 1 : 0 }}>
          <div style={{ width: w, padding: el.phone ? 0 : 14, background: "#fff", borderRadius: el.phone ? 54 : 4, border: el.phone ? `12px solid ${INK.ink}` : "none", overflow: "hidden",
            boxShadow: "0 22px 30px -18px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.12)" }}>
            <Img src={staticFile(el.src)} style={{ width: "100%", display: "block", borderRadius: el.phone ? 40 : 0 }} />
          </div>
          <Tape rot={-5} />
          {el.caption && <div style={{ marginTop: 14 }}><Hand text={el.caption} atF={el.atF + 6} size={40} color={INK.soft} /></div>}
        </div>
      );
    }
    case "chips":
      return wrap(
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "22px 30px", maxWidth: contentW }}>
          {el.items.map((c, i) => <BoxedWord key={i} text={c.text} atF={c.atF} seed={k * 9 + i} accent={i === 0} />)}
        </div>
      );
    case "note": {
      const n = el as unknown as { text: string; atF: number; color?: "yellow" | "orange" | "white" };
      const p = appear(f, n.atF, 6);
      const bg = n.color === "orange" ? INK.noteOrange : n.color === "white" ? "#FBFAF6" : INK.note;
      return wrap(
        <div style={{ position: "relative", width: Math.min(560, contentW * 0.7), minHeight: 300, padding: "54px 44px 44px", background: bg,
          boxShadow: "0 26px 26px -20px rgba(0,0,0,0.42), 0 1px 2px rgba(0,0,0,0.1)", opacity: p > 0 ? 1 : 0,
          transform: `scale(${1 + (1 - easeOut(p)) * 0.08}) translateY(${(1 - easeOut(p)) * -30}px)`,
          borderRadius: "2px 2px 18px 2px", display: "grid", placeItems: "center" }}>
          <Tape rot={3} top={-22} />
          <Hand text={n.text} atF={n.atF + 4} size={58} weight={700} maxW={Math.min(480, contentW * 0.6)} highlight={(el as { highlight?: string[] }).highlight} />
        </div>
      );
    }
    case "clipping": {
      const c = el as unknown as { headline: string; sub?: string; atF: number };
      const p = appear(f, c.atF, 6);
      return wrap(
        <div style={{ position: "relative", width: Math.min(contentW * 0.92, 900), opacity: p > 0 ? 1 : 0, transform: `translateY(${(1 - easeOut(p)) * 30}px)` }}>
          <div style={{ background: "#ECE6D8", padding: "46px 46px 50px", boxShadow: "0 22px 26px -18px rgba(0,0,0,0.4)",
            clipPath: "polygon(0 3%, 6% 0, 13% 2.5%, 21% 0.5%, 30% 3%, 39% 0, 48% 2%, 57% 0.5%, 66% 3%, 75% 0, 84% 2.5%, 92% 0.5%, 100% 2%, 100% 97%, 93% 100%, 85% 97.5%, 76% 99.5%, 67% 97%, 58% 100%, 49% 97.5%, 40% 99.5%, 31% 97%, 22% 100%, 13% 97.5%, 5% 99.5%, 0 97%)" }}>
            <div style={{ height: 3, background: INK.ink, opacity: 0.8, marginBottom: 6 }} />
            <div style={{ height: 1, background: INK.ink, opacity: 0.8, marginBottom: 26 }} />
            <div style={{ fontFamily: SERIF, fontSize: horizontal ? 72 : 78, lineHeight: 1.02, color: INK.ink, letterSpacing: -0.5 }}>{c.headline}</div>
            {c.sub && <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 38, color: INK.soft, marginTop: 18 }}>{c.sub}</div>}
          </div>
          <Tape rot={-4} top={-20} left="22%" />
        </div>
      );
    }
  }
  return null;
};

const ListRow: React.FC<{ text: string; atF: number; n: number; numbered: boolean; marks?: Mark[]; seed: number }> = ({ text, atF, n, numbered, marks, seed }) => {
  const f = useTwos();
  const boil = useBoil();
  const ring = React.useMemo(() => toPaths(gen.ellipse(40, 40, 70, 66, { seed, roughness: 1.4 })), [seed]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: f >= atF ? 1 : 0 }}>
      <div style={{ position: "relative", flex: "none", width: 80, height: 80, display: "grid", placeItems: "center" }}>
        <svg viewBox="0 0 80 80" style={{ position: "absolute", inset: 0, filter: boil }}><RoughSvgPaths paths={ring} color={INK.orange} width={4} draw={easeOut(appear(f, atF, 8))} /></svg>
        <span style={{ fontFamily: HAND, fontWeight: 800, fontSize: 40, color: INK.ink, opacity: f >= atF + 4 ? 1 : 0 }}>{numbered ? n : "•"}</span>
      </div>
      <div style={{ position: "relative" }}>
        <Hand text={text} atF={atF + 3} size={54} align="left" />
        <MarkLayer marks={marks} seed={seed} />
      </div>
    </div>
  );
};

const BoxedWord: React.FC<{ text: string; atF: number; seed: number; accent?: boolean }> = ({ text, atF, seed, accent }) => {
  const f = useTwos();
  const boil = useBoil();
  const box = React.useMemo(() => toPaths(gen.rectangle(3, 3, 94, 94, { seed, roughness: 1.6 })), [seed]);
  return (
    <div style={{ position: "relative", padding: "16px 32px", opacity: f >= atF ? 1 : 0 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", filter: boil }}>
        <Reveal p={easeOut(appear(f, atF, 8))}><RoughSvgPaths paths={box} color={accent ? INK.orange : INK.ink} width={4} nonScaling /></Reveal>
      </svg>
      <Hand text={text} atF={atF + 3} size={46} weight={700} />
    </div>
  );
};

const Scribble: React.FC<{ p: number; seed: number }> = ({ p, seed }) => {
  const boil = useBoil();
  const paths = React.useMemo(() => toPaths(gen.linearPath([[0, 60], [18, 40], [30, 62], [50, 38], [64, 60], [82, 40], [100, 55]], { seed, roughness: 1.1 })), [seed]);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", left: -12, right: -12, top: "5%", width: "calc(100% + 24px)", height: "90%", overflow: "visible", filter: boil }}>
      <Reveal p={p}><RoughSvgPaths paths={paths} color={INK.red} width={7} nonScaling /></Reveal>
    </svg>
  );
};

/* ---------- paper ---------- */
export const PaperTexture: React.FC<{ tone?: string }> = ({ tone = INK.paper }) => (
  <AbsoluteFill style={{ background: tone }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <filter id="paperFibre">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={4} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.32  0 0 0 0 0.27  0 0 0 0 0.2  0 0 0 0.11 0" />
      </filter>
      <filter id="paperBlotch">
        <feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves={3} seed={9} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.16 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paperBlotch)" />
      <rect width="100%" height="100%" filter="url(#paperFibre)" />
    </svg>
  </AbsoluteFill>
);

export const BoardPaperView: React.FC<{
  board: BoardT;
  area: { top: number; bottom: number; left: number; right: number };
  enterF: number;
  horizontal: boolean;
}> = ({ board, area, enterF, horizontal }) => {
  const f = useTwos();
  const { width } = useVideoConfig();
  const SCALE = horizontal ? 1.08 : 1.2; // draw big; layout widths are divided back so nothing leaves the frame
  const contentW = (width - area.left - area.right) / SCALE;
  // handheld: tiny drift on twos, like the paper is on a desk under a phone
  const t = (f - enterF) / 30;
  const hx = Math.sin(t * 1.3) * 3 + Math.sin(t * 2.9) * 1.5;
  const hy = Math.cos(t * 1.1) * 3;
  const hr = Math.sin(t * 0.8) * 0.25;
  const labelBoil = useBoil(true);
  const ul = React.useMemo(() => toPaths(gen.curve([[0, 8], [120, 4], [260, 10]], { seed: 5, roughness: 1 })), []);
  return (
    <AbsoluteFill>
      <BoilDefs />
      <AbsoluteFill style={{ transform: `translate(${hx}px, ${hy}px) rotate(${hr}deg) scale(1.02)` }}>
        <PaperTexture />
        {board.label && (
          <div style={{ position: "absolute", top: area.top - 10, left: area.left + 10, filter: labelBoil }}>
            <div style={{ fontFamily: HAND, fontWeight: 600, fontSize: 40, color: INK.soft, transform: "rotate(-1.5deg)" }}>{board.label.toLowerCase()}</div>
            <svg width={270} height={16} style={{ display: "block", marginTop: 2 }}><RoughSvgPaths paths={ul} color={INK.orange} width={4} /></svg>
          </div>
        )}
        <div style={{ position: "absolute", top: area.top + (board.label ? 90 : 0), bottom: area.bottom, left: area.left, right: area.right,
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: horizontal ? 50 : 70,
          transform: `scale(${SCALE})`, transformOrigin: "50% 45%" }}>
          {board.elements.map((el, k) => <Element key={k} el={el} k={k} contentW={contentW} horizontal={horizontal} />)}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
