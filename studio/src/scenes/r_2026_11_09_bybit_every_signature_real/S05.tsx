// Scene: 2026-11-09-bybit-every-signature-real S05 (v2) — "What they really signed handed over the whole wallet.
// 401,000 ether, gone."  INK & SIGNATURES world, smooth eased cameras only.
// Shots (hard cuts): 1 hex calldata ribbon, delegatecall glows (2D, Cam2D) · 2 vault door swings open (3D push-in) ·
// 3a/3b orange tokens drift out in a gentle arc, two angles (3D) · 4 empty vault interior, camera holds then eases back.
// Orange system per shot: 1 the delegatecall chip · 2 the glow inside the opening door · 3 the tokens · 4 a last token fading.
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, Mat, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import {
  Cam2D, CamRig, Token, Sfx, W, rand, ease, HEX, STORY, ORANGE, clamp,
  type Shot, type Vec3,
} from "./_shared";

const MONO = "'DejaVu Sans Mono', monospace";
const VAULT: Vec3 = [0, 1.6, 0];

/* ---------------------------------------------------------------- shot 1: the unreadable calldata ribbon */
const HEXBODY = HEX.slice(2);
const hexSlice = (i: number, len: number) => {
  const s = HEXBODY.repeat(4);
  const o = (i * 23) % HEXBODY.length;
  return s.slice(o, o + len);
};
const ROWS = 9;
const ShotHex: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #17181b 0%, #0e0f11 70%)" }}>
      <AbsoluteFill style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, transparent 400px, #000 560px, #000 1360px, transparent 1480px)" }}>
        <Cam2D shot={{ from: { x: 170, y: 10, s: 1.0 }, to: { x: -150, y: -10, s: 1.14 }, len }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, perspective: 1800 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformStyle: "preserve-3d",
              transform: "rotateX(34deg) rotateZ(-7deg) rotateY(-14deg)" }}>
              {Array.from({ length: ROWS }).map((_, i) => {
                const mid = i === Math.floor(ROWS / 2);
                const dist = Math.abs(i - Math.floor(ROWS / 2));
                return (
                  <div key={i} style={{ position: "absolute", left: 0, width: 1080, top: 960 + (i - Math.floor(ROWS / 2)) * 104 - 34, height: 68,
                    display: "flex", justifyContent: "center", alignItems: "center", whiteSpace: "nowrap", fontFamily: MONO, fontWeight: 600,
                    fontSize: 56, letterSpacing: 2, color: `rgba(255,255,255,${0.34 - dist * 0.05})`, overflow: "visible" }}>
                    <span style={{ flex: "none", width: 0, display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ flex: "none", paddingRight: mid ? 250 : 0, transform: "translateX(0)" }}>{hexSlice(i, 56)}</span>
                    </span>
                    {mid ? (
                      <span style={{ flex: "none", color: "#ffd9b0", fontWeight: 800, padding: "4px 18px", borderRadius: 12,
                        background: "rgba(255,128,0,0.22)", border: `3px solid ${ORANGE}`,
                        textShadow: `0 0 18px ${ORANGE}, 0 0 44px ${ORANGE}`, boxShadow: `0 0 36px rgba(255,128,0,0.55)`,
                        opacity: interpolate(f, [2, 9], [0.0, 1], clamp) }}>delegatecall</span>
                    ) : null}
                    <span style={{ flex: "none", width: 0, display: "flex", justifyContent: "flex-start" }}>
                      <span style={{ flex: "none", paddingLeft: mid ? 250 : 0 }}>{hexSlice(i + 5, 56)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <Callout text="UNREADABLE TO HUMANS" at={[540, 960]} label={[540, 700]} startFrame={8} accent={false} />
        </Cam2D>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 3D world: open vault + token stream */
const NTOK = 40;
const TOK_T0 = 80;   // global frame the first token leaves (≈ "401,000")
const TOK_DUR = 84;
const tokStart = (i: number) => TOK_T0 + i * 1.0;

const glowTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas"); c.width = 256; c.height = 256;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(128, 128, 6, 128, 128, 128);
    g.addColorStop(0, "rgba(255,150,40,0.55)"); g.addColorStop(0.55, "rgba(255,110,0,0.18)"); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
})();

/* local copy of the multisig vault door (the shared one has its back wall lying flat); all three keys turned */
const Vault: React.FC<{ position: Vec3; open: number }> = ({ position, open }) => {
  const holes: Vec3[] = [[-0.55, 0.35, 0.2], [0.55, 0.35, 0.2], [0, -0.55, 0.2]];
  return (
    <group position={position}>
      <mesh><torusGeometry args={[1.55, 0.14, 24, 96]} /><Mat kind="graphite" /></mesh>
      <mesh position={[0, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.5, 1.5, 1.8, 64, 1, true]} /><meshStandardMaterial color="#0b0b0c" side={THREE.BackSide} roughness={0.7} /></mesh>
      <mesh position={[0, 0, -1.8]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.5, 1.5, 0.05, 64]} /><meshStandardMaterial color="#060607" /></mesh>
      <group position={[-1.4, 0, 0]} rotation={[0, -open * 1.9, 0]}>
        <group position={[1.4, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.4, 1.4, 0.32, 96]} /><Mat kind="chrome" /></mesh>
          <mesh position={[0, 0, 0.17]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.15, 1.15, 0.04, 96]} /><Mat kind="graphite" /></mesh>
          {holes.map((h, i) => (
            <group key={i} position={h}>
              <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.06, 48]} /><Mat kind="accent" /></mesh>
              <mesh position={[0, 0, 0.04]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.05, 0.22, 0.04]} /><meshStandardMaterial color="#FFB060" emissive="#FF6A00" emissiveIntensity={1.2} /></mesh>
            </group>
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1.27, Math.sin(i * Math.PI / 3) * 1.27, 0.16]}><sphereGeometry args={[0.05, 12, 8]} /><Mat kind="chrome" /></mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

const Tokens: React.FC<{ g: number }> = ({ g }) => (
  <>
    {Array.from({ length: NTOK }).map((_, i) => {
      const p = (g - tokStart(i)) / TOK_DUR;
      if (p < 0 || p > 1) return null;
      const side = rand(i + 1) < 0.5 ? -1 : 1;
      const sx = (rand(i + 7) - 0.5) * 1.5, sy = VAULT[1] + (rand(i + 13) - 0.5) * 1.4;
      const ex = side * (2.8 + rand(i + 21) * 2.4), ey = VAULT[1] + 0.6 + rand(i + 31) * 1.4, ez = 0.3 + rand(i + 41) * 1.2; // sideways, gentle, below the caption band
      const q = p * p * (3 - 2 * p); // smooth in-out drift
      const pos: Vec3 = [sx + (ex - sx) * q, sy + (ey - sy) * q + Math.sin(Math.PI * q) * 0.7, -0.9 + (ez + 0.9) * q];
      const sc = Math.min(1, p * 7) * (1.0 - 0.55 * Math.max(0, (p - 0.65) / 0.35));
      return <Token key={i} position={pos} rotation={[0.4 + p * 1.5, p * 3 + i, 0.2]} scale={sc * 1.15} />;
    })}
  </>
);

const World: React.FC<{ g: number }> = ({ g }) => {
  const open = interpolate(g, [34, 62], [0, 1], { ...clamp, easing: ease });
  const glowOp = interpolate(g, [38, 66], [0, 1], clamp) * interpolate(g, [128, 156], [1, 0.12], clamp);
  return (
    <>
      <Vault position={VAULT} open={open} />
      {/* faint warm glow on the vault's back wall: the only light inside */}
      <mesh position={[0, VAULT[1], -1.7]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial map={glowTex()} transparent opacity={glowOp} depthWrite={false} toneMapped={false} />
      </mesh>
      <Tokens g={g} />
    </>
  );
};

const Shot3D: React.FC<{ shot: Shot; start: number; callout?: boolean }> = ({ shot, start }) => {
  const f = useCurrentFrame();
  const g = start + f;
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <World g={g} />
      </Studio3D>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- scene */
const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 163;
  const fHanded = W(props, "handed", 0, 1.04);
  const fTok = W(props, "401,000", 0, 2.73);
  const fGone = W(props, "gone", 0, 4.66);
  const cut2 = fHanded, cut3 = fTok - 4, cut3b = cut3 + 34, cut4 = fGone;

  const shot2: Shot = { from: [1.0, 1.9, 12.6], to: [0.3, 1.7, 8.8], tFrom: [-0.1, 1.6, 0], tTo: [0, 1.6, 0], fov: 32, len: cut3 - cut2 };
  const shot3a: Shot = { from: [3.0, 1.9, 11.2], to: [1.6, 2.1, 9.4], tFrom: [0, 2.3, 0.5], tTo: [0, 2.6, 0.8], fov: 32, len: cut3b - cut3 };
  const shot3b: Shot = { from: [-3.0, 2.4, 10.4], to: [-1.6, 2.7, 9.2], tFrom: [0.3, 2.8, 1.0], tTo: [0, 3.0, 1.2], fov: 32, len: cut4 - cut3b };
  const shot4: Shot = { from: [0.5, 1.6, 6.4], to: [0.2, 1.7, 9.0], tFrom: [0, 1.6, -0.6], tTo: [0, 1.6, 0], fov: 32, len: total - cut4 };

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cut2} layout="none"><ShotHex len={cut2} /></Sequence>
      <Sequence from={cut2} durationInFrames={cut3 - cut2} layout="none"><Shot3D shot={shot2} start={cut2} /></Sequence>
      <Sequence from={cut3} durationInFrames={cut3b - cut3} layout="none"><Shot3D shot={shot3a} start={cut3} /></Sequence>
      <Sequence from={cut3b} durationInFrames={cut4 - cut3b} layout="none"><Shot3D shot={shot3b} start={cut3b} /></Sequence>
      <Sequence from={cut4} durationInFrames={total - cut4} layout="none"><Shot3D shot={shot4} start={cut4} /></Sequence>

      {/* small grey counter ticks down while the tokens leave */}
      <Sequence from={cut3} layout="none"><EthCounterGlobal start={cut3} end={fGone} /></Sequence>

      <Sfx name="glint" at={6} volume={0.4} />
      <Sfx name="click" at={cut2 + 2} volume={0.5} />
      <Sfx name="whoosh_soft" at={cut2 + 8} volume={0.3} />
      <Sfx name="sub_drop" at={fTok} volume={0.45} />
      <Disclaimer text={`Illustration · ${STORY.eth} ETH per NCC Group`} />
    </Shell>
  );
};

const EthCounterGlobal: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const f = useCurrentFrame() + start; // global frame
  const t = interpolate(f, [start + 2, end + 6], [0, 1], clamp);
  const e = t * t * (3 - 2 * t);
  const raw = Math.round(401347 * (1 - e));
  const v = f >= start + 2 ? Math.max(0, raw - (raw % 2)) : 401347;
  const frameStep = Math.floor(f / 2); void frameStep;
  const op = interpolate(f, [start, start + 6], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1368, textAlign: "center", opacity: op, fontFamily: brand.body,
      fontWeight: 600, fontSize: 40, letterSpacing: 3, color: "rgba(255,255,255,0.62)", fontVariantNumeric: "tabular-nums" }}>
      {(f >= end + 6 ? 0 : v).toLocaleString("en-US")} <span style={{ fontSize: 24, letterSpacing: 6, color: "rgba(255,255,255,0.4)" }}>ETH</span>
    </div>
  );
};

export default Scene;
