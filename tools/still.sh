#!/usr/bin/env bash
# Full-size check stills for one scene (bundles once, then one still per frame; queued behind other renders).
# Usage: tools/still.sh runs/<id> S01 12,45,80   -> runs/<id>/review/<SID>/still-<f>.png
set -euo pipefail
B="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; RUN="$(cd "$1" && pwd)"; SID="$2"; FRAMES="$3"
COMP="$(python3 -c "import json;print([s['composition'] for s in json.load(open('$RUN/scenes/index.json')) if s['sceneId']=='$SID'][0])")"
mkdir -p "$RUN/review/$SID" /tmp/claude-0; cd "$ROOT/studio"
BUN="/tmp/claude-0/bundle-$SID"; rm -rf "$BUN"
npx remotion bundle src/index.ts --out-dir="$BUN" --log=error >/dev/null
for f in ${FRAMES//,/ }; do
  flock /tmp/claude-0/render.lock npx remotion still "$BUN" "$COMP" "$RUN/review/$SID/still-$f.png" --props="$RUN/scenes/$SID/props.json" --frame="$f" --gl=swangle --log=error --browser-executable="$B"
  echo "$RUN/review/$SID/still-$f.png"
done
