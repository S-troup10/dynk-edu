// S01 cold open: B&W 2014 footage (Karpelès press conference, protest signs, the customer notice) + typewriter.
import React from "react";
import { Shell, HookMontage, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const a = props.assets as Record<string, string>;
  return (
    <Shell props={props} tone="dark" captions={false}>
      <HookMontage
        text={props.onScreenText as string}
        textY={880}
        cps={16}
        clips={[
          { src: a.karpeles, frames: 30, startFromSec: 3.4, objectPosition: "50% 40%" },
          { src: a.protest, frames: 36, startFromSec: 15.6 },
          { src: a.notice, frames: 34, startFromSec: 0.4 },
          { src: a.karpeles, frames: 40, startFromSec: 6.1 },
          { src: a.protest, frames: 30, startFromSec: 7.8 },
          { src: a.protest, frames: 28, startFromSec: 18.2 },
        ]}
      />
    </Shell>
  );
};
export default Scene;
