const { prisma } = require('../db');

class SupplierModel {
  static async getAll(params) {
    const { search, sort, page = 1, limit = 20 } = params;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contact_person: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    let orderBy = { id: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'name_desc') orderBy = { name: 'desc' };
    else if (sort === 'id_asc') orderBy = { id: 'asc' };
    else if (sort === 'id_desc') orderBy = { id: 'desc' };

    const offset = (Number(page) - 1) * Number(limit);

    const [total, data] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        skip: offset,
        take: Number(limit),
        orderBy
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

  static async create(payload) {
    return prisma.supplier.create({
      data: payload
    });
  }

  static async update(id, payload) {
    return prisma.supplier.update({
      where: { id: Number(id) },
      data: payload
    });
  }

  static async delete(id) {
    return prisma.supplier.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = SupplierModel;
