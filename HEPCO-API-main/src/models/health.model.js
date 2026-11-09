const { prisma } = require('../db');

class HealthModel {
  static async checkDb() {
    return prisma.$queryRaw`SELECT NOW() as serverTime`;
  }
}

module.exports = HealthModel;
