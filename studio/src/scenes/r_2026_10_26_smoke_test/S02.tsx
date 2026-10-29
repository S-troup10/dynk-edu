// Scene: 2026-10-26-smoke-test S02
// STUB — the composer agent for this scene replaces the body below.
// Rules: pick a theme (paper default · ink for tension · orange ONLY for rehooks/reveals),
// build from ../../components, read text/assets from props, stay inside SAFE,
// nothing static for longer than brand.motion.maxStaticSeconds. See _demo/S01.tsx.
import React from "react";
import { SceneShell, KineticText, Label, type SceneProps } from "../../components";

const Scene: React.FC<SceneProps> = (props) => (
  <SceneShell props={props} theme="paper">
    <Label text="DYNK Education" />
    <KineticText text={(props.onScreenText as string) || "TODO"} accentWords={props.accentWords as string[]} y={80} />
  </SceneShell>
);

export default Scene;
