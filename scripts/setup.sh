#!/usr/bin/env bash
# Build for a Candidates sandbox: install dependencies and seed repository-owned data.
set -euo pipefail
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund --no-package-lock
mkdir -p data
cp fixtures/tasks-large.json data/tasks.json
