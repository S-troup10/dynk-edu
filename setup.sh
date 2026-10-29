#!/usr/bin/env bash
# One-time setup on the Mac. Run from Terminal:  cd ~/Desktop/DYNK/video-pipeline && bash setup.sh
set -uo pipefail
cd "$(dirname "$0")"
ok() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
bad() { printf "  \033[31m✗\033[0m %s\n" "$1"; MISSING=1; }
MISSING=0
echo "Checking tools…"
command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] && ok "Node $(node -v)" || bad "Node 20+ (brew install node)"
command -v ffmpeg >/dev/null && ok "ffmpeg" || bad "ffmpeg (brew install ffmpeg)"
command -v python3 >/dev/null && ok "Python $(python3 --version | cut -d' ' -f2)" || bad "Python 3 (xcode-select --install)"
command -v claude >/dev/null && ok "Claude Code" || bad "Claude Code (npm install -g @anthropic-ai/claude-code)"
if [ "$MISSING" = 1 ]; then
  command -v brew >/dev/null || echo "  Homebrew isn't installed — get it from https://brew.sh first."
  echo "Install the missing tools above, then run this again."; exit 1
fi
echo "Installing…"
{ python3 -m pip install --user --quiet edge-tts "yt-dlp[default]" 2>/dev/null || python3 -m pip install --user --quiet --break-system-packages edge-tts "yt-dlp[default]"; } && ok "edge-tts (free AI voice) + yt-dlp (real footage)" || bad "edge-tts / yt-dlp"
npm install --silent --no-audit --no-fund && npx playwright install chromium >/dev/null && ok "Playwright + Chromium (web screen recording)" || bad "Playwright"
(cd studio && npm install --silent --no-audit --no-fund) && ok "Remotion studio" || bad "Remotion"
chmod +x tools/*.sh
[ -n "$(ls brand/audio/sfx/*.wav 2>/dev/null)" ] || bash tools/make_sfx.sh >/dev/null
[ -f brand/audio/music/bed_drone.wav ] && [ -n "$(ls brand/audio/sfx/v2/*.wav 2>/dev/null)" ] || bash tools/make_sfx_v2.sh >/dev/null
ok "Sound kit (v1 + v2 + ambient bed)"
echo "Smoke test…"
python3 tools/tts.py --text "Your keys. Your crypto." --id voicetest --outdir /tmp/dynk-voicetest >/dev/null && ok "AI voice works (/tmp/dynk-voicetest/voicetest.mp3)" || bad "AI voice — check internet"
(cd studio && npx remotion still src/index.ts demo-S01 ../brand/test-card.png --frame=70 --log=error) && ok "Remotion renders (brand/test-card.png)" || bad "Remotion render"
(cd studio && npx remotion still src/index.ts test-3d /tmp/dynk-3d-test.png --frame=30 --gl=angle --log=error) && ok "3D (WebGL) renders" || bad "3D render — try: REMOTION_GL=swangle"
python3 -m yt_dlp --version >/dev/null 2>&1 && ok "yt-dlp $(python3 -m yt_dlp --version)" || bad "yt-dlp"
echo
[ "$MISSING" = 0 ] && echo "Ready. Next:  claude --chrome   then type   /make-video" || echo "Fix the ✗ items and re-run."
{ python3 -m pip install --user --quiet faster-whisper numpy 2>/dev/null || python3 -m pip install --user --quiet --break-system-packages faster-whisper numpy; } && echo "  ✓ faster-whisper (talking-head transcription)" || echo "  ✗ faster-whisper: run  pip3 install faster-whisper"
