// Single source of truth is ../../brand/tokens.json. Every scene pulls colours,
// type and motion from here — never hard-code a hex in a scene.
import { Easing, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import tokens from "../../brand/tokens.json";

// Fonts are bundled locally (studio/public/fonts) so renders never depend on the network.
const DISPLAY = tokens.type.display; // Orbitron — headlines, numbers, labels (as on dynk.io)
const BODY = tokens.type.body; // Outfit — captions, body, small UI text
for (const w of [500, 600, 700, 800, 900]) {
  loadFont({ family: DISPLAY, url: staticFile(`fonts/${DISPLAY}-${w}.woff2`), weight: String(w) });
}
for (const w of [400, 500, 600, 700, 800]) {
  loadFont({ family: BODY, url: staticFile(`fonts/${BODY}-${w}.woff2`), weight: String(w) });
}

export type ThemeName = keyof typeof tokens.themes;

export const brand = {
  ...tokens,
  display: `${DISPLAY}, "Arial Black", system-ui, sans-serif`,
  body: `${BODY}, system-ui, -apple-system, sans-serif`,
  // kept for older scenes
  fontFamily: `${BODY}, system-ui, sans-serif`,
  ease: Easing.bezier(...(tokens.motion.ease as [number, number, number, number])),
};

export const theme = (name: ThemeName = "paper") => tokens.themes[name];

export const FPS = tokens.video.fps;
export const WIDTH = tokens.video.width;
export const HEIGHT = tokens.video.height;

// Instagram UI covers the top bar, the caption block and the right-hand action rail.
export const SAFE = tokens.video.safeZone;
