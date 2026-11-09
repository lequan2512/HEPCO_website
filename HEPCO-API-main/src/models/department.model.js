const { prisma } = require('../db');

class DepartmentModel {
  static async getAll(params = {}) {
    const { search, type, dept_type, sort, page = 1, limit = 20 } = params;
    const where = {};
    const targetType = type || dept_type;
    if (targetType !== undefined && targetType !== null && targetType !== '') {
      if (!isNaN(Number(targetType))) {
        where.type = Number(targetType);
      } else if (targetType === 'van_phong') {
        where.type = 1;
      } else if (targetType === 'xi_nghiep') {
        where.type = 2;
      }
    }
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } }
      ];
    }

    let orderBy = { id: 'asc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    else if (sort === 'name_desc') orderBy = { name: 'desc' };
    else if (sort === 'code_asc') orderBy = { code: 'asc' };
    else if (sort === 'code_desc') orderBy = { code: 'desc' };
    else if (sort === 'id_desc') orderBy = { id: 'desc' };
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const [total, data] = await Promise.all([
      prisma.department.count({ where }),
      prisma.department.findMany({ 
        where, 
        skip: offset,
        take: Number(limit),
        include: {
          parent: true,
          children: true
        },
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
    const { parent_id, type, ...rest } = payload;
    let numericType = 1;
    if (type !== undefined && type !== null) {
      if (!isNaN(Number(type))) numericType = Number(type);
      else if (type === 'xi_nghiep') numericType = 2;
      else if (type === 'van_phong') numericType = 1;
    }
    return prisma.department.create({
      data: {
        ...rest,
        type: numericType,
        parent_id: parent_id ? Number(parent_id) : null
      }
    });
  }

  static async update(id, payload) {
    const { parent_id, type, ...rest } = payload;
    const updateData = { ...rest };
    if (parent_id !== undefined) updateData.parent_id = parent_id ? Number(parent_id) : null;
    if (type !== undefined && type !== null) {
      if (!isNaN(Number(type))) updateData.type = Number(type);
      else if (type === 'xi_nghiep') updateData.type = 2;
      else if (type === 'van_phong') updateData.type = 1;
    }
    return prisma.department.update({
      where: { id: Number(id) },
      data: updateData
    });
  }


  static async delete(id) {
    return prisma.department.delete({ 
      where: { id: Number(id) } 
    });
  }
}

module.exports = DepartmentModel;
