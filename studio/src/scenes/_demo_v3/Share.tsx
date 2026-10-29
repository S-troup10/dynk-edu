// v3 demo: CTA close, "Follow me and send this to someone who keeps their seed phrase in their camera roll."
import React from "react";
import { Shell, ShareSheetEnd, type SceneProps, type Word } from "../../kit";
const LINE = "Send this to someone who keeps their seed phrase in their camera roll.";
const words: Word[] = LINE.split(" ").map((t, i) => ({ text: t, start: 0.1 + i * 0.3, end: 0.38 + i * 0.3 }));
const Scene: React.FC<SceneProps> = (props) => (
  <Shell props={{ ...props, vo: { src: "", words }, captionKeywords: ["camera"] }} tone="dark">
    <ShareSheetEnd startFrame={6} />
  </Shell>
);
export default Scene;
