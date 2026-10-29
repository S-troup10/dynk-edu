# 05b — Adapter check (round 1): "The address you copied was a scammer's"

Inputs: `05-script.md`, `04-structure.md`, `03-hooks.md`, `references/style-speedy_devv.md` §2,
`proven-hook-templates`. Chainalysis post re-checked live 29 Oct 2026.

## Verdict: **FIX** (small: beat-type labels + one twist line; no structural change)

## Checklist
| Check | Result |
|---|---|
| Hook verbatim (`03-hooks.md` #3) | ✅ word for word, 18 w, 0–4.8 s |
| Loop "So what did you miss?" | ✅ verbatim, 4.8–6.8 s |
| Reframe verbatim | ✅ "It wasn't really your address. It was a lookalike, planted in your own history." (6.8–12.4 s) |
| Spine §2: IMAGINE line | ✅ line 4, 12.4 s |
| ≥2 "that's also why" | ✅ 3 (lines 13, 14, 15) |
| TWIST BACK | ✅ line 16, returns to frame-1 lens; wording weaker than structure (see edit 2) |
| Specific share CTA | ✅ "Follow me, and send this to someone who only checks the first and last few characters." matches §2 line 70 format |
| Promise paid off | ✅ line 9 "The ends match. The middle never did." at 36.8 s with ✓ ✓ ✗ replay; generation → dust → history → copy → irreversible all shown |
| Beats ≤6 s apart | ⚠️ 0.0→6.8 is 6.8 s on paper, but the hook reveals FIRST 4 / LAST 4 / MIDDLE at 0.6 / 1.4 / 2.8 s and the loop gets a new angle at 4.8 s. Accepted. All other gaps 3.6–5.6 s |
| Beat types varied, none twice in a row | ❌ labels repeat: part ×3 (beats 3–5), number ×2 (11–12), consequence ×3 (13–15). Content is varied; labels drift from `04-structure.md` (S P A P A P F X …). Edit 1 |
| Every number sourced | ✅ May 2024, ~$68M, test payment, returned, 82,031 → Chainalysis (verified: test went to the intended `0xd9A1b`, big transfer minutes later to lookalike, funds returned 9 May). Zero/tiny transfers, shortened addresses → MetaMask. "four" = viewer habit, tiles flagged with Disclaimer |
| Length 70–90 s | ✅ ~87.7 s, 223 w (close to ceiling; edit 2 is net +1 word and keeps it there) |
| No hype words | ✅ none |
| No investment language | ✅ none; "sent / returned", never "lost"; no DYNK claim in VO |

## Required edits

**Edit 1 — beat-type labels (the `beat` column and the "Beat timestamps" table).** Relabel so no type repeats
and so they match what each line actually adds:

| Line | Current | Replace with |
|---|---|---|
| 4 | `[BEAT 3: part]` | `[BEAT 3: scenario]` (the IMAGINE line) |
| 6 | `[BEAT 5: part]` | `[BEAT 5: action]` (the generator churning out addresses) |
| 8 | `[BEAT 7: consequence]` | `[BEAT 7: action]` (planted row slides in beside the real one) |
| 9 | `[BEAT 8: twist]` | `[BEAT 8: part]` (payoff: ✓ ✓ ✗ labelled parts) |
| 10 | `[BEAT 9: consequence]` | `[BEAT 9: fact]` (irreversible) |
| 12 | `[BEAT 12: number]` | `[BEAT 12: fact]` (returned after negotiation; 82,031 on the counter) |
| 14 | `[BEAT 14: consequence]` | `[BEAT 14: part]` (the "…" opens as a cutaway, HIDDEN callout) |

Resulting sequence: part · twist · scenario · part · action · number · action · part · fact · proof · number · fact ·
consequence · part · consequence · twist · CTA. No type twice in a row. VO unchanged.

**Edit 2 — line 16 twist back: re-use the hook's words so the loop-back is audible, not only visual.**
- Quote: `So nobody broke into your wallet. The ends matched, and you sent it yourself.`
- Replace: `So nobody broke into your wallet. You checked the ends, they matched, and you sent it yourself.`
- To hold length, line 11 quote: `then about sixty-eight million dollars in crypto to a lookalike.`
  → `then about sixty-eight million dollars to a lookalike.` (caption already says wrapped bitcoin). Net +1 word, ~+0.4 s.

## Notes (no edit needed)
- Proof visual is correct per Chainalysis: small arc to the *real* row, big arc to the lookalike. Keep real prefixes off screen.
- Line 10 "no bank can pull it back" then line 12 "It was returned after a negotiation": fine, the return was the
  scammer's choice. Director: keep the return arc grey so it doesn't read as a reversal.
- `vo_lines.json` not written by the scripter: correct per `.claude/agents/scripter.md` (director writes it).
- Line 15 uses the generic contact-picker fallback unless a DYNK send-screen recording lands in `inbox/`.

---

# Round 2 re-check (revision 1 of `05-script.md`)

## Verdict: **PASS**

| Round-1 edit | Status |
|---|---|
| Edit 1, beat-type labels | ✅ Lines 4, 6, 8, 9, 10, 12 and 14 relabelled in the table and the beat timestamps. Sequence: part · twist · scenario · part · action · number · action · part · fact · proof · number · fact · consequence · part · consequence · twist · CTA. No type appears twice in a row. |
| Edit 2, twist + length trade | ✅ Line 16 now reads "So nobody broke into your wallet. You checked the ends, they matched, and you sent it yourself." Line 11 has "in crypto" cut. |

Re-checked:
- Hook, loop and reframe are still verbatim.
- The spine is intact: imagine line, 3 "that's also why" consequences, twist back, specific CTA.
- Payoff at 36.8 s is unchanged.
- Re-flowed gaps from line 11 on are 3.2–5.6 s.
- Total is 224 words, about 88.1 s, inside 70–90 s.
- Sources are unchanged and verified.
- No hype words and no investment language.

**Note for the director:** about 88 s sits close to the 90 s ceiling. If TTS comes out longer than 90 s, apply the script's own cut order: "Never copy those." (line 13) goes first.
