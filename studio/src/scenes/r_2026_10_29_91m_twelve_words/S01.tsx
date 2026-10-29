// Scene: 2026-10-29-91m-twelve-words S01 — HOOK. "One man lost $91 million in bitcoin, in a single transaction."
// Six hard cuts (~0.7 s each), everything moving on frame 0, orange on frame 0 (cover). Orange system = the money draining.
//  1 f0–20    3D  extreme low macro up a coin column, orange coins lifting off past the lens
//  2 f20–42   2D  wallet balance ticking down (783 BTC), BALANCE callout
//  3 f42–68   2D  the slam: giant chrome $91,000,000 + "783 BTC · 19 AUG 2025"
//  4 f68–90   3D  stream of orange coins pouring out of a phone into the dark
//  5 f90–114  2D  one transaction row, magnified, ONE TRANSACTION
//  6 f114–end 2D  balance 0.00000000 BTC, push-in, thud at zero
// Big text layer "$91M GONE." / "NOBODY HACKED HIM." over shots 1–2 only.
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Coin, Phone, glyphTexture, Callout, Disclaimer, chromeFill, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Sfx, W, ORANGE, clamp, rand, type Shot, type Vec3 } from "./_shared";

const outE = Easing.out(Easing.exp);
const outC = Easing.out(Easing.cubic);
const mono = "'DejaVu Sans Mono', monospace";

const CUT = [0, 20, 42, 68, 90, 114];

/* =============================================================== 3D shot 1: coin column =============================================================== */
const FLYERS = 6;
const CoinColumn: React.FC = () => {
  const f = useCurrentFrame();
  const STATIC = 10;
  const shot: Shot = { from: [1.9, 0.45, 4.6], to: [0.7, 3.1, 3.7], tFrom: [0, 1.7, 0], tTo: [0.2, 3.2, 0], fov: 38, len: 20 };
  const flyers = Array.from({ length: FLYERS }).map((_, j) => {
    const idx = STATIC + (FLYERS - 1 - j); // j=0 is the top coin
    const s = -11 + j * 3.4;
    const p = (f - s) / 17;
    const base: Vec3 = [Math.sin(idx * 7.3) * 0.03, 0.09 + idx * 0.2, Math.cos(idx * 3.1) * 0.03];
    if (p <= 0) return <Coin key={j} accent radius={0.75} position={base} rotation={[0, idx * 0.7, 0]} />;
    if (p >= 1) return null;
    const e = p * p * 0.55 + p * 0.45;
    const pos: Vec3 = [base[0] + 4.6 * e, base[1] + 1.6 * Math.sin(p * Math.PI * 0.8) + 0.5 * p, base[2] + 3.6 * e];
    return <Coin key={j} accent radius={0.75} position={pos} rotation={[p * 5.5 + j, idx * 0.7, p * 3.2 + j * 0.6]} />;
  });
  return (
    <>
      <CamRig shot={shot} />
      {Array.from({ length: STATIC }).map((_, i) => (
        <Coin key={i} radius={0.75} position={[Math.sin(i * 7.3) * 0.03, 0.09 + i * 0.2, Math.cos(i * 3.1) * 0.03]} rotation={[0, i * 0.7, 0]} />
      ))}
      {flyers}
      <pointLight position={[0.6, 2.7, 2.2]} color="#FF8000" intensity={5} distance={6} decay={2} />
    </>
  );
};

/* =============================================================== 2D phone: balance =============================================================== */
const fmtBal = (v: number, f: number, ticking: boolean) => {
  const whole = Math.max(0, Math.floor(v));
  const dec = ticking && v > 0.5 ? String(Math.floor(rand(f * 1.7 + 3) * 1e8)).padStart(8, "0") : "00000000";
  return `${whole}.${dec}`;
};
/** the wallet sparkline: flat, then a plunge. r = revealed fraction 0..1 */
const SPARK_W = 612, SPARK_H = 250;
const sparkY = (x: number) => {
  const t = Math.min(1, Math.max(0, (x - 0.5) / 0.4));
  const s = t * t * (3 - 2 * t);
  return 28 + (SPARK_H - 60) * s + Math.sin(x * 40) * 4 * (1 - s);
};
const Spark: React.FC<{ r: number; color: string; glow?: boolean }> = ({ r, color, glow }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = i / 80;
    if (x > r) break;
    pts.push(`${(x * SPARK_W).toFixed(1)},${sparkY(x).toFixed(1)}`);
  }
  const hx = r * SPARK_W, hy = sparkY(r);
  return (
    <svg width={SPARK_W} height={SPARK_H} style={{ display: "block", overflow: "visible" }}>
      <line x1={0} y1={SPARK_H - 30} x2={SPARK_W} y2={SPARK_H - 30} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round"
        style={glow ? { filter: "drop-shadow(0 0 10px rgba(255,128,0,0.8))" } : undefined} />
      <circle cx={hx} cy={hy} r={9} fill={color} style={glow ? { filter: "drop-shadow(0 0 12px rgba(255,128,0,1))" } : undefined} />
    </svg>
  );
};

const BalancePhone: React.FC<{ value: number; f: number; ticking: boolean; reveal: number; dim?: boolean; tilt?: number }> = ({ value, f, ticking, reveal, dim = false, tilt = 16 }) => {
  const numCol = dim ? "rgba(255,255,255,0.62)" : ORANGE;
  return (
    <div style={{ position: "absolute", left: 190, top: 395, width: 700, height: 1500, borderRadius: 78, background: "#0b0c0e", border: "3px solid #2a2c31",
      boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 0 0 10px #111215", transform: `perspective(1700px) rotateX(${tilt}deg) rotateZ(-3deg)`, transformOrigin: "50% 12%",
      fontFamily: brand.body, color: "#fff" }}>
      <div style={{ position: "absolute", left: 44, right: 44, top: 70 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: "linear-gradient(135deg,#3a3d44,#1b1c20)", border: "2px solid #3a3d44" }} />
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: 0.3 }}>Main wallet</div>
          <div style={{ marginLeft: "auto", fontSize: 24, color: "rgba(255,255,255,0.4)", letterSpacing: 3 }}>BITCOIN</div>
        </div>
        <div style={{ marginTop: 74, fontSize: 30, color: "rgba(255,255,255,0.45)", fontWeight: 500, letterSpacing: 1 }}>Balance</div>
        <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 16, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 68, color: numCol, letterSpacing: -2, fontVariantNumeric: "tabular-nums",
            textShadow: dim ? "none" : "0 0 30px rgba(255,128,0,0.45)" }}>{fmtBal(value, f, ticking)}</span>
          <span style={{ fontSize: 36, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>BTC</span>
        </div>
        <div style={{ marginTop: 64 }}>
          <Spark r={reveal} color={dim ? "rgba(255,255,255,0.45)" : ORANGE} glow={!dim} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ marginTop: 34, height: 74, borderRadius: 20, background: "rgba(255,255,255,0.045)", display: "flex", alignItems: "center", padding: "0 24px", gap: 20 }}>
            <div style={{ width: 38, height: 38, borderRadius: 19, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ width: 180 - i * 30, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)" }} />
            <div style={{ marginLeft: "auto", width: 90, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

/** 2D "camera": translate / scale / rotate the whole shot, never at rest. */
const Cam2D: React.FC<{ s: [number, number]; x?: [number, number]; y?: [number, number]; r?: [number, number]; len: number; origin?: string; children: React.ReactNode }> = ({
  s, x = [0, 0], y = [0, 0], r = [0, 0], len, origin = "50% 45%", children,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, len], [0, 1], clamp);
  const q = p * 0.7 + outC(p) * 0.3;
  const m = (a: [number, number]) => a[0] + (a[1] - a[0]) * q;
  return (
    <AbsoluteFill style={{ transform: `translate(${m(x)}px,${m(y)}px) scale(${m(s)}) rotate(${m(r)}deg)`, transformOrigin: origin }}>{children}</AbsoluteFill>
  );
};

/* =============================================================== shot 2: balance ticking down =============================================================== */
const ShotBalance: React.FC = () => {
  const f = useCurrentFrame();
  const p = Math.pow(Math.min(1, f / 21), 1.5) * 0.88;
  const v = 783 * (1 - p);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #17181c 0%, #0e0f11 70%)" }}>
      <Cam2D s={[1.04, 1.16]} x={[0, -26]} y={[0, -50]} r={[1.5, -1]} len={22} origin="50% 30%">
        <BalancePhone value={v} f={f} ticking={f > 0} reveal={0.52 + 0.46 * (p / 0.88)} />
        <Callout text="BALANCE" at={[770, 642]} label={[860, 520]} startFrame={3} size={26} />
      </Cam2D>
    </AbsoluteFill>
  );
};

/* =============================================================== shot 3: the slam =============================================================== */
const ShotSlam: React.FC<{ land: number }> = ({ land }) => {
  const f = useCurrentFrame();
  const t = outE(interpolate(f, [land, land + 5], [0, 1], clamp));
  const sc = 1.55 - 0.55 * t;
  const drift = interpolate(f, [0, 26], [0, 1], clamp);
  const sub = interpolate(f, [land + 5, land + 11], [0, 1], clamp);
  const chrome = chromeFill(true);
  return (
    <AbsoluteFill style={{ background: "#0e0f11" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(255,128,0,0.22) 0%, rgba(255,128,0,0.06) 38%, rgba(14,15,17,0) 70%)" }} />
      {/* travelling ground lines so the "camera" keeps moving */}
      <AbsoluteFill style={{ opacity: 0.10, backgroundImage: "repeating-linear-gradient(0deg, #fff 0 2px, transparent 2px 70px)", backgroundPosition: `0 ${f * 9}px`,
        WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 20%, transparent 70%)" }} />
      <Cam2D s={[1.0, 1.1]} x={[10, -26]} y={[0, -34]} r={[-2.2, 0.8]} len={26} origin="50% 46%">
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", transform: `scale(${sc})`, transformOrigin: "50% 50%", opacity: 0.35 + 0.65 * Math.min(1, t * 3) }}>
          <div style={{ fontFamily: brand.display, fontWeight: 900, fontSize: 330, lineHeight: 1, letterSpacing: -10, ...chrome, filter: "drop-shadow(0 0 50px rgba(255,128,0,0.35)) drop-shadow(0 14px 30px rgba(0,0,0,0.7))" }}>$91,</div>
          <div style={{ fontFamily: brand.display, fontWeight: 900, fontSize: 168, lineHeight: 1, letterSpacing: -4, marginTop: 8, ...chrome, filter: "drop-shadow(0 0 40px rgba(255,128,0,0.3)) drop-shadow(0 10px 24px rgba(0,0,0,0.7))" }}>000,000</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1085, textAlign: "center", fontFamily: brand.body, fontWeight: 500, fontSize: 34, letterSpacing: 6,
          color: "rgba(255,255,255,0.5)", opacity: sub, transform: `translateY(${(1 - sub) * 14}px)` }}>783 BTC · 19 AUG 2025</div>
      </Cam2D>
    </AbsoluteFill>
  );
};

/* =============================================================== 3D shot 4: stream out of a phone =============================================================== */
const STREAM_N = 18;
const streamPt = (p: number, k: number): Vec3 => {
  // quadratic bezier from the phone screen up and out to the right, into the dark
  const a: Vec3 = [-0.75, 1.55, 0.5], b: Vec3 = [0.15, 3.4, 0.9], c: Vec3 = [3.2, 3.6, -2.2];
  const u = 1 - p;
  const wob = Math.sin(k * 2.7) * 0.12;
  return [u * u * a[0] + 2 * u * p * b[0] + p * p * c[0], u * u * a[1] + 2 * u * p * b[1] + p * p * c[1] + wob, u * u * a[2] + 2 * u * p * b[2] + p * p * c[2]];
};
const PhoneStream: React.FC = () => {
  const f = useCurrentFrame();
  const shot: Shot = { from: [-0.9, 1.1, 7.0], to: [0.7, 2.1, 6.0], tFrom: [-0.45, 1.6, 0], tTo: [0.55, 2.5, 0], fov: 40, len: 22 };
  const screen = React.useMemo(() => glyphTexture("783.00 BTC", { font: "700 150px 'DejaVu Sans Mono', monospace", w: 1024, h: 512, fg: "#FF8000", bg: "#0b0c0e" }), []);
  const coins = Array.from({ length: STREAM_N }).map((_, k) => {
    const s = -12 + k * 1.15;
    const p = (f - s) / 17;
    if (p <= 0 || p >= 1) return null;
    return <Coin key={k} accent radius={0.2} position={streamPt(p, k)} rotation={[Math.PI / 2 + Math.sin(k) * 0.4, 0, p * 7 + k]} />;
  });
  return (
    <>
      <CamRig shot={shot} />
      <group position={[-0.95, 0.15, 0]} rotation={[0, 0.5, 0]}>
        <Phone position={[0, 1.55, 0]} rotation={[0, 0, 0]} scale={0.82} />
        <mesh position={[0, 1.55, 0.1]}>
          <planeGeometry args={[1.05, 0.52]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
      {coins}
      <pointLight position={[0.3, 2.8, 1.8]} color="#FF8000" intensity={7} distance={7} decay={2} />
    </>
  );
};

/* =============================================================== shot 5: one transaction =============================================================== */
const ShotTx: React.FC = () => {
  const f = useCurrentFrame();
  const t = outE(interpolate(f, [0, 5], [0, 1], clamp));
  const sc = 1.22 - 0.22 * t;
  const pulse = 0.75 + 0.25 * Math.sin(f / 2.6);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, #17181c 0%, #0e0f11 72%)" }}>
      <Cam2D s={[1.0, 1.13]} x={[-8, 22]} y={[10, -14]} r={[-1.2, 0.9]} len={24} origin="50% 48%">
        {/* ghost rows for context, blurred */}
        {[-1, 1].map((d) => [1, 2].map((n) => (
          <div key={`${d}${n}`} style={{ position: "absolute", left: 110, right: 110, top: 800 + d * (n * 190) - 70, height: 120, borderRadius: 30, background: "rgba(255,255,255,0.04)",
            border: "2px solid rgba(255,255,255,0.05)", filter: "blur(3px)", opacity: n === 1 ? 0.8 : 0.45, display: "flex", alignItems: "center", padding: "0 34px", gap: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: 26, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ width: 210, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.12)" }} />
            <div style={{ marginLeft: "auto", width: 130, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.09)" }} />
          </div>
        )))}
        <div style={{ position: "absolute", left: 90, width: 900, top: 650, height: 310, borderRadius: 44, background: "linear-gradient(160deg,#1b1c20,#111216)", transform: `scale(${sc})`,
          border: `3px solid ${ORANGE}`, boxShadow: `0 0 ${60 * pulse}px rgba(255,128,0,0.45), 0 0 140px rgba(255,128,0,0.18), 0 30px 80px rgba(0,0,0,0.6)`,
          fontFamily: brand.body, color: "#fff", padding: "40px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ width: 104, height: 104, borderRadius: 52, border: "3px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="52" height="52" viewBox="0 0 52 52"><path d="M14 38 L38 14 M18 14 H38 V34" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.05 }}>Sent</div>
              <div style={{ fontSize: 32, color: "rgba(255,255,255,0.5)", marginTop: 6, fontWeight: 400 }}>to bc1q…(unknown)</div>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: mono, fontWeight: 700, fontSize: 50, color: "#fff", letterSpacing: -2, whiteSpace: "nowrap" }}>−783.00 BTC</div>
          </div>
          <div style={{ marginTop: 34, height: 2, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: "rgba(255,255,255,0.7)", letterSpacing: 0.5 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: ORANGE, boxShadow: "0 0 14px rgba(255,128,0,0.9)" }} />
            1 confirmation
          </div>
        </div>
        <Callout text="ONE TRANSACTION" at={[930, 652]} label={[790, 520]} startFrame={5} size={28} />
      </Cam2D>
    </AbsoluteFill>
  );
};

/* =============================================================== shot 6: zero =============================================================== */
const ShotZero: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const v = 783 * (1 - p);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #17181c 0%, #0e0f11 70%)" }}>
      <Cam2D s={[1.12, 1.52]} x={[-22, -70]} y={[-60, -250]} r={[-1, 0.6]} len={22} origin="50% 30%">
        <BalancePhone value={v} f={f} ticking={f < 8} reveal={1} dim={f >= 8} tilt={14} />
      </Cam2D>
    </AbsoluteFill>
  );
};

/* =============================================================== big text layer =============================================================== */
const HookText: React.FC = () => {
  const f = useCurrentFrame();
  const t2 = outE(interpolate(f, [10, 14], [0, 1], clamp));
  const base: React.CSSProperties = { fontFamily: brand.body, fontWeight: 800, fontSize: 84, lineHeight: 1.04, letterSpacing: -1.5, whiteSpace: "nowrap", textShadow: "0 4px 24px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.6)" };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, height: 480, background: "linear-gradient(180deg, rgba(8,8,10,0) 0%, rgba(8,8,10,0.72) 55%, rgba(8,8,10,0.78) 100%)" }} />
      <div style={{ position: "absolute", left: 90, top: 1160 }}>
        <div style={{ ...base, color: "#fff" }}>$91M GONE.</div>
        <div style={{ ...base, color: ORANGE, opacity: t2, transform: `translateX(${(1 - t2) * -44}px)`, marginTop: 6 }}>NOBODY HACKED HIM.</div>
      </div>
    </AbsoluteFill>
  );
};

/* =============================================================== scene =============================================================== */
const Scene: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const total = props.durationInFrames ?? 136;
  const fMillion = W(props, "million", 0, 1.568);
  const land = Math.max(0, fMillion - CUT[2] - 5);
  const seq = (i: number) => ({ from: CUT[i], durationInFrames: (CUT[i + 1] ?? total) - CUT[i] });
  return (
    <Shell props={props} tone="dark">
      <Sequence {...seq(0)} layout="none">
        <Studio3D tone="dark" shadows={false} accentRim camera={{ from: [1.9, 0.45, 4.6], target: [0, 1.7, 0], fov: 38 }}><CoinColumn /></Studio3D>
      </Sequence>
      <Sequence {...seq(1)} layout="none"><ShotBalance /></Sequence>
      <Sequence {...seq(2)} layout="none"><ShotSlam land={land} /></Sequence>
      <Sequence {...seq(3)} layout="none">
        <Studio3D tone="dark" shadows={false} accentRim camera={{ from: [-0.9, 1.1, 7.0], target: [-0.45, 1.6, 0], fov: 40 }}><PhoneStream /></Studio3D>
      </Sequence>
      <Sequence {...seq(4)} layout="none"><ShotTx /></Sequence>
      <Sequence from={CUT[5]} durationInFrames={Math.max(1, total - CUT[5])} layout="none"><ShotZero /></Sequence>

      {frame < CUT[2] && <HookText />}
      <Disclaimer text="Illustration · amount per ZachXBT, Aug 2025" />

      <Sfx name="whoosh_soft" at={0} volume={0.3} />
      <Sfx name="whoosh_soft" at={CUT[1]} volume={0.3} />
      <Sfx name="tick" at={CUT[1] + 4} volume={0.22} />
      <Sfx name="sub_drop" at={CUT[2] + land + 2} volume={0.6} />
      <Sfx name="whoosh_soft" at={CUT[3]} volume={0.3} />
      <Sfx name="click" at={CUT[4] + 3} volume={0.4} />
      <Sfx name="thud" at={CUT[5] + 8} volume={0.4} />
    </Shell>
  );
};

export default Scene;
