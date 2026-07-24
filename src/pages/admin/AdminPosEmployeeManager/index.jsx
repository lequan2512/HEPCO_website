import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserCheck, Plus, Trash2, Edit2, X, Search, Building2, Phone, Mail, MoreVertical, RefreshCw, Users, ShieldCheck } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import { useGetEmployees, useAddEmployee, useUpdateEmployee, useDeleteEmployee } from '../../../apis/employee';
import { useGetDepartments } from '../../../apis/department';

const AdminPosEmployeeManager = () => {
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentIdFilter, setDepartmentIdFilter] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch employees filtered specifically for Xí Nghiệp (type = xi_nghiep)
  const { data: employeesRes, isLoading } = useGetEmployees({
    search: debouncedSearch,
    dept_type: 'xi_nghiep',
    department_id: departmentIdFilter || undefined,
    page,
    limit: 20
  });

  const { data: deptsRes } = useGetDepartments({ type: 'xi_nghiep', limit: 100 });
  const xiNghiepDepartments = deptsRes?.data || [];

  const employees = employeesRes?.data || [];
  const meta = employeesRes?.meta;

  const addMutation = useAddEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  // Compute Stats for top widget
  const totalEmployees = meta?.total || employees.length;
  const bshEmployeesCount = employees.filter(e => e.department?.name?.includes('Bắc sông Hương')).length;
  const nshEmployeesCount = employees.filter(e => e.department?.name?.includes('Nam sông Hương')).length;

  const handleSuccess = (msg) => {
    toast.success(msg);
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    setIsFormOpen(false);
    setEditingId(null);
    formik.resetForm();
  };

  const handleError = (error) => {
    toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin nhân viên thu phí');
  };

  const formik = useFormik({
    initialValues: {
      employee_code: '',
      full_name: '',
      department_id: '',
      position: 'Nhân viên thu phí',
      email: '',
      phone: ''
    },
    validationSchema: Yup.object({
      employee_code: Yup.string().required('Vui lòng nhập mã nhân viên'),
      full_name: Yup.string().required('Vui lòng nhập họ và tên'),
      department_id: Yup.string().required('Vui lòng chọn Xí Nghiệp'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          department_id: Number(values.department_id)
        };
        if (editingId) {
          await updateMutation.mutateAsync({ id: editingId, ...payload });
          handleSuccess('Cập nhật thông tin NV Thu phí thành công');
        } else {
          await addMutation.mutateAsync(payload);
          handleSuccess('Thêm nhân viên thu phí mới thành công');
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
      employee_code: item.employee_code || '',
      full_name: item.full_name || '',
      department_id: item.department_id ? String(item.department_id) : '',
      position: item.position || 'Nhân viên thu phí',
      email: item.email || '',
      phone: item.phone || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa Nhân Viên Thu Phí',
      message: 'Bạn có chắc chắn muốn xóa nhân viên thu phí này khỏi hệ thống?',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          toast.success('Đã xóa nhân viên thu phí');
          queryClient.invalidateQueries({ queryKey: ['employees'] });
        } catch (error) {
          handleError(error);
        }
      }
    });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="w-full relative space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-hepco-green" /> Quản Lý Nhân Viên Thu Phí
          </h1>
        </div>


        <button
          onClick={() => { setIsFormOpen(true); setEditingId(null); formik.resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> <span>Thêm NV Thu Phí</span>
        </button>
      </div>

      {/* Stats Widgets Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalEmployees}</div>
            <div className="text-xs text-gray-500 font-medium">Tổng NV Thu Phí</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-900">{bshEmployeesCount}</div>
            <div className="text-xs text-gray-500 font-medium">XN Bắc Sông Hương</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-900">{nshEmployeesCount}</div>
            <div className="text-xs text-gray-500 font-medium">XN Nam Sông Hương</div>
          </div>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo Mã NV, Họ tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={departmentIdFilter}
            onChange={(e) => { setDepartmentIdFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:bg-white"
          >
            <option value="">Tất cả Xí Nghiệp</option>
            {xiNghiepDepartments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {(searchQuery || departmentIdFilter) && (
            <button
              onClick={() => { setSearchQuery(''); setDepartmentIdFilter(''); setPage(1); }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Xóa bộ lọc"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <th className="px-6 py-4">Mã NV</th>
                  <th className="px-6 py-4">Họ & Tên</th>
                  <th className="px-6 py-4">Xí Nghiệp Trực Thuộc</th>
                  <th className="px-6 py-4">Chức Vụ</th>
                  <th className="px-6 py-4">Liên Hệ</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{emp.employee_code}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {emp.full_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold border border-purple-100">
                        <Building2 className="w-3.5 h-3.5" />
                        {emp.department?.name || 'Xí nghiệp chưa gán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{emp.position || 'Nhân viên thu phí'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {emp.phone && <div className="flex items-center gap-1.5 font-medium text-gray-800"><Phone className="w-3.5 h-3.5 text-green-600" /> {emp.phone}</div>}
                      {emp.email && <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5"><Mail className="w-3 h-3" /> {emp.email}</div>}
                    </td>
                    <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === emp.id ? null : emp.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        title="Thao tác"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === emp.id && (
                        <div className="absolute right-6 top-10 bg-white border border-gray-100 shadow-xl rounded-xl w-44 z-20 flex flex-col overflow-hidden py-1 text-left">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleEdit(emp); }}
                            className="w-full px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                            Sửa thông tin
                          </button>

                          <div className="border-t border-gray-100 my-1"></div>

                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDelete(emp.id); }}
                            className="w-full px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            Xóa nhân viên
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <UserCheck className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Chưa có dữ liệu nhân viên thu phí</h3>
            <p className="text-gray-500 text-sm mt-1">Chưa có nhân viên thu phí thuộc các Xí Nghiệp địa bàn.</p>
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

      {/* Modal Add/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative">
            <form onSubmit={formik.handleSubmit}>
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-hepco-green" />
                  {editingId ? 'Cập Nhật NV Thu Phí' : 'Thêm Nhân Viên Thu Phí'}
                </h2>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500 p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã Nhân Viên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="employee_code"
                    placeholder="VD: NVTP001"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.employee_code}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.employee_code && formik.errors.employee_code && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.employee_code}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ & Tên Nhân Viên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Nhập họ và tên..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.full_name}
                    onChange={formik.handleChange}
                  />
                  {formik.touched.full_name && formik.errors.full_name && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.full_name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xí Nghiệp Trực Thuộc <span className="text-red-500">*</span></label>
                  <select
                    name="department_id"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white"
                    value={formik.values.department_id}
                    onChange={formik.handleChange}
                  >
                    <option value="">-- Chọn Xí Nghiệp --</option>
                    {xiNghiepDepartments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {formik.touched.department_id && formik.errors.department_id && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.department_id}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức Vụ</label>
                  <input
                    type="text"
                    name="position"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.position}
                    onChange={formik.handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Nhập số điện thoại..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50"
                    value={formik.values.phone}
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

export default AdminPosEmployeeManager;
