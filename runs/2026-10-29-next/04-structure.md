# 04 — Structure: "The address you copied was a scammer's" (address poisoning)

Inputs: `01-brief.md`, `02-analysis.md` (cloud fallback, no live IG data), `03-hooks.md` (winner #3),
`references/style-speedy_devv.md` §1–6, `proven-hook-templates` (10 templates),
`viral-video-platform-specs` (Reels safe zone), `viral-short-form`.

## 1. Proven templates the winning hook maps to

Winner (verbatim, do not change): **"You checked the first four and last four characters, they matched, and
the money still went to a scammer."** Loop: **"So what did you miss?"** Reframe: **"It wasn't really your
address. It was a lookalike, planted in your own history."**

| Template | Why it fits | Our calm motion-graphics execution (no zoom punch / flash / shake) |
|---|---|---|
| **#6 Counter-Intuitive** (primary) | Breaks a belief the viewer acts on: "matching ends = right address". | The visual *agrees* with the belief first: `FIRST 4` and `LAST 4` tiles glow orange and lock onto the ghost copy. Then a hard cut to a new top-down angle on the middle, where the tiles flip to different characters. The contradiction is a new angle, not an effect. |
| **#2 Curiosity Gap** (two-part reveal) | Half A ("they matched") sets up safety, half B ("still went to a scammer") removes it, and the loop question names the gap. | Two-part *sentence-building caption*: `…they [matched],` sits on screen, then `and the money still went / to a scammer.` builds word by word. Silence under "scammer" while the row slides off frame. Gap closed at ~7–12 s by the reframe, as speedy does. |
| **#3 Direct Challenge** (secondary) | "You checked…" addresses the viewer's own habit, which makes the share line inevitable. | Second person in VO and caption; no face, no text card. The challenge comes back in the CTA ("the friend who only checks the first and last few"). |
| **#10 Question Hook** (loop only) | "So what did you miss?" at 5–7 s. | Plain caption phrase, no box. The camera pulls back to reveal the phone and history list: the question gets a new angle, not a graphic. |

Platform: Reels safe zone. All captions top centre (y ≈ 230–330 px) and callouts inside `tokens.video.safeZone`;
nothing important in the lower ~35 % or the right-hand button column.

## 2. Format

**Magnified 3D explainer (house v3, speedy 13.3M template)**, ~84 s, ~205–215 spoken words. Glass character tiles
(`Card` + `glyphTexture`) in a charcoal `Studio`, a 3D `Phone` with a drawn history list and send field,
`Callout`/`Disclaimer`/`PhraseCaption`/`EnergyArcs`/`ShareSheetEnd` from the kit. **One real-proof plate** at
45–55 s in 0x100x grammar (B&W web capture of the Chainalysis article via `record_web.mjs`, optional ≤3 s
credited Trezor CC-BY clip). Why: the 1M+ pattern is "moving spectacle object on frame 1, voice straight in,
labels on the object" (analysis patterns 1–3), and every shot here is buildable with the existing kit. The only
asset we don't have is a DYNK send-screen recording (see beat 14 fallback).

All addresses on screen are fake. `Disclaimer` "Magnified illustration · addresses are made up" on every tile shot.

## 3. Beat sheet (target 84 s)

Type key: **H** hook · **Q** loop · **R** reframe · **S** scenario · **P** part (a labelled component appears) ·
**A** action (something moves/happens) · **F** fact · **X** proof · **C** consequence · **T** twist · **CTA**.
No type appears twice in a row. A new fact/part/consequence lands every 4–6 s; camera move or new angle every
1.5–3 s inside each beat.

| # | Time | Type | VO (guide wording; hook/loop/reframe are fixed) | Visual (one orange system per shot) | Callout / boxed keyword |
|---|---|---|---|---|---|
| 1 | 0.0–4.8 | **H** | "You checked the first four and last four characters, they matched, and the money still went to a scammer." | Frame 1 already moving: macro track L→R along a tile row `0x7A3f c91E…b04D 9c2E`. `7A3f` glows (0.6 s) → rack focus to `9c2E` (1.4 s) → ghost row slides down, ends lock with `EnergyArcs` spark (2.2 s) → hard cut top-down on middle 32 tiles, they flip to different characters, white vs dim grey (2.8 s) → row slides off right on "scammer"; silence under it. | `FIRST 4`, `LAST 4`, `MIDDLE` · box **matched** |
| 2 | 4.8–6.8 | **Q** | "So what did you miss?" | Pull back and up: the tiles are the send field of a 3D `Phone`; history list below. Nothing glows. | — (no box) |
| 3 | 6.8–12 | **R** | "It wasn't really your address. It was a lookalike, planted in your own history." | One history row lights orange and rises toward camera; its ends match the row above it. | `PLANTED` · box **history** |
| 4 | 12–16 | **S** (IMAGINE) | "Imagine paying a friend back, to the same address as last time, copied straight from your history." | Soft cross-dissolve (the only one) into a light passage: phone on a café table, thumb (AI hero plate, no face) long-presses the top history row; `Copy` menu appears. | box **copied** |
| 5 | 16–21 | **P** | "An address is a long string of letters and numbers, and almost nobody reads the middle." | Back to dark. Cross-section of the address as a tile bar; ends lit, middle dims as a bracket sweeps across it. | `START` `MIDDLE` `END` · box **middle** |
| 6 | 21–26 | **A** | "A scammer's computer makes new addresses over and over, until one starts and ends like yours." | Tile rows rain past camera (Cleo "one impossible image"); one stops, its ends glow and match yours. | `GENERATED` · box **ends** |
| 7 | 26–31 | **P** | "Then it sends you a tiny amount, sometimes zero, from that lookalike." | Low angle on the phone: a `+0.00` row drops into the history list from outside the phone, glowing. | `0.00 RECEIVED` · box **zero** |
| 8 | 31–36 | **A** | "Now their address sits in your history, right next to the real one." | Top-down on the list: the planted row slides into place beside the genuine row; camera tracks between them. Only the planted row glows. | `REAL` (grey) / `LOOKALIKE` · box **history** is used at beat 3, so box **next** |
| 9 | 36–41 | **P** | "Next time, you copy the one at the top. The ends match. The middle never did." | **Payoff shot:** replay the hook's ghost overlay from a new side angle: ends lock, middle tiles stay mismatched. This is where the promise lands visually. | `FIRST 4 ✓` `LAST 4 ✓` `MIDDLE ✗` · box **middle** |
| 10 | 41–45 | **F** | "And once it's sent, no bank and no app can pull it back." | `ArcTravel` coin leaves the phone and lands on a tile row that dissolves into the dark. | `IRREVERSIBLE` · box **sent** |
| 11 | 45–55 | **X** (PROOF) | "In May 2024, one person sent a small test first, didn't check where it landed, then sent about sixty-eight million dollars in crypto to a lookalike. It came back days later, after a negotiation. That one campaign planted over eighty-two thousand lookalikes." | B&W document plate: Chainalysis article web capture, typewriter line; two coin arcs (small one to the real row, big one veers to the lookalike); then a counter `82,031` ticking over a wall of fake tile rows. Optional ≤3 s Trezor CC-BY diagram clip. | `SOURCE: CHAINALYSIS` · box **test** |
| 12 | 55–60 | **C** | "That's also why strangers send you tiny or zero amounts out of nowhere. Ignore them, and never copy from them." | Phone lock screen, `+0.00` notification slides in; camera pushes in; row greys out. | `DUST` · box **zero** (>10 s after beat 7's box) |
| 13 | 60–66 | **F** | "Most apps shorten an address with three dots, and the dots hide the exact part that's different." | Macro on `0x7A3f…9c2E`; the `…` splits open like a cutaway and the 32 mismatched characters unfold. | `HIDDEN` · 🔍 + box **dots** |
| 14 | 66–72 | **C** | "And it's why paying a saved contact, a username or a QR code beats pasting a string." | DYNK send screen in background (real recording from `inbox/`) with a contact selected; nothing to copy. **Fallback if no recording:** drop "DYNK" and show a clean drawn generic contact picker, no logo. Never claim DYNK detects or blocks poisoning. | `NOTHING TO PASTE` · box **contact** |
| 15 | 72–79 | **T** | "So nobody broke into your wallet. You checked the ends, they matched, and you sent it yourself, to an address that was only pretending to be familiar." | Return to the hook's macro tile row, same lens, same L→R track; ends glow, ghost locks on again. | box **yourself** |
| 16 | 79–85 | **CTA** | "Send this to the friend who only checks the first and last few characters." | `ShareSheetEnd` rises over the tile row ("to someone"), synced to the line; final 0.5 s the sheet lowers and leaves the tile row exactly as frame 1. | box **friend** |

Type sequence: **H Q R S P A P A P F X C F C T CTA**: no type twice in a row. Longest gap between new
facts/parts/consequences is 6 s (beats 13–14); proof beat 11 carries three facts in 10 s (test, $68M, 82,031).

"That's also why / and it's why" consequences: 2 (beats 12, 14) plus the "dots" fact (13) as a third
everyday-experience tie-in. The test-send lesson lives inside the proof (11). Meets the ≥2 rule.

## 4. Numbers on screen and their sources (all go in the caption)
- "about $68 million", "May 2024", test payment first, funds returned (9 May 2024) → Chainalysis, *Anatomy of an
  Address Poisoning Scam*, https://www.chainalysis.com/blog/address-poisoning-scam/
- `82,031` lookalike addresses in one campaign → same Chainalysis post.
- "zero-value transfers", "apps show only the first and last characters" → MetaMask Help Center, address poisoning.
- "4", "32 middle characters" are illustrative of a fake 40-character hex address; tag with `Disclaimer`
  ("addresses are made up"). If the scripter wants a spoken length ("about forty characters"), source it
  (ethereum.org, accounts) or keep it out of VO, as above.
- Proof beat wording: "sent" / "came back after a negotiation", never "lost"; no victim name; partial real
  prefixes (`0xd9A1b`/`0xd9A1c`) not shown, use fake strings.

## 5. Payoff and loop-back
- **The payoff that must land: beat 9 (36–41 s).** The hook showed ends matching and middle flipping in 2 s;
  beat 9 replays the exact same ghost-overlay from a slower side angle with ✓ ✓ ✗ callouts, now that the viewer
  knows *how* the lookalike got into history. Script line must contain "the middle never did" (or equal).
- **Loop-back:** the twist (beat 15) returns to the frame-1 lens and track and re-uses the hook's words ("you
  checked the ends, they matched"). The CTA's share sheet lowers in the last 0.5 s to leave the tile row exactly as
  frame 1 (same position, same `7A3f` glow), so a replay reads as continuous.
- Takeaway the whole video earns (brief): *Never copy an address from your history; check the whole thing, every time.*

## 6. Notes for the scripter / director
- Word budget ~205–215 (hook is 18 words in 4.8 s, brisk; rest at ~2.5 w/s).
- No hype words, no price/loss sensationalism, no investment language. "Scammer" is fine; no "insane", "crazy".
- Emoji budget: 🔍 at beat 13 only.
- Clipper: Trezor "What is Address Poisoning?" (CC-BY, https://www.youtube.com/watch?v=adWaboh0F3Y) is optional
  for beat 11; diagram/UI moment only, credited.
- Inbox still has no DYNK app recording → beat 14 fallback applies unless Cooper drops one in before the director stage.
