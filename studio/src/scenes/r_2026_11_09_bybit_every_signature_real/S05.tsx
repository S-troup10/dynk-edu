// Scene: 2026-11-09-bybit-every-signature-real S05 — "What they really signed handed over the whole wallet. 401,000 ether, gone."
// Orange system per shot: 1 the delegatecall chip · 2 the lock/key leaving the vault · 3 the draining balance · 4 none (dim, empty).
// Shots (hard cuts): 1 hex macro (2D) · 2a vault slab, lock detaches (3D) · 2b lock lands on attacker slab (3D) ·
// 3a balance plate ticking down (2D) · 3b macro along the digits (2D) · 4 plate reads 0.00 ETH, dim (2D).
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, Mat, Padlock, chromeFill, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, project, W, Sfx, rand, HEX, STORY, ORANGE, clamp, type Shot, type Vec3 } from "./_shared";

const out = Easing.out(Easing.cubic);
const inOut = Easing.inOut(Easing.cubic);
const MONO = "'DejaVu Sans Mono', monospace";

/* =============================== 2D camera helpers =============================== */
const Cam2D: React.FC<{ S: number; fx: number; fy: number; rot?: number; children: React.ReactNode }> = ({ S, fx, fy, rot = 0, children }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: "0 0",
      transform: `translate(540px,960px) rotate(${rot}deg) scale(${S}) translate(${-fx}px,${-fy}px)` }}>{children}</div>
  </AbsoluteFill>
);
const w2s = (wx: number, wy: number, S: number, fx: number, fy: number, rot = 0): [number, number] => {
  const dx = (wx - fx) * S, dy = (wy - fy) * S, r = (rot * Math.PI) / 180;
  return [540 + dx * Math.cos(r) - dy * Math.sin(r), 960 + dx * Math.sin(r) + dy * Math.cos(r)];
};

/* =============================== shot 1: calldata macro =============================== */
const ROW_H = 56, ROW_Y0 = 300, ROWS = 40, HEX_BODY = HEX.slice(2);
const hexRow = (i: number): string[] => {
  const o = Math.floor(rand(i * 3.7 + 1) * (HEX_BODY.length - 36));
  const s = (HEX_BODY + HEX_BODY).slice(o, o + 32);
  return [s.slice(0, 8), s.slice(8, 16), s.slice(16, 24), s.slice(24, 32)];
};
const DELEGATE_ROW = 8;
const Shot1: React.FC<{ chipAt: number; len: number }> = ({ chipAt, len }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len], [0, 1], clamp);
  const q = t * 0.7 + out(t) * 0.3;
  const S = interpolate(q, [0, 1], [1.45, 1.85]);
  const fx = interpolate(q, [0, 1], [360, 640]);
  const fy = interpolate(q, [0, 1], [ROW_Y0 + 4 * ROW_H, ROW_Y0 + 12 * ROW_H]);
  const rot = interpolate(q, [0, 1], [-2.2, 1.0]);
  const chip = interpolate(f, [chipAt, chipAt + 5], [0, 1], { ...clamp, easing: out });
  const at = w2s(380, ROW_Y0 + 11 * ROW_H, S, fx, fy, rot);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ WebkitMaskImage: "linear-gradient(180deg, transparent 350px, #000 450px, #000 1340px, transparent 1440px)", maskImage: "linear-gradient(180deg, transparent 350px, #000 450px, #000 1340px, transparent 1440px)" }}>
        <Cam2D S={S} fx={fx} fy={fy} rot={rot}>
          {Array.from({ length: ROWS }).map((_, i) => {
            const y = ROW_Y0 + i * ROW_H;
            const g = hexRow(i);
            const isD = i === DELEGATE_ROW;
            return (
              <div key={i} style={{ position: "absolute", left: 130, top: y, display: "flex", gap: 26, fontFamily: MONO, fontSize: 38, lineHeight: `${ROW_H}px`, whiteSpace: "nowrap" }}>
                <span style={{ color: "rgba(255,255,255,0.14)", width: 70 }}>{(i * 32).toString(16).padStart(4, "0")}</span>
                {isD ? (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>{g[0]}</span>
                    <span style={{ position: "relative", fontWeight: 700, color: chip > 0.3 ? ORANGE : "rgba(255,255,255,0.3)",
                      textShadow: `0 0 ${24 * chip}px rgba(255,128,0,${0.85 * chip})`, letterSpacing: 1 }}>
                      <span style={{ position: "absolute", left: -12, right: -12, top: 6, bottom: 6, borderRadius: 10, background: `rgba(255,128,0,${0.14 * chip})`, border: `1.5px solid rgba(255,128,0,${0.7 * chip})` }} />
                      <span style={{ position: "relative" }}>delegatecall</span>
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>{g[3]}</span>
                  </>
                ) : g.map((c, k) => <span key={k} style={{ color: `rgba(255,255,255,${k % 2 ? 0.2 : 0.34})` }}>{c}</span>)}
              </div>
            );
          })}
        </Cam2D>
      </AbsoluteFill>
      <Callout text="UNREADABLE" at={at} label={[540, 1390]} startFrame={5} />
    </AbsoluteFill>
  );
};

/* =============================== shots 2a / 2b: vault → attacker (3D) =============================== */
const COLD: Vec3 = [-2.6, 0, 0], ATT: Vec3 = [2.6, 0, 0];
const slabTex = (label: string, vault: boolean) => {
  const c = document.createElement("canvas"); c.width = 720; c.height = 880;
  const x = c.getContext("2d")!;
  x.fillStyle = vault ? "#17181b" : "#060607"; x.fillRect(0, 0, 720, 880);
  x.strokeStyle = vault ? "#34363b" : "#1c1c1f"; x.lineWidth = 6; x.strokeRect(12, 12, 696, 856);
  if (vault) {
    x.strokeStyle = "#2f3136"; x.lineWidth = 5;
    for (const r of [190, 150, 60]) { x.beginPath(); x.arc(360, 330, r, 0, Math.PI * 2); x.stroke(); }
    for (let a = 0; a < 6; a++) { const t = (a * Math.PI) / 3; x.beginPath(); x.moveTo(360 + Math.cos(t) * 60, 330 + Math.sin(t) * 60); x.lineTo(360 + Math.cos(t) * 150, 330 + Math.sin(t) * 150); x.stroke(); }
  } else {
    x.strokeStyle = "#17171a"; x.lineWidth = 5; x.setLineDash([18, 16]); x.strokeRect(150, 150, 420, 400); x.setLineDash([]);
  }
  x.fillStyle = vault ? "#d8d8d8" : "#5a5a5e"; x.font = "700 70px Outfit, 'DejaVu Sans', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
  (x as any).letterSpacing = "8px";
  x.fillText(label, 360, 740);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};
const Slab: React.FC<{ position: Vec3; label: string; vault?: boolean }> = ({ position, label, vault = false }) => {
  const tex = useMemo(() => slabTex(label, vault), [label, vault]);
  return (
    <group position={position}>
      <mesh position={[0, 0.17, 0]}><boxGeometry args={[2.3, 0.34, 1.0]} /><meshStandardMaterial color="#1b1c1f" metalness={0.4} roughness={0.5} /></mesh>
      <RoundedBox args={[1.8, 2.2, 0.5]} radius={0.05} smoothness={2} position={[0, 1.44, 0]}>
        {vault ? <Mat kind="graphite" /> : <meshStandardMaterial color="#09090b" metalness={0.3} roughness={0.55} />}
      </RoundedBox>
      <mesh position={[0, 1.44, 0.2515]}>
        <planeGeometry args={[1.72, 2.1]} />
        <meshStandardMaterial map={tex} roughness={0.5} metalness={0.1} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={vault ? 0.4 : 0.25} />
      </mesh>
    </group>
  );
};
const T0 = 33, T1 = 66; // global frames: lock detaches / lands on "wallet"
const lockAt = (g: number): { p: Vec3; ry: number } => {
  const t = inOut(interpolate(g, [T0, T1], [0, 1], clamp));
  const arc = Math.sin(Math.PI * t);
  return { p: [COLD[0] + (ATT[0] - COLD[0]) * t, 1.5 + 0.35 * arc, 0.46 + 0.7 * arc], ry: t * Math.PI * 1.0 + arc * 0.0 };
};
const Lock: React.FC<{ g: number }> = ({ g }) => {
  const { p, ry } = lockAt(g);
  return (
    <group position={p} rotation={[0, ry * 0, 0]}>
      <Padlock accent scale={0.46} position={[0, 0, 0]} open={interpolate(g, [T0 - 2, T0 + 5], [0, 0.6], clamp) * (1 - interpolate(g, [T1 - 6, T1], [0, 1], clamp))} />
    </group>
  );
};
const VaultScene: React.FC<{ g: number }> = ({ g }) => (
  <>
    <Slab position={COLD} label="COLD WALLET" vault />
    <Slab position={ATT} label="ATTACKER" />
    <Lock g={g} />
  </>
);
const Shot2: React.FC<{ shot: Shot; start: number; callAt?: number }> = ({ shot, start, callAt }) => {
  const f = useCurrentFrame();
  const g = f + start;
  const lp = lockAt(g).p;
  const at = project(shot, f, [lp[0], lp[1] - 0.1, lp[2]]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <VaultScene g={g} />
      </Studio3D>
      {callAt !== undefined && <Callout text="FULL CONTROL" at={at} label={[540, 1290]} startFrame={callAt} accent />}
    </AbsoluteFill>
  );
};

/* =============================== shots 3 / 4: the balance plate =============================== */
const ETH0 = 401347;
const Plate: React.FC<{ value: number; dim?: boolean; zero?: boolean; frac: number }> = ({ value, dim = false, zero = false, frac }) => {
  const txt = zero ? "0.00" : Math.max(0, Math.round(value)).toLocaleString("en-US");
  return (
    <div style={{ position: "absolute", left: 100, top: 720, width: 880, height: 440, borderRadius: 40,
      background: "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 55%, rgba(255,255,255,0.07))",
      border: "1.5px solid rgba(255,255,255,0.16)", boxShadow: dim ? "0 30px 80px rgba(0,0,0,0.6)" : "0 30px 80px rgba(0,0,0,0.6), 0 0 90px rgba(255,128,0,0.12)" }}>
      <div style={{ position: "absolute", left: 56, top: 48, fontFamily: brand.body, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: "rgba(255,255,255,0.55)" }}>COLD WALLET</div>
      <div style={{ position: "absolute", right: 56, top: 52, fontFamily: brand.body, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: "rgba(255,255,255,0.32)" }}>BALANCE</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 138, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "baseline", gap: 22 }}>
        <span style={{ fontFamily: brand.display, fontWeight: 800, fontSize: 96, letterSpacing: -2, lineHeight: 1, fontVariantNumeric: "tabular-nums",
          ...(dim ? { color: "rgba(255,255,255,0.28)" } : chromeFill(true)), filter: dim ? undefined : "drop-shadow(0 0 22px rgba(255,128,0,0.35))" }}>{txt}</span>
        <span style={{ fontFamily: brand.display, fontWeight: 700, fontSize: 40, letterSpacing: 3, color: dim ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.6)" }}>ETH</span>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 330, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${Math.max(0, frac) * 100}%`, height: "100%", borderRadius: 8, background: "linear-gradient(90deg,#B85400,#FF8000)", boxShadow: "0 0 24px rgba(255,128,0,0.8)" }} />
      </div>
    </div>
  );
};
const PLATE_C: [number, number] = [540, 940];
const D0 = 82, D1 = 139; // global frames the balance drains
const valueAt = (g: number) => ETH0 * (1 - interpolate(g, [D0, D1], [0, 1], { ...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1) }));

const Shot3a: React.FC<{ start: number; len: number }> = ({ start, len }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len], [0, 1], clamp);
  const q = t * 0.7 + out(t) * 0.3;
  const v = valueAt(f + start);
  const S = interpolate(q, [0, 1], [1.0, 1.28]);
  const fx = interpolate(q, [0, 1], [600, 520]);
  const rot = interpolate(q, [0, 1], [-2.4, 0.4]);
  const at = w2s(300, 1050, S, fx, PLATE_C[1], rot);
  return (
    <AbsoluteFill>
      <Cam2D S={S} fx={fx} fy={PLATE_C[1]} rot={rot}><Plate value={v} frac={v / ETH0} /></Cam2D>
      <Callout text="DRAINING" at={at} label={[300, 1390]} startFrame={4} accent />
    </AbsoluteFill>
  );
};
const Shot3b: React.FC<{ start: number; len: number }> = ({ start, len }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len], [0, 1], clamp);
  const q = t * 0.7 + out(t) * 0.3;
  const v = valueAt(f + start);
  const S = interpolate(q, [0, 1], [1.5, 1.65]);
  const fx = interpolate(q, [0, 1], [700, 440]);
  const rot = interpolate(q, [0, 1], [2.6, 0.6]);
  return (
    <AbsoluteFill>
      <Cam2D S={S} fx={fx} fy={interpolate(q, [0, 1], [930, 950])} rot={rot}><Plate value={v} frac={v / ETH0} /></Cam2D>
    </AbsoluteFill>
  );
};
const Shot4: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, len], [0, 1], clamp);
  const q = t * 0.7 + out(t) * 0.3;
  const S = interpolate(q, [0, 1], [1.12, 1.3]);
  const rot = interpolate(q, [0, 1], [-0.8, 0.8]);
  return (
    <AbsoluteFill>
      <Cam2D S={S} fx={interpolate(q, [0, 1], [500, 580])} fy={PLATE_C[1]} rot={rot}><Plate value={0} zero dim frac={0} /></Cam2D>
    </AbsoluteFill>
  );
};

/* =============================== scene =============================== */
const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 163;
  const cHanded = W(props, "handed", 0, 1.039);   // 31
  const cWhole = W(props, "whole", 0, 1.871);     // 56
  const c401 = W(props, "401,000", 0, 2.733);     // 82
  const cGone = W(props, "gone", 0, 4.657);       // 140
  const cMid = Math.round((c401 + cGone) / 2);    // 111
  const cSigned = W(props, "really", 0, 0.394);

  const shot2a: Shot = { from: [-2.9, 1.9, 7.6], to: [-0.4, 1.7, 7.0], tFrom: [-2.5, 1.5, 0], tTo: [0.0, 1.5, 0], fov: 32, len: cWhole - cHanded };
  const shot2b: Shot = { from: [5.9, 1.0, 6.4], to: [4.1, 1.5, 5.2], tFrom: [2.0, 1.5, 0], tTo: [2.6, 1.5, 0], fov: 34, len: c401 - cWhole };

  const ticks: number[] = [];
  for (let k = c401 + 3; k < cGone - 2; k += 4) if (k !== cMid && k !== cMid + 1) ticks.push(k);

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cHanded} layout="none"><Shot1 chipAt={Math.max(cSigned - 8, 4)} len={cHanded} /></Sequence>
      <Sequence from={cHanded} durationInFrames={cWhole - cHanded} layout="none"><Shot2 shot={shot2a} start={cHanded} /></Sequence>
      <Sequence from={cWhole} durationInFrames={c401 - cWhole} layout="none"><Shot2 shot={shot2b} start={cWhole} callAt={8} /></Sequence>
      <Sequence from={c401} durationInFrames={cMid - c401} layout="none"><Shot3a start={c401} len={cMid - c401} /></Sequence>
      <Sequence from={cMid} durationInFrames={cGone - cMid} layout="none"><Shot3b start={cMid} len={cGone - cMid} /></Sequence>
      <Sequence from={cGone} durationInFrames={total - cGone} layout="none"><Shot4 len={total - cGone} /></Sequence>

      {/* SFX: whoosh on cuts, soft ticks under the draining balance, thud when the lock lands, silence on "gone" */}
      {[cHanded, cWhole, c401, cMid].map((f, i) => <Sfx key={f} name="whoosh_soft" at={f} volume={i === 0 ? 0.3 : 0.25} />)}
      {[3, 9, 15, 21].map((f) => <Sfx key={`ty${f}`} name="type" at={f} volume={0.18} />)}
      <Sfx name="thud" at={T1 + 1} volume={0.45} />
      {ticks.map((f) => <Sfx key={`t${f}`} name="tick" at={f} volume={0.12} />)}

      <Disclaimer text={`Illustration · ${STORY.eth} ETH per NCC Group`} />
    </Shell>
  );
};

export default Scene;
