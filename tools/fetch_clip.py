#!/usr/bin/env python3
"""Find and cut short real-world clips (interviews, news) for cold opens. Uses yt-dlp.

  search     python3 tools/fetch_clip.py search "larry fink tokenization interview" [--n 8]
  transcript python3 tools/fetch_clip.py transcript <url> [--grep "tokeniz"]   # timestamped auto-captions
  get        python3 tools/fetch_clip.py get <url> --start 20.5 --dur 2.5 --out runs/<id>/clips/C01.mp4
                 [--x 0.5] [--keep-audio] [--full]   # --x = horizontal crop centre 0..1 (face position)
  sheet      python3 tools/fetch_clip.py sheet runs/<id>/clips/C01.mp4                  # frames to look at

House rules (see CLAUDE.md): clips are 0.8-3 s each, at most ~8 s of third-party footage per video, from
public interviews/news, always credited in the caption (credits.md is written for you). Never use a clip to
put words in someone's mouth: the clip must show what the person actually said or did.
Output of `get`: 1080x1920 30fps H.264, cropped vertical (or --full = letterboxed 16:9 inside 9:16).
If YouTube asks "confirm you're not a bot", the tool retries with your Chrome cookies.
"""
import argparse, json, os, re, subprocess, sys, tempfile, glob

YT = [sys.executable, "-m", "yt_dlp", "--js-runtimes", "node", "--no-warnings"]
# HLS (m3u8) formats cut cleanly with --download-sections; DASH sometimes returns audio only.
FMT = "270+140/232+140/bv*[protocol^=m3u8][height<=1080]+ba/bv*[height<=1080]+ba/b"
NEWS = ["cnbc", "euronews", "ap archive", "associated press", "afp", "sky news", "al jazeera", "dw news", "nhk", "bloomberg", "yahoo finance", "fox business", "cnn", "bbc", "reuters", "wall street journal", "wsj", "60 minutes", "cbs", "abc news", "nbc", "financial times", "the economist", "pbs", "ted"]


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def yt(args, cookies=False):
    r = run(YT + (["--cookies-from-browser", "chrome"] if cookies else []) + args)
    if r.returncode != 0 and not cookies and ("confirm you" in r.stderr or "Sign in" in r.stderr):
        print("YouTube bot check: retrying with Chrome cookies...", file=sys.stderr)
        return yt(args, cookies=True)
    return r


def cmd_search(a):
    r = yt(["--flat-playlist", "-J", f"ytsearch{a.n}:{a.query}"])
    if r.returncode != 0:
        sys.exit(r.stderr[-800:])
    rows = []
    for e in json.loads(r.stdout).get("entries", []):
        ch = (e.get("channel") or e.get("uploader") or "")
        rows.append({"url": f"https://www.youtube.com/watch?v={e['id']}", "title": e.get("title"), "channel": ch,
                     "durationSec": e.get("duration"), "views": e.get("view_count"),
                     "reputableNews": any(n in ch.lower() for n in NEWS)})
    rows.sort(key=lambda x: (not x["reputableNews"], -(x["views"] or 0)))
    print(json.dumps(rows, indent=2))


def vtt_lines(path):
    out, t = [], None
    for line in open(path, encoding="utf-8", errors="ignore"):
        m = re.match(r"(\d+):(\d+):(\d+)\.(\d+) -->", line)
        if m:
            h, mi, s, ms = map(int, m.groups()); t = h * 3600 + mi * 60 + s + ms / 1000; continue
        txt = re.sub(r"<[^>]+>", "", line).strip()
        if t is not None and txt and not txt.startswith(("WEBVTT", "Kind:", "Language:")):
            if not out or out[-1][1] != txt:
                out.append((round(t, 2), txt))
    return out


def cmd_transcript(a):
    with tempfile.TemporaryDirectory() as d:
        r = yt(["--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en.*,en", "--sub-format", "vtt", "-o", f"{d}/s.%(ext)s", a.url])
        files = glob.glob(f"{d}/*.vtt")
        if not files:
            sys.exit("No English captions found. " + r.stderr[-400:])
        for t, txt in vtt_lines(files[0]):
            if not a.grep or re.search(a.grep, txt, re.I):
                print(f"{t:8.2f}  {txt}")


def cmd_get(a):
    out = os.path.abspath(a.out); os.makedirs(os.path.dirname(out), exist_ok=True)
    meta = yt(["-J", "--skip-download", a.url])
    info = json.loads(meta.stdout) if meta.returncode == 0 else {}
    with tempfile.TemporaryDirectory() as d:
        pad = 0.4  # grab a little extra so the re-encode cut is frame-accurate
        s0 = max(0, a.start - pad)
        r = yt(["-f", FMT, "--download-sections", f"*{s0}-{a.start + a.dur + pad}", "-o", f"{d}/raw.%(ext)s", a.url])
        raws = glob.glob(f"{d}/raw.*")
        if not raws:
            sys.exit("Download failed: " + r.stderr[-800:])
        raw = raws[0]
        has_video = lambda f: "video" in run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=codec_type", "-of", "csv=p=0", f]).stdout
        if not has_video(raw):
            # Some videos only offer DASH formats, which can't be cut remotely past the first segment.
            # Fall back to the whole video (cached, these are short news clips) and cut locally.
            vid = info.get("id") or re.sub(r"\W", "", a.url)[-11:]
            cache = os.path.join(os.path.expanduser("~"), ".cache", "dynk-clips"); os.makedirs(cache, exist_ok=True)
            full = glob.glob(os.path.join(cache, vid + ".*"))
            if not full:
                if (info.get("duration") or 0) > 1800:
                    sys.exit("Video is over 30 min and YouTube served no video for this section. Pick a shorter source.")
                print("Section came back audio-only: downloading the full video once and cutting locally...", file=sys.stderr)
                r = yt(["-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--merge-output-format", "mp4", "-o", os.path.join(cache, vid + ".%(ext)s"), a.url])
                full = glob.glob(os.path.join(cache, vid + ".*"))
            if not full or not has_video(full[0]):
                sys.exit("Got audio only (YouTube served no video). Try another URL. " + (r.stderr[-300:] if r else ""))
            raw, s0 = full[0], 0.0
        if a.full:
            vf = "scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black"
        else:
            vf = f"scale=-2:1920,crop=1080:1920:(iw-1080)*{a.x}:0"
        vf += ",fps=30,format=yuv420p"
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(a.start - s0), "-i", raw, "-t", str(a.dur), "-vf", vf,
               "-c:v", "libx264", "-crf", "17", "-preset", "veryfast"]
        cmd += ["-c:a", "aac", "-b:a", "160k", "-ar", "48000"] if a.keep_audio else ["-an"]
        cmd += ["-movflags", "+faststart", out]
        e = run(cmd)
        if e.returncode != 0:
            sys.exit(e.stderr[-600:])
    credit = {"file": os.path.relpath(out), "url": a.url, "title": info.get("title"), "channel": info.get("channel") or info.get("uploader"),
              "uploadDate": info.get("upload_date"), "startSec": a.start, "durSec": a.dur}
    json.dump(credit, open(out + ".json", "w"), indent=2)
    cdir = os.path.dirname(out)
    with open(os.path.join(cdir, "credits.md"), "a") as f:
        f.write(f"- {os.path.basename(out)}: {credit['channel']} — \"{credit['title']}\" ({a.url}&t={int(a.start)}s)\n")
    print(json.dumps(credit))


def cmd_sheet(a):
    here = os.path.dirname(os.path.abspath(__file__))
    outdir = os.path.splitext(a.file)[0] + "_frames"
    subprocess.run(["bash", os.path.join(here, "review_frames.sh"), a.file, outdir, "0.5"])
    print(os.path.join(outdir, "contact_sheet.jpg"))


p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
sp = p.add_subparsers(dest="cmd", required=True)
s = sp.add_parser("search"); s.add_argument("query"); s.add_argument("--n", type=int, default=8); s.set_defaults(f=cmd_search)
s = sp.add_parser("transcript"); s.add_argument("url"); s.add_argument("--grep"); s.set_defaults(f=cmd_transcript)
s = sp.add_parser("get"); s.add_argument("url"); s.add_argument("--start", type=float, required=True); s.add_argument("--dur", type=float, default=2.0)
s.add_argument("--out", required=True); s.add_argument("--x", type=float, default=0.5); s.add_argument("--keep-audio", action="store_true"); s.add_argument("--full", action="store_true"); s.set_defaults(f=cmd_get)
s = sp.add_parser("sheet"); s.add_argument("file"); s.set_defaults(f=cmd_sheet)
a = p.parse_args(); a.f(a)
