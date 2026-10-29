// One-take talking head + "blank board" explainer.
// Layers (bottom → top): A-roll (always playing, carries the voice) → board / split / pip →
// hook text → captions. SFX are scheduled from the EDL. Everything is a pure function of the
// frame, so renders are deterministic.
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { brand } from "../brand";
import { BoardView, prog } from "./Board";
import { BoardPaperView } from "./BoardPaper";
import { NATIVE } from "./fonts";
import type { Segment, TalkProps, TWord } from "./types";

const segAt = (segs: Segment[], f: number) => segs.find((s) => f >= s.fromF && f < s.toF) ?? segs[segs.length - 1];

/* ---------------- Face: punch-ins hide jump cuts, subtle push, rehook punch ---------------- */
const faceZoom = (seg: Segment, f: number, seams: number[]) => {
  const base = seg.zoom ?? 1;
  const cutsInSeg = seams.filter((s) => s > seg.fromF && s <= f);
  const k = cutsInSeg.length;
  const shotStart = k ? cutsInSeg[k - 1] : seg.fromF;
  const alt = k % 2 === 1 ? (base >= 1.3 ? -0.12 : 0.12) : 0; // every jump cut lands on a new framing
  const push = Math.min(0.03, ((f - shotStart) / 30) * 0.008);
  const punch = seg.rehook ? 0.07 * (1 - prog(f, seg.fromF, 8)) : 0;
  return base + alt + push + punch;
};

const FaceFrame: React.FC<{ src: string; zoom: number; focus: { x: number; y: number }; muted?: boolean }> = ({ src, zoom, focus, muted }) => (
  <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
    <OffthreadVideo src={src} muted={muted}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focus.x * 100}% ${focus.y * 100}%`,
        transform: `scale(${zoom})`, transformOrigin: `${focus.x * 100}% ${focus.y * 100}%` }} />
  </AbsoluteFill>
);

/* ---------------- Captions ---------------- */
type Chunk = { words: TWord[]; f0: number; f1: number };
const buildChunks = (words: TWord[], maxWords: number, maxChars: number): Chunk[] => {
  const out: Chunk[] = [];
  let cur: TWord[] = [];
  const flush = () => { if (cur.length) out.push({ words: cur, f0: cur[0].f0, f1: cur[cur.length - 1].f1 }); cur = []; };
  for (const w of words) {
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
    if (cur.length && (cur[cur.length - 1].phrase !== w.phrase || cur.length >= maxWords || chars > maxChars)) flush();
    cur.push(w);
    if (/[.?!]$/.test(w.text)) flush();
  }
  flush();
  return out;
};

const Captions: React.FC<{ chunks: Chunk[]; style: "face" | "board"; y: number; horizontal: boolean }> = ({ chunks, style, y, horizontal }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = chunks.findIndex((c, k) => f >= c.f0 && f < Math.max(c.f1 + 8, 0) && (k === chunks.length - 1 || f < chunks[k + 1].f0));
  if (idx < 0) return null;
  const c = chunks[idx];
  const s = spring({ frame: f - c.f0, fps, config: { damping: 15, stiffness: 260 } });
  const face = style === "face";
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.24em",
      transform: `translateY(-50%) scale(${0.9 + 0.1 * s})`,
      fontFamily: brand.body, fontWeight: 800, fontSize: face ? (horizontal ? 66 : 76) : 44, lineHeight: 1.1, letterSpacing: face ? -0.5 : 0,
      color: face ? "#fff" : brand.color.ink80, textAlign: "center" }}>
      {c.words.map((w) => {
        const active = f >= w.f0 - 1 && (w === c.words[c.words.length - 1] || f < c.words[c.words.indexOf(w) + 1].f0 - 1);
        return (
          <span key={w.i} style={face
            ? { color: active ? brand.color.orange : "#fff", WebkitTextStroke: "12px rgba(0,0,0,0.85)", paintOrder: "stroke fill", textShadow: "0 6px 22px rgba(0,0,0,0.45)" }
            : { color: active ? brand.color.orange : undefined }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

/* ---------------- Hook headline over the face ---------------- */
const HookText: React.FC<{ hook: NonNullable<TalkProps["hook"]>; top: number; horizontal: boolean }> = ({ hook, top, horizontal }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < hook.fromF || f >= hook.toF) return null;
  const acc = (hook.accent ?? []).map((w) => w.toLowerCase().replace(/[^a-z0-9$%']/g, ""));
  const out = 1 - prog(f, hook.toF - 5, 5);
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.26em",
      fontFamily: brand.display, fontWeight: 800, fontSize: horizontal ? 76 : 80, lineHeight: 1.08, letterSpacing: -1.5, textAlign: "center", opacity: out }}>
      {hook.text.split(" ").map((w, i) => {
        const s = f < hook.fromF + i * 2 ? 0 : spring({ frame: f - hook.fromF - i * 2, fps, config: { damping: 13, stiffness: 200 } });
        const isAcc = acc.includes(w.toLowerCase().replace(/[^a-z0-9$%']/g, ""));
        return (
          <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 40}px)`,
            color: isAcc ? brand.color.orange : "#fff", WebkitTextStroke: "12px rgba(0,0,0,0.8)", paintOrder: "stroke fill", textShadow: "0 6px 24px rgba(0,0,0,0.4)" }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------------- "paper" style: native-looking text ---------------- */
// Captions the way creators type them in the TikTok/IG editor: TikTok Sans, white, soft shadow,
// a few words, no karaoke colour. Reads as human-made, not as an auto-caption template.
const NativeCaptions: React.FC<{ chunks: Chunk[]; y: number; horizontal: boolean; onPaper?: boolean }> = ({ chunks, y, horizontal, onPaper }) => {
  const f = useCurrentFrame();
  const idx = chunks.findIndex((c, k) => f >= c.f0 && f < c.f1 + 8 && (k === chunks.length - 1 || f < chunks[k + 1].f0));
  if (idx < 0) return null;
  const c = chunks[idx];
  return (
    <div style={{ position: "absolute", top: y, left: 70, right: 70, transform: "translateY(-50%)", textAlign: "center",
      fontFamily: NATIVE, fontWeight: 700, fontSize: onPaper ? 44 : horizontal ? 54 : 58, lineHeight: 1.15,
      color: onPaper ? "rgba(29,29,27,0.8)" : "#fff",
      textShadow: onPaper ? "none" : "0 2px 3px rgba(0,0,0,0.55), 0 0 14px rgba(0,0,0,0.35)" }}>
      {c.words.map((w) => w.text).join(" ")}
    </div>
  );
};

// The hook in the native "text with background" style: black type on white rounded boxes per line.
const NativeHook: React.FC<{ hook: NonNullable<TalkProps["hook"]>; top: number; horizontal: boolean }> = ({ hook, top, horizontal }) => {
  const f = useCurrentFrame();
  if (f < hook.fromF || f >= hook.toF) return null;
  return (
    <div style={{ position: "absolute", top, left: 80, right: 80, textAlign: "center" }}>
      <span style={{ fontFamily: NATIVE, fontWeight: 700, fontSize: horizontal ? 60 : 64, lineHeight: 1.42, color: "#111",
        background: "#fff", padding: "6px 22px", borderRadius: 16, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
        {hook.text}
      </span>
    </div>
  );
};

// Film grain over everything (re-seeded on twos). Perfectly clean frames are an AI tell.
const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 24;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id={`grain${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- SFX schedule ---------------- */
type Cue = { f: number; file: string; vol: number };
const buildCues = (p: TalkProps): Cue[] => {
  if (p.sfx === "off") return [];
  const cues: Cue[] = [];
  const paper = p.style !== "clean";
  p.segments.forEach((s, k) => {
    const prev = p.segments[k - 1];
    if ((s.mode === "board" || s.mode === "split") && k > 0 && prev && prev.board !== s.board)
      cues.push(paper ? { f: s.fromF, file: "paper.wav", vol: 0.5 } : { f: s.fromF, file: "whoosh.wav", vol: 0.32 });
    if (s.mode === "face" && s.rehook && prev) cues.push(paper ? { f: s.fromF, file: "thump.wav", vol: 0.35 } : { f: s.fromF, file: "bass_hit.wav", vol: 0.42 });
  });
  if (p.sfx === "full") {
    const seen = new Set<number>();
    const add = (f: number, file: string, vol: number) => {
      if (paper) { // marker on paper: scribbles for drawing, a paper flick for things placed down
        file = /ding|tap/.test(file) ? "scribble.wav" : file === "pop.wav" ? "scribble.wav" : file;
        vol = file === "scribble.wav" ? 0.22 : vol;
      }
      if (!seen.has(f)) { seen.add(f); cues.push({ f, file, vol }); }
    };
    for (const b of Object.values(p.boards)) {
      for (const el of b.elements) {
        if (el.type === "flow") el.nodes.forEach((n) => add(n.atF, "pop.wav", 0.18));
        else if (el.type === "list") el.items.forEach((n) => add(n.atF, "tap.wav", 0.25));
        else if (el.type === "chips") el.items.forEach((n) => add(n.atF, "pop.wav", 0.18));
        else if (el.type === "compare") { add(el.left.atF, "pop.wav", 0.18); add(el.right.atF, "pop.wav", 0.18);
          for (const s of [el.left, el.right]) if (s.verdictAtF !== undefined) add(s.verdictAtF, s.verdict === "good" ? "ding.wav" : "tap.wav", 0.3); }
        else if (el.type === "note" || el.type === "clipping" || el.type === "image") add(el.atF, "paper.wav", 0.45);
        else add(el.atF, "pop.wav", 0.18);
        for (const m of el.marks ?? []) add(m.atF, m.kind === "check" ? "ding.wav" : "tap.wav", 0.28);
      }
    }
  }
  // element sounds only play while their board is on screen
  const onBoard = (f: number) => p.segments.some((s) => s.mode !== "face" && f >= s.fromF - 2 && f < s.toF);
  return cues.filter((c) => c.f < p.durationInFrames - 2 && (onBoard(c.f) || /thump|bass_hit/.test(c.file)));
};

export const TalkVideo: React.FC<TalkProps> = (p) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const horizontal = p.format === "horizontal";
  const src = staticFile(p.aroll);
  const seg = segAt(p.segments, f);
  const segIdx = p.segments.indexOf(seg);
  const cues = React.useMemo(() => buildCues(p), [p]);
  const faceChunks = React.useMemo(() => buildChunks(p.words, horizontal ? 4 : 3, horizontal ? 26 : 18), [p.words, horizontal]);
  const boardChunks = React.useMemo(() => buildChunks(p.words, 6, 34), [p.words]);
  const nativeChunks = React.useMemo(() => buildChunks(p.words, 4, 24), [p.words]);

  // where the current board appearance began (for its entry + drift) — a run of
  // consecutive segments on the same board counts as one appearance
  let enterIdx = segIdx;
  while (enterIdx > 0 && p.segments[enterIdx - 1].board === seg.board && p.segments[enterIdx - 1].mode === seg.mode) enterIdx--;
  const enterSeg = p.segments[enterIdx];

  const S = p.safe;
  const boardArea = horizontal
    ? { top: 90, bottom: seg.pip ? 120 : 90, left: 140, right: seg.pip ? 420 : 140 }
    : { top: S.top + 10, bottom: S.bottom + (seg.pip ? 300 : 40), left: S.left + 16, right: S.right - 40 };
  const splitH = horizontal ? height : Math.round(height * 0.56);
  const splitW = horizontal ? Math.round(width * 0.6) : width;

  const showCaps = (seg.captions ?? (p.captions === "always" || (p.captions === "face" && seg.mode !== "board"))) && p.captions !== "off";
  const zoom = seg.mode === "face" ? faceZoom(seg, f, p.seamsF) : 1;
  const board = seg.board ? p.boards[seg.board] : undefined;
  const paper = p.style !== "clean";
  const enter = enterIdx === 0 || paper ? "cut" : enterSeg.enter ?? "slide";
  const renderBoard = (area: { top: number; bottom: number; left: number; right: number }) =>
    paper
      ? <BoardPaperView board={board!} area={area} enterF={enterSeg.fromF} horizontal={horizontal} />
      : <BoardView board={board!} area={area} enterF={enterSeg.fromF} enter={enter} horizontal={horizontal} />;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* base A-roll: always mounted so the voice never drops */}
      <FaceFrame src={src} zoom={zoom} focus={p.face} />

      {seg.mode === "board" && board && (
        <AbsoluteFill>
          {renderBoard(boardArea)}
          {seg.pip && paper && (
            // polaroid-style cut-out of the speaker, taped to the page
            <div style={{ position: "absolute", width: horizontal ? 300 : 290, padding: "12px 12px 44px", background: "#fbfaf6",
              boxShadow: "0 22px 26px -16px rgba(0,0,0,0.45)", transform: "rotate(3deg)",
              ...(horizontal ? { right: 80, bottom: 70 } : { right: S.right + 10, bottom: S.bottom + 20 }), opacity: f >= enterSeg.fromF + 4 ? 1 : 0 }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden" }}>
                <FaceFrame src={src} zoom={1.5} focus={{ x: p.face.x, y: Math.max(0, p.face.y - 0.06) }} muted />
              </div>
            </div>
          )}
          {seg.pip && !paper && (
            <div style={{ position: "absolute", width: horizontal ? 300 : 280, height: horizontal ? 300 : 280, borderRadius: 999, overflow: "hidden",
              border: `8px solid #fff`, boxShadow: `0 0 0 5px ${brand.color.orange}, 8px 12px 0 5px rgba(33,35,32,0.15)`,
              ...(horizontal ? { right: 70, bottom: 70 } : { left: S.left + 20, bottom: S.bottom + 10 }),
              opacity: prog(f, enterSeg.fromF + 4, 8) }}>
              <FaceFrame src={src} zoom={1.55} focus={{ x: p.face.x, y: Math.max(0, p.face.y - 0.08) }} muted />
            </div>
          )}
        </AbsoluteFill>
      )}

      {seg.mode === "split" && board && (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 0, top: 0, width: splitW, height: splitH, overflow: "hidden" }}>
            {renderBoard(horizontal ? { top: 80, bottom: 80, left: 90, right: width - splitW + 60 } : { top: S.top - 40, bottom: 150, left: S.left + 10, right: S.right - 60 } /* bottom is relative to the split panel, leaves room for the hook box on the divider */)}
          </div>
          <div style={{ position: "absolute", ...(horizontal ? { left: splitW, top: 0, right: 0, bottom: 0 } : { left: 0, right: 0, top: splitH, bottom: 0 }), overflow: "hidden" }}>
            <FaceFrame src={src} zoom={(seg.zoom ?? 1.15)} focus={p.face} muted />
          </div>
          <div style={{ position: "absolute", background: paper ? "#fbfaf6" : brand.color.orange, ...(horizontal ? { left: splitW - 3, top: 0, width: 6, bottom: 0 } : { left: 0, right: 0, top: splitH - 3, height: 6 }) }} />
        </AbsoluteFill>
      )}

      {p.hook && paper && seg.mode === "split" && !horizontal && (
        // split-screen hook: the native text box sits on the divider between board and face
        <NativeHook hook={p.hook} top={splitH - 96} horizontal={false} />
      )}
      {p.hook && seg.mode === "face" && (paper
        ? <NativeHook hook={p.hook} top={horizontal ? 80 : S.top + 70} horizontal={horizontal} />
        : <HookText hook={p.hook} top={horizontal ? 70 : S.top + 30} horizontal={horizontal} />)}

      {paper && showCaps && (seg.mode === "board"
        ? <NativeCaptions chunks={boardChunks} onPaper horizontal={horizontal} y={horizontal ? height - 60 : height - S.bottom + 10} />
        : <NativeCaptions chunks={nativeChunks} horizontal={horizontal}
            y={horizontal ? height - 140 : seg.mode === "split" ? splitH + (height - splitH) * 0.45 : Math.round(height * 0.70)} />)}
      {paper && <Grain opacity={seg.mode === "face" ? 0.07 : 0.1} />}

      {!paper && showCaps && (seg.mode === "board"
        ? <Captions chunks={boardChunks} style="board" y={horizontal ? height - 60 : height - S.bottom + 10} horizontal={horizontal} />
        : <Captions chunks={faceChunks} style="face" horizontal={horizontal}
            y={horizontal ? height - 150 : seg.mode === "split" ? splitH + (height - splitH) * 0.42 : Math.round(height * 0.64)} />)}

      {cues.map((c, k) => (
        <Sequence key={k} from={c.f} durationInFrames={45} layout="none">
          <Audio src={staticFile(`talk/sfx/${c.file}`)} volume={c.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
