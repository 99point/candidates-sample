// Seeds the board: fixtures/seed.json into the data file, with dates counted from today so a fresh
// board always holds overdue, upcoming and finished work. scripts/setup.sh runs it; run it again to reset the board,
// with the server stopped: a running server writes the board it read at startup back at its next change.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { DEFAULT_DATA_FILE, loadEnvFile } from '../src/config.js';
import type { StoredBoard } from '../src/tasks/json-file-repository.js';
import { TASK_STATUSES, type Task } from '../src/tasks/task.js';

const seedSchema = z.array(
  z.object({
    title: z.string(),
    status: z.enum(TASK_STATUSES),
    owner: z.string().optional(),
    tags: z.array(z.string()),
    createdDaysAgo: z.number().int().nonnegative(),
    /** Negative when the due date has passed. */
    dueInDays: z.number().int().optional(),
    completedDaysAgo: z.number().int().nonnegative().optional(),
  }),
);

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysFromNow = (days: number) => new Date(now + days * DAY_MS);

loadEnvFile();
const file = process.env.DATA_FILE ?? DEFAULT_DATA_FILE;
const seed = seedSchema.parse(JSON.parse(await readFile('fixtures/seed.json', 'utf8')));
const tasks = seed
  .toSorted((a, b) => b.createdDaysAgo - a.createdDaysAgo)
  .map(
    (entry, index): Task => ({
      id: index + 1,
      title: entry.title,
      status: entry.status,
      ...(entry.dueInDays === undefined ? {} : { due: daysFromNow(entry.dueInDays).toISOString().slice(0, 10) }),
      ...(entry.owner === undefined ? {} : { owner: entry.owner }),
      tags: entry.tags,
      createdAt: daysFromNow(-entry.createdDaysAgo).toISOString(),
      ...(entry.completedDaysAgo === undefined ? {} : { completedAt: daysFromNow(-entry.completedDaysAgo).toISOString() }),
    }),
  );

const board: StoredBoard = { nextId: tasks.length + 1, tasks };
await mkdir(path.dirname(file), { recursive: true });
await writeFile(file, `${JSON.stringify(board, null, 2)}\n`);
console.log(`Seeded ${file} with ${tasks.length} tasks`);
