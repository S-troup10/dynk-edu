#!/usr/bin/env python3
"""ONE CONTINUOUS voiceover take for a whole run (offline Kokoro). Use this instead of tts_kokoro.py.

Why: per-line takes each got their own intonation, and the per-clip "polish" (fast compressor + dynamic loudnorm on
a 4 s clip) swung the gain 4-12 dB from syllable to syllable, so the voice sounded jittery, word by word. Here the
script is read as a few long paragraphs (natural prosody and the model's own pauses), polished ONCE with a gentle,
static chain, and laid under the picture as a single file; the scenes carry no voice of their own.

  python3 tools/tts_take.py runs/<id> [--voice am_michael] [--speed 1.1] [--group 3] [--tail 0.9]

Reads  runs/<id>/vo_lines.json            [{id, text, say?}]  (say = spoken form, same word count as text)
Writes runs/<id>/audio/vo_full.wav        the take (48 kHz mono, ~-16 LUFS, static gain)
       runs/<id>/audio/vo/<id>.words.json per-scene word timings (relative to the scene start)
       runs/<id>/audio/vo_take.json       scene boundaries (seconds / frames)
and, if scenes/<id>/props.json exist, updates durationInFrames + vo.words and blanks vo.src (stitch.sh mixes the take).
Scene boundaries fall in the middle of the pause between sentences, so frame counts add up to the take exactly.
"""
import argparse, json, math, os, re, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

FPS = 30
MODEL_DIR = os.environ.get("KOKORO_DIR", os.path.expanduser("~/.cache/kokoro"))
POLISH = ("highpass=f=70,lowshelf=g=1.5:f=160,equalizer=f=320:t=q:w=1.2:g=-1.5,equalizer=f=3600:t=q:w=1.4:g=1.5,"
          "acompressor=threshold=-18dB:ratio=2:attack=15:release=250:makeup=1")


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


def silences(a, sr, thresh=0.02, min_len=0.05):
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


def split_units(words, pat):
    """index lists of `words`, split after a word ending with pat."""
    units, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        if re.search(pat, w) or i == len(words) - 1:
            units.append(cur); cur = []
    return units


def place(units, wts, t0, t1, gaps):
    """Spans for consecutive units inside [t0, t1]: use the len(units)-1 longest pauses if there are enough,
    else split by weight. Returns [(start, end)] (speech only, pauses excluded)."""
    if len(units) == 1:
        return [(t0, t1)]
    inside = [g for g in gaps if g[0] > t0 + 0.05 and g[1] < t1 - 0.05]
    if len(inside) >= len(units) - 1:
        pick = sorted(sorted(inside, key=lambda g: g[1] - g[0], reverse=True)[: len(units) - 1])
        est = np.cumsum([sum(wts[i] for i in u) for u in units]); est = t0 + (t1 - t0) * est / est[-1]
        # sanity: each picked pause must sit near the weight-estimated boundary (within 35 % of the span)
        if all(abs((g[0] + g[1]) / 2 - e) < 0.35 * (t1 - t0) for g, e in zip(pick, est[:-1])):
            edges = [t0] + [x for g in pick for x in g] + [t1]
            return [(edges[2 * i], edges[2 * i + 1]) for i in range(len(units))]
    tot = sum(sum(wts[i] for i in u) for u in units); acc = t0; out = []
    for u in units:
        d = (t1 - t0) * sum(wts[i] for i in u) / tot
        out.append((acc, acc + d)); acc += d
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("run")
    ap.add_argument("--voice", default="am_michael")
    ap.add_argument("--speed", type=float, default=1.1)
    ap.add_argument("--group", type=int, default=3, help="scenes read together as one paragraph")
    ap.add_argument("--gap", type=float, default=0.34, help="pause between paragraphs (s)")
    ap.add_argument("--tail", type=float, default=0.9, help="hold after the last word (s)")
    ap.add_argument("--lufs", type=float, default=-16.0)
    a = ap.parse_args()
    run = a.run.rstrip("/")
    lines = json.load(open(f"{run}/vo_lines.json"))
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(MODEL_DIR, "kokoro-v1.0.onnx"), os.path.join(MODEL_DIR, "voices-v1.0.bin"))
    sr = 24000
    chunks, t = [], 0.0
    scene_span = {}   # id -> (speech start, speech end) in take seconds
    words_abs = {}    # id -> [{text,start,end}]
    groups = [lines[i:i + a.group] for i in range(0, len(lines), a.group)]
    for gi, grp in enumerate(groups):
        say_all, show_all, owner = [], [], []
        for l in grp:
            sw, tw = l.get("say", l["text"]).split(), l["text"].split()
            if len(sw) != len(tw):
                sys.exit(f"{l['id']}: 'say' and 'text' must have the same word count")
            say_all += sw; show_all += tw; owner += [l["id"]] * len(sw)
        audio, sr = k.create(" ".join(say_all), voice=a.voice, speed=a.speed, lang="en-us")
        audio = trim(np.asarray(audio, dtype=np.float32), sr)
        dur = len(audio) / sr
        gaps = silences(audio, sr)
        wts = [weight(w) for w in say_all]
        sents = split_units(say_all, r"[.?!]$")
        s_spans = place(sents, wts, 0.0, dur, gaps)
        for su, (s0, s1) in zip(sents, s_spans):
            sub = [say_all[i] for i in su]
            phr = [[su[j] for j in u] for u in split_units(sub, r"[,;:]$")]
            for pu, (p0, p1) in zip(phr, place(phr, wts, s0, s1, gaps)):
                tot = sum(wts[i] for i in pu); acc = p0
                for i in pu:
                    d = (p1 - p0) * wts[i] / tot
                    words_abs.setdefault(owner[i], []).append({"text": show_all[i], "start": t + acc, "end": t + acc + d})
                    acc += d
        chunks.append(audio); t += dur
        if gi < len(groups) - 1:
            chunks.append(np.zeros(int(a.gap * sr), dtype=np.float32)); t += a.gap
        print(f"paragraph {gi + 1}: {' '.join(l['id'] for l in grp)}  {dur:.2f}s  pauses found {len(gaps)}", flush=True)
    chunks.append(np.zeros(int(a.tail * sr), dtype=np.float32)); total = t + a.tail
    full = np.concatenate(chunks)
    os.makedirs(f"{run}/audio/vo", exist_ok=True)
    out = f"{run}/audio/vo_full.wav"
    with tempfile.TemporaryDirectory() as td:
        raw, mid = os.path.join(td, "raw.wav"), os.path.join(td, "mid.wav")
        sf.write(raw, full, sr)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", POLISH, "-ar", "48000", "-ac", "1", mid], check=True)
        m = subprocess.run(["ffmpeg", "-i", mid, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", m)[-1])
        gain = a.lufs - I
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mid, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:attack=5:release=80:level=false",
                        "-ar", "48000", "-ac", "1", out], check=True)
    # scene boundaries: midway between one scene's last word and the next scene's first word; snapped to frames
    ids = [l["id"] for l in lines]
    cuts = [0.0]
    for x, y in zip(ids[:-1], ids[1:]):
        cuts.append((words_abs[x][-1]["end"] + words_abs[y][0]["start"]) / 2)
    cuts.append(total)
    fr = [round(c * FPS) for c in cuts]; fr[-1] = math.ceil(total * FPS)
    take = {"durationSec": round(total, 3), "voice": a.voice, "speed": a.speed, "scenes": []}
    for n, sid in enumerate(ids):
        start = fr[n] / FPS
        ws = [{"text": w["text"], "start": round(max(0, w["start"] - start), 3), "end": round(w["end"] - start, 3)} for w in words_abs[sid]]
        frames = fr[n + 1] - fr[n]
        json.dump({"durationSec": round(frames / FPS, 3), "words": ws}, open(f"{run}/audio/vo/{sid}.words.json", "w"), indent=1)
        take["scenes"].append({"id": sid, "startFrame": fr[n], "frames": frames, "startSec": round(start, 3)})
        pp = f"{run}/scenes/{sid}/props.json"
        if os.path.exists(pp):
            p = json.load(open(pp))
            p["durationInFrames"] = frames
            p.setdefault("vo", {}); p["vo"]["words"] = ws; p["vo"]["durationSec"] = round(frames / FPS, 3); p["vo"]["src"] = ""
            json.dump(p, open(pp, "w"), indent=1)
        print(f"{sid}: {frames} f  ({frames / FPS:.2f}s)  first word +{ws[0]['start']:.2f}s", flush=True)
    json.dump(take, open(f"{run}/audio/vo_take.json", "w"), indent=1)
    print(f"take {total:.2f}s  gain {gain:+.1f} dB  -> {out}")


if __name__ == "__main__":
    main()
