import React from "react";
import { Composition } from "remotion";
import { FPS, WIDTH, HEIGHT } from "./brand";
import { scenes } from "./scenes/registry";
import { T3D } from "./scenes/_test/T3D";
import V3Hook from "./scenes/_demo_v3/Hook";
import V3Share from "./scenes/_demo_v3/Share";
import type { SceneProps } from "./components";
import { TalkVideo } from "./talk/TalkVideo";
import type { TalkProps } from "./talk/types";

// Every scene is its own composition so composer agents can render in parallel.
// Duration comes from the scene's props.json (set by the director from the VO length).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="test-3d" component={T3D} fps={FPS} width={WIDTH} height={HEIGHT} durationInFrames={60} />
    {/* v3 "magnified explainer" grammar demos (references/style-speedy_devv.md) */}
    <Composition id="demo-v3-hook" component={V3Hook as React.FC<SceneProps>} fps={FPS} width={WIDTH} height={HEIGHT} durationInFrames={180}
      defaultProps={{ runId: "demo", sceneId: "v3-hook", durationInFrames: 180, showCaptions: true } as SceneProps} />
    <Composition id="demo-v3-share" component={V3Share as React.FC<SceneProps>} fps={FPS} width={WIDTH} height={HEIGHT} durationInFrames={120}
      defaultProps={{ runId: "demo", sceneId: "v3-share", durationInFrames: 120, showCaptions: true } as SceneProps} />
    {scenes.map(({ id, component }) => (
      <Composition
        key={id}
        id={id}
        component={component as React.FC<SceneProps>}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        durationInFrames={180}
        defaultProps={{ runId: "demo", sceneId: id, durationInFrames: 180 } as SceneProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Math.round((props as SceneProps).durationInFrames ?? 90)),
        })}
      />
    ))}
    {/* Talking-head + board explainer (/talk-video, tools/talk). Size and length come from the resolved EDL. */}
    <Composition
      id="TalkVideo"
      component={TalkVideo as unknown as React.FC<Record<string, unknown>>}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={300}
      defaultProps={{} as Record<string, unknown>}
      calculateMetadata={({ props }) => {
        const p = props as unknown as TalkProps;
        return { durationInFrames: Math.max(1, p.durationInFrames ?? 300), width: p.width ?? 1080, height: p.height ?? 1920, fps: p.fps ?? 30 };
      }}
    />
  </>
);
