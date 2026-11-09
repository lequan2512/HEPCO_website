const { prisma } = require('../db');
const defaults = require('../data/homeShowcase.defaults.json');
const { SHOWCASE_ID } = require('../constants/showcase');
const AppError = require('../utils/AppError');
class ShowcaseModel {
  static async get() {
    const row = await prisma.homeShowcase.findUnique({ where: { id: SHOWCASE_ID } });
    return row ? { data: row.data, version: row.version } : { data: defaults, version: 0 };
  }
  static async save(data, version) {
    if (version === 0) {
      const row = await prisma.homeShowcase.create({ data: { id: SHOWCASE_ID, data, version: 1 } });
      return { data: row.data, version: row.version };
    }
    // Guard the SQL write itself; a prior read/check does not prevent concurrent overwrites.
    return prisma.$transaction(async (tx) => {
      const result = await tx.homeShowcase.updateMany({ where: { id: SHOWCASE_ID, version }, data: { data, version: { increment: 1 } } });
      if (result.count !== 1) throw new AppError('SHOWCASE_CONFLICT', 409, 'This section was updated elsewhere. Reload before saving again.');
      const row = await tx.homeShowcase.findUnique({ where: { id: SHOWCASE_ID } });
      return { data: row.data, version: row.version };
    });
  }
}
module.exports = ShowcaseModel;
