import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from 'node:path';
import { build } from '../apps/web/node_modules/esbuild/lib/main.js';
// The cleanup target is a fixed generated directory inside this checkout.
const output = path.resolve('dist');
if (path.dirname(output) !== process.cwd() || path.basename(output) !== 'dist') throw new Error('Invalid build output path');
rmSync(output, { recursive: true, force: true });
const r = spawnSync(
  process.execPath,
  ["apps/web/node_modules/typescript/bin/tsc", "--noEmit", "-p", "apps/web"],
  { stdio: "inherit" },
);
if (r.status) process.exit(r.status ?? 1);
const b = spawnSync(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "build"],
  { cwd: "apps/web", stdio: "inherit" },
);
if (b.status) process.exit(b.status ?? 1);
mkdirSync('dist/client', { recursive: true });
cpSync('apps/web/dist', 'dist/client', { recursive: true });
const assets = {};
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };
function collect(directory, prefix = '') {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name), key = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) collect(file, key);
    else if (entry.isFile()) assets[key] = { type: types[path.extname(file)] ?? 'application/octet-stream', body: readFileSync(file).toString('base64') };
    else throw new Error('Generated assets must be regular files');
  }
}
collect('dist/client');
await build({ entryPoints: ['worker/index.mjs'], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', outfile: 'dist/server/index.js', minify: true,
  plugins: [{ name: 'pilot-assets', setup(builder) { builder.onResolve({ filter: /^pilot-assets$/ }, () => ({ path: 'pilot-assets', namespace: 'embedded' })); builder.onLoad({ filter: /.*/, namespace: 'embedded' }, () => ({ contents: `export const assets = ${JSON.stringify(assets)}`, loader: 'js' })); } }],
});
mkdirSync('dist/.openai', { recursive: true });
cpSync('.openai/hosting.json', 'dist/.openai/hosting.json');
console.log(`Assisted pilot Worker built with ${Object.keys(assets).length} bundled web assets.`);
