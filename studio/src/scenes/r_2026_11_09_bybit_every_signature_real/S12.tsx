// Scene: 2026-11-09-bybit-every-signature-real S12 — CTA. "Send this to someone who taps confirm without reading."
// 2D only. f0–CUT: orange "Confirm" button tapped on a phone (names the behaviour), then hard cut to the share sheet
// (ShareSheetEnd, contact picked ~f26), slow drift. No disclaimer.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Shell, ShareSheetEnd, Callout, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { ORANGE, Sfx, clamp, SAW } from "./_shared";

const CUT = 10;
const outC = Easing.out(Easing.cubic);

const TapShot: React.FC = () => {
  const f = useCurrentFrame();
  const press = interpolate(f, [3, 5, 8], [0, 1, 0.4], clamp);
  const ring = interpolate(f, [5, 10], [0, 1], clamp);
  const q = f / CUT * 0.7 + outC(f / CUT) * 0.3;
  const sc = 1.0 + 0.14 * q;
  const bx = 540, by = 1240;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #17181c 0%, #0e0f11 72%)" }}>
      <AbsoluteFill style={{ transform: `translate(${-14 * q}px,${-10 * q}px) scale(${sc}) rotate(${-1.2 + 1.6 * q}deg)`, transformOrigin: "50% 62%" }}>
        <div style={{ position: "absolute", left: 150, top: 500, width: 780, height: 1180, borderRadius: 78, background: "linear-gradient(180deg,#14151a,#0c0d10)",
          border: "3px solid #3b3e46", boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 0 0 10px #181a1f", fontFamily: brand.body, color: "#fff" }}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 90 }}>
            <div style={{ fontSize: 46, fontWeight: 700 }}>Confirm transaction</div>
            <div style={{ marginTop: 34, fontSize: 36, fontWeight: 600 }}>{SAW[0]}</div>
            <div style={{ marginTop: 14, fontSize: 30, color: "rgba(255,255,255,0.45)" }}>{SAW[1]}</div>
            {[0, 1].map((i) => (
              <div key={i} style={{ marginTop: 30, height: 20, width: 560 - i * 140, borderRadius: 10, background: "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        </div>
        {/* the orange Confirm button, being tapped */}
        <div style={{ position: "absolute", left: bx - 300, top: by - 66, width: 600, height: 132, borderRadius: 66, background: ORANGE, color: "#111", fontFamily: brand.body,
          fontWeight: 700, fontSize: 52, display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${1 - 0.055 * press}) translateY(${6 * press}px)`, boxShadow: `0 0 ${50 + 30 * press}px rgba(255,128,0,0.55)` }}>Confirm</div>
        <div style={{ position: "absolute", left: bx - 70, top: by - 70, width: 140, height: 140, borderRadius: 70, border: `4px solid ${ORANGE}`,
          opacity: ring > 0 ? 1 - ring : 0, transform: `scale(${0.6 + 2.2 * ring})` }} />
        <Callout text="TAP" at={[bx + 250, by - 60]} label={[bx + 270, 1090]} startFrame={0} size={26} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const sc = 1.012 + frame * 0.00032; // slow drift, camera never rests
  const dy = -frame * 0.28;
  return (
    <Shell props={props} tone="dark">
      <AbsoluteFill style={{ transform: `translateY(${dy}px) scale(${sc})`, transformOrigin: "50% 62%" }}>
        <ShareSheetEnd handle="dynkeducation" startFrame={0} selectIndex={1} />
      </AbsoluteFill>
      {frame < CUT && <TapShot />}
      <Sfx name="click" at={4} volume={0.3} />
      <Sfx name="whoosh_soft" at={CUT} volume={0.3} />
      <Sfx name="click" at={27} volume={0.3} />
    </Shell>
  );
};

export default Scene;
