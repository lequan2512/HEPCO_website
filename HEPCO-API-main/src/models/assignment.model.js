const { prisma } = require('../db');
const { DEVICE_STATUS, ASSIGNMENT_STATUS } = require('../constants/device');
const { EMPLOYEE_TYPE } = require('../constants/employee');

class AssignmentModel {
  static async getAll(params) {
    const { search, department_id, start_date, end_date, category_id, status, sort, page = 1, limit = 20 } = params;
    const where = {};
    if (search) {
      where.OR = [
        { device: { name: { contains: search } } },
        { device: { asset_code: { contains: search } } },
        { employee: { full_name: { contains: search } } },
        { employee: { employee_code: { contains: search } } }
      ];
    }
    if (department_id) {
      where.employee = { department_id: Number(department_id) };
    }
    if (category_id) {
      where.device = { ...where.device, category_id: Number(category_id) };
    }
    if (start_date || end_date) {
      where.assigned_date = {};
      if (start_date) where.assigned_date.gte = new Date(`${start_date}T00:00:00.000Z`);
      if (end_date) where.assigned_date.lte = new Date(`${end_date}T23:59:59.999Z`);
    }
    if (status) {
      if (status === ASSIGNMENT_STATUS.RETURNED) {
        where.returned_date = { not: null };
      } else if (status === ASSIGNMENT_STATUS.IN_USE) {
        where.returned_date = null;
      }
    }

    let orderBy = { assigned_date: 'desc' };
    if (sort === 'assigned_date_asc') orderBy = { assigned_date: 'asc' };
    else if (sort === 'employee_name_asc') orderBy = { employee: { full_name: 'asc' } };
    else if (sort === 'employee_name_desc') orderBy = { employee: { full_name: 'desc' } };
    else if (sort === 'employee_code_asc') orderBy = { employee: { employee_code: 'asc' } };
    else if (sort === 'employee_code_desc') orderBy = { employee: { employee_code: 'desc' } };
    else if (sort === 'device_name_asc') orderBy = { device: { name: 'asc' } };
    else if (sort === 'device_name_desc') orderBy = { device: { name: 'desc' } };
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const [total, data] = await Promise.all([
      prisma.deviceAssignment.count({ where }),
      prisma.deviceAssignment.findMany({ 
        where, 
        skip: offset,
        take: Number(limit),
        include: { 
          device: {
            include: { category: true, child_devices: { include: { category: true } } }
          }, 
          employee: {
            include: { department: true }
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

  static async getExportData(params) {
    const { search, department_id, start_date, end_date, category_id } = params;
    const where = { returned_date: null };
    if (search) {
      where.OR = [
        { device: { name: { contains: search } } },
        { device: { asset_code: { contains: search } } },
        { employee: { full_name: { contains: search } } },
        { employee: { employee_code: { contains: search } } }
      ];
    }
    if (department_id) {
      where.employee = { department_id: Number(department_id) };
    }
    if (category_id) {
      where.device = { ...where.device, category_id: Number(category_id) };
    }
    if (start_date || end_date) {
      where.assigned_date = {};
      if (start_date) where.assigned_date.gte = new Date(`${start_date}T00:00:00.000Z`);
      if (end_date) where.assigned_date.lte = new Date(`${end_date}T23:59:59.999Z`);
    }

    const data = await prisma.deviceAssignment.findMany({ 
      where, 
      include: { 
        device: {
          include: { category: true, child_devices: { include: { category: true } } }
        }, 
        employee: {
          include: { department: true }
        }
      },
      orderBy: { assigned_date: 'desc' }
    });

    const grouped = {};
    data.forEach(item => {
      const deptName = item.employee?.department?.name || 'Khác';
      if (!grouped[deptName]) grouped[deptName] = [];
      grouped[deptName].push(item);
    });

    return grouped;
  }

  static async create(payload) {
    const { device_id, employee_id, assigned_date, assigned_by, note } = payload;
    const [device, emp] = await Promise.all([
      prisma.device.findUnique({ where: { id: Number(device_id) }, include: { category: true } }),
      prisma.employee.findUnique({ where: { id: Number(employee_id) } })
    ]);

    if (device && emp) {
      if (Number(emp.employee_type) === EMPLOYEE_TYPE.FEE_COLLECTOR && (device.category?.name === 'PC' || device.category?.name === 'Laptop')) {
        throw new Error(`Thiết bị ${device.category?.name || 'máy tính'} (${device.name}) chỉ dành cho Nhân viên Văn phòng. Nhân viên "${emp.full_name}" thuộc nhóm NV Thu phí.`);
      }
    }

    return prisma.$transaction(async (tx) => {
      const newAssign = await tx.deviceAssignment.create({
        data: {
          device_id: Number(device_id),
          employee_id: Number(employee_id),
          assigned_date: new Date(assigned_date),
          assigned_by, note
        }
      });
      await tx.device.update({
        where: { id: Number(device_id) },
        data: { status: DEVICE_STATUS.IN_USE }
      });
      return newAssign;
    });
  }

  static async returnAssignment(id, payload) {
    const { returned_date, note, return_status } = payload;
    const assignment = await prisma.deviceAssignment.findUnique({ where: { id: Number(id) }});
    if (!assignment) throw new Error('NOT_FOUND');

    await prisma.$transaction(async (tx) => {
      await tx.deviceAssignment.update({
        where: { id: Number(id) },
        data: { returned_date: new Date(returned_date), note }
      });
      await tx.device.update({
        where: { id: assignment.device_id },
        data: { status: return_status || DEVICE_STATUS.IN_STOCK }
      });
    });
    return true;
  }

  static async update(id, payload) {
    const { employee_id, assigned_date, returned_date, assigned_by, note } = payload;
    const data = {};
    if (employee_id) data.employee_id = Number(employee_id);
    if (assigned_date) data.assigned_date = new Date(assigned_date);
    if (returned_date) data.returned_date = new Date(returned_date);
    if (assigned_by !== undefined) data.assigned_by = assigned_by;
    if (note !== undefined) data.note = note;

    return prisma.deviceAssignment.update({
      where: { id: Number(id) },
      data
    });
  }

  static async delete(id) {
    const assignment = await prisma.deviceAssignment.findUnique({ where: { id: Number(id) }});
    if (!assignment) throw new Error('NOT_FOUND');

    return prisma.$transaction(async (tx) => {
      // Nếu cấp phát chưa được thu hồi (vẫn đang hiệu lực), cần trả lại trạng thái IN_STOCK cho thiết bị
      if (!assignment.returned_date) {
        await tx.device.update({
          where: { id: assignment.device_id },
          data: { status: DEVICE_STATUS.IN_STOCK }
        });
      }
      // Xóa bản ghi lịch sử cấp phát
      return tx.deviceAssignment.delete({ where: { id: Number(id) } });
    });
  }
}

module.exports = AssignmentModel;
