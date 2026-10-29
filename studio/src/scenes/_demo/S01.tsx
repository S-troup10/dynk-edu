// Brand test card + reference scene. Shows the three themes and the main kit blocks.
// Composers: copy these patterns; do not import from other scenes.
import React from "react";
import { Sequence } from "remotion";
import {
  SceneShell,
  Label,
  KineticText,
  Stat,
  Chip,
  Badge,
  Ticker,
  StrikeCompare,
  Arrow,
  RehookPunch,
  OrangeWipe,
  type SceneProps,
} from "../../components";

const Scene: React.FC<SceneProps> = (props) => (
  <>
    {/* 0–2s · PAPER: label + headline with orange and faded words + count-up stat */}
    <Sequence durationInFrames={60}>
      <SceneShell props={{ ...props, vo: null }} theme="paper">
        <Label text="Self-custody" />
        <KineticText
          text="Your exchange can freeze your money."
          accentWords={["freeze"]}
          mutedWords={["money."]}
          y={80}
        />
        <Stat value={400} unit="ms" label="to settle on Solana" y={1000} delay={14} />
        <OrangeWipe atFrame={50} />
      </SceneShell>
    </Sequence>

    {/* 2–4s · ORANGE: pattern-interrupt rehook, badge, ticker */}
    <Sequence from={60} durationInFrames={60}>
      <SceneShell props={{ ...props, vo: null }} theme="orange" glow>
        <RehookPunch atFrame={0}>
          <KineticText text="OWN IT. GROW IT." size={150} align="center" y={260} />
          <Badge x={390} y={900} size={300} />
          <Ticker y={1380} variant="ink" />
        </RehookPunch>
      </SceneShell>
    </Sequence>

    {/* 4–6s · INK: strike-through comparison, chips, annotation arrow */}
    <Sequence from={120} durationInFrames={60}>
      <SceneShell props={{ ...props, vo: null }} theme="ink">
        <Label text="Fees" />
        <StrikeCompare before="2–3% card fees" after="1¢ flat" y={90} />
        <Chip label="Non-custodial" x={70} y={900} enterFrame={20} />
        <Chip label="Seed phrase" value="optional" x={250} y={1060} enterFrame={26} variant="white" />
        <Arrow x={720} y={720} rotate={200} size={170} delay={30} />
      </SceneShell>
    </Sequence>
  </>
);

export default Scene;
