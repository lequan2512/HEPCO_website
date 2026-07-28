import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, Edit2, X, Search, Phone, Mail, MoreVertical, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';
import { useGetEmployees, useAddEmployee, useUpdateEmployee, useDeleteEmployee } from '../../../apis/employee';
import { useGetDepartments } from '../../../apis/department';
import { DEPARTMENT_TYPE } from '../../../constants/department';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import { EMPLOYEE_STATUS, EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUS_OPTIONS, EMPLOYEE_TYPE, EMPLOYEE_TYPE_OPTIONS } from '../../../constants/employee';

const AdminEmployeeManager = () => {
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentIdFilter, setDepartmentIdFilter] = useState('');
  const [sortOption, setSortOption] = useState('created_at_desc');
  const [page, setPage] = useState(1);
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

  const { data: employeesRes, isLoading: isLoadingEmp } = useGetEmployees({
    search: debouncedSearch,
    dept_type: DEPARTMENT_TYPE.OFFICE,
    employee_type: EMPLOYEE_TYPE.OFFICE_STAFF,
    department_id: departmentIdFilter || undefined,
    sort: sortOption,
    page,
    limit: 20
  });

  const employees = employeesRes?.data || [];
  const meta = employeesRes?.meta;

  const { data: departmentsRes = {}, isLoading: isLoadingDept } = useGetDepartments({ type: DEPARTMENT_TYPE.OFFICE, limit: 1000 });
  const departments = departmentsRes?.data || [];

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
    const errorCode = error?.response?.data?.errorCode;
    toast.error(errorCode ? getErrorMessage(errorCode) : (error?.response?.data?.message || 'Có lỗi xảy ra'));
  };

  const formik = useFormik({
    initialValues: { employee_code: '', full_name: '', department_id: '', position: '', employee_type: EMPLOYEE_TYPE.OFFICE_STAFF, email: '', phone: '', status: EMPLOYEE_STATUS.ACTIVE },
    validationSchema: Yup.object({
      employee_code: Yup.string().required('Vui lòng nhập mã nhân viên'),
      full_name: Yup.string().required('Vui lòng nhập họ tên'),
      department_id: Yup.string().required('Vui lòng chọn phòng ban'),
      email: Yup.string().email('Email không hợp lệ'),
      phone: Yup.string(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          department_id: Number(values.department_id),
          employee_type: Number(values.employee_type),
          status: Number(values.status)
        };
        if (editingId) {
          await updateEmployeeMutation.mutateAsync({ id: editingId, ...payload });
          handleSuccess('Cập nhật thông tin nhân viên thành công');
        } else {
          await addEmployeeMutation.mutateAsync(payload);
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
      department_id: item.department_id ? String(item.department_id) : '',
      position: item.position || '',
      employee_type: item.employee_type !== undefined && item.employee_type !== null ? item.employee_type : EMPLOYEE_TYPE.OFFICE_STAFF,
      email: item.email || '',
      phone: item.phone || '',
      status: item.status !== undefined && item.status !== null ? item.status : EMPLOYEE_STATUS.ACTIVE
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Vô hiệu hóa Nhân Viên',
      message: 'Bạn có chắc chắn muốn vô hiệu hóa nhân viên này?',
      onConfirm: async () => {
        try {
          await deleteEmployeeMutation.mutateAsync(id);
          toast.success('Đã vô hiệu hóa nhân viên thành công');
          queryClient.invalidateQueries({ queryKey: ['employees'] });
        } catch (error) {
          handleError(error);
        }
      }
    });
  };

  return (
    <div className="w-full relative space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-hepco-green" /> Quản Lý Nhân Viên Văn Phòng
          </h1>
        </div>


        <button
          onClick={() => { setIsFormOpen(true); setEditingId(null); formik.resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> <span>Thêm NV Văn Phòng</span>
        </button>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo Mã NV, Họ tên, Email..."
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
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:bg-white"
          >
            <option value="">Tất cả Phòng Ban</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>



          {(searchQuery || departmentIdFilter || sortOption !== 'created_at_desc') && (
            <button
              onClick={() => { setSearchQuery(''); setDepartmentIdFilter(''); setSortOption('created_at_desc'); setPage(1); }}
              className="self-end sm:self-center p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Xóa bộ lọc"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px] flex flex-col justify-center">
        {(isLoadingEmp || isLoadingDept) ? (
          <Loading />
        ) : employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <th 
                    onClick={() => setSortOption(prev => prev === 'code_asc' ? 'code_desc' : 'code_asc')}
                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Mã NV</span>
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
                    className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Họ & Tên</span>
                      {sortOption === 'name_asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-hepco-green font-bold" />
                      ) : sortOption === 'name_desc' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-hepco-green font-bold" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4">Phòng Ban</th>
                  <th className="px-6 py-4">Chức Vụ</th>
                  <th className="px-6 py-4">Liên Hệ</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{e.employee_code}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {e.full_name}
                      {e.status === EMPLOYEE_STATUS.INACTIVE && (
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${EMPLOYEE_STATUS_LABELS[EMPLOYEE_STATUS.INACTIVE].bg}`}>
                          {EMPLOYEE_STATUS_LABELS[EMPLOYEE_STATUS.INACTIVE].label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {e.department?.name ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                          {e.department.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Chưa phân phòng</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{e.position || 'Nhân viên'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {e.phone && <div className="flex items-center gap-1.5 font-medium text-gray-800"><Phone className="w-3.5 h-3.5 text-green-600" /> {e.phone}</div>}
                      {e.email && <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5"><Mail className="w-3 h-3" /> {e.email}</div>}
                    </td>
                    <td className="px-6 py-4 text-right relative" onClick={(evt) => evt.stopPropagation()}>
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setOpenDropdownId(openDropdownId === e.id ? null : e.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        title="Thao tác"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === e.id && (
                        <div className="absolute right-6 top-10 bg-white border border-gray-100 shadow-xl rounded-xl w-44 z-20 flex flex-col overflow-hidden py-1 text-left">
                          <button
                            onClick={(evt) => { evt.stopPropagation(); setOpenDropdownId(null); handleEdit(e); }}
                            className="w-full px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                            Sửa thông tin
                          </button>

                          <div className="border-t border-gray-100 my-1"></div>

                          <button
                            onClick={(evt) => { evt.stopPropagation(); setOpenDropdownId(null); handleDelete(e.id); }}
                            className="w-full px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            Vô hiệu hóa
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
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Chưa có dữ liệu nhân viên văn phòng</h3>
            <p className="text-gray-500 text-sm mt-1">Chưa có nhân viên nào thuộc khối các Phòng ban Văn phòng.</p>
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

      {/* Modal Add/Edit Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <form onSubmit={formik.handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-hepco-green" />}
                  {editingId ? 'Cập Nhật NV Văn Phòng' : 'Thêm Nhân Viên Văn Phòng'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã NV <span className="text-red-500">*</span></label>
                  <input type="text" name="employee_code" placeholder="VD: NV001" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.employee_code} onChange={formik.handleChange} />
                  {formik.touched.employee_code && formik.errors.employee_code && <div className="text-red-500 text-xs mt-1">{formik.errors.employee_code}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ Tên <span className="text-red-500">*</span></label>
                  <input type="text" name="full_name" placeholder="Nhập họ và tên..." className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.full_name} onChange={formik.handleChange} />
                  {formik.touched.full_name && formik.errors.full_name && <div className="text-red-500 text-xs mt-1">{formik.errors.full_name}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức Vụ</label>
                  <input type="text" name="position" placeholder="VD: Trưởng phòng, Chuyên viên..." className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.position} onChange={formik.handleChange} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" placeholder="email@hepco.com.vn" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.email} onChange={formik.handleChange} />
                  {formik.touched.email && formik.errors.email && <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điện Thoại</label>
                  <input type="text" name="phone" placeholder="Nhập số điện thoại..." className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.phone} onChange={formik.handleChange} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng Ban <span className="text-red-500">*</span></label>
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
                  {formik.touched.department_id && formik.errors.department_id && <div className="text-red-500 text-xs mt-1">{formik.errors.department_id}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm Cấp Phát Thiết Bị</label>
                  <select name="employee_type" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white" value={formik.values.employee_type} onChange={formik.handleChange}>
                    {EMPLOYEE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select name="status" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white" value={formik.values.status} onChange={formik.handleChange}>
                    {EMPLOYEE_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsFormOpen(false)} className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Hủy Bỏ</button>
                <button type="submit" disabled={formik.isSubmitting} className="py-2.5 px-6 font-bold rounded-lg text-white bg-hepco-green hover:bg-green-700 shadow-sm">
                  {editingId ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeManager;
