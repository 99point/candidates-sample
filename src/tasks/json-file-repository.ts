import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { MemoryTaskRepository } from './repository.js';
import { storedTaskSchema, type Task } from './task.js';

/** The board's tasks in one JSON file: read once when the app starts, written back after every change. */
export class JsonFileTaskRepository extends MemoryTaskRepository {
  /** The latest write, settled or not. */
  private writing: Promise<void> = Promise.resolve();

  private constructor(
    private readonly file: string,
    tasks: Task[],
  ) {
    super(tasks);
  }

  /** Opens `file`; a file that does not exist yet is an empty board. */
  static async open(file: string): Promise<JsonFileTaskRepository> {
    return new JsonFileTaskRepository(file, await readTasks(file));
  }

  override async add(fields: Omit<Task, 'id'>): Promise<Task> {
    const task = await super.add(fields);
    await this.write();
    return task;
  }

  override async update(task: Task): Promise<void> {
    await super.update(task);
    await this.write();
  }

  override async remove(id: number): Promise<boolean> {
    const removed = await super.remove(id);
    if (removed) await this.write();
    return removed;
  }

  /** Saves the board once the write before it has finished, so writes land in order. */
  private write(): Promise<void> {
    const write = this.writing.then(() => this.replaceFile());
    this.writing = write.catch(() => undefined);
    return write;
  }

  /** Replaces the file through a temporary one, so a crash never leaves it half written. */
  private async replaceFile(): Promise<void> {
    const temporary = `${this.file}.tmp`;
    await mkdir(path.dirname(this.file), { recursive: true });
    await writeFile(temporary, `${JSON.stringify(await this.all(), null, 2)}\n`);
    await rename(temporary, this.file);
  }
}

async function readTasks(file: string): Promise<Task[]> {
  let text: string;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
  const parsed = z.array(storedTaskSchema).safeParse(JSON.parse(text));
  if (!parsed.success) throw new Error(`${file} does not hold a list of tasks:\n${z.prettifyError(parsed.error)}`);
  return parsed.data;
}
