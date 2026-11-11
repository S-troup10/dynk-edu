// S04 "Hackers had slipped code into the wallet's website. The screen showed one transaction. The signature said another."
// THE REVEAL: exploded view of three glass layers, then the friendly front sheet peels off the orange real card.
//  1 f0–46    3D exploded stack (real request / orange injected code / friendly site), 3/4 orbit  ("Hackers had slipped code")
//  2 f46–84   sheets slide together, camera comes round to the front; only the friendly front remains ("into the wallet's website.")
//  3 f84–138  front view, grey card, slow push; callout WHAT THEY SAW                            ("The screen showed one transaction.")
//  4 f138–182 front sheet (with the code layer) peels off on its left edge -> orange real card; WHAT THEY SIGNED ("The signature said another.")
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, Mat, type SceneProps } from "../../kit";
import { SignCard, CamRig, project, Sfx, W, SAW, SIGNED, ORANGE, clamp, type Shot, type Vec3 } from "./_shared";

const S = 1.25;          // sheet scale (cards are 2.4 × 1.5 units)
const Y0 = 2.0;          // stack centre height
const HALF_W = 1.2 * S;
const HALF_H = 0.75 * S;
const inOut = Easing.inOut(Easing.cubic);

/* ---------- orange code sheet: translucent glass with glowing mono code ---------- */
const CODE = [
  "// injected into the page bundle",
  "const tx = ui.pendingTx();",
  "if (tx.signer === 'cold') {",
  "  tx.to   = ATTACKER_CONTRACT;",
  "  tx.op   = 1;      // delegatecall",
  "  tx.data = PAYLOAD;",
  "}",
  "ui.render(FRIENDLY_VIEW);",
  "// hide the real values",
  "tx.show = 'Routine transfer';",
  "submit(tx);",
];
let codeTex: THREE.CanvasTexture | null = null;
const getCodeTex = () => {
  if (codeTex) return codeTex;
  const c = document.createElement("canvas"); c.width = 1200; c.height = 750;
  const x = c.getContext("2d")!;
  x.fillStyle = "rgba(20,9,0,0.62)"; x.fillRect(0, 0, 1200, 750);
  x.strokeStyle = ORANGE; x.lineWidth = 10; x.strokeRect(5, 5, 1190, 740);
  x.font = "600 44px 'DejaVu Sans Mono', monospace"; x.textBaseline = "middle"; x.textAlign = "left";
  CODE.forEach((l, i) => {
    x.fillStyle = l.startsWith("//") ? "#a85a14" : i === 3 || i === 4 ? "#FFB060" : ORANGE;
    x.fillText(l, 60, 70 + i * 60);
  });
  codeTex = new THREE.CanvasTexture(c); codeTex.colorSpace = THREE.SRGBColorSpace; codeTex.anisotropy = 8;
  return codeTex;
};
const CodeSheet: React.FC<{ position?: Vec3 }> = ({ position = [0, 0, 0] }) => {
  const tex = useMemo(getCodeTex, []);
  return (
    <group position={position}>
      <RoundedBox args={[2.4, 1.5, 0.05]} radius={0.05} smoothness={2}><Mat kind="graphite" opacity={0.28} /></RoundedBox>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[2.3, 1.4375]} />
        <meshStandardMaterial map={tex} transparent depthWrite={false} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
    </group>
  );
};

const FRONT_LINES = [
  { text: "Confirm transaction", size: 66, weight: 700 },
  { text: "Cold wallet → hot wallet", size: 50, color: "#bdbdbd" },
  { text: SAW[2], size: 50, color: "#e8e8e8" },
];
const REAL_LINES = [
  { text: "Actually signing", size: 56, weight: 700 },
  { text: SIGNED[0], size: 54, color: ORANGE, mono: true, weight: 700 },
  { text: SIGNED[1], size: 42, mono: true },
  { text: SIGNED[2], size: 42, mono: true },
];

/* ---------- the three layers; g = explode factor 0..1, bob = gentle float ---------- */
const GAP = 0.14;
const Stack: React.FC<{ g: number; frontOpacity?: number; f: number; peel?: number; showCode?: boolean; realGlow?: boolean }> = ({
  g, frontOpacity = 1, f, peel = 0, showCode = true, realGlow = false }) => {
  const bob = (ph: number) => Math.sin(f / 26 + ph) * 0.035 * g;
  const zF = GAP + 1.15 * g, zB = -(GAP + 1.15 * g);
  const yF = -0.85 * g + bob(2), yB = 0.85 * g + bob(0), yM = bob(1);
  const pe = inOut(peel);
  return (
    <group position={[0, Y0, 0]}>
      {/* back: the real request */}
      <group position={[0, yB, zB]} scale={S}>
        <SignCard lines={REAL_LINES} glow={realGlow} dim={!realGlow && g > 0 ? false : false} />
      </group>
      {/* middle + front: the fake layers; peel on the left edge */}
      <group position={[-HALF_W, 0, 0]} rotation={[0, 0, 0]}>
        {showCode && (
          <group position={[0, yM, 0]} scale={S}>
            <group position={[1.2, 0, 0]}><CodeSheet /></group>
          </group>
        )}
      </group>
      <group position={[-HALF_W, yF + 0.35 * pe, zF]} rotation={[0, -2.55 * pe, 0.12 * pe]} scale={S}>
        <SignCard position={[1.2, 0, 0]} lines={FRONT_LINES} button="Confirm" opacity={frontOpacity} />
      </group>
    </group>
  );
};

/* variant used in shot 4: the code layer rides on the same hinge as the front so the real card is revealed cleanly */
const PeelStack: React.FC<{ f: number; peel: number }> = ({ f, peel }) => {
  const pe = inOut(peel);
  return (
    <group position={[0, Y0, 0]}>
      <group position={[0, 0, -GAP]} scale={S}>
        <SignCard lines={REAL_LINES} glow />
      </group>
      <group position={[-HALF_W, 0.35 * pe, GAP]} rotation={[0, -2.55 * pe, 0.12 * pe]} scale={S}>
        <group position={[1.2, 0, -GAP / S]}><CodeSheet /></group>
        <SignCard position={[1.2, 0, 0]} lines={FRONT_LINES} button="Confirm" />
      </group>
    </group>
  );
};

const az = (a: number, R: number, h: number): Vec3 => [R * Math.sin((a * Math.PI) / 180), h, R * Math.cos((a * Math.PI) / 180)];

const SHOT1: Shot = { from: az(-50, 14.2, 4.6), to: az(-36, 13.6, 4.2), tFrom: [0, Y0 + 0.1, 0], tTo: [0, Y0, 0], fov: 30, len: 46 };
const SHOT2: Shot = { from: az(-36, 13.6, 4.2), to: az(0, 11.4, 2.7), tFrom: [0, Y0, 0], tTo: [0, Y0 - 0.1, 0], fov: 30, len: 38 };
const SHOT3: Shot = { from: az(0, 11.4, 2.7), to: az(4, 10.6, 2.5), tFrom: [0, Y0 - 0.1, 0], tTo: [0.05, Y0 - 0.12, 0], fov: 30, len: 54 };
const SHOT4: Shot = { from: az(4, 10.6, 2.5), to: az(-3, 10.0, 2.4), tFrom: [0.05, Y0 - 0.12, 0], tTo: [0, Y0 - 0.1, 0], fov: 30, len: 62 };

const Scene: React.FC<SceneProps> = (props) => {
  const fCode = W(props, "code", 0, 0.82);
  const fSaw = W(props, "screen", 0, 2.8);
  const fSig = W(props, "signature", 0, 4.77);
  const total = props.durationInFrames ?? 182;
  const c2 = 46, c3 = 84, c4 = 138;
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c2} layout="none"><Shot1 start={fCode} /></Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="none"><Shot2 /></Sequence>
      <Sequence from={c3} durationInFrames={c4 - c3} layout="none"><Shot3 start={fSaw - c3 + 2} /></Sequence>
      <Sequence from={c4} durationInFrames={total - c4} layout="none"><Shot4 peelAt={fSig - c4} /></Sequence>
      <Sfx name="whoosh_soft" at={fSig - 1} volume={0.5} />
      <Disclaimer text="Illustration · per NCC Group analysis, Mar 2025" />
    </Shell>
  );
};

/* 1: exploded view */
const Shot1: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const at = project(SHOT1, f, [HALF_W * 0.9, Y0 + 0.35, 0]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} accentRim camera={{ from: SHOT1.from, target: SHOT1.tFrom, fov: SHOT1.fov }}>
        <CamRig shot={SHOT1} />
        <Stack g={1} f={f} frontOpacity={0.72} />
      </Studio3D>
      <Callout text="INJECTED CODE" at={at} label={[Math.min(at[0] + 170, 800), at[1] - 330]} startFrame={Math.max(start - 2, 0)} accent />
    </AbsoluteFill>
  );
};

/* 2: sheets slide together while the camera comes round to the front */
const Shot2: React.FC = () => {
  const f = useCurrentFrame();
  const g = 1 - inOut(interpolate(f, [2, 30], [0, 1], clamp));
  const fo = 0.72 + 0.28 * (1 - g);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} accentRim camera={{ from: SHOT2.from, target: SHOT2.tFrom, fov: SHOT2.fov }}>
        <CamRig shot={SHOT2} />
        <Stack g={g} f={f + 46} frontOpacity={fo} />
      </Studio3D>
    </AbsoluteFill>
  );
};

/* 3: only the friendly front is visible */
const Shot3: React.FC<{ start: number }> = ({ start }) => {
  const f = useCurrentFrame();
  const at = project(SHOT3, f, [-HALF_W * 0.2, Y0 - HALF_H + 0.35, 0.2]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: SHOT3.from, target: SHOT3.tFrom, fov: SHOT3.fov }}>
        <CamRig shot={SHOT3} />
        <Stack g={0} f={f + 84} showCode={false} />
      </Studio3D>
      <Callout text="WHAT THEY SAW" at={at} label={[540, at[1] + 190]} startFrame={Math.max(start, 0)} />
    </AbsoluteFill>
  );
};

/* 4: peel -> orange real card */
const Shot4: React.FC<{ peelAt: number }> = ({ peelAt }) => {
  const f = useCurrentFrame();
  const peel = interpolate(f, [peelAt, peelAt + 26], [0, 1], clamp);
  const at = project(SHOT4, f, [0.2, Y0 - HALF_H + 0.4, 0]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} accentRim camera={{ from: SHOT4.from, target: SHOT4.tFrom, fov: SHOT4.fov }}>
        <CamRig shot={SHOT4} />
        <PeelStack f={f} peel={peel} />
      </Studio3D>
      <Callout text="WHAT THEY SIGNED" at={at} label={[540, at[1] + 190]} startFrame={peelAt + 14} accent />
    </AbsoluteFill>
  );
};

export default Scene;
