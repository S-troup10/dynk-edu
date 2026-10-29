// Scene: 2026-10-29-next S09
// STUB (v2). The composer for this scene replaces the body. Read references/style-0x100x.md first.
// Rules: Shell tone dark|light · one subject per shot · ONE orange accent · camera always slowly moving ·
// small type (whisper captions are automatic) · land objects on their VO words (props.vo.words[i].start * 30).
// Worked examples: ../_demo_v2/S01..S05.tsx
import React from "react";
import { Shell, Studio3D, CoinStack, Enter, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => (
  <Shell props={props} tone="dark">
    <Studio3D tone="dark" camera={{ from: [0, 2.4, 12], to: [0, 2.1, 10], target: [0, 1, 0] }}>
      <Enter at={6}>
        <CoinStack count={7} accentTop />
      </Enter>
    </Studio3D>
  </Shell>
);

export default Scene;
