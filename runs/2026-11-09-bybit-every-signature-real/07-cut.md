# 07 — Cut (v3, race-fixed)

- Final: `final/2026-11-09-bybit-every-signature-real.mp4` — 61.1 s, 1080×1920, 30 fps, −14.2 LUFS. v3.2 (11 Nov): VO re-synthesised one line per call (natural prosody, no per-phrase tone resets), "Ethereum" phonetic, signatures on the line; all 12 scenes re-rendered.
- Bed: `brand/audio/music/bed_drone.wav`; VO Kokoro am_michael ×1.12.
- 12 scenes, all re-rendered after two jitter root causes were fixed:
  1. **Camera-writer race** — Studio3D's built-in rig (useLayoutEffect) and the scene `CamRig` both wrote the camera; frames alternated between them. `CamRig` now drives the camera in `useFrame(..., -10)` so it always wins.
  2. **Multi-tab rendering** — Remotion's default concurrency rendered alternate frames in different Chrome tabs with different baked lighting/camera state. `tools/render_scene.sh` now passes `--concurrency=1`.
- Verification: per-frame mean-brightness "flips" on card/text crops of every 3D scene (S01–S11) = 0, plus checked again on the final file. S07's swing is the real card flip; S09's single step at f36 is the shot A→B cut.
- Earlier cuts kept for reference: `v1/` (rejected, same-world copy), `v2-racy/` (new world, pre-fix renders).
