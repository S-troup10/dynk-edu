// S06 (light): the years tick 2014 → 2024 while court papers pile up; a thin timeline draws, JUL 2024 in orange.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Shell, Studio3D, Documents, Enter, ChromeNumber, Timeline, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const year = Math.round(interpolate(f, [55, 160], [2014, 2024], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const piles = Math.round(interpolate(f, [40, 150], [1, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Shell props={props} tone="light">
      <Studio3D tone="light" camera={{ from: [0, 4.2, 11], to: [0, 3.8, 9.6], target: [0, 0.4, 0], fov: 32 }}>
        <Enter at={30} position={[0, 0, 1.2]}>
          <Documents count={piles * 3} rotation={[0, 0.3, 0]} />
        </Enter>
        {piles > 4 && <Enter at={95} position={[-1.6, 0, 0.6]}><Documents count={(piles - 4) * 3} rotation={[0, -0.4, 0]} /></Enter>}
        {piles > 6 && <Enter at={125} position={[1.6, 0, 0.4]}><Documents count={(piles - 6) * 3} rotation={[0, 0.9, 0]} /></Enter>}
      </Studio3D>
      <ChromeNumber value={String(year)} y={330} size={150} delay={0} tone="light" />
      <Timeline y={760} startFrame={20} tone="light" points={[
        { label: "FEB 2014", sub: "withdrawals stop" },
        { label: "2014–2024", sub: "court cases" },
        { label: "JUL 2024", sub: "repayments begin", accent: true },
      ]} />
    </Shell>
  );
};
export default Scene;
