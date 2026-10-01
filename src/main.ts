import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { loadConfig, loadEnvFile } from './config.js';
import { JsonFileTaskRepository } from './tasks/json-file-repository.js';
import { TaskService } from './tasks/service.js';

loadEnvFile();
const config = loadConfig(process.env);
const service = new TaskService(await JsonFileTaskRepository.open(config.dataFile));
const app = createApp({ title: config.title, adminToken: config.adminToken, service });

serve({ fetch: app.fetch, port: config.port }, ({ port }) => {
  console.log(`${config.title} listening on http://localhost:${port}`);
});
