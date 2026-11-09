import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
const fs = await import('node:fs');
const apiRoot = process.cwd();
const url = readFileSync(join(process.env.LOCALAPPDATA, 'HEPCO/MySQL/integration-url.txt'), 'utf8').trim();
const parsed = new URL(url);
if (parsed.hostname !== '127.0.0.1' || parsed.pathname !== '/hepco_integration') throw new Error('Refusing a non-integration database');
const artifacts = join(apiRoot, '.test-artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const original = readFileSync(join(apiRoot, 'prisma/schema.prisma'), 'utf8');
const beforeMetadata = original.replace(/^\s*metadata\s+Json\?\s*$/m, '');
if (beforeMetadata === original) throw new Error('Missing metadata schema field');
const schemaPath = join(artifacts, 'schema-before-metadata.prisma');
fs.writeFileSync(schemaPath, beforeMetadata);
const cli = join(apiRoot, 'node_modules/prisma/build/index.js');
const result = spawnSync(process.execPath, [cli, 'db', 'push', '--schema', schemaPath, '--skip-generate'], { cwd: apiRoot, env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8' });
if (result.status !== 0) { console.error('Integration schema setup failed.'); process.exit(1); }
console.log('Prepared the isolated MySQL integration schema without metadata; no production database was used.');
