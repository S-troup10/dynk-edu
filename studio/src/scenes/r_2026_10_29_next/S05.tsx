// Scene: 2026-10-29-next S05 · MECHANISM: the generator churns out addresses
// VO: "A scammer's computer churns out addresses until one starts and ends like yours."
// A graphite GENERATOR block spits short grey tile fragments (random made-up hex) right→left.
// On "starts" the FAKE row stops dead in the centre; the REAL row ghosts in behind it;
// on "ends" only the FAKE row's first 4 + last 4 glow orange (the ONE accent), callout LOOKALIKE.
import React, { useLayoutEffect, useMemo } from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Shell, Studio3D, Mat, Callout, Disclaimer, type SceneProps } from "../../kit";
import { REAL, FAKE, Tile, TileRow, FIRST4, LAST4 } from "./_shared";

type Vec3 = [number, number, number];
const FPS = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerp3 = (a: Vec3, b: Vec3, p: number): Vec3 => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

/* ---------------- timing (from props.vo.words, with fallbacks) ---------------- */
const wordAt = (props: SceneProps, w: string, fallback: number) =>
  props.vo?.words?.find((x) => x.text.toLowerCase().replace(/[^a-z']/g, "") === w)?.start ?? fallback;

/* ---------------- world layout ---------------- */
const GAP = 0.46;
const EMIT_X = 4.5; // left (mouth) face of the generator block
const HERO_Y = 1.05;
const HERO_Z = 0;
const GHOST_Y = HERO_Y + 0.72;
const GHOST_Z = -0.9;
const LANES: { y: number; z: number; phase: number }[] = [
  { y: 0.4, z: 0.75, phase: 1.3 },
  { y: 1.72, z: 0.55, phase: 4.9 },
  { y: 1.05, z: -1.3, phase: 2.6 },
  { y: 2.38, z: -0.75, phase: 6.4 },
  { y: 0.42, z: -2.05, phase: 0.2 },
];
const LANE_PERIOD = 8.2; // distance between fragments in one lane
const FRAG_N = 6; // tiles per stream fragment
const FRAG_W = FRAG_N * GAP;

/** Hero layout: chars [0,7) … [37,42) of the address, compact with an ellipsis between. */
const HERO_IDX = [0, 1, 2, 3, 4, 5, 6, 37, 38, 39, 40, 41];
const ELLIPSIS = 0.78;
const heroLocalX = (k: number) => {
  const raw = k * GAP + (k >= 7 ? ELLIPSIS : 0);
  const total = 11 * GAP + ELLIPSIS;
  return raw - total / 2;
};
const HERO_HALF = (11 * GAP + ELLIPSIS) / 2 + 0.2;

/* deterministic made-up hex */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const HEX = "0123456789abcdefABCDEF";
const randAddr = (r: () => number) => "0x" + Array.from({ length: 40 }, () => HEX[Math.floor(r() * HEX.length)]).join("");

/* ---------------- stream speed profile → distance travelled s(frame) ---------------- */
const useDistance = (churnF: number, total: number) =>
  useMemo(() => {
    const s: number[] = [0];
    for (let f = 1; f <= total + 2; f++) {
      const v = interpolate(f, [churnF - 2, churnF + 8], [1.6, 9.5], clamp);
      s.push(s[f - 1] + v / FPS);
    }
    return s;
  }, [churnF, total]);

/* ---------------- camera: hard-cut shots, each with its own move ---------------- */
type Shot = { start: number; end: number; from: Vec3; to: Vec3; tFrom: Vec3; tTo: Vec3; fov: number };
const camAt = (shots: Shot[], f: number) => {
  const s = [...shots].reverse().find((x) => f >= x.start) ?? shots[0];
  const p = ease(interpolate(f, [s.start, s.end], [0, 1], clamp));
  return { pos: lerp3(s.from, s.to, p), target: lerp3(s.tFrom, s.tTo, p), fov: s.fov };
};

const CamRig: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camAt(shots, f);
    camera.position.set(...c.pos);
    (camera as THREE.PerspectiveCamera).fov = c.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...c.target);
  });
  return null;
};

/** world → screen px for 2D callouts (same camera maths as CamRig). */
const project = (shots: Shot[], f: number, p: Vec3): [number, number] => {
  const c = camAt(shots, f);
  const cam = new THREE.PerspectiveCamera(c.fov, 1080 / 1920, 0.1, 200);
  cam.position.set(...c.pos);
  cam.lookAt(...c.target);
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(cam);
  return [Math.round((v.x * 0.5 + 0.5) * 1080), Math.round((-v.y * 0.5 + 0.5) * 1920)];
};

/* ---------------- GENERATOR: graphite block with lane slots (kit candidate) ---------------- */
const Generator: React.FC<{ f: number }> = ({ f }) => {
  const W = 5, H = 3.0, D = 4.2;
  const cx = EMIT_X + W / 2, cz = -0.65;
  const hum = Math.sin(f / 3.2) * 0.004;
  return (
    <group position={[cx, H / 2 + hum, cz]}>
      <RoundedBox args={[W, H, D]} radius={0.12} smoothness={3}>
        <Mat kind="graphite" />
      </RoundedBox>
      {/* chrome lip around the mouth */}
      <mesh position={[-W / 2 - 0.02, 0, 0]}>
        <boxGeometry args={[0.06, H - 0.1, D - 0.1]} />
        <Mat kind="chrome" />
      </mesh>
      {/* one dark aperture per lane + the hero lane */}
      {[...LANES, { y: HERO_Y, z: HERO_Z }].map((l, i) => (
        <mesh key={i} position={[-W / 2 - 0.06, l.y - H / 2, l.z - cz]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.62, 0.62]} />
          <meshStandardMaterial color="#050506" roughness={0.9} metalness={0} />
        </mesh>
      ))}
      {/* vent ribs on the side facing camera */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`r${i}`} position={[-W / 2 + 0.7 + i * 0.6, 0.9, D / 2 + 0.01]}>
          <boxGeometry args={[0.08, 0.9, 0.03]} />
          <Mat kind="chrome" />
        </mesh>
      ))}
    </group>
  );
};

/* ---------------- the scene ---------------- */
const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const total = props.durationInFrames ?? 160;
  const fComputer = Math.round(wordAt(props, "computer", 0.663) * FPS); // 20
  const fChurn = Math.round(wordAt(props, "churns", 1.122) * FPS); // 34
  const fStarts = Math.round(wordAt(props, "starts", 2.793) * FPS); // 84
  const fEnds = Math.round(wordAt(props, "ends", 3.737) * FPS); // 112
  const fYours = Math.round(wordAt(props, "yours", 4.107) * FPS); // 123

  const dist = useDistance(fChurn, total);
  const s = dist[Math.min(f, dist.length - 1)];
  const sCut = dist[Math.min(fStarts - 10, dist.length - 1)]; // no new fragments after this

  const shots: Shot[] = useMemo(
    () => [
      // A · low macro at the generator mouth, rows nosing out slowly
      { start: 0, end: fChurn, from: [2.35, 0.7, 3.5], to: [2.0, 0.8, 3.2], tFrom: [4.3, 1.05, -0.2], tTo: [3.9, 1.1, -0.3], fov: 32 },
      // B · wider 3/4 from the right as the rows stream past at speed
      { start: fChurn, end: fStarts, from: [8.6, 2.7, 8.2], to: [7.6, 2.35, 9.0], tFrom: [1.2, 1.25, -0.6], tTo: [0.6, 1.2, -0.6], fov: 32 },
      // C · hard cut close on the stopped row's start, track right + pull out until both ends show
      { start: fStarts, end: fYours, from: [-2.2, 1.15, 4.6], to: [0, 1.55, 18.5], tFrom: [-2.2, 1.2, 0], tTo: [0, 1.4, -0.3], fov: 32 },
      // D · slow push in, gentle drift, both ends + ghost in frame
      { start: fYours, end: total + 10, from: [0, 1.55, 18.5], to: [0.35, 1.5, 17.0], tFrom: [0, 1.4, -0.3], tTo: [0.1, 1.38, -0.3], fov: 32 },
    ],
    [fChurn, fStarts, fYours, total],
  );

  /* stream fragments */
  const frags = useMemo(() => {
    const r = rng(505);
    return LANES.flatMap((lane, li) =>
      Array.from({ length: 6 }).map((_, k) => {
        const addr = randAddr(r);
        const a = 6 + Math.floor(r() * 26);
        return { li, k, addr, a, sEmerge: lane.phase + k * LANE_PERIOD - 3 * LANE_PERIOD };
      }),
    );
  }, []);
  const live = frags
    .map((fr) => {
      const lane = LANES[fr.li];
      // centre x: starts hidden inside the generator, travels left by the distance since it emerged
      const x = EMIT_X + FRAG_W / 2 + 0.2 - (s - fr.sEmerge);
      return { ...fr, x, lane };
    })
    .filter((fr) => fr.sEmerge <= sCut && fr.x < EMIT_X + FRAG_W / 2 + 0.3 && fr.x > -8);

  /* hero (FAKE) row: arrives on the stream, stops dead at x=0 on "starts" */
  const vHero = 9.5;
  const heroX = f < fStarts ? (vHero * (fStarts - f)) / FPS : 0;
  const settle = f >= fStarts ? Math.sin((f - fStarts) * 0.9) * Math.exp(-(f - fStarts) / 4) * 0.05 : 0;
  const heroVisible = heroX - HERO_HALF < EMIT_X + 0.1;
  const glowOn = f >= fEnds;
  const glowSet = glowOn ? [...FIRST4, ...LAST4] : [];

  /* ghost (REAL) row: drifts down in behind after the stop */
  const gIn = ease(interpolate(f, [fStarts + 6, fStarts + 24], [0, 1], clamp));

  /* callouts */
  const genPt = project(shots, Math.max(f, fComputer), [EMIT_X - 0.05, 2.35, 0.9]);
  const heroL = project(shots, Math.max(f, fEnds), [heroLocalX(3.5), HERO_Y + 0.28, HERO_Z]);
  const heroR = project(shots, Math.max(f, fEnds), [heroLocalX(9.5), HERO_Y + 0.28, HERO_Z]);

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={{ from: [0, 1.5, 15], to: [0, 1.5, 15], target: [0, 1.2, 0], fov: 32 }}>
        <CamRig shots={shots} />
        <Generator f={f} />

        {live.map((fr) => {
          const centreOffset = (fr.a + (FRAG_N - 1) / 2 - (REAL.length - 1) / 2) * GAP;
          return (
            <TileRow key={`${fr.li}-${fr.k}`} chars={fr.addr} only={[fr.a, fr.a + FRAG_N]}
              position={[fr.x - centreOffset, fr.lane.y, fr.lane.z]} />
          );
        })}

        {heroVisible && (
          <group position={[heroX + settle, HERO_Y, HERO_Z]} rotation={[0, 0, -settle * 0.6]}>
            {HERO_IDX.map((ci, k) => (
              <Tile key={ci} ch={FAKE[ci]} position={[heroLocalX(k), 0, 0]} glow={glowSet.includes(ci)} />
            ))}
            {[-1, 0, 1].map((d) => (
              <mesh key={d} position={[heroLocalX(6) + GAP / 2 + ELLIPSIS / 2 + d * 0.17, -0.16, 0]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                <Mat kind="chrome" />
              </mesh>
            ))}
          </group>
        )}

        {gIn > 0.001 && (
          <group position={[0, lerp(GHOST_Y + 1.4, GHOST_Y, gIn), GHOST_Z]} scale={0.0001 + 0.9999 * gIn}>
            {HERO_IDX.map((ci, k) => (
              <Tile key={ci} ch={REAL[ci]} position={[heroLocalX(k), 0, 0]} dim />
            ))}
            {[-1, 0, 1].map((d) => (
              <mesh key={d} position={[heroLocalX(6) + GAP / 2 + ELLIPSIS / 2 + d * 0.17, -0.16, 0]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                <Mat kind="graphite" />
              </mesh>
            ))}
          </group>
        )}
      </Studio3D>

      {/* GENERATOR on "computer", shown while the generator is on screen */}
      {f < fStarts && <Callout text="Generator" at={genPt} label={[Math.min(genPt[0] - 120, 760), Math.max(genPt[1] - 220, 470)]} startFrame={fComputer} />}
      {/* LOOKALIKE on "ends": leader to the glowing first-4 block, second dot on the last-4 block */}
      {f >= fEnds && (
        <>
          <Callout text="Lookalike" at={heroL} label={[540, Math.max(heroL[1] + 230, 1180)]} startFrame={fEnds} accent />
          <Callout text="" at={heroR} label={[540, Math.max(heroL[1] + 230, 1180)]} startFrame={fEnds} accent />
        </>
      )}
      <Disclaimer text="Magnified illustration · addresses are made up" tone="dark" />
    </Shell>
  );
};

export default Scene;
