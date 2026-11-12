// S09 "That's why your wallet app gives you twelve words. They're your key, written so a human can copy it." (170 f)
//  1 f0–"gives"   3D  Handset "Back up your wallet", slow push
//  2 "gives"–"They're" 2D  12 WORDS numbered 3x4, 2 f apart, Cam2D push, callout-free
//  3 "They're"–"written" 3D  NumberKey above WordPlate, orange bracket, callout SAME KEY
//  4 "written"–end 3D  camera gliding across tilted WordPlate, callout ON PAPER OR STEEL · OFFLINE
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Cam2D, Handset, NumberKey, WordPlate, Sfx, W, WORDS, ORANGE, project, clamp, type Shot } from "./_shared";

const outC = Easing.out(Easing.cubic);

/* ---------- shot 1 ---------- */
const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 18) * 0.02;
  const arrive = outC(interpolate(f, [0, 8], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Handset position={[0, 1.15 + bob - (1 - arrive) * 0.25, 0]} scale={1}
          lines={[
            { text: "Back up your wallet", size: 44, weight: 700 },
            { text: "Write these", size: 40, color: "#b8b8b8", weight: 500 },
            { text: "12 words down", size: 50, weight: 800, color: ORANGE },
          ]} />
      </Studio3D>
    </AbsoluteFill>
  );
};

/* ---------- shot 2 (2D) ---------- */
const ShotB: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const mono = "'DejaVu Sans Mono', monospace";
  return (
    <AbsoluteFill style={{ background: "#0d0e10" }}>
      <Cam2D shot={{ from: { x: 0, y: 8, s: 1.0 }, to: { x: 0, y: -6, s: 1.07 }, len }}>
        <div style={{ position: "absolute", left: 100, top: 520, width: 880, fontFamily: brand.body, fontWeight: 600, fontSize: 26,
          letterSpacing: 5, color: "rgba(255,255,255,0.45)", opacity: outC(interpolate(f, [0, 8], [0, 1], clamp)) }}>YOUR RECOVERY WORDS</div>
        {WORDS.map((w, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const e = outC(interpolate(f, [i * 2, i * 2 + 6], [0, 1], clamp));
          return (
            <div key={i} style={{ position: "absolute", left: 100 + col * 300, top: 600 + row * 150, width: 290, height: 110, display: "flex", alignItems: "center",
              gap: 14, fontFamily: mono, opacity: e, transform: `translate3d(0, ${(1 - e) * 14}px, 0)`,
              borderBottom: "2px solid rgba(255,255,255,0.12)" }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: ORANGE, width: 46, textAlign: "right" }}>{i + 1}</span>
              <span style={{ fontSize: 50, fontWeight: 700, color: "#f2f2f2" }}>{w}</span>
            </div>
          );
        })}
      </Cam2D>
      {[0, 3, 6, 9].map((i) => <Sfx key={i} name="tick" at={i * 2} volume={0.3} />)}
      <Disclaimer text="Example words · never use these" />
    </AbsoluteFill>
  );
};

/* ---------- shot 3 ---------- */
const KEY_P: [number, number, number] = [-0.62, 2.15, 0];
const PLATE_P: [number, number, number] = [0, 0.75, 0];
const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const k = outC(interpolate(f, [0, 8], [0, 1], clamp));
  const br = outC(interpolate(f, [6, 18], [0, 1], clamp));
  const bar = (x: number) => (
    <mesh position={[x, 1.52, 0.04]}>
      <boxGeometry args={[0.025, 0.62 * br, 0.025]} />
      <meshStandardMaterial color={ORANGE} emissive="#FF6A00" emissiveIntensity={2} toneMapped={false} />
    </mesh>
  );
  const mid = project(shot, f, [0.1, 1.52, 0.04]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <NumberKey position={[KEY_P[0], KEY_P[1] + (1 - k) * 0.3, 0]} scale={0.7} digits="83917265048271936450" glowLight />
        <WordPlate position={PLATE_P} scale={0.85} count={12} />
        {bar(-0.5)}{bar(0.7)}
      </Studio3D>
      <Callout text="SAME KEY" at={[mid[0], mid[1] - 20]} label={[mid[0], mid[1] + 60]} startFrame={10} accent />
    </AbsoluteFill>
  );
};

/* ---------- shot 4 ---------- */
const ShotD: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const a = project(shot, f, [0, 0.5, 0.05]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <WordPlate position={[0, 1.3, 0]} rotation={[0, -0.28, 0.02]} count={12} />
      </Studio3D>
      <Callout text="ON PAPER OR STEEL · OFFLINE" at={[a[0], a[1]]} label={[a[0], a[1] + 110]} startFrame={8} accent={false} size={26} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 170;
  const c2 = Math.max(30, W(props, "gives", 0, 1.43) - 1);
  const c3 = Math.max(c2 + 28, W(props, "they're", 0, 2.76) - 1);
  const c4 = Math.max(c3 + 25, W(props, "written", 0, 3.72) - 1);
  const s1: Shot = { from: [-1.4, 1.5, 8.2], to: [0.2, 1.25, 6.4], tFrom: [0, 1.15, 0], tTo: [0, 1.15, 0], fov: 32, len: c2 };
  const s3: Shot = { from: [-0.9, 1.7, 7.4], to: [0.5, 1.5, 6.6], tFrom: [0, 1.45, 0], tTo: [0, 1.45, 0], fov: 36, len: c4 - c3 };
  const s4: Shot = { from: [-1.0, 1.5, 8.2], to: [1.0, 1.3, 7.8], tFrom: [-0.3, 1.3, 0], tTo: [0.3, 1.3, 0], fov: 34, len: total - c4 };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c2} layout="none"><ShotA shot={s1} /></Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="none"><ShotB len={c3 - c2} /></Sequence>
      <Sequence from={c3} durationInFrames={c4 - c3} layout="none"><ShotC shot={s3} /></Sequence>
      <Sequence from={c4} durationInFrames={total - c4} layout="none"><ShotD shot={s4} /></Sequence>
      <Sfx name="whoosh_soft" at={c3} volume={0.3} />
      <Sfx name="click" at={c3 + 8} volume={0.4} />
      <Sfx name="glint" at={c4 + 4} volume={0.3} />
    </Shell>
  );
};
export default Scene;
