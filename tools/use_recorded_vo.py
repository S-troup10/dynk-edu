#!/usr/bin/env python3
"""Swap the AI voice for your own recording.

Option A (best): record one file per scene, name it S01.recorded.wav / .m4a / .mp3,
drop it in runs/<id>/audio/vo/.
Option B: record the whole script in one take as runs/<id>/audio/voiceover.recorded.(wav|m4a|mp3)
— leave a clear 1-second pause between scenes; this splits it on silences.

  python3 tools/use_recorded_vo.py runs/<id>

Then re-run the pipeline from the director stage (/make-video resume <id> director).
Word timings for captions come from faster-whisper if installed
(pip install faster-whisper), otherwise words are spread evenly across the clip.
"""
import glob, json, os, re, subprocess, sys

run = sys.argv[1].rstrip("/")
vo_dir = os.path.join(run, "audio", "vo")
lines = json.load(open(os.path.join(run, "vo_lines.json")))
ids = [l["id"] for l in lines]


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout.strip())


def to_mp3(src, dst):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "44100", dst], check=True)


# Option B: split one long take
full = glob.glob(os.path.join(run, "audio", "voiceover.recorded.*"))
if full:
    src = full[0]
    out = subprocess.run(["ffmpeg", "-i", src, "-af", "silencedetect=n=-35dB:d=0.7", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    # pick the (len(ids)-1) longest gaps as scene boundaries
    gaps = sorted(zip(starts, ends), key=lambda g: g[1] - g[0], reverse=True)[: len(ids) - 1]
    cuts = sorted((s + e) / 2 for s, e in gaps)
    if len(cuts) != len(ids) - 1:
        sys.exit(f"Found {len(cuts)+1} segments but script has {len(ids)} scenes — record per scene instead.")
    bounds = [0.0] + cuts + [dur(src)]
    for i, sid in enumerate(ids):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-ss", str(bounds[i]), "-to", str(bounds[i + 1]),
                        os.path.join(vo_dir, f"{sid}.recorded.wav")], check=True)

try:
    from faster_whisper import WhisperModel
    model = WhisperModel("base.en", compute_type="int8")
except Exception:
    model = None

for ln in lines:
    rec = glob.glob(os.path.join(vo_dir, f"{ln['id']}.recorded.*"))
    if not rec:
        continue
    mp3 = os.path.join(vo_dir, f"{ln['id']}.mp3")
    to_mp3(rec[0], mp3)
    d = dur(mp3)
    words = []
    if model:
        segs, _ = model.transcribe(mp3, word_timestamps=True)
        for s in segs:
            for w in s.words:
                words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
    else:
        toks = ln["text"].split()
        step = d / max(1, len(toks))
        words = [{"text": t, "start": round(i * step, 3), "end": round((i + 1) * step, 3)} for i, t in enumerate(toks)]
    json.dump({"durationSec": d, "words": words, "text": ln["text"], "voice": "recorded"},
              open(os.path.join(vo_dir, f"{ln['id']}.words.json"), "w"), indent=1)
    print(f"{ln['id']}: recorded voice in ({d:.2f}s)")
