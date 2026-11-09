# 06 — Direction v2: "$1.5B, and every signature was real"

Run `2026-11-09-bybit-every-signature-real` · 12 scenes · ~59 s · 1080×1920 · 30 fps. **Version 2.** Cooper on v1:
"script is good, but the video is jittery, and you copied the exact same scenes/screens from the last video instead of
just keeping the quality." So: same VO, captions, look and quality bar — **a new visual world and smooth motion.**
Rewrite your scene **from scratch** (don't reuse the existing `<SID>.tsx`, which is v1). Do not touch VO, captions,
`_shared.tsx`, `registry.ts`, the kit.

## 1. Smooth motion (non-negotiable)
- **2D layers move only through `<Cam2D shot={...}>`** from `_shared` (sub-pixel; plain CSS translate/scale steps 1 px at
  a time = the jitter). Never animate `translate()`/`scale()`/`top`/`left` on text slowly by hand. Entry animations
  (an element sliding/scaling in over 4–10 frames) are fine.
- Every camera move is **eased** (CamRig and Cam2D already ease) and **moderate**: an object should cross the screen in
  no less than ~0.6 s. Nothing whips past the lens; no strobing streams of objects at >30 px/frame.
- Cuts every **0.8–1.8 s** (hook: 0.6–0.9 s). A shot can be one smooth, continuous move — let it breathe.
- Counters: tabular digits (`fontVariantNumeric: "tabular-nums"`), change at most every 2 frames.
- Still banned: zoom punches, flashes, shakes, whip pans, glitch, dissolves.

## 2. New visual world: INK & SIGNATURES
Same house look (dark charcoal studio, graphite/chrome, ONE orange glowing system per shot, tracked-caps `Callout`s,
grey `Disclaimer`, grain + vignette from Shell, captions top). **Orange = ink / signatures** in this video.
Props in `_shared.tsx` (read it): `Pen` (chrome fountain pen, nib at origin pointing down, `capped` 0..1),
`InkStroke` (3D glowing ink tube that draws along `points`, e.g. `SIG_POINTS`), `InkPath2D` (2D SVG glowing ink path
drawn by `progress`; `SIG_D` = a signature), `SignCard` (graphite glass request card), `VaultDoor` (multisig vault with
3 keyholes, `keys` 0..3 turned, `open` 0..1), `Token` (hex token), `GiftBox` (`open` 0..1), `Magnifier`,
`PaperStack` (tower of signed sheets, `count`, `grow` 0..1), `Keycap` (big physical CONFIRM key, `press` 0..1),
`KeyObj` (chrome key), plus `CamRig`/`project`/`W`/`Sfx`/`rand`, `STORY`/`SAW`/`SIGNED`/`HEX`.

**Banned (these were the $91M video's look — do not use):** `Coin`, `CoinStack`, `ArcTravel`, `Padlock`, `Phone`,
`ShareSheetEnd`, balance plates ticking down, chrome `$` number slams on black, dot/wallet grids, camera-roll grids,
chat bubbles/notifications, browser pages with input boxes, word tiles. If unsure: if it looks like the last video,
don't.

Text on screen: Outfit (`brand.body`); numbers can be Orbitron, ≤ 90 px. Safe zone x 70–1010, y 380–1500; caption band
y 200–360 clear (mask/fade 2D layers above y 380 if they pan). Disclaimer never on top of an object. No real logos,
brands or people; made-up URLs end in `.example`.

## 3. Scenes (word frames from `W(props, "word")`)

### S01 — HOOK (5.6 s) · "The biggest crypto theft ever. $1.5 billion. And every signature was real."
5–6 cuts, smooth; frame 0 already shows orange ink moving (it's the cover).
1. ("The biggest") 3D macro, low angle: the chrome `Pen` nib gliding left→right across a dark glass surface, laying a
   glowing `InkStroke` behind it (the stroke draws as the pen moves; camera tracks with the nib).
2. ("crypto theft ever.") 3D: the `VaultDoor`, heavy and closed, camera pushing in; its three keyholes light orange one
   by one (keys 0→3 over ~20 frames) — each with a `click`.
3. ("$1.5 billion.") 2D black: **"$1.5B" handwritten in glowing ink** with `InkPath2D` (you write the stroke paths for
   "$", "1", ".", "5", "B" — bold handwriting, ~620 px wide, centred y≈900), drawn over ~25 frames, slow Cam2D push;
   grey small caps under it `401,347 ETH · 21 FEB 2025`. `sub_drop` 0.55 when the "B" completes.
4. ("And every") 3D: three `SignCard`s standing in a row on the floor, camera dollying along them.
5. ("signature was real.") a glowing `InkStroke` signature writes itself across the front card's signature line;
   callout `SIGNED`. `thud` 0.4 on "real".
**Big text hook** f0–40 (y≈1150, x=90, Outfit 800 ~84 px): `$1.5 BILLION.` (white) / `EVERY SIGNATURE REAL.` (orange,
from f10). Gone at cut 3. Disclaimer: "Illustration · amount per FBI, 26 Feb 2025".

### S02 (3.9 s) · "Nobody stole their keys. The exchange's own signers approved it."
1. ("Nobody stole their keys.") 3D: three chrome `KeyObj`s hanging in a row from thin wires, intact and still, slow
   orbit; callout `KEYS: UNTOUCHED`.
2. ("The exchange's own signers") 3D: three `Pen`s standing nib-down over three `SignCard`s laid flat (top-down-ish
   angle), camera rising.
3. ("approved it.") the three pens sign in sequence (each card gets a short `InkStroke` signature, 6 frames apart);
   callout `3 OF 3 SIGNED`. Disclaimer: "Illustration · multisig signers (simplified)".

### S03 (3.2 s) · "Because on their screens, it looked like a routine transfer."
1. ("Because on their screens,") 3D: one `SignCard` (SAW lines: "Confirm transaction" / SAW[0] / SAW[1], button
   "Confirm") floating at eye level, soft reflection below, camera arcing round it slowly.
2. ("routine transfer.") 2D macro of the text "Routine internal transfer" with a neat grey ✓, Cam2D slide; callout
   `LOOKS NORMAL`. Grey world — the only orange is the callout.

### S04 (6.0 s) · "Hackers had slipped code into the wallet's website. The screen showed one transaction. The signature said another."
**The reveal — an exploded-view of layers (magnified cutaway).**
1. ("Hackers had slipped code") 3D: a stack of three thin glass sheets floating apart in depth (exploded view): back =
   the real request, middle = a sheet of orange code lines (draw as a canvas texture of mono code, orange), front = the
   friendly website sheet "Confirm transaction · Routine transfer". Camera at a 3/4 angle, slowly orbiting. Callout
   `INJECTED CODE` on the orange middle sheet.
2. ("into the wallet's website.") the sheets slide together into one card as the camera comes round to the front:
   you now see only the friendly front.
3. ("The screen showed one transaction.") front view, grey card; callout `WHAT THEY SAW`.
4. ("The signature said another.") the front sheet peels off sideways (rotates away on its left edge) revealing the
   **orange-glowing real card** behind (SIGNED lines: "Actually signing" / SIGNED[0] / SIGNED[1] / SIGNED[2]);
   `whoosh_soft`; callout `WHAT THEY SIGNED`. Disclaimer: "Illustration · per NCC Group analysis, Mar 2025".

### S05 (5.4 s) · "What they really signed handed over the whole wallet. 401,000 ether, gone."
1. ("What they really signed") 2D: the HEX calldata as a long ribbon of mono text curving in perspective (Cam2D slow
   push), grey; `delegatecall` glows orange in it. Callout `UNREADABLE TO HUMANS`.
2. ("handed over the whole wallet.") 3D: the `VaultDoor` swings open (open 0→1 over ~25 frames), camera pushing in.
3. ("401,000 ether,") 3D: a stream of orange `Token`s floating out of the open vault in a smooth, gentle arc into the
   dark (moderate speed, staggered, ~40 tokens); small grey counter `401,347 ETH` (tabular) bottom-centre ticking down.
4. ("gone.") empty vault interior, last token drifting away, camera holds then eases back; silence.
Disclaimer: "Illustration · 401,347 ETH per NCC Group".

### S06 (5.7 s) · "Here's the part about you. Every time you tap confirm, you sign a message you probably can't read."
The turn — now it's the viewer's button.
1. ("Here's the part about you.") 3D: the big `Keycap` (CONFIRM, orange) on the floor in a pool of light, camera
   descending toward it.
2. ("Every time you tap confirm,") macro: the keycap presses down (press 0→1→0, 6 frames down, 8 up) — `click`.
   Callout `YOU, EVERY DAY`.
3. ("you sign a message") as it presses, a glowing `InkStroke` signature writes itself in the air above the key.
4. ("you probably can't read.") 2D: the signature dissolves into a dense wall of grey mono message text
   (EIP-712-ish JSON), Cam2D push in until it's unreadable; one orange `???` callout.

### S07 (5.7 s) · "That's why fake airdrop sites just ask you to sign. One signature can let them spend your tokens."
1. ("That's why fake airdrop sites") 3D: a `GiftBox` on a plinth, glowing ribbon, camera circling; small grey label
   on a tag `claim-airdrop.example`. Callout `FREE AIRDROP?`.
2. ("just ask you to sign.") the lid lifts (open 0→1) and inside, instead of a gift, a single `SignCard` rises
   (title "Sign to claim", button "Sign").
3. ("One signature") the card flips to show its real fine print, glowing orange: "Permit" / "Spender: 0x9f…e2 (unknown)" /
   "Amount: UNLIMITED".
4. ("can let them spend your tokens.") a short chain of `Token`s slides along the floor out of frame toward the
   spender; callout `PERMISSION TO SPEND` (placed clear of the card). Disclaimer: "Illustration · simplified".

### S08 (8.4 s) · "In 2024, signature scams drained $494 million from 332,000 wallets."
Proof beat (real). Orange = the signatures on the paper.
1. ("In 2024,") 2D document plate: "Scam Sniffer · 2024 Web3 phishing report" (text only), Cam2D slow slide.
2. ("signature scams drained") 3D: a single signed sheet lands on the floor, then sheets pile up fast into a tower
   (`PaperStack` grow 0→1, count ~400), camera starting low.
3. ("$494 million") 2D overlay over the tower shot: "$494M" in Outfit 800 ~150 px (white with orange underline drawn
   as an `InkPath2D` stroke) — NOT a chrome slam. `sub_drop` 0.5.
4. ("from 332,000 wallets.") the camera rises and pulls back: a whole city of paper towers (6–9 `PaperStack`s at
   different heights) receding into the dark; tabular counter `332,000 WALLETS` below, clean dark backing.
Disclaimer: "Source: Scam Sniffer, 2024 report (Jan 2025)".

### S09 (3.7 s) · "It's why you check what your wallet says, not what the website says."
1. ("It's why you check what your wallet says,") 3D: a small hardware-wallet-like device (a graphite rounded slab with
   a screen — build from RoundedBox + a canvas texture reading "Change wallet logic" in orange); the `Magnifier` glides
   over its screen, magnifying the orange line. Callout `YOUR WALLET`.
2. ("not what the website says.") the camera pulls back to reveal a big grey `SignCard` ("Routine transfer ✓") behind
   it; an orange `InkPath2D` strike-through draws across that card's text (2D overlay aligned to it). Callout `WEBSITE`.
Disclaimer: "Illustration".

### S10 (4.0 s) · "And if it says unlimited, or you can't tell what it does, don't sign."
1. ("And if it says unlimited,") 2D macro: a fine-print row "Amount: UNLIMITED", "UNLIMITED" underlined with an orange
   ink stroke; Cam2D slide.
2. ("or you can't tell what it does,") 3D: the `Pen` hovering over a `SignCard`'s signature line, nib trembling a tiny
   amount (≤ 0.01 units — subtle, smooth sine, not jittery).
3. ("don't sign.") the pen lifts away and its cap slides on (`capped` 0→1, `click` on close); the card's line stays
   empty. Callout `DON'T SIGN`.

### S11 (3.4 s) · "Hackers don't need your keys. They just need your signature."
1. ("Hackers don't need your keys.") 3D: the three hanging `KeyObj`s from S02, now `dim`, slow drift; callout `KEYS`.
2. ("They just need your signature.") the glowing `InkStroke` signature from the hook writes itself large across the
   frame in front of the dim keys, camera easing in. Callout `SIGNATURE`.

### S12 — CTA (3.8 s) · "Send this to someone who taps confirm without reading."
Not the share sheet. 2D, black: a `SignCard`-style request card (2D version is fine) titled "Send this to…", one line
"someone who taps confirm without reading", and an orange button "Send". On "Send this" the card rises in; on "confirm"
an orange `InkPath2D` signature writes across the card's signature line; small handle `@dynkeducation` under the card.
Slow Cam2D drift, hold ≥ 0.6 s at the end. No disclaimer.
