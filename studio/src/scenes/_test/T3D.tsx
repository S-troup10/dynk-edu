// v2 test card (setup.sh renders frame 30 to check WebGL works): chrome coin stack, orange top coin, a number.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Studio3D, CoinStack, Enter, ChromeNumber, Label2, Grain, Vignette } from "../../kit";

export const T3D: React.FC = () => (
  <AbsoluteFill>
    <Studio3D tone="dark" camera={{ from: [0, 2.6, 11], to: [0, 2.3, 9.6], target: [0, 1.1, 0] }}>
      <Enter at={0}><CoinStack count={9} accentTop growAt={0} /></Enter>
    </Studio3D>
    <ChromeNumber value="1¢" unit="PER TX" y={330} delay={4} />
    <Label2 text="DYNK education · v2 test card" y={1540} />
    <Vignette />
    <Grain />
  </AbsoluteFill>
);
