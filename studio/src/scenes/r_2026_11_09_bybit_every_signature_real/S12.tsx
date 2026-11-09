// Scene: 2026-11-09-bybit-every-signature-real S12 — CTA. "Send this to someone who taps confirm without reading."
// 2D ink world. Shot A (wide): graphite request card rises in, "Send this to…". Hard cut on "confirm" to shot B (closer):
// an orange ink signature writes across the signature line, button + handle, hold >= 0.6 s. No disclaimer.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { Cam2D, InkPath2D, SIG_D, Sfx, W, clamp, ORANGE, type Shot2D } from "./_shared";

const outC = Easing.out(Easing.cubic);

const CARD = { left: 150, top: 640, w: 780, h: 600 };

/** The request card (2D SignCard look). f = absolute scene frame. */
const Card: React.FC<{ f: number; inkStart: number; inkLen: number }> = ({ f, inkStart, inkLen }) => {
  const rise = outC(interpolate(f, [-6, 14], [0, 1], clamp)); // already mid-rise at f0
  const ink = interpolate(f, [inkStart, inkStart + inkLen], [0, 1], clamp);
  const btnOn = interpolate(f, [inkStart + inkLen - 2, inkStart + inkLen + 6], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: CARD.left, top: CARD.top, width: CARD.w, height: CARD.h,
      transform: `translate3d(0, ${(1 - rise) * 140}px, 0)`, opacity: 0.55 + 0.45 * rise,
      borderRadius: 36, background: "linear-gradient(160deg, rgba(58,60,66,0.96), rgba(30,31,35,0.98))",
      border: "1.5px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 90px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
      fontFamily: brand.body, color: "#fff" }}>
      <div style={{ position: "absolute", left: 56, top: 48, fontSize: 24, letterSpacing: 6, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>SIGNATURE REQUEST</div>
      <div style={{ position: "absolute", left: 56, top: 100, fontSize: 76, fontWeight: 800, letterSpacing: -1 }}>Send this to…</div>
      <div style={{ position: "absolute", left: 56, top: 205, width: 660, fontSize: 44, fontWeight: 500, lineHeight: 1.25, color: "rgba(255,255,255,0.72)" }}>
        someone who taps confirm without reading
      </div>
      {/* signature line */}
      <div style={{ position: "absolute", left: 56, top: 395, fontSize: 40, fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>×</div>
      <div style={{ position: "absolute", left: 100, top: 438, width: 624, height: 2, background: "rgba(255,255,255,0.35)" }} />
      <div style={{ position: "absolute", left: 100, top: 452, fontSize: 20, letterSpacing: 5, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>YOUR SIGNATURE</div>
      <div style={{ position: "absolute", left: 200, top: 300, width: 420 }}>
        <InkPath2D d={SIG_D} progress={ink} width={9} style={{ width: 420, height: 168 }} />
      </div>
      {/* button */}
      <div style={{ position: "absolute", right: 56, bottom: 38, width: 230, height: 72, borderRadius: 36, background: ORANGE,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, color: "#111",
        opacity: 0.9 + 0.1 * btnOn }}>Send</div>
    </div>
  );
};

const Handle: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: CARD.top + CARD.h + 56, textAlign: "center",
    fontFamily: brand.body, fontWeight: 500, fontSize: 34, letterSpacing: 1.5, color: "rgba(255,255,255,0.6)" }}>@dynkeducation</div>
);

const SHOT_A: Shot2D = { from: { x: 6, y: 24, s: 1.0 }, to: { x: -6, y: -6, s: 1.07 }, len: 54 };
const SHOT_B: Shot2D = { from: { x: 8, y: -70, s: 1.12 }, to: { x: 0, y: -100, s: 1.2 }, len: 66 };

const Shot: React.FC<{ offset: number; cam: Shot2D; inkStart: number; inkLen: number }> = ({ offset, cam, inkStart, inkLen }) => {
  const f = useCurrentFrame() + offset;
  return (
    <AbsoluteFill>
      <Cam2D shot={cam} originY={900}>
        <Card f={f} inkStart={inkStart} inkLen={inkLen} />
        <Handle />
      </Cam2D>
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const tConfirm = W(props, "confirm", 0, 1.7);
  const cut = tConfirm - 2;
  const inkStart = tConfirm + 2;
  const inkLen = 34;
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cut} layout="none">
        <Shot offset={0} cam={SHOT_A} inkStart={inkStart} inkLen={inkLen} />
      </Sequence>
      <Sequence from={cut} durationInFrames={props.durationInFrames - cut} layout="none">
        <Shot offset={cut} cam={SHOT_B} inkStart={inkStart} inkLen={inkLen} />
      </Sequence>
      <Sfx name="whoosh_soft" at={0} volume={0.3} />
      <Sfx name="glint" at={inkStart} volume={0.3} />
      <Sfx name="click" at={inkStart + inkLen} volume={0.35} />
    </Shell>
  );
};

export default Scene;
