const { prisma } = require('../db');
const { EMPLOYEE_TYPE } = require('../constants/employee');

class PosModel {
  static async getAll(params) {
    const { search, enterprise, status, region, department_id, sort, page = 1, limit = 50 } = params;

    const where = {};
    if (search) {
      where.OR = [
        { serial_number: { contains: search } },
        { imei: { contains: search } },
        { sim_number: { contains: search } },
        { notes: { contains: search } },
        {
          assignments: {
            some: {
              returned_date: null,
              employee_name: { contains: search }
            }
          }
        },

        {
          borrowings: {
            some: {
              status: 'borrowing',
              borrower_name: { contains: search }
            }
          }
        }
      ];
    }

    if (enterprise) where.enterprise = enterprise;
    if (status) {
      if (status.includes(',')) {
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }
    if (region) where.region = { contains: region };
    if (department_id) {
      const targetDeptId = Number(department_id);
      const childDepts = await prisma.department.findMany({
        where: { parent_id: targetDeptId },
        select: { id: true }
      });
      const deptIds = [targetDeptId, ...childDepts.map(c => c.id)];

      where.assignments = {
        some: {
          returned_date: null,
          employee: {
            department_id: { in: deptIds }
          }
        }
      };
    }



    const offset = (Number(page) - 1) * Number(limit);

    // Compute aggregate stats ignoring status filter
    const statsWhere = { ...where };
    delete statsWhere.status;

    const [statsGroup, enterpriseGroup, totalCount] = await Promise.all([
      prisma.posDevice.groupBy({
        by: ['status'],
        where: statsWhere,
        _count: { id: true }
      }),
      prisma.posDevice.groupBy({
        by: ['enterprise'],
        where: statsWhere,
        _count: { id: true }
      }),
      prisma.posDevice.count({ where: statsWhere })
    ]);

    const stats = {
      total: totalCount,
      BSH: 0,
      NSH: 0,
      in_stock: 0,
      in_use: 0,
      borrowed: 0,
      broken: 0,
      retired: 0
    };

    enterpriseGroup.forEach(g => {
      if (g.enterprise === 'BSH') stats.BSH = g._count.id;
      if (g.enterprise === 'NSH') stats.NSH = g._count.id;
    });

    statsGroup.forEach(g => {
      if (stats[g.status] !== undefined) {
        stats[g.status] = g._count.id;
      }
    });

    let orderBy = { updated_at: 'desc' };
    if (sort === 'serial_asc') orderBy = { serial_number: 'asc' };
    else if (sort === 'serial_desc') orderBy = { serial_number: 'desc' };
    else if (sort === 'imei_asc') orderBy = { imei: 'asc' };
    else if (sort === 'imei_desc') orderBy = { imei: 'desc' };
    else if (sort === 'created_at_asc') orderBy = { created_at: 'asc' };
    else if (sort === 'created_at_desc') orderBy = { created_at: 'desc' };

    const [total, data] = await Promise.all([
      prisma.posDevice.count({ where }),
      prisma.posDevice.findMany({
        where,
        skip: offset,
        take: Number(limit),
        orderBy,
        include: {
          assignments: {
            where: { returned_date: null },
            include: { 
              employee: {
                include: {
                  department: {
                    include: { parent: true }
                  }
                }
              } 
            },
            orderBy: { assigned_date: 'desc' },
            take: 1
          },
          borrowings: {
            where: { status: 'borrowing' },
            include: { 
              employee: {
                include: { department: true }
              } 
            },
            orderBy: { borrow_date: 'desc' },
            take: 1
          }

        }
      })
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
        stats
      }
    };
  }

  static async getById(id) {
    return prisma.posDevice.findUnique({
      where: { id: Number(id) },
      include: {
        assignments: {
          include: { employee: true },
          orderBy: { assigned_date: 'desc' }
        },
        borrowings: {
          include: { employee: true },
          orderBy: { borrow_date: 'desc' }
        }
      }
    });
  }

  static async create(payload) {
    const { serial_number, imei, sim_number, sim_imei, telecom_plan, enterprise = 'BSH', region, status = 'in_stock', notes } = payload;

    const count = await prisma.posDevice.count({ where: { enterprise } });
    const assetCode = `POS-${enterprise}-${String(count + 1).padStart(4, '0')}`;

    return prisma.posDevice.create({
      data: {
        asset_code: assetCode,
        serial_number,
        imei: imei || null,
        sim_number: sim_number || null,
        sim_imei: sim_imei || null,
        telecom_plan: telecom_plan || null,
        enterprise,
        region: region || null,
        status,
        notes: notes || null
      }
    });
  }

  static async update(id, payload) {
    const { serial_number, imei, sim_number, sim_imei, telecom_plan, enterprise, region, status, notes } = payload;
    return prisma.posDevice.update({
      where: { id: Number(id) },
      data: {
        serial_number,
        imei: imei || null,
        sim_number: sim_number || null,
        sim_imei: sim_imei || null,
        telecom_plan: telecom_plan || null,
        enterprise,
        region: region || null,
        status,
        notes: notes || null
      }
    });
  }

  static async delete(id) {
    return prisma.posDevice.delete({
      where: { id: Number(id) }
    });
  }

  static async assign(posId, payload) {
    const { employee_id, employee_name, region, assigned_by, note, assigned_date } = payload;
    const pos = await prisma.posDevice.findUnique({ where: { id: Number(posId) } });
    if (!pos) throw new Error('Không tìm thấy máy POS');

    // Bắt buộc kiểm tra: Nếu máy POS đang được cấp phát cho người khác -> Yêu cầu thu hồi trước
    const activeAss = await prisma.posAssignment.findFirst({
      where: { pos_id: Number(posId), returned_date: null }
    });
    if (activeAss) {
      throw new Error(`Máy POS (Serial: ${pos.serial_number}) đang được cấp phát cho nhân viên "${activeAss.employee_name || 'khác'}". Vui lòng Bỏ cấp phát / Thu hồi máy POS trước khi giao cho nhân viên mới!`);
    }

    // Bắt buộc kiểm tra: Nếu máy POS đang ở trạng thái mượn -> Yêu cầu nhận trả kho trước
    const activeBor = await prisma.posBorrowing.findFirst({
      where: { pos_id: Number(posId), status: 'borrowing' }
    });
    if (activeBor) {
      throw new Error(`Máy POS (Serial: ${pos.serial_number}) đang được cho mượn bởi "${activeBor.borrower_name}". Vui lòng Nhận trả kho trước khi cấp phát!`);
    }

    let empName = employee_name;
    let empEnt = pos.enterprise;

    if (employee_id) {
      const emp = await prisma.employee.findUnique({
        where: { id: Number(employee_id) },
        include: { department: { include: { parent: true } } }
      });
      if (emp) {
        if (emp.employee_type !== undefined && emp.employee_type !== null && Number(emp.employee_type) !== EMPLOYEE_TYPE.FEE_COLLECTOR) {
          throw new Error(`Máy POS chỉ được cấp phát cho Nhân viên Thu phí! Nhân viên "${emp.full_name}" thuộc nhóm Nhân viên Văn phòng.`);
        }
        empName = emp.full_name;
        const rootDept = emp.department?.parent || emp.department;
        if (rootDept?.code === 'BSH' || rootDept?.code === 'NSH') {
          empEnt = rootDept.code;
        } else if (rootDept?.name?.includes('Bắc sông Hương')) {
          empEnt = 'BSH';
        } else if (rootDept?.name?.includes('Nam sông Hương')) {
          empEnt = 'NSH';
        }
      }
    }

    return prisma.$transaction(async (tx) => {
      // Create new assignment
      const assignment = await tx.posAssignment.create({
        data: {
          pos_id: Number(posId),
          employee_id: employee_id ? Number(employee_id) : null,
          employee_name: empName,
          assigned_date: assigned_date ? new Date(assigned_date) : new Date(),
          assigned_by: assigned_by || 'Admin',
          region: region || pos.region,
          note
        }
      });

      // Update POS status & sync enterprise code with employee's enterprise
      await tx.posDevice.update({
        where: { id: Number(posId) },
        data: {
          status: 'in_use',
          enterprise: empEnt,
          region: region || pos.region
        }
      });

      return assignment;
    });
  }

  static async updateAssignment(assignmentId, payload) {
    const { employee_id, employee_name, assigned_date, returned_date, region, note, assigned_by } = payload;
    const assignment = await prisma.posAssignment.findUnique({
      where: { id: Number(assignmentId) },
      include: { pos: true }
    });
    if (!assignment) throw new Error('Không tìm thấy thông tin cấp phát');

    let empName = employee_name;
    let empEnt = assignment.pos?.enterprise;

    if (employee_id) {
      const emp = await prisma.employee.findUnique({
        where: { id: Number(employee_id) },
        include: { department: { include: { parent: true } } }
      });
      if (emp) {
        if (emp.employee_type !== undefined && emp.employee_type !== null && Number(emp.employee_type) !== EMPLOYEE_TYPE.FEE_COLLECTOR) {
          throw new Error(`Máy POS chỉ được cấp phát cho Nhân viên Thu phí! Nhân viên "${emp.full_name}" thuộc nhóm Nhân viên Văn phòng.`);
        }
        empName = emp.full_name;
        const rootDept = emp.department?.parent || emp.department;
        if (rootDept?.code === 'BSH' || rootDept?.code === 'NSH') {
          empEnt = rootDept.code;
        } else if (rootDept?.name?.includes('Bắc sông Hương')) {
          empEnt = 'BSH';
        } else if (rootDept?.name?.includes('Nam sông Hương')) {
          empEnt = 'NSH';
        }
      }
    }

    const data = {};
    if (employee_id !== undefined) data.employee_id = employee_id ? Number(employee_id) : null;
    if (empName !== undefined) data.employee_name = empName;
    if (assigned_date !== undefined) data.assigned_date = assigned_date ? new Date(assigned_date) : new Date();
    if (returned_date !== undefined) data.returned_date = returned_date ? new Date(returned_date) : null;
    if (region !== undefined) data.region = region;
    if (note !== undefined) data.note = note;
    if (assigned_by !== undefined) data.assigned_by = assigned_by;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.posAssignment.update({
        where: { id: Number(assignmentId) },
        data
      });

      // If active assignment (returned_date is null), sync POS enterprise & region
      if (!updated.returned_date && assignment.pos_id) {
        const updatePosData = {};
        if (empEnt) updatePosData.enterprise = empEnt;
        if (region !== undefined) updatePosData.region = region;
        if (Object.keys(updatePosData).length > 0) {
          await tx.posDevice.update({
            where: { id: Number(assignment.pos_id) },
            data: updatePosData
          });
        }
      }

      return updated;
    });
  }

  static async deleteAssignment(assignmentId) {
    const assignment = await prisma.posAssignment.findUnique({
      where: { id: Number(assignmentId) }
    });
    if (!assignment) throw new Error('Không tìm thấy thông tin cấp phát');

    return prisma.$transaction(async (tx) => {
      await tx.posAssignment.delete({
        where: { id: Number(assignmentId) }
      });

      // If the deleted assignment was active, check if POS has other active assignment, otherwise return to in_stock
      if (!assignment.returned_date) {
        const remainingActive = await tx.posAssignment.findFirst({
          where: { pos_id: assignment.pos_id, returned_date: null }
        });
        if (!remainingActive) {
          await tx.posDevice.update({
            where: { id: assignment.pos_id },
            data: { status: 'in_stock' }
          });
        }
      }
    });
  }

  static async unassign(posId, payload = {}) {
    return prisma.$transaction(async (tx) => {
      await tx.posAssignment.updateMany({
        where: { pos_id: Number(posId), returned_date: null },
        data: {
          returned_date: payload.returned_date ? new Date(payload.returned_date) : new Date(),
          note: payload.note ? payload.note : undefined
        }
      });

      await tx.posDevice.update({
        where: { id: Number(posId) },
        data: { status: 'in_stock' }
      });
    });
  }

  static async borrow(posId, payload) {
    const { borrower_name, employee_id, expected_return_date, purpose, note } = payload;
    const pos = await prisma.posDevice.findUnique({ where: { id: Number(posId) } });
    if (!pos) throw new Error('Không tìm thấy máy POS');

    // Bắt buộc kiểm tra: Nếu máy POS đang được cấp phát -> Yêu cầu thu hồi trước
    const activeAss = await prisma.posAssignment.findFirst({
      where: { pos_id: Number(posId), returned_date: null }
    });
    if (activeAss) {
      throw new Error(`Máy POS (Serial: ${pos.serial_number}) đang được cấp phát cho nhân viên "${activeAss.employee_name || 'khác'}". Vui lòng Bỏ cấp phát / Thu hồi máy POS về kho trước khi lập phiếu cho mượn!`);
    }

    // Bắt buộc kiểm tra: Nếu máy POS đang được cho mượn -> Yêu cầu trả kho trước
    const activeBor = await prisma.posBorrowing.findFirst({
      where: { pos_id: Number(posId), status: 'borrowing' }
    });
    if (activeBor) {
      throw new Error(`Máy POS (Serial: ${pos.serial_number}) đang trong trạng thái cho mượn bởi "${activeBor.borrower_name}". Vui lòng Nhận trả kho trước!`);
    }

    return prisma.$transaction(async (tx) => {
      // Create new borrowing record
      const borrowing = await tx.posBorrowing.create({
        data: {
          pos_id: Number(posId),
          borrower_name,
          employee_id: employee_id ? Number(employee_id) : null,
          borrow_date: new Date(),
          expected_return_date: expected_return_date ? new Date(expected_return_date) : null,
          purpose: purpose || 'Mượn kho dự phòng',
          status: 'borrowing',
          note
        }
      });

      // Update POS status to borrowed
      await tx.posDevice.update({
        where: { id: Number(posId) },
        data: { status: 'borrowed' }
      });

      return borrowing;
    });
  }



  static async returnBorrow(posId, payload = {}) {
    return prisma.$transaction(async (tx) => {
      await tx.posBorrowing.updateMany({
        where: { pos_id: Number(posId), status: 'borrowing' },
        data: {
          returned_date: new Date(),
          status: 'returned',
          note: payload.note ? payload.note : undefined
        }
      });

      await tx.posDevice.update({
        where: { id: Number(posId) },
        data: { status: 'in_stock' }
      });
    });
  }

  static async getHistory(posId) {
    const [assignments, borrowings] = await Promise.all([
      prisma.posAssignment.findMany({
        where: { pos_id: Number(posId) },
        include: { employee: true },
        orderBy: { assigned_date: 'desc' }
      }),
      prisma.posBorrowing.findMany({
        where: { pos_id: Number(posId) },
        include: { employee: true },
        orderBy: { borrow_date: 'desc' }
      })
    ]);
    return { assignments, borrowings };
  }
}

module.exports = PosModel;
