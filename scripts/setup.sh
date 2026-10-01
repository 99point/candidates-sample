#!/usr/bin/env bash
# Build for a Candidates sandbox: run from the repository root after the environment and data are in place.
set -euo pipefail
cd "$(dirname "$0")/.."
npm install --no-audit --no-fund --no-package-lock
