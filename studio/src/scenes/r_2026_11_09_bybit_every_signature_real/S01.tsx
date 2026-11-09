// Scene: 2026-11-09-bybit-every-signature-real S01 — HOOK. "The biggest crypto theft ever. $1.5 billion. And every signature was real."
// Six hard cuts, all moving on frame 0, orange on frame 0 (cover). Orange system = the money / the sign.
//  1 f0–18    3D  extreme low macro up a chrome coin column, orange coins lifting off past the lens
//  2 f18–36   2D  cold-wallet plate, 401,347.00 ETH ticking down in orange
//  3 f36–54   3D  orange coin river arcing out of a dark plinth into the void
//  4 f54–95   2D  the slam: chrome $1.5B + "401,347 ETH · 21 FEB 2025"
//  5 f95–135  3D  three SignCards, camera tracking along them, orange ✓ stamps land in turn
//  6 f135–end 3D  macro on the orange Confirm button being pressed, SIGNED ✓
// Big text layer "$1.5 BILLION." / "EVERY SIGNATURE REAL." over shots 1–2 (gone on cut 3).
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { Shell, Studio3D, Coin, Plinth, Mat, glyphTexture, Callout, Disclaimer, chromeFill, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, SignCard, Sfx, W, ORANGE, STORY, SAW, clamp, rand, project, type Shot, type Vec3 } from "./_shared";

const outE = Easing.out(Easing.exp);
const outC = Easing.out(Easing.cubic);
const mono = "'DejaVu Sans Mono', monospace";
const CUT = [0, 18, 36, 54, 95, 135];

/* =============================================================== shot 1: coin column =============================================================== */
const FLYERS = 6;
const CoinColumn: React.FC = () => {
  const f = useCurrentFrame();
  const STATIC = 10;
  const shot: Shot = { from: [1.7, 0.5, 5.4], to: [0.5, 2.6, 4.8], tFrom: [0, 1.9, 0], tTo: [0.3, 3.0, 0], fov: 38, len: 18 };
  const flyers = Array.from({ length: FLYERS }).map((_, j) => {
    const idx = STATIC + (FLYERS - 1 - j);
    const s = -12 + j * 3.4;
    const p = (f - s) / 18;
    const base: Vec3 = [Math.sin(idx * 7.3) * 0.03, 0.09 + idx * 0.2, Math.cos(idx * 3.1) * 0.03];
    if (p <= 0) return <Coin key={j} accent radius={0.75} position={base} rotation={[0, idx * 0.7, 0]} />;
    if (p >= 1) return null;
    const e = p * p * 0.55 + p * 0.45;
    const pos: Vec3 = [base[0] + 3.4 * e, base[1] + 1.4 * Math.sin(p * Math.PI * 0.8) + 0.9 * p, base[2] + 2.2 * e];
    return <Coin key={j} accent radius={0.75} position={pos} rotation={[p * 5.5 + j, idx * 0.7, p * 3.2 + j * 0.6]} />;
  });
  return (
    <>
      <CamRig shot={shot} />
      {Array.from({ length: STATIC }).map((_, i) => (
        <Coin key={i} radius={0.75} position={[Math.sin(i * 7.3) * 0.03, 0.09 + i * 0.2, Math.cos(i * 3.1) * 0.03]} rotation={[0, i * 0.7, 0]} />
      ))}
      {flyers}
      <pointLight position={[0.6, 2.9, 2.2]} color="#FF8000" intensity={5} distance={6} decay={2} />
    </>
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

/* =============================================================== shot 2: cold wallet balance =============================================================== */
const fmtEth = (v: number, f: number) => {
  const whole = Math.max(0, Math.floor(v));
  const dec = String(Math.floor(rand(f * 1.9 + 5) * 100)).padStart(2, "0");
  return `${whole.toLocaleString("en-US")}.${dec}`;
};
const ShotWallet: React.FC = () => {
  const f = useCurrentFrame();
  const p = Math.pow(Math.min(1, f / 17), 1.4) * 0.93;
  const v = 401347 * (1 - p);
  const t = outE(interpolate(f, [0, 5], [0, 1], clamp));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #17181c 0%, #0e0f11 70%)" }}>
      <AbsoluteFill style={{ opacity: 0.08, backgroundImage: "repeating-linear-gradient(90deg, #fff 0 2px, transparent 2px 90px)", backgroundPosition: `${f * 14}px 0`,
        WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, #000 15%, transparent 70%)" }} />
      <Cam2D s={[1.05, 1.18]} x={[18, -22]} y={[0, -40]} r={[-1.6, 1]} len={19} origin="50% 40%">
        <div style={{ position: "absolute", left: 100, width: 880, top: 470, height: 520, borderRadius: 48, background: "linear-gradient(160deg,#1d1e23,#111216)",
          border: "3px solid #34373d", boxShadow: "0 40px 110px rgba(0,0,0,0.7), 0 0 90px rgba(255,128,0,0.14)", transform: `translateX(${(1 - t) * 60}px)`, fontFamily: brand.body, color: "#fff", overflow: "hidden" }}>
          {/* vault wheel */}
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: "absolute", left: 50, top: 46 }}>
            <circle cx="75" cy="75" r="66" fill="none" stroke="#4a4d55" strokeWidth="6" />
            <circle cx="75" cy="75" r="22" fill="none" stroke="#4a4d55" strokeWidth="6" />
            {[0, 60, 120].map((a) => <line key={a} x1="75" y1="9" x2="75" y2="141" stroke="#4a4d55" strokeWidth="6" strokeLinecap="round" transform={`rotate(${a + f * 3} 75 75)`} />)}
          </svg>
          <div style={{ position: "absolute", left: 240, top: 70, fontSize: 40, fontWeight: 600, letterSpacing: 8, color: "rgba(255,255,255,0.5)" }}>COLD WALLET</div>
          <div style={{ position: "absolute", left: 240, top: 126, fontSize: 28, fontWeight: 500, letterSpacing: 3, color: "rgba(255,255,255,0.28)" }}>MULTISIG · ETH</div>
          <div style={{ position: "absolute", left: 50, top: 250, whiteSpace: "nowrap", display: "flex", alignItems: "baseline", gap: 18 }}>
            <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 96, letterSpacing: -3, color: ORANGE, fontVariantNumeric: "tabular-nums", textShadow: "0 0 36px rgba(255,128,0,0.5)" }}>{fmtEth(v, f)}</span>
            <span style={{ fontSize: 48, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>ETH</span>
          </div>
          <div style={{ position: "absolute", left: 50, right: 50, top: 420, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: `${(1 - p) * 100}%`, height: "100%", borderRadius: 9, background: ORANGE, boxShadow: "0 0 18px rgba(255,128,0,0.9)" }} />
          </div>
        </div>
        <Callout text="DRAINING" at={[880, 740]} label={[860, 410]} startFrame={3} size={26} accent />
      </Cam2D>
    </AbsoluteFill>
  );
};

/* =============================================================== shot 3: coin river =============================================================== */
const RIVER_N = 11;
const RFROM: Vec3 = [-2.0, 1.0, 0.4], RTO: Vec3 = [4.4, 3.6, -5.5];
const CoinRiver: React.FC = () => {
  const f = useCurrentFrame();
  const shot: Shot = { from: [-1.2, 1.6, 9.4], to: [1.8, 2.6, 7.4], tFrom: [0.4, 1.8, 0], tTo: [1.4, 2.6, -1.5], fov: 36, len: 18 };
  const coins = Array.from({ length: RIVER_N }).map((_, k) => {
    const p = (f + 8 - k * 2.2) / 22;
    if (p <= 0 || p >= 1) return null;
    const e = p * 0.85 + p * p * 0.15;
    // quadratic bezier by hand (cheap): control point above the midpoint
    const c: Vec3 = [(RFROM[0] + RTO[0]) / 2, 4.6, (RFROM[2] + RTO[2]) / 2];
    const u = 1 - e;
    const pos: Vec3 = [0, 1, 2].map((i) => u * u * RFROM[i] + 2 * u * e * c[i] + e * e * RTO[i]) as Vec3;
    pos[1] += Math.sin(k * 2.3) * 0.12;
    return <Coin key={k} accent radius={0.36} position={pos} rotation={[Math.PI / 2 + Math.sin(k) * 0.4, 0, e * 8 + k]} />;
  });
  return (
    <>
      <CamRig shot={shot} />
      <Plinth position={[-2.0, 0, 0.4]} radius={1.25} height={0.9} mat="graphite" />
      <mesh position={[-2.0, 0.92, 0.4]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.95, 64]} /><meshBasicMaterial color="#FF8000" /></mesh>
      {coins}
      <pointLight position={[-1.4, 2.2, 2.2]} color="#FF8000" intensity={6} distance={7} decay={2} />
    </>
  );
};

/* =============================================================== shot 4: the slam =============================================================== */
const ShotSlam: React.FC = () => {
  const f = useCurrentFrame();
  const t = outE(interpolate(f, [0, 5], [0, 1], clamp));
  const sc = 1.5 - 0.5 * t;
  const sub = interpolate(f, [6, 12], [0, 1], clamp);
  const chrome = chromeFill(true);
  const sweep = interpolate(f, [4, 26], [-30, 130], clamp);
  return (
    <AbsoluteFill style={{ background: "#0e0f11" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(255,128,0,0.24) 0%, rgba(255,128,0,0.07) 38%, rgba(14,15,17,0) 70%)" }} />
      <AbsoluteFill style={{ opacity: 0.10, backgroundImage: "repeating-linear-gradient(0deg, #fff 0 2px, transparent 2px 70px)", backgroundPosition: `0 ${f * 9}px`,
        WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 20%, transparent 70%)" }} />
      <Cam2D s={[1.0, 1.1]} x={[12, -24]} y={[0, -30]} r={[-2.2, 0.8]} len={41} origin="50% 46%">
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", transform: `scale(${sc})`, transformOrigin: "50% 50%", opacity: 0.4 + 0.6 * Math.min(1, t * 3) }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <span style={{ fontFamily: brand.display, fontWeight: 900, fontSize: 250, lineHeight: 1, letterSpacing: -8, ...chrome,
              filter: "drop-shadow(0 0 55px rgba(255,128,0,0.4)) drop-shadow(0 14px 30px rgba(0,0,0,0.7))" }}>{STORY.usdShort}</span>
            <span style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,0.5) ${sweep}%, transparent ${sweep + 12}%)`, mixBlendMode: "overlay" }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: brand.body, fontWeight: 500, fontSize: 36, letterSpacing: 6,
          color: "rgba(255,255,255,0.55)", opacity: sub, transform: `translateY(${(1 - sub) * 14}px)` }}>{STORY.eth} ETH · {STORY.date}</div>
      </Cam2D>
    </AbsoluteFill>
  );
};

/* =============================================================== shot 5: three sign cards + stamps =============================================================== */
const CARD_X = [-2.5, 0, 2.5];
const STAMP_AT = [5, 14, 24];
const CARD_LINES = [
  [{ text: "Confirm transaction", size: 54, weight: 700 }, { text: SAW[0], size: 50 }, { text: "To: 0x4a…c1 (internal)", size: 38, color: "#8a8a8a", mono: true }],
  [{ text: "Transfer", size: 60, weight: 700 }, { text: SAW[1], size: 46 }, { text: "Network fee: normal", size: 38, color: "#8a8a8a" }],
  [{ text: "Confirm transaction", size: 54, weight: 700 }, { text: SAW[2], size: 46 }, { text: "1 of 3 signatures", size: 38, color: "#8a8a8a" }],
];
const Stamp: React.FC<{ at: number; pos: Vec3 }> = ({ at, pos }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + 4], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const tex = React.useMemo(() => glyphTexture("✓", { font: "800 400px 'DejaVu Sans', sans-serif", fg: "#0b0b0b", bg: "#FF8000" }), []);
  if (t <= 0) return null;
  return (
    <group position={pos} scale={t * 1.0}>
      <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.26, 0.26, 0.05, 48]} /><Mat kind="accent" /></mesh>
      <mesh position={[0, 0, 0.03]}><circleGeometry args={[0.235, 48]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      <pointLight color="#FF8000" intensity={1.6} distance={2.2} decay={2} position={[0, 0, 0.5]} />
    </group>
  );
};
const CardRow: React.FC = () => {
  const shot: Shot = { from: [-2.2, 1.5, 9.6], to: [2.9, 1.5, 9.0], tFrom: [-2.2, 1.25, 0], tTo: [2.9, 1.25, 0], fov: 32, len: 40 };
  return (
    <>
      <CamRig shot={shot} />
      {CARD_X.map((x, i) => (
        <SignCard key={i} position={[x, 1.25, 0]} rotation={[0, -0.16 + i * 0.02, 0]} lines={CARD_LINES[i]} button={i === 2 ? "Confirm" : undefined} />
      ))}
      {CARD_X.map((x, i) => <Stamp key={i} at={STAMP_AT[i]} pos={[x + 0.82, 1.25 + 0.5, 0.1]} />)}
    </>
  );
};

/* =============================================================== shot 6: press the button =============================================================== */
const PRESS = 22;
const BTN: Vec3 = [0, 0.78, 0];
const BtnShot: Shot = { from: [0.5, 1.0, 7.3], to: [0.15, 0.95, 5.9], tFrom: [0, 0.95, 0], tTo: [0, 0.8, 0], fov: 32, len: 32 };
const ButtonPress: React.FC = () => {
  const f = useCurrentFrame();
  const dip = interpolate(f, [PRESS, PRESS + 3, PRESS + 9], [0, 1, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const tex = React.useMemo(() => glyphTexture("Confirm", { font: "700 190px Outfit, 'DejaVu Sans', sans-serif", fg: "#0b0b0b", bg: "#FF8000", w: 1024, h: 256 }), []);
  const ring = interpolate(f, [PRESS + 2, PRESS + 14], [0, 1], clamp);
  return (
    <>
      <CamRig shot={BtnShot} />
      <SignCard glow position={[0, 1.25, 0]} lines={[{ text: "Confirm transaction", size: 54, weight: 700 }, { text: SAW[0], size: 50 }, { text: SAW[1], size: 44, color: "#8a8a8a" }]} />
      <group position={[BTN[0], BTN[1], 0.04 + 0.075 - dip * 0.04]}>
        <RoundedBox args={[1.99, 0.23, 0.15]} radius={0.075} smoothness={3}><Mat kind="accent" /></RoundedBox>
        <mesh position={[0, 0, 0.076]}><planeGeometry args={[1.5, 0.375]} /><meshBasicMaterial map={tex} toneMapped={false} transparent /></mesh>
      </group>
      {ring > 0 && ring < 1 && (
        <mesh position={[0, BTN[1], 0.2]} scale={[1 + ring * 0.22, 1 + ring * 0.9, 1]}>
          <ringGeometry args={[0.96, 1.0, 64]} />
          <meshBasicMaterial color="#FF8000" transparent opacity={0.8 * (1 - ring)} toneMapped={false} />
        </mesh>
      )}
      <pointLight position={[0, 0.9, 1.6]} color="#FF8000" intensity={4 + dip * 3} distance={6} decay={2} />
    </>
  );
};
const SignedCallout: React.FC = () => {
  const f = useCurrentFrame();
  const [x, y] = project(BtnShot, f, [0.95, 0.9, 0.12]);
  return <Callout text="SIGNED ✓" at={[x, y]} label={[Math.min(900, x + 60), y - 200]} startFrame={PRESS + 3} size={28} accent />;
};

/* =============================================================== big text layer =============================================================== */
const HookText: React.FC = () => {
  const f = useCurrentFrame();
  const t1 = outE(interpolate(f, [0, 4], [0.3, 1], clamp));
  const t2 = outE(interpolate(f, [10, 14], [0, 1], clamp));
  const base: React.CSSProperties = { fontFamily: brand.body, fontWeight: 800, fontSize: 84, lineHeight: 1.04, letterSpacing: -1.5, whiteSpace: "nowrap", textShadow: "0 4px 24px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.6)" };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, height: 920, background: "linear-gradient(180deg, rgba(8,8,10,0) 0%, rgba(8,8,10,0.72) 22%, rgba(8,8,10,0.8) 100%)" }} />
      <div style={{ position: "absolute", left: 90, top: 1150 }}>
        <div style={{ ...base, color: "#fff", opacity: t1, transform: `translateX(${(1 - t1) * -30}px)` }}>$1.5 BILLION.</div>
        <div style={{ ...base, color: ORANGE, opacity: t2, transform: `translateX(${(1 - t2) * -44}px)`, marginTop: 6 }}>EVERY SIGNATURE REAL.</div>
      </div>
    </AbsoluteFill>
  );
};

/* =============================================================== scene =============================================================== */
const Scene: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const total = props.durationInFrames ?? 167;
  const seq = (i: number) => ({ from: CUT[i], durationInFrames: (CUT[i + 1] ?? total) - CUT[i] });
  const fReal = W(props, "real", 0, 5.265);
  return (
    <Shell props={props} tone="dark">
      <Sequence {...seq(0)} layout="none">
        <Studio3D tone="dark" shadows={false} accentRim camera={{ from: [1.7, 0.5, 5.4], target: [0, 1.9, 0], fov: 38 }}><CoinColumn /></Studio3D>
      </Sequence>
      <Sequence {...seq(1)} layout="none"><ShotWallet /></Sequence>
      <Sequence {...seq(2)} layout="none">
        <Studio3D tone="dark" shadows={false} accentRim camera={{ from: [-1.2, 1.6, 9.4], target: [0.4, 1.8, 0], fov: 36 }}><CoinRiver /></Studio3D>
      </Sequence>
      <Sequence {...seq(3)} layout="none"><ShotSlam /></Sequence>
      <Sequence {...seq(4)} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: [-2.2, 1.5, 9.6], target: [-2.2, 1.25, 0], fov: 32 }}><CardRow /></Studio3D>
      </Sequence>
      <Sequence from={CUT[5]} durationInFrames={Math.max(1, total - CUT[5])} layout="none">
        <Studio3D tone="dark" shadows={false} accentRim camera={{ from: [0.5, 1.0, 7.3], target: [0, 0.95, 0], fov: 32 }}>
          <ButtonPress />
        </Studio3D>
        <SignedCallout />
      </Sequence>

      {frame < CUT[2] && <HookText />}
      <Disclaimer text="Illustration · amount per FBI, 26 Feb 2025" />

      <Sfx name="whoosh_soft" at={0} volume={0.3} />
      <Sfx name="whoosh_soft" at={CUT[1]} volume={0.3} />
      <Sfx name="tick" at={CUT[1] + 4} volume={0.22} />
      <Sfx name="whoosh_soft" at={CUT[2]} volume={0.3} />
      <Sfx name="sub_drop" at={CUT[3] + 2} volume={0.6} />
      <Sfx name="whoosh_soft" at={CUT[4]} volume={0.25} />
      <Sfx name="click" at={CUT[4] + STAMP_AT[0] + 1} volume={0.35} />
      <Sfx name="click" at={CUT[5] + PRESS + 1} volume={0.3} />
      <Sfx name="thud" at={Math.max(CUT[5] + PRESS + 3, fReal)} volume={0.45} />
    </Shell>
  );
};

export default Scene;
