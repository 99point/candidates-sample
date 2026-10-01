import { createApp } from '../src/app.js';
import { MemoryTaskRepository } from '../src/tasks/repository.js';
import { TaskService } from '../src/tasks/service.js';
import type { Task } from '../src/tasks/task.js';

export const ADMIN_TOKEN = 'test-admin-token';
/** The tests' clock never moves. */
export const NOW = new Date('2026-03-10T09:30:00.000Z');

/** A task, with defaults for whatever `fields` leaves out. */
export function task(fields: Partial<Task> & Pick<Task, 'id'>): Task {
  return { title: `Task ${fields.id}`, status: 'open', tags: [], createdAt: '2026-03-01T08:00:00.000Z', ...fields };
}

/** The app over an in-memory board holding `tasks`, at `NOW`. */
export function testBoard(tasks: Task[] = []) {
  const repository = new MemoryTaskRepository(tasks);
  const service = new TaskService(repository, () => NOW);
  const app = createApp({ title: 'Team board', adminToken: ADMIN_TOKEN, service });
  return { app, service, repository };
}
