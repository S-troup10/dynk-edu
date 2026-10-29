#!/usr/bin/env bash
# Create a talking-head run. Usage: tools/talk/new_run.sh <short-topic-slug>
# Prints the run id (YYYY-MM-DD-talk-slug). Drop the take in runs/<id>/source/.
set -euo pipefail
cd "$(dirname "$0")/../.."
slug="${1:-untitled}"
slug="$(echo "$slug" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')"
id="$(date +%Y-%m-%d)-talk-$slug"
n=2; base="$id"
while [ -d "runs/$id" ]; do id="$base-$n"; n=$((n+1)); done
mkdir -p "runs/$id"/{source,work,review,final}
cat > "runs/$id/STATUS.md" <<EOF
# Run $id (talking head)
mode: talk
stage: script
gates: script=pending take=missing cut=pending
EOF
echo "$id"
