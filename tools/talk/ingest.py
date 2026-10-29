#!/usr/bin/env python3
"""Talking-head ingest: one raw take in, a tight A-roll + word timings out.

  python3 tools/talk/ingest.py runs/<id> [--take path/to/take.mov] [--model small.en]
                                         [--max-gap 0.35] [--keep-gap 0.14] [--no-tighten]

What it does
  1. Probes the take (size, fps, rotation, length).
  2. Transcribes with faster-whisper (word timestamps), then snaps every word to the
     real speech/silence edges measured from the audio (Whisper smears word ends into pauses).
  3. Any stretch of speech Whisper skipped is re-transcribed on its own, and is never cut.
  4. If runs/<id>/say.txt exists (the exact lines from the script), it is used to
       - drop retakes: when you restart a line, only the LAST attempt is kept
       - fix spellings (DYNK, Solana, names) to match the script
  5. Removes dead air: silences longer than --max-gap are closed to --keep-gap.
     Only measured silence is removed, so a word Whisper missed can't be cut out.
  6. Renders work/aroll.mp4 (30 fps CFR, dense keyframes, click-free audio seams).
  7. Writes, in runs/<id>/work/:
       words.json        words on the NEW timeline: [{i, text, start, end, phrase}]
       seams.json        output times of every jump cut (the renderer hides them)
       words.txt         readable index for the board director: idx  time  word
       ingest-report.md  what was cut and why (retakes, stutters, fillers, dead air)
"""
import argparse, difflib, glob, json, os, re, subprocess, sys, wave

import numpy as np

FILLERS = {"um", "uh", "erm", "er", "ah", "hmm", "mm", "umm", "uhh"}
GLOSSARY = {"dink": "DYNK", "dinc": "DYNK", "dynk": "DYNK", "dinks": "DYNK's", "dinkle": "Dynkle",
            "solanna": "Solana", "salana": "Solana"}
VIDEO_EXT = (".mp4", ".mov", ".m4v", ".mkv", ".webm")
HOP = 0.01  # 10 ms analysis frames


def sh(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def probe(path):
    out = json.loads(sh(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", path]).stdout)
    v = next(s for s in out["streams"] if s["codec_type"] == "video")
    rot = 0
    for sd in v.get("side_data_list", []) or []:
        if "rotation" in sd:
            rot = int(sd["rotation"])
    rot = int(v.get("tags", {}).get("rotate", rot))
    w, h = int(v["width"]), int(v["height"])
    if abs(rot) in (90, 270):
        w, h = h, w
    num, den = (v.get("avg_frame_rate") or "30/1").split("/")
    fps = float(num) / float(den) if float(den or 0) else 30.0
    return {"width": w, "height": h, "fps": round(fps, 3), "duration": float(out["format"]["duration"]),
            "hasAudio": any(s["codec_type"] == "audio" for s in out["streams"])}


def norm(t):
    return re.sub(r"[^a-z0-9$%']", "", t.lower().replace("’", "'"))


def load_wav(path):
    with wave.open(path) as wf:
        return np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0


# ---------------------------------------------------------------- speech / silence map
def speech_mask(audio, sr=16000, min_sil=0.15):
    hop = int(sr * HOP)
    n = len(audio) // hop
    frames = audio[: n * hop].reshape(n, hop)
    db = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-9)
    floor = np.percentile(db, 10)
    peak = np.percentile(db, 98)
    thr = max(floor + 10, peak - 40)
    sp = db > thr
    # close tiny gaps inside words (plosives) and drop tiny blips
    sp = _fill_runs(sp, False, int(min_sil / HOP))
    sp = _fill_runs(sp, True, 3)
    return sp, round(float(thr), 1), round(float(floor), 1)


def _fill_runs(mask, value, maxlen):
    m = mask.copy()
    i = 0
    while i < len(m):
        if m[i] == value:
            j = i
            while j < len(m) and m[j] == value:
                j += 1
            if j - i < maxlen and i > 0 and j < len(m):
                m[i:j] = not value
            i = j
        else:
            i += 1
    return m


def runs(mask, value):
    out, i = [], 0
    while i < len(mask):
        if mask[i] == value:
            j = i
            while j < len(mask) and mask[j] == value:
                j += 1
            out.append((i * HOP, j * HOP))
            i = j
        else:
            i += 1
    return out


# ---------------------------------------------------------------- transcription
_model = None


def whisper(audio, model_name, prompt, offset=0.0):
    global _model
    from faster_whisper import WhisperModel
    if _model is None:
        _model = WhisperModel(model_name, compute_type="int8")
    segs, _ = _model.transcribe(audio, word_timestamps=True, beam_size=5, vad_filter=False,
                                condition_on_previous_text=False, initial_prompt=prompt or None)
    words = []
    for s in segs:
        for w in s.words or []:
            t = w.word.strip()
            if not t:
                continue
            if not norm(t):  # "-", "...": Whisper's mark for a cut-off word
                if words:
                    words[-1]["cutoff"] = True
                continue
            words.append({"text": t, "start": round(w.start + offset, 3), "end": round(w.end + offset, 3),
                          "p": round(w.probability, 3)})
    return words


def snap_to_speech(words, sp):
    """Whisper smears word edges into pauses. Pull each edge onto measured speech."""
    sil = runs(sp, False)
    for w in words:
        for a, b in sil:
            if a < w["end"] <= b and w["start"] < a:  # word end bleeds into a silence
                w["end"] = round(a + 0.02, 3)
            if a <= w["start"] < b and w["end"] > b:  # word start sits in a silence
                w["start"] = round(b - 0.02, 3)
            if a <= w["start"] and w["end"] <= b and (b - a) > 0.25:  # whole word in silence = hallucination
                w["ghost"] = True
    return [w for w in words if not w.get("ghost")]


def fill_missed_speech(words, sp, audio, model_name, prompt, report, sr=16000):
    """Speech with no words on it → transcribe that chunk alone and splice the words in."""
    covered = np.zeros(len(sp), bool)
    for w in words:
        covered[int(w["start"] / HOP): int(w["end"] / HOP) + 1] = True
    missed = [(a, b) for a, b in runs(sp & ~covered, True) if b - a >= 0.35]
    added = []
    for a, b in missed:
        a0, b0 = max(0, a - 0.25), min(len(audio) / sr, b + 0.25)
        got = whisper(audio[int(a0 * sr): int(b0 * sr)], model_name, prompt, offset=a0)
        got = [g for g in got if g["end"] > a - 0.1 and g["start"] < b + 0.1]
        if got:
            added += got
            report.append(f"- re-transcribed speech Whisper skipped @ {a:.2f}s: “{' '.join(g['text'] for g in got)}”")
        else:
            report.append(f"- ⚠ speech @ {a:.2f}–{b:.2f}s has no transcript (kept in the cut, no captions there)")
    # a word Whisper smeared over the skipped speech is usually a hallucination ("Oh," for "So, lose…")
    def overlap(w, g):
        return max(0.0, min(w["end"], g["end"]) - max(w["start"], g["start"]))
    kept = [w for w in words if not any(overlap(w, g) > (0.0 if w.get("p", 1) < 0.4 else 0.5 * max(0.05, w["end"] - w["start"])) for g in added)]
    for w in words:
        if w not in kept:
            report.append(f"- dropped “{w['text']}” @ {w['start']:.2f}s (overlapped re-transcribed speech)")
    return sorted(kept + added, key=lambda w: w["start"])


# ---------------------------------------------------------------- retakes
def phrases_of(words, sp):
    out, cur = [], []
    for i, w in enumerate(words):
        if cur:
            p = words[i - 1]
            a, b = int(p["end"] / HOP), int(w["start"] / HOP)
            silent = b > a and (~sp[a:b]).sum() * HOP >= 0.2
            if silent or p.get("cutoff"):
                out.append(cur); cur = []
        cur.append(i)
    if cur:
        out.append(cur)
    return out


def script_pos(tokens, script_toks):
    n = len(tokens)
    if not n or not script_toks:
        return None, 0.0
    best = (None, 0.0)
    for s in range(0, max(1, len(script_toks) - min(n, 3) + 1)):
        win = script_toks[s:s + n]
        r = difflib.SequenceMatcher(None, tokens, win, autojunk=False).ratio()
        head = sum(1 for a, b in zip(tokens[:3], win[:3]) if a == b) / min(3, n)
        sc = 0.7 * r + 0.3 * head
        if sc > best[1]:
            best = (s, sc)
    return best


def drop_retakes(words, sp, script_toks, report):
    keep = [True] * len(words)
    toks = [norm(w["text"]) for w in words]
    for i, w in enumerate(words):
        if toks[i] in FILLERS:
            keep[i] = False
            report.append(f"- filler “{w['text']}” @ {w['start']:.2f}s")
    script_str = " ".join(script_toks)
    for n in range(6, 1, -1):  # "which coins which coins" → keep the second
        for i in range(0, len(words) - 2 * n + 1):
            if all(keep[i:i + 2 * n]) and toks[i:i + n] == toks[i + n:i + 2 * n]:
                rep = " ".join(toks[i:i + n])
                if f"{rep} {rep}" not in script_str:
                    for k in range(i, i + n):
                        keep[k] = False
                    report.append(f"- stutter “{' '.join(w['text'] for w in words[i:i+n])}” @ {words[i]['start']:.2f}s")
    phr = [[i for i in p if keep[i]] for p in phrases_of(words, sp)]
    phr = [p for p in phr if p]
    info = []
    for p in phr:
        tk = [toks[i] for i in p]
        if script_toks:
            pos, sc = script_pos(tk, script_toks)
            info.append({"idx": p, "pos": pos if sc >= 0.45 else None, "tk": tk})
        else:
            info.append({"idx": p, "pos": None, "tk": tk})
    for j in range(1, len(info)):
        cur = info[j]
        for k in range(j - 1, max(-1, j - 4), -1):
            prev = info[k]
            if not all(keep[i] for i in prev["idx"]) or len(cur["tk"]) < 2:
                continue
            if script_toks and cur["pos"] is not None and prev["pos"] is not None:
                restart = cur["pos"] <= prev["pos"] + 1
            else:
                restart = cur["tk"][:2] == prev["tk"][:2]
            # a cut-off phrase that the next phrase repeats from the top is always a retake
            if not restart and words[prev["idx"][-1]].get("cutoff") and cur["tk"][:2] == prev["tk"][:2]:
                restart = True
            if restart:
                for i in prev["idx"]:
                    keep[i] = False
                txt = " ".join(words[i]["text"] for i in prev["idx"])
                report.append(f"- retake: dropped earlier attempt “{txt}” @ {words[prev['idx'][0]]['start']:.2f}s")
    return keep


def fix_spelling(words, keep, script_raw, report):
    kept = [i for i, k in enumerate(keep) if k]
    for i in kept:
        g = GLOSSARY.get(norm(words[i]["text"]))
        if g:
            words[i]["text"] = re.sub(r"[A-Za-z']+", g, words[i]["text"], count=1)
    if not script_raw:
        return
    a = [norm(words[i]["text"]) for i in kept]
    b = [norm(t) for t in script_raw]
    fixes = []
    for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op in ("equal", "replace") and (a1 - a0) == (b1 - b0):
            for k in range(a1 - a0):
                old = words[kept[a0 + k]]["text"]
                words[kept[a0 + k]]["text"] = script_raw[b0 + k]
                if op == "replace":
                    fixes.append(f"{old}→{script_raw[b0 + k]}")
        elif op == "delete":
            report.append(f"- note: said but not in script: “{' '.join(words[kept[i]]['text'] for i in range(a0, a1))}”")
        elif op == "insert":
            report.append(f"- note: in script but not heard: “{' '.join(script_raw[b0:b1])}”")
    if fixes:
        report.append("- spelling matched to script: " + ", ".join(fixes))


# ---------------------------------------------------------------- cut list
def keep_ranges(words, keep, sp, dur, max_gap, keep_gap, tighten, report, edge_pad=0.0):
    n = int(dur / HOP) + 1
    sp = np.pad(sp, (0, max(0, n - len(sp))))[:n]
    m = np.zeros(n, bool)
    kept = [i for i, k in enumerate(keep) if k]
    if not kept:
        sys.exit("No speech found in the take.")
    first = words[kept[0]]["start"]
    speech_runs = runs(sp, True)
    last = max(words[kept[-1]]["end"], max((b for a, b in speech_runs if a < words[kept[-1]]["end"] + 0.6), default=0))
    t = lambda s: int(round(s / HOP))
    m[t(max(0, first - 0.12)): t(min(dur, last + 0.30))] = True
    pre, post = keep_gap * 0.45, keep_gap * 0.55
    # cut out dropped words (retakes, stutters, fillers) and the pause around them
    i = 0
    while i < len(words):
        if not keep[i]:
            j = i
            while j < len(words) and not keep[j]:
                j += 1
            a = words[i - 1]["end"] + post if i > 0 else 0
            b = words[j]["start"] - pre if j < len(words) else dur
            if b > a:
                m[t(a): t(b)] = False
            i = j
        else:
            i += 1
    # close measured dead air
    if tighten:
        cut = 0.0
        for a, b in runs(sp, False):
            if b - a > max_gap + edge_pad * 1.5 and a > first and b < last:
                # edge_pad keeps soft word tails/onsets that sit under the speech threshold
                m[t(a + post + edge_pad): t(b - pre - edge_pad * 0.5)] = False
                cut += (b - a) - keep_gap - edge_pad * 1.5
        report.append(f"- dead air closed: {cut:.2f}s")
    rs = [(round(a, 3), round(min(b, dur), 3)) for a, b in runs(m, True) if b - a >= 0.08]
    return [list(r) for r in rs]


def merge_protect(ranges, a, b):
    rs = sorted(ranges + [[a, b]])
    out = []
    for r in rs:
        if out and r[0] <= out[-1][1] + 0.02:
            out[-1][1] = max(out[-1][1], r[1])
        else:
            out.append(list(r))
    return out


def remap(t, ranges):
    acc = 0.0
    for a, b in ranges:
        if t < a:
            return acc
        if t <= b:
            return acc + (t - a)
        acc += b - a
    return acc


def render_aroll(src, ranges, out, has_audio):
    parts, labels, fade = [], [], 0.012
    for k, (a, b) in enumerate(ranges):
        parts.append(f"[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS[v{k}]")
        if has_audio:
            d = b - a
            parts.append(f"[0:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,"
                         f"afade=t=in:st=0:d={fade},afade=t=out:st={max(0, d - fade):.3f}:d={fade}[a{k}]")
            labels.append(f"[v{k}][a{k}]")
        else:
            labels.append(f"[v{k}]")
    parts.append(f"{''.join(labels)}concat=n={len(ranges)}:v=1:a={1 if has_audio else 0}[vc]" + ("[ac]" if has_audio else ""))
    parts.append("[vc]fps=30,format=yuv420p[vo]")
    script = out + ".filter.txt"
    open(script, "w").write(";".join(parts))
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex_script", script, "-map", "[vo]"]
    if has_audio:
        cmd += ["-map", "[ac]", "-c:a", "aac", "-b:a", "256k", "-ar", "48000"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "16", "-g", "15", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    os.remove(script)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("run")
    ap.add_argument("--take")
    ap.add_argument("--model", default=os.environ.get("TALK_WHISPER_MODEL", "small.en"))
    ap.add_argument("--max-gap", type=float, default=0.35, help="silences longer than this get closed up (s)")
    ap.add_argument("--keep-gap", type=float, default=0.14, help="what a closed silence shrinks to (s)")
    ap.add_argument("--edge-pad", type=float, default=0.0, help="extra speech kept either side of each closed pause (s); raise if word endings get clipped")
    ap.add_argument("--no-retakes", action="store_true", help="use say.txt for the Whisper prompt + spelling only; keep every attempt (takes already chosen)")
    ap.add_argument("--protect", action="append", help="take-time range a-b (s) that is never cut, e.g. --protect 2.3-2.8")
    ap.add_argument("--no-tighten", action="store_true", help="keep natural pauses (still trims head/tail and retakes)")
    args = ap.parse_args()

    run = args.run.rstrip("/")
    work = os.path.join(run, "work"); os.makedirs(work, exist_ok=True)
    take = args.take
    if not take:
        cands = [p for p in sorted(glob.glob(os.path.join(run, "source", "*"))) if p.lower().endswith(VIDEO_EXT)]
        if not cands:
            sys.exit(f"No take found. Drop your video into {run}/source/ (mp4/mov).")
        take = cands[-1]
    info = probe(take)
    print(f"Take: {os.path.basename(take)}  {info['width']}x{info['height']} @ {info['fps']}fps, {info['duration']:.1f}s")
    if not info["hasAudio"]:
        sys.exit("The take has no audio track. Merge the mic audio into the video first.")

    wav = os.path.join(work, "audio16k.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", take, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    audio = load_wav(wav)
    sp, thr, floor = speech_mask(audio)

    say_path = os.path.join(run, "say.txt")
    script_raw = []
    if os.path.exists(say_path):
        txt = re.sub(r"\[[^\]]*\]", " ", open(say_path).read())
        script_raw = [t for t in txt.split() if norm(t)]
    script_toks = [norm(t) for t in script_raw]
    prompt = " ".join(script_raw[:120]) if script_raw else "DYNK, Solana, self-custody, wallet."

    report = [f"- speech threshold {thr} dBFS (noise floor {floor} dBFS)"]
    print(f"Transcribing with faster-whisper ({args.model})…")
    raw = whisper(audio, args.model, prompt)
    raw = snap_to_speech(raw, sp)
    raw = fill_missed_speech(raw, sp, audio, args.model, prompt, report)
    json.dump(raw, open(os.path.join(work, "transcript.raw.json"), "w"), indent=1)

    if args.no_retakes:
        keep = [norm(w["text"]) not in FILLERS for w in raw]
        report.append("- retake matching off (--no-retakes): takes were chosen before ingest")
    else:
        keep = drop_retakes(raw, sp, script_toks, report)
    fix_spelling(raw, keep, script_raw, report)
    ranges = keep_ranges(raw, keep, sp, info["duration"], args.max_gap, args.keep_gap, not args.no_tighten, report, args.edge_pad)
    for pr in args.protect or []:
        a, b = map(float, pr.split("-"))
        ranges = merge_protect(ranges, a, b)
        report.append(f"- protected {a:.2f}-{b:.2f}s from cutting")

    out_words, phrase, prev = [], 0, None
    for w, k in zip(raw, keep):
        if not k:
            continue
        s, e = remap(w["start"], ranges), remap(w["end"], ranges)
        if prev is not None and (s - prev > 0.12 or raw[raw.index(w) - 1].get("cutoff")):
            phrase += 1
        out_words.append({"i": len(out_words), "text": w["text"], "start": round(s, 3),
                          "end": round(max(e, s + 0.05), 3), "phrase": phrase})
        prev = e
    seams, acc = [], 0.0
    for a, b in ranges[:-1]:
        acc += b - a
        seams.append(round(acc, 3))
    total = round(sum(b - a for a, b in ranges), 3)

    aroll = os.path.join(work, "aroll.mp4")
    print(f"Cutting A-roll: {len(ranges)} pieces, {info['duration']:.1f}s → {total:.1f}s")
    render_aroll(take, ranges, aroll, True)

    json.dump({"take": os.path.abspath(take), "source": info, "durationSec": total, "fps": 30, "ranges": ranges,
               "model": args.model, "scriptAligned": bool(script_raw)},
              open(os.path.join(work, "aroll.json"), "w"), indent=1)
    json.dump(out_words, open(os.path.join(work, "words.json"), "w"), indent=1)
    json.dump(seams, open(os.path.join(work, "seams.json"), "w"))

    lines, cur = [], -1
    for w in out_words:
        if w["phrase"] != cur:
            cur = w["phrase"]; lines.append("")
        lines.append(f"{w['i']:>4}  {w['start']:6.2f}–{w['end']:6.2f}  {w['text']}")
    open(os.path.join(work, "words.txt"), "w").write(
        "# word index · start–end (s, on the cut A-roll) · word.  Blank line = phrase break.\n" + "\n".join(lines) + "\n")

    with open(os.path.join(work, "ingest-report.md"), "w") as f:
        f.write(f"# Ingest report\n\nTake `{os.path.basename(take)}` {info['width']}x{info['height']} @ {info['fps']}fps\n\n")
        f.write(f"- Raw {info['duration']:.2f}s → cut A-roll {total:.2f}s ({len(ranges)} pieces, {len(seams)} jump cuts)\n")
        f.write(f"- Script alignment: {'on (say.txt)' if script_raw else 'off (no say.txt): retakes found by repeated opening words only'}\n")
        f.write(f"- Words kept {len(out_words)} of {len(raw)}\n\n## What changed\n")
        f.write("\n".join(report))
        f.write("\n\n## Final transcript\n\n" + " ".join(w["text"] for w in out_words) + "\n")
    print("\n".join(report))
    print(f"Done → {work}/aroll.mp4  ({len(out_words)} words, {len(seams)} jump cuts)")


if __name__ == "__main__":
    main()
