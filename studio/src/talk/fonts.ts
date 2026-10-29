// Fonts for the talking-head "paper" style. All SIL OFL, bundled in public/fonts/talk.
//  - Instrument Serif: editorial titles and big numbers (the 2025–26 serif comeback)
//  - Shantell Sans: marker handwriting that stays readable on a phone
//  - TikTok Sans: captions and the hook box, so on-screen text looks native to the feed
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

loadFont({ family: "Instrument Serif", url: staticFile("fonts/talk/InstrumentSerif-400.woff2"), weight: "400", style: "normal" });
loadFont({ family: "Instrument Serif", url: staticFile("fonts/talk/InstrumentSerif-400-italic.woff2"), weight: "400", style: "italic" });
for (const w of [500, 600, 700, 800]) {
  loadFont({ family: "Shantell Sans", url: staticFile(`fonts/talk/ShantellSans-${w}.woff2`), weight: String(w) });
  loadFont({ family: "TikTok Sans", url: staticFile(`fonts/talk/TikTokSans-${w}.woff2`), weight: String(w) });
}

export const SERIF = `"Instrument Serif", Georgia, serif`;
export const HAND = `"Shantell Sans", "Comic Sans MS", system-ui, sans-serif`;
export const NATIVE = `"TikTok Sans", system-ui, -apple-system, sans-serif`;

export const INK = {
  paper: "#F3EEE4",
  ink: "#1D1D1B",
  soft: "rgba(29,29,27,0.62)",
  orange: "#FF8000",
  highlighter: "rgba(255,140,0,0.42)",
  red: "#D6382B",
  green: "#2E9C4E",
  note: "#FFE58A",
  noteOrange: "#FFC58A",
};
