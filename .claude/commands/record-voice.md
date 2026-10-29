---
description: Swap the AI voice for your own recording on a run, then rebuild from the director stage
argument-hint: "<run-id>"
---

Run: `$ARGUMENTS`

1. Show Cooper a teleprompter: each line from `runs/<run-id>/vo_lines.json` numbered by scene, with the AI version's length in seconds (from the `.words.json` files) so he can match pace.
2. Tell him the two options:
   - one file per scene → `runs/<run-id>/audio/vo/S01.recorded.m4a`, `S02.recorded.m4a`… (best)
   - one take for the whole thing with a 1-second pause between scenes → `runs/<run-id>/audio/voiceover.recorded.m4a`
   Voice Memos on iPhone, AirDropped to the Mac, is fine.
3. When the files are in place, run `python3 tools/use_recorded_vo.py runs/<run-id>` (installs nothing; for better caption timing, `pip3 install faster-whisper` once).
4. Continue with `/make-video resume <run-id> director`.
