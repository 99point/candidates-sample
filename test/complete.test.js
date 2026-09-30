import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TaskStore } from '../src/store.js';

test('completing a task keeps its due date', () => {
  const store = new TaskStore([{ id: 1, title: 'ship it', status: 'open', due: '2026-10-05' }]);
  const done = store.complete(1);
  assert.equal(done.status, 'done');
  assert.equal(done.due, '2026-10-05');
  assert.equal(store.get(1).due, '2026-10-05');
});

test('completing an unknown task returns null', () => {
  assert.equal(new TaskStore().complete(99), null);
});
