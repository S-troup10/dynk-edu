#!/usr/bin/env bash
# Bundle once, then full-size check stills for many scenes. Usage: tools/stills_all.sh runs/<id> "S01:0,40,110 S02:20,80"
set -uo pipefail
B="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; RUN="$(cd "$1" && pwd)"; SPEC="$2"
cd "$ROOT/studio"; BUN=/tmp/claude-0/bundle-all; rm -rf "$BUN"
npx remotion bundle src/index.ts --out-dir="$BUN" --log=error >/dev/null || { echo "BUNDLE FAILED"; exit 1; }
for item in $SPEC; do
  SID="${item%%:*}"; FR="${item#*:}"
  COMP="$(python3 -c "import json;print([s['composition'] for s in json.load(open('$RUN/scenes/index.json')) if s['sceneId']=='$SID'][0])")"
  mkdir -p "$RUN/review/$SID"; rm -f "$RUN/review/$SID"/still-*.png
  for f in ${FR//,/ }; do
    npx remotion still "$BUN" "$COMP" "$RUN/review/$SID/still-$f.png" --props="$RUN/scenes/$SID/props.json" --frame="$f" --gl=swangle --log=error --browser-executable="$B" --scale=0.5 2>&1 | tail -3 | sed "s/^/$SID f$f: /"
  done
  ls "$RUN/review/$SID"/still-*.png >/dev/null 2>&1 && ffmpeg -v error -y $(for f in ${FR//,/ }; do echo -i "$RUN/review/$SID/still-$f.png"; done) -filter_complex "hstack=inputs=$(echo ${FR//,/ } | wc -w)" "$RUN/review/$SID/strip.jpg" && echo "$SID ok"
done
