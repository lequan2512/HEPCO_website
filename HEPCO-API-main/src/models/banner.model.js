const { prisma } = require('../db');

class BannerModel {
  static async getAll(page = 1, limit = 20) {
    const offset = (Number(page) - 1) * Number(limit);
    const [total, data] = await Promise.all([
      prisma.banner.count(),
      prisma.banner.findMany({
        orderBy: { id: 'desc' },
        skip: offset,
        take: Number(limit)
      })
    ]);
    return {
      data: data.map(b => b.url),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    };
  }

  static async create(url) {
    return prisma.banner.create({
      data: { url }
    });
  }

  static async deleteByUrlMatch(filename) {
    return prisma.banner.deleteMany({
      where: {
        url: {
          contains: filename
        }
      }
    });
  }
}

module.exports = BannerModel;
