---
description: Add a reference video (local file or Instagram/TikTok URL) and record what the director should copy from it
argument-hint: "<file in inbox/ or references/, or a URL> [what you like about it]"
---

Reference: `$ARGUMENTS`

1. **Local file** → move/copy it into `references/` (keep the name), then `bash tools/review_frames.sh references/<file> references/_frames/<name> 0.5` and look at the contact sheet and first frame.
   **URL** → open it in Claude in Chrome (new tab, read-only, no likes/follows), screenshot at ~0s, 1s, 2s, 5s and near the end; note the play count, account, audio label and caption.
2. Append an entry to `references/notes.md` using the template there: what it is, the hook (visual / audio / text), pacing (cuts per second, rehook moments), text style (size, position, case, animation), colour and lighting, transitions, captions, what we copy, what we don't.
3. If it's a style we should adopt across all videos, propose the exact `brand/tokens.json` / `brand/brand.md` change and ask Cooper before applying it.
Return 3 lines: the reference, the 2 things we're copying, any proposed brand change.
