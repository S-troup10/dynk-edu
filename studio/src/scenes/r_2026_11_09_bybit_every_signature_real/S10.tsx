// Scene: 2026-11-09-bybit-every-signature-real S10 — "And if it says unlimited, or you can't tell what it does, don't sign."
// 1 f0–45    2D macro: fine-print "Amount: UNLIMITED", orange ink underline, Cam2D slide ("And if it says unlimited,")
// 2 f46–91   3D: pen hovering over a flat SignCard's signature line, nib trembling subtly ("or you can't tell what it does,")
// 3 f92–120  3D: pen lifts away, cap slides on (click), the line stays empty, callout DON'T SIGN ("don't sign.")
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { SignCard, Pen, InkPath2D, Cam2D, CamRig, project, Sfx, W, ease, clamp, ORANGE, type Shot, type Vec3 } from "./_shared";

const CUT2 = 46;
const CUT3 = 92;

/* ---------- shot 1: 2D fine print ---------- */
const FinePrint: React.FC = () => {
  const f = useCurrentFrame();
  const ink = ease(interpolate(f, [24, 40], [0, 1], clamp));
  const label: React.CSSProperties = { fontFamily: brand.body, fontWeight: 600, fontSize: 34, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" };
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, #1a1b1f 0%, #0c0c0e 70%)" }}>
      <Cam2D shot={{ from: { x: 50, y: 10, s: 1.0 }, to: { x: -40, y: -6, s: 1.07 }, len: 50 }}>
        <div style={{ position: "absolute", left: 90, top: 640, width: 900 }}>
          <div style={{ ...label, opacity: 0.6 }}>Permit</div>
          <div style={{ ...label, marginTop: 14, textTransform: "none", letterSpacing: 1, fontSize: 36 }}>Spender: 0x9f…e2 (unknown)</div>
          <div style={{ height: 2, background: "rgba(255,255,255,0.14)", margin: "46px 0 54px" }} />
          <div style={label}>Amount</div>
          <div style={{ position: "relative", marginTop: 6, width: 860 }}>
            <div style={{ fontFamily: brand.body, fontWeight: 800, fontSize: 142, letterSpacing: 2, color: "#f4f4f4", lineHeight: 1.1 }}>UNLIMITED</div>
            <div style={{ position: "absolute", left: -8, top: 128, width: 840 }}>
              <InkPath2D d="M10 40 C 160 18, 330 30, 440 22 S 640 12, 830 34" viewBox="0 0 840 60" progress={ink} width={12} style={{ width: "100%" }} />
            </div>
          </div>
          <div style={{ ...label, marginTop: 70, textTransform: "none", letterSpacing: 1, fontSize: 32, color: "rgba(255,255,255,0.3)" }}>Valid until revoked</div>
        </div>
      </Cam2D>
    </AbsoluteFill>
  );
};

/* ---------- shots 2 + 3: pen over a flat card ---------- */
const SHOT_B: Shot = { from: [3.2, 8.4, 7.6], to: [2.2, 8.0, 7.1], tFrom: [0, 0.5, 0.0], tTo: [0, 0.5, 0.1], fov: 30, len: 46 };
const SHOT_C: Shot = { from: [-2.2, 8.1, 7.4], to: [-1.2, 8.4, 7.9], tFrom: [0, 0.6, 0.1], tTo: [0, 0.6, 0.2], fov: 30, len: 29 };
const LINE_Z = 0.45;
const NIB_X = 0.35;
const CARD_Y = 0.06;

const CardAndPen: React.FC<{ shot: Shot; base: number; callout?: boolean }> = ({ shot, base, callout }) => {
  const lf = useCurrentFrame();
  const f = lf + base;
  const lift = ease(interpolate(f, [CUT3 + 2, CUT3 + 22], [0, 1], clamp));
  const capped = ease(interpolate(f, [CUT3 + 14, CUT3 + 26], [0, 1], clamp));
  const trem = 1 - lift;
  const tx = Math.sin(f * 0.23) * 0.008 * trem, tz = Math.sin(f * 0.17 + 1) * 0.006 * trem;
  const penPos: Vec3 = [NIB_X + tx - lift * 0.3, CARD_Y + 0.5 + lift * 0.55, LINE_Z + tz + lift * 0.2];
  const [px, py] = project(shot, lf, [-0.55, CARD_Y + 0.02, LINE_Z]);
  return (
    <AbsoluteFill>
      <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, to: shot.to, target: shot.tFrom, fov: shot.fov }}>
        <CamRig shot={shot} />
        <SignCard
          position={[0, CARD_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}
          lines={[
            { text: "Sign to approve", size: 46, color: "#9a9a9a", weight: 500 },
            { text: "UNLIMITED", size: 96, color: "#f4f4f4", weight: 800 },
            { text: "Spender: unknown", size: 40, color: "#9a9a9a", weight: 500 },
          ]}
        />
        {/* the empty signature line + x mark, on the card face (local y -0.45 → world z +0.45) */}
        <mesh position={[0, CARD_Y + 0.045, LINE_Z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.9, 0.012]} />
          <meshBasicMaterial color="#8a8a8a" />
        </mesh>
        <mesh position={[-0.98, CARD_Y + 0.045, LINE_Z - 0.09]} rotation={[-Math.PI / 2, 0, 0.785]}>
          <planeGeometry args={[0.1, 0.012]} />
          <meshBasicMaterial color="#8a8a8a" />
        </mesh>
        <mesh position={[-0.98, CARD_Y + 0.045, LINE_Z - 0.09]} rotation={[-Math.PI / 2, 0, -0.785]}>
          <planeGeometry args={[0.1, 0.012]} />
          <meshBasicMaterial color="#8a8a8a" />
        </mesh>
        <Pen position={penPos} rotation={[0.28, 0, -0.22]} scale={0.6} capped={capped} />
      </Studio3D>
      {callout && <Callout text="DON'T SIGN" at={[px, py]} label={[Math.min(px + 200, 800), py + 210]} startFrame={0} accent />}
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => (
  <Shell props={props} tone="dark">
    <Sequence from={0} durationInFrames={CUT2} layout="none"><FinePrint /></Sequence>
    <Sequence from={CUT2} durationInFrames={CUT3 - CUT2} layout="none"><CardAndPen shot={SHOT_B} base={CUT2} /></Sequence>
    <Sequence from={CUT3} layout="none"><CardAndPen shot={SHOT_C} base={CUT3} callout /></Sequence>
    <Sfx name="glint" at={26} volume={0.3} />
    <Sfx name="click" at={CUT3 + 22} volume={0.5} />
    <Disclaimer text="Illustration · simplified" />
  </Shell>
);
export default Scene;
