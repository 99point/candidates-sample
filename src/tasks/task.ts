import { z } from 'zod';

export const TASK_STATUSES = ['open', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  /** The day the task is due, `YYYY-MM-DD`. */
  due?: string;
  /** Who is on it. */
  owner?: string;
  tags: string[];
  /** ISO timestamp. */
  createdAt: string;
  /** ISO timestamp, once the task is done. */
  completedAt?: string;
}

const title = z.string().trim().min(1, 'title is required').max(200);
const day = z.iso.date();
const owner = z.string().trim().min(1).max(60);
const tags = z.array(z.string().trim().toLowerCase().min(1).max(30)).max(8);

/** What a client sends to add a task. */
export const newTaskSchema = z.object({
  title,
  due: day.optional(),
  owner: owner.optional(),
  tags: tags.default([]),
});
export type NewTask = z.infer<typeof newTaskSchema>;

/** What a client sends to change a task: the fields to change; `null` clears the due date or the owner. */
export const taskChangesSchema = z.object({
  title: title.optional(),
  due: day.nullable().optional(),
  owner: owner.nullable().optional(),
  tags: tags.optional(),
});
export type TaskChanges = z.infer<typeof taskChangesSchema>;

/** A task as the data file stores it. */
export const storedTaskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  status: z.enum(TASK_STATUSES),
  due: day.optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.iso.datetime(),
  completedAt: z.iso.datetime().optional(),
}) satisfies z.ZodType<Task>;
