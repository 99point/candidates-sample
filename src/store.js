import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Loads the data seeded by scripts/setup.sh, else the smaller bundled fixture. */
export function loadTasks() {
  const seeded = path.join(root, 'data', 'tasks.json');
  const fixture = path.join(root, 'fixtures', 'tasks.json');
  const file = fs.existsSync(seeded) ? seeded : fixture;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export class TaskStore {
  constructor(tasks = []) {
    this.tasks = new Map(tasks.map((task) => [task.id, { ...task }]));
    this.nextId = Math.max(0, ...tasks.map((task) => task.id)) + 1;
  }

  list() {
    return [...this.tasks.values()].sort((a, b) => a.id - b.id);
  }

  get(id) {
    return this.tasks.get(id) ?? null;
  }

  create({ title, due = null }) {
    if (typeof title !== 'string' || title.trim() === '') throw new Error('title is required');
    const task = { id: this.nextId++, title: title.trim(), status: 'open', due };
    this.tasks.set(task.id, task);
    return task;
  }

  complete(id) {
    const task = this.tasks.get(id);
    if (task === undefined) return null;
    const updated = { id: task.id, title: task.title, status: 'done' };
    this.tasks.set(id, updated);
    return updated;
  }

  remove(id) {
    return this.tasks.delete(id);
  }
}
