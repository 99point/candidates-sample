#!/usr/bin/env bash
# Build for a Candidates sandbox: install the locked dependencies and seed the board.
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --no-audit --no-fund
npm run seed
