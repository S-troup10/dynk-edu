// S06 "But only one key opens it. And that key is just a very long secret number." (147 f)
//  1 f0–35    3D  NumberKey glides tip-first toward the letterbox keyhole, side-on three-quarter (But only one key)
//  2 35–53    3D  key in, turns 90°, door swings open, frame glows, click (opens it)
//  3 53–90    3D  macro travelling along the key blade, digits readable (And that key is just)
//  4 90–end   2D  KEY_DIGITS typed out in orange mono over black, small caps under (a very long secret number)
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Cam2D, Letterbox, NumberKey, Sfx, W, ORANGE, KEY_DIGITS, clamp, type Shot, type Vec3 } from "./_shared";

const outC = Easing.out(Easing.cubic);
const inOut = Easing.bezier(0.45, 0, 0.2, 1);
const KS = 0.5;                 // key scale
const KH_Y = 1.13;              // keyhole height (world)
const KH_X = 0.38;
const Z_IN = 0.43 + 0.02;       // key centre z offset so the tip sits just in the keyhole: tip z = Z_IN - 2.1*KS
const KEY_Z_IN = 0.41 + 2.1 * KS;

/** Key pointing -Z (tip first), flat faces toward ±X; `turn` rotates it about its own axis. */
const SideKey: React.FC<{ pos: Vec3; turn: number }> = ({ pos, turn }) => (
  <group position={pos} rotation={[0, Math.PI / 2, 0]}>
    <NumberKey rotation={[turn, 0, 0]} scale={KS} glowLight digits={KEY_DIGITS.slice(0, 16)} />
  </group>
);

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const p = Easing.bezier(0.3, 0.1, 0.25, 1)(interpolate(f, [0, shot.len], [0, 1], clamp));
  const z = 3.3 + (KEY_Z_IN - 3.3) * p;
  const y = KH_Y + 0.12 * (1 - p);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox coins={24} keyGlow />
        <SideKey pos={[KH_X, y, z]} turn={0} />
      </Studio3D>
    </AbsoluteFill>
  );
};

const ShotB: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const turn = inOut(interpolate(f, [1, 9], [0, 1], clamp)) * (Math.PI / 2);
  const open = outC(interpolate(f, [8, 20], [0, 0.9], clamp));
  const glow = f >= 8;
  // key rides with the door: put it in the door's hinge frame (hinge at [-0.6, 0.5, 0.4]; keyhole at door-local [0.98, 0.63])
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox coins={24} open={open} glow={glow} keyGlow />
        <group position={[-0.6, 0.5, 0.4]} rotation={[0, -open * 1.75, 0]}>
          <SideKey pos={[0.98, 0.63, KEY_Z_IN - 0.4]} turn={turn} />
        </group>
      </Studio3D>
    </AbsoluteFill>
  );
};

const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill>
    <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <NumberKey position={[0, 0, 0]} rotation={[0, -0.2, 0]} glowLight digits={KEY_DIGITS.slice(0, 28)} />
    </Studio3D>
  </AbsoluteFill>
);

const ShotD: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const n = Math.min(KEY_DIGITS.length, Math.max(0, (f - 3) * 3));
  const lines = [KEY_DIGITS.slice(0, 26), KEY_DIGITS.slice(26, 52), KEY_DIGITS.slice(52)];
  const cap = outC(interpolate(f, [28, 40], [0, 1], clamp));
  const cursorOn = Math.floor(f / 8) % 2 === 0 || n < KEY_DIGITS.length;
  let left = n;
  return (
    <AbsoluteFill style={{ background: "#050506" }}>
      <Cam2D shot={{ from: { x: 0, y: 0, s: 1.0 }, to: { x: 0, y: -10, s: 1.07 }, len }}>
        <div style={{ position: "absolute", left: 70, width: 940, top: 760, fontFamily: "'DejaVu Sans Mono', monospace", fontWeight: 700, fontSize: 52,
          lineHeight: 1.62, color: ORANGE, letterSpacing: 2, whiteSpace: "pre", textShadow: "0 0 26px rgba(255,128,0,0.45)", fontVariantNumeric: "tabular-nums" }}>
          {lines.map((l, i) => {
            const shown = l.slice(0, Math.max(0, Math.min(l.length, left)));
            const isLast = left > 0 && left <= l.length || (i === 2 && left >= l.length);
            left -= l.length;
            return (
              <div key={i} style={{ height: 84 }}>
                {shown}
                {isLast && cursorOn && <span style={{ display: "inline-block", width: 22, height: 52, background: ORANGE, marginLeft: 4, verticalAlign: "-6px" }} />}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 70, width: 940, top: 1080, fontFamily: brand.body, fontWeight: 600, fontSize: 26, letterSpacing: 4,
          color: "rgba(255,255,255,0.6)", opacity: cap, transform: `translateY(${(1 - cap) * 12}px)` }}>
          A PRIVATE KEY IS A NUMBER ABOUT THIS LONG
        </div>
      </Cam2D>
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 147;
  const c1 = Math.max(24, W(props, "opens", 0, 1.17));
  const c2 = Math.max(c1 + 16, W(props, "and", 0, 1.77) - 0);
  const c3 = Math.max(c2 + 30, W(props, "a", 0, 3.0) - 0);
  const sA: Shot = { from: [4.6, 1.75, 5.2], to: [4.2, 1.65, 4.5], tFrom: [-0.1, 1.0, 1.3], tTo: [0.15, 1.05, 0.9], fov: 38, len: c1 };
  const sB: Shot = { from: [4.2, 1.7, 4.9], to: [3.7, 1.6, 4.4], tFrom: [0.2, 1.0, 0.9], tTo: [0.3, 1.0, 0.9], fov: 38, len: c2 - c1 };
  const sC: Shot = { from: [0.4, 0.05, 3.1], to: [1.5, 0.05, 2.8], tFrom: [0.8, 0.0, 0], tTo: [1.7, 0.0, 0], fov: 28, len: c3 - c2 };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c1} layout="none"><ShotA shot={sA} /></Sequence>
      <Sequence from={c1} durationInFrames={c2 - c1} layout="none"><ShotB shot={sB} /></Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="none"><ShotC shot={sC} /></Sequence>
      <Sequence from={c3} durationInFrames={total - c3} layout="none"><ShotD len={total - c3} /></Sequence>
      <Sfx name="whoosh_soft" at={c2} volume={0.28} />
      <Sfx name="tick" at={c1 - 4} volume={0.35} />
      <Sfx name="click" at={c1 + 9} volume={0.5} />
      <Sfx name="type" at={c3 + 3} volume={0.4} />
      <Sequence from={c3} layout="none"><Disclaimer text="Example number · not a real key" /></Sequence>
    </Shell>
  );
};
export default Scene;
