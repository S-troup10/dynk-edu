#!/usr/bin/env bash
# Render a talking-head run: resolve the EDL → Remotion TalkVideo → loudness → review frames.
# Usage: tools/talk/render.sh runs/<id> [--draft]     (--draft = half resolution, ~3x faster)
# Output: runs/<id>/final/<id>.mp4 (or <id>.draft.mp4), cover.jpg, review/ frames + contact sheet
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RUN="$(cd "$1" && pwd)"; ID="$(basename "$RUN")"; DRAFT="${2:-}"
python3 "$ROOT/tools/talk/resolve_edl.py" "$RUN"
mkdir -p "$RUN/final"
SUFFIX=""; SCALE=()
if [ "$DRAFT" = "--draft" ]; then SUFFIX=".draft"; SCALE=(--scale=0.5); fi
RAW="$RUN/final/_raw$SUFFIX.mp4"
EXTRA=(); [ -n "${REMOTION_BROWSER:-}" ] && EXTRA=(--browser-executable="$REMOTION_BROWSER")
cd "$ROOT/studio"
npx remotion render src/index.ts TalkVideo "$RAW" --props="$RUN/work/props.json" --concurrency="${TALK_CONCURRENCY:-75%}" \
  --log=error "${SCALE[@]+"${SCALE[@]}"}" "${EXTRA[@]+"${EXTRA[@]}"}"
LUFS=$(python3 -c "import json;print(json.load(open('$ROOT/brand/tokens.json'))['audio']['exportLufs'])")
FINAL="$RUN/final/$ID$SUFFIX.mp4"
ffmpeg -v error -y -i "$RAW" -af "loudnorm=I=${LUFS}:TP=-1.0:LRA=11" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$FINAL"
rm -f "$RAW"
ffmpeg -v error -y -i "$FINAL" -frames:v 1 -q:v 2 "$RUN/final/cover$SUFFIX.jpg"
"$ROOT/tools/review_frames.sh" "$FINAL" "$RUN/review/final$SUFFIX" 0.5
echo "Final: $FINAL"
