# 07 — Cut
- Final: `final/2026-11-12-wallet-holds-a-key.mp4` — 62.4 s, 1080×1920, 30 fps, −14.0 LUFS, peak −1.5 dBFS. v2 (13 Nov): voice re-done as ONE continuous take (`tools/tts_take.py`), static polish, mixed in at stitch; all scenes re-rendered to the new timings.
- VO: Kokoro am_michael ×1.12, one synthesis per line. Bed: `brand/audio/music/bed_drone.wav`.
- 12 scenes composed by Sonnet (stopped by the usage limit during their still checks); director did the still review,
  fixed framing (S01 letterbox shots, S10 payoff, S11 wall vs caption band, S12 CTA overflow), one crash (S05
  interpolate range) and rendered everything single-instance (`--concurrency=1`).
- Jitter check (all 12 scenes, every frame): no alternating-frame runs (longest run 1 = hard cuts only).
- Known minor: the rubbish heap is stylised (faceted lumps); loose coins in S10 read bright silver.
