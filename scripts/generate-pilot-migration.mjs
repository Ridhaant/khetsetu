import { existsSync, readFileSync, writeFileSync } from 'node:fs';
// This retained Vite project uses schema SQL rather than a new ORM dependency.
// Initial generation is deterministic. Applied migrations must never be rewritten.
const target = 'drizzle/0000_assisted_pilot.sql';
const schema = readFileSync('db/pilot-schema.sql', 'utf8');
if (existsSync(target) && readFileSync(target, 'utf8') !== schema) throw new Error('Initial migration already exists. Add a new numbered migration; never rewrite applied SQL.');
if (!existsSync(target)) writeFileSync(target, schema);
console.log('Pilot schema and immutable initial SQL migration match.');
