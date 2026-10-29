// Shared props for run 2026-10-29-next (address poisoning). Written by the director.
// Composers IMPORT from here, never edit it (S01, S08, S15, S16 must match frame-for-frame for the loop).
//
//   import { REAL, FAKE, SHORT, TileRow, UI } from "./_shared";
//   <TileRow chars={REAL} position={[0, 1.2, 0]} glow={FIRST4} />
//
// All addresses are made up. Never put a real address on screen.
import React, { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { glyphTexture, Mat } from "../../kit";

type Vec3 = [number, number, number];

/** The address the viewer meant (40 hex after 0x). */
export const REAL = "0x7A3fc91E5d28A6B0e4F17c3D9a82E6F1b04D9c2E";
/** The scammer's lookalike: same first 4 and last 4 after 0x, every middle character different. */
export const FAKE = "0x7A3fe05B71dC3a9F6248bD0E5c17A3f8D2b69c2E";
/** How most apps shorten both of them (identical on purpose). */
export const SHORT = "0x7A3f…9c2E";

/** Tile index helpers (index into the 42-character string incl. "0x"). */
export const FIRST4 = [2, 3, 4, 5];
export const LAST4 = [38, 39, 40, 41];
export const MIDDLE = Array.from({ length: 32 }, (_, i) => i + 6);

/** Phone screens (Phone `screen` prop / Img). Generic wallet UI, no logo, no DYNK name. Paths are staticFile() paths. */
export const UI = {
  history: "runs/2026-10-29-next/ui-history.png",               // 4 rows, top = "Sent 0x7A3f…9c2E −0.25 ETH 21 Oct" (the real one)
  historyPlanted: "runs/2026-10-29-next/ui-history-planted.png", // + new top row "Received 0x7A3f…9c2E +0.00 ETH just now"
  historyCopy: "runs/2026-10-29-next/ui-history-copy.png",       // real row long-pressed, "Copy address" menu
  send: "runs/2026-10-29-next/ui-send.png",                      // Send screen, To = REAL in full (mono, 2 lines)
  lock: "runs/2026-10-29-next/ui-lock.png",                      // lock screen, "Received +0.00 ETH from 0x7A3f…9c2E"
  contacts: "runs/2026-10-29-next/ui-contacts.png",              // "Send to": search @username + QR, saved contacts, Sam ticked
};
/** Chainalysis captures (B&W grade them: <Img style={{filter:"grayscale(1) contrast(1.05)"}}/>). */
export const PROOF = {
  title: "runs/2026-10-29-next/S10-chainalysis-title.png",       // "CRIME / Anatomy of an Address Poisoning Scam / October 23, 2024 | Chainalysis Team" (crop off the blue hero strip at the bottom)
  may3: "runs/2026-10-29-next/S10-chainalysis-may3.png",         // paragraph: "...took place on May 3rd ... $68 million in wrapped bitcoin (WBTC)..."
  returned: "runs/2026-10-29-next/S11-chainalysis-returned.png", // paragraph: "...the scammer returned the original $68 million ... on May 9th..."
  seeded: "runs/2026-10-29-next/S11-chainalysis-82031.png",      // paragraph: "...we identified 82,031 potential seeded addresses..."
};

/** One glass character tile. ~0.42 wide. `glow` = orange emissive (the ONE accent system). `dim` = greyed out. */
export const Tile: React.FC<{ ch: string; position?: Vec3; glow?: boolean; dim?: boolean; flip?: number; flipTo?: string }> = ({
  ch, position = [0, 0, 0], glow = false, dim = false, flip = 0, flipTo,
}) => {
  // flip 0..1 rotates the tile about X; past 0.5 it shows flipTo.
  const shown = flipTo && flip >= 0.5 ? flipTo : ch;
  const tex = useMemo(
    () => glyphTexture(shown, { font: "600 300px 'DejaVu Sans Mono', monospace", w: 256, h: 320, fg: glow ? "#1a1208" : dim ? "#6a6a6a" : "#f1f1f1", bg: glow ? "#FF8000" : "#1b1c1f" }),
    [shown, glow, dim],
  );
  return (
    <group position={position} rotation={[flip * Math.PI, 0, 0]}>
      <RoundedBox args={[0.4, 0.5, 0.08]} radius={0.04} smoothness={2}>
        <Mat kind={glow ? "accent" : "graphite"} />
      </RoundedBox>
      <mesh position={[0, 0, flip >= 0.5 ? -0.041 : 0.041]} rotation={[flip >= 0.5 ? Math.PI : 0, 0, 0]}>
        <planeGeometry args={[0.34, 0.44]} />
        <meshStandardMaterial map={tex} metalness={0.2} roughness={0.35} emissive={glow ? "#FF6A00" : "#000000"} emissiveIntensity={glow ? 0.35 : 0} />
      </mesh>
    </group>
  );
};

/**
 * A row of tiles spelling an address, centred on `position` (x), standing on the floor by default.
 * glow / dim: tile indices. flip: 0..1 for the `flipIdx` tiles, which turn over to show `flipTo[i]`.
 * gap: spacing between tile centres. Row length ≈ chars.length * gap (42 × 0.46 ≈ 19.3 units),
 * so frame a part of it and track the camera along x (FIRST4 centre x ≈ -7.8, LAST4 centre x ≈ +8.7; use tileX(i)).
 */
export const TileRow: React.FC<{
  chars?: string; position?: Vec3; gap?: number; glow?: number[]; dim?: number[];
  flipIdx?: number[]; flip?: number; flipTo?: string; only?: [number, number];
}> = ({ chars = REAL, position = [0, 0.25, 0], gap = 0.46, glow = [], dim = [], flipIdx = [], flip = 0, flipTo, only }) => {
  const n = chars.length;
  const [a, b] = only ?? [0, n];
  return (
    <group position={position}>
      {chars.split("").map((c, i) =>
        i < a || i >= b ? null : (
          <Tile key={i} ch={c} position={[(i - (n - 1) / 2) * gap, 0, 0]} glow={glow.includes(i)} dim={dim.includes(i)}
            flip={flipIdx.includes(i) ? flip : 0} flipTo={flipTo ? flipTo[i] : undefined} />
        ),
      )}
    </group>
  );
};

/** x position (row-local) of tile i, for aiming the camera / callouts. */
export const tileX = (i: number, n = REAL.length, gap = 0.46) => (i - (n - 1) / 2) * gap;
