# Pipeline v2: "monochrome studio" (26 Oct 2026)

**Why:** v1 videos looked templated and AI-made (big orange Orbitron headlines on white, glow blobs,
zoom punches, karaoke captions, raw TTS). v2 is modelled on @0x100x (480K followers, 2M / 831K / 627K
reels), broken down frame by frame in `references/style-0x100x.md`.

**Built from the v1.0 spec unchanged first** (all 47 files byte-exact, skills at the pinned commits,
§13 checks passed), then upgraded.

## What changed
| Area | v1 | v2 |
|---|---|---|
| Look | white/ink/orange flat motion graphics | greyscale 3D studio world (chrome, clay, graphite), seamless backdrop, grain + vignette, **one orange accent per shot** |
| Opener | spectacle motion graphic | **real B&W interview/news footage montage + typewriter line** (new `clipper` agent) |
| Captions | 4-word chunks, active word orange, big | **one small lowercase word**, top centre |
| Type | Orbitron headlines | Outfit, small; Orbitron only for big chrome numbers |
| Motion | springs, zoom punches, orange wipes | slow camera pushes, soft settles, hard cuts, rare light-leak |
| Length / pacing | 30–45 s, rehook punch every 8 s | 60–90 s, information beat every ~10 s, visual change every 2–4 s |
| Voice | en-AU-WilliamNeural +8 %, raw | en-US-AndrewNeural −2 %, pitch −2 Hz, **polish chain** (EQ, de-ess, compression, small room, loudness) |
| Sound | punchy synth SFX | ambient drone bed + soft SFX (`sub_drop`, `thud`, `glint`, `tick`, `whoosh_soft`, `air_rise`, `click`, `type`) |
| Honesty | facts from dynk-context | + every number sourced in the caption, all footage credited, no AI faces/logos |

## New files
- `references/style-0x100x.md`: the style bible (signatures, DYNK adaptation, act structure, scene grammar, anti-AI checklist)
- `.claude/agents/clipper.md`: stage 6.5, finds and cuts real footage
- `tools/fetch_clip.py`: `search` / `transcript` / `get` (vertical crop, 1080×1920) / `sheet`; writes `credits.md`; retries with Chrome cookies on a bot check
- `tools/gen_image.py`: optional AI hero shots in the house style (Gemini or OpenAI key)
- `tools/make_sfx_v2.sh`: v2 SFX + 120 s ambient bed
- `studio/src/kit/three.tsx`: `Studio3D` + object library (Coin, CoinStack, TokenSphere, Phone, Card, Bank, Vault, Key, Padlock, Person, Plinth, Documents, NodeNetwork, ArcTravel, Bars3D, Enter)
- `studio/src/kit/index.tsx`: Shell, WordCaption, Typewriter, Line, Label2, ChromeNumber, Counter, NameCard, Footage, HookMontage, Timeline, LightLeak, ProfileEndCard, EndMark, Grain, Vignette
- `studio/src/scenes/_demo_v2/`: worked example scenes; `runs/2026-10-26-ftx-self-custody-v2-demo/`: the full demo run

## Changed files
`CLAUDE.md`, `README.md`, `setup.sh` (Node 20+, yt-dlp, v2 sounds, 3D check), `brand/brand.md` (v2 section on top),
`brand/tokens.json` (`v2` block, voice), `references/notes.md`, agents `director`, `composer` (rewritten),
`reviewer`, `scripter`, `hook`, `adapter`, `analyzer` (patched), `/make-video` (clipper stage), `tools/tts.py`
(pitch + polish, writes via temp dir), `tools/render_scene.sh` (`REMOTION_GL`, default `angle`),
`studio/templates/scene.tsx` (v2 stub). Studio deps added: `@remotion/three`, `three`, `@react-three/fiber`, `@react-three/drei`.

## Notes
- 3D renders on the GPU via `--gl=angle` (fast on a Mac). Headless servers without a GPU: `REMOTION_GL=swangle` (slow but works).
- YouTube sometimes asks datacenter IPs to sign in; from a home connection it works, and the tool falls back to Chrome cookies.
- Footage is third-party: keep it short, credited, and truthful to what the person said. This is the same practice 0x100x uses, but it carries takedown risk.
