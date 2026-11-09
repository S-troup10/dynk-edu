// Scene: 2026-11-09-bybit-every-signature-real S11 — "Hackers don't need your keys. They just need your signature."
// Shots: padlock orbit x2 (KEYS) -> hard cut -> orange Confirm macro -> press on "signature" with coins streaming away.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Padlock, ArcTravel, Callout, Disclaimer, type SceneProps } from "../../kit";
import { SignCard, CamRig, project, Sfx, W, SAW, clamp, ORANGE, type Shot, type Vec3 } from "./_shared";

const CARD_Y = 1.2;
const BTN: Vec3 = [0, CARD_Y - 0.4677, 0.05];

// padlock shots (grey chrome, intact), camera orbiting
const P1: Shot = { from: [-3.4, 1.7, 5.6], to: [-0.9, 1.5, 6.4], tFrom: [0, 1.0, 0], tTo: [0, 1.0, 0], fov: 32, len: 26 };
const P2: Shot = { from: [3.6, 1.2, 4.8], to: [1.4, 1.5, 6.0], tFrom: [0, 1.0, 0], tTo: [0, 1.05, 0], fov: 32, len: 26 };
// card macro on the Confirm button
const C1: Shot = { from: [-1.6, 1.15, 4.6], to: [-0.6, 0.95, 3.7], tFrom: [-0.3, 0.9, 0], tTo: [0, 0.78, 0], fov: 32, len: 28 };
const C2: Shot = { from: [0.9, 0.9, 3.6], to: [0.3, 0.85, 3.0], tFrom: [0, 0.78, 0], tTo: [0, 0.76, 0], fov: 32, len: 24 };

const Scene: React.FC<SceneProps> = (props) => {
  const tThey = W(props, "They", 0, 1.77);
  const tSig = W(props, "signature", 0, 2.6);
  const cutB = tThey - 3;      // hard cut to the Confirm macro just before "They"
  const cutC = tSig - 6;       // press shot starts a beat before "signature"
  const a2 = 25;
  return (
    <Shell props={props} tone="dark">
      {/* 1a padlock, orbit left */}
      <Sequence from={0} durationInFrames={a2} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: P1.from, to: P1.to, target: P1.tFrom }}>
          <CamRig shot={P1} />
          <Padlock position={[0, 0.9, 0]} />
        </Studio3D>
        <Callout text="KEYS" at={project(P1, 12, [0.6, 0.95, 0.31])} label={[780, 1200]} startFrame={3} />
      </Sequence>
      {/* 1b padlock, other side */}
      <Sequence from={a2} durationInFrames={cutB - a2} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: P2.from, to: P2.to, target: P2.tFrom }}>
          <CamRig shot={P2} />
          <Padlock position={[0, 0.9, 0]} />
        </Studio3D>
        <Callout text="KEYS" at={project(P2, 12, [-0.3, 1.5, 0.3])} label={[250, 1250]} startFrame={2} />
      </Sequence>
      {/* 2a orange Confirm macro approach */}
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none">
        <Studio3D tone="dark" shadows={false} accentRim camera={{ from: C1.from, to: C1.to, target: C1.tFrom }}>
          <CamRig shot={C1} />
          <SignCard lines={[{ text: "Confirm transaction", size: 58 }, { text: SAW[1], size: 44, color: "#9a9a9a" }, { text: SAW[2], size: 44, color: "#9a9a9a" }]}
            button="Confirm" glow position={[0, CARD_Y, 0]} />
        </Studio3D>
        <Callout text="SIGNATURE" at={project(C1, 10, [0.55, BTN[1], BTN[2]])} label={[760, 1230]} startFrame={4} accent />
      </Sequence>
      {/* 2b press + coins streaming away behind */}
      <Sequence from={cutC} durationInFrames={props.durationInFrames - cutC} layout="none">
        <PressShot />
        <Sfx name="click" at={tSig - cutC} volume={0.4} />
        <Callout text="SIGNATURE" at={project(C2, 10, [0.55, BTN[1], BTN[2]])} label={[760, 1230]} startFrame={0} accent />
      </Sequence>
      <Sfx name="whoosh_soft" at={cutB} volume={0.3} />
      <Sfx name="whoosh_soft" at={a2} volume={0.25} />
      <Sfx name="thud" at={tSig + 1} volume={0.5} />
      <Disclaimer text="Illustration" />
    </Shell>
  );
};

const PressShot: React.FC = () => {
  const f = useCurrentFrame();
  // props are passed via closure-free local timing: press lands 6 frames in
  const t = f - 6;
  const dip = interpolate(t, [0, 3, 9], [0, 1, 0], clamp);
  const ring = interpolate(t, [0, 14], [0, 1], clamp);
  const coinP = (i: number) => interpolate(f, [i * 3, i * 3 + 30], [0, 1], clamp);
  return (
    <Studio3D tone="dark" shadows={false} accentRim camera={{ from: C2.from, to: C2.to, target: C2.tFrom }}>
      <CamRig shot={C2} />
      <SignCard lines={[{ text: "Confirm transaction", size: 58 }, { text: SAW[1], size: 44, color: "#9a9a9a" }, { text: SAW[2], size: 44, color: "#9a9a9a" }]}
        button="Confirm" glow position={[0, CARD_Y, -0.07 * dip]} />
      {t >= 0 && (
        <mesh position={[BTN[0], BTN[1], 0.06]} scale={0.3 + ring * 1.6}>
          <ringGeometry args={[0.9, 1, 48]} />
          <meshBasicMaterial color={ORANGE} transparent opacity={(1 - ring) * 0.9} />
        </mesh>
      )}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ArcTravel key={i} from={[-1.2 + i * 0.35, 1.4 + (i % 2) * 0.3, -1.2]} to={[3.4, 2.2 + (i % 3) * 0.4, -6]} p={coinP(i)} height={1.2} trail={false} />
      ))}
    </Studio3D>
  );
};

export default Scene;
