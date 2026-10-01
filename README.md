# Taskboard

A small task board: a dependency-free Node HTTP server (`src/server.js`), an
in-memory store (`src/store.js`), and a static UI (`public/`).

## Build and serve

```bash
scripts/setup.sh   # build: installs dependencies and seeds data/tasks.json
npm run dev        # serve: http://localhost:3000 (PORT overrides), restarts on change
npm test           # node --test
```

Setup copies the bundled `fixtures/tasks-large.json` to `data/tasks.json`; no
download or credentials are needed. Without setup, the app uses the smaller
`fixtures/tasks.json`. `APP_TITLE` sets the page title.

This repository is the sample project used by Candidates assessments: the
assessment runs `scripts/setup.sh` while provisioning and `npm run dev` in the
Dev server terminal, serving port 3000 through the preview link.
