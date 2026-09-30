import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTasks, TaskStore } from './store.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 3000);
const title = process.env.APP_TITLE ?? 'Taskboard';
const store = new TaskStore(loadTasks());

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw === '' ? {} : JSON.parse(raw);
}

export function handler(store) {
  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/api/tasks' && req.method === 'GET') return send(res, 200, store.list());
      if (url.pathname === '/api/tasks' && req.method === 'POST') return send(res, 201, store.create(await readJson(req)));
      const match = /^\/api\/tasks\/(\d+)(\/complete)?$/.exec(url.pathname);
      if (match) {
        const id = Number(match[1]);
        if (match[2] && req.method === 'POST') {
          const task = store.complete(id);
          return task ? send(res, 200, task) : send(res, 404, { error: 'not found' });
        }
        if (req.method === 'DELETE') return store.remove(id) ? send(res, 204, {}) : send(res, 404, { error: 'not found' });
      }
      if (url.pathname === '/api/config') return send(res, 200, { title });
      const file = path.join(root, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
      if (file.startsWith(path.join(root, 'public')) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html';
        res.writeHead(200, { 'content-type': `${type}; charset=utf-8` });
        return fs.createReadStream(file).pipe(res);
      }
      send(res, 404, { error: 'not found' });
    } catch (error) {
      send(res, 400, { error: error.message });
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  http.createServer(handler(store)).listen(port, () => console.log(`${title} listening on http://localhost:${port}`));
}
