import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { z } from 'zod';

/** Validates one part of the request against `schema`; a request that fails it is answered 400 with the reasons (see app.ts). */
export function validate<Schema extends z.ZodType, Target extends keyof ValidationTargets>(target: Target, schema: Schema) {
  return zValidator(target, schema, (result) => {
    if (!result.success) throw new HTTPException(400, { cause: result.error });
  });
}
