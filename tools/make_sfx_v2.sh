#!/usr/bin/env bash
# v2 sound kit: quieter, cinematic, documentary. All synthesised with ffmpeg = zero licensing risk.
#   brand/audio/sfx/v2/{sub_drop,tick,glint,type,whoosh_soft,air_rise,click,thud}.wav
#   brand/audio/music/bed_drone.wav   (120 s ambient bed in A minor; used under VO at tokens.audio.musicDb)
# Usage: bash tools/make_sfx_v2.sh
set -euo pipefail
cd "$(dirname "$0")/.."
S=brand/audio/sfx/v2; M=brand/audio/music; mkdir -p "$S" "$M"
f() { ffmpeg -loglevel error -y "$@"; }

# deep sub hit for reveals (felt more than heard)
f -f lavfi -i "sine=f=48:d=1.4" -af "volume=0.9,afade=t=in:d=0.005,afade=t=out:st=0.15:d=1.25,lowpass=f=120" -ar 48000 $S/sub_drop.wav
# soft mechanical tick for counters
f -f lavfi -i "anoisesrc=d=0.03:c=white:a=0.6" -af "highpass=f=2500,lowpass=f=7000,afade=t=out:d=0.03,volume=0.5" -ar 48000 $S/tick.wav
# glint / shimmer for specular sweeps and name cards
f -f lavfi -i "sine=f=2637:d=0.9" -f lavfi -i "sine=f=3951:d=0.9" -filter_complex "[0][1]amix=2,volume=0.25,afade=t=in:d=0.01,afade=t=out:st=0.05:d=0.85,aecho=0.8:0.6:60|120:0.3|0.2" -ar 48000 $S/glint.wav
# typewriter key
f -f lavfi -i "anoisesrc=d=0.025:c=pink:a=0.8" -af "bandpass=f=1800:w=900,afade=t=out:d=0.025,volume=0.7" -ar 48000 $S/type.wav
# soft whoosh for scene changes
f -f lavfi -i "anoisesrc=d=0.7:c=pink:a=0.5" -af "bandpass=f=900:w=1400,afade=t=in:d=0.35,afade=t=out:st=0.35:d=0.35,volume=0.6" -ar 48000 $S/whoosh_soft.wav
# airy riser into a reveal
f -f lavfi -i "anoisesrc=d=2.0:c=pink:a=0.4" -af "highpass=f=600,afade=t=in:d=1.8,afade=t=out:st=1.8:d=0.2,volume=0.55" -ar 48000 $S/air_rise.wav
# UI click (for the follow tap)
f -f lavfi -i "sine=f=1400:d=0.04" -af "afade=t=out:d=0.04,volume=0.5" -ar 48000 $S/click.wav
# low thud when a 3D object lands
f -f lavfi -i "sine=f=70:d=0.35" -af "afade=t=out:st=0.02:d=0.33,volume=0.8,lowpass=f=200" -ar 48000 $S/thud.wav

# ambient drone bed (A minor pad + filtered air), slow movement so it never feels looped
f -f lavfi -i "sine=f=110:d=120" -f lavfi -i "sine=f=164.81:d=120" -f lavfi -i "sine=f=220:d=120" -f lavfi -i "sine=f=261.63:d=120" -f lavfi -i "anoisesrc=d=120:c=brown:a=0.3" \
  -filter_complex "[0]volume=0.35,tremolo=f=0.13:d=0.3[a];[1]volume=0.22,tremolo=f=0.10:d=0.4[b];[2]volume=0.16,tremolo=f=0.17:d=0.5[c];[3]volume=0.10,tremolo=f=0.23:d=0.6[d];[4]lowpass=f=400,volume=0.5[e];[a][b][c][d][e]amix=5:normalize=0,lowpass=f=2200,aecho=0.8:0.7:500|900:0.35|0.25,afade=t=in:d=3,afade=t=out:st=116:d=4,loudnorm=I=-24" \
  -ar 48000 -ac 2 $M/bed_drone.wav
echo "v2 SFX + bed written"
