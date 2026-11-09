# 06 — Direction: "$1.5B, and every signature was real"

Run `2026-11-09-bybit-every-signature-real` · 12 scenes · ~59 s · 1080×1920 · 30 fps · v3.1 (read
`references/v3.1-pacing-and-story.md`). VO is final (`audio/vo/<SID>.mp3`, word timings in
`scenes/<SID>/props.json` → `props.vo.words`). Captions are automatic. **Do not touch** VO, captions, `_shared.tsx`,
`registry.ts`, the kit. Last video in this look: `studio/src/scenes/r_2026_10_29_91m_twelve_words/` (S01 hook,
S06 phone/chat UI, S09 browser page, S05 big-number/bars) — reuse its techniques, it was approved.

## Global rules
- Keep the v3 look exactly: dark charcoal studio, graphite glass objects, ONE orange glowing system per shot, tiny
  tracked-caps `Callout`s with leader lines, grey `Disclaimer` bottom-left, grain + vignette (Shell adds these).
- **Hard cut every 0.6–1.5 s** (hook S01: every 0.5–0.8 s). Nothing holds still > 1 s; objects arrive in 4–8 frames
  with ease-out; camera always travelling. No zoom punches, flashes, whip pans, shakes, glitch, dissolves.
- **Land on the word** (`W(props, "word")`). SFX via `<Sfx/>`: whoosh_soft 0.25–0.35 on most cuts, tick/type
  0.2–0.3, thud/sub_drop 0.5–0.65 only on beats named below. Never two on one frame.
- Safe zone: own visuals inside x 70–1010, y 380–1500; caption band y 200–360 stays clear (3D objects too — keep
  card tops below y≈380 on screen). Disclaimer must not sit on top of an object.
- **2D for UI, numbers, documents, browser, chat (fast to render); 3D for the hero `SignCard`, coins, padlocks.**
- No real logos or brand UI (no Bybit, Safe, MetaMask, Ethereum logos). Names may appear as plain text in
  disclaimers/name cards only. Made-up URLs end in `.example`. No real people shown.
- Big chrome numbers: Orbitron ~80–90 px max per line, or the short form (`$1.5B`) — never overflow the safe zone.

## The world (`studio/src/scenes/r_2026_11_09_bybit_every_signature_real/_shared.tsx`)
- `SignCard` — graphite glass slab 2.4 × 1.5 × 0.08 with a drawn request: `lines` (title + rows), optional
  `button` ("Confirm" / "Sign"), `glow` (orange border + orange body edges), `dim`. If it stands on the floor its centre
  y must be ≥ 0.85 (else the bottom sinks into the floor). Full card in portrait ≈ camera distance 6.5–7.5 at fov 32.
- `SAW` (what the screen showed) / `SIGNED` (what was really signed) / `HEX` (random calldata) / `STORY`
  ($1.5B, 401,347 ETH, 21 FEB 2025, $494M, 332,000).
- `CamRig`/`project`, `W`, `Sfx`, `rand` as before. Kit: `Shell`, `Studio3D` (`shadows={false}` unless needed),
  `Coin`, `CoinStack`, `ArcTravel`, `Phone`, `Padlock`, `Plinth`, `Callout`, `Disclaimer`, `ChromeNumber`, `Counter`,
  `NameCard`, `Typewriter`, `ShareSheetEnd`.

## Scenes (frames = 30 fps from scene start; use W() for exact word frames)

### S01 — HOOK (5.6 s) · "The biggest crypto theft ever. $1.5 billion. And every signature was real."
Six hard cuts, all moving on frame 0, orange visible on frame 0 (it's the cover). Orange system = the money / the sign.
1. f0–18 ("The biggest") 3D: extreme low macro on a towering `CoinStack` column (orange-topped chrome coins), top
   coins already lifting off and streaming past the lens; camera rising fast.
2. f18–36 ("crypto theft") 2D: a vault-like cold-wallet balance plate, big mono `401,347.00 ETH` ticking DOWN fast
   in orange, grey label `COLD WALLET`. Callout `COLD WALLET`.
3. f36–54 ("ever.") 3D: a wide shot of a single orange coin river arcing out of a dark plinth into the void (`ArcTravel`
   with many staggered coins). `whoosh_soft`.
4. f54–95 ("$1.5 billion.") **the slam**: 2D giant chrome `$1.5B` (or `$1,500,000,000` on two lines ≤ 90 px) lands in
   5 frames centre, camera drifting; grey line under it `401,347 ETH · 21 FEB 2025`. `sub_drop` 0.6 on land.
5. f95–135 ("And every") 3D: three `SignCard`s in a row ("Confirm transaction" / "Transfer" / button "Confirm"),
   camera tracking fast along them; a small orange ✓ stamp lands on each card in turn (4 frames apart). `click`.
6. f135–end ("signature was real.") macro on the last card's orange "Confirm" button being pressed (button dips),
   callout `SIGNED ✓`. `thud` 0.45 on "real".
**Big text hook layer** f0–40 (y≈1150, x=90, Outfit 800 ~84 px): `$1.5 BILLION.` (white) / `EVERY SIGNATURE REAL.`
(orange, appears f10). Gone hard on cut 3. Disclaimer: "Illustration · amount per FBI, 26 Feb 2025".

### S02 (3.9 s) · "Nobody stole their keys. The exchange's own signers approved it."
1. ("Nobody stole their keys.") 3D: a chrome `Padlock`, closed and intact, camera orbiting; callout `KEYS: SAFE`.
2. ("The exchange's own signers") 2D: three signer slots in a row (generic avatar circles, labels `SIGNER 1/2/3`,
   no faces) each with a hardware-wallet-like small device icon; camera sliding.
3. ("approved it.") each slot gets an orange `APPROVED` check in sequence (3 frames apart). Callout `3 OF 3 APPROVED`.
Disclaimer: "Illustration · multisig signers (simplified)".

### S03 (3.2 s) · "Because on their screens, it looked like a routine transfer."
1. ("Because on their screens,") 3D: `SignCard` with `SAW` lines (title "Confirm transaction", rows SAW[0], SAW[1])
   and button "Confirm", camera pushing in fast from a high angle.
2. ("routine transfer.") macro on "Routine internal transfer" text row; callout `LOOKS NORMAL`. Card is grey (not
   glowing) — orange is only the callout dot/line here.

### S04 (6.0 s) · "Hackers had slipped code into the wallet's website. The screen showed one transaction. The signature said another."
The mechanism. Orange system = the injected code / the real transaction.
1. ("Hackers had slipped code") 2D: a dark browser window (URL `wallet-app.example`), code view; an orange block of
   JavaScript lines slides into the middle of grey code (typewriter fast). Callout `INJECTED CODE`. `type`.
2. ("into the wallet's website.") pull back: the code sits behind the friendly web page ("Confirm transaction" UI);
   page renders over it, orange code still glowing through at low opacity.
3. ("The screen showed one transaction.") 3D: grey `SignCard` with SAW lines, front, camera left-of-centre.
4. ("The signature said another.") the card **flips** (rotate Y 180° in 8 frames) — the back is an orange-glowing
   `SignCard` with SIGNED lines (title "Actually signing", rows SIGNED[0], SIGNED[1], SIGNED[2]); `whoosh_soft`.
   Callout `WHAT THEY REALLY SIGNED`.
Disclaimer: "Illustration · per NCC Group analysis, Mar 2025".

### S05 (5.4 s) · "What they really signed handed over the whole wallet. 401,000 ether, gone."
1. ("What they really signed") 2D macro: raw calldata `HEX` scrolling in mono, unreadable, grey, with
   `delegatecall` highlighted orange as the camera slides along. Callout `UNREADABLE`.
2. ("handed over the whole wallet.") 3D: a big vault-like slab labelled `COLD WALLET` on a plinth; an orange key/lock
   icon detaches from it and slides away to a dark silhouette slab labelled `ATTACKER` (no people). `thud` 0.45.
3. ("401,000 ether,") 2D: Counter `401,347 ETH` in chrome Orbitron (≤ 90 px) ticking DOWN to 0 fast, orange.
4. ("gone.") the balance plate reads `0.00 ETH`, dim; camera keeps pushing; silence.
Disclaimer: "Illustration · 401,347 ETH per NCC Group".

### S06 (5.7 s) · "Here's the part about you. Every time you tap confirm, you sign a message you probably can't read."
The turn — from the exchange to the viewer.
1. ("Here's the part about you.") 2D: phone (generic dark wallet app) rises into frame, camera tilting; the screen
   shows a generic "Signature request" sheet from `claim-airdrop.example`.
2. ("Every time you tap confirm,") macro: a thumb-press ripple on the orange "Confirm" button (ripple ring only,
   no hand). `click`.
3. ("you sign a message") 2D: the "Message" field expands into a long mono blob (EIP-712-ish fake text / hex), grey.
4. ("you probably can't read.") camera pushes into the unreadable text until it fills the frame; callout `???`
   in orange. Disclaimer: "Illustration · made-up site".

### S07 (5.7 s) · "That's why fake airdrop sites just ask you to sign. One signature can let them spend your tokens."
1. ("That's why fake airdrop sites") 2D browser: big "🎁 Claim your airdrop" page (`claim-airdrop.example`), confetti
   shapes in greys, an orange "Claim" button. Callout `FAKE AIRDROP`.
2. ("just ask you to sign.") the button press opens a "Signature request" sheet — no gas fee, just "Sign". `click`.
3. ("One signature") 3D: one orange `SignCard` (title "Permit", rows "Spender: 0x9f…e2 (unknown)",
   "Amount: Unlimited") floating; camera orbiting.
4. ("can let them spend your tokens.") 3D/2D: chrome coins slide off a stack toward the unknown spender, in a line.
   Callout `PERMISSION TO SPEND`. Disclaimer: "Illustration · simplified".

### S08 (8.4 s) · "In 2024, signature scams drained $494 million from 332,000 wallets."
Proof beat (real, sourced). Orange system = the totals.
1. ("In 2024,") 2D: `NameCard` style document plate: "Scam Sniffer · 2024 Web3 phishing report" (text only, no logo),
   a grey line chart shape rising.
2. ("signature scams drained") a column of many small signature cards (2D) stacking fast, each with a tiny orange
   tick — dozens per second.
3. ("$494 million") giant chrome `$494M` lands centre (sub_drop 0.55), camera drift.
4. ("from 332,000 wallets.") pull back: a dense dot field / grid of tiny wallet icons fills in to `332,000` (Counter
   0→332,000 in orange under it). Hold ≥ 0.5 s.
Disclaimer: "Source: Scam Sniffer, 2024 report (Jan 2025)".

### S09 (3.7 s) · "It's why you check what your wallet says, not what the website says."
1. ("It's why you check what your wallet says,") 3D: a small hardware-wallet-like device / phone on a plinth whose
   screen shows the true details (orange: "Change wallet logic"); camera pushing in. Callout `YOUR WALLET`.
2. ("not what the website says.") cut to a 2D browser page saying "Routine transfer ✓" (grey) — an orange strike line
   draws through it in 4 frames. Callout `WEBSITE`. Disclaimer: "Illustration".

### S10 (4.0 s) · "And if it says unlimited, or you can't tell what it does, don't sign."
1. ("And if it says unlimited,") 2D macro on an approval row `Amount: UNLIMITED`, "UNLIMITED" in orange, camera sliding.
2. ("or you can't tell what it does,") the HEX blob again, blurred grey, with a `?` callout.
3. ("don't sign.") 3D: a `SignCard` with button "Sign" — the card goes `dim` and a chrome `Padlock` drops onto it
   (`thud` 0.5). Callout `DON'T SIGN`.

### S11 (3.4 s) · "Hackers don't need your keys. They just need your signature."
Twist back to the hook's world.
1. ("Hackers don't need your keys.") 3D: the intact chrome padlock from S02, grey, camera orbiting; callout `KEYS`.
2. ("They just need your signature.") hard cut: the orange "Confirm" button macro from S01, pressed once, coins
   streaming away behind it (callback). Callout `SIGNATURE`.

### S12 — CTA (3.8 s) · "Send this to someone who taps confirm without reading."
`ShareSheetEnd` (handle `dynkeducation`) rises on "Send this", contact picked ~f26. Before it rises (f0–10) show the
orange "Confirm" button being tapped on a phone, so the CTA names the behaviour. Hold the sheet with a slow drift.
No disclaimer.
