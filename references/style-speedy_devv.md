# House style v3: "magnified explainer" (hooks, story and pacing modelled on @speedy_devv)

**Read this first, before writing hooks, scripts, direction, scenes or reviews.** It is the primary
reference from 29 Oct 2026. `references/style-0x100x.md` is still useful for real-footage proof beats
and name cards, but where the two disagree, **this file wins**.

Source: @speedy_devv (183K followers). Only his high performers **without the cartoon avatar** were
studied, frame by frame, with the 13.3M reel transcribed in full:

| Plays | Reel | Topic |
|---|---|---|
| 13.3M | https://www.instagram.com/speedy_devv/reel/DeW3kuNM2v5/ | Why your phone screen ignores a pen and gloves |
| 233K | https://www.instagram.com/speedy_devv/reel/De1g_WXsVJC/ | Your MacBook trackpad never actually clicks |

Do **not** copy the cartoon presenter (red shirt, goggles) seen in his other reels. We don't use a mascot.

Why it works: he takes an object the viewer is **holding or using right now**, states a paradox about it
in one breath, then *shows the inside of it* with gorgeous magnified 3D, one word at a time, until the
paradox resolves. Every 10–15 s he ties the mechanism back to something the viewer has personally
experienced ("That's also why your screen goes crazy in the rain"). Nothing is hype. The visuals do the
persuading.

---

## 1. The hook formula (first 0–6 s)

Two shapes win. Use one.

**A. The paradox (13.3M).** `[Thing you use every day] does [surprising A], and [contradicting B].`
> "Your phone screen reacts to the lightest brush of your finger, and ignores a pen pressed as hard as you can."

**B. The "it's faking it" reveal (233K).** `[Thing] doesn't actually [do what you think]. It's [faking / doing something else].`
> trackpad: "...you never just clicked... a button... it's faking a click."

Rules:
- **Second person, present tense, an object in their hand.** "Your wallet", "your seed phrase", "your
  phone", "the app you just opened". Not "crypto", not "blockchain", not "people".
- **One sentence, ≤ 20 words, spoken in ≤ 5 s.** Both halves of the paradox land before second 5.
- **The visual demonstrates the paradox literally** at the same time: finger glows the grid; pen
  sparks and nothing happens. The viewer *sees* the contradiction muted.
- **No title card, no logo, no "did you know", no "here's why".** First frame is already the
  magnified illustration, mid-motion.
- Then the **open-loop question, verbatim style**: "So what is it actually feeling?" / "So where does the
  noise go?" / "So how is that possible?" (≤ 7 words, at ~5–7 s).
- Then the **one-line reframe that gives the answer away early**: "It isn't really feeling pressure,
  it's measuring the electricity in your body." Paying it off early is what keeps people: they now
  want to *see* it.

DYNK examples (education only):
- "Your crypto wallet doesn't hold a single coin, and you can still lose everything in it."
- "When you send crypto, nothing leaves your phone, and the money still arrives on the other side of the world."
- "Your 12 words have never been guessed by anyone, and people lose wallets to them every day."
- "Your exchange shows a balance, and none of those coins are actually yours."

## 2. The story spine (75–90 s, ~190–220 words)

```
0–5s     HOOK        paradox about an object in their hand (shape A or B), visual proves it muted
5–7s     LOOP        "So what is it actually …?"
7–12s    REFRAME     "It isn't really X, it's Y."  (answer given away early)
12–16s   IMAGINE     "Imagine it's winter and you're answering a call with gloves on."  relatable moment
16–45s   MECHANISM   step by step under the glass: "Under the …, there's a … you can't see."
                     one new part per sentence, each part labelled as it appears
45–55s   PROOF       the mechanism explains a second everyday thing ("it can follow two fingers → pinch to zoom")
55–70s   "THAT'S ALSO WHY" ×2–3   rain on the screen, touchscreen gloves  (consequence ladder: each one
                     is a thing the viewer has personally experienced; this is the retention engine)
70–78s   TWIST BACK  one line restating the paradox, now resolved:
                     "So your screen never felt your finger. It felt a tiny bit of charge go missing,
                      and your finger was just the thing that took it."
78–85s   CTA         "Follow me and send this to someone who [very specific relatable behaviour]."
```

- **Information density:** a new fact, part, or consequence every 4–6 s. Never two sentences on the same
  point.
- **Words:** short, concrete, physical. "Salty water", "a grid of wires", "a tiny electric charge". Numbers
  only when real and visual (a percentage on a crossing, "200 times a second").
- **Never** "in this video", "let's dive in", "crazy", "insane", "mind-blowing", "game-changer".
- **The share line is specific**: "someone whose phone never works with wet hands", "the friend who
  screenshots their seed phrase". It names a behaviour, not a demographic.
- DYNK appears, if at all, inside the mechanism ("this is why apps like DYNK show you…") or the twist,
  never the hook. Most videos don't need it: the account brands the video.

## 3. Captions: "sentence building"

The single most recognisable part of the look. Copy exactly.
- **Top centre**, y ≈ 230–330 px, Outfit/Inter-style geometric sans, ~46 px, sentence case.
- Shows the **current phrase** (2–6 words, broken on punctuation / breath). Words appear **as spoken**.
  Already-spoken words in the phrase are **dim grey** (~45 % white), the word being spoken is **bright
  white, semi-bold**.
- **Keywords** (1 per phrase at most: nouns that matter, "phone", "finger", "electricity", "click") get a
  **design-tool selection box**: thin 1.5 px rectangle with four tiny square handles at the corners.
  Ours is **DYNK orange**; his is blue.
- **Inline emoji** before a keyword occasionally (📱 phone, ⚡ electricity, 👍 thumb). Max one every 10 s.
- Phrase wraps to 2 centred lines when long. Clears on the next phrase. No background box, no stroke,
  no bounce.
- Component: `PhraseCaption` (default in `Shell` from v3).

## 4. The visual world

- **Dark charcoal studio** (#0E0F11 → #16181B), soft top light, gentle vignette, fine grain. Occasional
  short **light (near-white) passage** for a context shot, then back to dark.
- **Magnified cutaways**: photoreal macro of the real object, sliced open: glass on top, the hidden
  layer exposed, a finger or hand entering frame. The camera is low and close, like a macro lens.
  Depth of field on.
- **Glowing energy = the accent**: his is warm gold light arcs; **ours is DYNK orange** (#FF8000 glow). It
  marks the thing that's actually happening (charge, signal, signature, key). One glowing system per shot.
- **Callouts**: tiny tracked uppercase labels (`GLASS`, `WIRES`, `CHARGE`, `COIL`) with a thin leader line
  to the part, fading in as the part is named. Component: `Callout`.
- **Honesty tags**: tiny grey bottom-left text, "Magnified illustration", "Values illustrative",
  "Movement exaggerated", "Zones drawn visible". Use whenever the shot isn't literal. Component: `Disclaimer`.
- **Live numbers on parts** when they explain the mechanism (grid values 100 → 62 under the finger).
- **Real UI** where it helps: an iPhone lock screen, a keyboard, a share sheet, a settings page, drawn
  cleanly. For DYNK, use real app screenshots from `inbox/`.
- **Proof object**: a real photo / patent figure / engineer name card when the claim needs one
  (`NameCard`, `Footage`). Real people only from real images.
- **End**: a mock Instagram share sheet over the profile ("to someone"), synced to the CTA line.
  Component: `ShareSheetEnd`.

## 5. Motion and pacing

- **Shot change every 1.5–3 s** (superseded by v3.1: 0.6–1.5 s, see `v3.1-pacing-and-story.md`). Most changes are camera moves or a new angle on the *same* object
  (macro → top-down → cross-section), not new objects. It feels continuous but never static.
- **Hard cuts** between angles; soft cross-dissolve only into an "Imagine…" scenario. No zoom punches,
  flashes, whip pans, shakes, glitch.
- Objects and fingers **move with intent**: the finger lowers on "brush", the pen presses on "pressed".
  Every motion is synced to the word that describes it.
- **Sound**: calm VO, very low bed, soft UI ticks/whooshes on part reveals. Silence under the hook's last
  word.

## 6. Anti-AI checklist (reviewer fails any)

- [ ] Hook isn't about an object the viewer is holding/using, or takes > 5 s to land both halves
- [ ] No open-loop question by ~7 s, or the answer isn't given away by ~12 s
- [ ] Fewer than 2 "that's also why / and it's why" consequences
- [ ] Captions not in sentence-building style, or more than one boxed keyword in a phrase
- [ ] A shot holds > 3 s with no camera move or new element
- [ ] More than one glowing (orange) system in a frame
- [ ] Unlabelled magnified shot (no `Callout` on the parts being named) or missing `Disclaimer` on a non-literal shot
- [ ] Hype words, "did you know", title card, logo open
- [ ] A mascot / cartoon presenter
- [ ] Unsourced number, AI-generated real person or logo
- [ ] Generic CTA ("follow for more") instead of "send this to someone who …"
