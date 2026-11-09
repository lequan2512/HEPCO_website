const { prisma } = require('../db');
const { NEWS_SORTS, NEWS_METADATA_FIELDS } = require('../constants/news');

const toArticle = (record) => {
  if (!record) return null;
  const { metadata, ...core } = record;
  const extra = {};
  for (const key of NEWS_METADATA_FIELDS) if (metadata?.[key] !== undefined) extra[key] = metadata[key];
  return { ...extra, ...core };
};
class NewsModel {
  static async getAll({ type, page, limit, search, category, documentTypes, year, sort }) {
    const where = {};
    if (type && type !== 'all') where.type = type;
    const conditions = [];
    if (search) conditions.push({ title: { contains: search } });
    if (category) conditions.push({ OR: [ { metadata: { path: '$.category', equals: category } }, { metadata: { path: '$.documentType', equals: category } } ] });
    if (documentTypes?.length) conditions.push({ OR: documentTypes.map((value) => ({ metadata: { path: '$.documentType', equals: value } })) });
    if (year) conditions.push({ metadata: { path: '$.publishYear', equals: year } });
    if (conditions.length) where.AND = conditions;
    const [total, records] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: NEWS_SORTS[sort] }),
    ]);
    return { data: records.map(toArticle), meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }
  static async getById(id) { return toArticle(await prisma.news.findUnique({ where: { id } })); }
  static async create(data) { return toArticle(await prisma.news.create({ data })); }
  static async update(id, data) { return toArticle(await prisma.news.update({ where: { id }, data })); }
  static async delete(id) { return toArticle(await prisma.news.delete({ where: { id } })); }
}
module.exports = NewsModel;
