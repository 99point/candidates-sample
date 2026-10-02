import { Hono } from 'hono';
import { z } from 'zod';
import type { TaskService } from '../tasks/service.js';
import { newTaskSchema } from '../tasks/task.js';
import { Board, type AddFormValues } from './board.js';

/** The add form's fields as sent: a field left out is empty. */
const addFormValues = z.object({
  title: z.string().default(''),
  due: z.string().default(''),
  owner: z.string().default(''),
  tags: z.string().default(''),
}) satisfies z.ZodType<AddFormValues>;

/** The add form as a new task: empty fields are left out, tags are separated by commas. */
const addForm = addFormValues
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
      const body = await c.req.parseBody();
      const form = addForm.safeParse(body);
      if (!form.success) {
        const error = form.error.issues.map((issue) => issue.message).join('; ');
        // The form comes back as it was sent, to be corrected rather than typed again.
        return c.html(<Board title={title} tasks={await service.list()} error={error} values={addFormValues.safeParse(body).data} />, 400);
      }
      await service.create(form.data);
      return c.redirect('/', 303);
    })
    .post('/tasks/:id/complete', async (c) => {
      await service.complete(Number(c.req.param('id')));
      return c.redirect('/', 303);
    });
}
