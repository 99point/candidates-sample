import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { apiRoutes } from './http/api.js';
import type { TaskService } from './tasks/service.js';
import { webRoutes } from './web/routes.js';

export interface AppOptions {
  title: string;
  adminToken: string;
  service: TaskService;
}

/** The whole app: the JSON API under `/api`, the board's pages, and the files in `public/`. */
export function createApp({ title, adminToken, service }: AppOptions) {
  const app = new Hono();
  app.route('/api', apiRoutes(service, adminToken));
  app.route('/', webRoutes(service, title));
  app.use('/*', serveStatic({ root: 'public' }));
  app.notFound((c) => c.json({ error: 'not found' }, 404));
  app.onError((error, c) => {
    if (error instanceof HTTPException && error.cause instanceof z.ZodError) return c.json({ error: z.prettifyError(error.cause) }, 400);
    if (error instanceof HTTPException) return error.getResponse();
    console.error(error);
    return c.json({ error: 'something went wrong' }, 500);
  });
  return app;
}
