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

Word timings: every phrase (split on , . ? ! ; :) is synthesised separately, so phrase edges are exact;
words inside a phrase are spread by a syllable-ish weight. Good for sentence-building captions.
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
        chunks, words, t = [], [], 0.0
        for pi, idxs in enumerate(phrases):
            ptxt = " ".join(say_words[i] for i in idxs)
            audio, sr = k.create(ptxt, voice=line.get("voice", a.voice), speed=speed, lang="en-us")
            audio = trim(np.asarray(audio, dtype=np.float32), sr)
            dur = len(audio) / sr
            ws = [weight(say_words[i]) for i in idxs]
            tot = sum(ws)
            acc = t
            for i, wv in zip(idxs, ws):
                d = dur * wv / tot
                words.append({"text": show_words[i], "start": round(acc, 3), "end": round(acc + d, 3)})
                acc += d
            chunks.append(audio)
            t += dur
            if pi < len(phrases) - 1:
                last = say_words[idxs[-1]]
                gap = a.stop if re.search(r"[.?!]$", last) else a.comma
                chunks.append(np.zeros(int(gap * sr), dtype=np.float32))
                t += gap
        full = np.concatenate(chunks)
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
