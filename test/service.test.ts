import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { NOW, task, testBoard } from './support.js';

describe('TaskService', () => {
  test('a new task is open, created now, under the next id', async () => {
    const { service } = testBoard([task({ id: 7 })]);
    const created = await service.create({ title: 'Plan the launch', due: '2026-03-20', tags: ['launch'] });
    assert.deepEqual(created, { id: 8, title: 'Plan the launch', due: '2026-03-20', tags: ['launch'], status: 'open', createdAt: NOW.toISOString() });
    assert.deepEqual(
      (await service.list()).map(({ id }) => id),
      [7, 8],
    );
  });

  test('ids are never reused', async () => {
    const { service } = testBoard([task({ id: 1 }), task({ id: 2 })]);
    assert.equal(await service.remove(2), true);
    assert.equal((await service.create({ title: 'Next', tags: [] })).id, 3);
  });

  test('changes apply to the given fields only, and null clears a due date or an owner', async () => {
    const { service } = testBoard([task({ id: 1, title: 'Old', due: '2026-03-12', owner: 'ana', tags: ['ops'] })]);
    const renamed = await service.update(1, { title: 'New' });
    assert.deepEqual(renamed, task({ id: 1, title: 'New', due: '2026-03-12', owner: 'ana', tags: ['ops'] }));
    const cleared = await service.update(1, { due: null, owner: null });
    assert.deepEqual(cleared, task({ id: 1, title: 'New', tags: ['ops'] }));
    assert.deepEqual(await service.get(1), cleared);
  });

  test('changing or completing a task that does not exist gives null', async () => {
    const { service } = testBoard();
    assert.equal(await service.update(4, { title: 'Nope' }), null);
    assert.equal(await service.complete(4), null);
  });

  test('completing a task marks it done now', async () => {
    const { service } = testBoard([task({ id: 1 })]);
    const done = await service.complete(1);
    assert.equal(done?.status, 'done');
    assert.equal(done?.completedAt, NOW.toISOString());
    assert.deepEqual(await service.get(1), done);
  });

  test('completing a done task changes nothing', async () => {
    const finished = task({ id: 1, status: 'done', completedAt: '2026-03-02T12:00:00.000Z' });
    const { service } = testBoard([finished]);
    assert.deepEqual(await service.complete(1), finished);
    assert.deepEqual(await service.get(1), finished);
  });
});
