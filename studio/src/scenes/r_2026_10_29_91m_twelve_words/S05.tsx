// Scene: 2026-10-29-91m-twelve-words S05 — "If everyone on Earth guessed a billion a second, trying them all would take
// about a hundred times the age of the universe."  Orange system = time.
// Shots (hard cuts): 1 crowd field, camera rising (3D) · 2a/2b hero figures with guess counters (3D) ·
// 3a age-of-the-universe bar draws, tight (2D) · 3b bar laps ×1 ×2 ×3 (2D) · 4a pull-back, bar duplicates into 100 (2D) ·
// 4b tilted run along the 100 bars filling orange (2D) · 4c wide, ×100 (2D).
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, Mat, chromeFill, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, project, W, Sfx, rand, ORANGE, clamp, type Shot, type Vec3 } from "./_shared";

const out = Easing.out(Easing.cubic);
const MONO = "'DejaVu Sans Mono', monospace";

/* =============================== 3D: the crowd =============================== */
type P = { x: number; z: number; s: number };
const makeCrowd = (cols: number, rows: number, pitch: number, z0: number, seed: number, skip?: (x: number, z: number) => boolean): P[] => {
  const list: P[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = seed + r * 131 + c * 7;
      const x = (c - cols / 2) * pitch + (rand(k) - 0.5) * pitch * 0.75;
      const z = z0 - r * pitch + (rand(k + 0.5) - 0.5) * pitch * 0.75;
      if (skip && skip(x, z)) continue;
      list.push({ x, z, s: 0.9 + rand(k + 0.25) * 0.22 });
    }
  }
  return list;
};

const Instances: React.FC<{ list: P[]; accent?: boolean }> = ({ list, accent = false }) => {
  const body = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!body.current || !head.current) return;
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    list.forEach((p, i) => {
      m.makeScale(p.s, p.s, p.s).setPosition(p.x, 0.38 * p.s, p.z);
      body.current!.setMatrixAt(i, m);
      m.makeScale(p.s, p.s, p.s).setPosition(p.x, 0.88 * p.s, p.z);
      head.current!.setMatrixAt(i, m);
      if (!accent) {
        col.setHSL(0, 0, 0.1 + 0.13 * rand(i * 3.1 + list.length));
        body.current!.setColorAt(i, col);
        head.current!.setColorAt(i, col);
      }
    });
    body.current!.instanceMatrix.needsUpdate = true;
    head.current!.instanceMatrix.needsUpdate = true;
    if (body.current!.instanceColor) body.current!.instanceColor.needsUpdate = true;
    if (head.current!.instanceColor) head.current!.instanceColor.needsUpdate = true;
  }, [list, accent]);
  if (!list.length) return null;
  return (
    <>
      <instancedMesh ref={body} args={[undefined, undefined, list.length]} frustumCulled={false}>
        <capsuleGeometry args={[0.17, 0.42, 3, 10]} />
        {accent ? <Mat kind="accent" /> : <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.15} />}
      </instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, list.length]} frustumCulled={false}>
        <sphereGeometry args={[0.14, 12, 8]} />
        {accent ? <Mat kind="accent" /> : <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.15} />}
      </instancedMesh>
    </>
  );
};

const Crowd: React.FC<{ people: P[]; orangeEvery?: number }> = ({ people, orangeEvery = 0 }) => {
  const grey = orangeEvery ? people.filter((_, i) => i % orangeEvery !== 0) : people;
  const org = orangeEvery ? people.filter((_, i) => i % orangeEvery === 0) : [];
  return (
    <>
      <Instances list={grey} />
      <Instances list={org} accent />
    </>
  );
};

const Figure: React.FC<{ position: Vec3; scale?: number }> = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.38, 0]}>
      <capsuleGeometry args={[0.17, 0.42, 6, 18]} />
      <meshStandardMaterial color="#cfcfcf" roughness={0.45} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.88, 0]}>
      <sphereGeometry args={[0.14, 28, 18]} />
      <meshStandardMaterial color="#e2e2e2" roughness={0.4} metalness={0.2} />
    </mesh>
  </group>
);

/* ---- shot data (global frames) ---- */
const CROWD_FIELD = makeCrowd(46, 78, 0.56, 6, 11);
const CROWD_BACK = makeCrowd(34, 44, 0.6, -2.2, 101, (x, z) => Math.abs(x) < 1.5 && z > -3);
const CROWD_SIDE = makeCrowd(34, 10, 0.6, 3.5, 301, (x) => Math.abs(x) < 2.3);

const HEROES: { pos: Vec3; base: number }[] = [
  { pos: [-0.8, 0, 0.2], base: 1_204_883_517 },
  { pos: [0.05, 0, -0.5], base: 7_730_126_044 },
  { pos: [0.8, 0, 0.25], base: 3_381_902_276 },
];
const HERO_SCALE = 1.35;
const GUESS_PER_FRAME = 1_000_000_000 / 30;

/* ======================== shot 1: the field of people ======================== */
const Shot1: React.FC<{ shot: Shot; earthAt: number }> = ({ shot, earthAt }) => {
  const f = useCurrentFrame();
  const at = project(shot, f, [0.9, 0.9, -3.2]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: [0, 1, 8], target: [0, 0.6, -26], fov: shot.fov }}>
        <CamRig shot={shot} />
        <Crowd people={CROWD_FIELD} orangeEvery={26} />
      </Studio3D>
      <Callout text="8 BILLION PEOPLE" at={at} label={[Math.min(Math.max(at[0] + 170, 430), 700), Math.max(at[1] + 330, 1260)]} startFrame={earthAt} />
    </AbsoluteFill>
  );
};

/* ======================== shots 2a / 2b: counters above heroes ======================== */
const Shot2: React.FC<{ shot: Shot; start: number; callAt?: number }> = ({ shot, start, callAt }) => {
  const f = useCurrentFrame();
  const g = f + start;
  const mid = project(shot, f, [HEROES[1].pos[0], 0.55 * HERO_SCALE, HEROES[1].pos[2]]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        {HEROES.map((h, i) => <Figure key={i} position={h.pos} scale={HERO_SCALE} />)}
        <Crowd people={CROWD_BACK} />
        <Crowd people={CROWD_SIDE} />
      </Studio3D>
      {HEROES.map((h, i) => {
        const [px, py] = project(shot, f, [h.pos[0], (0.88 + 0.5) * HERO_SCALE, h.pos[2]]);
        const val = Math.floor(h.base + Math.max(0, g - 30) * GUESS_PER_FRAME);
        const pop = interpolate(g, [33 + i, 38 + i], [0, 1], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: px, top: py, transform: `translate(-50%,-100%) scale(${0.7 + 0.3 * pop})`, opacity: pop, textAlign: "center" }}>
            <div style={{ fontFamily: brand.body, fontWeight: 600, fontSize: 15, letterSpacing: 3, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>GUESSES</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 25, color: ORANGE, whiteSpace: "nowrap", textShadow: "0 0 14px rgba(255,128,0,0.65)" }}>{val.toLocaleString("en-US")}</div>
          </div>
        );
      })}
      {callAt !== undefined && (
        <Callout text="1,000,000,000 GUESSES / SEC — EACH" at={mid} label={[540, 1345]} startFrame={callAt} />
      )}
    </AbsoluteFill>
  );
};

/* =============================== 2D helpers =============================== */
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
const BAR = { x: 100, w: 880, y: 960, h: 24 };

/** The age-of-the-universe bar: drawn to `p`, with an orange time-marker at `cursor` (0..1) trailing a short orange streak. */
const AgeBar: React.FC<{ p: number; cursor?: number; labels?: boolean; stickyX?: number; right?: boolean }> = ({ p, cursor, labels = true, stickyX = 0, right = true }) => {
  const cx = cursor === undefined ? undefined : BAR.x + BAR.w * cursor;
  return (
    <>
      <div style={{ position: "absolute", left: BAR.x, top: BAR.y - BAR.h / 2, width: BAR.w, height: BAR.h, borderRadius: 12, background: "rgba(255,255,255,0.07)" }} />
      <div style={{ position: "absolute", left: BAR.x, top: BAR.y - BAR.h / 2, width: Math.max(0, BAR.w * p), height: BAR.h, borderRadius: 12, overflow: "hidden",
        background: "linear-gradient(180deg,#f4f4f4 0%,#b4b4b4 55%,#8a8a8a 100%)", boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
        {cx !== undefined && (
          <div style={{ position: "absolute", left: cx - BAR.x - 260, top: 0, width: 260, height: BAR.h, background: "linear-gradient(90deg, rgba(255,128,0,0) 0%, rgba(255,128,0,0.95) 100%)" }} />
        )}
      </div>
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: BAR.x + (BAR.w / 13.8) * i - 1, top: BAR.y + 22, width: 2, height: i === 0 ? 16 : 9, background: "rgba(255,255,255,0.3)" }} />
      ))}
      {cx !== undefined && (
        <div style={{ position: "absolute", left: cx - 4, top: BAR.y - 38, width: 8, height: 76, borderRadius: 4, background: ORANGE,
          boxShadow: "0 0 26px 8px rgba(255,128,0,0.75), 0 0 80px 20px rgba(255,128,0,0.35)" }} />
      )}
      {labels && (
        <div style={{ position: "absolute", left: Math.max(BAR.x, stickyX), top: BAR.y - 70, fontFamily: brand.body, fontWeight: 700, fontSize: 26, letterSpacing: 3.2, color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap" }}>AGE OF THE UNIVERSE</div>
      )}
      {labels && right && p > 0.97 && (
        <div style={{ position: "absolute", left: BAR.x + BAR.w, top: BAR.y - 70, transform: "translateX(-100%)", fontFamily: brand.body, fontWeight: 700, fontSize: 26, letterSpacing: 3.2, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>13.8 BILLION YEARS</div>
      )}
    </>
  );
};

/* ======================== shot 3a: tight on the bar as it draws ======================== */
const Shot3a: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len - 2], [0, 1], clamp);
  const p = interpolate(f, [0, len - 3], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0.1, 0.5, 1) });
  const S = interpolate(t, [0, 1], [2.35, 1.7]);
  const fx = interpolate(t, [0, 1], [250, 690]);
  return (
    <AbsoluteFill>
      <Cam2D S={S} fx={fx} fy={BAR.y - 36 / S} rot={interpolate(t, [0, 1], [-1.5, 0.5])}>
        <AgeBar p={p} cursor={p < 1 ? p : 1} stickyX={fx - 420 / S} right={false} />
      </Cam2D>
    </AbsoluteFill>
  );
};

/* ======================== shot 3b: the marker laps the bar ×1 ×2 ×3 ======================== */
const Shot3b: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = f / len;
  const lapLen = 7.4;
  const lap = Math.min(3, Math.floor(f / lapLen) + 1);
  const fr = (f % lapLen) / lapLen;
  const lf = f - (lap - 1) * lapLen;
  const pop = interpolate(lf, [0, 4], [1.3, 1], { ...clamp, easing: out });
  return (
    <AbsoluteFill>
      <Cam2D S={interpolate(t, [0, 1], [1.0, 1.18])} fx={540} fy={BAR.y - 40} rot={interpolate(t, [0, 1], [-1.6, 1.2])}>
        <AgeBar p={1} cursor={fr} />
      </Cam2D>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", transform: `scale(${pop})`, fontFamily: brand.display, fontWeight: 800, fontSize: 150,
        letterSpacing: -4, lineHeight: 1, ...chromeFill(true), filter: "drop-shadow(0 0 28px rgba(255,128,0,0.35))" }}>{"×" + lap}</div>
    </AbsoluteFill>
  );
};

/* ======================== shots 4a/b/c: the 100 bars ======================== */
const G = { cols: 2, rows: 50, bw: 430, bh: 8, pitch: 14.8, top: 395, cxs: [315, 765] };
const barPos = (k: number) => ({ col: k % 2, row: Math.floor(k / 2), cx: G.cxs[k % 2], cy: G.top + Math.floor(k / 2) * G.pitch + G.bh / 2 });

const GridBars: React.FC<{ f: number; mode: "build" | "fill" | "all" }> = ({ f, mode }) => (
  <>
    {Array.from({ length: 100 }).map((_, k) => {
      const { cx, cy } = barPos(k);
      const spawn = mode === "build" ? (k === 0 ? 1 : interpolate(f, [2 + k * 0.2, 6 + k * 0.2], [0, 1], clamp)) : 1;
      if (spawn <= 0) return null;
      const q = mode === "build" ? 0 : mode === "all" ? 1 : interpolate(f, [k * 0.27, k * 0.27 + 4], [0, 1], clamp);
      const w = G.bw * spawn;
      return (
        <div key={k} style={{ position: "absolute", left: cx - G.bw / 2, top: cy - G.bh / 2, width: w, height: G.bh, borderRadius: 4, overflow: "hidden",
          background: q >= 1 ? ORANGE : mode === "build" ? "linear-gradient(180deg,#f4f4f4,#9a9a9a)" : "linear-gradient(180deg,#8d8d8d,#5d5d5d)" }}>
          {q > 0 && q < 1 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${q * 100}%`, background: ORANGE }} />}
        </div>
      );
    })}
  </>
);
const GridGlow: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <div style={{ position: "absolute", left: 40, top: G.top - 20, width: 1000, height: G.pitch * 49 + 60, borderRadius: 30,
    boxShadow: `0 0 90px 10px rgba(255,128,0,${0.35 * strength}), inset 0 0 60px rgba(255,128,0,${0.18 * strength})`, pointerEvents: "none" }} />
);

const TimesHundred: React.FC<{ f: number; at: number; y?: number }> = ({ f, at, y = 1255 }) => {
  const a = f - at;
  if (a < 0) return null;
  const pop = interpolate(a, [0, 5], [1.45, 1], { ...clamp, easing: out });
  const op = interpolate(a, [0, 3], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: op, transform: `scale(${pop})`, fontFamily: brand.display, fontWeight: 900, fontSize: 200,
      letterSpacing: -6, lineHeight: 1, ...chromeFill(true), filter: "drop-shadow(0 0 34px rgba(255,128,0,0.45))" }}>×100</div>
  );
};

const Shot4a: React.FC<{ len: number; hundredAt: number }> = ({ len, hundredAt }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len - 2], [0, 1], clamp);
  const e = t * 0.55 + out(t) * 0.45;
  const S = Math.exp(interpolate(e, [0, 1], [Math.log(880 / G.bw), 0]));
  const fx = interpolate(e, [0, 1], [G.cxs[0], 540]);
  const fy = interpolate(e, [0, 1], [barPos(0).cy, 960]);
  return (
    <AbsoluteFill>
      <Cam2D S={S} fx={fx} fy={fy} rot={interpolate(t, [0, 1], [-1.2, 0])}>
        <GridBars f={f} mode="build" />
      </Cam2D>
      <TimesHundred f={f} at={hundredAt} />
    </AbsoluteFill>
  );
};

const Shot4b: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len - 1], [0, 1], clamp);
  const q = t * 0.7 + out(t) * 0.3;
  const n = Math.min(100, Math.floor(f / 0.27));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 1000, perspectiveOrigin: "540px 900px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: "0 0",
          transform: `translate(540px,900px) rotateX(54deg) rotateZ(${interpolate(t, [0, 1], [-5, -1])}deg) scale(${interpolate(t, [0, 1], [2.0, 1.7])}) translate(${-(520 + 20 * t)}px,${-interpolate(q, [0, 1], [330, 1120])}px)` }}>
          <GridBars f={f} mode="fill" />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, height: 370, background: "linear-gradient(180deg, rgba(11,11,11,0) 0%, rgba(11,11,11,0.92) 40%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1262, textAlign: "center" }}>
        <div style={{ fontFamily: brand.body, fontWeight: 700, fontSize: 22, letterSpacing: 3.6, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>AGES OF THE UNIVERSE ELAPSED</div>
        <div style={{ fontFamily: brand.display, fontWeight: 800, fontSize: 110, letterSpacing: -2, lineHeight: 1, color: ORANGE, textShadow: "0 0 30px rgba(255,128,0,0.5)" }}>
          {n}<span style={{ fontSize: 44, color: "rgba(255,255,255,0.45)", letterSpacing: 0 }}> / 100</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Shot4c: React.FC<{ len: number; landAt: number }> = ({ len, landAt }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len], [0, 1], clamp);
  const S = interpolate(t, [0, 1], [1.16, 0.98]);
  const rot = interpolate(t, [0, 1], [1.0, -0.4]);
  const fx = 540, fy = 960 - interpolate(t, [0, 1], [30, 0]);
  const tgt = w2s(G.cxs[1] + 120, barPos(99).cy, S, fx, fy, rot);
  return (
    <AbsoluteFill>
      <Cam2D S={S} fx={fx} fy={fy} rot={rot}>
        <GridGlow />
        <GridBars f={f} mode="all" />
      </Cam2D>
      <Callout text="1 BAR = 13.8 BILLION YEARS" at={tgt} label={[540, 1210]} startFrame={6} />
      <TimesHundred f={f} at={0} y={1268} />
    </AbsoluteFill>
  );
};

/* =============================== scene =============================== */
const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 202;
  const fEarth = W(props, "Earth", 0, 0.914);
  const c2a = W(props, "guessed", 0, 1.108);
  const c2b = W(props, "billion", 0, 1.603);
  const c3a = W(props, "trying", 0, 2.529);
  const c3b = W(props, "would", 0, 3.166) + 3;
  const c4a = W(props, "about", 0, 3.719);
  const fHundred = W(props, "hundred", 0, 4.26);
  const c4b = W(props, "the", 2, 4.951) + 1; // "…times the age"
  const c4c = W(props, "universe", 0, 5.902);

  const shot1: Shot = { from: [0.7, 2.0, 7.2], to: [-0.5, 7.5, 3.5], tFrom: [0, -0.6, -9], tTo: [0, -1.0, -11], fov: 58, len: c2a };
  const shot2a: Shot = { from: [-3.2, 1.6, 8.0], to: [-1.8, 1.5, 6.9], tFrom: [0.3, 1.0, 0], tTo: [0.1, 1.0, 0], fov: 42, len: c2b - c2a };
  const shot2b: Shot = { from: [3.4, 2.6, 7.6], to: [1.8, 2.1, 6.6], tFrom: [-0.2, 1.0, 0], tTo: [0, 1.0, 0], fov: 42, len: c3a - c2b };

  const sfxTicks: number[] = [];
  for (let k = 37; k < c3a - 2; k += 4) if (k !== c2b) sfxTicks.push(k);

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c2a} layout="none"><Shot1 shot={shot1} earthAt={Math.max(fEarth - 6, 0)} /></Sequence>
      <Sequence from={c2a} durationInFrames={c2b - c2a} layout="none"><Shot2 shot={shot2a} start={c2a} /></Sequence>
      <Sequence from={c2b} durationInFrames={c3a - c2b} layout="none"><Shot2 shot={shot2b} start={c2b} callAt={0} /></Sequence>
      <Sequence from={c3a} durationInFrames={c3b - c3a} layout="none"><Shot3a len={c3b - c3a} /></Sequence>
      <Sequence from={c3b} durationInFrames={c4a - c3b} layout="none"><Shot3b len={c4a - c3b} /></Sequence>
      <Sequence from={c4a} durationInFrames={c4b - c4a} layout="none"><Shot4a len={c4b - c4a} hundredAt={fHundred - c4a} /></Sequence>
      <Sequence from={c4b} durationInFrames={c4c - c4b} layout="none"><Shot4b len={c4c - c4b} /></Sequence>
      <Sequence from={c4c} durationInFrames={total - c4c} layout="none"><Shot4c len={total - c4c} landAt={0} /></Sequence>

      {/* SFX: soft whoosh on most cuts, quiet tick loop under the counters, laps tick, thud on "hundred" */}
      {[c2a, c3a, c3b, c4a, c4b, c4c].map((f, i) => (f === fHundred ? null : <Sfx key={f} name="whoosh_soft" at={f} volume={i === 0 ? 0.25 : 0.3} />))}
      {sfxTicks.map((f) => <Sfx key={`t${f}`} name="tick" at={f} volume={0.11} />)}
      {[0, 1, 2].map((i) => <Sfx key={`lap${i}`} name="tick" at={c3b + 1 + Math.round(i * 7.4)} volume={0.25} />)}
      <Sfx name="thud" at={fHundred} volume={0.5} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Sfx key={`c${i}`} name="tick" at={c4b + 2 + i * 4} volume={0.18} />)}

      <Disclaimer text="Values rounded: 2¹²⁸ ÷ (8 billion × 10⁹/s) ≈ 1.35 trillion years" />
    </Shell>
  );
};

export default Scene;
