// Scene: 2026-10-29-91m-twelve-words S10 — "So nobody can crack your twelve words. They can only be handed over."
// Four hard cuts, all 3D, one orange system (the 12 tiles):
//  A f0–30   orbit the grid, three tiles flicker-spin (slot reels) and snap back to the true word
//  B f30–62  macro on two tiles, same bounce-off ("crack"), callout UNCRACKABLE
//  C f62–98  tiles slide off, one after another, toward a dark clay Person in the gloom; camera tracks right
//  D f98–end close on the pile arriving at the Person, callout HANDED OVER on the first tile to arrive
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, Mat, type SceneProps } from "../../kit";
import { CamRig, project, rand, Sfx, W, WordTile, PHRASE, clamp, type Shot, type Vec3 } from "./_shared";
import { BIP39 } from "./bip39";

const CUT_B = 30, CUT_C = 62, CUT_D = 98;
const PERSON: Vec3 = [8.3, 0, -0.3];

/* ---------- tile layout ---------- */
const slot = (i: number): Vec3 => [((i % 3) - 1) * 1.75, (1.5 - Math.floor(i / 3)) * 0.62 + 1.2, 0];
const pile = (i: number): Vec3 => [5.7 + ((i % 3) - 1) * 1.05, (1.5 - Math.floor(i / 3)) * 0.4 + 1.5, 0];
// hand-over order: right column first (closest to the Person), top to bottom
const ORDER = [2, 5, 8, 11, 1, 4, 7, 10, 0, 3, 6, 9];
const rank = (i: number) => ORDER.indexOf(i);
const HAND_START = 70, HAND_STEP = 2.3, HAND_LEN = 16;
const handStart = (i: number) => HAND_START + rank(i) * HAND_STEP;
const arrivedAt = (i: number) => handStart(i) + HAND_LEN;

// flicker-spin windows (global frames): start, length
const SPINS: Record<number, [number, number]> = { 1: [-5, 15], 8: [8, 14], 10: [14, 14], 3: [32, 14], 4: [38, 14], 5: [44, 14] };

const Tiles: React.FC<{ g: number }> = ({ g }) => (
  <>
    {PHRASE.map((word, i) => {
      const base = slot(i);
      let pos: Vec3 = [...base];
      let scale = 1;
      let ry = 0;
      // hand-over travel
      const u = interpolate(g, [handStart(i), handStart(i) + HAND_LEN], [0, 1], clamp);
      if (u > 0) {
        const e = Easing.inOut(Easing.cubic)(u);
        const t = pile(i);
        pos = [base[0] + (t[0] - base[0]) * e, base[1] + (t[1] - base[1]) * e, Math.sin(Math.PI * e) * 0.6];
        scale = 1 + (0.62 - 1) * e;
        ry = -0.18 * Math.sin(Math.PI * e);
      }
      // slot-reel flicker-spin that snaps back to the true word
      let spin = 0;
      let spinWord: string | undefined;
      const sp = SPINS[i];
      if (sp) {
        const s = interpolate(g, [sp[0], sp[0] + sp[1]], [0, 1], clamp);
        if (s > 0 && s < 1) {
          spin = Easing.out(Easing.cubic)(s) * 2;
          spinWord = BIP39[Math.floor(rand(i * 131 + g * 7.3) * 2048)];
          pos = [pos[0], pos[1], pos[2] - 0.35 * Math.sin(Math.PI * s)]; // shoved back, then settles
        }
      }
      return <WordTile key={i} word={word} index={i + 1} position={pos} rotation={[0, ry, 0]} glow scale={scale} spin={spin} spinWord={spinWord} />;
    })}
  </>
);

/* ---------- cameras ---------- */
const shotA: Shot = { from: [-4.5, 2.2, 15.2], to: [4.2, 1.9, 15.2], tFrom: [-0.3, 1.4, 0], tTo: [0.3, 1.4, 0], fov: 32, len: CUT_B };
const shotB: Shot = { from: [-2.4, 1.9, 12.4], to: [-0.2, 1.7, 10.6], tFrom: [-1.2, 1.5, 0], tTo: [-0.6, 1.5, 0], fov: 30, len: CUT_C - CUT_B };
const shotC: Shot = { from: [0.5, 2.3, 19.5], to: [5.4, 2.0, 17.5], tFrom: [0.8, 1.4, 0], tTo: [5.0, 1.5, 0], fov: 33, len: CUT_D - CUT_C };
const shotD: Shot = { from: [3.0, 1.2, 13.4], to: [4.6, 1.5, 12.2], tFrom: [6.0, 1.6, 0], tTo: [6.5, 1.7, 0], fov: 32, len: 40 };

/** dark clay person silhouette standing in the gloom */
const Silhouette: React.FC<{ position: Vec3; scale: number }> = ({ position, scale }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.6, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat kind="clay" color="#2b2c30" /></mesh>
    <mesh position={[0, 1.45, 0]}><sphereGeometry args={[0.32, 64, 32]} /><Mat kind="clay" color="#2b2c30" /></mesh>
  </group>
);

const ShotFrame: React.FC<{ shot: Shot; offset: number; person?: boolean; children?: React.ReactNode }> = ({ shot, offset, person, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Tiles g={f + offset} />
        {person && <Silhouette position={PERSON} scale={1.7} />}
      </Studio3D>
      {children}
    </AbsoluteFill>
  );
};

const CalloutB: React.FC = () => {
  const f = useCurrentFrame();
  const p = project(shotB, f, [slot(4)[0] - 0.1, slot(4)[1] + 0.27, 0]);
  return <Callout text="UNCRACKABLE" at={p} label={[Math.min(Math.max(p[0] + 60, 380), 760), p[1] - 210]} startFrame={0} />;
};

const CalloutD: React.FC = () => {
  const f = useCurrentFrame();
  const t = pile(2);
  const p = project(shotD, f, [t[0] - 0.2, t[1] + 0.12, 0.1]);
  return <Callout text="HANDED OVER" at={p} label={[p[0] - 40, p[1] - 200]} startFrame={0} />;
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 125;
  const fCrack = W(props, "crack", 0, 0.994);
  const fHanded = W(props, "handed", 0, 3.27);
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={CUT_B} layout="none">
        <ShotFrame shot={shotA} offset={0} />
      </Sequence>
      <Sequence from={CUT_B} durationInFrames={CUT_C - CUT_B} layout="none">
        <ShotFrame shot={shotB} offset={CUT_B}>
          <CalloutB />
        </ShotFrame>
      </Sequence>
      <Sequence from={CUT_C} durationInFrames={CUT_D - CUT_C} layout="none">
        <ShotFrame shot={shotC} offset={CUT_C} person />
      </Sequence>
      <Sequence from={CUT_D} durationInFrames={total - CUT_D} layout="none">
        <ShotFrame shot={shotD} offset={CUT_D} person>
          <CalloutD />
        </ShotFrame>
      </Sequence>

      {/* flicker ticks, snaps, cuts */}
      <Sfx name="tick" at={3} volume={0.22} />
      <Sfx name="tick" at={10} volume={0.22} />
      <Sfx name="tick" at={17} volume={0.22} />
      <Sfx name="whoosh_soft" at={fCrack} volume={0.3} />
      <Sfx name="tick" at={36} volume={0.22} />
      <Sfx name="click" at={46} volume={0.3} />
      <Sfx name="click" at={52} volume={0.3} />
      <Sfx name="whoosh_soft" at={CUT_C} volume={0.3} />
      <Sfx name="click" at={Math.round(arrivedAt(2))} volume={0.25} />
      <Sfx name="whoosh_soft" at={fHanded} volume={0.25} />

      <Disclaimer text="Magnified illustration · words are random" />
    </Shell>
  );
};

export default Scene;
