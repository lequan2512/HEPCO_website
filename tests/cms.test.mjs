import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const compile = (path, bindings, names) => {
  let source = readFileSync(new URL('../' + path, import.meta.url), 'utf8').replace(/^import\s[^;]+;\s*/gm, '').replace(/export const /g, 'const ');
  source += '\nObject.assign(exports, {' + names.join(',') + '});';
  const context = { ...bindings, exports: {}, console, URL, Date, Set, Map };
  vm.runInNewContext(source, context, { filename: path });
  return context.exports;
};
const harness = (axios = {}, mode = 'server') => {
  const storage = new Map([['hepco_cms_overrides_v1', JSON.stringify({ created: [{ id: 999, type: 'news', title: 'Local fake publication' }], updated: { 1: { title: 'Stale local update' } }, deleted: [1] })]]);
  const before = [...storage.entries()];
  const errors = compile('src/services/apiErrors.js', {}, ['apiContractError', 'requestConfirmed']);
  const bindings = { ...errors, axiosInstance: axios, CMS_REQUEST_TIMEOUT: 15000 };
  const article = compile('src/services/article.service.js', bindings, ['createServerArticle', 'updateServerArticle', 'deleteServerArticle', 'getServerArticles', 'getServerArticle']);
  const showcase = compile('src/services/showcase.service.js', bindings, ['getShowcase', 'saveShowcase']);
  const auth = compile('src/services/auth.service.js', bindings, ['login', 'getSession']);
  const news = compile('src/services/news.service.js', { ...bindings, ...article, CONTENT_SOURCE: mode, migratedData: { news: [{ id: 1, title: 'Legacy snapshot', type: 'news', date: '01/01/2026' }] }, NEWS_CATEGORY_LABELS: {}, SHAREHOLDER_DOC_TYPE_LABELS: {}, SHAREHOLDER_DOC_GROUP_LABELS: {}, GALLERY_CATEGORY_LABELS: {}, window: { localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) } } }, ['createNewsItem', 'updateNewsItem', 'deleteNewsItem', 'getNewsList', 'getArticleById']);
  const upload = compile('src/apis/upload.js', { ...bindings, useMutation: (options) => options }, ['useUploadImage']);
  return { article, news, auth, upload, showcase, storage, before };
};
const errorWith = (code, status = 500) => Object.assign(new Error(code), { response: { status, data: { errorCode: code } } });
const payload = { title: 'Server title', content: '<p>Persist me</p>', type: 'news', date: '06/11/2026 23:44' };

test('create uses the canonical server ID once, without writing local publication', async () => {
  let calls = 0;
  const h = harness({ post: async () => { calls++; return { data: { success: true, data: { ...payload, id: 42 } } }; } });
  assert.equal((await h.news.createNewsItem(payload)).id, 42);
  assert.equal(calls, 1);
  assert.deepEqual([...h.storage.entries()], h.before);
});
test('old backend success without a saved record is never accepted', async () => {
  const h = harness({ post: async () => ({ data: { success: true } }) });
  await assert.rejects(h.news.createNewsItem(payload), (e) => e.response.data.errorCode === 'INVALID_SERVER_RESPONSE');
  assert.deepEqual([...h.storage.entries()], h.before);
});
test('network, authorization and database failures propagate for every mutation', async () => {
  for (const error of [new Error('Network timeout'), errorWith('TOKEN_INVALID_OR_EXPIRED', 401), errorWith('CREATE_FAILED')]) {
    const reject = async () => { throw error; };
    const h = harness({ post: reject, put: reject, delete: reject });
    for (const invoke of [() => h.news.createNewsItem(payload), () => h.news.updateNewsItem({ id: 42, ...payload }), () => h.news.deleteNewsItem(42)]) await assert.rejects(invoke());
    assert.deepEqual([...h.storage.entries()], h.before);
  }
});
test('update must confirm the expected server ID and delete must confirm actual success', async () => {
  const h = harness({ put: async () => ({ data: { success: true, data: { ...payload, id: 99 } } }), delete: async () => ({ data: { success: true, id: 99 } }) });
  await assert.rejects(h.news.updateNewsItem({ id: 42, ...payload }));
  await assert.rejects(h.news.deleteNewsItem(42));
});
test('list/detail prefer server data over migrated and poisoned local storage', async () => {
  const h = harness({ get: async (url) => ({ data: url === '/api/news' ? { data: [{ ...payload, id: 1 }], meta: { total: 1, page: 1, totalPages: 1 } } : { ...payload, id: 1 } }) });
  const list = await h.news.getNewsList();
  assert.equal(list.data.length, 1); assert.equal(list.data[0].title, payload.title);
  assert.equal((await h.news.getArticleById(1)).title, payload.title);
});
test('server outages and deleted articles never resurrect legacy/local publications', async () => {
  const h = harness({ get: async () => { throw errorWith('ARTICLE_NOT_FOUND', 404); } });
  await assert.rejects(h.news.getNewsList());
  await assert.rejects(h.news.getArticleById(1));
});
test('legacy mode is read-only snapshot while admin lists still require server', async () => {
  const h = harness({ get: async () => { throw new Error('offline'); } }, 'legacy');
  const result = await h.news.getNewsList();
  assert.equal(result.meta.source, 'legacy');
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].title, 'Legacy snapshot');
  await assert.rejects(h.news.getNewsList({ requireServer: true }));
});
test('login cannot use embedded accounts when the API is unavailable', async () => {
  const h = harness({ post: async () => { throw new Error('offline'); } });
  await assert.rejects(h.auth.login({ username: 'admin', password: 'any-client-password' }));
});
test('login rejects false success and missing tokens', async () => {
  const h = harness({ post: async () => ({ data: { success: true } }) });
  await assert.rejects(h.auth.login({}));
});
test('upload failures cannot become local DataURL or Blob publication', async () => {
  const h = harness({ post: async () => { throw new Error('offline'); } });
  await assert.rejects(h.upload.useUploadImage().mutationFn({}));
});

test('malformed saved IDs and synthetic tokens are not valid acknowledgements', async () => {
  const h = harness({ post: async (url) => ({ data: url === '/api/news' ? { success: true, data: { ...payload, id: true } } : { success: true, token: '..', user: { id: 1 } } }) });
  await assert.rejects(h.news.createNewsItem(payload));
  await assert.rejects(h.auth.login({}));
});

test('session checks reject missing permissions and invalid account IDs', async () => {
  for (const data of [{ success: true }, { success: true, user: { id: true }, canManageContent: true }, { success: true, user: { id: 1 } }]) {
    const h = harness({ get: async () => ({ data }) });
    await assert.rejects(h.auth.getSession());
  }
});
test('successful update and delete preserve canonical identity without local writes', async () => {
  const h = harness({ put: async () => ({ data: { success: true, data: { ...payload, id: 42 } } }), delete: async () => ({ data: { success: true, id: 42 } }) });
  assert.equal((await h.news.updateNewsItem({ ...payload, id: 42 })).id, 42);
  assert.equal((await h.news.deleteNewsItem(42)).id, 42);
  assert.deepEqual([...h.storage.entries()], h.before);
});

test('showcase save requires a confirmed new server version and never writes local storage', async () => {
  const data = { title: 'Activities', items: [{ id: 'a' }] };
  const h = harness({ put: async () => ({ data: { success: true, data, version: 2 } }) });
  assert.equal((await h.showcase.saveShowcase(data, 1)).version, 2);
  assert.deepEqual([...h.storage.entries()], h.before);
  await assert.rejects(h.showcase.saveShowcase(data, 2));
});
test('showcase API errors and malformed acknowledgements do not report a successful save', async () => {
  for (const result of [null, { success: true }, { success: true, data: { title: 'Empty', items: [] }, version: 1 }]) {
    const h = harness({ put: async () => ({ data: result }) });
    await assert.rejects(h.showcase.saveShowcase({}, 0));
  }
  const h = harness({ put: async () => { throw errorWith('SHOWCASE_CONFLICT', 409); } });
  await assert.rejects(h.showcase.saveShowcase({}, 0), (error) => error.response.data.errorCode === 'SHOWCASE_CONFLICT');
  assert.deepEqual([...h.storage.entries()], h.before);
});
