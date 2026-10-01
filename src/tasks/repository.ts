import type { Task } from './task.js';

/**
 * Where the board's tasks live. Every method hands out copies: changing a task
 * you were given changes nothing until you pass it to `update`.
 */
export interface TaskRepository {
  /** Every task, in id order. */
  all(): Promise<Task[]>;
  get(id: number): Promise<Task | null>;
  /** Stores a new task under the next id. */
  add(fields: Omit<Task, 'id'>): Promise<Task>;
  /** Replaces the stored task that has the same id. */
  update(task: Task): Promise<void>;
  /** Whether there was a task to remove. */
  remove(id: number): Promise<boolean>;
}

/** Tasks held in memory: what the tests use, and the cache behind the JSON file. */
export class MemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<number, Task>();
  private nextId: number;

  constructor(tasks: readonly Task[] = []) {
    for (const task of tasks) this.tasks.set(task.id, structuredClone(task));
    this.nextId = Math.max(0, ...this.tasks.keys()) + 1;
  }

  async all(): Promise<Task[]> {
    return [...this.tasks.values()].toSorted((a, b) => a.id - b.id).map((task) => structuredClone(task));
  }

  async get(id: number): Promise<Task | null> {
    const task = this.tasks.get(id);
    return task === undefined ? null : structuredClone(task);
  }

  async add(fields: Omit<Task, 'id'>): Promise<Task> {
    const task: Task = { id: this.nextId++, ...fields };
    this.tasks.set(task.id, structuredClone(task));
    return task;
  }

  async update(task: Task): Promise<void> {
    if (!this.tasks.has(task.id)) throw new Error(`there is no task ${task.id}`);
    this.tasks.set(task.id, structuredClone(task));
  }

  async remove(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
}
