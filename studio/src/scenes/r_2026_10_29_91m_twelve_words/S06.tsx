// Scene: 2026-10-29-91m-twelve-words S06 — THE TURN.
// "So the thieves didn't guess. They pretended to be support, for his wallet maker and his exchange. And he trusted them."
// Five hard-cut shots. A (3D) slot tiles stop dead + go dim on "guess" · B (2D) lock-screen notification on "pretended"
// · C (2D) fake "Wallet Support" thread · D (2D) fake "Exchange Support" thread · E (3D) phone on plinth, orange coin arc leaves it.
// Orange system per shot: A the spinning tiles (until they die) · B/C/D the impostor message · E the coin arc.
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Shell, Studio3D, Callout, Disclaimer, Phone, Plinth, Coin, type SceneProps } from "../../kit";
import { brand } from "../../brand";
import { BIP39 } from "./bip39";
import { PHRASE, WordTile, CamRig, Sfx, W, rand, clamp, ORANGE, type Shot, type Vec3 } from "./_shared";

const out3 = Easing.out(Easing.cubic);
const out4 = Easing.out(Easing.quad);

/* ================= 2D helpers ================= */
type Cam2 = { s: [number, number]; x: [number, number]; y: [number, number]; r: [number, number]; len: number };
const cam2At = (c: Cam2, f: number) => {
  const p = interpolate(f, [0, c.len], [0, 1], clamp);
  const q = p * 0.7 + out3(p) * 0.3; // never starts from rest
  const m = (a: [number, number]) => a[0] + (a[1] - a[0]) * q;
  return { s: m(c.s), x: m(c.x), y: m(c.y), r: m(c.r) };
};
/** map a point in the un-transformed 1080×1920 layout to screen px, same transform as <Cam2D>. */
const px = (c: Cam2, f: number, p: [number, number]): [number, number] => {
  const { s, x, y, r } = cam2At(c, f);
  const a = (r * Math.PI) / 180;
  const dx = (p[0] - 540) * s, dy = (p[1] - 960) * s;
  return [540 + x + dx * Math.cos(a) - dy * Math.sin(a), 960 + y + dx * Math.sin(a) + dy * Math.cos(a)];
};
const Cam2D: React.FC<{ cam: Cam2; children: React.ReactNode }> = ({ cam, children }) => {
  const f = useCurrentFrame();
  const { s, x, y, r } = cam2At(cam, f);
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`, transformOrigin: "540px 960px" }}>{children}</AbsoluteFill>
  );
};
const Bg2D: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(110% 70% at 50% 45%, #1d1f23 0%, #121316 55%, #0b0b0b 100%)" }}>{children}</AbsoluteFill>
);
/** 0→1 over `n` frames starting at `at` (ease-out). */
const land = (f: number, at: number, n = 6) => out3(interpolate(f, [at, at + n], [0, 1], clamp));

const FONT = brand.body;
const GLASS = "rgba(34,35,39,0.94)";

/* generic glyphs (no real brands) */
const HeadsetGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="#c9cbd0" strokeWidth="3.2" strokeLinecap="round">
    <path d="M10 28v-5a14 14 0 0 1 28 0v5" />
    <rect x="7" y="27" width="7" height="11" rx="3" fill="#c9cbd0" stroke="none" />
    <rect x="34" y="27" width="7" height="11" rx="3" fill="#c9cbd0" stroke="none" />
    <path d="M38 38c0 4-5 5-11 5" />
  </svg>
);
const BuildingGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="#c9cbd0" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M6 18 24 7l18 11z" />
    <path d="M11 21v15M20 21v15M28 21v15M37 21v15M6 40h36" />
  </svg>
);
const FakeTick: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="#6d7075" />
    <path d="M9.5 16.5l4.5 4.5 8.5-9.5" fill="none" stroke="#0b0c0e" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ================= SHOT A — 3D: slot tiles stop dead ================= */
const STOP = 33;
const TURNS = [8, 9, 7, 9, 8, 7, 9, 8, 9, 7, 8, 9]; // whole turns, so the stop lands flat
const ShotA: React.FC<{ stopAt: number }> = ({ stopAt }) => {
  const f = useCurrentFrame();
  const shot: Shot = { from: [-1.4, 1.7, 6.6], to: [0.4, 2.3, 19.5], tFrom: [-0.7, 1.3, 0], tTo: [0, 1.25, 0], fov: 32, len: 47 };
  const spinning = f < stopAt;
  const since = f - stopAt;
  const wob = since >= 0 ? Math.sin(since * 1.7) * Math.exp(-since / 3.2) * 0.07 : 0; // tiny dead-stop settle
  return (
    <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      {PHRASE.map((w, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const pos: Vec3 = [(col - 1) * 1.75, (1.5 - row) * 0.62 + 1.2, 0];
        const sp = spinning ? (TURNS[i] * f) / stopAt : 0;
        const word = spinning ? BIP39[Math.floor(rand(i * 17.3 + f * 3.7) * 2048)] : w;
        return (
          <WordTile key={i} word={w} index={i + 1} position={pos} rotation={[wob * (i % 2 ? 1 : -1), 0, 0]}
            glow={spinning} dim={!spinning} spin={sp} spinWord={spinning ? word : undefined} />
        );
      })}
    </Studio3D>
  );
};

/* ================= SHOT B — 2D: lock screen, notification drops in ================= */
const CAM_B: Cam2 = { s: [1.0, 1.16], x: [26, -20], y: [8, -64], r: [-2.2, 1.0], len: 47 };
const ShotB: React.FC<{ noteAt: number; calloutAt: number }> = ({ noteAt, calloutAt }) => {
  const f = useCurrentFrame();
  const p = land(f, noteAt, 6);
  const dropY = (1 - p) * -300;
  const NX = 170, NY = 905, NW = 740, NH = 262;
  const at = px(CAM_B, f, [NX + NW * 0.62, NY]);
  return (
    <Bg2D>
      <Cam2D cam={CAM_B}>
        {/* phone body */}
        <div style={{ position: "absolute", left: 130, top: 430, width: 820, height: 1700, borderRadius: 128, background: "linear-gradient(160deg,#25272b,#0d0e10 45%)",
          border: "2px solid rgba(255,255,255,0.10)", boxShadow: "0 40px 120px rgba(0,0,0,0.7)" }} />
        <div style={{ position: "absolute", left: 150, top: 450, width: 780, height: 1660, borderRadius: 110, background: "linear-gradient(180deg,#14151a,#08090a 70%)" }} />
        <div style={{ position: "absolute", left: 445, top: 478, width: 190, height: 50, borderRadius: 25, background: "#000" }} />
        {/* lock screen */}
        <div style={{ position: "absolute", left: 150, width: 780, top: 580, textAlign: "center", fontFamily: FONT, color: "rgba(255,255,255,0.62)", fontSize: 38, fontWeight: 500 }}>Tuesday 19 August</div>
        <div style={{ position: "absolute", left: 150, width: 780, top: 612, textAlign: "center", fontFamily: FONT, color: "#f4f4f2", fontSize: 196, fontWeight: 700, letterSpacing: -4 }}>2:07</div>
        {/* the notification */}
        <div style={{ position: "absolute", left: NX, top: NY + dropY, width: NW, height: NH, opacity: interpolate(f, [noteAt, noteAt + 3], [0, 1], clamp),
          transform: `scale(${1 + (1 - p) * 0.05})`, transformOrigin: "50% 0%" }}>
          <div style={{ position: "absolute", inset: -36, background: "radial-gradient(60% 70% at 4% 50%, rgba(255,128,0,0.30), rgba(255,128,0,0) 70%)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: GLASS, border: "1.5px solid rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: ORANGE, boxShadow: `0 0 38px 6px rgba(255,128,0,0.7)` }} />
            <div style={{ position: "absolute", left: 40, top: 30, width: 72, height: 72, borderRadius: 20, background: "#2c2e33", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HeadsetGlyph size={46} />
            </div>
            <div style={{ position: "absolute", left: 134, top: 34, fontFamily: FONT, fontWeight: 700, fontSize: 38, color: "#fff" }}>Support</div>
            <div style={{ position: "absolute", right: 36, top: 42, fontFamily: FONT, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.45)" }}>now</div>
            <div style={{ position: "absolute", left: 134, top: 86, right: 30, fontFamily: FONT, fontWeight: 500, fontSize: 36, lineHeight: 1.22, color: "rgba(255,255,255,0.92)" }}>
              Security alert on your wallet. Reply to verify.
            </div>
          </div>
        </div>
        {/* dim second row so the screen doesn't look empty */}
        <div style={{ position: "absolute", left: 210, top: 1240, width: 660, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", left: 250, top: 1286, width: 580, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.04)" }} />
      </Cam2D>
      <Callout text="IMPOSTOR" at={at} label={[at[0] + 20, at[1] - 70]} startFrame={calloutAt} accent size={26} />
    </Bg2D>
  );
};

/* ================= SHOTS C / D — 2D: fake support threads ================= */
type Bubble = { text: string; at: number; orange?: boolean; w: number };
const PX0 = 90, PY0 = 400, PW = 900, PH = 1100;

const Thread: React.FC<{ cam: Cam2; name: string; glyph: "headset" | "building"; typingAt: number; bubbles: Bubble[]; callout: { text: string; at: number } }> = ({
  cam, name, glyph, typingAt, bubbles, callout,
}) => {
  const f = useCurrentFrame();
  // layout positions of bubbles (stacked)
  let y = 640;
  const laid = bubbles.map((b) => {
    const lines = Math.ceil((b.text.length * 22) / (b.w - 76));
    const h = lines * 56 + 52;
    const top = y;
    y += h + 26;
    return { ...b, top, h };
  });
  const firstAt = bubbles[0].at;
  const showTyping = f >= typingAt && f < firstAt;
  const tick = px(cam, f, [PX0 + 66 + 200 + (name.length > 14 ? 40 : 0) + 0, PY0 + 74]);
  return (
    <Bg2D>
      <Cam2D cam={cam}>
        <div style={{ position: "absolute", left: PX0, top: PY0, width: PW, height: PH, borderRadius: 56, background: "#0b0c0e", border: "1.5px solid rgba(255,255,255,0.10)",
          boxShadow: "0 50px 120px rgba(0,0,0,0.65)", overflow: "hidden" }}>
          {/* header */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: "#111215", borderBottom: "1px solid rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", left: 34, top: 50, fontFamily: FONT, fontSize: 60, fontWeight: 500, color: "rgba(255,255,255,0.55)", lineHeight: "50px" }}>‹</div>
          <div style={{ position: "absolute", left: 92, top: 36, width: 80, height: 80, borderRadius: 40, background: "#25272b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {glyph === "headset" ? <HeadsetGlyph size={50} /> : <BuildingGlyph size={50} />}
          </div>
          <div style={{ position: "absolute", left: 196, top: 30, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: "#fff", whiteSpace: "nowrap" }}>{name}</span>
            <FakeTick size={34} />
          </div>
          <div style={{ position: "absolute", left: 196, top: 88, fontFamily: FONT, fontWeight: 500, fontSize: 27, color: "rgba(255,255,255,0.4)" }}>online</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 176, textAlign: "center", fontFamily: FONT, fontWeight: 500, fontSize: 26, color: "rgba(255,255,255,0.32)" }}>Today 2:07</div>
          {/* typing dots */}
          {showTyping && (
            <div style={{ position: "absolute", left: 36, top: 240, width: 150, height: 76, borderRadius: 38, background: "#1b1c20", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ width: 16, height: 16, borderRadius: 8, background: "#c9cbd0", opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - typingAt) * 0.9 - k * 0.9)) }} />
              ))}
            </div>
          )}
          {/* bubbles */}
          {laid.map((b, i) => {
            const p = land(f, b.at, 5);
            if (f < b.at) return null;
            const top = b.top - 400 + 0; // panel-local; first bubble sits at 240 (see offset)
            return (
              <div key={i} style={{ position: "absolute", left: 36, top: 240 + (b.top - 640) + 0 * top, width: b.w, opacity: p, transform: `translateY(${(1 - p) * 26}px) scale(${0.93 + 0.07 * p})`, transformOrigin: "0% 0%" }}>
                {b.orange && <div style={{ position: "absolute", inset: -30, borderRadius: 60, background: "radial-gradient(60% 60% at 50% 50%, rgba(255,128,0,0.20), rgba(255,128,0,0) 75%)" }} />}
                <div style={{ position: "relative", borderRadius: 40, borderTopLeftRadius: 12, padding: "24px 32px", background: "#1b1c20",
                  border: b.orange ? `2.5px solid ${ORANGE}` : "1.5px solid rgba(255,255,255,0.08)",
                  boxShadow: b.orange ? "0 0 36px rgba(255,128,0,0.40)" : "none",
                  fontFamily: FONT, fontWeight: 500, fontSize: 44, lineHeight: "56px", color: "rgba(255,255,255,0.95)" }}>{b.text}</div>
              </div>
            );
          })}
          {/* input bar */}
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 84, borderRadius: 42, background: "#16171a", border: "1px solid rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", left: 66, bottom: 52, fontFamily: FONT, fontSize: 34, color: "rgba(255,255,255,0.28)" }}>Message</div>
        </div>
      </Cam2D>
      <Callout text={callout.text} at={tick} label={[Math.min(tick[0] + 250, 800), tick[1] + 170]} startFrame={callout.at} accent size={26} />
    </Bg2D>
  );
};

const CAM_C: Cam2 = { s: [1.0, 1.13], x: [34, -30], y: [-6, -40], r: [1.6, -0.8], len: 37 };
const CAM_D: Cam2 = { s: [1.13, 1.0], x: [-34, 30], y: [-40, 4], r: [-1.4, 1.0], len: 36 };

/* ================= SHOT E — 3D: phone on a plinth, orange coin arc leaves it ================= */
const ScreenFace: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 560; c.height = 1200;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0a0b0d"; g.fillRect(0, 0, 560, 1200);
    g.fillStyle = "#17181b"; g.fillRect(0, 0, 560, 120);
    g.fillStyle = "#2a2c31"; g.beginPath(); g.arc(70, 62, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2a2c31"; g.fillRect(120, 46, 190, 18); g.fillStyle = "#1f2024"; g.fillRect(120, 74, 120, 14);
    const bub = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, 28); g.fill(); };
    bub(34, 180, 400, 170, "#1d1e22"); bub(34, 380, 330, 120, "#1d1e22"); bub(200, 560, 320, 100, "#2c2e33");
    g.fillStyle = "#34363b";[0, 1, 2].forEach((k) => { g.fillRect(64, 218 + k * 40, k === 2 ? 180 : 320, 14); });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 0, 0.0765]}>
      <planeGeometry args={[1.32, 2.82]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
};

const CoinArc: React.FC<{ count?: number }> = ({ count = 16 }) => {
  const f = useCurrentFrame();
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(-0.1, 3.0, 0.35), new THREE.Vector3(-1.4, 4.1, -0.4), new THREE.Vector3(-3.6, 4.3, -2.6), new THREE.Vector3(-6.4, 2.6, -6.2), new THREE.Vector3(-9.4, 0.9, -11)]),
    [],
  );
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const start = -15 + i * 2.5;
        const p = (f - start) / 30;
        if (p <= 0 || p >= 1) return null;
        const pt = curve.getPoint(p);
        return (
          <group key={i} position={pt.toArray() as Vec3} rotation={[Math.PI / 2, 0, p * 7 + i]}>
            <Coin radius={0.24} accent position={[0, 0, 0]} />
          </group>
        );
      })}
    </group>
  );
};

const ShotE: React.FC = () => {
  const shot: Shot = { from: [4.6, 2.9, 12.6], to: [3.0, 3.1, 10.2], tFrom: [-0.9, 2.2, 0], tTo: [-1.5, 2.9, -0.6], fov: 30, len: 38 };
  return (
    <Studio3D tone="dark" shadows={false} camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>
      <CamRig shot={shot} />
      <Plinth position={[0.6, 0, 0]} radius={1.25} height={0.55} mat="clay" />
      <group position={[0.6, 2.2, 0]} rotation={[-0.08, 0.38, 0.04]}>
        <Phone position={[0, 0, 0]} rotation={[0, 0, 0]} />
        <ScreenFace />
      </group>
      <group position={[0.6, 0, 0]}><CoinArc /></group>
      <pointLight color="#FF8000" intensity={9} distance={7} position={[-1.2, 3.6, 1.2]} />
    </Studio3D>
  );
};

/* ================= SCENE ================= */
const Scene: React.FC<SceneProps> = (props) => {
  const fGuess = W(props, "guess", 0, 1.11);
  const fPretended = W(props, "pretended", 0, 1.79);
  const fSupport = W(props, "support", 0, 2.67);
  const fFor = W(props, "for", 0, 3.14);
  const fWallet = W(props, "wallet", 0, 3.6);
  const fMaker = W(props, "maker", 0, 3.98);
  const fAnd = W(props, "and", 0, 4.35);
  const fExchange = W(props, "exchange", 0, 4.81);
  const fAnd2 = W(props, "and", 1, 5.56);
  const fTrusted = W(props, "trusted", 0, 6.01);
  const total = props.durationInFrames ?? 205;

  const cB = fPretended - 7;  // ≈47
  const cC = fFor;            // ≈94 ("for his wallet maker")
  const cD = fAnd;            // ≈131 ("and his exchange")
  const cE = fAnd2;           // ≈167 ("And he trusted them")

  return (
    <Shell props={props} tone="dark">
      <Sequence from={0} durationInFrames={cB} layout="none">
        <ShotA stopAt={fGuess} />
      </Sequence>
      <Sequence from={cB} durationInFrames={cC - cB} layout="none">
        <ShotB noteAt={fPretended - cB} calloutAt={fSupport - cB} />
      </Sequence>
      <Sequence from={cC} durationInFrames={cD - cC} layout="none">
        <Thread cam={CAM_C} name="Wallet Support" glyph="headset" typingAt={2} callout={{ text: "FAKE: WALLET MAKER", at: fWallet - cC }}
          bubbles={[
            { text: "We detected unusual activity on your device…", at: fWallet - cC, orange: true, w: 780 },
            { text: "Please reply to confirm it's you.", at: fMaker - cC + 3, w: 660 },
          ]} />
      </Sequence>
      <Sequence from={cD} durationInFrames={cE - cD} layout="none">
        <Thread cam={CAM_D} name="Exchange Support" glyph="building" typingAt={1} callout={{ text: "FAKE: EXCHANGE", at: fExchange - cD }}
          bubbles={[
            { text: "Your account will be frozen in 30 minutes…", at: fAnd - cD + 5, orange: true, w: 780 },
            { text: "Verify now to keep access.", at: fExchange - cD + 5, w: 600 },
          ]} />
      </Sequence>
      <Sequence from={cE} durationInFrames={total - cE} layout="none">
        <ShotE />
      </Sequence>

      <Disclaimer text="Illustration · details per ZachXBT, Aug 2025 (messages illustrative)" />

      {/* SFX — soft on cuts, thud on the stop, click on the second fake thread */}
      <Sfx name="thud" at={fGuess} volume={0.45} />
      <Sfx name="whoosh_soft" at={cB} volume={0.3} />
      <Sfx name="tick" at={fPretended} volume={0.25} />
      <Sfx name="whoosh_soft" at={cC} volume={0.28} />
      <Sfx name="whoosh_soft" at={cD} volume={0.28} />
      <Sfx name="click" at={fExchange} volume={0.35} />
      <Sfx name="whoosh_soft" at={cE} volume={0.32} />
      <Sfx name="whoosh_soft" at={fTrusted} volume={0.3} />
    </Shell>
  );
};

export default Scene;
