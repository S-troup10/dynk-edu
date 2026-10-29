// Scene: 2026-10-29-next S09 — FACT: irreversible.
// "Once it's sent, no bank can pull it back."
// Phone (Send screen) upper-left, a short lookalike TileRow fragment (FAKE: first 6 + last 4) lower-right.
// The orange coin leaves the phone on "sent", lands on the fake row (~1.3 s) and goes grey; on "back" the row
// and coin dissolve into the dark and nothing returns. Camera: wide 3/4 following the arc, cut at 1.4 s to a
// low close on the row as it fades. Callout IRREVERSIBLE on "pull".
import React, { useLayoutEffect, useRef } from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import * as THREE from "three";
import { Shell, Studio3D, Phone, ArcTravel, Coin, Enter, Callout, Disclaimer, type SceneProps } from "../../kit";
import { FAKE, UI, Tile } from "./_shared";

type Vec3 = [number, number, number];
const S = 30;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const wordAt = (props: SceneProps, w: string, fallback: number) => {
  const hit = props.vo?.words?.find((x) => x.text.toLowerCase().replace(/[^a-z']/g, "") === w);
  return Math.round((hit?.start ?? fallback) * S);
};

/** FadeGroup: multiplies the opacity of every material under it (works on kit objects with no opacity prop). */
const FadeGroup: React.FC<{ opacity: number; children: React.ReactNode }> = ({ opacity, children }) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!m) return;
      (Array.isArray(m) ? m : [m]).forEach((mm) => {
        mm.transparent = opacity < 0.999;
        mm.opacity = opacity;
      });
    });
  });
  return <group ref={ref} visible={opacity > 0.01}>{children}</group>;
};

// Row fragment layout: 6 tiles "0x7A3f", an ellipsis gap, 4 tiles "9c2E". Local x, tile gap 0.46.
const GAP = 0.46;
const ELLIPSIS = 0.7;
const FRAG = [0, 1, 2, 3, 4, 5, 38, 39, 40, 41];
const SPAN = 9 * GAP + ELLIPSIS;
const fragX = (k: number) => k * GAP + (k >= 6 ? ELLIPSIS : 0) - SPAN / 2;

const RowFragment: React.FC = () => (
  <group>
    {FRAG.map((ci, k) => (
      <Tile key={ci} ch={FAKE[ci]} position={[fragX(k), 0.25, 0]} />
    ))}
    {[0, 1, 2].map((d) => (
      <mesh key={d} position={[(fragX(5) + fragX(6)) / 2 + (d - 1) * 0.14, 0.12, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#5a5b60" metalness={0.4} roughness={0.4} />
      </mesh>
    ))}
  </group>
);

// World placement
const PHONE_POS: Vec3 = [-0.62, 1.75, -1.1];
const PHONE_SCALE = 0.72;
const ROW_POS: Vec3 = [0.05, 0, 1.25];
const ROW_SCALE = 0.55;
const ROW_ROT = -0.32;
const COIN_FROM: Vec3 = [-0.55, 1.95, -1.0];
// landing point: on top of the row, over the last-4 group
const landLocalX = fragX(7.5);
const COIN_TO: Vec3 = [
  ROW_POS[0] + Math.cos(ROW_ROT) * landLocalX * ROW_SCALE,
  ROW_POS[1] + 0.55 * ROW_SCALE + 0.03,
  ROW_POS[2] - Math.sin(ROW_ROT) * landLocalX * ROW_SCALE,
];

// ArcTravel's coin is r=0.32; scale the whole arc so the coin matches the 0.55-scale tiles.
const CS = 0.62;
const div = (v: Vec3): Vec3 => [v[0] / CS, v[1] / CS, v[2] / CS];

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const fSent = wordAt(props, "sent", 0.421); // 13
  const fPull = wordAt(props, "pull", 1.735); // 52
  const fBack = wordAt(props, "back", 2.015); // 60
  const fLand = 39; // ~1.3 s, just before the thud SFX at 1.4 s
  const fCut = 42; // 1.4 s

  const p = Easing.inOut(Easing.quad)(interpolate(f, [fSent, fLand], [0, 1], clamp));
  const landed = f >= fLand;
  // after landing the coin settles (small bounce) and turns grey
  const settle = landed ? Math.exp(-(f - fLand) / 4) * Math.sin((f - fLand) / 2.2) * 0.06 : 0;
  // dissolve on "back"
  const fade = 1 - 0.85 * Easing.inOut(Easing.sin)(interpolate(f, [fBack, 110], [0, 1], clamp));
  const sink = (1 - fade) * 0.25;

  const camA = { from: [0.1, 2.4, 12.4] as Vec3, to: [0.8, 2.1, 11.2] as Vec3, target: [-0.05, 1.15, 0.2] as Vec3, fov: 32, startFrame: 0, durationFrames: fCut };
  const camB = { from: [4.6, 1.3, 8.4] as Vec3, to: [3.9, 1.05, 7.6] as Vec3, target: [0.05, 0.3, 1.25] as Vec3, fov: 30, startFrame: fCut, durationFrames: 99 - fCut };
  const cam = f < fCut ? camA : camB;

  return (
    <Shell props={props} tone="dark">
      <Studio3D tone="dark" camera={cam}>
        {f < fCut && (
        <Enter at={-8} position={PHONE_POS} from={[0, -0.3, 0]} float={0.03}>
          <Phone screen={UI.send} position={[0, 0, 0]} rotation={[0, 0.28, 0]} scale={PHONE_SCALE} />
        </Enter>
        )}

        <group position={[ROW_POS[0], ROW_POS[1] - sink, ROW_POS[2] - sink * 1.4]} rotation={[0, ROW_ROT, 0]} scale={ROW_SCALE}>
          <FadeGroup opacity={fade}>
            <RowFragment />
          </FadeGroup>
        </group>

        {/* the one thing happening: the coin in flight (orange until it lands) */}
        {!landed && f >= fSent && (
          <group scale={CS}>
            <ArcTravel from={div(COIN_FROM)} to={div(COIN_TO)} p={p} height={1.1 / CS} accent trail />
          </group>
        )}
        {landed && (
          <group position={[COIN_TO[0], COIN_TO[1] + 0.02 + Math.abs(settle) - sink, COIN_TO[2] - sink * 1.4]}>
            <FadeGroup opacity={fade}>
              <Coin radius={0.32 * CS} mat="chrome" position={[0, 0, 0]} rotation={[0, 0.6, 0]} />
            </FadeGroup>
          </group>
        )}
      </Studio3D>

      {f >= fCut && (
        <Callout text="IRREVERSIBLE" at={[610, 1090]} label={[540, 1330]} startFrame={fPull} tone="dark" size={26} />
      )}
      <Disclaimer text="Magnified illustration" tone="dark" />
    </Shell>
  );
};

export default Scene;
