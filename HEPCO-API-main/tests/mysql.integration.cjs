const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
process.env.UPLOAD_STORAGE = 'local';
process.env.LOCAL_MEDIA_DIRECTORY = join(__dirname, '../.test-artifacts/showcase-images');
const { randomBytes } = require('node:crypto');
const express = require('express');
const connection = readFileSync(join(process.env.LOCALAPPDATA, 'HEPCO/MySQL/integration-url.txt'), 'utf8').trim();
const destination = new URL(connection);
if (destination.hostname !== '127.0.0.1' || destination.pathname !== '/hepco_integration') throw new Error('Integration tests require the isolated local database');
process.env.DATABASE_URL = connection;
process.env.JWT_SECRET = randomBytes(48).toString('hex');
const { prisma } = require('../src/db');
const { PrismaClient } = require('@prisma/client');
const independentReader = new PrismaClient();
const { hashPassword } = require('../src/utils/password');
const suffix = Date.now().toString();
const password = randomBytes(24).toString('hex');
let server, base, user, token, articleId, addedWhitelist = false, showcaseBackup, showcaseVersion, uploadedImage;
const request = async (path, { method = 'GET', body, authenticated = false } = {}) => {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json() };
};
const article = { title: 'MySQL integration ' + suffix, type: 'shareholders', date: '07/11/2026 00:00', content: '<p>Integration content</p>', summary: 'Verified metadata', category: 'other_document', documentType: 'other_document', publishYear: 2026, attachments: [{ fileUrl: 'https://example.com/test.pdf', downloadUrl: 'https://example.com/test.pdf', title: 'Integration document' }] };

before(async () => {
  const rows = await prisma.$queryRaw`SELECT DATABASE() AS db`;
  assert.equal(rows[0].db, 'hepco_integration');
  showcaseBackup = await prisma.homeShowcase.findUnique({ where: { id: 1 } });
  user = await prisma.users.create({ data: { username: 'integration_' + suffix, password: await hashPassword(password) } });
  process.env.CMS_ADMIN_USER_IDS = String(user.id);
  if (!(await prisma.ipWhitelist.findUnique({ where: { ip: '127.0.0.1' } }))) {
    await prisma.ipWhitelist.create({ data: { ip: '127.0.0.1', description: 'Local integration test' } });
    addedWhitelist = true;
  }
  const app = express();
  app.set('trust proxy', false);
  app.use(express.json());
  app.use('/api', require('../src/routes/auth.routes'));
  app.use('/api/news', require('../src/routes/news.routes'));
  app.use('/api/showcase', require('../src/routes/showcase.routes'));
  app.use('/api/upload', require('../src/routes/upload.routes'));
  app.use('/api/media', express.static(process.env.LOCAL_MEDIA_DIRECTORY, { setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }));
  app.use(require('../src/middlewares/errorHandler'));
  server = await new Promise((resolve) => { const listening = app.listen(0, '127.0.0.1', () => resolve(listening)); });
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  if (showcaseBackup) await prisma.homeShowcase.upsert({ where: { id: 1 }, create: showcaseBackup, update: { data: showcaseBackup.data, version: showcaseBackup.version, updated_at: showcaseBackup.updated_at } });
  else await prisma.homeShowcase.deleteMany({ where: { id: 1 } });
  if (uploadedImage) {
    const fs = require('node:fs/promises');
    const imagePath = require('node:path').resolve(process.env.LOCAL_MEDIA_DIRECTORY, 'images', require('node:path').basename(uploadedImage));
    const allowedRoot = require('node:path').resolve(process.env.LOCAL_MEDIA_DIRECTORY) + require('node:path').sep;
    if (!imagePath.startsWith(allowedRoot)) throw new Error('Unexpected test image path');
    await fs.unlink(imagePath).catch((error) => { if (error.code !== 'ENOENT') throw error; });
  }
  if (server) await new Promise((resolve) => server.close(resolve));
  if (articleId) await prisma.news.deleteMany({ where: { id: articleId } });
  if (user) await prisma.users.deleteMany({ where: { id: user.id } });
  if (addedWhitelist) await prisma.ipWhitelist.deleteMany({ where: { ip: '127.0.0.1' } });
  await Promise.all([prisma.$disconnect(), independentReader.$disconnect()]);
});
test('additive metadata migration applies to real MySQL', async () => {
  const columns = await prisma.$queryRaw`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'news' AND COLUMN_NAME = 'metadata'`;
  if (!columns.length) {
    const sql = readFileSync(join(__dirname, '../prisma/migrations/20261106170000_news_metadata/migration.sql'), 'utf8').replace(/^--.*$/gm, '').trim();
    await prisma.$executeRawUnsafe(sql);
  }
  const result = await prisma.$queryRaw`SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'news' AND COLUMN_NAME = 'metadata'`;
  assert.equal(result[0].DATA_TYPE, 'json');
});
test('hashed administrator can authenticate against MySQL', async () => {
  const result = await request('/api/login', { method: 'POST', body: { username: user.username, password } });
  assert.equal(result.status, 200);
  assert.equal(result.data.user.id, user.id);
  assert.equal(result.data.user.password, undefined);
  token = result.data.token;
});
test('create stores metadata visible to an independent database connection', async () => {
  const result = await request('/api/news', { method: 'POST', authenticated: true, body: article });
  assert.equal(result.status, 201);
  articleId = result.data.data.id;
  const persisted = await independentReader.news.findUnique({ where: { id: articleId } });
  assert.equal(persisted.title, article.title);
  assert.equal(persisted.author_id, user.id);
  assert.deepEqual(persisted.metadata.attachments, article.attachments);
  assert.equal(persisted.metadata.publishYear, article.publishYear);
});
test('real MySQL JSON category, document type and year filters work', async () => {
  const query = new URLSearchParams({ type: 'shareholders', search: suffix, category: article.category, year: '2026', sort: 'title_asc', limit: '15', page: '1' });
  const result = await request('/api/news?' + query);
  assert.equal(result.status, 200);
  assert.equal(result.data.meta.total, 1);
  assert.equal(result.data.data[0].id, articleId);
  const missing = await request('/api/news?' + new URLSearchParams({ type: 'shareholders', search: suffix, year: '2025' }));
  assert.equal(missing.data.meta.total, 0);
  const grouped = await request('/api/news?' + new URLSearchParams({ type: 'shareholders', search: suffix, documentTypes: article.documentType }));
  assert.equal(grouped.data.meta.total, 1);
});
test('update persists the same ID and returns saved metadata', async () => {
  const result = await request('/api/news/' + articleId, { method: 'PUT', authenticated: true, body: { ...article, title: article.title + ' updated', summary: 'Updated metadata' } });
  assert.equal(result.status, 200);
  assert.equal(result.data.data.id, articleId);
  assert.equal((await independentReader.news.findUnique({ where: { id: articleId } })).metadata.summary, 'Updated metadata');
  assert.equal((await request('/api/news/' + articleId)).data.summary, 'Updated metadata');
});
test('duplicate deletion returns 404 and cannot resurrect data', async () => {
  const result = await request('/api/news/' + articleId, { method: 'DELETE', authenticated: true });
  assert.deepEqual(result.data, { success: true, id: articleId });
  assert.equal(await independentReader.news.findUnique({ where: { id: articleId } }), null);
  assert.equal((await request('/api/news/' + articleId)).status, 404);
  assert.equal((await request('/api/news/' + articleId, { method: 'DELETE', authenticated: true })).status, 404);
});
test('showcase loads current defaults without a database seed', async () => {
  const result = await request('/api/showcase');
  assert.equal(result.status, 200);
  assert.ok(result.data.data.items.length);
  showcaseVersion = result.data.version;
});
test('showcase writes require authenticated CMS permission', async () => {
  const config = (await request('/api/showcase')).data.data;
  assert.equal((await request('/api/showcase', { method: 'PUT', body: { config, version: showcaseVersion } })).status, 401);
  const previous = process.env.CMS_ADMIN_USER_IDS; process.env.CMS_ADMIN_USER_IDS = '';
  try { assert.equal((await request('/api/showcase', { method: 'PUT', authenticated: true, body: { config, version: showcaseVersion } })).status, 403); }
  finally { process.env.CMS_ADMIN_USER_IDS = previous; }
});
test('image selected from a file is stored and served permanently in local development', async () => {
  const form = new FormData();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64');
  form.append('image', new Blob([png], { type: 'image/png' }), 'chosen-image.png');
  const response = await fetch(base + '/api/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
  assert.equal(response.status, 200);
  const result = await response.json(); uploadedImage = result.url;
  assert.match(uploadedImage, /^\/api\/media\/images\/[a-f0-9-]+\.png$/);
  const loaded = await fetch(base + uploadedImage);
  assert.equal(loaded.status, 200);
  assert.equal(loaded.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(Buffer.from(await loaded.arrayBuffer()), png);
});
test('showcase saves chosen image, text, links and order to real MySQL', async () => {
  const config = structuredClone((await request('/api/showcase')).data.data);
  config.title = 'Editable section ' + suffix;
  config.description = 'New description'; config.linkLabel = 'See activities'; config.href = '/tin-tuc';
  config.items.reverse();
  config.items = config.items.map((item) => ({ subtitle: '', ...item }));
  config.sections = require('../src/data/homeSections.json').map(({ id }) => ({ id, visible: id !== 'stats' })).reverse();
  Object.assign(config.items[0], { image: uploadedImage, title: 'New project', subtitle: 'New photo caption', location: 'Hue', scale: 'Reviewed scale', linkLabel: 'Read more', href: '/bai-viet/123' });
  const result = await request('/api/showcase', { method: 'PUT', authenticated: true, body: { config, version: showcaseVersion } });
  assert.equal(result.status, 200);
  assert.equal(result.data.version, showcaseVersion + 1);
  showcaseVersion = result.data.version;
  assert.deepEqual((await independentReader.homeShowcase.findUnique({ where: { id: 1 } })).data, config);
  assert.deepEqual((await request('/api/showcase')).data.data, config);
});
test('stale showcase saves return conflict without overwriting the latest configuration', async () => {
  const saved = (await request('/api/showcase')).data;
  const result = await request('/api/showcase', { method: 'PUT', authenticated: true, body: { config: { ...saved.data, title: 'Stale editor' }, version: saved.version - 1 } });
  assert.equal(result.status, 409);
  assert.equal(result.data.errorCode, 'SHOWCASE_CONFLICT');
  assert.equal((await request('/api/showcase')).data.data.title, saved.data.title);
});
test('concurrent showcase edits allow one save and reject the stale writer', async () => {
  const saved = (await request('/api/showcase')).data;
  const results = await Promise.all(['Editor A', 'Editor B'].map((title) => request('/api/showcase', { method: 'PUT', authenticated: true, body: { config: { ...saved.data, title }, version: saved.version } })));
  assert.deepEqual(results.map((item) => item.status).sort(), [200, 409]);
  const current = (await request('/api/showcase')).data;
  assert.equal(current.version, saved.version + 1);
  assert.ok(['Editor A', 'Editor B'].includes(current.data.title));
});
test('unsafe URLs, duplicate cards and empty showcase sections are rejected', async () => {
  const saved = (await request('/api/showcase')).data;
  for (const config of [
    { ...saved.data, href: 'javascript:alert(1)' },
    { ...saved.data, items: [] },
    { ...saved.data, items: [saved.data.items[0], saved.data.items[0]] },
    { ...saved.data, items: [{ ...saved.data.items[0], image: 'blob:temporary-image' }] },
  ]) assert.equal((await request('/api/showcase', { method: 'PUT', authenticated: true, body: { config, version: saved.version } })).status, 400);
  assert.equal((await request('/api/showcase')).data.version, saved.version);
});
test('unsupported and oversized uploads are rejected', async () => {
  for (const buffer of [Buffer.from('<svg onload="alert(1)"></svg>'), Buffer.alloc(5 * 1024 * 1024 + 1)]) {
    const form = new FormData(); form.append('image', new Blob([buffer], { type: 'image/png' }), 'image.png');
    const result = await fetch(base + '/api/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
    assert.equal(result.status, 400);
  }
});
test('production cannot silently save uploaded images to local development storage', async () => {
  const previous = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
  try {
    const form = new FormData();
    form.append('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64')], { type: 'image/png' }), 'production.png');
    const result = await fetch(base + '/api/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
    assert.equal(result.status, 503);
    assert.equal((await result.json()).errorCode, 'UPLOAD_CONFIGURATION_ERROR');
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
test('changing the persisted password revokes the real database session', async () => {
  await prisma.users.update({ where: { id: user.id }, data: { password: await hashPassword(randomBytes(24).toString('hex')) } });
  assert.equal((await request('/api/session', { authenticated: true })).status, 401);
});
