# Running the pipeline in the cloud

The pipeline is a Claude Code project. Anything that runs Claude Code on Linux can run it. The easiest is
**Claude Code on the web** (claude.ai/code), which clones this repo into a cloud box per session.

## One-time setup (claude.ai/code)
1. Open claude.ai/code, pick this repo (`dynk-video-pipeline`), and create or edit its **environment**:
   - **Network access: "Full"** (or a custom allowlist with at least: `speech.platform.bing.com` for the
     free edge-tts voice, `*.youtube.com` + `*.googlevideo.com` for real footage, `www.instagram.com` if you
     want the analyzer to look at reels, `generativelanguage.googleapis.com` or `api.openai.com` for AI hero
     images, plus npm/pip registries).
   - **Environment variables** (optional): `GEMINI_API_KEY` or `OPENAI_API_KEY` for AI hero shots,
     `REMOTION_GL=swangle`. Put keys here, **never in the repo**.
   - **Setup script**: `bash setup-cloud.sh` (installs ffmpeg, edge-tts, yt-dlp, Remotion, sound kit and
     smoke-tests a render).
2. Start a session and type `/make-video` (optionally with a topic, e.g. `/make-video why your wallet app holds no coins`).
3. Gates 1 and 2 are asked in the chat. Answer there.
4. When the reviewer passes, the orchestrator commits `runs/<id>/final/<id>.mp4`, the cover and the
   caption to the session branch and pushes. Download the MP4 from that branch on GitHub (or open a PR
   and merge it to keep a record).

## Differences from the Mac setup
| | Mac (`setup.sh`) | Cloud (`setup-cloud.sh`) |
|---|---|---|
| 3D rendering | GPU (`--gl=angle`) | Software WebGL (`--gl=swangle`): slower, same pixels. `render_scene.sh` picks this automatically on Linux. |
| Analyzer (Instagram) | Claude in Chrome, logged in | No browser. Falls back to `data/hook-bank.md` + the style bibles. Fine for most runs; do analyzer-heavy research on the Mac. |
| Real footage (yt-dlp) | Works | YouTube often blocks datacenter IPs. If `fetch_clip.py` fails, the director uses the 3D/name-card fallback, or drop clips into `inbox/` and commit them. |
| Voice | edge-tts | edge-tts (needs network). Or record on your phone, commit `runs/<id>/audio/vo/S01.recorded.m4a`… and resume at `director`. |
| Opening the result | `open …mp4` | Committed to the branch |

## Cost
Claude usage per video is roughly $3–8 on Sonnet (estimate, not measured: the agent chain, about 15–30
composer renders, and review loops). Gemini hero images are about $0.04 each. Everything else (voice,
footage, rendering) is free. To save money, set `model: haiku` in `.claude/agents/{cutter,clipper,analyzer,adapter}.md`.

## Running locally on Linux / a VM instead
```bash
git clone <this repo> && cd dynk-video-pipeline
bash setup-cloud.sh
claude          # then /make-video
```

## Lessons from the 30 Oct 2026 cloud run (`runs/2026-10-29-91m-twelve-words`)
- **Voice:** if `speech.platform.bing.com` is blocked, use the offline voice: `pip install kokoro-onnx soundfile`, download
  the two model files from GitHub releases (see `tools/tts_kokoro.py` header), then
  `python3 tools/tts_kokoro.py --batch runs/<id>/vo_lines.json --outdir runs/<id>/audio/vo --speed 1.12`.
  A line can carry `"say"` (spoken form, e.g. "two-thousand-and-forty-eight") separate from `"text"` (caption form, "2,048").
- **Browser:** if Remotion can't download its headless shell (`remotion.media` blocked), use Playwright's:
  `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.
  `tools/render_locked.sh` and `tools/still.sh` set it by default.
- **Speed:** 2 CPUs + swangle ≈ 2 s per 3D frame (a 56 s video ≈ 1 h of rendering). Renders are serialised with a
  lock (`tools/render_locked.sh`); composers check with `tools/still.sh runs/<id> S01 0,30,60` first.
- **Pushing:** runs/ is gitignored; force-add the final mp4, cover and run docs (`git add -f`).
