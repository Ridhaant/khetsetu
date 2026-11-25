import http from 'node:http';
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { SqliteD1 } from '../worker/test/sqlite-d1.mjs';

if (!existsSync('dist/server/index.js')) throw new Error('Build first with npm run build.');
mkdirSync('.sites-runtime', { recursive: true });
copyFileSync('dist/server/index.js', '.sites-runtime/preview-worker.mjs');
const worker = (await import(pathToFileURL(path.resolve('.sites-runtime/preview-worker.mjs')).href)).default;
const DB = new SqliteD1('.sites-runtime/pilot-preview.sqlite').migrate();
const port = Number(process.env.PORT || 4173);
const origin = `http://127.0.0.1:${port}`;
const env = { DB, SITE_ORIGIN: origin, OPS_ADMIN_EMAIL: 'owner@local.test', RATE_LIMIT_SALT: randomBytes(32).toString('hex') };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    // Loopback-only simulation for UI QA. These routes and identity injection are
    // absent from the production Worker bundle.
    if (url.pathname === '/__local/signin') { res.writeHead(302, { Location: '/#operations', 'Set-Cookie': 'pilot_local_owner=1; HttpOnly; SameSite=Strict; Path=/' }); return res.end(); }
    if (url.pathname === '/__local/signout') { res.writeHead(302, { Location: '/', 'Set-Cookie': 'pilot_local_owner=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/' }); return res.end(); }
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) if (!name.startsWith('oai-') && !name.startsWith('cf-') && value) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    headers.set('CF-Connecting-IP', '127.0.0.1');
    if ((req.headers.cookie || '').split(';').some(value => value.trim() === 'pilot_local_owner=1')) { headers.set('oai-authenticated-user-id', 'local-owner'); headers.set('oai-authenticated-user-email', env.OPS_ADMIN_EMAIL); }
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 16384) { res.writeHead(413); return res.end('Request too large'); } chunks.push(chunk); }
    const request = new Request(url, { method: req.method, headers, ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}) });
    const response = await worker.fetch(request, env, {});
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) { console.error('Local preview failure:', error.name); res.writeHead(500); res.end('Local preview error'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: ${origin}\nLocal operations test sign-in: ${origin}/__local/signin\nUses local SQLite only; hosted D1 data is separate.`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { DB.close(); process.exit(0); }));
