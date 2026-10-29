#!/usr/bin/env bash
# Cutter: stitch scene renders in order, optional music bed, loudness-normalise, export.
# Usage: tools/stitch.sh runs/<id> [path/to/music.mp3]
# Output: runs/<id>/final/<id>.mp4 + cover.jpg (first frame) + review frames.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN="$(cd "$1" && pwd)"; ID="$(basename "$RUN")"; MUSIC="${2:-}"
LIST="$RUN/final/concat.txt"; mkdir -p "$RUN/final"
python3 - "$RUN" "$LIST" <<'PY'
import json, os, sys
run, out = sys.argv[1], sys.argv[2]
order = [s["sceneId"] for s in json.load(open(os.path.join(run, "scenes", "index.json")))]
missing = [s for s in order if not os.path.exists(os.path.join(run, "renders", f"{s}.mp4"))]
if missing: sys.exit(f"Missing renders: {missing}")
open(out, "w").write("".join(f"file '{os.path.join(run, 'renders', s + '.mp4')}'\n" for s in order))
PY
RAW="$RUN/final/_joined.mp4"
# Re-encode on join so every scene boundary is frame-accurate and audio stays in sync.
ffmpeg -v error -y -f concat -safe 0 -i "$LIST" -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -r 30 -c:a aac -ar 48000 -b:a 192k "$RAW"
EXPORT_LUFS=$(python3 -c "import json;print(json.load(open('$ROOT/brand/tokens.json'))['audio']['exportLufs'])")
FINAL="$RUN/final/$ID.mp4"
if [ -n "$MUSIC" ]; then
  MUSIC_DB=$(python3 -c "import json;print(json.load(open('$ROOT/brand/tokens.json'))['audio']['musicDb'])")
  ffmpeg -v error -y -i "$RAW" -stream_loop -1 -i "$MUSIC" -filter_complex \
    "[1:a]volume=${MUSIC_DB}dB[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=${EXPORT_LUFS}:TP=-1.0:LRA=11[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$FINAL"
else
  ffmpeg -v error -y -i "$RAW" -af "loudnorm=I=${EXPORT_LUFS}:TP=-1.0:LRA=11" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$FINAL"
fi
rm -f "$RAW"
ffmpeg -v error -y -i "$FINAL" -frames:v 1 -q:v 2 "$RUN/final/cover.jpg"
"$ROOT/tools/review_frames.sh" "$FINAL" "$RUN/review/final"
echo "Final: $FINAL"
