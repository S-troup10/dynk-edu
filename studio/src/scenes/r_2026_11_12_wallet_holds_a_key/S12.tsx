// S12 CTA "Send this to someone who's about to set up their first wallet." (121 f)
//  1 f0–CUT  3D  brand-new empty Letterbox rises into place, fresh orange NumberKey settles beside it, slow orbit
//  2 CUT–end 2D  three-line CTA arriving line by line (6 f apart), handle + education-only line, Cam2D push
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Studio3D, Shell, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Cam2D, Letterbox, NumberKey, Sfx, W, clamp, ORANGE, type Shot } from "./_shared";

const outC = Easing.out(Easing.cubic);

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const rise = outC(interpolate(f, [0, 14], [0, 1], clamp));
  const drop = Easing.bezier(0.3, 0, 0.3, 1)(interpolate(f, [8, 20], [0, 1], clamp));
  const lbY = -2.4 * (1 - rise);
  const keyY = 0.09 + 1.1 * (1 - drop);
  const keyRot = 0.35 + 0.5 * (1 - drop);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox position={[-0.55, lbY, 0]} coins={0} />
        <NumberKey position={[0.55, keyY, 0.75]} rotation={[-Math.PI / 2 + 0.25 * (1 - drop), 0, keyRot]} scale={0.55} glowLight />
      </Studio3D>
    </AbsoluteFill>
  );
};

const ShotB: React.FC = () => {
  const f = useCurrentFrame();
  const e = (a: number, d = 8) => outC(interpolate(f, [a, a + d], [0, 1], clamp));
  const line = (t: string, color: string, a: number) => (
    <div style={{ opacity: e(a), transform: `translate3d(0, ${(1 - e(a)) * 22}px, 0)`, color, fontWeight: 800, fontSize: 76,
      lineHeight: 1.12, letterSpacing: -1 }}>{t}</div>
  );
  return (
    <AbsoluteFill style={{ background: "#0d0e10" }}>
      <Cam2D shot={{ from: { y: 10, s: 1.0 }, to: { y: -8, s: 1.07 }, len: 70 }}>
        <div style={{ position: "absolute", left: 90, width: 900, top: 720, fontFamily: brand.body }}>
          {line("SEND THIS TO SOMEONE", "#ffffff", 0)}
          {line("SETTING UP THEIR", "#ffffff", 6)}
          {line("FIRST WALLET.", ORANGE, 12)}
          <div style={{ marginTop: 44, fontWeight: 500, fontSize: 34, color: "rgba(255,255,255,0.55)", opacity: e(22, 10) }}>@dynkeducation</div>
        </div>
        <div style={{ position: "absolute", left: 0, width: 1080, top: 1440, textAlign: "center", fontFamily: brand.body, fontWeight: 600,
          fontSize: 22, letterSpacing: 4, color: "rgba(255,255,255,0.42)", opacity: e(26, 10) }}>
          EDUCATION ONLY · NOT FINANCIAL ADVICE
        </div>
      </Cam2D>
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 121;
  const cut = 55;
  const shotA: Shot = { from: [-3.4, 2.3, 7.4], to: [2.6, 2.0, 7.2], tFrom: [0, 1.0, 0], tTo: [0, 1.0, 0], fov: 32, len: cut };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cut} layout="none"><ShotA shot={shotA} /></Sequence>
      <Sequence from={cut} durationInFrames={total - cut} layout="none"><ShotB /></Sequence>
      <Sfx name="whoosh_soft" at={2} volume={0.28} />
      <Sfx name="click" at={20} volume={0.4} />
      <Sfx name="tick" at={cut + 12} volume={0.3} />
    </Shell>
  );
};
export default Scene;
