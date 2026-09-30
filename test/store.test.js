import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TaskStore } from '../src/store.js';

test('creates tasks with increasing ids', () => {
  const store = new TaskStore([{ id: 7, title: 'existing', status: 'open', due: null }]);
  const task = store.create({ title: '  new task ', due: '2026-10-01' });
  assert.equal(task.id, 8);
  assert.equal(task.title, 'new task');
  assert.equal(task.status, 'open');
  assert.equal(store.list().length, 2);
});

test('rejects tasks without a title', () => {
  assert.throws(() => new TaskStore().create({ title: ' ' }), /title is required/);
});

test('removes tasks', () => {
  const store = new TaskStore([{ id: 1, title: 'a', status: 'open', due: null }]);
  assert.equal(store.remove(1), true);
  assert.equal(store.remove(1), false);
});
