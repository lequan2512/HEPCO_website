import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, Edit2, X, Search } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import { useGetEmployees, useGetDepartments, useAddEmployee, useUpdateEmployee, useDeleteEmployee } from '../../../apis/employee';
import ConfirmModal from '../../../components/ConfirmModal';

const AdminEmployeeManager = () => {
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading: isLoadingEmp } = useGetEmployees();
  const { data: departments = [], isLoading: isLoadingDept } = useGetDepartments();

  const addEmployeeMutation = useAddEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  const handleSuccess = (msg) => {
    toast.success(msg);
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    setIsFormOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const handleError = (error) => {
    toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
  };

  const formik = useFormik({
    initialValues: { employee_code: '', full_name: '', department_id: '', email: '', phone: '', status: 'active' },
    validationSchema: Yup.object({
      full_name: Yup.string().required('Bắt buộc'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingId) {
          await updateEmployeeMutation.mutateAsync({ id: editingId, ...values });
          handleSuccess('Cập nhật nhân viên thành công');
        } else {
          await addEmployeeMutation.mutateAsync(values);
          handleSuccess('Thêm nhân viên thành công');
        }
      } catch (error) {
        handleError(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEdit = (item) => {
    setEditingId(item.id);
    formik.setValues({
      employee_code: item.employee_code,
      full_name: item.full_name,
      department_id: item.department_id || '',
      email: item.email || '',
      phone: item.phone || '',
      status: item.status
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Nhân Viên',
      message: 'Bạn có chắc chắn xóa?',
      onConfirm: async () => {
        try {
          await deleteEmployeeMutation.mutateAsync(id);
          toast.success('Đã xóa');
          queryClient.invalidateQueries({ queryKey: ['employees'] });
        } catch (error) {
          handleError(error);
        }
      }
    });
  };

  if (isLoadingEmp || isLoadingDept) return <Loading />;

  const filteredEmployees = employees.filter(e => 
    e.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-hepco-green" /> Quản Lý Nhân Sự
        </h1>
        <div className="flex items-center w-full sm:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button 
            onClick={() => { setIsFormOpen(true); setEditingId(null); formik.resetForm(); }} 
            className="flex items-center whitespace-nowrap gap-2 px-4 py-2 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" /> <span>Thêm Nhân Viên</span>
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <form onSubmit={formik.handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-hepco-green" />}
                  {editingId ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên'}
                </h2>
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã NV</label>
                    <input type="text" name="employee_code" placeholder="Để trống để tự tạo" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.employee_code} onChange={formik.handleChange} />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ Tên <span className="text-red-500">*</span></label>
                  <input type="text" name="full_name" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.full_name} onChange={formik.handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.email} onChange={formik.handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điện Thoại</label>
                  <input type="text" name="phone" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.phone} onChange={formik.handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng Ban</label>
                  <select 
                    name="department_id" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white" 
                    value={formik.values.department_id} 
                    onChange={formik.handleChange}
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select name="status" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white" value={formik.values.status} onChange={formik.handleChange}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Đã nghỉ</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsFormOpen(false)} className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Hủy Bỏ</button>
                <button type="submit" disabled={formik.isSubmitting} className={`py-2.5 px-6 font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 text-white ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-hepco-green hover:bg-green-700'}`}>{editingId ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Mã NV</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Họ Tên</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Liên Hệ</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Phòng Ban</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-800 font-bold">{e.employee_code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{e.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.email}<br/>{e.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.department?.name || 'Chưa xếp'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(e)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(e.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy nhân viên nào</h3>
            <p className="text-gray-500 mt-1">Hệ thống chưa có dữ liệu hoặc không khớp với từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} />
    </div>
  );
};
export default AdminEmployeeManager;
