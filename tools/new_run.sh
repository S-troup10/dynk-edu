#!/usr/bin/env bash
# Create a new run folder. Usage: tools/new_run.sh <short-topic-slug>
# Prints the run id (YYYY-MM-DD-slug).
set -euo pipefail
cd "$(dirname "$0")/.."
slug="${1:-untitled}"
slug="$(echo "$slug" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-|-$//g')"
id="$(date +%Y-%m-%d)-$slug"
n=2; base="$id"
while [ -d "runs/$id" ]; do id="$base-$n"; n=$((n+1)); done
mkdir -p "runs/$id"/{audio/vo,captures,scenes,renders,review,final}
cat > "runs/$id/STATUS.md" <<EOF
# Run $id
loop: 0 / 2
stage: brain
gates: topic=pending script=pending
EOF
echo "$id"
