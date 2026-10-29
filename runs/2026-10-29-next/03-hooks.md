# 03 — Hooks: "The address you copied was a scammer's" (address poisoning)

Inputs read: `01-brief.md`, `02-analysis.md` (cloud fallback, no live IG data), `data/hook-bank.md`,
`references/style-speedy_devv.md` §1–2 and §6, `references/style-0x100x.md` (cold-open grammar),
`viral-hooks` (SKILL, archetypes, three-layer, anti-patterns, tactics, checklist, worksheet),
`viral-instagram-reels` (reels-hook, checklist). Kit checked: `studio/src/kit/three.tsx` (`Studio`, `Phone`,
`Card`, `glyphTexture`, `ArcTravel`, `Enter`), `studio/src/kit/speedy.tsx` (`PhraseCaption`, `Callout`,
`Disclaimer`, `EnergyArcs`, `ShareSheetEnd`).

> **Producibility note for the director:** `inbox/` holds only `_demo/` footage (no DYNK app screen
> recording). None of the hooks below need app footage. The later DYNK beat (pay a saved contact /
> username) will need a real send-screen recording dropped into `inbox/`, or it gets cut.

## The everyday object + contradiction
- **Object:** the wallet address you paste into the send field, and the transaction history you copied
  it from. Both are on the phone in the viewer's hand; most holders have done "copy from last time".
- **Contradiction a normal person notices:** *you did the check everyone does (first few + last few
  characters), it matched, it came from your own history, and it was still the wrong address.*
- Topic passes the "has an everyday object" test. No substitute needed.

---

## WINNER: #3 "You checked the ends" (shape A, paradox) — **9/10**

| Layer | Content | Lands |
|---|---|---|
| **Spoken hook** (18 words) | "You checked the first four and last four characters, they matched, and the money still went to a scammer." | half A by ~2.6 s, half B by ~4.6 s (at ~4 words/s, speedy pace) |
| **Loop question** (5 words) | "So what did you miss?" | ~5.2–6.6 s |
| **Reframe** | "It wasn't really your address. It was a lookalike, planted in your own history." | ~7–11.5 s |

**Visual (frame 1 already moving, proves the paradox muted):**
- 0.0 s: dark charcoal `Studio`, macro lens, shallow depth of field. A pasted address floats as a row of
  glass character tiles (each tile a `Card` with a `glyphTexture` glyph), clearly fake:
  `0x7A3f c91E…(32 middle chars)…b04D 9c2E`. Camera is low and close, already tracking left → right.
- 0.6–1.4 s ("first four"): tiles `7A3f` light with an orange edge glow. `Callout` `FIRST 4`.
- 1.4–2.2 s ("last four characters"): camera rack-focuses to the end, `9c2E` glows. `Callout` `LAST 4`.
- 2.2–2.8 s ("they matched"): a second, ghosted copy of the address (the one you *meant*) slides down
  onto the first. The ends lock together exactly, with a short `EnergyArcs` spark across each matched
  block (the shot's ONE orange system).
- 2.8–4.6 s ("and the money still went to a scammer"): hard cut to a top-down angle on the middle 32
  tiles. The ghost's middle and the pasted middle don't line up: the pasted tiles flip one after
  another to different characters (white vs dim grey, no second orange). `Callout` `MIDDLE: 32 CHARACTERS`.
  On "scammer" the whole pasted row slides off frame right. Silence under "scammer".
- Bottom-left `Disclaimer`: "Magnified illustration · addresses are made up".
- **Muted read:** the ends glow and lock, the middle visibly doesn't match. A viewer with no sound sees
  "matches where you look, different where you don't" in under 4 s.
- 5–7 s (loop): pull back and up; the tiles turn out to be sitting in a phone's send field (`Phone`),
  with the transaction history list visible below. Nothing glows.
- 7–12 s (reframe): one row in the history list lights orange and rises toward the camera; `Callout`
  `NOT FROM YOU` / `PLANTED`. Move only, no flash.

**Text (`PhraseCaption`, sentence building, top centre):**
`You checked the first 4 / and last 4 characters, / they [matched], / and the money still went / to a scammer.`
- **Boxed keyword: "matched"** (the word the paradox turns on). Digits on screen as "4" for speed.
- Emoji: none in the hook (saves the emoji budget; `🔍` is available later for "check the middle").
- Loop phrase: `So what did you miss?` (no box). Reframe phrases box **"history"**.

**Archetype / borrowed from:** speedy 13.3M phone-screen paradox (`DeW3kuNM2v5`): "does A, and B"
with the visual literally doing both halves. Also Kallaway "contrarian to a habit" (state the
consensus check, then break it).

**Why it wins:**
- It names a *behaviour the viewer actually has* (the first-and-last check). That is the brief's exact
  misconception, and it makes the share line inevitable: "send this to the friend who only checks the
  first and last few characters".
- Most visual of the eight: matching ends + mismatching middle is the whole mechanism in one muted image.
- Promise is fully explainable: lookalike generation → dust transfer → history → copy (brief's
  mechanism), with no claims the video can't support.
- Failed / soft checks: second-person but past tense ("you checked"), not the present tense the style
  bible prefers (−0.5); 18 words is near the 5 s ceiling, so VO must be brisk (−0.5).

---

## BACKUP 1: #4 "Your history isn't yours" (shape B, it's faking it) — **8/10**
- **Spoken:** "That address in your transaction history isn't someone you paid. A scammer put it there." (15 words)
- **Loop:** "So how did it get in?"
- **Reframe:** "Your history isn't a list of people you trust. It's a list anyone can write to."
- **Visual:** macro top-down on a 3D `Phone` showing a transaction history list (drawn clean UI). One
  row slides in **from outside the phone**, glowing orange, and settles among the real rows. On
  "scammer put it there" the camera dives into that row: `Callout` `0.00 RECEIVED`. `Disclaimer`
  "Illustration · addresses are made up".
- **Text:** `That address / in your [history] / isn't someone you paid.` Boxed: **history**. Emoji: 📱 before
  "history" (optional).
- Archetype: speedy 233K trackpad "it's faking it" reveal.
- Failed / soft: the first half needs the visual to land (muted viewer must see the row arrive from
  outside); slightly less "this is me" than the winner, because people don't think of their history as
  "people I paid".

## BACKUP 2: #8 "Spot the difference" (different shape: gamified challenge) — **8/10**
- **Spoken:** "One of these addresses is yours, the other is a scammer's. Which one would you have pasted?" (17 words)
- **Loop:** built in (the question). Second beat at ~5 s: "Most people check the ends."
- **Reframe:** "They match exactly where you look, and nowhere you don't."
- **Visual:** two addresses stacked on frame 1 as glass tile rows, slowly drifting; first 4 and last 4
  glow orange on both and match. At ~4 s a cursor hovers between them (no answer yet); at ~6 s the
  middles split open. Pure muted puzzle: freeze-frame worthy, rewatch-friendly.
- **Text:** `One is yours. / One is a [scammer's].` Boxed: **scammer's**. No emoji.
- Archetype: Koe APAG "gamify" + Galloway click-to-unpause; spot-the-difference is the visual idea in
  `02-analysis.md` pattern 1 (two near-identical strings). Not from speedy, so it's our test cell.
- Failed / soft: not shape A/B (house style prefers them); the "answer" moment risks feeling like a
  trick question if the middles aren't shown fast; addresses must be readable at phone size (large
  tiles, short hold).

---

## All 8 candidates

Checks used: **H** = viral-hooks checklist (lands fast, payoff/stake first, concrete noun, opens loop,
promise deliverable, muted visual, verbal alone, text sharpens, aligned, resolves by 3 s, distinct);
**R** = reels checklist (first word strong, works muted, concrete stake, shareable payoff, topic
legible); **AP** = anti-patterns; **§6** = style bible §6 line 1 (object in hand, both halves ≤5 s) and
line 2 (loop by ~7 s, answer by ~12 s); **HR** = house rules (no investment language, no unsourced
numbers, no logo/welcome).

### 1. Brief's line (A)
- Spoken: "The address you copied looked exactly right, and it was a scammer's." (12 w)
- Loop: "So how did it get there?" · Reframe: "It isn't really your address, it's a lookalike they put in your history."
- Visual: two strings overlaid, first/last 4 glow and match, middle flips. Boxed: **copied**.
- Archetype: speedy 13.3M paradox.

### 2. History you always pay (A)
- Spoken: "Your wallet history shows the address you always pay, and pasting it sends your money to a stranger." (18 w)
- Loop: "So who's actually on the other end?" · Reframe: "It isn't really your friend's address, it's a copy of its two ends."
- Visual: `Phone` history list, a finger-tap (AI hero plate of a hand, `tools/gen_image.py`, no face) copies the top row; the `ArcTravel` coin leaves the phone and veers to a different, unlabelled address tile. Boxed: **pasting**.
- Archetype: speedy 13.3M paradox.

### 3. You checked the ends (A) — WINNER (spec above)

### 4. Your history isn't yours (B) — BACKUP 1 (spec above)

### 5. The dots (B)
- Spoken: "The dots in the middle of your wallet address aren't empty. They hide the one part a scammer can't fake." (20 w)
- Loop: "So what's behind the dots?" · Reframe: "It isn't the same address, it's a lookalike that only matches outside the dots."
- Visual: macro of a shortened address `0x7A3f…9c2E` as glass tiles; the `…` splits open like a cutaway, and 32 hidden characters unfold out of it. Ends glow orange. Boxed: **dots**. Emoji: none.
- Archetype: speedy 233K "it's not what you think" reveal.

### 6. $0.00 from a stranger (A)
- Spoken: "Your wallet just got zero dollars from a stranger, and that's exactly how they plan to get paid." (18 w)
- Loop: "So why send you nothing?" · Reframe: "It isn't a payment, it's bait: their lookalike now sits in your history."
- Visual: `Phone` lock screen, an incoming "+0.00" row drops in and glows orange; camera dives into it, the sender address's ends match a saved contact's. Boxed: **zero**.
- Archetype: speedy 13.3M paradox (cost/gain inversion).

### 7. Real-proof cold open ($68M case), original → rewritten
- Original: "Someone sent sixty-eight million dollars in crypto to an address that only looked like the right one." (17 w)
- Rewrite: "They did the safe thing, a test payment first, and still sent sixty-eight million to a lookalike." (17 w)
- Loop: "So how did it look right?" · Reframe: "It wasn't the same address, it only shared the first characters."
- Visual: 0x100x-style B&W document plate: real web capture of the Chainalysis article (`record_web.mjs`), typewriter line over it, then hard cut into the 3D tiles. Boxed: **lookalike**. Source in caption: Chainalysis, "Anatomy of an Address Poisoning Scam"; must say funds were later returned.
- Archetype: 0x100x 831K real-proof cold open + Bush big-number lead.

### 8. Spot the difference (gamified) — BACKUP 2 (spec above)

### Scoring table

| # | Shape | Hook (short) | Score | Failed / soft checks |
|---|---|---|---|---|
| 3 | A | "You checked the first four and last four… still went to a scammer" | **9** | Past tense, not present (§1 preference); 18 w is near the 5 s ceiling |
| 4 | B | "That address in your history isn't someone you paid" | **8** | First half leans on the visual (H "verbal alone" soft); less self-recognition than #3 |
| 8 | Game | "One of these is yours… which would you have pasted?" | **8** | Not house shape A/B; trick-question risk if middles revealed late; legibility at phone size |
| 1 | A | "The address you copied looked exactly right, and it was a scammer's" | **8** | "Looked exactly right" is vaguer than naming the check (H concrete noun soft); viewer may not feel "I copied one" (R shareable soft) |
| 5 | B | "The dots in the middle of your address aren't empty…" | **7.5** | 20 w, at the limit; needs a beat to decode (AP "cleverness that needs explaining", mild); only works for people who have seen shortened addresses |
| 6 | A | "Your wallet just got zero dollars from a stranger…" | **7.5** | Most viewers haven't noticed a $0 transfer (R "this is for me" soft); mechanism starts mid-way, so the loop is two steps from the payoff |
| 2 | A | "Your wallet history shows the address you always pay…" | **7** | 18 w, second half lands ~5 s; two motions to read muted (tap + arc); "always pay" generalises |
| 7 | Proof | Original: "Someone sent $68M…" | **5.5** | §6 l.1 not an object in hand / not second person; big loss number as the hook (HR: allowed only sourced, but it turns the open into a scare story); first frame is a document, not a moving cutaway; R "this is for me" fails |
| 7r | Proof | Rewrite: "They did the safe thing, a test payment first…" | **6.5** | Still third person (§6 l.1); still a loss-figure open; needs the "funds returned" caveat inside the hook window to be honest. **Rejected as a hook. Use it as the PROOF beat (~45–55 s).** |

Shape count: A/B = #1, #2, #3, #4, #5, #6 (6 of 8). Other: #7 (real-proof cold open), #8 (gamified).
None use "did you know", a title card, a logo, hype words or investment language. All addresses are fake.

---

## The promise (what the rest of the video must resolve)

**Paradox:** *You did the check (first few + last few characters), the address came from your own
history, and it was still a scammer's.* The video must show, under the glass:
1. Attackers generate an address whose first and last characters match one you use (the middle can't be
   matched, so it's different).
2. They send a tiny or zero-value transfer (or a fake token) so that lookalike lands in your
   transaction history.
3. Next time you copy "your usual" address from history, you copy theirs. Nobody hacked you; you sent it.
4. A transfer can't be reversed by a bank or the app.

**"That's also why" consequences for the scripter (pick 2–3):**
- **That's also why** strangers send you tiny or $0.00 amounts out of nowhere: it's not a mistake, it's
  them getting into your history. (Ignore them; never copy from them.)
- **That's also why** wallets that shorten addresses with "…" hide exactly the part that's different,
  so check the middle too. (MetaMask help centre: some apps show only the first/last 5–10 characters.)
- **That's also why** a small test send isn't paranoia, but only if you *check* where the test landed
  before the big one. (Proof beat: the Chainalysis May 2024 case, test payment then the lookalike;
  funds later returned; source in caption.)
- **And it's why** paying a saved contact, a username or a QR code beats pasting a string: nothing to
  copy from history. (DYNK send screen in background, needs app footage; do NOT claim DYNK detects or
  blocks poisoning.)

**Twist back (from the brief, fits the winner):** "So nobody broke into your wallet. You checked the
ends, they matched, and you sent it yourself, to an address that was only pretending to be familiar."

**Share line that falls out of the winner:** "Send this to the friend who only checks the first and last
few characters."
