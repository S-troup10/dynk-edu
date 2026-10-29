#!/usr/bin/env bash
# Pull frames so an agent can SEE a render: first frame, a frame every 0.5s,
# and one contact sheet with timestamps. Also reports loudness.
# Usage: tools/review_frames.sh <video.mp4> <outdir> [interval_sec]
set -euo pipefail
IN="$1"; OUT="$2"; STEP="${3:-0.5}"
mkdir -p "$OUT"; rm -f "$OUT"/f_*.jpg
ffmpeg -v error -y -i "$IN" -vf "select=eq(n\,0)" -frames:v 1 -q:v 3 "$OUT/first_frame.jpg"
ffmpeg -v error -y -i "$IN" -vf "fps=1/$STEP,scale=360:-2,drawtext=text='%{pts\:hms}':x=10:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6" -q:v 4 "$OUT/f_%03d.jpg"
N=$(ls "$OUT"/f_*.jpg | wc -l | tr -d ' ')
COLS=6; ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -v error -y -framerate 1 -i "$OUT/f_%03d.jpg" -vf "tile=${COLS}x${ROWS}:padding=6:color=0x222222" -frames:v 1 -q:v 3 "$OUT/contact_sheet.jpg"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
LUFS=$(ffmpeg -nostats -i "$IN" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}' || true)
echo "{\"duration\": $DUR, \"frames\": $N, \"integratedLUFS\": \"${LUFS:-n/a}\"}" > "$OUT/stats.json"
cat "$OUT/stats.json"
