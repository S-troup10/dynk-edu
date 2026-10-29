#!/usr/bin/env python3
"""Check the board director's edl.json against the house rules, resolve word anchors to
frames, stage media into the Remotion studio, and write the render props.

  python3 tools/talk/resolve_edl.py runs/<id>

Reads   runs/<id>/edl.json, work/words.json, work/seams.json, work/aroll.json
Writes  runs/<id>/work/props.json      (TalkVideo props)
        runs/<id>/work/edl-report.md   (errors, warnings, pacing stats)
Copies  aroll, sfx and any board images into studio/public/talk/<id>/
Exit 1 on errors (fix edl.json and run again). Warnings never block a render.
"""
import difflib, json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FPS = 30
FORMATS = {"vertical": (1080, 1920), "horizontal": (1920, 1080), "square": (1080, 1080)}
ELEMENT_TYPES = {"title", "text", "icon", "flow", "list", "compare", "stat", "strike", "image", "chips", "note", "clipping"}
BANNED = [r"\bexchange\b", r"\bmarketplace\b", r"\breturns?\b", r"\byield\b", r"\bAPY\b", r"\binvest", r"\bguarantee",
          r"passive income", r"to the moon", r"\bgains\b", r"\bjoin the waitlist\b"]
LEAD_EL = 3  # an element lands 3 frames before its word: the eye arrives as the ear does


def main():
    run = sys.argv[1].rstrip("/")
    rid = os.path.basename(os.path.abspath(run))
    work = os.path.join(run, "work")
    edl = json.load(open(os.path.join(run, "edl.json")))
    words = json.load(open(os.path.join(work, "words.json")))
    seams = json.load(open(os.path.join(work, "seams.json")))
    meta = json.load(open(os.path.join(work, "aroll.json")))
    icons = set(open(os.path.join(ROOT, "tools", "talk", "lucide-icons.txt")).read().split())
    tokens = json.load(open(os.path.join(ROOT, "brand", "tokens.json")))
    errors, warns = [], []
    N = len(words)
    dur_f = int(meta["durationSec"] * FPS)

    def wf(i, where, lead=LEAD_EL):
        if not isinstance(i, int) or i < 0 or i >= N:
            errors.append(f"{where}: word index {i!r} is not 0–{N-1}")
            return 0
        return max(0, int(round(words[i]["start"] * FPS)) - lead)

    def cut_f(i, mode):
        if i == 0:
            return 0
        w, p = words[i], words[i - 1]
        lead = 0.12 if mode in ("board", "split") else 0.05
        t = max(p["end"] - 0.02, w["start"] - lead)
        return int(round(min(t, w["start"]) * FPS))

    # ---------------- segments
    segs_in = edl.get("segments", [])
    if not segs_in:
        errors.append("no segments")
    if segs_in and segs_in[0].get("start") != 0:
        errors.append("first segment must start at word 0")
    segs = []
    for k, s in enumerate(segs_in):
        mode = s.get("mode")
        if mode not in ("face", "board", "split"):
            errors.append(f"segment {k}: mode must be face | board | split")
        if mode in ("board", "split") and s.get("board") not in edl.get("boards", {}):
            errors.append(f"segment {k}: board {s.get('board')!r} isn't defined in boards")
        if k and s.get("start", -1) <= segs_in[k - 1].get("start", -1):
            errors.append(f"segment {k}: start {s.get('start')} must be after the previous segment's start")
        z = s.get("zoom")
        if z is not None and not (1.0 <= z <= 1.45):
            warns.append(f"segment {k}: zoom {z} outside 1.0–1.45 (Simon's range for pushes)")
        o = {kk: v for kk, v in s.items() if kk not in ("start", "note")}
        o["fromF"] = cut_f(s.get("start", 0), mode) if isinstance(s.get("start"), int) and 0 <= s.get("start") < N else 0
        if not (isinstance(s.get("start"), int) and 0 <= s["start"] < N):
            errors.append(f"segment {k}: start word {s.get('start')!r} is not 0–{N-1}")
        o["startWord"] = s.get("start")
        segs.append(o)
    for k, o in enumerate(segs):
        o["toF"] = segs[k + 1]["fromF"] if k + 1 < len(segs) else dur_f
        if o["toF"] - o["fromF"] < 24:
            warns.append(f"segment {k} ({o['mode']} from word {o['startWord']}) is only {(o['toF']-o['fromF'])/FPS:.2f}s; min ~1.0s reads as a glitch")
    if segs and segs[0]["mode"] != "face" and not edl.get("visualHook"):
        warns.append("video doesn't open on the face — fine only if the hook is a visual (set \"visualHook\": true to silence)")
    if segs and segs[-1]["mode"] != "face":
        warns.append("video doesn't end on the face — CTAs land better to camera")

    # ---------------- boards
    boards_out = {}
    image_copies = []
    stage = os.path.join(ROOT, "studio", "public", "talk", rid)

    def check_icon(name, where):
        if name and name not in icons:
            sug = difflib.get_close_matches(name, icons, n=4, cutoff=0.5)
            errors.append(f"{where}: icon {name!r} doesn't exist (try: {', '.join(sug) or 'see tools/talk/lucide-icons.txt'})")

    def marks(lst, where):
        return [{"kind": m.get("kind", "circle"), "atF": wf(m.get("at"), f"{where} mark")} for m in (lst or [])]

    def text_checks(t, where):
        if not t:
            return
        for b in BANNED:
            if re.search(b, t, re.I):
                warns.append(f"{where}: “{t}” uses a banned/off-brand word ({b.strip(chr(92)+'b')})")
        if len(t) > 60:
            warns.append(f"{where}: {len(t)} chars of text — boards read at a glance, keep it under ~40")

    events = {}  # board id → list of frames where something new appears
    for bid, b in edl.get("boards", {}).items():
        els = []
        ev = []
        if len(b.get("elements", [])) > 6:
            warns.append(f"board {bid}: {len(b['elements'])} elements — more than ~5 crowds a phone screen; split into two boards")
        for j, e in enumerate(b.get("elements", [])):
            where = f"board {bid} element {j} ({e.get('type')})"
            t = e.get("type")
            if t not in ELEMENT_TYPES:
                errors.append(f"{where}: unknown type (use {', '.join(sorted(ELEMENT_TYPES))})")
                continue
            o = {k: v for k, v in e.items() if k not in ("at", "marks", "note")}
            if t in ("flow", "list", "chips", "compare"):
                first = None
            o["marks"] = marks(e.get("marks"), where)
            ev += [m["atF"] for m in o["marks"]]
            if t == "flow":
                o["nodes"] = []
                for n_i, n in enumerate(e.get("nodes", [])):
                    check_icon(n.get("icon"), f"{where} node {n_i}")
                    text_checks(n.get("label"), where)
                    nn = {k: v for k, v in n.items() if k not in ("at", "marks")}
                    nn["atF"] = wf(n.get("at"), f"{where} node {n_i}")
                    nn["marks"] = marks(n.get("marks"), where)
                    ev += [nn["atF"]] + [m["atF"] for m in nn["marks"]]
                    o["nodes"].append(nn)
                if len(o["nodes"]) > (3 if edl.get("format", "vertical") != "horizontal" else 4) and e.get("direction", "row") == "row":
                    warns.append(f"{where}: {len(o['nodes'])} nodes in a row is cramped — use direction: column or split it")
                o["atF"] = min([n["atF"] for n in o["nodes"]] or [0])
            elif t in ("list", "chips"):
                o["items"] = []
                for i_i, it in enumerate(e.get("items", [])):
                    text_checks(it.get("text"), where)
                    ii = {k: v for k, v in it.items() if k not in ("at", "marks")}
                    ii["atF"] = wf(it.get("at"), f"{where} item {i_i}")
                    ii["marks"] = marks(it.get("marks"), where)
                    ev += [ii["atF"]] + [m["atF"] for m in ii["marks"]]
                    o["items"].append(ii)
                o["atF"] = min([i["atF"] for i in o["items"]] or [0])
            elif t == "compare":
                for side in ("left", "right"):
                    sd = dict(e.get(side, {}))
                    check_icon(sd.get("icon"), f"{where} {side}")
                    text_checks(sd.get("title"), where)
                    sd["atF"] = wf(sd.pop("at", None), f"{where} {side}")
                    ev.append(sd["atF"])
                    if "verdictAt" in sd:
                        sd["verdictAtF"] = wf(sd.pop("verdictAt"), f"{where} {side} verdict")
                        ev.append(sd["verdictAtF"])
                    o[side] = sd
                o["atF"] = min(o["left"]["atF"], o["right"]["atF"])
            else:
                o["atF"] = wf(e.get("at"), where)
                ev.append(o["atF"])
                if t == "icon":
                    check_icon(e.get("icon"), where)
                if t in ("title", "text", "note"):
                    text_checks(e.get("text"), where)
                if t == "clipping":
                    text_checks(e.get("headline"), where)
                    if t == "title" and len(e.get("text", "").split()) > 7:
                        warns.append(f"{where}: title is {len(e['text'].split())} words — 2–6 is the sweet spot")
                if t == "strike":
                    for key in ("strikeAt", "afterAt"):
                        if key in e:
                            o[key + "F"] = wf(e[key], f"{where} {key}")
                            ev.append(o[key + "F"])
                if t == "image":
                    src = e.get("src", "")
                    cand = [os.path.join(run, src), os.path.join(ROOT, src), os.path.join(ROOT, "inbox", src)]
                    found = next((c for c in cand if os.path.isfile(c)), None)
                    if not found:
                        errors.append(f"{where}: image {src!r} not found (looked in the run folder, the pipeline folder and inbox/)")
                    else:
                        name = re.sub(r"[^A-Za-z0-9._-]", "_", os.path.basename(found))
                        image_copies.append((found, os.path.join(stage, "img", name)))
                        o["src"] = f"talk/{rid}/img/{name}"
            els.append(o)
        boards_out[bid] = {"label": b.get("label"), "theme": b.get("theme", "paper"), "elements": els}
        events[bid] = sorted(ev)

    # ---------------- pacing checks
    on_board = 0
    rehooks = 0
    for k, o in enumerate(segs):
        if o["mode"] in ("board", "split"):
            on_board += o["toF"] - o["fromF"]
            ev = [e for e in events.get(o.get("board"), []) if o["fromF"] - 2 <= e < o["toF"]]
            # first appearance of a board must put something up within ~0.6s
            prior = [e for e in events.get(o.get("board"), []) if e < o["fromF"] - 2]
            if not prior and (not ev or ev[0] - o["fromF"] > 18):
                warns.append(f"segment {k}: board {o['board']} sits blank for {((ev[0] if ev else o['toF']) - o['fromF'])/FPS:.1f}s after the cut")
            pts = [o["fromF"]] + ev + [o["toF"]]
            for a, b in zip(pts, pts[1:]):
                if b - a > 75:
                    warns.append(f"segment {k}: nothing new on board {o['board']} for {(b-a)/FPS:.1f}s ({a/FPS:.1f}–{b/FPS:.1f}s) — add a mark, item or cut to face")
        if o["mode"] == "face" and o.get("rehook"):
            rehooks += 1
    for bid, ev in events.items():
        shown = [(o["fromF"], o["toF"]) for o in segs if o.get("board") == bid]
        for e in ev:
            if not any(a - 2 <= e < b for a, b in shown):
                warns.append(f"board {bid}: something lands at {e/FPS:.2f}s while the board is off screen (it'll just be there next time)")
        for a, b in zip(ev, ev[1:]):
            if 0 < b - a < 10:
                warns.append(f"board {bid}: two things land {(b-a)/FPS:.2f}s apart at {a/FPS:.2f}s — give each ~0.4s")
    share = on_board / max(1, dur_f)
    if not 0.35 <= share <= 0.8:
        warns.append(f"board share is {share:.0%} of runtime — this style sits around 45–70%")
    if dur_f / FPS > 20 and rehooks == 0:
        warns.append("no rehook face returns — cut back to camera on the rehook line(s)")

    hook = edl.get("hook")
    hook_out = None
    if hook:
        if len(hook.get("text", "").split()) > 7:
            warns.append("hook text is over 7 words")
        text_checks(hook.get("text"), "hook")
        until = hook.get("until", 0)
        to_f = wf(until, "hook.until", lead=0) if until else min(dur_f, 3 * FPS)
        hook_out = {"text": hook["text"], "accent": hook.get("accent", []), "fromF": wf(hook["from"], "hook.from", lead=0) if "from" in hook else 0, "toF": to_f}

    fmt = edl.get("format", "vertical")
    if fmt not in FORMATS:
        errors.append("format must be vertical | horizontal | square")
        fmt = "vertical"
    W, H = FORMATS[fmt]
    safe = tokens["video"]["safeZone"] if fmt == "vertical" else {"top": 70, "bottom": 70, "left": 90, "right": 90}

    # ---------------- report
    face_holds = [(o["toF"] - o["fromF"]) / FPS for o in segs if o["mode"] == "face"]
    rep = [f"# EDL report — {rid}", "",
           f"- Length {dur_f/FPS:.1f}s · {len(segs)} segments · board share {share:.0%} · rehook returns {rehooks} · jump cuts {len(seams)}",
           f"- Face holds: {', '.join(f'{x:.1f}s' for x in face_holds)}", "",
           "## Timeline"]
    for k, o in enumerate(segs):
        w0 = o["startWord"]
        line = " ".join(w["text"] for w in words if o["fromF"] <= w["start"] * FPS < o["toF"])
        rep.append(f"{k:>2}. {o['fromF']/FPS:5.1f}–{o['toF']/FPS:5.1f}s  {o['mode'].upper():5} {o.get('board') or ''}"
                   f"{' (rehook)' if o.get('rehook') else ''}{' +pip' if o.get('pip') else ''}  — “{line[:90]}”")
    rep += ["", f"## Errors ({len(errors)})"] + [f"- {e}" for e in errors] + ["", f"## Warnings ({len(warns)})"] + [f"- {w}" for w in warns]
    open(os.path.join(work, "edl-report.md"), "w").write("\n".join(rep) + "\n")
    print("\n".join(rep))
    if errors:
        sys.exit(1)

    # ---------------- stage media + props
    os.makedirs(os.path.join(stage, "img"), exist_ok=True)
    shutil.copy2(os.path.join(work, "aroll.mp4"), os.path.join(stage, "aroll.mp4"))
    sfx_dst = os.path.join(ROOT, "studio", "public", "talk", "sfx")
    os.makedirs(sfx_dst, exist_ok=True)
    for fn in os.listdir(os.path.join(ROOT, "brand", "audio", "sfx")):
        if fn.endswith(".wav"):
            shutil.copy2(os.path.join(ROOT, "brand", "audio", "sfx", fn), os.path.join(sfx_dst, fn))
    for a, b in image_copies:
        shutil.copy2(a, b)

    props = {
        "runId": rid, "style": edl.get("style", "paper"), "format": fmt, "width": W, "height": H, "fps": FPS, "durationInFrames": dur_f,
        "aroll": f"talk/{rid}/aroll.mp4",
        "words": [dict(w, f0=int(round(w["start"] * FPS)), f1=int(round(w["end"] * FPS))) for w in words],
        "seamsF": [int(round(s * FPS)) for s in seams],
        "face": edl.get("face", {"x": 0.5, "y": 0.4}),
        "captions": edl.get("captions", "face"), "sfx": edl.get("sfx", "full"),
        "hook": hook_out, "boards": boards_out, "segments": segs, "safe": safe,
    }
    json.dump(props, open(os.path.join(work, "props.json"), "w"))
    print(f"\nOK → {work}/props.json")


if __name__ == "__main__":
    main()
