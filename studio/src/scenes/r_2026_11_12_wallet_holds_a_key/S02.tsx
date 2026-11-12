// S02 "Not one coin ever left the blockchain. You could look at them right now." (122 f)
//  1 f0–cutB   3D  dolly sideways along the LedgerWall (6×11), hot box drifts in; callout THE BLOCKCHAIN = A PUBLIC LEDGER (Not one coin ever left)
//  2 cutB–cutC 2D  clean ledger list from LEDGER_ROWS, slow Cam2D scroll, his row orange + UNMOVED (You could look at them)
//  3 cutC–end  3D  macro on the glowing Letterbox glass, discs sharp; callout ANYONE CAN LOOK (right now.)
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { CamRig, Cam2D, LedgerWall, Letterbox, Sfx, W, wallPos, project, clamp, ORANGE, LEDGER_ROWS, type Shot, type Vec3 } from "./_shared";

const outC = Easing.out(Easing.cubic);
const ROWS = 6, COLS = 11, HOT = 2 * COLS + 8;
const MONO = "'DejaVu Sans Mono', monospace";

const ShotA: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const hp = wallPos(ROWS, COLS, HOT);
  // label tracks a point on the wall's top edge; callout label stays below the wall
  const anchor: Vec3 = [hp[0] - 1.45, 3.3, 0.25];
  const at = project(shot, f, anchor);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <LedgerWall rows={ROWS} cols={COLS} hot={HOT} position={[0, 0, 0]} />
      </Studio3D>
      <Callout text="THE BLOCKCHAIN = A PUBLIC LEDGER" at={at} label={[540, 1330]} startFrame={10} />
    </AbsoluteFill>
  );
};

const ShotB: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const enter = (a: number, b: number) => outC(interpolate(f, [a, b], [0, 1], clamp));
  const PITCH = 100, TOP = 500;
  return (
    <AbsoluteFill style={{ background: "#0d0e10" }}>
      <Cam2D shot={{ from: { x: 0, y: 36, s: 1.0 }, to: { x: 0, y: -24, s: 1.03 }, len }}>
        <div style={{ position: "absolute", left: 90, width: 900, top: 410, fontFamily: brand.body, fontWeight: 600, fontSize: 26, letterSpacing: 5,
          color: "rgba(255,255,255,0.45)", display: "flex", justifyContent: "space-between", opacity: enter(0, 6) }}>
          <span>ADDRESS</span><span>BALANCE (BTC)</span>
        </div>
        <div style={{ position: "absolute", left: 90, width: 900, top: 462, height: 2, background: "rgba(255,255,255,0.18)", opacity: enter(0, 6) }} />
        {LEDGER_ROWS.map((r, i) => {
          const e = enter(1 + i * 2, 7 + i * 2);
          const col = r.his ? ORANGE : "#e9e9e9";
          return (
            <div key={i} style={{ position: "absolute", left: 70, width: 940, top: TOP + i * PITCH, height: PITCH - 12, opacity: e,
              transform: `translate3d(0, ${(1 - e) * 14}px, 0)`, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 20px", boxSizing: "border-box", fontFamily: MONO, fontSize: 46, color: col, fontWeight: r.his ? 700 : 500,
              background: r.his ? "rgba(255,128,0,0.12)" : "transparent", borderLeft: r.his ? `6px solid ${ORANGE}` : "6px solid transparent",
              borderBottom: r.his ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ width: 340 }}>{r.addr}</span>
              <span style={{ flex: 1 }}>
                {r.his && <span style={{ fontFamily: brand.body, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: "#1a0c00", background: ORANGE,
                  padding: "6px 14px", borderRadius: 6 }}>UNMOVED</span>}
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.bal}</span>
            </div>
          );
        })}
      </Cam2D>
      {/* keep the caption band clear while the list scrolls */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 380, background: "linear-gradient(#0d0e10 85%, rgba(13,14,16,0))" }} />
    </AbsoluteFill>
  );
};

const ShotC: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const at = project(shot, f, [-0.1, 0.72, 0.1]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <Letterbox coins={60} glow />
      </Studio3D>
      <Callout text="ANYONE CAN LOOK" at={at} label={[540, 1320]} startFrame={5} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const total = props.durationInFrames ?? 122;
  const cutB = Math.max(40, W(props, "you", 0, 2.309) - 2);
  const cutC = Math.max(cutB + 24, W(props, "right", 0, 3.484) - 1);
  const hx = wallPos(ROWS, COLS, HOT)[0];
  const shotA: Shot = { from: [hx - 4.6, 2.9, 12.5], to: [hx - 0.6, 2.9, 12.5], tFrom: [hx - 4.7, 2.5, 0], tTo: [hx - 0.8, 2.5, 0], fov: 30, len: cutB };
  const shotC: Shot = { from: [1.0, 1.4, 5.4], to: [0.5, 1.3, 4.6], tFrom: [0, 1.25, 0], tTo: [0, 1.25, 0], fov: 30, len: total - cutC };
  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cutB} layout="none"><ShotA shot={shotA} /></Sequence>
      <Sequence from={cutB} durationInFrames={cutC - cutB} layout="none"><ShotB len={cutC - cutB} /></Sequence>
      <Sequence from={cutC} durationInFrames={total - cutC} layout="none"><ShotC shot={shotC} /></Sequence>
      <Disclaimer text="Illustration · example addresses" />
      <Sfx name="whoosh_soft" at={cutB} volume={0.28} />
      <Sfx name="tick" at={cutB + 9} volume={0.3} />
      <Sfx name="whoosh_soft" at={cutC} volume={0.28} />
    </Shell>
  );
};
export default Scene;
