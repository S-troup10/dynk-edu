#!/usr/bin/env python3
"""Offline AI voiceover (Kokoro-82M via kokoro-onnx). Use when edge-tts can't reach Microsoft's servers
(e.g. a cloud session without speech.platform.bing.com on the allowlist). Same output as tts.py:
<id>.mp3 + <id>.words.json ({"durationSec", "words": [{text,start,end}]}), polished with tts.py's chain.

One-time install (~350 MB model files, from GitHub releases):
  pip3 install kokoro-onnx soundfile
  mkdir -p ~/.cache/kokoro && cd ~/.cache/kokoro
  curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

  python3 tools/tts_kokoro.py --batch runs/<id>/vo_lines.json --outdir runs/<id>/audio/vo [--voice am_michael --speed 1.1]

Each line is synthesised in ONE call (natural prosody; per-phrase synthesis made the tone jump and pause awkwardly).
Word timings: phrase edges (split on , . ? ! ; :) are snapped to the real pauses in the take, with per-phrase
synthesis only used for relative lengths; words inside a phrase are spread by a syllable-ish weight. Good for sentence-building captions.
Optional per-line "say" field = what is spoken (e.g. numbers written out), "text" = what captions show;
they must have the same number of words.
"""
import argparse, json, os, re, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
MODEL_DIR = os.environ.get("KOKORO_DIR", os.path.expanduser("~/.cache/kokoro"))


def trim(a, sr, thresh=0.012, pad=0.03):
    idx = np.where(np.abs(a) > thresh)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(pad * sr)): min(len(a), idx[-1] + int(pad * sr))]


def silences(a, sr, thresh=0.02, min_len=0.07):
    """Pauses inside a take: [(start, end)] where |a| stays under thresh for >= min_len seconds (edges excluded)."""
    win = int(0.01 * sr)
    env = np.array([np.abs(a[i:i + win]).max() for i in range(0, len(a) - win, win)])
    quiet = env < thresh
    out, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - i) * 0.01 >= min_len and i > 0 and j < len(quiet):
                out.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return out


def weight(w):
    w = re.sub(r"[^a-z0-9]", "", w.lower())
    if not w:
        return 0.6
    syl = max(1, len(re.findall(r"[aeiouy]+", w)))
    return 0.35 + 0.65 * syl + 0.02 * len(w)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--voice", default="am_michael")
    ap.add_argument("--speed", type=float, default=1.1)
    ap.add_argument("--comma", type=float, default=0.12, help="pause after a comma-type break (s)")
    ap.add_argument("--stop", type=float, default=0.22, help="pause after a full stop (s)")
    ap.add_argument("--no-polish", action="store_true")
    a = ap.parse_args()
    from kokoro_onnx import Kokoro
    from tts import polish  # same vocal chain as the edge-tts path
    k = Kokoro(os.path.join(MODEL_DIR, "kokoro-v1.0.onnx"), os.path.join(MODEL_DIR, "voices-v1.0.bin"))
    os.makedirs(a.outdir, exist_ok=True)
    summary = {}
    for line in json.load(open(a.batch)):
        sid, text = line["id"], line["text"]
        say = line.get("say", text)
        speed = line.get("speed", a.speed)
        show_words, say_words = text.split(), say.split()
        if len(show_words) != len(say_words):
            sys.exit(f"{sid}: 'say' and 'text' must have the same word count")
        # phrase split on punctuation attached to a word
        phrases, cur = [], []
        for i, w in enumerate(say_words):
            cur.append(i)
            if re.search(r"[,.?!;:]$", w) or i == len(say_words) - 1:
                phrases.append(cur)
                cur = []
        sr = 24000
        voice = line.get("voice", a.voice)
        # 1) ONE synthesis of the whole line -> natural prosody (per-phrase synthesis made the tone reset and
        #    pause awkwardly at every comma/full stop).
        full, sr = k.create(say, voice=voice, speed=speed, lang="en-us")
        full = trim(np.asarray(full, dtype=np.float32), sr)
        # 2) word timings: relative phrase lengths from per-phrase synthesis, snapped to the real silences in
        #    the whole-line take when the counts agree.
        pdur = []
        for idxs in phrases:
            pa, _ = k.create(" ".join(say_words[i] for i in idxs), voice=voice, speed=speed, lang="en-us")
            pdur.append(len(trim(np.asarray(pa, dtype=np.float32), sr)) / sr)
        total = len(full) / sr
        gaps = silences(full, sr)  # [(start, end)] of pauses >= 70 ms
        if len(gaps) == len(phrases) - 1:
            edges = [0.0] + [(g0 + g1) / 2 for g0, g1 in gaps] + [total]
            bounds = [(edges[i], gaps[i][0] if i < len(gaps) else total) for i in range(len(phrases))]
            bounds = [(gaps[i - 1][1] if i > 0 else 0.0, e) for i, (_, e) in enumerate(bounds)]
        else:
            scale = total / max(1e-6, sum(pdur))
            acc, bounds = 0.0, []
            for d in pdur:
                bounds.append((acc, acc + d * scale)); acc += d * scale
        words = []
        for idxs, (b0, b1) in zip(phrases, bounds):
            ws = [weight(say_words[i]) for i in idxs]
            tot = sum(ws); acc = b0
            for i, wv in zip(idxs, ws):
                d = (b1 - b0) * wv / tot
                words.append({"text": show_words[i], "start": round(acc, 3), "end": round(acc + d, 3)})
                acc += d
        mp3 = os.path.join(a.outdir, f"{sid}.mp3")
        with tempfile.TemporaryDirectory() as td:
            raw = os.path.join(td, "raw.wav")
            sf.write(raw, full, sr)
            if a.no_polish:
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-ar", "48000", "-b:a", "192k", mp3], check=True)
            else:
                polish(raw, mp3)
        dur = round(len(full) / sr, 3)
        json.dump({"durationSec": dur, "words": words}, open(os.path.join(a.outdir, f"{sid}.words.json"), "w"), indent=1)
        summary[sid] = dur
        print(f"{sid}: {dur:.2f}s  {len(show_words)} words", flush=True)
    print(json.dumps({"total": round(sum(summary.values()), 2), **summary}))


if __name__ == "__main__":
    main()
