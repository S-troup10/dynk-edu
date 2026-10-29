#!/usr/bin/env bash
# One-time setup in a Linux cloud session (Claude Code on the web, a VM, Codespaces, a CI box).
# The Mac version is setup.sh. Run from the repo root:  bash setup-cloud.sh
set -uo pipefail
cd "$(dirname "$0")"
ok() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
bad() { printf "  \033[31m✗\033[0m %s\n" "$1"; MISSING=1; }
MISSING=0
SUDO=""; [ "$(id -u)" != 0 ] && command -v sudo >/dev/null && SUDO="sudo"

echo "System packages…"
if ! command -v ffmpeg >/dev/null; then
  ($SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg >/dev/null) && ok "ffmpeg" || bad "ffmpeg (apt-get install ffmpeg)"
else ok "ffmpeg"; fi
# Chromium runtime libs Remotion's headless browser needs on a bare Linux box
$SUDO apt-get install -y -qq libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 fonts-noto-color-emoji >/dev/null 2>&1 || true
command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] && ok "Node $(node -v)" || bad "Node 20+"
command -v python3 >/dev/null && ok "Python $(python3 --version | cut -d' ' -f2)" || bad "Python 3"

echo "Python tools…"
PIP="python3 -m pip install --quiet --user"
{ $PIP edge-tts "yt-dlp[default]" faster-whisper numpy 2>/dev/null || $PIP --break-system-packages edge-tts "yt-dlp[default]" faster-whisper numpy; } \
  && ok "edge-tts, yt-dlp, faster-whisper" || bad "pip installs"

echo "Node tools…"
npm install --silent --no-audit --no-fund && ok "root packages" || bad "npm install (root)"
npx playwright install chromium >/dev/null 2>&1 && ok "Playwright Chromium (web screen recording)" || echo "  ~ Playwright Chromium skipped (only needed for web captures)"
(cd studio && npm install --silent --no-audit --no-fund) && ok "Remotion studio" || bad "Remotion"
chmod +x tools/*.sh tools/talk/*.sh 2>/dev/null

echo "Sound kit…"
[ -n "$(ls brand/audio/sfx/*.wav 2>/dev/null)" ] || bash tools/make_sfx.sh >/dev/null
[ -f brand/audio/music/bed_drone.wav ] && [ -n "$(ls brand/audio/sfx/v2/*.wav 2>/dev/null)" ] || bash tools/make_sfx_v2.sh >/dev/null
ok "SFX + ambient bed"

echo "Smoke tests…"
python3 tools/tts.py --text "Your keys. Your crypto." --id voicetest --outdir /tmp/dynk-voicetest >/dev/null 2>&1 \
  && ok "AI voice (edge-tts) reachable" || bad "AI voice: the session needs network access to speech.platform.bing.com (see CLOUD.md)"
(cd studio && npx remotion still src/index.ts demo-S01 /tmp/dynk-test-card.png --frame=70 --log=error) && ok "Remotion renders" || bad "Remotion render"
(cd studio && REMOTION_GL=${REMOTION_GL:-swangle} npx remotion still src/index.ts test-3d /tmp/dynk-3d-test.png --frame=30 --gl=${REMOTION_GL:-swangle} --log=error) \
  && ok "3D (WebGL via ${REMOTION_GL:-swangle}) renders" || bad "3D render"
python3 -m yt_dlp --version >/dev/null 2>&1 && ok "yt-dlp $(python3 -m yt_dlp --version)" || bad "yt-dlp"
[ -n "${GEMINI_API_KEY:-}${OPENAI_API_KEY:-}" ] && ok "AI image key present" || echo "  ~ No GEMINI_API_KEY / OPENAI_API_KEY: AI hero shots off, 3D kit only (fine)"

echo
[ "$MISSING" = 0 ] && echo "Ready. Type  /make-video  (optionally with a topic)." || echo "Fix the ✗ items and re-run."
echo "Cloud has no GPU: 3D renders use software WebGL (export REMOTION_GL=swangle). Slower, same pixels."
