// Scene: 2026-10-29-91m-twelve-words S02 — "Nobody hacked him. Nobody guessed his keys. Nobody could."
// Four hard-cut 3D shots, one per "Nobody" (the middle one is split in two angles to keep the pace):
//  A f0–38   chrome Padlock, closed + intact, camera orbiting fast. Callout NOT HACKED.
//  B f38–62  the 12 orange tiles rise, camera tracking across at mid distance. Callout 12 WORDS (on "guessed").
//  C f62–86  closer, tracking back the other way, same callout carried over.
//  D f86–end macro on the centre column, three tiles spinning like slot reels, never settling. GUESSES: 0 MATCHES.
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Padlock, Callout, Disclaimer, type SceneProps } from "../../kit";
import { BIP39 } from "./bip39";
import { PHRASE, PhraseGrid, WordTile, CamRig, project, Sfx, W, clamp, type Shot, type Vec3 } from "./_shared";

const out = Easing.out(Easing.cubic);

/* ---------- shots (cameras) ---------- */
const LOCK_Y = 1.15; // visual centre of the padlock
const shotA = (len: number): Shot => ({ from: [-8.5, 2.8, 8.0], to: [7.5, 2.0, 9.0], tFrom: [0, LOCK_Y, 0], tTo: [0, LOCK_Y, 0], fov: 30, len });
const shotB = (len: number): Shot => ({ from: [-2.6, 2.6, 15.0], to: [1.2, 2.2, 13.0], tFrom: [-1.0, 1.25, 0], tTo: [0.8, 1.25, 0], fov: 32, len });
const shotC = (len: number): Shot => ({ from: [3.2, 2.0, 11.0], to: [-1.6, 2.1, 9.8], tFrom: [1.6, 1.3, 0], tTo: [-0.8, 1.3, 0], fov: 30, len });
const shotD = (len: number): Shot => ({ from: [-1.2, 1.8, 9.2], to: [0.8, 1.5, 7.6], tFrom: [-0.4, 1.45, 0], tTo: [0.3, 1.35, 0], fov: 30, len });

/** Callout whose label hangs off the tracked point; kept out of the caption band (y < 430 is clamped). */
const Track: React.FC<{ text: string; shot: Shot; part: Vec3; start: number; dx?: number; dy?: number; accent?: boolean }> = ({ text, shot, part, start, dx = 180, dy = -190, accent }) => {
  const f = useCurrentFrame();
  const at = project(shot, f, part);
  const lx = Math.min(900, Math.max(180, at[0] + dx));
  const ly = Math.max(470, at[1] + dy);
  return <Callout text={text} at={at} label={[lx, ly]} startFrame={start} accent={accent} />;
};

/* ---------- A: padlock ---------- */
const ShotA: React.FC<{ len: number; calloutAt: number }> = ({ len, calloutAt }) => {
  const shot = shotA(len);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Padlock position={[0, 0.72, 0]} scale={1.2} />
      </Studio3D>
      <Track text="NOT HACKED" shot={shot} part={[0.54, 1.62, 0]} start={calloutAt} accent dx={300} dy={-150} />
    </AbsoluteFill>
  );
};

/* ---------- B / C: the 12 orange tiles ---------- */
const GridShot: React.FC<{ shot: Shot; calloutAt: number; riseFrames?: number }> = ({ shot, calloutAt, riseFrames }) => {
  const f = useCurrentFrame();
  const rise = riseFrames ? interpolate(f, [0, riseFrames], [0.3, 1], { ...clamp, easing: out }) : 1;
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <PhraseGrid glow="all" rise={rise} />
      </Studio3D>
      <Track text="12 WORDS" shot={shot} part={[0, 2.5, 0]} start={calloutAt} dx={0} dy={-230} />
    </AbsoluteFill>
  );
};

/* ---------- D: slot-reel macro ---------- */
const SPIN_TILES = [1, 4, 7]; // centre column, top three rows
const ShotD: React.FC<{ len: number; calloutAt: number }> = ({ len, calloutAt }) => {
  const f = useCurrentFrame();
  const shot = shotD(len);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <group position={[0, 0, 0]}>
          {PHRASE.map((w, i) => {
            const col = i % 3, row = Math.floor(i / 3);
            const pos: Vec3 = [(col - 1) * 1.75, (1.5 - row) * 0.62 + 1.2, 0];
            const k = SPIN_TILES.indexOf(i);
            if (k < 0) return <WordTile key={i} word={w} index={i + 1} position={pos} glow />;
            const turns = (f + 6) * (0.085 + k * 0.012) + k * 0.31; // fast, never lands
            const word = BIP39[(Math.floor(f / 2) * 389 + i * 211 + k * 97) % 2048];
            return <WordTile key={i} word={w} index={i + 1} position={pos} glow spin={turns} spinWord={word} />;
          })}
        </group>
      </Studio3D>
      <Track text="GUESSES: 0 MATCHES" shot={shot} part={[0, 2.4, 0]} start={calloutAt} dx={0} dy={-260} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 118;
  const cutB = W(props, "nobody", 1, 1.254) + 0; // 38
  const cutC = 62;
  const cutD = W(props, "nobody", 2, 2.883); // 86
  const fHacked = W(props, "hacked", 0, 0.477);
  const fGuessed = W(props, "guessed", 0, 1.791);
  const fCould = W(props, "could", 0, 3.506);

  const ticks: number[] = [];
  for (let t = cutD + 4; t < total - 2; t += 4) ticks.push(t);

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutB} layout="none">
        <ShotA len={cutB} calloutAt={fHacked - 0} />
      </Sequence>
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none">
        <GridShot shot={shotB(cutC - cutB)} calloutAt={fGuessed - cutB} riseFrames={8} />
      </Sequence>
      <Sequence from={cutC} durationInFrames={cutD - cutC} layout="none">
        <GridShot shot={shotC(cutD - cutC)} calloutAt={fGuessed - cutC} />
      </Sequence>
      <Sequence from={cutD} durationInFrames={total - cutD} layout="none">
        <ShotD len={total - cutD} calloutAt={fCould - cutD - 14} />
      </Sequence>

      <Disclaimer text="Magnified illustration · words are random" />

      {/* SFX: soft whoosh on each cut, one click as the lock reads "hacked", ticks under the spin */}
      <Sfx name="click" at={fHacked} volume={0.25} />
      <Sfx name="whoosh_soft" at={cutB} volume={0.3} />
      <Sfx name="whoosh_soft" at={cutC} volume={0.25} />
      <Sfx name="whoosh_soft" at={cutD} volume={0.3} />
      {ticks.map((t) => (
        <Sfx key={t} name="tick" at={t} volume={0.22} />
      ))}
    </Shell>
  );
};

export default Scene;
