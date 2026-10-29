#!/usr/bin/env python3
"""Free AI voiceover (Microsoft Edge neural voices via edge-tts, no API key).

Batch mode (what the director uses):
  python3 tools/tts.py --batch runs/<id>/vo_lines.json --outdir runs/<id>/audio/vo
  vo_lines.json = [{"id": "S01", "text": "..."}, ...]

Writes per line: <id>.mp3 and <id>.words.json  ({"durationSec": x, "words": [{text,start,end}]})
and prints a summary JSON of durations.

Recorded voice instead? Put <id>.wav (or .m4a/.mp3) named <id>.recorded.* in the same
folder and run tools/use_recorded_vo.py — it replaces the AI line for that scene.
"""
import argparse, asyncio, json, os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKENS = json.load(open(os.path.join(ROOT, "brand", "tokens.json")))
VOICE = TOKENS.get("voice", {}).get("edge", "en-AU-WilliamNeural")
RATE = TOKENS.get("voice", {}).get("rate", "+6%")
PITCH = TOKENS.get("voice", {}).get("pitch", "+0Hz")
POLISH = TOKENS.get("voice", {}).get("polish", True)
# v2 vocal chain: removes the "raw TTS" feel. Warmth, presence, de-ess, gentle compression, a very small
# room, loudness to tokens.audio.voiceLufs. Length is unchanged, so word timings stay exact.
CHAIN = ("highpass=f=70,lowshelf=g=2:f=160,equalizer=f=320:t=q:w=1.2:g=-2,equalizer=f=3600:t=q:w=1.4:g=2,"
         "deesser=i=0.35,acompressor=threshold=-20dB:ratio=3:attack=6:release=90:makeup=2,"
         "aecho=0.85:0.5:24|41:0.10|0.06,loudnorm=I={lufs}:TP=-1.5:LRA=7")


def polish(raw, mp3):
    """raw (temp file) -> mp3 (final). Never renames/deletes inside the project folder."""
    lufs = TOKENS.get("audio", {}).get("voiceLufs", -16)
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", CHAIN.format(lufs=lufs), "-ar", "48000", "-b:a", "192k", mp3])
    if r.returncode != 0:
        shutil.copyfile(raw, mp3)  # keep the unpolished take rather than fail the run


def probe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True,
    ).stdout.strip()
    return float(out) if out else 0.0


async def speak(text, mp3_path, voice, rate, pitch="+0Hz"):
    import edge_tts  # pip install edge-tts

    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary",
                                proxy=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or None)
    words = []
    with open(mp3_path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                end = start + chunk["duration"] / 1e7
                words.append({"text": chunk["text"], "start": round(start, 3), "end": round(end, 3)})
    return words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch")
    ap.add_argument("--text")
    ap.add_argument("--id", default="line")
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--voice", default=VOICE)
    ap.add_argument("--rate", default=RATE)
    ap.add_argument("--pitch", default=PITCH)
    ap.add_argument("--no-polish", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    lines = json.load(open(a.batch)) if a.batch else [{"id": a.id, "text": a.text}]
    summary = {}
    for ln in lines:
        mp3 = os.path.join(a.outdir, f"{ln['id']}.mp3")
        try:
            raw = os.path.join(tempfile.gettempdir(), f"dynk-tts-{os.getpid()}-{ln['id']}.mp3")
            words = asyncio.run(speak(ln["text"], raw, a.voice, a.rate, a.pitch))
            if POLISH and not a.no_polish:
                polish(raw, mp3)
            else:
                shutil.copyfile(raw, mp3)
        except Exception as e:  # network blocked or edge-tts missing
            print(f"edge-tts failed for {ln['id']}: {e}", file=sys.stderr)
            sys.exit(2)
        dur = probe_duration(mp3)
        json.dump({"durationSec": dur, "words": words, "text": ln["text"], "voice": a.voice},
                  open(os.path.join(a.outdir, f"{ln['id']}.words.json"), "w"), indent=1)
        summary[ln["id"]] = round(dur, 2)
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
