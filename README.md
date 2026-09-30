# Taskboard

A small task board: a dependency-free Node HTTP server (`src/server.js`), an
in-memory store (`src/store.js`), and a static UI (`public/`).

```bash
npm run dev    # http://localhost:3000, restarts on change
npm test       # node --test
```

Data: `data/tasks.json` when present (loaded at setup), otherwise
`fixtures/tasks.json`. `APP_TITLE` sets the page title.

This repository is the sample project used by Candidates assessments.
