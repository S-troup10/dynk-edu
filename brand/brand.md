# DYNK Education — Video Brand Doc

> **v2.0 · 26 Oct 2026 — the "monochrome studio" look.** The full spec is `references/style-0x100x.md`
> (modelled on @0x100x); machine values are the `v2` block in `tokens.json`; the kit is `studio/src/kit/`.
> **Where v2 and the v1 sections below disagree, v2 wins.** v1 is kept for history and legacy scenes.

## v2 in brief
- **Look:** greyscale 3D studio world (chrome, clay, graphite), seamless near-black or pale-grey backdrop,
  soft top light, grain + vignette. **DYNK orange #FF8000 on exactly one thing per shot.**
- **Open on the real world:** B&W interview/news footage of real people, a typewriter line over it. Never the logo.
- **Type:** Outfit everywhere, small. Orbitron only for big chrome numbers. No headline text.
- **Captions:** one lowercase word at a time, top centre, ~40 px.
- **Motion:** slow camera pushes, objects settle on soft springs, hard cuts. No punches, flashes, wipes, shakes.
- **Length:** 60–90 s, an information beat at least every ~10 s, a visual change every 2–4 s.
- **Voice:** calm documentary narrator (edge-tts `en-US-AndrewNeural`, -2 %, polished). Short declaratives.
- **Sound:** ambient drone bed at −24 dB, soft SFX from `brand/audio/sfx/v2/`, trending audio optional and quiet.
- **Honesty:** every number sourced in the caption, all footage credited, never AI faces or fake logos.

---

# Legacy v1 (superseded where it conflicts with v2)

> **v1.0 · 26 Oct 2026** — look matched to **dynk.io** (exact CSS colours and fonts); format and pacing taken from the 1M+ view education Reels in `references/notes.md`. Machine-readable values: `tokens.json`. Kit blocks: `studio/src/components/index.tsx`. Test card: `brand/test-card.png`.

## 1. The idea in one line
**The website, moving — told like a story.** dynk.io's clean white/ink/orange look, with the open-on-a-spectacle, keep-the-mystery-going pacing of the education Reels that actually get millions of views.

## 2. Personality
Confident, clear, a little cheeky. A smart mate explaining money tech, not a bank and not a crypto bro. Optimistic about owning your stuff, never preachy. Short sentences. Big, specific numbers. One idea per video.

## 3. Colour (from dynk.io)
| Token | Hex | Use |
|---|---|---|
| orange | #FF8000 | The one thing that matters: accent words, units, pills, arrows, wipes |
| orangeDeep | #E66F00 | Pressed / shadow side of orange |
| orange50 / orange100 | #FFF5EB / #FFE7CF | Glow, flash frames, soft panels |
| ink | #212320 | Headlines on white, dark cards, phone bezels |
| ink at 40% | rgba(33,35,32,.4) | **Faded tail words** — the site's "in *the world.*" grey-out |
| white / paper | #FFFFFF / #F6F6F2 | Default canvas |
| danger | #B42318 | Strike-through lines, "wrong" verdicts only |

**Three themes — every scene picks one:**
- **Paper** (default, ~60% of screen time): white, ink text, orange accents, soft orange glow along the bottom edge.
- **Ink** (~25%): #212320 canvas or dark rounded card — use for "the problem", tension, mystery, hacks, losses.
- **Orange** (~15%): full #FF8000 flood with white Orbitron — **reserved for rehooks and the big reveal**. It's our pattern interrupt; overuse kills it.
Never more than one accent colour on screen. Orange marks 1–3 words per headline, never a full sentence.

## 4. Type (from dynk.io)
- **Orbitron 800** — headlines, numbers, labels. Sentence case for statements ("Your exchange can freeze your money."), UPPERCASE for 1–4 word punches ("OWN IT. GROW IT."). Tight tracking (−2), line height 1.0, left-aligned by default, 2–4 short lines.
- **Outfit 600–700** — captions, body, chips, small labels.
- **Section labels** — small tracked caps + a short rule ("SELF-CUSTODY ——"), top-left, like the site's "THE WALLET ——".
- **Stats** — huge Orbitron number + small orange unit + Outfit label under it ("400**ms** · to settle on Solana").

## 5. Signature elements (all in the kit)
| Element | From | Use for |
|---|---|---|
| Kinetic headline (accent + faded words) | site hero / "Not just a place…" | Hooks, key statements |
| Count-up stat | site 3,800 / 400ms / 1¢ row | Any number reveal (rehook) |
| Strike compare | site "~~2–3% card fees~~ 1¢ flat" | Old way vs new way |
| Pill chips (orange / ink / white) | site buttons | Labels, features, steps |
| Ink card | site feature cards | Problem / mystery / explainer panels |
| Phone mockup | site hero phone | Real DYNK app screens (from `inbox/` or captured from dynk.io) |
| Rotating badge "SELF-CUSTODY • OWN IT • BUILT ON SOLANA" | site corner badge | Corner signature on end card / CTA |
| Ticker band | site marquee | Transitions, end card, energy |
| Annotation arrow (orange, ink outline) | viral explainers (big pointers) | Point at the one thing to look at |
| Orange wipe + flash | — | Rehooks / scene changes |

## 6. Format rules (from the 1M+ education Reels — see `references/notes.md`)
1. **Open on a spectacle, not a face or a logo.** The winners lead with a striking image (molten gold, a surreal visual, a 3D scene); talking-head posts from the same creators get ~10× fewer views. Our version: a huge number, a frozen-account screen, a real-world image, a phone doing something surprising.
2. **Story/mystery framing beats lists.** "Nobody knows who owns this" is our own best performer. Use a "what happened next" spine: setup → twist → payoff.
3. **Big text hook (3–7 words) on frame 1 + small captions at the bottom.** Hook text is Orbitron in the upper third; captions are Outfit, ≤4 words, active word orange.
4. **Something changes every ≤2 s; a rehook every ~6–8 s** (orange flood, count-up, strike-through, arrow, theme switch).
5. **Series beat one-offs.** "Part 1 of 5" titles and recurring formats build follows.
6. **Product in the background.** Show the DYNK app solving the thing; never pitch it. CTA = follow / save / "try it in the DYNK app".

## 7. Recurring formats
- **The Heist / The Disaster** (ink-led): a real crypto event told as a story (exchange collapse, lost keys, hack) → the lesson → how self-custody avoids it.
- **Myth vs Fact** (paper + strike compare): "You need a seed phrase to own crypto" ~~struck~~ → the truth.
- **What actually happens when…** (paper + phone + chips): step-by-step a payment/swap settling, with count-up timers.
- **The Number** (orange-led): one shocking stat as the hook (e.g. card fees on a year of sales) → explain → DYNK shown in the background.

## 8. Motion
Site easing (cubic-bezier 0.22, 1, 0.36, 1) for slides and count-ups; springy pops for words and chips (3-frame word stagger). Hard cuts, whips or the orange wipe between scenes — no slow dissolves. Nothing static for more than 2 s.

## 9. Layout
1080×1920, 30 fps. Keep text and key visuals inside the safe zone (top 220 px, bottom 420 px, left 64 px, right 160 px — Instagram's UI covers the rest). Headline zone: upper third. Captions: just above the bottom safe line. Phone mockups centred, can bleed off the bottom.

## 10. Logo
D gradient mark. **Never open on it.** Corner mark, rotating badge, or end card only. Don't recolour. Official file: dynk.io `/images/dynk-gradient-mark.png` (the current `logo/dynk-d-mark.png` is sampled from the app — swap in the official file when you can).

## 11. Voice & audio
Free Microsoft Edge neural voice `en-AU-WilliamNeural` at +8% (or Cooper's own recording via `/record-voice`). Energetic but not shouty. VO −16 LUFS, SFX around −14 dB (bass hit on every rehook, pop on chips, tick on count-ups, whoosh on wipes), optional royalty-free music −26 dB, export −14 LUFS. The trending sound is attached in Instagram at 5–15%.

## 12. Don'ts
No dark-everything (the website is bright — dark is for tension). No neon/rainbow crypto clichés, no coins raining, no rockets/moons, no price charts as hype. No investment language (see `dynk-context.md`). No logo opens. No orange body text.
