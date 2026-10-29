# 05 — Script: "The address you copied was a scammer's" (address poisoning)

**Revision 1 (adapter check round 1, `05b-adapter-check.md`). Changes:**
1. Beat-type labels relabelled (table + beat timestamps): line 4 → scenario, 6 → action, 8 → action, 9 → part, 10 → fact, 12 → fact, 14 → part. No type now repeats back to back. VO unchanged by this edit.
2. Line 16 twist back now re-uses the hook's words: "So nobody broke into your wallet. You checked the ends, they matched, and you sent it yourself."
3. Line 11: cut "in crypto" to hold length (the caption already says wrapped bitcoin).
4. Timings from line 11 onward re-flowed (+0.4 s net); totals updated to 224 words, ~88.1 s.

First pass notes: Inputs: `01-brief.md`, `03-hooks.md` (winner #3), `04-structure.md`,
`brand/dynk-context.md`, `brand/brand.md` (voice), `references/style-speedy_devv.md` §1–2, skills
`viral-short-form`, `viral-captions-and-ctas`. Proof facts re-checked against the Chainalysis post on 29 Oct 2026.

Hook, loop and reframe are verbatim from `03-hooks.md` / `04-structure.md`.
Spine: HOOK → LOOP → REFRAME → IMAGINE → MECHANISM → PROOF → "THAT'S ALSO WHY" ×3 → TWIST BACK → CTA.
Pace: hook brisk (18 words in 4.8 s), rest ≈ 2.5 words/s. Voice: calm, certain, short declaratives, no exclamation marks.

`Disclaimer` "Magnified illustration · addresses are made up" sits bottom-left on **every** tile / address shot.
All addresses on screen are fake strings (base: `0x7A3f c91E…b04D 9c2E`). One orange glowing system per shot.

| # | time | VO line | caption keyword | visual idea | beat |
|---|---|---|---|---|---|
| 1 | 0.0–4.8 | **HOOK** You checked the first four and last four characters, they matched, and the money still went to a scammer. | **matched** | Frame 1 already moving: macro track L→R along a glass tile row `0x7A3f c91E…b04D 9c2E`. `7A3f` glows orange (0.6 s), rack focus to `9c2E` (1.4 s), ghost row (the one you meant) slides down and the ends lock with an `EnergyArcs` spark (2.2 s), hard cut top-down on the middle tiles, which flip to different characters, white vs dim grey (2.8 s). Row slides off frame right on "scammer"; silence under the word. CALLOUT: FIRST 4 · CALLOUT: LAST 4 · CALLOUT: MIDDLE. Disclaimer. | [BEAT 1: part] |
| 2 | 4.8–6.8 | **LOOP** So what did you miss? | miss (no box) | Pull back and up: the tiles are the send field of a 3D `Phone`, transaction history list below. Nothing glows. | — |
| 3 | 6.8–12.4 | **REFRAME** It wasn't really your address. It was a lookalike, planted in your own history. | **history** | One history row lights orange and rises toward camera; its ends match the row above it. CALLOUT: PLANTED. Disclaimer. | [BEAT 2: twist] |
| 4 | 12.4–17.2 | **IMAGINE** Imagine paying a friend back with the address you copied last week. | **copied** | The one soft cross-dissolve, into a light passage: phone on a café table, thumb (AI hero plate, no face) long-presses last week's history row; the `Copy` menu pops. CALLOUT: COPY. | [BEAT 3: scenario] |
| 5 | 17.2–22.8 | A wallet address is a long string of characters. Most people skip the middle. | **middle** | Back to dark. Cross-section of the address as a long tile bar; ends lit, a bracket sweeps the middle and it dims. CALLOUT: START · CALLOUT: MIDDLE · CALLOUT: END. Disclaimer. | [BEAT 4: part] |
| 6 | 22.8–28.0 | A scammer's computer churns out addresses until one starts and ends like yours. | **ends** | Tile rows stream past camera at speed; one stops dead, its ends glow and match yours. CALLOUT: GENERATOR. Disclaimer. | [BEAT 5: action] |
| 7 | 28.0–32.8 | Then it sends you a tiny amount, often zero, from the lookalike. | **zero** | Low angle on the phone: a `+0.00` row drops into the history list from outside the phone, glowing. CALLOUT: 0.00 RECEIVED. | [BEAT 6: number] |
| 8 | 32.8–36.8 | Now it sits in your history, beside the real one. | **real** | Top-down on the list: the planted row settles beside the genuine row; camera tracks between them. Only the planted row glows. CALLOUT: REAL (grey) · CALLOUT: LOOKALIKE. Disclaimer. | [BEAT 7: action] |
| 9 | 36.8–42.4 | Next time, you copy the top one. The ends match. The middle never did. | **middle** | **Payoff shot:** the hook's ghost overlay replayed slowly from a new side angle; ends lock, middle tiles stay mismatched. CALLOUT: FIRST 4 ✓ · CALLOUT: LAST 4 ✓ · CALLOUT: MIDDLE ✗. Disclaimer. | [BEAT 8: part] |
| 10 | 42.4–46.0 | Once it's sent, no bank can pull it back. | **sent** | `ArcTravel` coin leaves the phone, lands on the lookalike row, the row dissolves into the dark. CALLOUT: IRREVERSIBLE. | [BEAT 9: fact] |
| 11 | 46.0–52.8 | **PROOF** In May 2024, someone sent a small test, then about sixty-eight million dollars to a lookalike. | **test** | B&W document plate (0x100x grammar): web capture of the Chainalysis post, typewriter line "3 May 2024". Two coin arcs: a small one lands on the real row, then a big one veers to the lookalike; `$68M` label on the big arc. CALLOUT: SOURCE: CHAINALYSIS. Optional ≤3 s credited Trezor CC-BY diagram clip. No real addresses, no victim name. | [BEAT 10: proof] at 46.0 · [BEAT 11: number] at 49.6 ("sixty-eight million") |
| 12 | 52.8–58.4 | It was returned after a negotiation. That campaign had over eighty-two thousand lookalikes. | **lookalikes** | Plate stays B&W: a return arc flows back to the sender (grey, not orange). Cut to a wall of fake tile rows as a counter ticks to `82,031` (the orange system). CALLOUT: ONE CAMPAIGN. Disclaimer ("addresses are made up"). | [BEAT 12: fact] |
| 13 | 58.4–63.6 | That's also why strangers send you tiny or zero amounts. Never copy those. | **zero** | Phone lock screen, a `+0.00` notification slides in from a stranger; camera pushes in; the row greys out and a strike line crosses its copy button. CALLOUT: DUST (tiny bait transfer). | [BEAT 13: consequence] |
| 14 | 63.6–69.2 | And it's why the three dots in a shortened address hide exactly what's different. | 🔍 **dots** | Macro on `0x7A3f…9c2E`; the `…` splits open like a cutaway and the mismatched middle characters unfold out of it. CALLOUT: HIDDEN. Disclaimer. | [BEAT 14: part] |
| 15 | 69.2–74.4 | And it's why paying a saved contact, username or QR code beats pasting. | **contact** | DYNK send screen in the background (real recording from `inbox/`) with a saved contact selected; nothing to paste. **Fallback (inbox has no recording today):** a clean drawn generic contact picker, no logo, no DYNK name. Never show or say that any app detects or blocks poisoning. CALLOUT: NOTHING TO PASTE. | [BEAT 15: consequence] |
| 16 | 74.4–81.2 | **TWIST BACK** So nobody broke into your wallet. You checked the ends, they matched, and you sent it yourself. | **yourself** | Return to the hook's lens: same macro, same L→R track on the tile row; ends glow, the ghost locks on again. CALLOUT: FIRST 4 · CALLOUT: LAST 4. Disclaimer. | [BEAT 16: twist] |
| 17 | 81.2–87.6 | **CTA** Follow me, and send this to someone who only checks the first and last few characters. | **characters** | `ShareSheetEnd` rises over the tile row ("to someone"), synced to "send this". Last 0.5 s (87.6–88.1) the sheet lowers and leaves the tile row exactly as frame 1, `7A3f` glowing, for a clean loop. | — |

## Totals
- **Spoken words: 224** (hook 18 + body 206; "2024" spoken as "twenty twenty-four").
- **Estimated length: ~88.1 s** (VO ends ~87.6 s + 0.5 s loop hold). Inside 70–90 s. If TTS runs slow and passes 90 s,
  cut "Never copy those." (line 13) first.
- Payoff lands at 36.8–42.4 s (line 9, "the middle never did"); loop-back at 74.4 s returns to the frame-1 lens and re-uses the hook's words.
- Takeaway the video earns (brief): never copy an address from your history; check the whole thing, every time
  (said through lines 9, 13, 14, 15; spelled out in the caption).

## Beat timestamps
| Beat | t (s) | type | what's new |
|---|---|---|---|
| 1 | 0.0 | part | ends match, middle doesn't (hook) |
| 2 | 6.8 | twist | it's a lookalike planted in your history (answer given early) |
| 3 | 12.4 | scenario | Imagine: copying last week's address to pay a friend back |
| 4 | 17.2 | part | an address = long string; start / middle / end |
| 5 | 22.8 | action | the scammer's generator churns out addresses |
| 6 | 28.0 | number | the +0.00 transfer |
| 7 | 32.8 | action | planted row slides in beside the real one |
| 8 | 36.8 | part | payoff: FIRST 4 ✓, LAST 4 ✓, MIDDLE ✗ |
| 9 | 42.4 | fact | irreversible |
| 10 | 46.0 | proof | May 2024 test payment, Chainalysis |
| 11 | 49.6 | number | ~$68M to the lookalike |
| 12 | 52.8 | fact | returned after negotiation; 82,031 lookalikes on the counter |
| 13 | 58.4 | consequence | that's also why: random zero/tiny transfers |
| 14 | 63.6 | part | and it's why: the three dots open as a cutaway (HIDDEN) |
| 15 | 69.2 | consequence | and it's why: contact / username / QR beats pasting |
| 16 | 74.4 | twist | twist back: you checked the ends, they matched, you sent it yourself |
| — | 81.2 | CTA | send to someone who only checks the ends |

Longest gap between beats: 6.8 s (0.0 → 6.8, hook + loop; the hook itself reveals three parts in its first 3 s).
Every other gap is 3.2–5.6 s. Type sequence: part · twist · scenario · part · action · number · action · part · fact · proof · number · fact · consequence · part · consequence · twist · CTA (no type twice in a row).

## Notes for adapter (check) / director
- Hook, loop and reframe are word-for-word as approved. The twist re-uses the hook's words ("you checked the ends,
  they matched") so the loop-back is audible as well as visual.
- CTA follows the house format ("Follow me and send this to someone who …"), naming the hook's behaviour.
- Proof wording: "sent", "returned after a negotiation", never "lost". The Chainalysis post confirms a test payment
  first, then ~$68M (WBTC) to the lookalike minutes later on 3 May 2024, returned on 9 May 2024 after negotiation,
  and 82,031 potential seeded addresses in the 28 Feb – 4 May 2024 campaign. The post's real address prefixes are
  NOT shown; use fake strings.
- "Four" / "first four and last four" in the hook is the viewer's habit, not a stat; tiles use a made-up address.
- No DYNK claim in VO. Line 15's visual uses the DYNK send screen only if a recording lands in `inbox/`
  (fact: "Pay a username, a contact, a QR code", dynk-context.md, website). Otherwise generic picker.
- Emoji: 🔍 on line 14 only.
- Boxed keywords repeat ("middle" lines 5 & 9, "zero" lines 7 & 13) are ≥14 s apart.

## Sources (go in the caption)
1. Chainalysis, "Anatomy of an Address Poisoning Scam" (23 Oct 2024): May 2024 case, test payment then ~$68M in
   wrapped bitcoin to a lookalike, returned 9 May 2024 after negotiation; 82,031 potential lookalike addresses in
   one campaign. https://www.chainalysis.com/blog/address-poisoning-scam/
2. MetaMask Help Center, "Address poisoning scams": zero-value / tiny transfers to plant lookalikes; some apps show
   only the first and last characters; check the middle; use saved contacts instead of history.
   https://support.metamask.io/stay-safe/protect-yourself/wallet-and-hardware/address-poisoning-scams/
3. TRM Labs, "Understanding address poisoning on the TRON blockchain": dust transfers often worth under $0.01.
   https://www.trmlabs.com/resources/blog/understanding-address-poisoning-on-the-tron-blockchain
4. DYNK feature (visual only, line 15): "Pay a username, a contact, a QR code" (dynk.io via `brand/dynk-context.md`).
