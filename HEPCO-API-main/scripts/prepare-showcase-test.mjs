import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const url = readFileSync(join(process.env.LOCALAPPDATA, 'HEPCO/MySQL/integration-url.txt'), 'utf8').trim();
const target = new URL(url);
if (target.hostname !== '127.0.0.1' || target.pathname !== '/hepco_integration') throw new Error('Only the local integration database is allowed');
const db = new PrismaClient({ datasources: { db: { url } } });
try {
  const tables = await db.$queryRaw`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'home_showcases'`;
  if (!tables.length) await db.$executeRawUnsafe(readFileSync('prisma/migrations/20261107010000_home_showcase/migration.sql', 'utf8'));
  console.log('Showcase table ready in the isolated integration database.');
} finally { await db.$disconnect(); }
