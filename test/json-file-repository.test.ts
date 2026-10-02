import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { JsonFileTaskRepository } from '../src/tasks/json-file-repository.js';
import { task } from './support.js';

describe('JsonFileTaskRepository', () => {
  let dir = '';
  before(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'tasks-'));
  });
  after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test('a file that does not exist yet is an empty board', async () => {
    const tasks = await JsonFileTaskRepository.open(path.join(dir, 'missing', 'tasks.json'));
    assert.deepEqual(await tasks.all(), []);
  });

  test('every change is written to the file and read back by the next start', async () => {
    const file = path.join(dir, 'board', 'tasks.json');
    const first = await JsonFileTaskRepository.open(file);
    const added = await first.add({ title: 'Write it down', status: 'open', tags: [], createdAt: '2026-03-01T08:00:00.000Z' });
    await first.add({ title: 'Throw it away', status: 'open', tags: [], createdAt: '2026-03-01T08:00:00.000Z' });
    await first.update({ ...added, owner: 'ana' });
    await first.remove(2);
    assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), { nextId: 3, tasks: [{ ...added, owner: 'ana' }] });

    const next = await JsonFileTaskRepository.open(file);
    assert.deepEqual(await next.all(), [{ ...added, owner: 'ana' }]);
  });

  test('ids are never reused, not even after a restart', async () => {
    const file = path.join(dir, 'ids', 'tasks.json');
    const first = await JsonFileTaskRepository.open(file);
    await first.add({ title: 'Keep', status: 'open', tags: [], createdAt: '2026-03-01T08:00:00.000Z' });
    await first.add({ title: 'Remove', status: 'open', tags: [], createdAt: '2026-03-01T08:00:00.000Z' });
    assert.equal(await first.remove(2), true);

    const next = await JsonFileTaskRepository.open(file);
    assert.equal((await next.add({ title: 'After restart', status: 'open', tags: [], createdAt: '2026-03-02T08:00:00.000Z' })).id, 3);
  });

  test('a file that is not a board is refused with the reason', async () => {
    const file = path.join(dir, 'broken.json');
    await writeFile(file, JSON.stringify({ nextId: 3, tasks: [task({ id: 1 }), { id: 2, title: 'No status' }] }));
    await assert.rejects(JsonFileTaskRepository.open(file), /broken\.json does not hold a board[\s\S]*status/);
  });
});
