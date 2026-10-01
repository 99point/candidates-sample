import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { z } from 'zod';
import type { TaskService } from '../tasks/service.js';
import { newTaskSchema, taskChangesSchema } from '../tasks/task.js';
import { validate } from './validate.js';

const taskId = z.object({ id: z.coerce.number().int().positive() });

/** The JSON API, mounted at `/api`. Removing a task takes the admin token as a bearer token. */
export function apiRoutes(service: TaskService, adminToken: string) {
  return new Hono()
    .get('/tasks', async (c) => c.json(await service.list()))
    .post('/tasks', validate('json', newTaskSchema), async (c) => c.json(await service.create(c.req.valid('json')), 201))
    .get('/tasks/:id', validate('param', taskId), async (c) => {
      const task = await service.get(c.req.valid('param').id);
      return task === null ? c.json({ error: 'task not found' }, 404) : c.json(task);
    })
    .patch('/tasks/:id', validate('param', taskId), validate('json', taskChangesSchema), async (c) => {
      const task = await service.update(c.req.valid('param').id, c.req.valid('json'));
      return task === null ? c.json({ error: 'task not found' }, 404) : c.json(task);
    })
    .post('/tasks/:id/complete', validate('param', taskId), async (c) => {
      const task = await service.complete(c.req.valid('param').id);
      return task === null ? c.json({ error: 'task not found' }, 404) : c.json(task);
    })
    .delete('/tasks/:id', bearerAuth({ token: adminToken }), validate('param', taskId), async (c) => {
      const removed = await service.remove(c.req.valid('param').id);
      return removed ? c.body(null, 204) : c.json({ error: 'task not found' }, 404);
    });
}
