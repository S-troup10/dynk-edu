# Talking head + board: the style rules

The format: one person, one take, talking to camera. Whenever they start *explaining* something, the video cuts to a clean board where the idea draws itself in, word for word, as they say it. It cuts back to the face for the hook, every rehook, opinions and the CTA. This is the edit used by the education creators who teach a concept in 20–45 seconds on Reels, TikTok and Shorts.

Every agent and tool in `tools/talk/` follows this file. `resolve_edl.py` checks the numbers automatically.

## Why it works
- **The face earns trust, the board does the teaching.** Face-only segments are for credibility, delivery and emotion. Abstract ideas need a visual anchor, so explainer stretches carry denser visuals than any other format.
- **Cut when the job of the line changes, not on a timer.** Hook → face. Explaining → board. Re-grabbing attention → face. Back to the idea → board (the same board, still drawn, if it's the same idea).
- **The visual lands as the word is spoken.** Not a beat later. A label that appears two seconds after you said it reads as lag.
- **Captions and board elements shouldn't change at the same moment.** They compete. So on the board the board is the caption; burned-in captions run on face shots.

## Timing rules (enforced as warnings)
| Rule | Number |
|---|---|
| Hook on the face, with a 3–7 word hook headline | first ~2–4 s |
| Element lands before its word | 3 frames (0.1 s) |
| Something new on the board while it's on screen | at least every 2.5 s |
| Two board elements landing | at least ~0.35 s apart |
| Board must show something within | 0.6 s of the cut |
| Shortest segment (face or board) | ~1.0 s |
| Board share of runtime | ~45–70 % |
| Rehook face returns | at least one per 20 s; on every rehook line |
| Elements per board | ≤ 5 (6 max) |
| Board text | ≤ ~40 characters per line, titles 2–6 words |
| Face framing / punch-ins | 1.0–1.45 × (Simon's camera rule) |
| End | on the face, CTA to camera |

## Face shots
- Dead air is removed (pauses over 0.35 s close to 0.14 s), so face stretches have jump cuts. Every jump cut lands on a new framing (alternating punch-in of 12 %) so it reads as a camera change, not a glitch.
- A face return marked `rehook` gets a small punch (7 % zoom settling over 8 frames) and a low hit.
- No darkening, vignettes or blur to create focus (Simon's rule).

## The look: "paper" (default, `"style": "paper"`)
v1 (clean vector icons in rounded tiles, Orbitron headlines, karaoke captions, slide transitions) read as AI-made. The 2026 motion-design trend writing is consistent on why: generated content is smooth, symmetrical and over-polished, so what stands out now is work where human decisions stay visible — loose wobbly strokes, analog paper/grain texture, torn paper and editorial cut-out layouts. So the board is a real-looking sheet of paper drawn on with a marker while you talk.

| Layer | Choice | Why |
|---|---|---|
| Board surface | warm paper (#F3EEE4) with fibre + blotch texture, tiny handheld drift | flat clean fields are an AI tell |
| Titles / big numbers | **Instrument Serif** (accent words go *italic* with an orange highlighter swipe) | the editorial serif comeback; nobody's auto-caption template uses it |
| Labels, notes, lists | **Shantell Sans** (marker handwriting that stays legible on a phone), written on left→right | handwriting = a person made this |
| Drawn things | rough.js marker strokes: arrows, circles, underlines, ticks, crosses, boxes, hachure scribble fills | wobbly, never perfect geometry |
| Line boil | strokes re-jitter every 4 frames | the hallmark of hand-drawn animation |
| Motion | everything animates on twos (15 fps steps), hard cuts only | stop-motion feel, not smooth AI tweening |
| Props | sticky notes, taped cut-outs (real screenshots), torn newspaper clippings, polaroid of the speaker | collage / scrapbook editorial layout |
| Captions on face | **TikTok Sans** bold, white, soft shadow, 2–4 words, no karaoke colour, lower third | looks typed in the native editor, not a caption template |
| Hook | native "text with background" box: black TikTok Sans on white | the most native-looking text on the feed |
| Texture | film grain over everything | perfectly clean frames look generated |
| Sound | marker scribbles, paper flicks, a soft thump on rehooks | the room, not a synth |
| Colour | ink black + DYNK orange as the highlighter; red/green only for ✗/✓ | one accent |

Layout rules: elements sit slightly off-centre and slightly rotated (deterministic), space for every element is reserved from the start (nothing shoves), one idea per board, ≤5 things per board, same board id when you come back to the same idea. A polaroid of you (`pip`) can sit on boards longer than ~5 s.

`"style": "clean"` keeps the v1 vector board if ever needed.

## Element kit
`title`, `text` (+`highlight` words), `note` (sticky note), `clipping` (torn newspaper headline + sub, no real mastheads), `icon` (any of ~2,100 Lucide icons, `tools/talk/lucide-icons.txt`), `flow` (A → B → C with drawn arrows), `list` (numbered, one item per word anchor), `compare` (two sides with ✓ / ✗ verdicts), `stat` (count-up number), `strike` (old way struck out → new way), `image` (screenshot or real app screen, optionally in a phone frame), `chips`. Any element can carry `marks`.

## Shooting the take (what makes the edit work)
- One take, straight to the lens. Chest-up, head in the upper third, a little headroom. Shoot vertical 9:16 for Reels/TikTok; if you shoot 16:9, stay centred so the 9:16 crop holds you.
- Clip-on mic or a mic close to you. Room tone low (no music, fans, aircon).
- Pause half a second between lines. Pauses are where the cuts go; they're removed automatically.
- Fluffed a line? Stop, breathe, start the **whole sentence** again. The pipeline keeps the last attempt and drops the earlier one (it compares against the script).
- Give rehook lines energy and a look to the lens; they'll be on your face.
- Say product names clearly (DYNK). The script file fixes spelling, not mumbling.

## Sources
- Videobolt, "Top motion graphics trends 2026: crafted content stands out in the age of AI rush" — hand-drawn wobbly strokes, analog textures, torn paper, modular editorial layouts as the response to over-polished generated visuals.
- memefont.org, "Best viral text fonts for TikTok and Reels 2026" — move away from all-caps shouting, renewed lowercase/clean subtitles for talking heads, handwritten for notes.
- TikTok Sans (open-sourced by TikTok, SIL OFL) — the feed's native type.
- fontalternatives.com, "Text serifs comeback 2026" — sans-serif fatigue, serifs for editorial authority.
- CapCut, "B-roll pacing in educational videos" — cut when the learning job changes; 2–5 s visual changes in 20–60 s explainers; sync visuals with the sentence; don't change captions and B-roll at once.
- Personate, "Scene types guide" — actor full screen for hooks/opinions/CTA, actor+graphic for steps and frameworks, full-screen graphic as a deliberate attention reset.
- Async, "How to edit Instagram Reels" — cut on speech not a stopwatch; remove gaps over ~0.4 s; cut to a visual when the script says "this/here/look"; limit punch-ins to key claims.
- HeyGen Hyperframes "talking-head-recut" skill — transcript-driven card placement, whisper word timestamps, layouts: full-screen, split, PiP, overlay.
- DYNK house rules: `brand/brand.md`, Simon's camera/motion feedback (subtle pushes, no darkening, no shoving).
