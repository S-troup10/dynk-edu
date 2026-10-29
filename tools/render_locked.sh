#!/usr/bin/env bash
# Cloud render wrapper: one full scene render at a time (2-CPU box, software WebGL), then review frames.
# Usage: tools/render_locked.sh runs/<id> S01
set -euo pipefail
export REMOTION_BROWSER="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
export REMOTION_GL="${REMOTION_GL:-swangle}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p /tmp/claude-0
exec flock /tmp/claude-0/render.lock "$ROOT/tools/render_scene.sh" "$@"
