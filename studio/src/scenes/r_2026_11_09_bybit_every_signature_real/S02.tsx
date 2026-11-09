// S02 "Nobody stole their keys. The exchange's own signers approved it." (116 f)
//  1a f0–26   3D  chrome padlock, camera orbiting low (Nobody stole)
//  1b f26–50  3D  macro on the intact lock + keyhole, callout KEYS: SAFE (their keys)
//  2a f50–70  2D  three signer slots, camera sliding (The exchange's)
//  2b f70–91  2D  closer slide across the slots (own signers)
//  3  f91–116 2D  pull back; APPROVED stamps 4 f apart, callout 3 OF 3 APPROVED (approved it)
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Padlock, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Sfx, W, ORANGE, clamp, project, type Shot } from "./_shared";

const outC = Easing.out(Easing.cubic);
const outE = Easing.out(Easing.exp);

/* ---------------- 3D shots ---------------- */
const LOCK_S = 1.25;
const LOCK_Y = 0.9;
const LockStage: React.FC<{ shot: Shot }> = ({ shot }) => (
  <>
    <CamRig shot={shot} />
    <group rotation={[0, -0.25, 0]}>
      <Padlock position={[0, LOCK_Y, 0]} scale={LOCK_S} />
    </group>
    {/* the one orange system: a thin glowing ring on the floor + rim light behind the lock */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
      <torusGeometry args={[1.5, 0.018, 12, 96]} />
      <meshStandardMaterial color="#FF8000" emissive="#FF8000" emissiveIntensity={3} />
    </mesh>
    <pointLight position={[0.4, 1.4, -1.6]} color="#FF8000" intensity={6} distance={6} decay={2} />
  </>
);

const SHOT_A: Shot = { from: [5.6, 1.3, 7.6], to: [1.6, 2.0, 8.6], tFrom: [0, 1.3, 0], tTo: [0, 1.4, 0], fov: 32, len: 26 };
const SHOT_B: Shot = { from: [-3.6, 1.1, 8.2], to: [2.6, 1.7, 7.9], tFrom: [0, 1.3, 0], tTo: [0, 1.35, 0], fov: 32, len: 24 };

const ShotA: React.FC = () => (
  <Studio3D tone="dark" shadows={false} camera={{ from: SHOT_A.from, target: [0, 1.3, 0], fov: 32 }}>
    <LockStage shot={SHOT_A} />
  </Studio3D>
);

const ShotB: React.FC<{ keysF: number }> = ({ keysF }) => {
  const f = useCurrentFrame();
  const [kx, ky] = project(SHOT_B, f, [0, LOCK_Y - 0.05 * LOCK_S, 0.31 * LOCK_S * 0.9]);
  // keep the callout label away from the caption band and on the open side of the frame
  const lx = 790, ly = 700;
  return (
    <>
      <Studio3D tone="dark" shadows={false} camera={{ from: SHOT_B.from, target: [0, 1.3, 0], fov: 32 }}>
        <LockStage shot={SHOT_B} />
      </Studio3D>
      <Callout text="KEYS: SAFE" at={[kx, ky]} label={[lx, ly]} startFrame={Math.max(0, keysF - 4)} accent />
    </>
  );
};

/* ---------------- 2D signer slots ---------------- */
const SLOT_W = 290, SLOT_H = 640, GAP = 25;
const ROW_X = (1080 - (3 * SLOT_W + 2 * GAP)) / 2;
const ROW_Y = 640;

const Avatar: React.FC = () => (
  <svg width={150} height={150} viewBox="0 0 150 150">
    <defs>
      <linearGradient id="av" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3d4048" /><stop offset="1" stopColor="#1b1c20" /></linearGradient>
    </defs>
    <circle cx={75} cy={75} r={72} fill="url(#av)" stroke="#43464e" strokeWidth={3} />
    <circle cx={75} cy={58} r={22} fill="#8b8e96" />
    <path d="M30 118 C34 90 56 84 75 84 C94 84 116 90 120 118 C108 132 92 138 75 138 C58 138 42 132 30 118Z" fill="#8b8e96" />
  </svg>
);
const Device: React.FC = () => (
  <div style={{ width: 96, height: 168, borderRadius: 18, background: "linear-gradient(180deg,#2a2c32,#16171b)", border: "2px solid #4a4d55", position: "relative",
    boxShadow: "0 14px 30px rgba(0,0,0,0.6)" }}>
    <div style={{ position: "absolute", left: 12, right: 12, top: 16, height: 62, borderRadius: 8, background: "#0a0b0d", border: "1px solid #34363c" }}>
      <div style={{ margin: "14px 10px 0", height: 5, borderRadius: 3, background: "#4a4d55" }} />
      <div style={{ margin: "8px 10px 0", height: 5, width: "60%", borderRadius: 3, background: "#34363c" }} />
    </div>
    <div style={{ position: "absolute", left: 18, bottom: 22, width: 24, height: 24, borderRadius: 12, background: "#3a3d44", border: "1px solid #55585f" }} />
    <div style={{ position: "absolute", right: 18, bottom: 22, width: 24, height: 24, borderRadius: 12, background: "#3a3d44", border: "1px solid #55585f" }} />
  </div>
);
const Check: React.FC<{ s: number }> = ({ s }) => (
  <svg width={46 * s} height={46 * s} viewBox="0 0 46 46" style={{ filter: "drop-shadow(0 0 10px rgba(255,128,0,0.9))" }}>
    <circle cx={23} cy={23} r={21} fill="none" stroke={ORANGE} strokeWidth={3.5} />
    <path d="M12 24 L20 32 L34 15" fill="none" stroke={ORANGE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Slot: React.FC<{ i: number; approvedAt: number | null; f: number; inAt: number }> = ({ i, approvedAt, f, inAt }) => {
  const a = approvedAt === null ? 0 : outE(interpolate(f, [approvedAt, approvedAt + 5], [0, 1], clamp));
  const enter = outC(interpolate(f, [inAt, inAt + 6], [0, 1], clamp));
  const x = ROW_X + i * (SLOT_W + GAP);
  return (
    <div style={{ position: "absolute", left: x, top: ROW_Y + (1 - enter) * 40, width: SLOT_W, height: SLOT_H, opacity: 0.35 + 0.65 * enter, borderRadius: 34,
      background: "linear-gradient(180deg,#1a1c20,#121316)", border: `${2 + a * 3}px solid ${a > 0.02 ? ORANGE : "#32353b"}`,
      boxShadow: a > 0.02 ? `0 0 ${50 * a}px rgba(255,128,0,${0.45 * a}), 0 30px 70px rgba(0,0,0,0.55)` : "0 30px 70px rgba(0,0,0,0.55)",
      fontFamily: brand.body, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ marginTop: 34, fontWeight: 700, fontSize: 24, letterSpacing: 3.2, color: "rgba(255,255,255,0.9)" }}>SIGNER {i + 1}</div>
      <div style={{ marginTop: 28 }}><Avatar /></div>
      <div style={{ marginTop: 34 }}><Device /></div>
      <div style={{ marginTop: "auto", marginBottom: 36, height: 54, display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 24, letterSpacing: 3 }}>
        {a > 0.02 ? (
          <>
            <div style={{ transform: `scale(${0.4 + 0.6 * a})`, display: "flex" }}><Check s={0.9} /></div>
            <span style={{ color: ORANGE, opacity: a }}>APPROVED</span>
          </>
        ) : (
          <span style={{ color: "rgba(255,255,255,0.32)" }}>WAITING</span>
        )}
      </div>
    </div>
  );
};

/** 2D camera: scale + translate about a focal point, linear-ish (never at rest). */
const Cam2D: React.FC<{ s0: number; s1: number; x0: number; x1: number; len: number; children: React.ReactNode }> = ({ s0, s1, x0, x1, len, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, len], [0, 1], clamp);
  const q = p * 0.7 + outC(p) * 0.3;
  const s = s0 + (s1 - s0) * q, x = x0 + (x1 - x0) * q;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px,0) scale(${s})`, transformOrigin: `540px ${ROW_Y + SLOT_H / 2}px` }}>{children}</AbsoluteFill>
  );
};

const Slots: React.FC<{ base: number; approve?: number[] }> = ({ base, approve }) => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Slot key={i} i={i} f={f} inAt={-4 + i * 2} approvedAt={approve ? approve[i] : null} />
      ))}
    </>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #17191d 0%, #0e0f11 70%)" }} />
);

const Scene: React.FC<SceneProps> = (props) => {
  const keysF = W(props, "keys");
  const cut2 = W(props, "The"); // 50
  const cut2b = W(props, "signers") - 9; // 70
  const cut3 = W(props, "approved"); // 91
  const end = props.durationInFrames;
  const AP = [0, 4, 8];
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={26} layout="none"><ShotA /></Sequence>
      <Sequence from={26} durationInFrames={cut2 - 26} layout="none"><ShotB keysF={keysF - 26} /></Sequence>

      <Sequence from={cut2} durationInFrames={cut2b - cut2} layout="none">
        <Backdrop />
        <Cam2D s0={1.0} s1={1.08} x0={50} x1={-20} len={cut2b - cut2}><Slots base={0} /></Cam2D>
      </Sequence>
      <Sequence from={cut2b} durationInFrames={cut3 - cut2b} layout="none">
        <Backdrop />
        <Cam2D s0={1.1} s1={1.2} x0={120} x1={30} len={cut3 - cut2b}><Slots base={0} /></Cam2D>
      </Sequence>
      <Sequence from={cut3} durationInFrames={end - cut3} layout="none">
        <Backdrop />
        <Cam2D s0={1.12} s1={1.0} x0={-30} x1={0} len={end - cut3}><Slots base={0} approve={AP} /></Cam2D>
        <Callout text="3 OF 3 APPROVED" at={[540, ROW_Y - 6]} label={[540, ROW_Y - 90]} startFrame={AP[2] + 2} accent />
      </Sequence>

      <Disclaimer text="Illustration · multisig signers (simplified)" />
      {[26, cut2 - 1, cut2b - 1, cut3 - 2].map((t, k) => <Sfx key={k} name="whoosh_soft" at={t} volume={0.3} />)}
      {AP.map((a, k) => <Sfx key={`t${k}`} name="tick" at={cut3 + a + 1} volume={0.25} />)}
    </Shell>
  );
};

export default Scene;
