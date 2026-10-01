import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { z } from 'zod';
import { storedTaskSchema } from '../src/tasks/task.js';
import { ADMIN_TOKEN, NOW, task, testBoard } from './support.js';

const json = (body: unknown) => ({ headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const errorBody = z.object({ error: z.string() });

describe('/api/tasks', () => {
  test('lists every task in id order', async () => {
    const { app } = testBoard([task({ id: 2, status: 'done' }), task({ id: 1 })]);
    const response = await app.request('/api/tasks');
    assert.equal(response.status, 200);
    assert.deepEqual(
      z
        .array(storedTaskSchema)
        .parse(await response.json())
        .map(({ id, status }) => [id, status]),
      [
        [1, 'open'],
        [2, 'done'],
      ],
    );
  });

  test('adds a task', async () => {
    const { app, service } = testBoard();
    const response = await app.request('/api/tasks', { method: 'POST', ...json({ title: '  Write the brief ', due: '2026-03-14', tags: ['Docs'] }) });
    assert.equal(response.status, 201);
    const created = { id: 1, title: 'Write the brief', due: '2026-03-14', tags: ['docs'], status: 'open', createdAt: NOW.toISOString() };
    assert.deepEqual(await response.json(), created);
    assert.deepEqual(await service.get(1), created);
  });

  test('refuses a task without a title or with a malformed due date, saying why', async () => {
    const { app, service } = testBoard();
    const refusal = async (body: unknown) => {
      const response = await app.request('/api/tasks', { method: 'POST', ...json(body) });
      assert.equal(response.status, 400);
      return errorBody.parse(await response.json()).error;
    };
    assert.match(await refusal({ title: ' ' }), /title is required/);
    assert.match(await refusal({ title: 'Ship', due: '14/03/2026' }), /due/);
    assert.deepEqual(await service.list(), []);
  });

  test('changes a task; null clears its due date', async () => {
    const { app } = testBoard([task({ id: 1, due: '2026-03-12' })]);
    const response = await app.request('/api/tasks/1', { method: 'PATCH', ...json({ due: null, owner: 'ana' }) });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), task({ id: 1, owner: 'ana' }));
  });

  test('completes a task', async () => {
    const { app } = testBoard([task({ id: 1 })]);
    const response = await app.request('/api/tasks/1/complete', { method: 'POST' });
    assert.equal(response.status, 200);
    assert.equal(storedTaskSchema.parse(await response.json()).status, 'done');
  });

  test('answers 404 for a task that does not exist and 400 for an id that is not one', async () => {
    const { app } = testBoard();
    assert.equal((await app.request('/api/tasks/9')).status, 404);
    assert.equal((await app.request('/api/tasks/9/complete', { method: 'POST' })).status, 404);
    assert.equal((await app.request('/api/tasks/nine')).status, 400);
  });

  test('removing a task takes the admin token', async () => {
    const { app, service } = testBoard([task({ id: 1 })]);
    const remove = (token?: string) => app.request('/api/tasks/1', { method: 'DELETE', headers: token === undefined ? {} : { authorization: `Bearer ${token}` } });
    assert.equal((await remove()).status, 401);
    assert.equal((await remove('wrong-token')).status, 401);
    assert.notEqual(await service.get(1), null);
    assert.equal((await remove(ADMIN_TOKEN)).status, 204);
    assert.equal(await service.get(1), null);
    assert.equal((await remove(ADMIN_TOKEN)).status, 404);
  });
});
