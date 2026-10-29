// Scene: 2026-10-29-next S16 — CTA "Follow me and send this to someone who only checks the first and last few characters"
// Background: S01's tile row (tiles 0–13, as S01 shot A) on S01 shot A's camera line; lands exactly on S01 frame 0 at the last frame.
// A share sheet (local, sheet-only version of kit ShareSheetEnd) rises on "send", ring + Send go orange,
// then it slides back down in the last 0.6 s, leaving S01 frame 0 for a clean loop.
import React, { useLayoutEffect } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Shell, Studio3D, PhraseCaption, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { REAL, TileRow, tileX } from "./_shared";

const ORANGE = "#FF8000";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const easeIn = Easing.bezier(0.55, 0, 0.75, 0.25);

type Vec3 = [number, number, number];
// S01 shot A, copied from S01.tsx (frame 0 = from / tFrom). S01 moves along from→to at du/df = 1.5/42 on frame 0
// (its camAt: q = 0.75p + 0.25·easeOutCubic(p), p = f/42), so S16 travels the same line backwards-extended (u ≤ 0)
// and ramps up to that speed in the last frames, landing exactly on u = 0 on its last frame.
const F4C = (tileX(2) + tileX(5)) / 2;
const A_FROM: Vec3 = [F4C - 2.6, 0.95, 11.2], A_TO: Vec3 = [F4C + 1.1, 0.8, 10.2];
const A_TFROM: Vec3 = [F4C - 0.7, 0.5, 0], A_TTO: Vec3 = [F4C + 0.3, 0.45, 0];
const A_FOV = 30;
const V_END = 1.5 / 42; // S01's du/df on frame 0
const V_SLOW = 0.0015;   // slow track during the sheet
const RAMP = 20;         // frames to match S01's speed
const lerp3 = (a: Vec3, b: Vec3, u: number): Vec3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** u(f): integral of velocity from f to the last frame, negated, so u(last) = 0. */
const uAt = (f: number, last: number) => {
  let u = 0;
  for (let k = Math.max(0, Math.floor(f)); k < last; k++) {
    const r = interpolate(k + 0.5, [last - RAMP, last], [0, 1], clamp);
    const sm = r * r * (3 - 2 * r);
    u -= V_SLOW + (V_END - V_SLOW) * sm;
  }
  return u;
};
/** Sheet presence 0..1 (spring up at inAt, ease-in down from outAt). Drives the sheet AND the camera tilt. */
const sheetS = (frame: number, fps: number, inAt: number, outAt: number, outFrames: number) => {
  const up = spring({ frame: frame - inAt, fps, config: { damping: 22, stiffness: 120 } });
  const down = easeIn(interpolate(frame, [outAt, outAt + outFrames], [0, 1], clamp));
  return up * (1 - down);
};
const LIFT = 1.85; // while the sheet is up, aim lower so the tile row rides in the top third (clear of the sheet top at 640 px)
const LoopRig: React.FC<{ inAt: number; outAt: number; outFrames: number }> = ({ inAt, outAt, outFrames }) => {
  const f = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const { camera } = useThree();
  useLayoutEffect(() => {
    const u = uAt(f, durationInFrames - 1);
    const s = sheetS(f, fps, inAt, outAt, outFrames);
    camera.position.set(...lerp3(A_FROM, A_TO, u));
    (camera as THREE.PerspectiveCamera).fov = A_FOV;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    const t = lerp3(A_TFROM, A_TTO, u);
    camera.lookAt(t[0], t[1] - LIFT * s, t[2]);
  });
  return null;
};

const wordAt = (props: SceneProps, w: string, fallback: number) => {
  const hit = props.vo?.words?.find((x) => x.text.toLowerCase().replace(/[^a-z]/g, "") === w);
  return hit ? hit.start : fallback;
};

/** Sheet-only Instagram-style share sheet: rises at `inAt`, contact ring at `pickAt`, Send orange at `sendAt`, lowers from `outAt`. */
const ShareSheetOverlay: React.FC<{ inAt: number; pickAt: number; sendAt: number; outAt: number; outFrames: number; selectIndex?: number }> = ({
  inAt, pickAt, sendAt, outAt, outFrames, selectIndex = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sheetS(frame, fps, inAt, outAt, outFrames);
  if (s <= 0.001) return null;
  const pickP = ease(interpolate(frame, [pickAt, pickAt + 6], [0, 1], clamp));
  const sendP = interpolate(frame, [sendAt, sendAt + 3], [0, 1], clamp);
  const press = 1 - 0.04 * Math.sin(Math.PI * interpolate(frame, [sendAt - 2, sendAt + 6], [0, 1], clamp));
  const contacts = ["sam", "jordan.k", "mia_", "alex.r", "chris", "tay.l"];
  const rows = [contacts.slice(0, 3), contacts.slice(3, 6)];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* scrim: tile row stays visible above the sheet */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,13,15,0) 0%, rgba(12,13,15,0.55) 38%, rgba(12,13,15,0.85) 100%)", opacity: s }} />
      <div style={{ position: "absolute", left: 64, right: 160, top: 640, bottom: -80, transform: `translateY(${(1 - s) * 1320}px)`,
        borderRadius: "44px 44px 0 0", background: "#1d1e21", padding: "30px 44px 0", fontFamily: brand.body, color: "#fff",
        boxShadow: "0 -24px 90px rgba(0,0,0,0.65)" }}>
        <div style={{ width: 96, height: 8, borderRadius: 4, background: "#4a4b4f", margin: "0 auto 30px" }} />
        <div style={{ height: 72, borderRadius: 18, background: "#2a2b2f", display: "flex", alignItems: "center", padding: "0 26px", fontSize: 30, color: "#8a8b90" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" style={{ marginRight: 16 }}><circle cx="10" cy="10" r="7" stroke="#8a8b90" strokeWidth="2.4" fill="none" /><line x1="15.5" y1="15.5" x2="21" y2="21" stroke="#8a8b90" strokeWidth="2.4" strokeLinecap="round" /></svg>
          Search
        </div>
        {rows.map((row, r) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-around", marginTop: r === 0 ? 46 : 34 }}>
            {row.map((name, c) => {
              const i = r * 3 + c;
              const sel = i === selectIndex;
              return (
                <div key={i} style={{ textAlign: "center", width: 200 }}>
                  <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
                    <div style={{ width: 140, height: 140, borderRadius: 70, background: `linear-gradient(160deg, ${["#45464b", "#3c3d42", "#4a4a4e"][i % 3]}, #2b2c30)`, overflow: "hidden", position: "relative" }}>
                      {/* neutral silhouette, no faces */}
                      <div style={{ position: "absolute", left: 47, top: 30, width: 46, height: 46, borderRadius: 23, background: "#5c5d62" }} />
                      <div style={{ position: "absolute", left: 22, top: 86, width: 96, height: 80, borderRadius: "48px 48px 0 0", background: "#5c5d62" }} />
                    </div>
                    {sel && (
                      <div style={{ position: "absolute", inset: -9, borderRadius: 80, border: `4px solid ${ORANGE}`, opacity: pickP, transform: `scale(${1.08 - 0.08 * pickP})`,
                        boxShadow: `0 0 ${24 * pickP}px rgba(255,128,0,0.45)` }} />
                    )}
                    {sel && (
                      <div style={{ position: "absolute", right: -2, bottom: -2, width: 42, height: 42, borderRadius: 21, background: ORANGE, border: "4px solid #1d1e21",
                        display: "flex", alignItems: "center", justifyContent: "center", opacity: pickP, transform: `scale(${0.5 + 0.5 * pickP})` }}>
                        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#111" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 26, marginTop: 14, opacity: sel ? 0.95 : 0.7 }}>{name}</div>
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ marginTop: 46, height: 96, borderRadius: 22, transform: `scale(${press})`,
          background: sendP > 0.5 ? ORANGE : "#2f3034", color: sendP > 0.5 ? "#111" : "#77787c",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700 }}>Send</div>
      </div>
    </AbsoluteFill>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();
  const send = Math.round(wordAt(props, "send", 1.1) * fps);
  const who = Math.round(wordAt(props, "who", 2.09) * fps);
  const outFrames = Math.round(0.6 * fps) - 2; // sheet fully gone 2 frames before the end
  const outAt = durationInFrames - Math.round(0.6 * fps);
  return (
    <Shell props={props} tone="dark" captions={false}>
      {/* slow L→R track that lands exactly on S01's frame-0 pose on the last frame */}
      {/* same Studio3D args as S01 shot A so fog/lighting match; LoopRig overrides the camera each frame */}
      <Studio3D tone="dark" camera={{ from: A_FROM, target: A_TFROM, fov: A_FOV }}>
        <LoopRig inAt={send - 2} outAt={outAt} outFrames={outFrames} />
        <TileRow chars={REAL} only={[0, 14]} />
      </Studio3D>
      <Disclaimer text="Magnified illustration · addresses are made up" />
      <ShareSheetOverlay inAt={send - 2} pickAt={who - 3} sendAt={Math.round(2.4 * fps)} outAt={outAt} outFrames={outFrames} />
      {/* phrase captions with 8-word phrases so the last phrase reads "the first and last few [characters]" */}
      {props.vo?.words?.length ? <PhraseCaption words={props.vo.words} tone="dark" keywords={(props.captionKeywords as string[]) ?? []} maxWords={8} /> : null}
    </Shell>
  );
};

export default Scene;
