# 06 — Direction: "The address you copied was a scammer's" (address poisoning)

Style **v3-magnified** (`references/style-speedy_devv.md`, studio materials from `style-0x100x.md`). 16 scenes, **85.77 s** total (VO 80.1 s + pads). 30 fps, 1080×1920. Machine version: `direction.json`.

## Ground rules for every composer
- **Import shared props from `studio/src/scenes/r_2026_10_29_next/_shared.tsx`** (director-owned, do not edit): `REAL`, `FAKE` (same first 4 / last 4, every middle char different), `SHORT` (`0x7A3f…9c2E`), `FIRST4`/`LAST4`/`MIDDLE` tile indices, `TileRow`, `Tile`, `tileX(i)`, `UI.*` phone screens, `PROOF.*` Chainalysis captures. Smoke-tested under `--gl=swangle`.
- **All addresses are made up.** Never type a real address. The Chainalysis captures contain no address strings (checked); keep it that way when cropping.
- One orange glowing system per shot (listed per scene as **accent**). Everything else greyscale.
- `Disclaimer` text per scene below (default "Magnified illustration · addresses are made up").
- Captions: phrase captions are on via `Shell`; `captionKeywords` / `captionEmoji` are already in each `props.json`. Keep subjects below y ≈ 380 (caption band 230–330) and inside x 64–920, y ≤ 1500.
- Camera move or new angle every 1.5–3 s; nothing static > 3 s. Hard cuts between angles inside a scene. No zoom punches, flashes, shakes, wipes.
- Land motion on words: `props.vo.words[i].start * 30` (times below are scene-relative seconds from the polished VO).
- **swangle budget:** ≤ ~100 tiles on screen at once; streaming/wall scenes use `TileRow only={[a,b]}` fragments. No new heavy geometry.
- No AI image key → no AI hero plates; S03's "thumb on a café table" is a 3D phone on a light plinth, no hand.
- **No DYNK app recording in `inbox/`** → S14 uses the generic contact-picker fallback (`UI.contacts`), no DYNK logo/name, and never implies any app detects or blocks poisoning.

## Audio
- VO: edge-tts `en-US-AndrewNeural` −2 % (S01 re-voiced at +6 % so the hook lands both halves by 5 s: "matched" 2.91 s, "scammer" 4.76 s), polished. Files `audio/vo/S01–S16.mp3` + `.words.json`.
- Bed: `brand/audio/music/bed_drone.wav` under everything (−24 dB). Silence under "scammer" (no SFX after 3 s in S01).
- Trending sound: none (analysis observed none). SFX ≤ 1 per second, listed per scene.
- Length check: VO+pads 85.8 s < 90 s, so "Never copy those." stays.

## Transitions (cutter)
Hard cuts everywhere except **S02 → S03: soft cross-dissolve 8 frames** into the light "Imagine" passage. S03 → S04 hard cut back to dark. S16's last 0.6 s returns to S01 frame 0 for the loop.

## Shot list

### S01 · 0.00–5.97 s (5.97 s) · HOOK: paradox, both halves by 5 s (matched@2.91, scammer@4.76)
- **VO:** "You checked the first four and last four characters, they matched, and the money still went to a scammer."
- **Engine / tone:** remotion3d · dark
- **Subject:** TileRow chars=REAL (from _shared.tsx) standing on the studio floor, shot macro and low. A second ghost TileRow chars=REAL (the address you meant; opacity ~0.35 graphite) for the overlay. Frame 0 already mid-track: camera moving L→R along the row, FIRST4 (idx 2–5) in frame.
- **Accent:** The matching ends: FIRST4 tiles glow (from 'first' 0.55 s), LAST4 glow (from 'last' 1.51 s), EnergyArcs spark across each locked end block on 'matched' (2.91 s). Middle tiles never orange.
- **Camera:** 0.0–1.4 s macro track L→R over FIRST4 (from [tileX(1)-0.6, 0.55, 2.2] to [tileX(6), 0.5, 2.0], target the tiles, fov 30, DOF feel via fog). 1.4 s hard cut: macro on LAST4 drifting L→R. 2.4 s ghost row slides down onto the row from above (y+0.7 → y), ends lock on 'matched' 2.91. 3.3 s hard cut: top-down angle on the MIDDLE tiles; the pasted row's middle tiles flip one after another (flipIdx=MIDDLE, flipTo=FAKE, stagger ~0.03 s/tile) to different characters, white vs the ghost's dim grey. 4.76 s ('scammer') the pasted row slides off frame right; hold empty-ish frame to the end. Silence under 'scammer' (no SFX after 3 s).
- **Callouts:** `FIRST 4` on "first" (0.55 s) · `LAST 4` on "last" (1.51 s) · `MIDDLE` on "money" (3.4 s)
- **Caption keyword:** matched
- **Disclaimer:** Magnified illustration · addresses are made up
- **SFX:** air_rise.wav @0 s, glint.wav @1.5 s, thud.wav @2.95 s
- **Acceptance:** Frame 0 is already moving on the tile row with no title/logo; at 2.95 s both end blocks glow orange and are locked to the ghost row with arcs, caption shows '…they [matched]' boxed; at 4.0 s a top-down view shows white middle tiles that differ from the dim ghost tiles, nothing orange in the middle.

### S02 · 5.97–12.27 s (6.30 s) · LOOP 'So what did you miss?' (≈6.5 s) + REFRAME, answer by ≈9.3 s ('lookalike')
- **VO:** "So what did you miss? It wasn't really your address. It was a lookalike, planted in your own history."
- **Engine / tone:** remotion3d · dark
- **Subject:** 3D Phone (kit) centred, screen = ui_send (the full REAL address in the To field) for the loop question; on 'It' (1.36 s) the screen becomes ui_history_planted. The top row (Received 0x7A3f…9c2E +0.00 'just now') is the lookalike; the row under it is the real 'Sent 0x7A3f…9c2E'.
- **Accent:** On 'lookalike' (3.30 s): the planted TOP row lights orange (2D glow outline / orange rim rectangle over that row, or a thin orange plane in 3D) and lifts ~0.15 units toward camera, its ends matching the row below. Nothing glows before 3.3 s ('Nothing glows' during the loop question).
- **Camera:** 0.0–1.3 s pull back and up from a macro of the To field to the whole phone (from [0,1.7,3.2] to [0,2.4,7.5], target phone centre) – reveals the tiles were the send field. 1.36 s hard cut: low 3/4 angle on the history screen, slow push in (from [1.2,2.0,6.5] to [0.5,1.9,5.0]). 3.3 s the planted row rises; 4.1 s gentle drift right toward the risen row.
- **Callouts:** `PLANTED` on "planted" (4.13 s) orange
- **Caption keyword:** history
- **Disclaimer:** Magnified illustration · addresses are made up
- **Assets:** `ui_send`, `ui_history_planted`
- **SFX:** whoosh_soft.wav @0.05 s, tick.wav @3.3 s, glint.wav @4.15 s
- **Acceptance:** At 0.6 s the phone's send screen is visible with no orange anywhere and caption 'So what did you miss'; at 4.5 s the top history row is the only orange thing, lifted off the screen, callout PLANTED points at it, caption boxes 'history' by 5.1 s.

### S03 · 12.27–16.77 s (4.50 s) · IMAGINE (light passage, the only soft dissolve in)
- **VO:** "Imagine paying a friend back with the address you copied last week."
- **Engine / tone:** remotion3d · light
- **Subject:** Light studio (tone light). The 3D Phone lies almost flat on a pale clay Plinth like a café table (no hand: no AI image key, no generated people). Screen = ui_history until 'copied' (2.59 s), then ui_history_copy (the 'Copy address' menu pops over last week's 'Sent 0x7A3f…9c2E' row).
- **Accent:** The 'Copy address' menu item gets a thin orange outline when it pops at 2.59 s. Nothing else orange.
- **Camera:** Overhead 3/4 drift: from [-1.2,4.2,4.5] to [-0.3,3.6,3.4], target the phone. 2.0 s new angle: closer, lower, on the top row as the menu pops on 'copied'.
- **Callouts:** `COPY` on "copied" (2.59 s) orange
- **Caption keyword:** copied
- **Disclaimer:** Illustration
- **Assets:** `ui_history_copy`, `ui_history`
- **SFX:** click.wav @2.6 s
- **Transition in:** soft cross-dissolve 8 frames from S02 (cutter); hard cut out to S04
- **Acceptance:** Pale near-white frame with a dark phone lying flat; at 3.0 s the 'Copy address' menu is visible on the screen with an orange outline and the COPY callout; caption is dark text with 'copied' boxed.

### S04 · 16.77–21.80 s (5.03 s) · MECHANISM: an address = long string; start / middle / end
- **VO:** "A wallet address is a long string of characters. Most people skip the middle."
- **Engine / tone:** remotion3d · dark
- **Subject:** TileRow chars=REAL as a long cross-section bar, seen side-on so the whole 42-tile row fits the safe width (camera far, fov narrow), floating at eye height.
- **Accent:** The two ends (FIRST4 and LAST4 incl. '0x') glow orange from 'string' (1.59 s). On 'skip' (3.56 s) a thin bracket sweeps along the middle 32 and they dim (dim=MIDDLE). Bracket is white/grey, not orange.
- **Camera:** 0.0–1.6 s slow lateral track from the start end toward centre (from [tileX(0)+2,0.9,7] to [0,0.9,11]); 1.6 s cut: wide side-on view of the full row, slow push in (from [0,1.0,13] to [0,0.95,11.5]); 3.5 s slight drift down to the middle as it dims.
- **Callouts:** `START` on "string" (1.7 s) · `END` on "characters" (2.05 s) · `MIDDLE` on "middle" (3.93 s)
- **Caption keyword:** middle
- **Disclaimer:** Magnified illustration · addresses are made up
- **SFX:** whoosh_soft.wav @0.0 s, tick.wav @3.9 s
- **Acceptance:** At 4.3 s the whole tile row is visible, both ends orange, the middle 32 tiles dimmed under a grey bracket with callout MIDDLE, START and END callouts at the ends, caption boxes 'middle'.

### S05 · 21.80–27.13 s (5.33 s) · MECHANISM: the generator churns out addresses
- **VO:** "A scammer's computer churns out addresses until one starts and ends like yours."
- **Engine / tone:** remotion3d · dark
- **Subject:** Many short TileRow fragments (use `only` to render ~12 tiles each, random hex strings, max ~8 rows on screen at once for swangle) streaming past camera right→left at speed from 'churns' (1.12 s). On 'starts' (2.79 s) one row stops dead in centre: it's FAKE. Behind it, ghosted, the REAL row for comparison.
- **Accent:** The stopped row's FIRST4 + LAST4 glow orange on 'ends' (3.74 s), matching the ghost REAL row's ends. Streaming rows stay grey.
- **Camera:** 0.0–1.1 s low macro on the stream entering (from [0,0.6,4.5] to [0.6,0.7,4.2]); 1.1 s cut: wider 3/4 as rows stream past; 2.8 s rows freeze, slow push in on the stopped row (to [0,0.8,6]); camera eases along to show both its ends by 4.1 s.
- **Callouts:** `GENERATOR` on "computer" (0.66 s) · `LOOKALIKE` on "ends" (3.74 s) orange
- **Caption keyword:** ends
- **Disclaimer:** Magnified illustration · addresses are made up
- **SFX:** air_rise.wav @0.6 s, thud.wav @2.85 s, glint.wav @3.8 s
- **Acceptance:** At 1.8 s grey tile rows stream across frame with callout GENERATOR; at 4.3 s one stopped row has only its ends orange, matching a ghost row behind, callout LOOKALIKE, caption boxes 'ends'.

### S06 · 27.13–31.90 s (4.77 s) · MECHANISM (number): the +0.00 transfer
- **VO:** "Then it sends you a tiny amount, often zero, from the lookalike."
- **Engine / tone:** remotion3d · dark
- **Subject:** 3D Phone at a low angle, screen = ui_history. A small 3D row slab (thin Card-like plane textured with the '+0.00 ETH' row, or a rounded box with text) flies in from outside frame left and drops into the top of the list on 'zero' (2.37 s); at that moment swap the screen to ui_history_planted so the row sits in the list.
- **Accent:** The incoming row glows orange while travelling and for ~1 s after it lands, then settles to a soft orange edge.
- **Camera:** Low angle (from [1.4,0.9,5.2] to [0.8,1.2,4.6], target top of phone screen). 1.2 s new angle: follow the incoming row in from the left. 2.4 s settle on the list as it lands.
- **Callouts:** `0.00 RECEIVED` on "zero" (2.45 s) orange · `FROM LOOKALIKE` on "lookalike" (3.37 s)
- **Caption keyword:** zero
- **Text:** '+0.00 ETH' on the row itself (real UI number, illustrative).
- **Disclaimer:** Magnified illustration · addresses are made up
- **Assets:** `ui_history`, `ui_history_planted`
- **SFX:** whoosh_soft.wav @0.3 s, thud.wav @2.4 s
- **Acceptance:** At 2.6 s a glowing orange '+0.00 ETH' row has just dropped into the top of the phone's history list, callout '0.00 RECEIVED', caption boxes 'zero'.

### S07 · 31.90–35.47 s (3.57 s) · MECHANISM (action): planted beside the real one
- **VO:** "Now it sits in your history, beside the real one."
- **Engine / tone:** remotion3d · dark
- **Subject:** Top-down on the phone, screen = ui_history_planted. Two rows matter: top 'Received 0x7A3f…9c2E +0.00' (lookalike) and below it 'Sent 0x7A3f…9c2E −0.25' (real).
- **Accent:** Only the planted (top) row glows orange. Real row stays white/grey.
- **Camera:** Top-down (from [0,6.0,1.2] to [0,5.0,0.9], target top of screen). 1.67 s ('beside') camera tracks down from the planted row to the real row and back up by the end.
- **Callouts:** `LOOKALIKE` on "history" (0.92 s) orange · `REAL` on "real" (2.25 s)
- **Caption keyword:** real
- **Disclaimer:** Magnified illustration · addresses are made up
- **Assets:** `ui_history_planted`
- **SFX:** tick.wav @1.7 s
- **Acceptance:** At 2.6 s the top-down view shows two rows with identical shortened addresses '0x7A3f…9c2E', the top one orange with callout LOOKALIKE, the second grey with callout REAL, caption boxes 'real'.

### S08 · 35.47–40.60 s (5.13 s) · PAYOFF: you copy the top one, ends ✓ ✓, middle ✗
- **VO:** "Next time, you copy the top one. The ends match. The middle never did."
- **Engine / tone:** remotion3d · dark
- **Subject:** The hook's ghost-overlay replayed slowly from a NEW SIDE ANGLE: TileRow chars=FAKE (pasted) with the ghost TileRow chars=REAL dropping onto it. Same TileRow as S01.
- **Accent:** On 'copy' (1.03 s) a short orange line runs from frame-left onto the row (the copy); ends glow and lock on 'match' (2.69 s) with EnergyArcs. Middle tiles visibly mismatched (white vs dim ghost) on 'middle' (3.62 s), never orange.
- **Camera:** 0.0–1.4 s 3/4 side angle on the whole row, slow push; 1.4 s ghost drops slowly; 2.4 s cut to low side angle along the row so ends and middle read in perspective; 3.5 s rack to the middle (drift toward x=0).
- **Callouts:** `FIRST 4 ✓` on "ends" (2.46 s) · `LAST 4 ✓` on "match" (2.69 s) · `MIDDLE ✗` on "middle" (3.62 s)
- **Caption keyword:** middle
- **Disclaimer:** Magnified illustration · addresses are made up
- **SFX:** click.wav @1.05 s, thud.wav @2.5 s, sub_drop.wav @3.6 s
- **Acceptance:** At 4.3 s a side view shows both end blocks orange and locked to the ghost row, the middle tiles clearly different, callouts FIRST 4 ✓, LAST 4 ✓, MIDDLE ✗ all visible, caption boxes 'middle'.

### S09 · 40.60–43.90 s (3.30 s) · FACT: irreversible
- **VO:** "Once it's sent, no bank can pull it back."
- **Engine / tone:** remotion3d · dark
- **Subject:** Phone (screen ui_send) at left, a short FAKE TileRow fragment (only first 6 + last 4) at right. ArcTravel coin leaves the phone on 'sent' (0.42 s) and lands on the lookalike row by ~1.3 s. On 'back' (2.02 s) the row and coin dissolve into the dark (opacity down) and nothing comes back.
- **Accent:** The travelling coin (ArcTravel accent). After it lands, nothing orange.
- **Camera:** Wide 3/4 (from [0,2.4,10] to [0.6,2.1,8.6]) following the arc; 1.4 s cut: closer on the landed row as it fades.
- **Callouts:** `IRREVERSIBLE` on "pull" (1.74 s)
- **Caption keyword:** sent
- **Disclaimer:** Magnified illustration
- **Assets:** `ui_send`
- **SFX:** whoosh_soft.wav @0.4 s, thud.wav @1.4 s
- **Acceptance:** At 1.0 s one orange coin is mid-arc from the phone to a grey tile row; at 2.8 s the row is fading into the dark with callout IRREVERSIBLE, caption boxes 'sent' earlier in the phrase.

### S10 · 43.90–50.90 s (7.00 s) · PROOF: May 2024 test then ~$68M to a lookalike (Chainalysis)
- **VO:** "In May 2024, someone sent a small test, then about sixty-eight million dollars to a lookalike."
- **Engine / tone:** remotion + remotion3d · dark
- **Subject:** 0.0–1.9 s: B&W document plate (0x100x grammar): proof_title (crop off the blue hero strip) on a dark ground, slow push; at 0.9 s cut/pan to proof_may3 paragraph, slow push toward '$68 million in wrapped bitcoin'. Typewriter '3 MAY 2024' small caps over the plate from 0.2 s. 1.99 s ('sent') hard cut to 3D: Phone at left, two TileRow fragments at right: REAL (upper) and FAKE (lower). A small grey ArcTravel coin (accent=false) lands on REAL on 'test' (2.68 s). On 'sixty-eight' (3.84 s) a big orange coin arcs out and veers to FAKE, landing on 'lookalike' (5.59 s).
- **Accent:** Plate: none (B&W, grayscale filter). 3D part: only the big coin to the lookalike + its '$68M' label.
- **Camera:** Plate: slow push (scale 1.0→1.08). 3D: wide 3/4 (from [0,2.6,11] to [0.4,2.3,9.5]); 3.8 s cut: lower angle following the big coin to the lookalike row.
- **Callouts:** `SOURCE: CHAINALYSIS` on "May 2024" (0.3 s) · `TEST` on "test" (2.68 s) · `$68M` on "million" (4.49 s) orange
- **Caption keyword:** test
- **Text:** Typewriter '3 MAY 2024' on the plate. '$68M' label on the big coin (Chainalysis: ~$68M WBTC, 3 May 2024). No real address strings: the plate images contain none; the tile rows use REAL/FAKE from _shared.tsx.
- **Disclaimer:** Plate: none. 3D part: 'Magnified illustration · addresses are made up'
- **Assets:** `proof_title`, `proof_may3`, `ui_send`
- **SFX:** type.wav @0.2 s, whoosh_soft.wav @1.9 s, thud.wav @2.75 s, sub_drop.wav @3.9 s
- **Acceptance:** At 1.0 s a greyscale Chainalysis article paragraph fills the frame with a small typed '3 MAY 2024' and callout SOURCE: CHAINALYSIS; at 5.0 s a 3D shot shows a small grey coin already on the upper row and one orange coin labelled $68M arcing to the lower lookalike row, caption boxes 'test' in its phrase.

### S11 · 50.90–57.10 s (6.20 s) · PROOF (fact): returned after negotiation; 82,031 lookalikes in one campaign
- **VO:** "It was returned after a negotiation. That campaign had over eighty-two thousand lookalikes."
- **Engine / tone:** remotion + remotion3d · dark
- **Subject:** 0.0–2.4 s: B&W plate proof_returned (paragraph: '…the scammer returned the original $68 million … on May 9th…'), slow push, with a thin grey (NOT orange) return arc sweeping right→left across the plate on 'returned' (0.33 s). 2.49 s ('That') hard cut to 3D: a wall of short grey TileRow fragments (≤8 rows × ≤12 tiles, swangle budget) receding into fog; Counter 0 → 82,031 ticking above the wall from 'campaign' (2.64 s), landing on 'lookalikes' (4.72 s). Optional 0.6 s flash of proof_seeded B&W behind the counter at the end is NOT needed; keep it 3D.
- **Accent:** Plate: none. 3D: the Counter number is the one orange thing; wall stays grey.
- **Camera:** Plate: slow push/pan. 3D: slow dolly back from the wall (from [0,1.6,5] to [0,2.0,9]) so more rows appear as the count climbs; 4.0 s small drift up.
- **Callouts:** `RETURNED · 9 MAY 2024` on "returned" (0.35 s) · `ONE CAMPAIGN` on "campaign" (2.64 s)
- **Caption keyword:** lookalikes
- **Text:** Counter 0 → 82,031 (Chainalysis: 82,031 potential seeded addresses), orange, Orbitron/ChromeNumber style, inside safe zone around y 600–700, below the caption.
- **Disclaimer:** Plate: none. 3D: 'Values illustrative · addresses are made up' (the wall is illustrative; the count is real)
- **Assets:** `proof_returned`, `proof_seeded`
- **SFX:** whoosh_soft.wav @0.3 s, tick.wav @2.7 s, tick.wav @3.9 s, glint.wav @4.75 s
- **Acceptance:** At 1.2 s a greyscale paragraph mentioning 'returned … May 9th' is on screen with a grey arc and callout; at 5.2 s a grey wall of tile rows sits under an orange '82,031', callout ONE CAMPAIGN, caption boxes 'lookalikes'.

### S12 · 57.10–62.73 s (5.63 s) · THAT'S ALSO WHY #1: strangers send tiny or zero amounts
- **VO:** "That's also why strangers send you tiny or zero amounts. Never copy those."
- **Engine / tone:** remotion3d · dark
- **Subject:** 3D Phone upright, screen = ui_lock (lock screen with notification 'Received +0.00 ETH from 0x7A3f…9c2E'). The notification is 2D-overlaid sliding in from the top on 'strangers' (0.77 s) if you can map it; else push in on the static screen.
- **Accent:** The notification card glows orange (outline) from 0.8 s to 'Never' (3.94 s); on 'Never' it greys out and a thin white strike line crosses it on 'copy' (4.16 s). After that, nothing orange.
- **Camera:** 0.0–1.5 s 3/4 front (from [0.8,1.9,7] to [0.4,1.8,5.8]); 1.5 s new angle: slow push into the notification (to [0,1.95,3.6]); 3.9 s hold the push while it greys.
- **Callouts:** `DUST` on "tiny" (1.72 s) orange
- **Caption keyword:** zero
- **Disclaimer:** Illustration
- **Assets:** `ui_lock`
- **SFX:** glint.wav @0.8 s, click.wav @4.2 s
- **Acceptance:** At 2.8 s a phone lock screen shows a '+0.00 ETH' notification outlined in orange with callout DUST, caption boxes 'zero'; at 5.0 s the notification is grey with a strike line, nothing orange.

### S13 · 62.73–67.93 s (5.20 s) · AND IT'S WHY #2: the three dots hide exactly what's different
- **VO:** "And it's why the three dots in a shortened address hide exactly what's different."
- **Engine / tone:** remotion3d · dark
- **Subject:** A shortened address as tiles: '0x7A3f' + an '…' tile + '9c2E' (11 tiles, use a small custom row with the Tile component from _shared.tsx). On 'dots' (0.94 s) the '…' tile splits open like a cutaway (two halves slide apart); from 'hide' (2.69 s) the 32 FAKE middle tiles unfold out of the gap, in a slight arc toward camera.
- **Accent:** The unfolding hidden middle tiles glow orange as they emerge (the hidden part is the thing to look at). Ends stay white.
- **Camera:** Macro on the '…' tile (from [0,0.7,3.0] to [0,0.75,2.6]); 1.5 s new angle: higher 3/4 as it opens; 2.7 s pull back (to [0,1.6,8.5]) to fit the unfolded middle.
- **Callouts:** `HIDDEN` on "hide" (2.69 s) orange · `SHORTENED` on "shortened" (1.56 s)
- **Caption keyword:** dots · emoji {'dots': '🔍'}
- **Disclaimer:** Magnified illustration · addresses are made up
- **SFX:** air_rise.wav @0.9 s, glint.wav @2.7 s
- **Acceptance:** At 1.2 s the '…' tile is splitting in macro, caption shows '🔍' before boxed 'dots'; at 4.5 s 32 orange middle tiles have unfolded between '0x7A3f' and '9c2E' with callout HIDDEN.

### S14 · 67.93–73.30 s (5.37 s) · AND IT'S WHY #3: pay a saved contact, username or QR code instead of pasting
- **VO:** "And it's why paying a saved contact, username or QR code beats pasting."
- **Engine / tone:** remotion3d · dark
- **Subject:** FALLBACK (inbox/ has no DYNK send-screen recording): 3D Phone, screen = ui_contacts (generic 'Send to' screen: search name or @username with QR button, saved contacts list, Sam ticked). No DYNK logo or name. Never show or imply that any app detects or blocks poisoning.
- **Accent:** The selected saved contact row (Sam ✓) gets an orange outline on 'contact' (1.30 s). Nothing else orange.
- **Camera:** 0.0–1.2 s 3/4 low (from [1.0,1.5,6.5] to [0.6,1.7,5.4]); 1.2 s push toward the contact row; 2.1 s cut: higher angle drifting to the search field (username + QR) on 'username'/'QR'; 3.8 s slow pull back on 'beats pasting'.
- **Callouts:** `SAVED CONTACT` on "contact" (1.3 s) orange · `@USERNAME` on "username" (2.19 s) · `QR` on "QR" (3.05 s) · `NOTHING TO PASTE` on "pasting" (4.09 s)
- **Caption keyword:** contact
- **Disclaimer:** Illustration · generic wallet screen
- **Assets:** `ui_contacts`
- **SFX:** click.wav @1.3 s, tick.wav @2.2 s, tick.wav @3.1 s
- **Acceptance:** At 2.0 s a phone shows a generic 'Send to' list with the 'Sam' row outlined orange and callout SAVED CONTACT, caption boxes 'contact'; at 4.6 s callout NOTHING TO PASTE is visible; no DYNK logo anywhere.

### S15 · 73.30–79.47 s (6.17 s) · TWIST BACK: you checked the ends, they matched, you sent it yourself
- **VO:** "So nobody broke into your wallet. You checked the ends, they matched, and you sent it yourself."
- **Engine / tone:** remotion3d · dark
- **Subject:** Return to the hook's lens: identical TileRow chars=REAL macro, same L→R track as S01 0.0–1.4 s, then the ghost locks on again.
- **Accent:** FIRST4 glow on 'checked' (2.19 s), LAST4 glow on 'ends' (2.64 s), EnergyArcs on 'matched' (3.56 s). Same as S01.
- **Camera:** 0.0–2.1 s copy S01's opening track exactly (same from/to/fov) but slower; 2.1 s cut to LAST4 macro; 3.4 s ghost drops and locks; 4.5 s slow pull back on 'yourself' so the whole row and its ghost are in frame.
- **Callouts:** `FIRST 4` on "checked" (2.19 s) · `LAST 4` on "ends" (2.64 s)
- **Caption keyword:** yourself
- **Disclaimer:** Magnified illustration · addresses are made up
- **SFX:** glint.wav @2.65 s, thud.wav @3.6 s
- **Acceptance:** At 0.5 s the frame reads as S01's first frame (same tiles, angle, lens); at 4.9 s both end blocks are orange and locked with arcs, callouts FIRST 4 and LAST 4 visible, caption boxes 'yourself'.

### S16 · 79.47–85.77 s (6.30 s) · CTA: 'send this to someone who only checks the first and last few characters' + clean loop to frame 1
- **VO:** "Follow me, and send this to someone who only checks the first and last few characters."
- **Engine / tone:** remotion + remotion3d · dark
- **Subject:** Background: S01's tile row and camera at S01 frame 0 (static-ish, slow track). ShareSheetEnd (kit) rises on 'send' (1.10 s): wrap it so it slides up OVER the tile row (the component paints its own #0c0d0f background; fade that background to ~0.85 or render the sheet part only). Contact selected + orange Send button by ~2.0 s. From durationSec-0.6 s the sheet slides back down, leaving the tile row exactly as S01 frame 0 (FIRST4 glowing/just about to glow) for a clean loop.
- **Accent:** ShareSheetEnd's orange selection ring + Send button. After the sheet lowers: the S01 frame-0 state only.
- **Camera:** Same as S01 0.0 s start pose; tiny drift only.
- **Caption keyword:** characters
- **Disclaimer:** —
- **SFX:** whoosh_soft.wav @1.1 s, click.wav @2.4 s
- **Acceptance:** At 3.0 s an Instagram-style share sheet covers the lower 2/3 with a contact ringed orange and an orange Send button, caption reads '…the first and last few characters' with 'characters' boxed; last frame matches S01's first frame (tile row, same angle).

## Assets made by the director
- `captures/S10-chainalysis-title.png`, `S10-chainalysis-may3.png`, `S11-chainalysis-returned.png`, `S11-chainalysis-82031.png`: element screenshots of https://www.chainalysis.com/blog/address-poisoning-scam/ (Playwright, cookie banner rejected, 29 Oct 2026). Stills, not video: the article body around the case shows real partial addresses (0x1E227 / 0xd9A1b / 0xd9A1c), so a scrolling recording was avoided.
- `captures/ui-*.png` (700×1500, Phone-screen aspect): generic wallet UI drawn in HTML: history, history + planted row, copy menu, send screen (REAL in full), lock-screen +0.00 notification, contact picker. No logo, no DYNK name.
- All copied to `studio/public/runs/2026-10-29-next/` by `scaffold_scenes.mjs`.

## Caption source lines (already in `05-caption.md`)
Chainalysis (May 2024 case, ~$68M WBTC, test payment first, returned 9 May 2024, 82,031 seeded addresses); MetaMask Help Center; TRM Labs. No third-party footage, so no "Footage:" line (remove the placeholder from `05-caption.md` at the cut).
