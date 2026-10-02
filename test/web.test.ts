import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { NOW, task, testBoard } from './support.js';

const form = (fields: Record<string, string>) => ({ method: 'POST', body: new URLSearchParams(fields) });

describe('the board', () => {
  test('shows its title and every task', async () => {
    const { app } = testBoard([task({ id: 1, title: 'Draft the plan', due: '2026-03-12', owner: 'ana' }), task({ id: 2, title: 'Send the invoice', status: 'done' })]);
    const response = await app.request('/');
    assert.equal(response.status, 200);
    const page = await response.text();
    assert.match(page, /^<!doctype html>/);
    assert.match(page, /<h1>Team board<\/h1>/);
    for (const text of ['Draft the plan', '2026-03-12', 'ana', 'Send the invoice']) assert.ok(page.includes(text), text);
    assert.ok(page.includes('action="/tasks/1/complete"'), 'an open task can be completed');
    assert.ok(!page.includes('action="/tasks/2/complete"'), 'a done task cannot');
  });

  test('escapes what people type', async () => {
    const { app } = testBoard([task({ id: 1, title: '<script>alert(1)</script>' })]);
    const page = await (await app.request('/')).text();
    assert.ok(!page.includes('<script>alert(1)</script>'));
    assert.ok(page.includes('&lt;script&gt;'));
  });

  test('the add form adds a task and comes back to the board', async () => {
    const { app, service } = testBoard();
    const response = await app.request('/tasks', form({ title: 'Book the venue', due: '2026-03-20', owner: '', tags: 'events, Ops' }));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/');
    assert.deepEqual(await service.list(), [{ id: 1, title: 'Book the venue', due: '2026-03-20', tags: ['events', 'ops'], status: 'open', createdAt: NOW.toISOString() }]);
  });

  test('the add form refuses a task without a title and says why', async () => {
    const { app, service } = testBoard();
    const response = await app.request('/tasks', form({ title: '', due: '', owner: '', tags: '' }));
    assert.equal(response.status, 400);
    assert.match(await response.text(), /role="alert">title is required/);
    assert.deepEqual(await service.list(), []);
  });

  test('a refused add form comes back filled in as it was sent', async () => {
    const { app, service } = testBoard();
    const sent = { title: 'Book the "big" venue', due: '2026-03-20', owner: 'o'.repeat(61), tags: 'events, ops' };
    const response = await app.request('/tasks', form(sent));
    assert.equal(response.status, 400);
    const page = await response.text();
    assert.match(page, /role="alert">Too big: expected string to have &lt;=60 characters/);
    const value = (name: string) => new RegExp(`<input name="${name}"[^>]* value="([^"]*)"`).exec(page)?.[1];
    assert.deepEqual({ title: value('title'), due: value('due'), owner: value('owner'), tags: value('tags') }, { ...sent, title: 'Book the &quot;big&quot; venue' });
    assert.deepEqual(await service.list(), []);
  });

  test('Done completes the task and comes back to the board', async () => {
    const { app, service } = testBoard([task({ id: 1 })]);
    const response = await app.request('/tasks/1/complete', { method: 'POST' });
    assert.equal(response.status, 303);
    assert.equal((await service.get(1))?.status, 'done');
  });

  test('serves the stylesheet', async () => {
    const { app } = testBoard();
    const response = await app.request('/styles.css');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /text\/css/);
  });
});
