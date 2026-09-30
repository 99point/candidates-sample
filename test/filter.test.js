import assert from 'node:assert/strict';
import http from 'node:http';
import { test } from 'node:test';
import { handler } from '../src/server.js';
import { TaskStore } from '../src/store.js';

async function withServer(run) {
  const store = new TaskStore([
    { id: 1, title: 'open one', status: 'open', due: null },
    { id: 2, title: 'done one', status: 'done', due: null },
    { id: 3, title: 'open two', status: 'open', due: '2026-10-01' },
  ]);
  const server = http.createServer(handler(store)).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test('GET /api/tasks?status=open returns only open tasks', async () => {
  await withServer(async (base) => {
    const tasks = await (await fetch(`${base}/api/tasks?status=open`)).json();
    assert.deepEqual(tasks.map((task) => task.id), [1, 3]);
  });
});

test('GET /api/tasks?status=done returns only done tasks', async () => {
  await withServer(async (base) => {
    const tasks = await (await fetch(`${base}/api/tasks?status=done`)).json();
    assert.deepEqual(tasks.map((task) => task.id), [2]);
  });
});

test('an unknown status is rejected with 400', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/tasks?status=archived`);
    assert.equal(response.status, 400);
  });
});
