// Scene: 2026-11-09-bybit-every-signature-real S09 — "It's why you check what your wallet says, not what the website says."
// A f0–36   3D wide on the hardware-wallet slab, magnifier gliding in ("It's why you check")
// B f36–72  3D macro: magnifier over the orange screen line, callout YOUR WALLET ("what your wallet says,")
// C f72–112 3D pull-back reveals the big grey "Routine transfer" card behind; orange ink strikes it, callout WEBSITE
import React, { useMemo } from "react";
import { Sequence, useCurrentFrame, interpolate } from "remotion";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Mat, Callout, Disclaimer, type SceneProps } from "../../kit";
import { SignCard, InkStroke, Magnifier, CamRig, project, W, ORANGE, ease, clamp, type Shot, type Vec3 } from "./_shared";

const WALLET_LINES = [
  { text: "Confirm on device", size: 44, color: "#9a9a9a", weight: 500 },
  { text: "delegatecall", size: 70, mono: true, color: "#cfcfcf", weight: 700 },
  { text: "Change wallet logic", size: 74, color: ORANGE, weight: 800 },
];
const SITE_LINES = [
  { text: "Review request", size: 50, color: "#8a8a8a", weight: 500 },
  { text: "Routine transfer ✓", size: 100, color: "#c8c8c8", weight: 700 },
  { text: "Cold wallet → hot wallet", size: 46, color: "#8a8a8a", weight: 500 },
];
const SITE_LIT_LINES = SITE_LINES;

/** the magnified bit inside the lens: enlarged orange text on dark */
const lensTex = (() => { let t: THREE.CanvasTexture | null = null; return () => {
  if (t) return t;
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const x = c.getContext("2d")!;
  x.fillStyle = "#17120d"; x.fillRect(0, 0, 512, 512);
  x.fillStyle = ORANGE; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = "800 118px Outfit, 'DejaVu Sans', sans-serif";
  x.fillText("Change", 256, 195); x.fillText("wallet logic", 256, 320);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }; })();

const Device: React.FC<{ position: Vec3; scale?: number; lit: boolean; mag?: number }> = ({ position, scale = 1, lit, mag }) => {
  const f = useCurrentFrame();
  return (
    <group position={position} scale={scale} rotation={[-0.1, -0.12, 0]}>
      <RoundedBox args={[2.45, 1.75, 0.24]} radius={0.12} smoothness={3} position={[0, 0, -0.1]}><Mat kind="graphite" /></RoundedBox>
      <SignCard lines={WALLET_LINES.map((l) => (lit ? l : { ...l, color: l.color === ORANGE ? "#f2f2f2" : l.color }))} glow={lit} scale={0.9} position={[0, 0.02, 0.03]} />
      {mag !== undefined && (
        <group position={[1.7 - 2.1 * ease(interpolate(mag + f, [0, 74], [0, 1], clamp)), 0.12, 0.5]}>
          <Magnifier scale={1.05} />
          <mesh position={[0, 0, -0.03]}><circleGeometry args={[0.57, 48]} /><meshBasicMaterial map={lensTex()} toneMapped={false} /></mesh>
        </group>
      )}
    </group>
  );
};

const shotA: Shot = { from: [-2.2, 2.0, 9.4], to: [-0.6, 1.7, 8.4], tFrom: [0, 1.3, 0], tTo: [0.1, 1.3, 0], fov: 30, len: 36 };
const shotB: Shot = { from: [1.2, 1.6, 5.6], to: [-0.5, 1.45, 4.8], tFrom: [0, 1.4, 0], tTo: [-0.2, 1.4, 0], fov: 30, len: 36 };
const shotC: Shot = { from: [0.4, 1.7, 11.0], to: [0, 1.9, 14.2], tFrom: [0, 1.5, 0], tTo: [0, 1.95, -1], fov: 30, len: 47 };

const CARD_POS: Vec3 = [0, 2.75, -2.5];
const CARD_S = 1.6;
const STRIKE: Vec3[] = [[-1.05, 0.31, 0.075], [-0.4, 0.37, 0.075], [0.25, 0.34, 0.075], [0.7, 0.39, 0.075]];

const Scene: React.FC<SceneProps> = (props) => {
  const fWallet = W(props, "wallet", 0, 1.4);
  const fWebsite = W(props, "website", 0, 2.8);
  const total = props.durationInFrames ?? 112;
  const cutB = 36, cutC = 72;
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutB} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: shotA.from, target: shotA.tFrom, fov: shotA.fov }}>
          <CamRig shot={shotA} />
          <Device position={[0, 1.3, 0]} lit mag={0} />
        </Studio3D>
      </Sequence>
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none">
        <ShotB />
      </Sequence>
      <Sequence from={cutC} durationInFrames={total - cutC} layout="none">
        <ShotC strikeAt={fWebsite - cutC} />
      </Sequence>
      <Disclaimer text="Illustration" />
    </Shell>
  );
};

const ShotB: React.FC = () => {
  const f = useCurrentFrame();
  const at = project(shotB, f, [0.95, 2.0, 0.1]);
  return (
    <>
      <Studio3D tone="dark" shadows={false} camera={{ from: shotB.from, target: shotB.tFrom, fov: shotB.fov }}>
        <CamRig shot={shotB} />
        <Device position={[0, 1.3, 0]} lit mag={cutBOffset} />
      </Studio3D>
      <Callout text="YOUR WALLET" at={at} label={[at[0] - 20, at[1] - 230]} startFrame={5} accent />
    </>
  );
};
const cutBOffset = 36;

const ShotC: React.FC<{ strikeAt: number }> = ({ strikeAt }) => {
  const f = useCurrentFrame();
  const prog = interpolate(f, [strikeAt + 2, strikeAt + 15], [0, 1], { ...clamp, easing: ease });
  const atPt = project(shotC, f, [CARD_POS[0] + CARD_S * 0.1, CARD_POS[1] + CARD_S * 0.36, CARD_POS[2] + 0.1]);
  return (
    <>
      <Studio3D tone="dark" shadows={false} camera={{ from: shotC.from, target: shotC.tFrom, fov: shotC.fov }}>
        <CamRig shot={shotC} />
        <Device position={[0, 0.6, 0]} scale={0.7} lit={false} />
        <group position={CARD_POS} scale={CARD_S}>
          <SignCard lines={SITE_LIT_LINES} glow={false} />
          <InkStroke points={STRIKE} progress={prog} radius={0.032} />
        </group>
      </Studio3D>
      <Callout text="WEBSITE" at={atPt} label={[atPt[0] + 20, atPt[1] - 210]} startFrame={Math.max(strikeAt, 0)} accent />
    </>
  );
};

export default Scene;
