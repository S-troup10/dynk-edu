#!/usr/bin/env python3
"""AI hero shots in the house look, for objects the procedural 3D kit can't build (a city skyline, a
1960s stock certificate, a server room, a specific landmark...). Optional: the pipeline runs without it.

  python3 tools/gen_image.py --prompt "a 1968 paper stock certificate on a desk" --out runs/<id>/images/S03-cert.png
        [--tone dark|light] [--aspect 9:16|1:1] [--accent "the wax seal"] [--provider gemini|openai] [--n 2]

Keys (set ONE in your shell, e.g. in ~/.zshrc):  GEMINI_API_KEY  (Gemini 2.5 Flash Image, "Nano Banana")
                                                 OPENAI_API_KEY  (gpt-image-1)
No key -> exits 3 with a message; the director then falls back to the 3D kit.

Every prompt is wrapped in the style lock below so images match the Remotion 3D scenes: greyscale studio
render, chrome/clay/graphite materials, seamless backdrop, soft top light, ONE orange (#FF8000) accent.
Use the output with <Footage src=... bw={false} push={0.06} /> or as a background plate behind 3D.
Never generate real people's faces, logos or brand marks: use real footage/photos for real people.
"""
import argparse, base64, json, os, sys, urllib.request

STYLE = {
    "dark": "seamless matte charcoal backdrop (#0B0B0B) fading to black, soft overhead softbox light, subtle floor reflection",
    "light": "seamless pale grey studio backdrop (#E7E7E4), soft overhead softbox light, gentle contact shadow",
}
LOCK = ("Minimal 3D studio render, product-photography style. Strictly monochrome greyscale: brushed chrome, matte white clay "
        "and graphite materials only. {bg}. Centered single subject with generous empty space above for captions, vertical "
        "composition. {accent} Photoreal materials, crisp bevels, physically based lighting, shallow depth of field, no text, "
        "no logos, no watermark, no people's faces, no extra colours. Subject: {prompt}")


def build(a):
    acc = f"Exactly one element in saturated orange #FF8000: {a.accent}. Everything else greyscale." if a.accent else "No colour at all."
    return LOCK.format(bg=STYLE[a.tone], accent=acc, prompt=a.prompt)


def post(url, body, headers):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", **headers})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read())


def gemini(prompt, a):
    key = os.environ["GEMINI_API_KEY"]
    model = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
    body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": a.aspect}}}
    r = post(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", body, {"x-goog-api-key": key})
    for c in r.get("candidates", []):
        for p in c.get("content", {}).get("parts", []):
            d = p.get("inlineData") or p.get("inline_data")
            if d:
                return base64.b64decode(d["data"])
    raise RuntimeError("no image in response: " + json.dumps(r)[:400])


def openai(prompt, a):
    key = os.environ["OPENAI_API_KEY"]
    size = {"9:16": "1024x1536", "1:1": "1024x1024"}[a.aspect]
    r = post("https://api.openai.com/v1/images/generations", {"model": os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1"), "prompt": prompt, "size": size, "n": 1},
             {"Authorization": f"Bearer {key}"})
    return base64.b64decode(r["data"][0]["b64_json"])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--prompt", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--tone", choices=["dark", "light"], default="dark"); ap.add_argument("--aspect", choices=["9:16", "1:1"], default="9:16")
    ap.add_argument("--accent"); ap.add_argument("--provider", choices=["gemini", "openai"]); ap.add_argument("--n", type=int, default=1)
    a = ap.parse_args()
    prov = a.provider or ("gemini" if os.environ.get("GEMINI_API_KEY") else "openai" if os.environ.get("OPENAI_API_KEY") else None)
    if not prov:
        print("No GEMINI_API_KEY or OPENAI_API_KEY set: skip AI images and build this shot with the 3D kit.", file=sys.stderr); sys.exit(3)
    prompt = build(a)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    base, ext = os.path.splitext(a.out)
    outs = []
    for i in range(a.n):
        path = a.out if a.n == 1 else f"{base}-{i + 1}{ext}"
        data = (gemini if prov == "gemini" else openai)(prompt, a)
        open(path, "wb").write(data); outs.append(path)
    json.dump({"provider": prov, "prompt": prompt, "files": outs}, open(base + ".prompt.json", "w"), indent=2)
    print(json.dumps({"files": outs, "provider": prov}))


if __name__ == "__main__":
    main()
