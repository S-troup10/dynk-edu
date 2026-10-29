# 06 — Direction: "$91M, and nobody guessed his 12 words"

Run `2026-10-29-91m-twelve-words` · 11 scenes · ~56 s · 1080×1920 · 30 fps.
VO is final (`audio/vo/<SID>.mp3`, word timings in `scenes/<SID>/props.json` → `props.vo.words`). Captions are automatic
(`Shell` → `PhraseCaption`, keywords set per scene). **Do not touch** VO, captions, `_shared.tsx`, `registry.ts`, the kit.

## What changed vs the last video (read this first)
Cooper's notes on the address-poisoning video: *looked beautiful, but too long and slow; hook not strong enough; tell more
of a story*. So this one keeps the **exact v3 look** (dark charcoal studio, graphite glass tiles, one orange glowing system
per shot, tiny tracked-caps `Callout`s with leader lines, grey `Disclaimer` bottom-left, grain + vignette, sentence-building
captions top centre) but runs **much faster**:

- **Cut every 0.6–1.5 s** (hook S01: every 0.5–0.8 s). Each scene has 3–6 shots. Nothing on screen holds still for > 1 s:
  the camera is always travelling (CamRig shots never start from rest) and something lands on almost every stressed word.
- **Motion is fast and decisive**: objects arrive in 4–8 frames with an ease-out, not 20. Camera moves are bigger
  (dolly 1.5–3 units per shot, not 0.5). Still **no** zoom punches, flashes, whip pans, shakes or glitch effects.
- **Hard cuts only** between shots (no dissolves anywhere in this video).
- **Land on the word**: every new object / number / callout appears on the frame its word starts (`W(props, "word")`).
- SFX: use `<Sfx name="…" at={frame} volume={…}/>` from `_shared` (files: air_rise, click, glint, sub_drop, thud, tick,
  type, whoosh_soft). Soft: whoosh_soft 0.25–0.35 on most cuts, tick 0.2–0.3 for counters/typing, thud/sub_drop 0.5–0.7
  only on the big beats named below. Never two SFX on the same frame.

## The world (shared in `studio/src/scenes/r_2026_10_29_91m_twelve_words/_shared.tsx`)
- `WordTile` — graphite glass slab 1.6 × 0.5 × 0.1 with a mono word (optional number "5  turtle"). `glow` = orange.
  `spin`/`spinWord` = slot-machine flip. `PhraseGrid` = the 12 tiles (3 cols × 4 rows, ~5.1 wide × 2.5 tall, centre y≈1.2):
  to see the whole grid in portrait use fov 30–34 and camera distance ≈ 15–17; for a macro on one tile, distance 2.5–4.
- `PHRASE` (12 random BIP-39 words — not anyone's wallet), `BIG` (2¹²⁸ written out), `STORY` (783 BTC, $91,000,000,
  19 AUG 2025), `BIP39` (full 2,048 list, `./bip39`), `CamRig` / `project` (3D → screen px for Callouts), `W`, `Sfx`, `rand`.
- Kit: `Shell`, `Studio3D` (pass `shadows={false}` when there's no floor contact worth seeing — it renders faster),
  `Coin`, `CoinStack`, `ArcTravel`, `Phone` (screen = image path), `Padlock`, `Person`, `Plinth`, `Callout`, `Disclaimer`,
  `EnergyArcs`, `ChromeNumber`, `Counter`, `NameCard`, `Typewriter`, `ShareSheetEnd`. Worked v3 examples:
  `src/scenes/r_2026_10_29_next/S01.tsx` (camera rig + callouts on tiles), `S10.tsx`, `S11.tsx`, `S16.tsx`.
- **2D is fine and fast** for UI shots (phone screens, chats, browser, photo grid, giant numbers): build them as
  React/CSS in a dark frame, drawn crisply, with a slow 2D camera move (translate/scale/rotate a few %). 3D shots cost
  ~2 s per frame to render here, 2D shots are much cheaper. Mix them: roughly half the shots 3D, half 2D.
- UI style (2D): near-black phone UI (#0b0c0e), Outfit font (`brand.body` from `../../brand`), white text, greys, one orange
  element. Generic: **no real logos, no real brand UI, no app icons of real companies**, made-up handles only.
- Disclaimers (grey, bottom-left, on every non-literal shot): "Illustration", "Magnified illustration · words are random",
  "Illustration · details per ZachXBT, Aug 2025", "Values rounded", "Illustration · made-up site".

## Scenes

### S01 — HOOK (4.53 s) · "One man lost $91 million in bitcoin, in a single transaction."
The most important 4.5 s of the video. **Six hard cuts, ~0.7 s each, all already moving on frame 0, plus a big text layer.**
Orange system = the money draining. Frame 0 must already show orange and motion (it's also the cover).
1. f0–20 · ("One man") extreme low macro on a tall orange-topped `CoinStack`/column of chrome coins with the top coins
   already lifting off and flying past the lens toward camera-right; camera dollying up the stack fast. Big text layer
   starts here (see below).
2. f20–42 · ("lost $91") 2D: phone screen, top-down, slight tilt; a wallet balance in big mono **783.00000000 BTC**
   ticking DOWN fast (orange digits), "Balance" label grey. Callout `BALANCE`.
3. f42–68 · ("million") **the slam**: giant chrome `$91,000,000` (ChromeNumber/Orbitron style, ~150–170 px, accent orange)
   lands in 5 frames centre screen while the camera (2D) drifts; `sub_drop` 0.6 on the land. Small grey line under it:
   `783 BTC · 19 AUG 2025`.
4. f68–90 · ("in bitcoin") side angle 3D: a single long orange arc (`ArcTravel` with many coins in a stream, staggered)
   pouring out of a phone on the left into the dark at right. `whoosh_soft`.
5. f90–114 · ("in a single") 2D: one transaction row magnified: `↗ Sent  −783.00 BTC` / `to bc1q…(unknown)` / `1 confirmation`,
   orange border glow, callout `ONE TRANSACTION`. `click`.
6. f114–end · ("transaction.") the balance again, now **0.00000000 BTC**, dim white; camera keeps pushing in; silence
   under the last word (no SFX after f114 except a soft `thud` 0.4 exactly when it hits zero).
**Big text hook layer** (on top of shots 1–2 only, f0–40, below the caption at y≈1150, white Outfit 800 ~84 px, two
lines, left-aligned at x=90): `$91M GONE.` / `NOBODY HACKED HIM.` — the first line white, the second appears on f10 in
orange. It disappears hard on the cut to shot 3. Disclaimer all scene: "Illustration · amount per ZachXBT, Aug 2025".

### S02 (3.93 s) · "Nobody hacked him. Nobody guessed his keys. Nobody could."
Three shots, one per "Nobody". Orange system = the 12 tiles.
1. ("Nobody hacked him") 3D: a grey chrome `Padlock`, closed and intact, camera orbiting fast around it; callout `NOT HACKED`.
2. ("Nobody guessed his keys") 3D: `PhraseGrid` (all 12 orange-faced, `glow="all"`), camera tracking across it at mid
   distance; callout `12 WORDS`.
3. ("Nobody could") same grid, macro on 2–3 tiles that are **spinning like slot reels** (`spin` 0→ several turns with
   `spinWord` cycling random BIP39 words) — they never settle on the real word; ticks under the spin. Callout `GUESSES: 0 MATCHES`.
Disclaimer: "Magnified illustration · words are random".

### S03 (4.63 s) · "Because your wallet comes down to twelve words, from a list of 2,048."
1. ("Because your wallet") 2D: a phone "Recovery phrase" screen (generic: title "Recovery phrase", subtitle "Write these
   down. Never share them.", 12 numbered words in a 2-col list using `PHRASE`), camera pushing in.
2. ("comes down to twelve words") 3D: the 12 tiles rise out of the floor in a fast stagger (`rise` 0→1 over ~12 frames)
   and glow orange; camera rising. Callout `RECOVERY PHRASE`.
3. ("from a list of 2,048") 3D: hard cut to a **wall of 2,048 small tiles** (64 × 32, use instanced meshes or plain
   thin boxes with a shared texture; words optional at this distance) with the 12 orange ones scattered in it; camera
   pulls back fast so the wall fills and overflows the frame. Callout `2,048 WORDS`. A `Counter` 0→2,048 in the lower
   third is fine. Disclaimer: "Illustration · BIP-39 word list".

### S04 (4.67 s) · "Abandon, to zoo. Pick twelve, and you get this many combinations."
1. ("Abandon,") macro 3D on a tile "1  abandon" at the top-left corner of the wall, camera sliding; callout `WORD #1`.
2. ("to zoo.") hard cut, macro on "2048  zoo" at the bottom-right; callout `WORD #2,048`. `tick`.
3. ("Pick twelve,") 12 tiles pop forward out of the wall toward camera (orange), stagger 2 frames each. `click`.
4. ("and you get this many combinations.") **the second spectacle**: 2D, black; the 39-digit `BIG` number builds
   left→right, digit group by digit group, in big chrome Orbitron (~92–110 px), wrapping over 4 lines centred, the camera
   slowly pushing in and drifting; the last group lands on "combinations" in orange with `sub_drop` 0.55. Small grey
   label above: `POSSIBLE 12-WORD PHRASES` and `2¹²⁸` callout. Hold the full number ≥ 0.6 s at the end (pad).
Disclaimer on 4: "2¹²⁸ — BIP-39, 128-bit entropy".

### S05 (6.73 s) · "If everyone on Earth guessed a billion a second, trying them all would take about a hundred times the age of the universe."
Orange system = time.
1. ("If everyone on Earth") 3D or 2D: a vast field of tiny grey figures (instanced `Person`-like capsules or 2D dots in
   perspective) receding to the horizon, camera rising over them. Callout `8 BILLION PEOPLE`.
2. ("guessed a billion a second") close on a few figures, each with a tiny counter above ticking absurdly fast
   (1,000,000,000/s); callout `1,000,000,000 GUESSES / SEC — EACH`. `tick` loop (quiet).
3. ("trying them all would take") 2D: a single thin horizontal bar labelled `AGE OF THE UNIVERSE · 13.8 BILLION YEARS`
   (white/grey), camera starts tight on it.
4. ("about a hundred times the age of the universe.") the camera pulls back fast while the bar duplicates into a
   ribbon of **100 bars** (10 × 10 grid or one long zig-zag), the orange `×100` lands big on "hundred" (`thud` 0.5).
Disclaimer: "Values rounded: 2¹²⁸ ÷ (8 billion × 10⁹/s) ≈ 1.35 trillion years".

### S06 (6.83 s) · "So the thieves didn't guess. They pretended to be support, for his wallet maker and his exchange. And he trusted them."
The turn. Orange system = the impostor messages.
1. ("So the thieves didn't guess.") 3D: the spinning slot tiles from S02 **stop dead** and go dim grey (`dim`), camera
   pulling away. `thud` 0.4 on the stop.
2. ("They pretended to be support,") 2D: phone lock screen; a notification drops in: **"Support · Security alert on your
   wallet. Reply to verify."** (generic, no brand), orange left edge. Callout `IMPOSTOR`.
3. ("for his wallet maker") 2D: a chat thread header "Wallet Support ✓" (fake tick drawn grey), message bubble
   "We detected unusual activity on your device…". Callout `FAKE: WALLET MAKER`.
4. ("and his exchange.") second thread "Exchange Support", bubble "Your account will be frozen in 30 minutes…".
   Callout `FAKE: EXCHANGE`. `click`.
5. ("And he trusted them.") back to 3D: a phone on a plinth; a single orange arc of coins leaves it (the S01 arc, mirrored),
   camera pushing slowly; no callout. `whoosh_soft`.
Disclaimer: "Illustration · details per ZachXBT, Aug 2025 (messages illustrative)".

### S07 (3.70 s) · "That's why real support will never ask for your twelve words."
1. ("That's why real support") 2D macro: a chat bubble types itself out: "To fix this, please enter your 12-word
   recovery phrase." (`type` sfx 0.25), camera drifting across the bubble.
2. ("will never ask") an orange strike line draws through the bubble on "never" in 4 frames; callout `REAL SUPPORT NEVER ASKS`.
3. ("for your twelve words.") 3D: the 12 tiles, orange, a big chrome `Padlock` lowering in front of them / closing; camera
   rising. Disclaimer: "Illustration".

### S08 (9.17 s) · "It's why screenshots are risky. In 2025, Kaspersky found apps on the App Store and Google Play scanning people's photos for those words."
Proof beat (real, sourced). Orange system = the scan.
1. ("It's why screenshots are risky.") 2D: phone camera roll grid (4 cols, ~24 thumbnails: soft abstract gradients /
   blurred shapes in greys — no real photos), camera scrolling; one thumbnail is a screenshot of the 12-word list — it
   enlarges as the camera pushes into it. Callout `SCREENSHOT`.
2. ("In 2025, Kaspersky") 2D B&W document plate: `NameCard` (name "Kaspersky", role "Security researchers · 5 Feb 2025",
   no logo, no photo) + a `Typewriter` line: "SparkCat: malware that reads screenshots to steal recovery phrases".
3. ("found apps on the App Store and Google Play") 2D: two plain rounded "store" cards side by side labelled
   `APP STORE` / `GOOGLE PLAY` (text only, generic grey glyphs, no real logos), each with a small generic app tile
   inside marked `INFECTED APP` in orange. Callout `FIRST OCR STEALER ON THE APP STORE` (true per Kaspersky).
4. ("scanning people's photos") back on the camera roll: a thin orange scan line sweeps down the grid; text-recognition
   boxes (thin orange rectangles) flick onto anything that looks like text. `tick`.
5. ("for those words.") the screenshot: each of the 12 words gets an orange OCR box in sequence, then the words lift off
   the screenshot and stream up-right out of frame. Callout `OCR`. `whoosh_soft`.
Disclaimer: "Source: Kaspersky, 5 Feb 2025 · illustration".

### S09 (3.87 s) · "And it's why any site asking you to verify your phrase is the thief."
1. ("And it's why any site") 2D browser window (generic dark chrome), URL bar `verify-wallet-secure.example`, page
   title "Verify your wallet", 12 empty numbered input boxes, camera sliding down the page.
2. ("asking you to verify your phrase") the boxes fill in fast, one word per ~3 frames (`PHRASE`), cursor blinking; `type`.
3. ("is the thief.") the filled boxes glow orange and the words drain out of the page into the dark (same visual
   language as the coins in S01); callout `PHISHING SITE`. Disclaimer: "Illustration · made-up site".

### S10 (4.17 s) · "So nobody can crack your twelve words. They can only be handed over."
Twist back to the hook's world.
1. ("So nobody can crack your twelve words.") 3D: the 12 orange tiles in the grid, slot-reel blur bouncing off them
   (2–3 tiles flicker-spin and snap back to the true word), camera orbiting. Callout `UNCRACKABLE`.
2. ("They can only be handed over.") 3D: the tiles slide one after another off the plinth/floor edge toward a dark clay
   `Person` silhouette standing in the gloom at frame right (handed over); camera tracking with them. Callout `HANDED OVER`
   on the first tile to arrive.
Disclaimer: "Magnified illustration · words are random".

### S11 — CTA (3.83 s) · "Send this to someone who keeps theirs in their camera roll."
`ShareSheetEnd` (handle `dynkeducation`) rises on "Send this", contact picked at ~f26. Behind the sheet top area, before
it rises (f0–10), show the S08 camera-roll grid with the 12-word screenshot glowing — so the CTA visually names the
behaviour. Last 0.6 s: hold the share sheet with a slow drift. No disclaimer.
