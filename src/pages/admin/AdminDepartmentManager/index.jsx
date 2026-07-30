import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Trash2, Edit2, X, Search, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import { useGetDepartments, useAddDepartment, useUpdateDepartment, useDeleteDepartment } from '../../../apis/department';
import { DEPARTMENT_TYPE, DEPARTMENT_TYPE_OPTIONS, getDepartmentTypeConfig } from '../../../constants/department';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';

const AdminDepartmentManager = () => {
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOption, setSortOption] = useState('id_asc');
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: departmentsRes, isLoading } = useGetDepartments({ search: debouncedSearch, type: typeFilter || undefined, sort: sortOption, page, limit: 20 });
  const departments = departmentsRes?.data || [];
  const meta = departmentsRes?.meta;
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
    const errorCode = error?.response?.data?.errorCode;
    toast.error(errorCode ? getErrorMessage(errorCode) : (error?.response?.data?.message || 'Có lỗi xảy ra'));
  };

  const formik = useFormik({
    initialValues: { code: '', name: '', type: DEPARTMENT_TYPE.OFFICE, parent_id: '', description: '' },
    validationSchema: Yup.object({
      code: Yup.string().required('Vui lòng nhập mã phòng ban'),
      name: Yup.string().required('Vui lòng nhập tên phòng ban'),
      type: Yup.number().required('Vui lòng chọn loại phòng ban'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          type: Number(values.type),
          parent_id: values.parent_id ? Number(values.parent_id) : null
        };
        if (editingId) {
          await updateMutation.mutateAsync({ id: editingId, ...payload });
          handleSuccess('Cập nhật phòng ban thành công');
        } else {
          await addMutation.mutateAsync(payload);
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
      type: item.type ? Number(item.type) : DEPARTMENT_TYPE.OFFICE,
      parent_id: item.parent_id ? String(item.parent_id) : '',
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

  const filteredDepartments = departments;

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-hepco-green" /> Quản lý Phòng Ban & Xí Nghiệp
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-3">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white text-gray-700"
          >
            <option value="">Tất cả Loại</option>
            {DEPARTMENT_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>



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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-100">
                <th
                  onClick={() => setSortOption(prev => prev === 'code_asc' ? 'code_desc' : 'code_asc')}
                  className="px-6 py-4 text-sm font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mã PB</span>
                    {sortOption === 'code_asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-hepco-green font-bold" />
                    ) : sortOption === 'code_desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-hepco-green font-bold" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => setSortOption(prev => prev === 'name_asc' ? 'name_desc' : 'name_asc')}
                  className="px-6 py-4 text-sm font-bold text-gray-700 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tên Phòng Ban</span>
                    {sortOption === 'name_asc' ? (
                      <ArrowUp className="w-3.5 h-3.5 text-hepco-green font-bold" />
                    ) : sortOption === 'name_desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-hepco-green font-bold" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Đơn vị</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Mô tả</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 text-hepco-green animate-spin" />
                      <span className="text-xs font-semibold text-gray-500">Đang tải dữ liệu phòng ban...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Building2 className="w-7 h-7 text-gray-300" />
                      </div>
                      <h3 className="text-base font-bold text-gray-800">Không tìm thấy phòng ban nào</h3>
                      <p className="text-xs text-gray-500 mt-1">Hệ thống chưa có dữ liệu hoặc không khớp với tìm kiếm.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((item) => {
                  const typeConfig = getDepartmentTypeConfig(item.type);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-800 font-bold">{item.code || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {item.parent ? (
                          <div className="pl-3 border-l-2 border-purple-400">
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-xs text-purple-700 font-medium mt-0.5 whitespace-nowrap">
                              ↳ Trực thuộc: <span className="font-bold">{item.parent.name}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            {item.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold border ${typeConfig.bg}`}>
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[250px]">{item.description || '-'}</td>
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
                  );
                })
              )}
            </tbody>
          </table>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] relative">
            <form onSubmit={formik.handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b shrink-0 bg-gray-50/50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-hepco-green" />}
                  {editingId ? 'Cập nhật Phòng Ban' : 'Thêm Phòng Ban'}
                </h2>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mã Phòng Ban<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="code"
                    placeholder="Nhập mã phòng ban..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.code && formik.errors.code && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.code}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tên Phòng Ban <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nhập tên phòng ban hoặc khu vực..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Đơn Vị Trực Thuộc </label>
                  <select
                    name="parent_id"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white text-gray-800 font-medium"
                    value={formik.values.parent_id}
                    onChange={formik.handleChange}
                  >
                    <option value="">-- Đơn Vị Cấp 1 (Độc Lập/Cấp Trên) --</option>
                    {departments.filter(d => d.id !== editingId).map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code || 'Mã PB'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phân Loại Đơn Vị <span className="text-red-500">*</span></label>
                  <select
                    name="type"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                  >
                    {DEPARTMENT_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-hepco-green/50 min-h-[80px]"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t bg-gray-50 flex justify-end gap-2.5 sm:gap-3 shrink-0">
                <button type="button" onClick={() => setIsFormOpen(false)} className="py-2 px-4 sm:py-2.5 sm:px-5 border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-100">
                  Hủy Bỏ
                </button>
                <button type="submit" disabled={formik.isSubmitting} className="py-2 px-5 sm:py-2.5 sm:px-6 font-bold text-xs sm:text-sm rounded-lg text-white bg-hepco-green hover:bg-green-700">
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
