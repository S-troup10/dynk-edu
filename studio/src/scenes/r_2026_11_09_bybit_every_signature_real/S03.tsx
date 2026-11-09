// S03 "Because on their screens, it looked like a routine transfer." — what the signers SAW (grey card, no glow).
import React from "react";
import { Sequence } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { SignCard, CamRig, project, Sfx, W, SAW, type Shot } from "./_shared";

const LINES = [
  { text: "Confirm transaction", size: 56, weight: 700 },
  { text: SAW[0], size: 46, color: "#cfcfcf" },
  { text: SAW[1], size: 40, color: "#a8a8a8" },
  { text: SAW[2], size: 44, weight: 700 },
];
const ROW: [number, number, number] = [-0.55, 1.157, 0.05];

// A: high angle, pushing in fast
const A: Shot = { from: [1.6, 4.6, 9.2], to: [0.5, 2.4, 6.6], tFrom: [0, 1.2, 0], tTo: [0, 1.25, 0], fov: 32, len: 28 };
// B: low angle sliding across the face
const B: Shot = { from: [-2.8, 0.9, 8.0], to: [-1.2, 1.1, 6.6], tFrom: [0, 1.2, 0], tTo: [-0.3, 1.25, 0], fov: 32, len: 32 };
// C: macro on the "Routine internal transfer" row
const C: Shot = { from: [0.5, 1.5, 5.3], to: [-0.1, 1.35, 4.4], tFrom: [-0.3, 1.3, 0], tTo: [-0.45, 1.26, 0], fov: 32, len: 37 };

const Card: React.FC = () => (
  <SignCard lines={LINES} button="Confirm" position={[0, 1.2, 0]} />
);

const Scene: React.FC<SceneProps> = (props) => {
  const bAt = 28, cAt = 60;
  const routine = W(props, "routine", 0, 2.33);
  const [px, py] = project(C, routine - cAt + 6, ROW);
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={bAt} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: A.from, target: A.tFrom, fov: A.fov }}>
          <CamRig shot={A} />
          <Card />
        </Studio3D>
      </Sequence>
      <Sequence from={bAt} durationInFrames={cAt - bAt} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: B.from, target: B.tFrom, fov: B.fov }}>
          <CamRig shot={B} />
          <Card />
        </Studio3D>
      </Sequence>
      <Sequence from={cAt} durationInFrames={props.durationInFrames - cAt} layout="none">
        <Studio3D tone="dark" shadows={false} camera={{ from: C.from, target: C.tFrom, fov: C.fov }}>
          <CamRig shot={C} />
          <Card />
        </Studio3D>
        <Callout text="LOOKS NORMAL" at={[px, py + 20]} label={[Math.min(px + 260, 800), py + 260]} startFrame={routine - cAt + 4} accent size={28} />
      </Sequence>
      <Sfx name="whoosh_soft" at={bAt} volume={0.3} />
      <Sfx name="whoosh_soft" at={cAt} volume={0.3} />
      <Sfx name="tick" at={routine + 4} volume={0.25} />
      <Disclaimer text="Illustration · what the signing screen showed (simplified)" />
    </Shell>
  );
};

export default Scene;
