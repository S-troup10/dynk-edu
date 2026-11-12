// S11 "So his bitcoin was never lost. It's exactly where it always was. Just locked." (159 f)
//  1 f0–"It's"   3D slow push toward the LedgerWall, hot box centre; callout 8,000 BTC
//  2 "It's"–"Just" 3D hero glowing Letterbox (60 coins) arcing slowly; caps UNMOVED SINCE 2013
//  3 "Just"–end  3D macro on keyhole plate, orange glow fades out (no key), camera easing in; thud on "locked"
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Letterbox, LedgerWall, wallPos, project, Sfx, W, clamp, ORANGE, type Shot, type Vec3 } from "./_shared";

const outC = Easing.out(Easing.cubic);
const ROWS = 6, COLS = 11, HOT = 3 * COLS + 5;

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const hp = wallPos(ROWS, COLS, HOT);
  const [x, y] = project(shot, f, hp);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <LedgerWall rows={ROWS} cols={COLS} hot={HOT} />
      </Studio3D>
      <Callout text="8,000 BTC" at={[x + 52, y - 40]} label={[x + 250, y - 250]} startFrame={8} accent />
    </AbsoluteFill>
  );
};

const ShotB: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const t = outC(interpolate(f, [4, 16], [0, 1], clamp));
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox coins={60} glow />
      </Studio3D>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1395, textAlign: "center", fontFamily: brand.body, fontWeight: 700,
        fontSize: 30, letterSpacing: 7, color: "rgba(255,255,255,0.92)", opacity: t, transform: `translateY(${(1 - t) * 12}px)` }}>
        UNMOVED SINCE 2013
      </div>
    </AbsoluteFill>
  );
};

const KeyholeFade: React.FC = () => {
  const f = useCurrentFrame();
  const g = 1 - outC(interpolate(f, [4, 19], [0, 1], clamp));
  const base: Vec3 = [0.38, 1.1, 0.438];
  const mat = (o: number, e: number) => (
    <meshStandardMaterial color={ORANGE} emissive="#FF6A00" emissiveIntensity={e} transparent opacity={o} toneMapped={false} depthWrite={false} />
  );
  return (
    <group position={base}>
      <mesh renderOrder={8}><boxGeometry args={[0.26, 0.36, 0.004]} />{mat(g, 0.9)}</mesh>
      <mesh position={[0, 0.03, 0.004]} rotation={[Math.PI / 2, 0, 0]} renderOrder={9}><cylinderGeometry args={[0.035, 0.035, 0.004, 20]} />
        <meshStandardMaterial color="#FFB060" emissive="#FF6A00" emissiveIntensity={2} transparent opacity={g} toneMapped={false} depthWrite={false} /></mesh>
      <mesh position={[0, -0.04, 0.004]} renderOrder={9}><boxGeometry args={[0.026, 0.1, 0.004]} />
        <meshStandardMaterial color="#FFB060" emissive="#FF6A00" emissiveIntensity={2} transparent opacity={g} toneMapped={false} depthWrite={false} /></mesh>
      <pointLight position={[0, 0, 0.3]} color={ORANGE} intensity={2.2 * g} distance={2.5} />
    </group>
  );
};

const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill>
    <Studio3D tone="dark" camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <Letterbox coins={60} />
      <KeyholeFade />
    </Studio3D>
  </AbsoluteFill>
);

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 159;
  const c2 = Math.max(40, W(props, "it's", 0, 1.96) - 1);
  const c3 = Math.max(c2 + 40, W(props, "just", 0, 4.03));
  const a: Shot = { from: [0.5, 2.6, 10], to: [0, 2.51, 6.6], tFrom: [0, 2.51, 0], tTo: [0, 2.51, 0], fov: 30, len: c2 };
  const b: Shot = { from: [-2.6, 1.55, 5.6], to: [2.2, 1.45, 5.5], tFrom: [0, 1.2, 0], tTo: [0, 1.2, 0], fov: 30, len: c3 - c2 };
  const c: Shot = { from: [0.75, 1.3, 2.3], to: [0.5, 1.15, 1.8], tFrom: [0.38, 1.1, 0.43], tTo: [0.38, 1.1, 0.43], fov: 30, len: total - c3 };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={c2} layout="none"><ShotA shot={a} /></Sequence>
      <Sequence from={c2} durationInFrames={c3 - c2} layout="none"><ShotB shot={b} /></Sequence>
      <Sequence from={c3} durationInFrames={total - c3} layout="none"><ShotC shot={c} /></Sequence>
      <Sfx name="whoosh_soft" at={c2} volume={0.28} />
      <Sfx name="whoosh_soft" at={c3} volume={0.28} />
      <Sfx name="thud" at={W(props, "locked.", 0, 4.4)} volume={0.4} />
      <Disclaimer text="Illustration · simplified" />
    </Shell>
  );
};
export default Scene;
