// S04 (light): a crowd of customers fills in; 127,000 lands on "thousand".
import React from "react";
import { Shell, Studio3D, Person, Enter, ChromeNumber, Label2, type SceneProps } from "../../kit";

const Scene: React.FC<SceneProps> = (props) => {
  const crowd: [number, number][] = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) crowd.push([(c - 3) * 1.25 + (r % 2) * 0.6, -r * 1.35 + 0.6]);
  return (
    <Shell props={props} tone="light">
      <Studio3D tone="light" camera={{ from: [0, 3.0, 10.5], to: [0, 2.7, 9.0], target: [0, 0.9, -2.5], fov: 36 }}>
        {crowd.map(([x, z], i) => (
          <Enter key={i} at={Math.max(0, i * 0.5 - 4)} position={[x, 0, z]} float={0}>
            <Person scale={0.72} mat="clay" />
          </Enter>
        ))}
      </Studio3D>
      <ChromeNumber value="127,000" y={330} size={150} delay={30} tone="light" />
      <Label2 text="customers · bankruptcy filing, 28 feb 2014" y={510} tone="light" delay={40} />
    </Shell>
  );
};
export default Scene;
