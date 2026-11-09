const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const { hashPassword } = require('../src/utils/password');
const { AUTH } = require('../src/constants/auth');
const AppError = require('../src/utils/AppError');

let server, base, allowIp = true, failWrite = false, nextId = 10, lastQuery;
const users = new Map();
const articles = new Map();
const dbPath = require.resolve('../src/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { prisma: {
  users: {
    findUnique: async ({ where }) => [...users.values()].find((u) => where.id ? u.id === where.id : u.username === where.username) || null,
  },
  ipWhitelist: { findUnique: async ({ where }) => allowIp && where.ip === '127.0.0.1' ? { id: 1 } : null },
  news: {
    create: async ({ data }) => { if (failWrite) throw new Error('Database unavailable'); const row = { ...structuredClone(data), id: nextId++ }; articles.set(row.id, row); return row; },
    update: async ({ where, data }) => { if (failWrite) throw new Error('Database unavailable'); if (!articles.has(where.id)) throw Object.assign(new Error('Missing'), { code: 'P2025' }); const row = { ...articles.get(where.id), ...structuredClone(data) }; articles.set(where.id, row); return row; },
    delete: async ({ where }) => { if (failWrite) throw new Error('Database unavailable'); if (!articles.has(where.id)) throw Object.assign(new Error('Missing'), { code: 'P2025' }); const row = articles.get(where.id); articles.delete(where.id); return row; },
    findUnique: async ({ where }) => articles.get(where.id) || null,
    count: async () => articles.size,
    findMany: async (query) => { lastQuery = query; return [...articles.values()].slice(query.skip, query.skip + query.take); },
  },
} } };

const request = async (url, { method = 'GET', token, body, headers = {} } = {}) => {
  const response = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json() };
};
const credentials = { username: 'editor', password: 'test-password-for-unit-tests' };
const article = { title: 'Server article', content: '<p>Saved content</p>', date: '06/11/2026 23:44', type: 'news', summary: 'Summary', category: 'company_activity', publishYear: 2026, attachments: [{ fileUrl: 'https://example.com/document.pdf', title: 'Document' }] };
let token;

before(async () => {
  process.env.JWT_SECRET = 'unit-test-secret-with-more-than-32-bytes';
  process.env.CMS_ADMIN_USER_IDS = '1';
  users.set(1, { id: 1, username: credentials.username, password: await hashPassword(credentials.password) });
  users.set(2, { id: 2, username: 'reader', password: await hashPassword(credentials.password) });
  users.set(3, { id: 3, username: 'legacy', password: credentials.password });
  const app = express();
  app.set('trust proxy', false);
  app.use(express.json());
  app.use('/api', require('../src/routes/auth.routes'));
  app.use('/api/news', require('../src/routes/news.routes'));
  app.use('/api/upload', require('../src/middlewares/auth.middleware').verifyToken, require('../src/routes/upload.routes'));
  app.use('/api/banner', require('../src/routes/banner.routes'));
  app.use((error, req, res, next) => res.status(error instanceof AppError ? error.statusCode : 500).json({ errorCode: error.errorCode || 'INTERNAL_ERROR' }));
  server = await new Promise((resolve) => { const value = app.listen(0, '127.0.0.1', () => resolve(value)); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) await new Promise((resolve) => server.close(resolve)); });

test('login accepts a password hash and exposes no credential material', async () => {
  const result = await request('/api/login', { method: 'POST', body: credentials });
  assert.equal(result.status, 200);
  assert.deepEqual(result.data.user, { id: 1, username: 'editor' });
  token = result.data.token;
  const claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [AUTH.ALGORITHM], audience: AUTH.AUDIENCE, issuer: AUTH.ISSUER });
  assert.equal(claims.id, 1);
  assert.ok(claims.exp);
});
test('wrong and legacy plaintext passwords cannot authenticate', async () => {
  assert.equal((await request('/api/login', { method: 'POST', body: { ...credentials, password: 'wrong' } })).status, 401);
  assert.equal((await request('/api/login', { method: 'POST', body: { username: 'legacy', password: credentials.password } })).status, 401);
});
test('missing signing configuration fails closed', async () => {
  const secret = process.env.JWT_SECRET; delete process.env.JWT_SECRET;
  try { assert.equal((await request('/api/login', { method: 'POST', body: credentials })).status, 503); }
  finally { process.env.JWT_SECRET = secret; }
});
test('login and mutations enforce IP whitelist without trusting spoofed forwarded headers', async () => {
  allowIp = false;
  try {
    assert.equal((await request('/api/login', { method: 'POST', body: credentials, headers: { 'x-forwarded-for': '127.0.0.1' } })).status, 403);
    assert.equal((await request('/api/news', { method: 'POST', token, body: article })).status, 403);
    assert.equal((await request('/api/session', { token })).status, 403);
  } finally { allowIp = true; }
});
test('untrusted forwarded headers do not override the socket client IP', async () => {
  const result = await request('/api/login', { method: 'POST', body: credentials, headers: { 'x-forwarded-for': '203.0.113.99' } });
  assert.equal(result.status, 200);
});
test('missing, forged and expired tokens cannot mutate content', async () => {
  assert.equal((await request('/api/news', { method: 'POST', body: article })).status, 401);
  assert.equal((await request('/api/news', { method: 'POST', token: 'hepco-cms-token-local', body: article })).status, 401);
  const expired = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: -1, issuer: AUTH.ISSUER, audience: AUTH.AUDIENCE });
  assert.equal((await request('/api/news', { method: 'POST', token: expired, body: article })).status, 401);
});
test('authenticated users without explicit CMS permission cannot write', async () => {
  const reader = await request('/api/login', { method: 'POST', body: { username: 'reader', password: credentials.password } });
  assert.equal(reader.status, 200);
  assert.equal((await request('/api/news', { method: 'POST', token: reader.data.token, body: article })).status, 403);
  assert.equal((await request('/api/upload', { method: 'POST', token: reader.data.token, body: {} })).status, 403);
  assert.equal((await request('/api/banner/example.jpg', { method: 'DELETE', token: reader.data.token })).status, 403);
});
test('create, read, update and delete use the same server ID and persist metadata', async () => {
  const created = await request('/api/news', { method: 'POST', token, body: article });
  assert.equal(created.status, 201);
  assert.equal(created.data.success, true);
  const id = created.data.data.id;
  assert.equal(created.data.data.author_id, 1);
  assert.deepEqual(created.data.data.attachments, article.attachments);
  const publicRead = await request(`/api/news/${id}`);
  assert.equal(publicRead.data.title, article.title);
  assert.equal(publicRead.data.summary, article.summary);
  const updated = await request(`/api/news/${id}`, { method: 'PUT', token, body: { ...article, title: 'Updated by server' } });
  assert.equal(updated.data.data.id, id);
  assert.equal((await request(`/api/news/${id}`)).data.title, 'Updated by server');
  assert.deepEqual((await request(`/api/news/${id}`, { method: 'DELETE', token })).data, { success: true, id });
  assert.equal((await request(`/api/news/${id}`)).status, 404);
  assert.equal((await request(`/api/news/${id}`, { method: 'DELETE', token })).status, 404);
});
test('database failure never returns success for create, update or delete', async () => {
  failWrite = true;
  try {
    for (const [method, url] of [['POST', '/api/news'], ['PUT', '/api/news/10'], ['DELETE', '/api/news/10']]) {
      const result = await request(url, { method, token, ...(method !== 'DELETE' ? { body: article } : {}) });
      assert.equal(result.status, 500); assert.notEqual(result.data.success, true);
    }
  } finally { failWrite = false; }
});
test('invalid IDs, pagination and ephemeral attachments are rejected', async () => {
  assert.equal((await request('/api/news/12junk')).status, 400);
  assert.equal((await request('/api/news?limit=1000')).status, 400);
  assert.equal((await request('/api/news?sort=invalid')).status, 400);
  const result = await request('/api/news', { method: 'POST', token, body: { ...article, attachments: [{ fileUrl: 'blob:local-only' }] } });
  assert.equal(result.status, 400); assert.equal(result.data.errorCode, 'PERMANENT_UPLOAD_REQUIRED');
});
test('server filters use MySQL JSON paths and real pagination', async () => {
  const result = await request('/api/news?page=2&limit=15&category=company_activity&year=2026');
  assert.equal(result.status, 200);
  assert.equal(lastQuery.skip, 15);
  assert.equal(lastQuery.take, 15);
  assert.equal(lastQuery.where.AND[0].OR[0].metadata.path, '$.category');
  assert.equal(lastQuery.where.AND[1].metadata.path, '$.publishYear');
  assert.equal(lastQuery.where.AND[1].metadata.equals, 2026);
});
test('password changes revoke existing server sessions', async () => {
  const previous = users.get(1).password;
  users.get(1).password = await hashPassword('a-new-unit-test-password');
  try { assert.equal((await request('/api/session', { token })).status, 401); }
  finally { users.get(1).password = previous; }
});
test('account deletion revokes existing server sessions', async () => {
  const previous = users.get(1); users.delete(1);
  try { assert.equal((await request('/api/session', { token })).status, 401); }
  finally { users.set(1, previous); }
});
test('tokens with wrong audience, issuer or algorithm cannot authenticate', async () => {
  const claims = jwt.decode(token);
  delete claims.iat; delete claims.exp; delete claims.aud; delete claims.iss;
  for (const options of [
    { algorithm: AUTH.ALGORITHM, issuer: AUTH.ISSUER, audience: 'another-app' },
    { algorithm: AUTH.ALGORITHM, issuer: 'another-issuer', audience: AUTH.AUDIENCE },
    { algorithm: 'HS384', issuer: AUTH.ISSUER, audience: AUTH.AUDIENCE },
  ]) {
    const invalid = jwt.sign(claims, process.env.JWT_SECRET, { ...options, expiresIn: '1h' });
    assert.equal((await request('/api/session', { token: invalid })).status, 401);
  }
});
test('removing CMS grants immediately revokes mutation permission', async () => {
  const previous = process.env.CMS_ADMIN_USER_IDS;
  process.env.CMS_ADMIN_USER_IDS = '';
  try {
    const session = await request('/api/session', { token });
    assert.equal(session.status, 200); assert.equal(session.data.canManageContent, false);
    assert.equal((await request('/api/news', { method: 'POST', token, body: article })).status, 403);
  } finally { process.env.CMS_ADMIN_USER_IDS = previous; }
});
test('failed update leaves the saved record unchanged and failed delete retains it', async () => {
  const created = await request('/api/news', { method: 'POST', token, body: article });
  const id = created.data.data.id;
  failWrite = true;
  try {
    assert.equal((await request('/api/news/' + id, { method: 'PUT', token, body: { ...article, title: 'Must not save' } })).status, 500);
    assert.equal((await request('/api/news/' + id, { method: 'DELETE', token })).status, 500);
    assert.equal((await request('/api/news/' + id)).data.title, article.title);
  } finally { failWrite = false; }
  await request('/api/news/' + id, { method: 'DELETE', token });
});
test('client-supplied author and IDs cannot override authenticated ownership', async () => {
  const created = await request('/api/news', { method: 'POST', token, body: { ...article, id: 999, author_id: 999 } });
  assert.equal(created.status, 201);
  assert.equal(created.data.data.author_id, 1);
  assert.notEqual(created.data.data.id, 999);
  await request('/api/news/' + created.data.data.id, { method: 'DELETE', token });
});
test('login burst is throttled', async () => {
  let result;
  for (let i = 0; i < 12; i++) result = await request('/api/login', { method: 'POST', body: { ...credentials, password: 'wrong' } });
  assert.equal(result.status, 429);
});
