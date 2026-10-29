# 02 — Analysis: "The address you copied was a scammer's" (address poisoning)

> **NO LIVE INSTAGRAM DATA.** This is a cloud session with no Chrome (Claude in Chrome tools unavailable).
> Nothing below was newly observed on Instagram today. Every reel, play count and creator comes from
> `data/hook-bank.md` and the style bibles (`references/style-speedy_devv.md`, `references/style-0x100x.md`,
> `references/notes.md`), which record what earlier analyzer runs actually saw on 26 and 29 Oct 2026.
> Web search (Firecrawl, 29 Oct 2026) was used **only** for topic facts and on-topic proof sources, not for play counts.

## Own page snapshot
- No new data: the @dynkeducation grid could not be opened. `data/own-page-log.md` was **not** appended.
- Last observed (26 Oct 2026, 4 rows logged): 151–579 plays. Best = "Nobody knows who owns this — 1,100,000" (579, mystery hook). Worst = Mt Gox "FEB 2014 — Withdrawals frozen" (151, dark, text-heavy first frame).
- Likely why (from that log): the mystery / single-big-object hook beat the text-heavy dark openers. That supports the brief's plan: open on a moving magnified object (the two addresses), not a wall of text.
- Style reference @0x100x: not re-checked (no browser). No additions to `references/style-0x100x.md` §7.

## Search coverage
| Planned | Done? |
|---|---|
| IG keyword search: address poisoning, crypto scam explained, crypto wallet for beginners, how to send crypto safely, wrong wallet address, copy paste crypto scam, check wallet address, crypto security tips | **No** (no browser) |
| Hashtags #addresspoisoning #cryptoscam #cryptosecurity #cryptoforbeginners #cryptowallet #scamawareness #web3education | **No** |
| @speedy_devv Reels tab | **No new look.** Using the 29 Oct 2026 study in `references/style-speedy_devv.md` |
| Web search: "address poisoning crypto scam explained instagram reel", "$68 million WBTC address poisoning" | Yes. Results were articles and help pages. One IG reel surfaced (https://www.instagram.com/reel/DVqiGpkibPD/, generic "common crypto scam" interview clip about fake trading platforms, off-topic); **play count not seen**, so it is not shortlisted. |

**Result: 0 on-topic 1M+ address-poisoning reels verified.** The shortlist below is the 5 1M+ reels already in the hook bank (adjacent education / explainer niches), plus @speedy_devv's 233K reel as a format note.

## Breakdown table (from hook bank; observed in earlier runs, not re-checked today)
| Plays | Account | Format | Visual | Audio | Text | URL |
|---|---|---|---|---|---|---|
| 13.3M | @speedy_devv | Magnified 3D explainer, paradox hook, ~80 s | Macro 3D cutaway of a phone screen: finger lightly brushes and the grid glows; pen presses and nothing happens. Already moving on frame 1 | VO paradox line: "Your phone screen reacts to the lightest brush of your finger, and ignores a pen pressed as hard as you can." Calm VO (inferred), original audio (inferred) | Sentence-building caption top centre, one boxed keyword | https://www.instagram.com/speedy_devv/reel/DeW3kuNM2v5/ |
| 8.2M | @humphreytalks | Process B-roll + VO, series pt 1/7 | Molten gold pouring into bar moulds, close-up, glowing orange | VO straight in (inferred) | Small bottom caption only | https://www.instagram.com/reel/DArRvdyAh1m/ |
| 5.8M | @zackdfilms | 3D animated story | Two 3D characters in a bunker doorway, mid-situation | VO narration (inferred) | "left", centred low | https://www.instagram.com/zackdfilms/reels/ (grid; reel URL not recorded) |
| 5.7M | @markrober | Science entertainment | Mark on a graduation stage with a drone (unexpected object in frame 1) | Speech (inferred) | None | https://www.instagram.com/markrober/reels/ (grid; reel URL not recorded) |
| 2.6M | @cleoabram | Surreal-visual science explainer | Sky full of falling elephants: one impossible image fills the frame | VO (inferred) | None on cover; her style uses neon labels + giant arrows on the subject | https://www.instagram.com/cleoabram/reels/ (grid; reel URL not recorded) |
| 233K (below 1M; format note only) | @speedy_devv | Magnified 3D, "it's faking it" hook | MacBook trackpad cutaway, haptic coil under glass | VO not transcribed | Observed words: "just clicked.", "a button,", "faking a click." | https://www.instagram.com/speedy_devv/reel/De1g_WXsVJC/ |

Post dates for these reels were not recorded in the hook bank.

## Patterns (across the 5 1M+ reels)
1. **Spectacle object on frame 1, already moving: never a face, title or text card.** 5/5 open on a striking object or situation (glowing screen grid, molten gold, falling elephants, 3D scene, drone on a stage). The same creators' talking-head posts sat at ~75K–185K (`references/notes.md`). For us: two near-identical addresses sliding together under a macro lens, with the first 4 and last 4 characters glowing orange and matching on frame 1.
2. **One idea, voice straight in, no preamble.** All 5 go straight into VO or speech (inferred). The top one (13.3M) states a two-half paradox about an object in the viewer's hand within ~5 s and gives the answer away early. Our brief's line ("The address you copied looked exactly right, and it was a scammer's.") fits shape A.
3. **Small text; the visual does the shouting.** Captions are small (bottom or top-centre sentence-building). Labels and arrows sit *on* the object (Cleo, speedy callouts). For us: callout labels `FIRST 4` / `MIDDLE` / `LAST 4` on the address, one boxed keyword per phrase ("copied", "history", "middle").
4. **Length / format:** the on-format winner (speedy) runs ~80 s, magnified 3D. Story/series framing shows up elsewhere (Humphrey pt 1/7, Zack narrative). Fits the 70–90 s target.
5. **Consequence ladder (speedy 13.3M):** "That's also why your screen goes crazy in the rain" → "And it's why touchscreen gloves work". The brief's ladder (random tiny incoming transfers → wallets shorten addresses with "…" → test send → saved contact/username) maps onto it directly.

## Trending sounds seen
**None observed.** Every audio entry in the hook bank is VO or original audio, and all of it is inferred. No trending sound name has ever been recorded on a winner. Recommendation: ship with VO + `bed_drone.wav` as house rules say. Do not attach a trending sound at upload unless one is observed on a live check from the Mac.

## Reference candidates (for the director)
1. **@speedy_devv 13.3M**, https://www.instagram.com/speedy_devv/reel/DeW3kuNM2v5/: the template for the whole spine (paradox → "So what is it actually…?" → early reframe → magnified mechanism → "that's also why" ×2 → twist back → specific share CTA). Copy the macro cutaway + callouts + sentence-building captions.
2. **@cleoabram 2.6M (falling elephants)**, https://www.instagram.com/cleoabram/reels/: one impossible image for an abstract idea, labels/arrows on the subject. Use it for the "82,031 lookalike addresses" beat (see proof below) as a wall/rain of near-identical address strings, with one orange.
3. **@0x100x 831K** (house v2, below 1M), https://www.instagram.com/0x100x/reel/Da8FpGRMYDA/: real-proof beat grammar (B&W, name card / document plate, live counter). Use it for the Chainalysis case-study beat, not the cold open.

## On-topic proof sources found (web, 29 Oct 2026; for scripter/clipper; caption must cite)
- **Chainalysis, "Anatomy of an Address Poisoning Scam"** https://www.chainalysis.com/blog/address-poisoning-scam/
  - 3 May 2024: a victim sent a test payment to `0xd9A1b…`, then minutes later sent ~**$68M in WBTC** to the scammer's lookalike `0xd9A1c…` (matched on the first characters). Funds were returned on 9 May 2024 after negotiation.
  - The campaign (28 Feb – 4 May 2024) generated **82,031** lookalike "seeded" addresses; **756** addresses sent only small $1–$100 amounts, likely test payments, which limited losses.
  - Caution: the $68M is a loss figure / named incident. The brief allows it only because it is real and sourced. Say "nearly lost" / "sent", note the funds came back, and use clearly illustrative addresses on screen (the prefixes are real but partial. Safest is fake strings).
- **MetaMask Help Center, address poisoning** https://support.metamask.io/stay-safe/protect-yourself/wallet-and-hardware/address-poisoning-scams/: often **zero-value** transfers. Some apps show only the first and last 5–10 characters. Check the middle characters. Use saved contacts instead of history. (Do not imply DYNK has a similar warning: not in `dynk-context.md`.)
- **TRM Labs (TRON)** https://www.trmlabs.com/resources/blog/understanding-address-poisoning-on-the-tron-blockchain: dust often worth < USD 0.01.
- Possible real footage for the clipper: Trezor YouTube explainer "What is Address Poisoning?" (Feb 13 2025, listed as **Creative Commons Attribution**), https://www.youtube.com/watch?v=adWaboh0F3Y. Brand footage, so use only a credited UI/diagram moment, not a pitch.

## Gaps / caveats
- **No live Instagram data.** 0 new reels opened, 0 new play counts, 0 on-topic 1M+ reels verified. Shortlist = 5 hook-bank reels (target was 8–12).
- Audio and first spoken lines are inferred except speedy's 13.3M line (transcribed in a previous run).
- 3 hook-bank entries link to account grids, not the specific reel. Post dates are unknown.
- Nothing appended to `data/hook-bank.md` (no new breakdowns) or `data/own-page-log.md` (no new observations).
- **STATUS inconsistency:** STATUS.md says "Cooper picked backup 2 at Gate 1", but 01-brief.md (and the STATUS topic line) is address poisoning, and backup 2 in the brief is "nothing leaves your phone". This analysis follows 01-brief.md. The orchestrator should confirm with Cooper.
- Recommend a live analyzer pass from the Mac (Chrome) before publishing to check #addresspoisoning / "copy paste crypto scam" reels and trending audio.
