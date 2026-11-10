// Scene: 2026-11-09-bybit-every-signature-real S07 (v2) — "That's why fake airdrop sites just ask you to sign.
// One signature can let them spend your tokens."
// All 3D, four hard cuts, one eased camera move each.
//  A f0–48    gift box on a plinth, camera circling; tag claim-airdrop.example; callout FREE AIRDROP?
//  B f48–91   lid lifts, a "Sign to claim" card rises out of the box
//  C f91–121  card flips to its real fine print (Permit / unknown spender / UNLIMITED), glowing
//  D f121–171 chain of tokens slides along the floor out of frame; callout PERMISSION TO SPEND
// Orange (ink) = ribbon in A/B, the Permit card in C, the card + tokens in D.
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, Mat, glyphTexture, type SceneProps } from "../../kit";
import { CamRig, GiftBox, SignCard, Token, Sfx, W, ORANGE, clamp, project, type Shot, type Vec3 } from "./_shared";

const eio = Easing.bezier(0.45, 0, 0.2, 1);
const eout = Easing.out(Easing.cubic);

const BOX_S = 1.7;
const PLINTH_H = 0.3;
const BOX_TOP = PLINTH_H + 0.8 * BOX_S;

/* ---------------- shared set pieces ---------------- */
const Plinth: React.FC = () => (
  <mesh position={[0, PLINTH_H / 2, 0]}>
    <cylinderGeometry args={[2.1, 2.25, PLINTH_H, 72]} />
    <Mat kind="graphite" />
  </mesh>
);
const OrangeRing: React.FC = () => (
  <mesh rotation-x={-Math.PI / 2} position={[0, PLINTH_H + 0.006, 0]}>
    <torusGeometry args={[1.95, 0.02, 12, 96]} />
    <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={1.3} toneMapped={false} />
  </mesh>
);
/** small grey gift tag with the fake URL, hanging on the front face of the box */
const Tag: React.FC = () => {
  const tex = useMemo(() => glyphTexture("claim-airdrop.example", { font: "600 104px Outfit, 'DejaVu Sans', sans-serif", w: 1024, h: 240, fg: "#a6a6a6", bg: "#17181b" }), []);
  return (
    <group position={[0, PLINTH_H + 0.8 * BOX_S * 0.5, 0.5 * BOX_S + 0.03]}>
      <mesh><planeGeometry args={[1.5, 0.35]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.3} roughness={0.5} /></mesh>
      <mesh position={[0, 0, -0.005]}><planeGeometry args={[1.54, 0.39]} /><meshStandardMaterial color="#2c2e33" /></mesh>
    </group>
  );
};
/** the gift box, front ribbon strip added (box itself is turned so the open lid hinges at the back) */
const Gift: React.FC<{ open: number }> = ({ open }) => (
  <group position={[0, PLINTH_H, 0]}>
    <GiftBox scale={BOX_S} open={open} />
    <mesh position={[0, 0.4 * BOX_S, 0.5 * BOX_S + 0.012]}>
      <boxGeometry args={[0.16 * BOX_S, 0.8 * BOX_S, 0.01]} />
      <meshStandardMaterial color={ORANGE} emissive="#FF6A00" emissiveIntensity={1.0} toneMapped={false} />
    </mesh>
  </group>
);
const Glow: React.FC<{ pos?: Vec3; i?: number }> = ({ pos = [0.6, 2.2, -2.2], i = 6 }) => (
  <pointLight position={pos} color="#FF8000" intensity={i} distance={9} decay={2} />
);

/* ---------------- cameras ---------------- */
const CAM_A: Shot = { from: [-5.2, 3.4, 10.4], to: [4.2, 3.0, 10.2], tFrom: [0, 1.7, 0], tTo: [0, 1.8, 0], fov: 32, len: 48 };
const CAM_B: Shot = { from: [3.4, 3.6, 12.2], to: [-0.6, 3.5, 11.0], tFrom: [0, 2.4, 0], tTo: [0, 2.7, 0], fov: 32, len: 43 };
const CAM_C: Shot = { from: [0.7, 2.0, 9.2], to: [0.1, 1.9, 8.2], tFrom: [0, 1.9, 0], tTo: [0, 1.9, 0], fov: 32, len: 30 };
const CAM_D: Shot = { from: [0.9, 1.4, 13.2], to: [0.2, 1.3, 12.2], tFrom: [0, 1.6, 0], tTo: [0, 1.6, 0], fov: 32, len: 50 };

/* ---------------- the card (front: "Sign to claim", back: the real permit) ---------------- */
const FRONT = [
  { text: "Sign to claim", size: 84, weight: 700 },
  { text: "Airdrop reward ready", size: 50, color: "#a6a6a6", weight: 500 },
];
const BACK = [
  { text: "Permit", size: 84, weight: 800, color: ORANGE },
  { text: "Spender: 0x9f…e2 (unknown)", size: 50, weight: 600 },
  { text: "Amount: UNLIMITED", size: 64, weight: 800, color: ORANGE },
  { text: "Expires: never", size: 46, weight: 500, color: "#a6a6a6" },
];
const TwoSided: React.FC<{ position: Vec3; rotY: number; scale: number }> = ({ position, rotY, scale }) => (
  <group position={position} rotation={[0, rotY, 0]} scale={scale}>
    <SignCard lines={FRONT} button="Sign" />
    <SignCard lines={BACK} glow rotation={[0, Math.PI, 0]} scale={0.996} />
  </group>
);

/* ---------------- shot A ---------------- */
const ShotA: React.FC = () => {
  const f = useCurrentFrame();
  const [ax, ay] = project(CAM_A, f, [0, BOX_TOP + 0.1, 0]);
  const lx = Math.min(850, Math.max(230, ax + 240));
  const ly = Math.max(560, ay - 170);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: CAM_A.from, target: CAM_A.tFrom, fov: CAM_A.fov }}>
        <CamRig shot={CAM_A} />
        <Plinth /><OrangeRing /><Gift open={0} /><Tag /><Glow />
      </Studio3D>
      <Callout text="FREE AIRDROP?" at={[ax, ay]} label={[lx, ly]} startFrame={14} />
    </AbsoluteFill>
  );
};

/* ---------------- shot B ---------------- */
const ShotB: React.FC = () => {
  const f = useCurrentFrame();
  const open = eio(interpolate(f, [2, 24], [0, 1], clamp));
  const rise = eout(interpolate(f, [12, 38], [0, 1], clamp));
  const y = BOX_TOP - 0.62 + rise * (3.15 - BOX_TOP + 0.62);
  return (
    <Studio3D tone="dark" shadows={false} camera={{ from: CAM_B.from, target: CAM_B.tFrom, fov: CAM_B.fov }}>
      <CamRig shot={CAM_B} />
      <Plinth /><OrangeRing /><Gift open={open} /><Tag />
      <TwoSided position={[0, y, 0.1]} rotY={0} scale={0.8} />
      <Glow pos={[0.6, 3.6, 1.6]} i={5} />
    </Studio3D>
  );
};

/* ---------------- shot C ---------------- */
const ShotC: React.FC = () => {
  const f = useCurrentFrame();
  const flip = eio(interpolate(f, [4, 22], [0, 1], clamp));
  return (
    <Studio3D tone="dark" shadows={false} camera={{ from: CAM_C.from, target: CAM_C.tFrom, fov: CAM_C.fov }}>
      <CamRig shot={CAM_C} />
      <TwoSided position={[0, 1.9, 0]} rotY={flip * Math.PI} scale={0.9} />
      <Glow pos={[0, 2.2, 3.0]} i={6} />
    </Studio3D>
  );
};

/* ---------------- shot D ---------------- */
const CARD_D: Vec3 = [0, 2.6, 0];
const ShotD: React.FC = () => {
  const f = useCurrentFrame();
  const [ax, ay] = project(CAM_D, f, [CARD_D[0] + 0.96, CARD_D[1] + 0.2, 0]);
  const toks = [0, 1, 2, 3, 4, 5, 6];
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: CAM_D.from, target: CAM_D.tFrom, fov: CAM_D.fov }}>
        <CamRig shot={CAM_D} />
        <TwoSided position={CARD_D} rotY={Math.PI} scale={0.8} />
        {toks.map((i) => {
          const x0 = 0.2 + i * 0.6;
          const x = x0 - (0.035 * f + 0.0014 * f * f);
          return <Token key={i} position={[x, 0.36, 0.6]} rotation={[0, -0.25 + x * 0.12, 0]} scale={1.6} />;
        })}
        <Glow pos={[0, 2.4, 2.6]} i={7} />
        <Glow pos={[1.5, 0.8, 2.0]} i={3} />
      </Studio3D>
      <Callout text="PERMISSION TO SPEND" at={[ax, ay]} label={[800, 540]} startFrame={10} accent />
    </AbsoluteFill>
  );
};

/* ---------------- scene ---------------- */
const Scene: React.FC<SceneProps> = (props) => {
  const B = 48, C = 91, D = 121;
  const total = props.durationInFrames ?? 171;
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={B} layout="none"><ShotA /></Sequence>
      <Sequence from={B} durationInFrames={C - B} layout="none"><ShotB /></Sequence>
      <Sequence from={C} durationInFrames={D - C} layout="none"><ShotC /></Sequence>
      <Sequence from={D} durationInFrames={total - D} layout="none"><ShotD /></Sequence>
      <Disclaimer text="Illustration · simplified" />
      <Sfx name="glint" at={W(props, "fake") - 4} volume={0.35} />
      <Sfx name="whoosh_soft" at={B + 4} volume={0.35} />
      <Sfx name="click" at={C + 5} volume={0.5} />
      <Sfx name="glint" at={C + 18} volume={0.4} />
      <Sfx name="whoosh_soft" at={D + 2} volume={0.4} />
    </Shell>
  );
};

export default Scene;
