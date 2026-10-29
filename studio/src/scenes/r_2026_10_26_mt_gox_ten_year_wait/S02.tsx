// S02 (light): clay exchange building "MT. GOX"; date lands on "February seventh"; orange padlock drops onto it on "stopped".
import React from "react";
import { Shell, Studio3D, Bank, Padlock, Enter, ChromeNumber, Label2, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => (
  <Shell props={props} tone="light">
    <Studio3D tone="light" camera={{ from: [0.6, 3.0, 15], to: [0, 2.7, 13], target: [0, 1.5, 0], fov: 32 }}>
      <Enter at={0} position={[0, 0, -0.5]}><Bank label="MT. GOX" scale={0.95} /></Enter>
      <Enter at={112} position={[0, 0, 1.15]} from={[0, 1.4, 0]} float={0.02}>
        <Padlock accent scale={0.55} position={[0, 0.36, 0]} />
      </Enter>
    </Studio3D>
    <ChromeNumber value="07.02.2014" y={330} size={120} delay={25} tone="light" />
    <Label2 text="withdrawals stopped" y={480} tone="light" delay={112} />
  </Shell>
);
export default Scene;
