// Scene: 2026-11-09-bybit-every-signature-real S06 v2 — THE TURN ("Here's the part about you…").
// A 3D keycap descends-in · B macro press · C ink signature written above the key · D 2D wall of unreadable message text.
// Orange system per shot: the CONFIRM key (A,B), the ink signature (C), the "???" callout (D).
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { Cam2D, CamRig, InkPath2D, InkStroke, Keycap, SIG_D, SIG_POINTS, Sfx, W, ORANGE, clamp, ease, project, type Shot, type Vec3 } from "./_shared";

const press = (f: number, at: number) =>
  interpolate(f, [at, at + 6, at + 14], [0, 1, 0], { ...clamp, easing: ease });

const Light: React.FC = () => (
  <>
    <pointLight position={[0, 1.6, 0.4]} intensity={9} color="#FF8000" distance={7} />
    <spotLight position={[0, 6, 2]} angle={0.5} penumbra={1} intensity={60} color="#ffffff" />
  </>
);

/* ---------- A: key on the floor, camera descends toward it ---------- */
const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Light />
        <Keycap position={[0, 0, 0]} press={0} />
      </Studio3D>
    </AbsoluteFill>
  );
};

/* ---------- B: macro press on "tap confirm" ---------- */
const ShotB: React.FC<{ shot: Shot; at: number }> = ({ shot, at }) => {
  const f = useCurrentFrame();
  const p = project(shot, f, [-0.7, 0.2, 0.2]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Light />
        <Keycap position={[0, 0, 0]} press={press(f, at)} />
      </Studio3D>
      <Callout text="YOU, EVERY DAY" at={[p[0], p[1]]} label={[Math.max(300, p[0] - 120), 1130]} startFrame={14} />
      <Sfx name="click" at={at} volume={0.6} />
    </AbsoluteFill>
  );
};

/* ---------- C: signature writes itself in the air above the key ---------- */
const SIG3: Vec3[] = SIG_POINTS.map(([x, y]) => [x * 0.62, y * 0.62 + 1.55, 0.1]);
const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const prog = interpolate(f, [4, 34], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <pointLight position={[0, 1.6, 0.8]} intensity={5} color="#FF8000" distance={7} />
        <spotLight position={[0, 6, 2]} angle={0.5} penumbra={1} intensity={60} color="#ffffff" />
        <Keycap position={[0, 0, 0]} press={press(f, 0)} glow={false} />
        <InkStroke points={SIG3} progress={prog} radius={0.028} />
      </Studio3D>
      <Sfx name="click" at={0} volume={0.45} />
      <Sfx name="glint" at={4} volume={0.3} />
    </AbsoluteFill>
  );
};

/* ---------- D: dense wall of grey message text, push in until unreadable ---------- */
const ROWS = [
  `{ "types": { "EIP712Domain": [`, `  { "name": "name", "type": "string" },`, `  { "name": "chainId", "type": "uint256" },`,
  `  { "name": "verifyingContract", "type": "address" } ],`, `  "Permit": [ { "name": "owner", "type": "address" },`,
  `  { "name": "spender", "type": "address" },`, `  { "name": "value", "type": "uint256" },`, `  { "name": "nonce", "type": "uint256" },`,
  `  { "name": "deadline", "type": "uint256" } ] },`, `  "primaryType": "Permit",`, `  "domain": { "name": "Token", "chainId": 1,`,
  `    "verifyingContract": "0x7a25…c9d1" },`, `  "message": { "owner": "0x31e0…a4f7",`, `    "spender": "0x9f3b…e2c8",`,
  `    "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",`,
  `    "nonce": "0x0000000000000000000000000000000000000000000000000000000000000007",`, `    "deadline": "1893456000" } }`,
];
const ShotD: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const sig = interpolate(f, [0, 12], [1, 0], clamp);
  const wall = interpolate(f, [2, 12], [0, 1], clamp);
  const blur = interpolate(f, [8, len], [0, 2.2], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0E0F11" }}>
      <AbsoluteFill style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent 370px, #000 430px, #000 1480px, transparent 1520px)",
        maskImage: "linear-gradient(to bottom, transparent 370px, #000 430px, #000 1480px, transparent 1520px)" }}>
        <Cam2D shot={{ from: { s: 1.0, y: 10 }, to: { s: 1.55, y: -40 }, len }}>
          <div style={{ position: "absolute", left: 70, top: 400, width: 940, opacity: wall, filter: `blur(${blur}px)`,
            fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 27, lineHeight: "37px", color: "rgba(255,255,255,0.42)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {[...ROWS, ...ROWS, ...ROWS].map((r, i) => <div key={i}>{r}</div>)}
          </div>
          <div style={{ position: "absolute", left: 190, top: 800, width: 700, opacity: sig }}>
            <InkPath2D d={SIG_D} progress={1} width={9} style={{ width: 700 }} />
          </div>
        </Cam2D>
      </AbsoluteFill>
      <Callout text="???" at={[540, 930]} label={[800, 1210]} startFrame={14} accent size={44} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 171;
  const cB = W(props, "every", 0, 1.5);   // ~45
  const tap = W(props, "tap", 0, 2.48);   // ~74
  const cC = W(props, "you", 1, 3.14);    // ~94
  const cD = W(props, "you", 2, 4.33);    // ~130
  const shotA: Shot = { from: [0.4, 4.6, 6.4], to: [0.2, 2.0, 4.6], tFrom: [0, 0.3, 0], tTo: [0, 0.3, 0], fov: 30, len: cB };
  const shotB: Shot = { from: [2.4, 1.5, 4.9], to: [1.6, 1.15, 4.1], tFrom: [0, 0.3, 0], tTo: [0, 0.3, 0], fov: 30, len: cC - cB };
  const shotC: Shot = { from: [-2.4, 1.7, 5.2], to: [-1.2, 1.8, 4.6], tFrom: [0, 1.1, 0], tTo: [0, 1.1, 0], fov: 30, len: cD - cC };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cB} layout="none"><ShotA shot={shotA} /></Sequence>
      <Sequence from={cB} durationInFrames={cC - cB} layout="none"><ShotB shot={shotB} at={tap - cB - 2} /></Sequence>
      <Sequence from={cC} durationInFrames={cD - cC} layout="none"><ShotC shot={shotC} /></Sequence>
      <Sequence from={cD} durationInFrames={total - cD} layout="none"><ShotD len={total - cD} /></Sequence>
      <Disclaimer text="Illustration · message simplified" />
    </Shell>
  );
};
export default Scene;
