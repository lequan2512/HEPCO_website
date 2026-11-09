const { prisma } = require('../db');
const { EMPLOYEE_STATUS } = require('../constants/employee');

class EmployeeModel {
  static async getAll(params) {
    const { search, department_id, dept_type, type, employee_type, sort, page = 1, limit = 20, status } = params;
    const where = {};

    if (status !== undefined && status !== null && status !== '') {
      where.status = Number(status);
    }

    if (employee_type !== undefined && employee_type !== null && employee_type !== '') {
      where.employee_type = Number(employee_type);
    }

    if (department_id) {
      const targetDeptId = Number(department_id);
      const childDepts = await prisma.department.findMany({
        where: { parent_id: targetDeptId },
        select: { id: true }
      });
      const deptIds = [targetDeptId, ...childDepts.map(c => c.id)];
      where.department_id = { in: deptIds };
    }
    
    const targetDeptType = dept_type || type;
    if (targetDeptType !== undefined && targetDeptType !== null && targetDeptType !== '') {
      let numericDeptType;
      if (!isNaN(Number(targetDeptType))) {
        numericDeptType = Number(targetDeptType);
      } else if (targetDeptType === 'van_phong') {
        numericDeptType = 1;
      } else if (targetDeptType === 'xi_nghiep') {
        numericDeptType = 2;
      }
      if (numericDeptType !== undefined) {
        where.department = { type: numericDeptType };
      }
    }

    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { employee_code: { contains: search } },
        { email: { contains: search } }
      ];
    }

    let orderBy = { created_at: 'desc' };
    if (sort === 'name_asc') {
      orderBy = { full_name: 'asc' };
    } else if (sort === 'name_desc') {
      orderBy = { full_name: 'desc' };
    } else if (sort === 'code_asc') {
      orderBy = { employee_code: 'asc' };
    } else if (sort === 'code_desc') {
      orderBy = { employee_code: 'desc' };
    } else if (sort === 'created_at_asc') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'created_at_desc') {
      orderBy = { created_at: 'desc' };
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    const [total, data] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({ 
        where, 
        skip: offset,
        take: Number(limit),
        include: { 
          department: {
            include: { parent: true }
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

  static async getRootParentDepartment(departmentId) {
    if (!departmentId) return null;
    let dept = await prisma.department.findUnique({
      where: { id: Number(departmentId) },
      include: { parent: true }
    });
    while (dept && dept.parent_id) {
      const parent = await prisma.department.findUnique({
        where: { id: dept.parent_id },
        include: { parent: true }
      });
      if (!parent) break;
      dept = parent;
    }
    return dept;
  }

  static async create(payload) {
    const data = { ...payload };
    if (data.employee_type !== undefined) data.employee_type = Number(data.employee_type);
    if (data.status !== undefined) data.status = Number(data.status);
    return prisma.employee.create({ data });
  }

  static async update(id, payload) {
    const currentEmp = await prisma.employee.findUnique({
      where: { id: Number(id) },
      include: { department: true }
    });

    if (payload.department_id && payload.department_id !== currentEmp.department_id) {
      // Check active POS assignments
      const activePosAssignments = await prisma.posAssignment.findMany({
        where: {
          employee_id: Number(id),
          returned_date: null
        },
        include: { pos: true }
      });

      if (activePosAssignments.length > 0) {
        const currentRoot = await EmployeeModel.getRootParentDepartment(currentEmp.department_id);
        const newRoot = await EmployeeModel.getRootParentDepartment(payload.department_id);

        if (currentRoot && newRoot && currentRoot.id !== newRoot.id) {
          const err = new Error(`Nhân viên đang nắm giữ ${activePosAssignments.length} máy POS thuộc ${currentRoot.name}. Vui lòng bỏ cấp phát/thu hồi máy POS trước khi chuyển nhân viên sang đơn vị khác (${newRoot.name})!`);
          err.code = 'EMPLOYEE_POS_CROSS_ENTERPRISE';
          throw err;
        }
      }
    }

    const data = { ...payload };
    if (data.employee_type !== undefined) data.employee_type = Number(data.employee_type);
    if (data.status !== undefined) data.status = Number(data.status);

    return prisma.employee.update({
      where: { id: Number(id) },
      data
    });
  }

  static async delete(id) {
    const empId = Number(id);

    // 1. Kiểm tra thiết bị / máy POS đang nắm giữ chưa hoàn trả
    const [activeAssignments, activePosAssignments] = await Promise.all([
      prisma.deviceAssignment.count({
        where: {
          employee_id: empId,
          returned_date: null
        }
      }),
      prisma.posAssignment.count({
        where: {
          employee_id: empId,
          returned_date: null
        }
      })
    ]);

    if (activeAssignments > 0 || activePosAssignments > 0) {
      throw new Error('EMPLOYEE_HAS_DEVICES');
    }

    // 2. Kiểm tra xem nhân viên có bất kỳ lịch sử liên quan nào không
    const [totalDeviceAssignments, totalPosAssignments, totalBorrowings, totalPaperIssues] = await Promise.all([
      prisma.deviceAssignment.count({ where: { employee_id: empId } }),
      prisma.posAssignment.count({ where: { employee_id: empId } }),
      prisma.posBorrowing.count({ where: { employee_id: empId } }),
      prisma.posPaperIssue.count({ where: { employee_id: empId } })
    ]);

    const hasHistory = (totalDeviceAssignments + totalPosAssignments + totalBorrowings + totalPaperIssues) > 0;

    if (hasHistory) {
      // Đã có dữ liệu lịch sử -> Soft Delete (chuyển sang trạng thái đã nghỉ việc)
      await prisma.employee.update({ 
        where: { id: empId },
        data: { status: EMPLOYEE_STATUS.INACTIVE }
      });
      return { 
        action: 'deactivated', 
        message: 'Nhân viên đã có lịch sử dữ liệu nên đã được chuyển sang trạng thái "Đã nghỉ việc"' 
      };
    } else {
      // Chưa từng có dữ liệu ràng buộc -> Hard Delete (xóa hoàn toàn khỏi database)
      await prisma.employee.delete({ 
        where: { id: empId } 
      });
      return { 
        action: 'deleted', 
        message: 'Đã xóa nhân viên vĩnh viễn khỏi hệ thống' 
      };
    }
  }
}

module.exports = EmployeeModel;

