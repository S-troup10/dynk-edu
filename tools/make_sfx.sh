#!/usr/bin/env bash
# Generate a starter royalty-free SFX kit (synthesised, so zero licensing questions).
# Drop better ones into brand/audio/sfx/ any time — the director lists that folder.
set -euo pipefail
D="$(cd "$(dirname "$0")/.." && pwd)/brand/audio/sfx"; mkdir -p "$D"
f() { ffmpeg -v error -y -f lavfi "$@"; }
# whoosh: filtered noise sweep
f -i "anoisesrc=d=0.45:c=pink:a=0.6" -af "highpass=f=300,lowpass=f=5000,afade=t=in:d=0.18,afade=t=out:st=0.2:d=0.25,volume=1.6" "$D/whoosh.wav"
# pop: short sine blip
f -i "sine=f=880:d=0.08" -af "afade=t=out:st=0.02:d=0.06,volume=0.9" "$D/pop.wav"
# click/tap
f -i "sine=f=2400:d=0.03" -af "afade=t=out:st=0.005:d=0.025" "$D/tap.wav"
# bass hit (rehook impact)
f -i "sine=f=55:d=0.6" -af "afade=t=out:st=0.05:d=0.55,volume=3" "$D/bass_hit.wav"
# riser
f -i "anoisesrc=d=1.2:c=white:a=0.4" -af "highpass=f=800,afade=t=in:d=1.1,afade=t=out:st=1.1:d=0.1" "$D/riser.wav"
# ding (notification-ish)
f -i "sine=f=1318:d=0.35" -af "afade=t=out:st=0.05:d=0.3,volume=0.7" "$D/ding.wav"
ls "$D"
