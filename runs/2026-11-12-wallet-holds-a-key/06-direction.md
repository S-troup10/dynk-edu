# 06 — Direction: "8,000 bitcoin in a rubbish tip. Except they're not."

Run `2026-11-12-wallet-holds-a-key` · 12 scenes · ~59 s · 1080×1920 · 30 fps. Beginner video: **a wallet holds a key,
not coins.** Same house look and quality bar as the finished Bybit video; a brand-new visual world.
Do not touch VO, captions, `_shared.tsx`, `registry.ts`, the kit, or other scenes.

## 1. Smooth motion (non-negotiable — these caused re-renders last time)
- 3D camera ONLY via `<CamRig shot={...}>` inside `<Studio3D camera={{ from: shot.from, target: shot.tFrom, fov: shot.fov }}>`.
  Set each `shot.len` = the length of its `<Sequence>` so the camera is still moving at the cut (never a frozen tail).
- 2D layers move ONLY through `<Cam2D shot={...}>` (sub-pixel). Entry animations (4–10 frames) by hand are fine.
- Every move eased and **moderate**: nothing crosses the screen in under ~0.6 s; no strobing streams. Camera travel
  1–3 units per shot. Text on 3D objects stays within ~35° of face-on and is never the thing whipping past.
- Cuts every **0.8–1.8 s** (hook 0.6–0.9 s), hard cuts only. Objects arrive in 4–8 frames, ease-out.
- Counters: `fontVariantNumeric: "tabular-nums"`, change at most every 2 frames.
- Banned: zoom punches, flashes, shakes, whip pans, glitch, dissolves, `Math.random()`.
- Every animated value comes from `useCurrentFrame()` (Sequence-local). No `useEffect` animation, no state.

## 2. The world: GLASS LETTERBOXES ON THE LEDGER
Dark charcoal studio (`Studio3D tone="dark"`), graphite/chrome objects, ONE orange system per shot, tracked-caps
`Callout`s, grey `Disclaimer`, grain + vignette from `Shell`, captions at the top (Shell draws them).
**Orange = THE KEY** (and what the key controls: the story's letterbox when it is "his").
Props in `_shared.tsx` — read the whole file, every prop has a doc comment:
`Letterbox` (hero glass box on a post; `coins`, `open`, `glow`, `keyGlow`, `dim`; anchor points in `LB`), `Discs`/`Disc`
(plain chrome coin discs), `LedgerWall` (wall of small letterboxes, one `hot`; `wallPos`), `NodeField` (computers with a
`wave` ripple), `NumberKey` (orange key whose blade is digits; `dim` = grey), `HardDrive` (`xray`, `keyInside`, `seam`),
`Bin` (`lid`), `RubbishHeap` (`grow`, `glowAt`), `Handset` (phone; `xray` shows children inside), `WordPlate` (steel
plate with the 12 example words, `count`), `HookText`, plus `CamRig`/`project`/`Cam2D`/`W`/`Sfx`/`rand`/`STORY`/`WORDS`/
`KEY_DIGITS`/`LEDGER_ROWS`. Kit: `Shell`, `Studio3D`, `Callout`, `Disclaimer` (see the worked example).

**Banned (earlier videos' looks):** kit `Coin`, `CoinStack`, `ArcTravel`, `Padlock`, `Phone`, `Vault`, `Key`,
`ShareSheetEnd`; word tiles; pens/ink signatures; sign cards; gift boxes; paper towers; keycaps; chrome `$` slams;
chat bubbles. No dollar/pound values anywhere — amounts are **bitcoin only** ("8,000 BTC"). No real logos, brands,
faces or people; made-up addresses only (use `LEDGER_ROWS`).

Layout: safe zone x 70–1010, y 380–1500. **Caption band y 200–360 must stay clear** — keep 3D objects' tops below
y≈400 on screen and mask 2D layers above 380. Disclaimer never sits on an object. On-screen text: Outfit
(`brand.body` from `../../brand`); numbers may be Orbitron ≤ 90 px. 2D for documents/lists/big numbers, 3D for objects.
3D costs ~2 s/frame to render: keep instanced counts at the defaults or lower; one `Studio3D` per shot.
SFX via `<Sfx name at volume>`: `whoosh_soft` (0.25–0.35) on cuts that move, `tick`/`click` on small events, `thud`
(0.4) or `sub_drop` (0.5) on the one big beat of the scene. 3–5 per scene, never on every cut.

## 3. Scenes — word frames come from `W(props, "word")` (n-th occurrence = 3rd arg)

### S01 — HOOK (135 f) · "This man's 8,000 bitcoin are buried in a rubbish tip. Except they're not."
Five cuts, ~0.8 s each; orange + motion on frame 0 (it is the cover).
1. f0 ("This man's") 3D: a `HardDrive` with `seam` (orange glow line) tumbling slowly through dark air, slightly
   toward camera, camera tracking down with it. Already moving on frame 0.
2. ("8,000 bitcoin") 3D: a `Letterbox` (`glow`, `coins={60}`) on the floor, camera pushing in on the glass; callout
   `8,000 BTC`.
3. ("are buried") 3D low angle: the drive lands on a small `RubbishHeap` (`grow` ~0.25→0.6 as pieces pile over it);
   `thud` 0.4 on landing.
4. ("in a rubbish tip.") 3D wide: the full heap, camera craning up and back; a faint orange `glowAt` deep inside;
   callout `NEWPORT, WALES`.
5. ("Except they're not." — cut on "Except") 3D: the same glowing `Letterbox`, door shut, all 60 discs inside, slow
   push; callout `STILL HERE`. `sub_drop` 0.5 on "not".
`<HookText a="8,000 BITCOIN." b="IN A RUBBISH TIP." from={0} to={46} />` (y≈1130). Disclaimer:
"Illustration · James Howells case, Newport (UK)".

### S02 (122 f) · "Not one coin ever left the blockchain. You could look at them right now."
1. ("Not one coin ever left") 3D: dolly sideways along a `LedgerWall` (rows 6, cols 11), the `hot` box drifting into
   frame; callout `THE BLOCKCHAIN = A PUBLIC LEDGER` tracking the wall.
2. ("You could look at them") 2D dark: a clean ledger list built from `LEDGER_ROWS` (address in mono left, balance
   right, column heads `ADDRESS` / `BALANCE (BTC)`), `Cam2D` slow scroll up; the `his` row is orange with a small tag
   `UNMOVED`. Rows ≥ 44 px text.
3. ("right now.") 3D macro: camera close on the glowing `Letterbox` glass, discs sharp inside; callout
   `ANYONE CAN LOOK`. Disclaimer: "Illustration · example addresses".

### S03 (113 f) · "Because a crypto wallet doesn't hold your coins. It holds a key."
1. ("Because a crypto wallet") 3D: a `Handset` (screen: "Wallet" / "0.42 BTC" / "Send   Receive") standing upright,
   camera arcing round to the front.
2. ("doesn't hold your coins.") same phone, `xray` 0→1 over ~10 f: it turns to glass and is EMPTY inside; callout
   `NO COINS IN HERE`.
3. ("It holds a key." — cut on "It") macro on the glass phone: a `NumberKey` (scale ~0.34, upright) glowing inside it
   (pass as `children`), slow push; callout `JUST A KEY`. `thud` 0.4 on "key".

### S04 (135 f) · "The coins live on a public ledger, copied across thousands of computers."
1. ("The coins live on a public ledger,") 3D: high three-quarter view of the `LedgerWall`, camera craning down; a few
   chrome `Disc`s visible in the boxes; callout `THE LEDGER`.
2. ("copied across") 3D: `NodeField`, camera low and moving forward over the screens; `wave` 0→0.6 (orange ripple
   spreading out from the centre). `air_rise` 0.3.
3. ("thousands of computers.") 3D: high wide of the whole field, `wave` 0.6→1, camera rising; callout
   `EVERY ONE KEEPS A COPY`. Disclaimer: "Illustration · simplified".

### S05 (162 f) · "Your address is a glass letterbox. Anyone can look in. Anyone can drop coins in."
1. ("Your address is a glass letterbox.") 3D: one `Letterbox` (`coins={18}`, not glowing), camera orbiting ~25° and
   settling front-on; callout `YOUR ADDRESS` pointing at the address plate (`project`).
2. ("Anyone can look in.") 3D: push in to the glass, discs inside; callout `PUBLIC`.
3. ("Anyone can drop coins in.") 3D from slightly above: four `Disc`s fall one after another (8 f apart, each ~12 f
   fall, spinning gently) through the top slot (`LB.slot`) and join the pile (`coins` 18→22); `tick` on each.
   Callout `ANYONE CAN PAY IN`.

### S06 (147 f) · "But only one key opens it. And that key is just a very long secret number."
1. ("But only one key") 3D: the `NumberKey` gliding tip-first toward the letterbox keyhole (`LB.keyhole`, `keyGlow`),
   camera side-on three-quarter.
2. ("opens it.") the key is in, turns 90°, the door swings (`open` 0→0.9 over ~12 f), box frame goes `glow`;
   `click` 0.5.
3. ("And that key is just") 3D macro: camera travelling along the key blade, the digits readable (face-on, slow).
4. ("a very long secret number.") 2D black: `KEY_DIGITS` typed out in mono (3 lines of ~26, orange, ~52 px, 3 chars
   per frame), slow `Cam2D` push; small caps under it `A PRIVATE KEY IS A NUMBER ABOUT THIS LONG`. `type` sfx.
   Disclaimer: "Example number · not a real key".

### S07 (182 f) · "In 2013, James Howells threw out an old hard drive, with the only copy of his key."
1. ("In 2013,") 3D: two identical `HardDrive`s side by side on a dark desk surface (floor), camera sliding across;
   small 2D slate top-left of safe zone `2013 · NEWPORT, WALES` (tracked caps).
2. ("James Howells threw out an old hard drive,") 3D: one drive is lifted and dropped into the `Bin` (`lid` open);
   it falls in (~14 f), lid swings shut; `thud` 0.4.
3. ("with the only copy") 3D: inside-the-bin view or the drive alone on black: `xray` 0→1, the platter appears with
   `keyInside` — the glowing `NumberKey` on it; slow push.
4. ("of his key.") hold that push tighter (new angle), callout `THE ONLY COPY`. Disclaimer:
   "Illustration · per court documents, 2025".

### S08 (157 f) · "It's somewhere under 1.4 million tonnes of rubbish. And the courts said no digging."
1. ("It's somewhere under") 3D: low angle at the foot of a big `RubbishHeap` (R 6, H 4), camera craning up its side.
2. ("1.4 million tonnes of rubbish.") 3D wide high: the whole heap, small orange `glowAt` near the middle; 2D number
   over the lower third `1,400,000` (Orbitron ~88 px, counts up over 20 f) + small caps `TONNES`. `sub_drop` 0.5.
3. ("And the courts said") 2D dark: a plain court-notice card (off-white paper, serif-less, no crest): two lines
   `STORY.court1` / `STORY.court1b`, then `STORY.court2` / `STORY.court2b`, each second line stamped in (scale 1.15→1,
   5 f) in orange; `Cam2D` drift. `click` on each stamp.
4. ("no digging.") 3D: the heap behind a row of plain barrier posts rising from the floor in sequence (boxes, 3 f
   apart); callout `NO DIG`. Disclaimer: "Sources in caption".

### S09 (170 f) · "That's why your wallet app gives you twelve words. They're your key, written so a human can copy it."
1. ("That's why your wallet app") 3D: a `Handset` upright, screen "Back up your wallet" / "Write these 12 words down",
   camera push.
2. ("gives you twelve words.") 2D dark: the 12 `WORDS` appear in a numbered 3×4 grid, 2 f apart (mono, ~50 px),
   `Cam2D` slow push; `tick` every third word. Disclaimer: "Example words · never use these".
3. ("They're your key,") 3D: the `NumberKey` above, the `WordPlate` (`count={12}`) below it, both face-on; a thin
   orange line/bracket linking them; callout `SAME KEY`.
4. ("written so a human can copy it.") 3D: camera gliding across the `WordPlate` lying at a slight tilt (text within
   35° of face-on), `count` already 12; callout `ON PAPER OR STEEL · OFFLINE`.

### S10 (180 f) · "That's why losing your phone doesn't lose your coins. And why anyone with those words gets everything."
1. ("That's why losing your phone") 3D: a `Handset` tipping and falling away into darkness (falls ~1.2 s, moderate
   speed); behind it the glowing `Letterbox` (`coins={30}`) stays put; callout `PHONE: GONE`.
2. ("doesn't lose your coins.") 3D: the `WordPlate` in the foreground, a fresh `NumberKey` rising from it and gliding
   to the letterbox, which is still full; callout `SAME WORDS → SAME KEY`. `glint` 0.3.
3. ("And why anyone with those words") 3D: the same plate, but now a second, `dim` grey `NumberKey` rises from it
   (a stranger's copy) and heads for the keyhole.
4. ("gets everything.") 3D: door `open` 0→1, `coins` 30→0 over ~14 f as loose `Disc`s slide out to the right and off
   frame (moderate speed), box frame loses `glow` → `dim`; `thud` 0.4; callout `NO UNDO`.
   Disclaimer: "Illustration · simplified".

### S11 (159 f) · "So his bitcoin was never lost. It's exactly where it always was. Just locked."
1. ("So his bitcoin was never lost.") 3D: slow push toward the `LedgerWall` with the `hot` box; callout `8,000 BTC`.
2. ("It's exactly where it always was.") 3D: the hero glowing `Letterbox` (`coins={60}`) full-frame, camera arcing
   slowly; small 2D caps `UNMOVED SINCE 2013`.
3. ("Just locked." — cut on "Just") 3D macro on the keyhole plate (`keyGlow`): the glow fades out over ~15 f, no key;
   camera easing in. `thud` 0.4 on "locked". Hold through the pad.

### S12 — CTA (121 f) · "Send this to someone who's about to set up their first wallet."
1. (f0–~55) 3D: a brand-new empty `Letterbox` (`coins={0}`) rising into place while a fresh `NumberKey` settles
   beside it; camera slow orbit.
2. (~55–end) 2D dark with `Cam2D` push: three lines, Outfit 800 ~76 px: `SEND THIS TO SOMEONE` (white) /
   `SETTING UP THEIR` (white) / `FIRST WALLET.` (orange); under it `@dynkeducation` (500, 34 px, 55 % white) and small
   caps `EDUCATION ONLY · NOT FINANCIAL ADVICE` at y≈1440. Text arrives line by line (6 f apart). Hold to the end.

## 4. Composer workflow
1. Read this file, your `scenes/<SID>/props.json`, `_shared.tsx` (all), the worked example
   `studio/src/scenes/r_2026_11_09_bybit_every_signature_real/S03.tsx` (structure: Shell → Sequences → shots, CamRig,
   Cam2D, Callout, Disclaimer) and the kit signatures you use (`studio/src/kit/speedy.tsx` Callout/Disclaimer).
2. Write `studio/src/scenes/r_2026_11_12_wallet_holds_a_key/<SID>.tsx` (replace the scaffold; default export `Scene`).
   Derive cut frames from `W(props, word)` with sensible minimum gaps; last Sequence runs to `props.durationInFrames`.
3. `cd studio && npx tsc --noEmit -p .` must be clean for your file.
4. Stills: `bash tools/still.sh runs/2026-11-12-wallet-holds-a-key <SID> 12,45,80` (comma list, run from the repo root) → `review/<SID>/still-<f>.png`.
   One still mid-way through each shot; Read them; fix framing (object in safe zone, caption band clear, callouts on
   target, text readable). **Max 2 rounds of stills.** Do NOT run a full render — the director renders.
5. Write `runs/2026-11-12-wallet-holds-a-key/scenes/<SID>/composer-notes.md` (5 lines: shots, cut frames, anything
   unsure). Then stop and report in ≤5 lines.
