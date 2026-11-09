// Scene: 2026-11-09-bybit-every-signature-real S06 — THE TURN ("Here's the part about you…").
// Five hard-cut 2D shots on one generic wallet "Signature request" sheet (made-up site, no brands):
// A phone rises + tilts · B slide down to the buttons · C macro Confirm + press ripple · D message swells into mono blob · E push into the blob, "???".
// Orange system: the Confirm button (A–D), the "???" callout (E).
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Shell, Callout, Disclaimer, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { HEX, Sfx, W, clamp, ORANGE } from "./_shared";

const out3 = Easing.out(Easing.cubic);
type Cam2 = { s: [number, number]; x: [number, number]; y: [number, number]; r: [number, number]; len: number };
const cam2At = (c: Cam2, f: number) => {
  const p = interpolate(f, [0, c.len], [0, 1], clamp);
  const q = p * 0.7 + out3(p) * 0.3;
  const m = (a: [number, number]) => a[0] + (a[1] - a[0]) * q;
  return { s: m(c.s), x: m(c.x), y: m(c.y), r: m(c.r) };
};
const px = (c: Cam2, f: number, p: [number, number]): [number, number] => {
  const { s, x, y, r } = cam2At(c, f);
  const a = (r * Math.PI) / 180;
  const dx = (p[0] - 540) * s, dy = (p[1] - 960) * s;
  return [540 + x + dx * Math.cos(a) - dy * Math.sin(a), 960 + y + dx * Math.sin(a) + dy * Math.cos(a)];
};
const Cam2D: React.FC<{ cam: Cam2; children: React.ReactNode }> = ({ cam, children }) => {
  const f = useCurrentFrame();
  const { s, x, y, r } = cam2At(cam, f);
  return <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`, transformOrigin: "540px 960px" }}>{children}</AbsoluteFill>;
};
const Bg2D: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(110% 70% at 50% 45%, #1d1f23 0%, #121316 55%, #0b0b0b 100%)" }}>{children}</AbsoluteFill>
);
const FONT = brand.body;
const MONO = "'DejaVu Sans Mono', monospace";

const BLOB = (
  `{"domain":{"name":"Claim","chainId":1,"verifyingContract":"0x7d1a09c4be52f8e3"},"types":{"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"}]},` +
  `"message":{"owner":"0x4be2a1","spender":"0x9f3c07","value":"115792089237316195423570985008687907853269984665640564039457584007913129639935","nonce":0,"deadline":"1893456000"},` +
  `"sig":"${HEX}${HEX}"}`
);

/* ---- the sheet (phone + signature request), drawn in 1080×1920 layout space ---- */
const BX = 180, BW = 720; // message box x / width
const BTN = { x: 470, y: 1250, w: 430, h: 124 };
const Sheet: React.FC<{ rise?: number; expand?: number; chars?: number; press?: number; ripple?: number }> = ({ rise = 0, expand = 0, chars = 0, press = 0, ripple = -1 }) => {
  const boxH = 290 + 350 * expand;
  const blob = BLOB.slice(0, Math.max(0, Math.floor(chars)));
  return (
    <AbsoluteFill style={{ transform: `translateY(${rise}px)` }}>
      <div style={{ position: "absolute", left: 130, top: 380, width: 820, height: 1130, borderRadius: 110, background: "linear-gradient(160deg,#25272b,#0d0e10 45%)",
        border: "2px solid rgba(255,255,255,0.10)", boxShadow: "0 40px 120px rgba(0,0,0,0.7)" }} />
      <div style={{ position: "absolute", left: 150, top: 400, width: 780, height: 1090, borderRadius: 92, background: "linear-gradient(180deg,#14151a,#08090a 70%)" }} />
      <div style={{ position: "absolute", left: 445, top: 424, width: 190, height: 44, borderRadius: 22, background: "#000" }} />
      {/* site pill */}
      <div style={{ position: "absolute", left: BX, top: 510, display: "flex", alignItems: "center", gap: 16, padding: "12px 26px", borderRadius: 40, background: "#1b1c20", border: "1.5px solid rgba(255,255,255,0.10)" }}>
        <div style={{ width: 20, height: 20, borderRadius: 10, border: "3px solid #8d9096" }} />
        <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 32, color: "rgba(255,255,255,0.7)" }}>claim-airdrop.example</span>
      </div>
      <div style={{ position: "absolute", left: BX, top: 596, fontFamily: FONT, fontWeight: 700, fontSize: 60, color: "#f4f4f2" }}>Signature request</div>
      {/* message box */}
      <div style={{ position: "absolute", left: BX, top: 700, width: BW, height: boxH, borderRadius: 36, background: "#17181c", border: "1.5px solid rgba(255,255,255,0.10)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 34, top: 24, fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.45)" }}>MESSAGE</div>
        <div style={{ position: "absolute", left: 34, top: 82, right: 30, bottom: 20, fontFamily: MONO, fontSize: 30, lineHeight: "40px", color: "#8d9096", wordBreak: "break-all", overflow: "hidden" }}>
          {expand > 0 ? blob : BLOB.slice(0, 150) + "…"}
        </div>
      </div>
      {/* rows */}
      <div style={{ position: "absolute", left: BX, top: 1020 + 350 * expand * 0.0, width: BW, opacity: 1 - expand }}>
        <div style={{ height: 22, width: 520, borderRadius: 11, background: "rgba(255,255,255,0.07)", marginBottom: 22 }} />
        <div style={{ height: 22, width: 400, borderRadius: 11, background: "rgba(255,255,255,0.05)" }} />
      </div>
      {/* buttons */}
      <div style={{ position: "absolute", left: BX, top: BTN.y, width: 250, height: BTN.h, borderRadius: 62, background: "#23252a", color: "rgba(255,255,255,0.7)", fontFamily: FONT, fontWeight: 700, fontSize: 46,
        display: "flex", alignItems: "center", justifyContent: "center" }}>Cancel</div>
      <div style={{ position: "absolute", left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 62, background: ORANGE, color: "#0b0b0b", fontFamily: FONT, fontWeight: 800, fontSize: 52,
        display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.05 * press})`, boxShadow: "0 0 60px 8px rgba(255,128,0,0.45)" }}>Confirm</div>
      {ripple >= 0 && ripple < 1 && (
        <div style={{ position: "absolute", left: BTN.x + BTN.w / 2 - 190 * ripple - 20, top: BTN.y + BTN.h / 2 - 190 * ripple - 20, width: 380 * ripple + 40, height: 380 * ripple + 40, borderRadius: "50%",
          border: `${6 * (1 - ripple) + 2}px solid rgba(255,255,255,${0.75 * (1 - ripple)})` }} />
      )}
    </AbsoluteFill>
  );
};

const CAM_A: Cam2 = { s: [0.9, 1.0], x: [30, -14], y: [10, -10], r: [-3.4, 0.8], len: 45 };
const CAM_B: Cam2 = { s: [1.1, 1.5], x: [-30, -170], y: [-250, -560], r: [1.2, -1.2], len: 25 };
const CAM_C: Cam2 = { s: [2.0, 2.3], x: [-190, -230], y: [-730, -790], r: [1.2, -1.0], len: 24 };
const CAM_D: Cam2 = { s: [1.0, 1.14], x: [34, -34], y: [-90, -140], r: [1.4, -0.8], len: 43 };
const CAM_E: Cam2 = { s: [1.6, 2.9], x: [0, 0], y: [64, 116], r: [-1.2, 1.6], len: 34 };

const Scene: React.FC<SceneProps> = (props) => {
  const fConfirm = W(props, "confirm", 0, 2.68);
  const fEvery = W(props, "every", 0, 1.5);
  const fSign = W(props, "sign", 0, 3.37);
  const fProb = W(props, "probably", 0, 4.56);
  const cB = fEvery - 4;       // ~41
  const cC = fConfirm - 12;    // ~68
  const cD = W(props, "you", 2, 3.14); // "you sign" ~94
  const cE = fProb;            // "probably" ~137
  const total = props.durationInFrames ?? 171;
  const fPress = fConfirm;

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cB} layout="none">
        <Bg2D><Cam2D cam={CAM_A}><A /></Cam2D></Bg2D>
      </Sequence>
      <Sequence from={cB} durationInFrames={cC - cB} layout="none">
        <Bg2D><Cam2D cam={CAM_B}><Sheet /></Cam2D></Bg2D>
      </Sequence>
      <Sequence from={cC} durationInFrames={cD - cC} layout="none">
        <C pressAt={fPress - cC} />
      </Sequence>
      <Sequence from={cD} durationInFrames={cE - cD} layout="none">
        <D signAt={fSign - cD} />
      </Sequence>
      <Sequence from={cE} durationInFrames={total - cE} layout="none">
        <E />
      </Sequence>

      <Disclaimer text="Illustration · made-up site" y={1500} />

      <Sfx name="whoosh_soft" at={0} volume={0.3} />
      <Sfx name="whoosh_soft" at={cB} volume={0.28} />
      <Sfx name="whoosh_soft" at={cC} volume={0.28} />
      <Sfx name="click" at={fPress} volume={0.35} />
      <Sfx name="whoosh_soft" at={cD} volume={0.28} />
      <Sfx name="type" at={fSign + 2} volume={0.25} />
      <Sfx name="thud" at={cE} volume={0.45} />
    </Shell>
  );
};

const A: React.FC = () => {
  const f = useCurrentFrame();
  const p = out3(interpolate(f + 4, [0, 14], [0, 1], clamp)); // already moving on frame 0
  return <Sheet rise={(1 - p) * 700} />;
};
const C: React.FC<{ pressAt: number }> = ({ pressAt }) => {
  const f = useCurrentFrame();
  const press = interpolate(f, [pressAt, pressAt + 2, pressAt + 6], [0, 1, 0], clamp);
  const ripple = f >= pressAt ? (f - pressAt) / 12 : -1;
  return <Bg2D><Cam2D cam={CAM_C}><Sheet press={press} ripple={ripple} /></Cam2D></Bg2D>;
};
const D: React.FC<{ signAt: number }> = ({ signAt }) => {
  const f = useCurrentFrame();
  const expand = out3(interpolate(f, [signAt, signAt + 8], [0, 1], clamp));
  const chars = (f - signAt) * 45;
  return <Bg2D><Cam2D cam={CAM_D}><Sheet expand={expand} chars={chars} /></Cam2D></Bg2D>;
};
const E: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Bg2D>
      <Cam2D cam={CAM_E}><Sheet expand={1} chars={9999} /></Cam2D>
      <Callout text="???" at={[760, 820]} label={[840, 1290]} startFrame={4} accent size={64} />
    </Bg2D>
  );
};

export default Scene;
