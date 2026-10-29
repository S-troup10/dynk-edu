#!/usr/bin/env bash
# Render one scene and pull review frames from it.
# Usage: tools/render_scene.sh runs/<id> S01
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN="$(cd "$1" && pwd)"; SID="$2"
COMP="$(python3 -c "import json,sys;print([s['composition'] for s in json.load(open('$RUN/scenes/index.json')) if s['sceneId']=='$SID'][0])")"
OUT="$RUN/renders/$SID.mp4"
cd "$ROOT/studio"
EXTRA=(); [ -n "${REMOTION_BROWSER:-}" ] && EXTRA=(--browser-executable="$REMOTION_BROWSER")
npx remotion render src/index.ts "$COMP" "$OUT" --props="$RUN/scenes/$SID/props.json" --gl="${REMOTION_GL:-$( [ "$(uname)" = Darwin ] && echo angle || echo swangle )}" --log=error "${EXTRA[@]+"${EXTRA[@]}"}"
"$ROOT/tools/review_frames.sh" "$OUT" "$RUN/review/$SID"
echo "Rendered $OUT"
