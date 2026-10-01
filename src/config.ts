import { existsSync } from 'node:fs';
import { z } from 'zod';

export const DEFAULT_DATA_FILE = 'data/tasks.json';

const ADMIN_TOKEN_REQUIRED = 'set ADMIN_TOKEN to a secret of at least 12 characters';

const settingsSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  APP_TITLE: z.string().trim().min(1).default('Taskboard'),
  ADMIN_TOKEN: z.string({ error: ADMIN_TOKEN_REQUIRED }).min(12, ADMIN_TOKEN_REQUIRED),
  DATA_FILE: z.string().min(1).default(DEFAULT_DATA_FILE),
});

/** The app's settings, read from the environment at startup. */
export interface Config {
  port: number;
  /** The board's name, shown on every page. */
  title: string;
  /** Bearer token for the API's admin operations. */
  adminToken: string;
  /** Where the tasks are stored. */
  dataFile: string;
}

/** Adds the variables of `file` (when it exists) to the environment; variables already set win. */
export function loadEnvFile(file = '.env'): void {
  if (existsSync(file)) process.loadEnvFile(file);
}

/** The settings in `env`; throws with every problem at once. */
export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const parsed = settingsSchema.safeParse(env);
  if (!parsed.success) throw new Error(`Invalid settings:\n${z.prettifyError(parsed.error)}`);
  const { PORT, APP_TITLE, ADMIN_TOKEN, DATA_FILE } = parsed.data;
  return { port: PORT, title: APP_TITLE, adminToken: ADMIN_TOKEN, dataFile: DATA_FILE };
}
