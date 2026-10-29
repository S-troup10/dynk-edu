// S01 cold open: hard-cut B&W news footage + typewriter line (0x100x signature opener)
import React from "react";
import { Shell, HookMontage, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const a = props.assets as Record<string, string>;
  return (
    <Shell props={props} tone="dark" captions={false}>
      <HookMontage
        text={props.onScreenText as string}
        textY={860}
        cps={17}
        clips={[
          { src: a.sbf, frames: 42, startFromSec: 0.3, objectPosition: "50% 30%" },
          { src: a.bloomberg, frames: 38, startFromSec: 2.0 },
          { src: a.reuters, frames: 36, startFromSec: 4.75 },
          { src: a.sbf, frames: 40, startFromSec: 2.6 },
        ]}
      />
    </Shell>
  );
};
export default Scene;
