// S08 close: the takeaway line, then the @dynkeducation profile card with a Follow tap, then the D mark.
import React from "react";
import { Sequence } from "remotion";
import { Shell, Line, ProfileEndCard, EndMark, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => (
  <Shell props={props} tone="dark" captions={false}>
    <Sequence durationInFrames={72}>
      <Line text="Not your keys, not your coins." accentWords={["keys"]} y={860} size={66} startFrame={2} stagger={4} />
    </Sequence>
    <Sequence from={72}>
      <ProfileEndCard bio="Self-custody, explained. No hype, no price talk." line="we're just an education page." />
    </Sequence>
    <Sequence from={170}><EndMark light={false} /></Sequence>
  </Shell>
);
export default Scene;
