// S03 "Because on their screens, it looked like a routine transfer." (97 f)
//  1 f0–CUT   3D  one SignCard floating at eye level, soft reflection below, camera arcing round it (Because on their screens)
//  2 CUT–97   2D  macro "Routine internal transfer" + grey check, Cam2D slide, callout LOOKS NORMAL (routine transfer)
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Cam2D, SignCard, W, SAW, clamp, type Shot } from "./_shared";

const outC = Easing.out(Easing.cubic);
const CARD_Y = 1.15;
const SHOT_A_BASE = { tFrom: [0, CARD_Y, 0], tTo: [0, CARD_Y, 0], fov: 30 } as const;

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 16) * 0.025;
  const lines = [
    { text: "Confirm transaction", size: 62, weight: 700 },
    { text: SAW[0], size: 54 },
    { text: SAW[1], size: 54, color: "#b8b8b8" },
  ];
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <SignCard lines={lines} button="Confirm" position={[0, CARD_Y + bob, 0]} />
        {/* soft reflection: mirrored dim copy just under the floor line + faint floor glow plane */}
        <group position={[0, -CARD_Y + 0.0 - bob, 0]} scale={[1, -1, 1]}>
          <SignCard lines={lines} button="Confirm" opacity={0.16} dim />
        </group>
      </Studio3D>
    </AbsoluteFill>
  );
};

const ShotB: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const enter = (a: number, b: number) => outC(interpolate(f, [a, b], [0, 1], clamp));
  const tick = enter(4, 14);
  const t2 = enter(0, 8);
  const draw = interpolate(f, [4, 14], [0, 1], clamp);
  const grey = "#c4c4c4";
  return (
    <AbsoluteFill style={{ background: "#0d0e10" }}>
      <Cam2D shot={{ from: { x: 36, y: 14, s: 1.02 }, to: { x: -26, y: -6, s: 1.1 }, len: 34 }}>
        <div style={{ position: "absolute", left: 130, width: 820, top: 650, fontFamily: brand.body }}>
          <div style={{ fontWeight: 600, fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
            opacity: t2, marginBottom: 34 }}>Confirm transaction</div>
          <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: t2, transform: `translateY(${(1 - t2) * 16}px)` }}>
            <div style={{ width: 112, height: 112, borderRadius: 56, border: "5px solid #8a8a8a", flex: "none", display: "flex",
              alignItems: "center", justifyContent: "center", opacity: tick }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <path d="M10 34 L26 50 L54 14" fill="none" stroke={grey} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
                  pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 80, lineHeight: 1.08, color: "#f2f2f2", letterSpacing: -1 }}>
              Routine internal<br />transfer
            </div>
          </div>
          <div style={{ marginTop: 40, fontWeight: 500, fontSize: 32, color: "rgba(255,255,255,0.45)", opacity: enter(8, 18) }}>
            {SAW[1]}
          </div>
        </div>
      </Cam2D>
      <Callout text="LOOKS NORMAL" at={[330, 1010]} label={[330, 1170]} startFrame={8} accent />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 97;
  const cut = Math.max(40, W(props, "routine", 0, 2.33) - 2);
  const shotA: Shot = { from: [-3.6, 1.6, 7.4], to: [3.2, 1.35, 7.6], tFrom: [0, CARD_Y, 0], tTo: [0, CARD_Y, 0], fov: SHOT_A_BASE.fov, len: cut };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cut} layout="none"><ShotA shot={shotA} /></Sequence>
      <Sequence from={cut} durationInFrames={total - cut} layout="none"><ShotB at={cut} /></Sequence>
      <Disclaimer text="Illustration · wording paraphrased" />
    </Shell>
  );
};
export default Scene;
