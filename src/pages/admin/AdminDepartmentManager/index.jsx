import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Trash2, Edit2, X, Search } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import { useGetDepartments, useAddDepartment, useUpdateDepartment, useDeleteDepartment } from '../../../apis/department';
import ConfirmModal from '../../../components/ConfirmModal';

const AdminDepartmentManager = () => {
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading } = useGetDepartments();
  const addMutation = useAddDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const handleSuccess = (msg) => {
    toast.success(msg);
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    setIsFormOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const handleError = (error) => {
    toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
  };

  const formik = useFormik({
    initialValues: { code: '', name: '', description: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Bắt buộc nhập tên phòng ban'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingId) {
          await updateMutation.mutateAsync({ id: editingId, ...values });
          handleSuccess('Cập nhật phòng ban thành công');
        } else {
          await addMutation.mutateAsync(values);
          handleSuccess('Thêm phòng ban thành công');
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
      code: item.code || '',
      name: item.name,
      description: item.description || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Phòng Ban',
      message: 'Bạn có chắc chắn muốn xóa phòng ban này? Các nhân viên thuộc phòng ban có thể bị ảnh hưởng.',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success('Đã xóa phòng ban');
          queryClient.invalidateQueries({ queryKey: ['departments'] });
        } catch (error) {
          handleError(error);
        }
      }
    });
  };

  if (isLoading) return <Loading />;

  const filteredDepartments = departments.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-hepco-green" /> Quản lý Phòng Ban
        </h1>
        <div className="flex items-center w-full sm:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng ban..."
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
            <Plus className="w-5 h-5" /> <span>Thêm Phòng Ban</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredDepartments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Mã PB</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Tên Phòng Ban</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Mô tả</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDepartments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-800 font-bold">{item.code || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[300px]">{item.description || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <Building2 className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy phòng ban nào</h3>
            <p className="text-gray-500 mt-1">Hệ thống chưa có dữ liệu hoặc không khớp với từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative">
            <form onSubmit={formik.handleSubmit}>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-hepco-green" />}
                  {editingId ? 'Cập nhật Phòng Ban' : 'Thêm Phòng Ban'}
                </h2>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã Phòng Ban</label>
                  <input 
                    type="text" 
                    name="code"
                    placeholder="Để trống để tự tạo"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.code && formik.errors.code && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.code}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Phòng Ban <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea 
                    name="description"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 min-h-[100px]"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
              
              <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100">
                  Hủy Bỏ
                </button>
                <button type="submit" disabled={formik.isSubmitting} className="py-2.5 px-6 font-bold rounded-lg text-white bg-hepco-green hover:bg-green-700">
                  {editingId ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartmentManager;
