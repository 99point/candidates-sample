import { Hono } from 'hono';
import { z } from 'zod';
import type { TaskService } from '../tasks/service.js';
import { newTaskSchema } from '../tasks/task.js';
import { Board } from './board.js';

/** The add form as a new task: empty fields are left out, tags are separated by commas. */
const addForm = z
  .object({ title: z.string().default(''), due: z.string().default(''), owner: z.string().default(''), tags: z.string().default('') })
  .transform(({ title, due, owner, tags }): z.input<typeof newTaskSchema> => ({
    title,
    ...(due === '' ? {} : { due }),
    ...(owner.trim() === '' ? {} : { owner }),
    tags: tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== ''),
  }))
  .pipe(newTaskSchema);

/** The board's pages: HTML rendered on the server, and plain forms that post and come back to the board. */
export function webRoutes(service: TaskService, title: string) {
  return new Hono()
    .get('/', async (c) => c.html(<Board title={title} tasks={await service.list()} />))
    .post('/tasks', async (c) => {
      const form = addForm.safeParse(await c.req.parseBody());
      if (!form.success) {
        const error = form.error.issues.map((issue) => issue.message).join('; ');
        return c.html(<Board title={title} tasks={await service.list()} error={error} />, 400);
      }
      await service.create(form.data);
      return c.redirect('/', 303);
    })
    .post('/tasks/:id/complete', async (c) => {
      await service.complete(Number(c.req.param('id')));
      return c.redirect('/', 303);
    });
}
