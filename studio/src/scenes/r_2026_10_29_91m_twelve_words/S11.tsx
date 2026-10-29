// Scene: 2026-10-29-91m-twelve-words S11 — CTA. "Send this to someone who keeps theirs in their camera roll."
// 2D only. f0–10: camera-roll grid with the 12-word screenshot glowing, sheet rising beneath it; f10–end: share sheet, contact picked ~f26, slow drift.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Shell, ShareSheetEnd, Callout, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { PHRASE, ORANGE, Sfx, W, rand, clamp } from "./_shared";

const CUT = 10; // camera roll gives way to the sheet (hard cut)

const Thumb: React.FC<{ i: number; w: number; h: number }> = ({ i, w, h }) => {
  const a = Math.floor(rand(i + 3) * 40) + 18, b = Math.floor(rand(i + 11) * 40) + 12;
  const ang = Math.floor(rand(i + 5) * 180);
  const bx = 20 + rand(i + 7) * 60, by = 20 + rand(i + 9) * 60, br = 20 + rand(i + 13) * 25;
  return (
    <div style={{ width: w, height: h, borderRadius: 10, overflow: "hidden", position: "relative", opacity: 0.55,
      background: `linear-gradient(${ang}deg, rgb(${a},${a + 2},${a + 6}), rgb(${b + 14},${b + 14},${b + 18}))` }}>
      <div style={{ position: "absolute", left: `${bx - br / 2}%`, top: `${by - br / 2}%`, width: `${br}%`, height: `${br * (w / h)}%`, borderRadius: "50%",
        background: "rgba(255,255,255,0.07)", filter: "blur(14px)" }} />
    </div>
  );
};

/** The screenshot of the 12-word list, drawn at 229 × 305 and scalable. */
const WordShot: React.FC<{ w: number; h: number; glow?: boolean }> = ({ w, h, glow }) => {
  const k = w / 229;
  return (
    <div style={{ width: w, height: h, borderRadius: 10 * k, background: "#0b0c0e", position: "relative", overflow: "hidden",
      border: `${Math.max(1.5, 2 * k)}px solid ${glow ? ORANGE : "#3a3b40"}`,
      boxShadow: glow ? `0 0 ${46 * k}px ${8 * k}px rgba(255,128,0,0.55), 0 0 ${120 * k}px rgba(255,128,0,0.25)` : "none", fontFamily: brand.body, color: "#fff" }}>
      <div style={{ position: "absolute", left: 16 * k, top: 22 * k, fontSize: 17 * k, fontWeight: 700 }}>Recovery phrase</div>
      <div style={{ position: "absolute", left: 16 * k, right: 12 * k, top: 62 * k, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 14 * k }}>
        {PHRASE.map((p, i) => (
          <div key={i} style={{ fontSize: 17 * k, whiteSpace: "nowrap" }}>
            <span style={{ opacity: 0.4 }}>{i + 1}</span>{"  "}<span style={{ fontWeight: 600 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 120 } }); // same spring as ShareSheetEnd
  const sheetTop = 820 + (1 - s) * 500;

  const tCamera = W(props, "camera", 0, 2.223);
  const chipP = Easing.out(Easing.cubic)(interpolate(frame, [tCamera, tCamera + 6], [0, 1], clamp));

  // slow continuous drift on everything (camera never rests)
  const sc = 1.012 + frame * 0.00032;
  const dy = -frame * 0.28;

  const COLS = 4, GAP = 8, TW = (940 - GAP * 3) / COLS, TH = 305;
  const scroll = interpolate(frame, [0, CUT], [34, 0], clamp);
  const gridTop = 500 + scroll;
  const SHOT = 1; // column of the screenshot (row 0)

  return (
    <Shell props={props} tone="dark">
      <AbsoluteFill style={{ transform: `translateY(${dy}px) scale(${sc})`, transformOrigin: "50% 62%" }}>
        <ShareSheetEnd handle="dynkeducation" startFrame={0} selectIndex={1} />

        {frame < CUT && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: Math.max(0, sheetTop - 6 - 380), overflow: "hidden", background: "#0c0d0f" }}>
            <div style={{ position: "absolute", left: 70, top: gridTop - 380, width: 940, display: "grid", gridTemplateColumns: `repeat(${COLS}, ${TW}px)`, gap: GAP }}>
              {Array.from({ length: 16 }, (_, i) =>
                i === SHOT ? <WordShot key={i} w={TW} h={TH} glow /> : <Thumb key={i} i={i} w={TW} h={TH} />,
              )}
            </div>
          </div>
        )}
        {frame < CUT && (
          <Callout text="Screenshot" at={[70 + (TW + GAP) * SHOT + TW / 2, gridTop - 4]} label={[70 + (TW + GAP) * SHOT + TW / 2, 452]} startFrame={0} />
        )}

        {/* "…their camera roll": the screenshot rides along as the attachment preview above the sheet */}
        {frame >= tCamera && (
          <div style={{ position: "absolute", top: 640, right: 100, left: "auto", display: "flex", justifyContent: "flex-end", opacity: chipP,
            transform: `translateY(${(1 - chipP) * 60}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 22px 14px 14px", borderRadius: 24, background: "#1d1e21",
              border: "1.5px solid rgba(255,128,0,0.55)", fontFamily: brand.body, color: "#fff" }}>
              <WordShot w={80} h={106} />
              <div>
                <div style={{ fontSize: 27, fontWeight: 700 }}>Screenshot</div>
                <div style={{ fontSize: 21, opacity: 0.5, marginTop: 3 }}>from camera roll</div>
              </div>
            </div>
          </div>
        )}
      </AbsoluteFill>

      <Sfx name="whoosh_soft" at={1} volume={0.3} />
      <Sfx name="click" at={27} volume={0.3} />
      <Sfx name="glint" at={tCamera} volume={0.25} />
    </Shell>
  );
};

export default Scene;
