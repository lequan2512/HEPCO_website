const { prisma } = require('../db');

class IpWhitelistModel {
  static async checkIp(ipAddress) {
    const ip = await prisma.ipWhitelist.findUnique({
      where: { ip: ipAddress }
    });
    return !!ip;
  }

  static async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const [total, data] = await Promise.all([
      prisma.ipWhitelist.count(),
      prisma.ipWhitelist.findMany({
        skip: offset,
        take: parseInt(limit),
        orderBy: { id: 'desc' }
      })
    ]);
    
    return {
      data,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async add(ip, description) {
    await prisma.ipWhitelist.create({
      data: { ip, description }
    });
  }

  static async delete(id) {
    await prisma.ipWhitelist.delete({
      where: { id: parseInt(id) }
    });
  }

  static async update(id, ip, description) {
    await prisma.ipWhitelist.update({
      where: { id: parseInt(id) },
      data: { ip, description }
    });
  }
}

module.exports = IpWhitelistModel;
