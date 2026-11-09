const { prisma } = require('../db');

class UserModel {
  static async getAll(page = 1, limit = 20) {
    const offset = (Number(page) - 1) * Number(limit);
    const [total, data] = await Promise.all([
      prisma.users.count(),
      prisma.users.findMany({
        skip: offset,
        take: Number(limit),
        select: { id: true, username: true }
      })
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    };
  }

  static async findByUsername(username) {
    return prisma.users.findUnique({ where: { username } });
  }

  static async findById(id) {
    return prisma.users.findUnique({ where: { id } });
  }

  static async setPassword(id, passwordHash) {
    return prisma.users.update({ where: { id }, data: { password: passwordHash }, select: { id: true } });
  }
}
module.exports = UserModel;
