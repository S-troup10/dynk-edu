// Scene: 2026-10-29-91m-twelve-words S03 — "Because your wallet comes down to twelve words, from a list of 2,048."
// Four hard-cut shots:
//  A (f0–31)    2D  phone "Recovery phrase" screen, 12 words pop in, camera pushes in           ("Because your wallet")
//  B (f31–74)   3D  the 12 tiles rise out of the floor, turn orange on "twelve", camera rising   ("comes down to twelve words")
//  C (f74–102)  3D  wall of 2,048 tiles, 12 orange ones scattered (alphabetical position), pull-back  ("from a list of")
//  D (f102–end) 3D  same wall, high angle, pulling back until it overflows; counter 0→2,048      ("2,048.")
// Orange system per shot: A = the numbers / newest word, B+C+D = the 12 phrase tiles.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, Counter, Mat, glyphTexture, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { PHRASE, PhraseGrid, CamRig, project, W, Sfx, ORANGE, clamp, rand, type Shot, type Vec3 } from "./_shared";
import { BIP39 } from "./bip39";

const out = Easing.out(Easing.cubic);

/* =====================  SHOT A — 2D phone, recovery phrase  ===================== */
const ShotA: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, len], [0, 1], clamp);
  const q = p * 0.75 + out(p) * 0.25; // never starts from rest
  const scale = 1 + 0.24 * q;
  const rotY = -9 + 8 * q;
  const rotX = 7 - 5 * q;
  const driftX = -22 + 40 * q;
  const driftY = 10 - 34 * q;
  const col = (i: number) => (i < 6 ? 0 : 1);
  const row = (i: number) => i % 6;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 48%, #1b1d21 0%, #0e0f11 70%)", perspective: 1700, perspectiveOrigin: "50% 45%" }}>
      <div
        style={{
          position: "absolute", left: 190, top: 420, width: 700, height: 1500, borderRadius: 78,
          background: "#0b0c0e", border: "3px solid #2b2d31", boxShadow: "0 40px 120px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.04)",
          transformOrigin: "50% 180px",
          transform: `translate(${driftX}px, ${driftY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
          fontFamily: brand.body, color: "#fff",
        }}
      >
        {/* island */}
        <div style={{ position: "absolute", left: 260, top: 22, width: 180, height: 40, borderRadius: 20, background: "#000", border: "1px solid #1d1f22" }} />
        <div style={{ position: "absolute", left: 48, top: 112, fontSize: 54, fontWeight: 600, letterSpacing: -0.5 }}>Recovery phrase</div>
        <div style={{ position: "absolute", left: 48, top: 182, width: 600, fontSize: 28, fontWeight: 400, lineHeight: 1.35, color: "rgba(255,255,255,0.55)" }}>
          Write these down. Never share them.
        </div>
        {PHRASE.map((w, i) => {
          const start = i * 2 - 8;
          const a = interpolate(f, [start, start + 5], [0, 1], { ...clamp, easing: out });
          const hot = interpolate(f, [start, start + 3, start + 10], [0, 1, 0], clamp); // newest word flashes orange outline
          const x = 44 + col(i) * 306;
          const y = 300 + row(i) * 98;
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: x, top: y, width: 292, height: 84, borderRadius: 22, background: "#16181b",
                border: `1.5px solid ${hot > 0.02 ? `rgba(255,128,0,${0.2 + 0.8 * hot})` : "#25272b"}`,
                display: "flex", alignItems: "center", gap: 18, paddingLeft: 24,
                opacity: a, transform: `translateY(${(1 - a) * 18}px) scale(${0.94 + 0.06 * a})`,
              }}
            >
              <span style={{ width: 34, fontSize: 24, fontWeight: 600, color: ORANGE, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
              <span style={{ fontSize: 36, fontWeight: 500, letterSpacing: 0.2 }}>{w}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* =====================  SHOT B — 12 tiles rise, go orange  ===================== */
const GRID_Y = 1.2;
const ShotB: React.FC<{ shot: Shot; glowAt: number; calloutAt: number }> = ({ shot, glowAt, calloutAt }) => {
  const f = useCurrentFrame();
  const rise = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const glowN = Math.max(0, Math.floor(f - glowAt) + 1); // one tile per frame, left→right, top→bottom
  const glow = Array.from({ length: Math.min(12, glowN) }, (_, i) => i);
  const at = project(shot, f, [0, GRID_Y + 0.93 + 0.27, 0]);
  const label: [number, number] = [Math.min(at[0] + 230, 800), Math.max(at[1] - 170, 470)];
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} accentRim camera={{ from: shot.to, target: shot.tTo, fov: shot.fov }}>
        <CamRig shot={shot} />
        <PhraseGrid rise={rise} glow={glow} />
      </Studio3D>
      <Callout text="RECOVERY PHRASE" at={at} label={label} startFrame={calloutAt} />
    </AbsoluteFill>
  );
};

/** dark scrims top (behind captions) and bottom (behind disclaimer / counter) so the busy wall never fights the type */
const Scrims: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 620, background: "linear-gradient(180deg, rgba(14,15,17,0.92) 0%, rgba(14,15,17,0.7) 45%, rgba(14,15,17,0) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(0deg, rgba(14,15,17,0.9) 0%, rgba(14,15,17,0.6) 55%, rgba(14,15,17,0) 100%)" }} />
  </AbsoluteFill>
);

/* =====================  SHOTS C + D — the 2,048-tile wall  ===================== */
const COLS = 32, ROWS = 64, PX = 0.64, PY = 0.34, WALL_CY = 11.5;
const cellPos = (col: number, row: number): Vec3 => [(col - (COLS - 1) / 2) * PX, WALL_CY + ((ROWS - 1) / 2 - row) * PY, 0];
const PHRASE_IDX = PHRASE.map((w) => BIP39.indexOf(w));

const WallBase: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current!;
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < COLS * ROWS; i++) {
      const [x, y] = cellPos(i % COLS, Math.floor(i / COLS));
      d.position.set(x, y, 0);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      const v = 0.82 + rand(i + 3) * 0.4;
      c.setRGB(0.055 * v, 0.058 * v, 0.066 * v);
      m.setColorAt(i, c);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);
  const tex = useMemo(() => {
    const cw = 128, ch = 64;
    const cv = document.createElement("canvas");
    cv.width = COLS * cw; cv.height = ROWS * ch;
    const g = cv.getContext("2d")!;
    g.font = "500 23px 'DejaVu Sans Mono', monospace";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(205,205,210,0.5)";
    for (let i = 0; i < COLS * ROWS; i++) g.fillText(BIP39[i], (i % COLS) * cw + cw / 2, Math.floor(i / COLS) * ch + ch / 2 + 2);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, COLS * ROWS]} frustumCulled={false}>
        <boxGeometry args={[0.6, 0.3, 0.05]} />
        <meshStandardMaterial color="#ffffff" metalness={0.35} roughness={0.5} />
      </instancedMesh>
      <mesh position={[0, WALL_CY, 0.027]}>
        <planeGeometry args={[COLS * PX, ROWS * PY]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const OrangeCell: React.FC<{ word: string; index: number; pop: number }> = ({ word, index, pop }) => {
  const tex = useMemo(
    () => glyphTexture(word, { font: "700 92px 'DejaVu Sans Mono', monospace", w: 640, h: 320, fg: "#0b0703", bg: ORANGE }),
    [word],
  );
  const [x, y] = cellPos(index % COLS, Math.floor(index / COLS));
  return (
    <group position={[x, y, 0.05]} scale={pop}>
      <RoundedBox args={[0.62, 0.31, 0.08]} radius={0.03} smoothness={2}>
        <Mat kind="accent" />
      </RoundedBox>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[0.58, 0.27]} />
        <meshStandardMaterial map={tex} emissive="#FF6A00" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
};

const Wall: React.FC<{ popStagger: boolean }> = ({ popStagger }) => {
  const f = useCurrentFrame();
  return (
    <>
      <WallBase />
      {PHRASE.map((w, i) => {
        const pop = popStagger ? interpolate(f, [i, i + 6], [0, 1.15], { ...clamp, easing: Easing.out(Easing.back(2)) }) : 1.15;
        return <OrangeCell key={i} word={w} index={PHRASE_IDX[i]} pop={pop} />;
      })}
    </>
  );
};

const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => {
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} floor={false} camera={{ from: shot.to, target: shot.tTo, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Wall popStagger />
      </Studio3D>
      <Scrims />
    </AbsoluteFill>
  );
};

const ShotD: React.FC<{ shot: Shot; calloutAt: number }> = ({ shot, calloutAt }) => {
  const f = useCurrentFrame();
  const fam = PHRASE_IDX[2];
  const at = project(shot, f, cellPos(fam % COLS, Math.floor(fam / COLS)));
  const label: [number, number] = [Math.min(at[0] + 250, 860), Math.max(at[1] - 230, 480)];
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} floor={false} camera={{ from: shot.to, target: shot.tTo, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Wall popStagger={false} />
      </Studio3D>
      <Scrims />
      <Callout text="2,048 WORDS" at={at} label={label} startFrame={calloutAt} />
      <AbsoluteFill style={{ filter: "drop-shadow(0 2px 14px rgba(0,0,0,0.9))" }}>
        <Counter from={0} to={2048} startFrame={0} durationFrames={26} y={1270} size={96} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =====================  SCENE  ===================== */
const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 139;
  const cB = W(props, "comes", 0, 1.04);      // 31
  const cC = W(props, "from", 0, 2.485);      // 74
  const cD = W(props, "2,048", 0, 3.418);     // 102
  const fTwelve = W(props, "twelve", 0, 1.8); // 54

  const shotB: Shot = { from: [0, 1.0, 15.5], to: [0, 6.2, 20.5], tFrom: [0, 1.15, 0], tTo: [0, 1.0, 0], fov: 34, len: cC - cB };
  // C: macro on "lizard" in the wall, pulling back and sliding left
  const liz = cellPos(PHRASE_IDX[8] % COLS, Math.floor(PHRASE_IDX[8] / COLS));
  const shotC: Shot = {
    from: [liz[0] + 0.7, liz[1] + 0.25, 4.4], to: [-1.5, WALL_CY + 1.5, 20],
    tFrom: [liz[0] + 0.1, liz[1] - 0.05, 0], tTo: [0, WALL_CY, 0], fov: 32, len: cD - cC,
  };
  // D: different angle (high, from the right), pulls back until the wall overflows the frame
  const shotD: Shot = { from: [9, WALL_CY + 7, 21], to: [3.5, WALL_CY + 2, 40], tFrom: [0.5, WALL_CY + 1, 0], tTo: [0, WALL_CY, 0], fov: 32, len: total - cD };

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cB} layout="none"><ShotA len={cB} /></Sequence>
      <Sequence from={cB} durationInFrames={cC - cB} layout="none"><ShotB shot={shotB} glowAt={fTwelve - cB} calloutAt={fTwelve - cB} /></Sequence>
      <Sequence from={cC} durationInFrames={cD - cC} layout="none"><ShotC shot={shotC} /></Sequence>
      <Sequence from={cD} durationInFrames={total - cD} layout="none"><ShotD shot={shotD} calloutAt={4} /></Sequence>
      <Disclaimer text="Illustration · BIP-39 word list" />
      <Sfx name="whoosh_soft" at={cB} volume={0.3} />
      <Sfx name="tick" at={fTwelve} volume={0.22} />
      <Sfx name="whoosh_soft" at={cC} volume={0.3} />
      <Sfx name="tick" at={cD} volume={0.25} />
    </Shell>
  );
};

export default Scene;
