// Scene: 2026-11-09-bybit-every-signature-real S02 — "Nobody stole their keys. The exchange's own signers approved it."
// v2 (ink & signatures). Shots: 1 three untouched chrome keys on wires (orbit) -> 2 three pens over three flat cards
// (camera rising) -> 3 the pens sign in sequence, 6 frames apart.
import React from "react";
import * as THREE from "three";
import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { SignCard, Pen, InkStroke, KeyObj, CamRig, project, Sfx, W, sigOnCard, clamp, type Shot, type Vec3 } from "./_shared";

/* ---------- shot 1: keys ---------- */
const KEY_X = [-1.0, 0, 1.0];
const KEY_Y = 2.0;
const K1: Shot = { from: [-3.3, 2.15, 9.3], to: [3.3, 2.15, 9.3], tFrom: [0, 1.8, 0], tTo: [0, 1.8, 0], fov: 30, len: 52 };

/* ---------- shots 2/3: cards on the floor, pens above ---------- */
const CARD_S = 0.72;
const CARD_Z = [-1.4, 0, 1.4];
const INK_Y = 0.075;
const CARD_LINES = (n: number) => [
  { text: `Signer ${n} of 3`, size: 58 },
  { text: "Approve transaction", size: 46, color: "#9a9a9a" },
  { text: " ", size: 100 },
  { text: "x ____________________", size: 48, color: "#6c6c6c" },
];
// signature ON the card's "x ____" line (measured), card i lies flat: local x->world x, local y->world -z, local z->world +y
// (measured lazily, after fonts load — not at module load)
let _sigLocal: Vec3[] | null = null;
const sigLocal = () => (_sigLocal ??= sigOnCard(CARD_LINES(1)));
const sigPts = (i: number): Vec3[] => sigLocal().map(([lx, ly, lz]) => [CARD_S * lx, 0.04 + CARD_S * lz + 0.015, CARD_Z[i] - CARD_S * ly] as Vec3);
let _curves: THREE.CatmullRomCurve3[] | null = null;
const curves = () => (_curves ??= [0, 1, 2].map((i) => new THREE.CatmullRomCurve3(sigPts(i).map((p) => new THREE.Vector3(...p)))));
const START = [1, 7, 13];  // frames (shot 3 local): 6 apart
const DUR = 11;
const sigP = (i: number, f: number) => interpolate(f, [START[i], START[i] + DUR], [0, 1], clamp);
const HOVER = 0.4;

const S2: Shot = { from: [0.8, 7.0, 10.2], to: [0.2, 11.5, 6.8], tFrom: [0, 0, 0.2], tTo: [0, 0, 0.1], fov: 30, len: 38 };
const S3: Shot = { from: [1.8, 9.5, 7.8], to: [0.4, 11.3, 6.6], tFrom: [0, 0, 0.1], tTo: [0, 0, 0.1], fov: 30, len: 28 };

const Cards: React.FC = () => (
  <>
    {CARD_Z.map((z, i) => (
      <SignCard key={i} lines={CARD_LINES(i + 1)} position={[0, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]} scale={CARD_S} />
    ))}
  </>
);

const PenRow: React.FC<{ f: number; signing: boolean }> = ({ f, signing }) => (
  <>
    {[0, 1, 2].map((i) => {
      let pos: Vec3 = [sigPts(i)[0][0], INK_Y + HOVER, sigPts(i)[0][2]];
      if (signing) {
        const p = sigP(i, f);
        const drop = interpolate(f, [START[i] - 1, START[i] + 1], [HOVER, 0.0], clamp);
        const rise = interpolate(f, [START[i] + DUR, START[i] + DUR + 6], [0, HOVER * 0.6], clamp);
        const h = curves()[i].getPointAt(Math.min(1, Math.max(0, p)));
        pos = [h.x, INK_Y + drop + rise, h.z];
      }
      return <Pen key={i} position={pos} rotation={[0.1, 0, 0.5]} scale={0.55} />;
    })}
  </>
);

const KeysShot: React.FC = () => {
  const f = useCurrentFrame();
  const sway = (i: number) => Math.sin(f / 18 + i * 1.7) * 0.015;
  return (
    <>
      <Studio3D tone="dark" shadows={false} camera={{ from: K1.from, to: K1.to, target: K1.tFrom }}>
        <CamRig shot={K1} />
        {KEY_X.map((x, i) => (
          <group key={i}>
            <mesh position={[x, KEY_Y + 3.3, 0]}><cylinderGeometry args={[0.012, 0.012, 6, 8]} /><meshStandardMaterial color="#8a8d93" metalness={0.8} roughness={0.35} /></mesh>
            <KeyObj position={[x, KEY_Y + 0.8, 0]} rotation={[0, sway(i) * 4 + (i - 1) * 0.25, -Math.PI / 2]} scale={1.1} />
          </group>
        ))}
      </Studio3D>
      <Callout text="KEYS: UNTOUCHED" at={project(K1, f, [0.36, KEY_Y + 0.8, 0.0])} label={[760, 470]} startFrame={14} accent />
    </>
  );
};

const PensIdle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Studio3D tone="dark" shadows={false} camera={{ from: S2.from, to: S2.to, target: S2.tFrom }}>
      <CamRig shot={S2} />
      <Cards />
      <PenRow f={f} signing={false} />
    </Studio3D>
  );
};

const PensSign: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Studio3D tone="dark" shadows={false} camera={{ from: S3.from, to: S3.to, target: S3.tFrom }}>
        <CamRig shot={S3} />
        <Cards />
        {[0, 1, 2].map((i) => <InkStroke key={i} points={sigPts(i)} progress={sigP(i, f)} radius={0.013} />)}
        <PenRow f={f} signing />
      </Studio3D>
      <Callout text="3 OF 3 SIGNED" at={project(S3, f, [sigPts(0)[15][0], INK_Y, sigPts(0)[15][2]])} label={[760, 470]} startFrame={15} accent />
    </>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const tThe = W(props, "The", 0, 1.67);
  const tApproved = W(props, "approved", 0, 3.02);
  const cutA = tThe;                 // 50
  const cutB = tApproved - 3;        // 88
  const total = props.durationInFrames;
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutA} layout="none"><KeysShot /></Sequence>
      <Sequence from={cutA} durationInFrames={cutB - cutA} layout="none"><PensIdle /></Sequence>
      <Sequence from={cutB} durationInFrames={total - cutB} layout="none"><PensSign /></Sequence>
      <Sfx name="glint" at={10} volume={0.25} />
      <Sfx name="whoosh_soft" at={cutA} volume={0.25} />
      {START.map((s, i) => <Sfx key={i} name="click" at={cutB + s} volume={0.3} />)}
      <Sfx name="thud" at={cutB + START[2] + DUR} volume={0.35} />
      <Disclaimer text="Illustration · multisig signers (simplified)" />
    </Shell>
  );
};
export default Scene;
