# 07 — Cut

**Final:** `runs/2026-10-29-next/final/2026-10-29-next.mp4` · cover `final/cover.jpg` (frame 0: tile row `0x7A3f…`, no logo)

| Check | Result |
|---|---|
| Scenes | 16/16 renders present; composer verdicts: 9 PASS, 7 PASS-WITH-ISSUES (S03, S05, S07, S10, S11, S13, S16) |
| Duration | 86.00 s container (video 85.93 s / 2578 frames, audio 86.00 s). Sum of scene renders 85.95 s → Δ0.05 s ✓ |
| Spec | 1080×1920, 30 fps, H.264 yuv420p, AAC 48 kHz 192 kb/s, faststart |
| Loudness | −14.3 LUFS integrated ✓ (scenes were −16…−18; loudnorm I=−14, TP=−1), LRA 2.6 LU, sample peak −1.9 dBFS |
| Music | `brand/audio/music/bed_drone.wav` looped under everything at −24 dB (tokens.audio.musicDb), mixed before normalising. Not baked into any scene, so no double bed |
| Caption | Removed the "Footage: [clipper pending…]" placeholder from `05-caption.md` (0 clips used); kept "Magnified illustrations; all addresses shown are made up." |

## Join notes
- **S02 → S03 (12.29 s): 8-frame cross-dissolve added**, as `direction.json` asks of the cutter ("soft cross-dissolve 8 frames from S02 (cutter)"). `tools/stitch.sh` has no transition support, so I re-stitched by hand: centred dissolve (S02's last frame held 4 frames + S03's first frame held 4 frames, `xfade` over 8), so total length and VO/audio timing are unchanged. Audio across the join is a straight cut (untouched). Checked frame by frame: clean dark→light fade, no flash. The rest of the pipeline is identical to stitch.sh (bed amix, loudnorm, cover, review_frames).
- All other 14 joins are hard cuts as directed; checked the frames either side of each. No black frames, no undesigned flashes, no repeated frames at joins.
- `blackdetect` flags (0–0.23 s, 18.4–21.9 s, 43.6 s, 57.3–58.1 s, 79.7–80.7 s) are the house dark studio background in low-key shots, not black frames: every one shows content on inspection (frame 0 already has the tile row moving).
- Dimmed S01 tail (5.9 s) and S08 head (35.5 s) are designed (pasted row exits leaving the dim ghost; S08 opens on a dim row before the copy cursor), per composer notes.
- For the reviewer: short near-static holds at 38.8 s (0.37 s), 47.1 s (0.43 s) and 61.7–62.9 s (S12 lock screen, ~1.2 s). All under 3 s. Not a cut issue.
- Suggest adding a transition option to `tools/stitch.sh` so the next run doesn't need a manual re-stitch.

Review frames: `review/final/contact_sheet.jpg`, `review/final/stats.json`.
