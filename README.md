# Taskboard

A team's task board in TypeScript: a [Hono](https://hono.dev) server with a JSON
API and server-rendered pages, a service layer that holds the board's rules, and
the tasks in a JSON file.

## Run

```bash
cp .env.example .env   # local settings
scripts/setup.sh       # installs the locked dependencies, seeds data/tasks.json
npm run dev            # http://localhost:3000 (PORT overrides), restarts on change
```

`npm run seed` resets the board: it writes `fixtures/seed.json` to the data file
with due dates counted from today.

## Check

```bash
npm test               # node:test, through tsx
npm run typecheck      # tsc
npm run lint           # oxlint
```

## Settings

The app reads its settings from the environment when it starts; `.env` fills in
whatever the environment leaves unset.

| Variable      | Default           | Used for                                 |
| ------------- | ----------------- | ---------------------------------------- |
| `ADMIN_TOKEN` | required          | bearer token for `DELETE /api/tasks/:id` |
| `APP_TITLE`   | `Taskboard`       | the board's name                         |
| `PORT`        | `3000`            | the HTTP port                            |
| `DATA_FILE`   | `data/tasks.json` | where the tasks are stored               |

## Layout

- `src/main.ts` starts the server; `src/config.ts` reads the settings.
- `src/app.ts` puts the app together: the API under `/api`, the pages, `public/`, errors.
- `src/http/` is the JSON API (`GET`/`POST /api/tasks`, `GET`/`PATCH`/`DELETE /api/tasks/:id`, `POST /api/tasks/:id/complete`).
- `src/web/` holds the pages: hono/jsx views and plain HTML forms, no client-side script.
- `src/tasks/` holds the task model, the `TaskService` and the repositories (JSON file, in memory).
- `test/` holds the node:test suites; they run the app in memory through `app.request()`.

This repository is the sample project of Candidates assessments: the assessment
provides the settings, runs `scripts/setup.sh` while provisioning and `npm run dev`
in the Dev server terminal, serving port 3000 through the preview link.
