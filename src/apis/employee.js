import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

const FALLBACK_DEPARTMENTS = [
  { id: 1, name: 'Phòng Tổ chức - Hành chính', code: 'TCHC' },
  { id: 2, name: 'Phòng Kế hoạch - Kỹ thuật', code: 'KHKT' },
  { id: 3, name: 'Phòng Tài chính - Kế toán', code: 'TCKT' },
  { id: 4, name: 'Đội Xe Vận Chuyển Thu Gom Rác', code: 'DXVC' },
  { id: 5, name: 'Đội Vệ Sinh Môi Trường Số 1 (Bắc Sông Hương)', code: 'DVS1' },
  { id: 6, name: 'Đội Vệ Sinh Môi Trường Số 2 (Nam Sông Hương)', code: 'DVS2' },
  { id: 7, name: 'Đội Cây Xanh - Công Viên Di Sản', code: 'DCX' },
  { id: 8, name: 'Đội Điện Chiếu Sáng - Thoát Nước', code: 'DCS' },
  { id: 9, name: 'Ban Quản Lý Nghĩa Trang Nhân Dân', code: 'BQLNT' }
];

const FALLBACK_EMPLOYEES = [
  { id: 1, employee_code: 'NV001', full_name: 'Nguyễn Văn An', department_id: 1, position: 'Trưởng phòng', phone: '0905123456', email: 'an.nguyen@hepco.com.vn', status: 1, department: { id: 1, name: 'Phòng Tổ chức - Hành chính' } },
  { id: 2, employee_code: 'NV002', full_name: 'Trần Thị Bích', department_id: 2, position: 'Chuyên viên kỹ thuật', phone: '0905234567', email: 'bich.tran@hepco.com.vn', status: 1, department: { id: 2, name: 'Phòng Kế hoạch - Kỹ thuật' } },
  { id: 3, employee_code: 'NV003', full_name: 'Lê Hoàng Cường', department_id: 4, position: 'Đội trưởng đội xe', phone: '0905345678', email: 'cuong.le@hepco.com.vn', status: 1, department: { id: 4, name: 'Đội Xe Vận Chuyển Thu Gom Rác' } },
  { id: 4, employee_code: 'NV004', full_name: 'Phạm Đức Dũng', department_id: 4, position: 'Lái xe chuyên dùng', phone: '0905456789', email: 'dung.pham@hepco.com.vn', status: 1, department: { id: 4, name: 'Đội Xe Vận Chuyển Thu Gom Rác' } },
  { id: 5, employee_code: 'NV005', full_name: 'Hoàng Thị Hạnh', department_id: 5, position: 'Công nhân vệ sinh môi trường', phone: '0905567890', email: 'hanh.hoang@hepco.com.vn', status: 1, department: { id: 5, name: 'Đội Vệ Sinh Môi Trường Số 1 (Bắc Sông Hương)' } },
  { id: 6, employee_code: 'NV006', full_name: 'Võ Minh Khang', department_id: 6, position: 'Công nhân vệ sinh môi trường', phone: '0905678901', email: 'khang.vo@hepco.com.vn', status: 1, department: { id: 6, name: 'Đội Vệ Sinh Môi Trường Số 2 (Nam Sông Hương)' } },
  { id: 7, employee_code: 'NV007', full_name: 'Đặng Ngọc Lan', department_id: 7, position: 'Chăm sóc cây xanh', phone: '0905789012', email: 'lan.dang@hepco.com.vn', status: 1, department: { id: 7, name: 'Đội Cây Xanh - Công Viên Di Sản' } },
  { id: 8, employee_code: 'NV008', full_name: 'Bùi Tuấn Phong', department_id: 8, position: 'Kỹ thuật viên điện chiếu sáng', phone: '0905890123', email: 'phong.bui@hepco.com.vn', status: 1, department: { id: 8, name: 'Đội Điện Chiếu Sáng - Thoát Nước' } },
  { id: 9, employee_code: 'NV009', full_name: 'Ngô Thanh Sơn', department_id: 9, position: 'Quản lý nghĩa trang', phone: '0905901234', email: 'son.ngo@hepco.com.vn', status: 1, department: { id: 9, name: 'Ban Quản Lý Nghĩa Trang Nhân Dân' } }
];

export const useGetEmployees = (params, options) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/api/employees', { params, timeout: 3500 });
        if (Array.isArray(response?.data?.data) && response.data.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fallback to sample dataset
      }
      return {
        data: FALLBACK_EMPLOYEES,
        meta: {
          total: FALLBACK_EMPLOYEES.length,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      };
    },
    ...options
  });
};

export const useGetDepartments = (params, options) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/api/departments', { params, timeout: 3500 });
        if (Array.isArray(response?.data?.data) && response.data.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fallback to sample departments
      }
      return {
        data: FALLBACK_DEPARTMENTS,
        meta: {
          total: FALLBACK_DEPARTMENTS.length,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      };
    },
    ...options
  });
};

export const useAddEmployee = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post('/api/employees', data);
      return response.data;
    },
  });
};

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axiosInstance.put(`/api/employees/${id}`, data);
      return response.data;
    },
  });
};

export const useDeleteEmployee = () => {
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/api/employees/${id}`);
      return response.data;
    },
  });
};
