// v3 demo: the hook frame grammar (paradox line, sentence-building caption with ONE boxed keyword,
// magnified object, ONE orange glowing system, callouts on named parts, honesty tag).
// Script: "Your crypto wallet doesn't hold a single coin, and you can still lose everything in it."
import React from "react";
import { useCurrentFrame } from "remotion";
import { Shell, Studio3D, Phone, Key, Enter, EnergyArcs, Callout, Disclaimer, type SceneProps, type Word } from "../../kit";

const LINE = "Your crypto wallet doesn't hold a single coin, and you can still lose everything in it.";
const words: Word[] = LINE.split(" ").map((t, i) => ({ text: t, start: 0.15 + i * 0.32, end: 0.15 + i * 0.32 + 0.28 }));

const Scene: React.FC<SceneProps> = (props) => {
  const f = useCurrentFrame();
  const p: SceneProps = { ...props, vo: { src: "", words }, captionKeywords: ["wallet", "everything"], captionEmoji: { wallet: "📱" } };
  return (
    <Shell props={p} tone="dark">
      <Studio3D tone="dark" camera={{ from: [0.5, 2.3, 14], to: [0.2, 2.1, 12.5], target: [0, 1.4, 0], fov: 32 }}>
        <Enter at={0} position={[0, 0, 0]} float={0.04}><Phone rotation={[-0.35, -0.3, 0]} position={[0, 1.6, 0]} scale={1.15} /></Enter>
        {f > 40 && <Enter at={40} position={[0, 0.5, 1.6]} from={[0, 0.6, 0]} float={0.05}><Key accent scale={0.38} rotation={[0, 0.4, Math.PI / 2]} position={[0, 0, 0]} /></Enter>}
      </Studio3D>
      <EnergyArcs x={500} y={1235} width={300} height={120} startFrame={44} />
      <Callout text="Wallet app" at={[560, 860]} label={[300, 700]} startFrame={18} />
      <Callout text="Key" at={[600, 1250]} label={[820, 1330]} startFrame={52} accent />
      <Disclaimer text="Magnified illustration" />
    </Shell>
  );
};
export default Scene;
