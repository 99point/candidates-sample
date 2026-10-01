import type { TaskRepository } from './repository.js';
import type { NewTask, Task, TaskChanges } from './task.js';

/** The board's rules for adding, changing and completing tasks. */
export class TaskService {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** Every task on the board, oldest first. */
  list(): Promise<Task[]> {
    return this.tasks.all();
  }

  get(id: number): Promise<Task | null> {
    return this.tasks.get(id);
  }

  create(fields: NewTask): Promise<Task> {
    return this.tasks.add({ ...fields, status: 'open', createdAt: this.now().toISOString() });
  }

  /** Applies `changes` to a task; a `null` due date or owner clears it. */
  async update(id: number, changes: TaskChanges): Promise<Task | null> {
    const task = await this.tasks.get(id);
    if (task === null) return null;
    const { due, owner, ...rest } = changes;
    const updated: Task = { ...task, ...rest };
    if (due === null) delete updated.due;
    else if (due !== undefined) updated.due = due;
    if (owner === null) delete updated.owner;
    else if (owner !== undefined) updated.owner = owner;
    await this.tasks.update(updated);
    return updated;
  }

  remove(id: number): Promise<boolean> {
    return this.tasks.remove(id);
  }

  /** Marks a task done; a task that is already done stays as it is. */
  async complete(id: number): Promise<Task | null> {
    const task = await this.tasks.get(id);
    if (task === null || task.status === 'done') return task;
    const completedAt = this.now().toISOString();
    const done: Task = { id: task.id, title: task.title, status: 'done', owner: task.owner, tags: task.tags, createdAt: task.createdAt, completedAt };
    await this.tasks.update(done);
    return done;
  }
}
