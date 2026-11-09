const { prisma } = require('../db');

class PosPaperModel {
  static async getAll(params = {}) {
    const { search, sort, page = 1, limit = 20 } = params;
    const where = {};
    if (search) {
      where.OR = [
        { paper_name: { contains: search } },
        { code: { contains: search } },
        { supplier_name: { contains: search } }
      ];
    }

    let orderBy = { updated_at: 'desc' };
    if (sort === 'name_asc') orderBy = { paper_name: 'asc' };
    else if (sort === 'name_desc') orderBy = { paper_name: 'desc' };
    else if (sort === 'quantity_desc') orderBy = { current_quantity: 'desc' };
    else if (sort === 'quantity_asc') orderBy = { current_quantity: 'asc' };
    else if (sort === 'created_at_asc') orderBy = { created_at: 'asc' };

    const offset = (Number(page) - 1) * Number(limit);

    const [total, data] = await Promise.all([
      prisma.posPaperInventory.count({ where }),
      prisma.posPaperInventory.findMany({
        where,
        skip: offset,
        take: Number(limit),
        include: {
          issues: {
            include: { employee: true },
            orderBy: { issue_date: 'desc' },
            take: 5
          }
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
    const { paper_name, code, total_quantity, unit_price, supplier_name, notes } = payload;
    const qty = Math.max(0, parseInt(total_quantity) || 0);

    return prisma.posPaperInventory.create({
      data: {
        paper_name,
        code: code || `PAP-${Date.now().toString().slice(-4)}`,
        total_quantity: qty,
        in_stock_quantity: qty,
        issued_quantity: 0,
        unit_price: unit_price ? Number(unit_price) : undefined,
        supplier_name: supplier_name || null,
        notes: notes || null
      }
    });
  }

  static async update(id, payload) {
    const { paper_name, code, total_quantity, unit_price, supplier_name, notes } = payload;
    const existing = await prisma.posPaperInventory.findUnique({ where: { id: Number(id) } });
    if (!existing) throw new Error('NOT_FOUND');

    let totalQty = existing.total_quantity;
    let inStockQty = existing.in_stock_quantity;

    if (total_quantity !== undefined) {
      const newTotal = Math.max(0, parseInt(total_quantity) || 0);
      const diff = newTotal - existing.total_quantity;
      totalQty = newTotal;
      inStockQty = Math.max(0, existing.in_stock_quantity + diff);
    }

    return prisma.posPaperInventory.update({
      where: { id: Number(id) },
      data: {
        paper_name,
        code,
        total_quantity: totalQty,
        in_stock_quantity: inStockQty,
        unit_price: unit_price ? Number(unit_price) : undefined,
        supplier_name: supplier_name || null,
        notes: notes || null
      }
    });
  }

  static async delete(id) {
    return prisma.posPaperInventory.delete({
      where: { id: Number(id) }
    });
  }

  static async issuePaper(payload) {
    const { paper_id, employee_id, employee_name, quantity, issue_date, issued_by, note } = payload;
    const qty = Math.max(1, parseInt(quantity) || 1);

    const paper = await prisma.posPaperInventory.findUnique({ where: { id: Number(paper_id) } });
    if (!paper) throw new Error('PAPER_NOT_FOUND');

    if (paper.in_stock_quantity < qty) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    let empName = employee_name;
    if (employee_id) {
      const emp = await prisma.employee.findUnique({ where: { id: Number(employee_id) } });
      if (emp) empName = emp.full_name;
    }

    return prisma.$transaction(async (tx) => {
      const issue = await tx.posPaperIssue.create({
        data: {
          paper_id: Number(paper_id),
          employee_id: employee_id ? Number(employee_id) : null,
          employee_name: empName || 'Nhân viên xí nghiệp',
          quantity: qty,
          issue_date: issue_date ? new Date(issue_date) : new Date(),
          issued_by: issued_by || 'Admin',
          note: note || null
        }
      });

      await tx.posPaperInventory.update({
        where: { id: Number(paper_id) },
        data: {
          in_stock_quantity: paper.in_stock_quantity - qty,
          issued_quantity: paper.issued_quantity + qty
        }
      });

      return issue;
    });
  }

  static async getIssues(params = {}) {
    const { page = 1, limit = 20 } = params;
    const offset = (Number(page) - 1) * Number(limit);

    const [total, data] = await Promise.all([
      prisma.posPaperIssue.count(),
      prisma.posPaperIssue.findMany({
        skip: offset,
        take: Number(limit),
        include: {
          paper: true,
          employee: { include: { department: true } }
        },
        orderBy: { issue_date: 'desc' }
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
}

module.exports = PosPaperModel;
