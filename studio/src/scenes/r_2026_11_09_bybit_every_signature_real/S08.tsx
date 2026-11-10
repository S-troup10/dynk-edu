// Scene: 2026-11-09-bybit-every-signature-real S08 — "In 2024, signature scams drained $494 million from 332,000 wallets."
// Proof beat. Orange = the signatures on the paper. Shots (hard cuts, all eased):
//  1 report plate (2D, Cam2D) · 2a first sheet lands, tower starts (3D, low) · 2b tower climbs + "$494M" in white with
//  an ink underline (3D + 2D overlay) · 3 camera rises/pulls back over a city of paper towers, 332,000 WALLETS counter.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { RoundedBox } from "@react-three/drei";
import { Shell, Studio3D, Disclaimer, Mat, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { W, Sfx, CamRig, Cam2D, InkPath2D, PaperStack, ORANGE, clamp, type Shot, type Vec3 } from "./_shared";

const TOWERS: { p: Vec3; n: number }[] = [
  { p: [0, 0, 0], n: 400 }, { p: [-2.6, 0, -1.2], n: 250 }, { p: [2.7, 0, -2.0], n: 330 }, { p: [-1.2, 0, -4.2], n: 180 },
  { p: [1.5, 0, -6.0], n: 300 }, { p: [-3.4, 0, -7.2], n: 220 }, { p: [3.6, 0, -9.0], n: 380 }, { p: [-0.4, 0, -10.5], n: 260 },
  { p: [-2.8, 0, -13], n: 340 },
];

const GROW0 = 52, GROW1 = 150; // global frames the main tower climbs
const growAt = (gf: number) => 0.7 * Math.pow(interpolate(gf, [GROW0, GROW1], [0, 1], clamp), 1.6); // capped so the top stays out of the caption band

const Plate: React.FC = () => {
  const f = useCurrentFrame();
  const ink = interpolate(f, [18, 52], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const lines = [0.92, 0.78, 0.86, 0.6];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1b1d21 0%, #0e0f11 70%)" }}>
      <Cam2D shot={{ from: { x: 46, y: 10, s: 1.0 }, to: { x: -46, y: -6, s: 1.1 }, len: 70 }}>
        <div style={{ position: "absolute", left: 120, top: 560, width: 840, height: 760, borderRadius: 28, background: "#d9d9d6",
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)", padding: "64px 64px", boxSizing: "border-box", fontFamily: brand.body }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 5, color: "#6b6b68" }}>SCAM SNIFFER</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.04, color: "#141518", marginTop: 26 }}>2024 Web3<br />phishing report</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: "#6b6b68", marginTop: 20 }}>Annual review · Jan 2025</div>
          <div style={{ marginTop: 40 }}>
            {lines.map((w, i) => <div key={i} style={{ height: 12, width: `${w * 100}%`, background: "#b9b9b5", borderRadius: 6, marginBottom: 18 }} />)}
          </div>
          <InkPath2D d="M20 120 C 60 40, 90 40, 100 100 S 140 170, 170 90 S 210 20, 230 100 C 240 140, 260 140, 280 90 C 300 50, 320 70, 330 110"
            progress={ink} width={8} viewBox="0 0 450 180" style={{ position: "absolute", right: 64, bottom: 36, width: 300 }} />
        </div>
      </Cam2D>
    </AbsoluteFill>
  );
};

/** First sheet drops and lands, then the tower takes over (tower's sheet 0 sits at the same spot). */
const FallingSheet: React.FC<{ f: number }> = ({ f }) => {
  const p = Math.min(1, f / 11);
  const y = 0.012 + (1 - p * p) * 2.6;
  if (f >= 13) return null;
  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, (1 - p) * 0.5]}>
      <mesh><boxGeometry args={[0.85, 1.1, 0.008]} /><meshStandardMaterial color="#d9d9d6" roughness={0.85} /></mesh>
      <mesh position={[0, -0.3, 0.006]}><planeGeometry args={[0.45, 0.03]} /><meshStandardMaterial color={ORANGE} emissive="#FF6A00" emissiveIntensity={1.4} toneMapped={false} /></mesh>
    </group>
  );
};

const Tower: React.FC<{ off: number; showFalling?: boolean }> = ({ off, showFalling }) => {
  const f = useCurrentFrame();
  return (
    <>
      {showFalling && <FallingSheet f={f} />}
      <PaperStack count={400} grow={f + off < 53 ? 0.0025 : Math.max(0.0025, growAt(f + off))} />
    </>
  );
};

const shotA: Shot = { from: [2.6, 0.3, 3.6], to: [2.1, 1.0, 4.4], tFrom: [0, 0.1, 0], tTo: [0, 0.6, 0], fov: 32, len: 52 };
const shotB: Shot = { from: [-3.4, 1.2, 6.0], to: [-2.8, 3.2, 7.6], tFrom: [0, 1.5, 0], tTo: [0, 2.0, 0], fov: 32, len: 74 };
const shotC: Shot = { from: [0.4, 1.0, 6.2], to: [0.2, 7.5, 13.5], tFrom: [0, 1.3, -3], tTo: [0, 1.4, -6], fov: 34, len: 86 };

const Scene: React.FC<SceneProps> = (props) => {
  const fSig = W(props, "signature", 0, 1.375);
  const fAmt = W(props, "$494", 0, 3.107);
  const fFrom = W(props, "from", 0, 5.566);
  const fWal = W(props, "332,000", 0, 5.876);
  const total = props.durationInFrames ?? 253;

  return (
    <Shell props={props} tone="dark">
      {/* 1 plate — starts mid-move */}
      <Sequence from={0} durationInFrames={fSig} layout="none">
        <Sequence from={-14} layout="none"><Plate /></Sequence>
      </Sequence>

      {/* 2a low: sheet lands, tower begins */}
      <Sequence from={fSig} durationInFrames={fAmt - fSig} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: shotA.from, target: shotA.tFrom, fov: shotA.fov }}>
          <CamRig shot={{ ...shotA, len: fAmt - fSig }} />
          <Tower off={fSig} showFalling />
        </Studio3D>
      </Sequence>

      {/* 2b tower climbs, $494M overlay */}
      <Sequence from={fAmt} durationInFrames={fFrom - fAmt} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: shotB.from, target: shotB.tFrom, fov: shotB.fov }}>
          <CamRig shot={{ ...shotB, len: fFrom - fAmt }} />
          <Tower off={fAmt} />
        </Studio3D>
        <Amount />
      </Sequence>

      {/* 3 city of towers */}
      <Sequence from={fFrom} durationInFrames={total - fFrom} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: shotC.from, target: shotC.tFrom, fov: shotC.fov }}>
          <CamRig shot={{ ...shotC, len: total - fFrom }} />
          {TOWERS.map((t, i) => <PaperStack key={i} position={t.p} count={t.n} grow={1} />)}
        </Studio3D>
        <Counter start={fWal - fFrom} end={total - fFrom - 22} />
      </Sequence>

      <Sfx name="thud" at={fSig + 10} volume={0.3} />
      <Sfx name="sub_drop" at={fAmt} volume={0.5} />
      <Sfx name="air_rise" at={fFrom} volume={0.25} />
      <Disclaimer text="Source: Scam Sniffer, 2024 report (Jan 2025)" />
    </Shell>
  );
};

const Amount: React.FC = () => {
  const f = useCurrentFrame();
  const inP = Easing.out(Easing.cubic)(interpolate(f, [0, 9], [0, 1], clamp));
  const ink = interpolate(f, [8, 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill>
      <Cam2D shot={{ from: { s: 1.0, y: 0 }, to: { s: 1.06, y: -8 }, len: 80 }}>
        <div style={{ position: "absolute", left: 0, width: 1080, top: 1090, textAlign: "center", opacity: inP, transform: `scale(${0.9 + 0.1 * inP})`,
          fontFamily: brand.body, fontWeight: 800, fontSize: 150, color: "#fff", letterSpacing: -3, textShadow: "0 6px 40px rgba(0,0,0,0.85)" }}>$494M</div>
        <InkPath2D d="M10 22 C 120 8, 260 30, 420 14 S 560 18 610 10" progress={ink} width={9} viewBox="0 0 620 40"
          style={{ position: "absolute", left: 230, top: 1272, width: 620 }} />
      </Cam2D>
    </AbsoluteFill>
  );
};

const Counter: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const f = useCurrentFrame();
  const p = Easing.out(Easing.cubic)(interpolate(f, [start, end], [0, 1], clamp));
  const v = Math.round((p * 332000) / 1000) * 1000 === 0 ? 0 : Math.round(p * 332);
  const ff = f - (f % 2); // refresh every 2 frames
  const p2 = Easing.out(Easing.cubic)(interpolate(ff, [start, end], [0, 1], clamp));
  const n = Math.round(p2 * 332000);
  const op = interpolate(f, [start - 2, start + 6], [0, 1], clamp);
  void v;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, width: 900, top: 1210, padding: "26px 0", borderRadius: 24, background: "rgba(11,11,11,0.82)",
        textAlign: "center", opacity: op, fontFamily: brand.body, color: "#fff" }}>
        <span style={{ fontWeight: 800, fontSize: 84, fontVariantNumeric: "tabular-nums", letterSpacing: 1 }}>{n.toLocaleString("en-US")}</span>
        <span style={{ fontWeight: 700, fontSize: 30, letterSpacing: 6, marginLeft: 22, color: "rgba(255,255,255,0.7)" }}>WALLETS</span>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
