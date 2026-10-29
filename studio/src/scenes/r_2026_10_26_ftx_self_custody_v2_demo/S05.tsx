// S05 end card: @dynkeducation profile mock with a cursor tapping Follow, then the D mark outro.
import React from "react";
import { Sequence } from "remotion";
import { Shell, ProfileEndCard, EndMark, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => (
  <Shell props={props} tone="dark" captions={false}>
    <ProfileEndCard bio="Self-custody, explained. No hype, no price talk." line="we're just an education page." />
    <Sequence from={108}><EndMark light={false} /></Sequence>
  </Shell>
);
export default Scene;
