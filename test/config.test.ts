import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  test('everything but the admin token has a default', () => {
    assert.deepEqual(loadConfig({ ADMIN_TOKEN: 'a-long-enough-token' }), { port: 3000, title: 'Taskboard', adminToken: 'a-long-enough-token', dataFile: 'data/tasks.json' });
  });

  test('reads every setting from the environment', () => {
    const env = { PORT: '4100', APP_TITLE: ' Ops board ', ADMIN_TOKEN: 'a-long-enough-token', DATA_FILE: '/srv/tasks.json' };
    assert.deepEqual(loadConfig(env), { port: 4100, title: 'Ops board', adminToken: 'a-long-enough-token', dataFile: '/srv/tasks.json' });
  });

  test('refuses a missing or short admin token and a port that is not one', () => {
    assert.throws(() => loadConfig({}), /set ADMIN_TOKEN to a secret/);
    assert.throws(() => loadConfig({ ADMIN_TOKEN: 'short' }), /set ADMIN_TOKEN to a secret/);
    assert.throws(() => loadConfig({ ADMIN_TOKEN: 'a-long-enough-token', PORT: 'http' }), /PORT/);
  });
});
