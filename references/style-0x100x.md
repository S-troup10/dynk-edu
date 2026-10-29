# House style v2: "monochrome studio" (modelled on @0x100x)

**Read this before writing hooks, scripts, direction, scenes or reviews.** It replaces the v1 look
(big orange Orbitron headlines on white, glow blobs, zoom punches, karaoke captions), which read as
template and AI-made.

Source: frame-by-frame breakdown of @0x100x (480K followers, "independent research on tokenization")
on 26 Oct 2026, from their 2M, 831K and 627K reels. All three are 84–109 s, original audio, and
labelled "AI content" by Instagram. What stops them looking AI-made is **restraint, real footage
and real numbers**, not the absence of AI.

---

## 1. The six signatures (copy these)

| # | Signature | What it looks like at 0x100x | Our kit |
|---|---|---|---|
| 1 | **Real-people cold open** | 3–5 hard cuts (~1 s each) of real interview / news footage of famous finance people, graded to B&W, broadcast chyrons left in. One small all-caps line typed over all of it with a cursor: `THE MOST POWERFUL PEOPLE IN FINANCE|`. Then a hard cut into the animated world. | `HookMontage`, `Typewriter`, `Footage`, `tools/fetch_clip.py` |
| 2 | **Monochrome 3D world** | Glossy chrome / matte clay / graphite objects (coin stacks, post office, CRT, $ sphere, people tokens) on a seamless backdrop, soft overhead light, floor reflection. Everything greyscale **except one accent object per shot**. Scenes alternate near-black and pale grey. | `Studio3D` + object library (`Coin`, `CoinStack`, `TokenSphere`, `Phone`, `Card`, `Bank`, `Vault`, `Key`, `Padlock`, `Person`, `Plinth`, `Documents`, `NodeNetwork`, `ArcTravel`, `Bars3D`), `tools/gen_image.py` for anything else |
| 3 | **Whisper captions** | ONE small lowercase word at a time, top centre, the word being spoken. No highlight box, no bold, no big text. | `WordCaption` (on by default in `Shell`) |
| 4 | **Numbers are the hero** | Big condensed chrome figures (`$10 TRILLION`), counters ticking live (`$2,362,694,300,525 → $24.7T`), thin timelines, simple bar charts. Every number is real and sourced in the caption. | `ChromeNumber`, `Counter`, `Timeline`, `Bars3D` |
| 5 | **Real-person name card** | Glass plate with B&W circular headshot, name, role, company logo tile; a light glint sweeps across. | `NameCard` |
| 6 | **Calm, long, confident** | 85–110 s. Slow camera pushes, objects settle with soft springs. No zoom punches, flashes, shakes or wipes. Hard cuts; a light-leak flash at most once per act. End: fake IG profile ("We are just a random Instagram page") then the logo with a little audio-wave line. | `Studio3D` camera moves, `Enter`, `LightLeak`, `ProfileEndCard`, `EndMark` |

## 2. DYNK adaptation (what we change)

- **Accent colour = DYNK orange `#FF8000`** instead of their green. Orange goes on ONE thing per shot:
  the object or word the viewer must look at. Everything else is greyscale. Two orange things in one
  frame = fail.
- **Length 60–90 s** (they run 85–110). Shorter is fine when the idea is done; never pad.
- **Type:** Outfit for captions, lines and UI; Orbitron only for big chrome numbers. No Orbitron headlines.
- **No investment framing.** 0x100x talks about "the opportunity"; we never do. We teach how money,
  keys and data actually work. The house rules in `CLAUDE.md` still apply in full.
- **DYNK appears late and quietly**: an app screen on the 3D `Phone`, or the end card. Never the opener.
- **Voice:** calm documentary narrator (edge-tts `en-US-AndrewNeural`, -2% rate, polished by `tts.py`).
  Short declaratives. Let numbers land with a beat of silence after them.

## 3. Act structure (60–90 s)

```
0–6s    COLD OPEN    real footage montage + typewriter line   (or: NameCard of a real person + quote)
6–15s   STAKES       one huge real number, 3D object that embodies it (dark)
15–35s  HISTORY      "In 1968…" / "Before the internet…" light-grey scenes, institutions as clay buildings
35–60s  MECHANISM    how it works: people tokens, arcs of coins, node networks, timeline
60–75s  TURN         what changes when you hold the keys / own the data (orange accent object on plinth)
75–90s  CLOSE        one-line takeaway → ProfileEndCard → EndMark
```
**Retention:** the visual changes every 2–4 s (new object, camera move, cut, number). A new
*information beat* (number, reveal, question, contradiction) lands at least every ~10 s. That replaces
v1's "rehook every 8 s with a punch effect".

## 4. Scene grammar (rules composers follow)

1. **One subject per shot**, centred, generous empty space above it for the caption word.
2. **One accent** (orange) per shot, at most.
3. **Tone alternates** dark ↔ light roughly every 1–2 scenes; the cold open and stakes are dark.
4. **Camera always moves** (slow push or drift via `Studio3D camera={{from,to,target}}`), never static,
   never fast. Objects arrive with `Enter` and then float gently.
5. **Text is small.** Captions ~40 px, lines ~58 px, labels 26 px tracked caps. The only big type is a number.
6. **Real things are real**: real people only from real footage/photos (never AI faces), real
   institutions named only when the fact is about them, every number sourced.
7. **Texture**: grain and vignette stay on (`Shell` default). Flat, perfectly clean frames look AI.
8. **Safe zone** still applies: key subjects between y 220 and y 1500, x 64 to 920.

## 5. Sound

- VO at −16 LUFS (polished). Ambient bed `brand/audio/music/bed_drone.wav` under everything at −24 dB.
- SFX from `brand/audio/sfx/v2/`: `sub_drop` on the cold-open cut and the big reveal, `thud` when an
  object lands, `glint` on name cards and accent reveals, `tick` under counters, `whoosh_soft` between
  acts, `click` on the follow tap. Never more than one SFX per second.
- Trending audio is still attached in-app at upload, very low (5–8 %), or not at all. 0x100x uses
  original audio.

## 6. Anti-AI-look checklist (reviewer fails any of these)

- [ ] Big headline text anywhere other than a number
- [ ] More than one orange thing in a frame
- [ ] Zoom punch, flash, shake or wipe transition
- [ ] Glow blob / gradient mesh background
- [ ] Captions bigger than ~48 px or more than one word at a time
- [ ] A static frame longer than 3 s
- [ ] AI-generated face, fake logo, invented chart or unsourced number
- [ ] Opening on the DYNK logo or a phone mockup
- [ ] Perfectly clean frames (grain/vignette turned off without a reason)
- [ ] Footage of a real person used to imply they said something they didn't

## 7. The reference reels

| Plays | Reel | Why it's here |
|---|---|---|
| 2M | https://www.instagram.com/0x100x/reel/DUEmp0Ck0j7/ | Name-card open ("He manages $10 trillion"), chrome coin stack + China map, clay post office, live counters, fake-profile ending |
| 831K | https://www.instagram.com/0x100x/reel/Da8FpGRMYDA/ | Best cold open: 4 B&W interview cuts (Fink, Dimon, Tenev) + typewriter line, then 3D explainer, bar charts, logo outro |
| 627K | https://www.instagram.com/0x100x/reel/DYDxdbnijN5/ | Two-headshot open, $ sphere on a US-flag map, DTCC clay building, timeline, 1800s photo, light-leak, profile end card |

Our worked example of all of this: `runs/2026-10-26-ftx-self-custody-v2-demo/` and the scene files in
`studio/src/scenes/_demo_v2/`.
