import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, RotateCcw, X, Search, Package } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import { useGetAssignments, useAddAssignment, useReturnAssignment } from '../../../apis/assignment';
import { useGetDevices, useGetCategories, useUpdateDevice } from '../../../apis/device';
import { useGetEmployees } from '../../../apis/employee';
import { useGetDepartments } from '../../../apis/department';
import ConfirmModal from '../../../components/ConfirmModal';
import Pagination from '../../../components/Pagination';
import { PC_COMPONENTS, DEVICE_CATEGORY_CODES, DEVICE_STATUS, ASSIGNMENT_STATUS } from '../../../constants/device';

const AdminAssignmentManager = () => {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState(false);
  const [assembleDevice, setAssembleDevice] = useState(null);
  const [assembleSearch, setAssembleSearch] = useState('');
  const [debouncedAssembleSearch, setDebouncedAssembleSearch] = useState('');
  const [assembleCategory, setAssembleCategory] = useState('');
  const [returnItem, setReturnItem] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', department_id: '', category_id: '', start_date: '', end_date: '', status: '' });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAssembleSearch(assembleSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [assembleSearch]);

  const { data: assignmentsRes = {}, isLoading: isLoadingAssignments } = useGetAssignments({ ...debouncedFilters, page, limit: 20 });
  const assignments = assignmentsRes?.data || [];
  const meta = assignmentsRes?.meta;
  const { data: devicesRes = {}, isLoading: isLoadingDevices } = useGetDevices({ limit: 1000 });
  const devices = devicesRes?.data || [];
  const { data: employeesRes = {}, isLoading: isLoadingEmployees } = useGetEmployees({ limit: 1000 });
  const employees = employeesRes?.data || [];
  const { data: departmentsRes = {}, isLoading: isLoadingDept } = useGetDepartments({ limit: 1000 });
  const departments = departmentsRes?.data || [];
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories();
  const { data: availableComponentsRes } = useGetDevices({ status: DEVICE_STATUS.IN_STOCK, hide_assembled: true, is_component: true, search: debouncedAssembleSearch, category_id: assembleCategory, limit: 1000 });
  const availableComponents = availableComponentsRes?.data || [];

  const updateDeviceMutation = useUpdateDevice();

  const isLoading = isLoadingAssignments || isLoadingDevices || isLoadingEmployees || isLoadingDept || isLoadingCategories;

  const addAssignment = useAddAssignment();
  const returnAssignment = useReturnAssignment();

  const calculateTimeAssigned = (assignedDate) => {
    const start = new Date(assignedDate);
    const end = new Date();
    if (start > end) return 'Chưa đến hạn';
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0 && months === 0) return 'Dưới 1 tháng';
    if (years === 0) return `${months} tháng`;
    if (months === 0) return `${years} năm`;
    return `${years} năm ${months} tháng`;
  };

  const formik = useFormik({
    initialValues: { device_id: '', employee_id: '', assigned_date: new Date().toISOString().split('T')[0], assigned_by: 'Admin', note: '' },
    validationSchema: Yup.object({ device_id: Yup.number().required('Bắt buộc'), employee_id: Yup.number().required('Bắt buộc'), assigned_date: Yup.date().required('Bắt buộc') }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await addAssignment.mutateAsync(values);
        toast.success('Cấp phát thành công');
        queryClient.invalidateQueries(['assignments', 'devices']);
        setIsFormOpen(false); formik.resetForm();
      } catch { toast.error('Lỗi'); }
      finally { setSubmitting(false); }
    }
  });

  const returnFormik = useFormik({
    initialValues: { returned_date: new Date().toISOString().split('T')[0], note: '', return_status: 'in_stock' },
    validationSchema: Yup.object({
      returned_date: Yup.date().required('Bắt buộc'),
      return_status: Yup.string().required('Bắt buộc')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!returnItem) return;
      try {
        await returnAssignment.mutateAsync({ id: returnItem.id, data: values });
        toast.success('Đã thu hồi thiết bị thành công');
        queryClient.invalidateQueries(['assignments', 'devices']);
        setReturnItem(null);
      } catch { toast.error('Lỗi khi thu hồi thiết bị'); }
      finally { setSubmitting(false); }
    }
  });

  const handleReturn = (item) => {
    setReturnItem(item);
    returnFormik.resetForm();
    returnFormik.setValues({ returned_date: new Date().toISOString().split('T')[0], note: 'Đã thu hồi', return_status: 'in_stock' });
  };

  if (isLoading) return <Loading />;

  const filteredAssignments = assignments;

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6 text-hepco-green" /> Cấp Phát Thiết Bị</h1>
        <button onClick={() => setIsFormOpen(true)} className="flex items-center whitespace-nowrap gap-2 px-4 py-2 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto justify-center"><Plus className="w-5 h-5" /> <span>Cấp Phát Mới</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm thiết bị, nhân viên..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green focus:border-transparent transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(f => ({ ...f, search: '' }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <select
          className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
          value={filters.category_id}
          onChange={(e) => setFilters(f => ({ ...f, category_id: e.target.value }))}
        >
          <option value="">Tất cả danh mục</option>
          {categories.filter(c => c.parent_id === null).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
          value={filters.department_id}
          onChange={(e) => setFilters(f => ({ ...f, department_id: e.target.value }))}
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
            value={filters.start_date}
            onChange={(e) => setFilters(f => ({ ...f, start_date: e.target.value }))}
            title="Từ ngày"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
            value={filters.end_date}
            onChange={(e) => setFilters(f => ({ ...f, end_date: e.target.value }))}
            title="Đến ngày"
          />
        </div>
        <select
          className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">Tất cả trạng thái</option>
          <option value={ASSIGNMENT_STATUS.IN_USE}>Đang mượn</option>
          <option value={ASSIGNMENT_STATUS.RETURNED}>Đã trả</option>
        </select>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <form onSubmit={formik.handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-hepco-green" /> Cấp Phát Thiết Bị Mới
                </h2>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500 p-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thiết Bị <span className="text-red-500">*</span></label>
                  <select
                    name="device_id"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white"
                    value={formik.values.device_id}
                    onChange={formik.handleChange}
                  >
                    <option value="">-- Chọn thiết bị --</option>
                    {devices.filter(d => d.status === DEVICE_STATUS.IN_STOCK && !d.parent_device_id && d.category?.parent_id === null).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhân Viên <span className="text-red-500">*</span></label>
                  <select
                    name="employee_id"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 bg-white"
                    value={formik.values.employee_id}
                    onChange={formik.handleChange}
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code}) - {e.department?.name || 'Không có PB'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bàn giao <span className="text-red-500">*</span></label>
                  <input type="date" name="assigned_date" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.assigned_date} onChange={formik.handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người bàn giao</label>
                  <input name="assigned_by" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.assigned_by} onChange={formik.handleChange} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <input name="note" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50" value={formik.values.note} onChange={formik.handleChange} />
                </div>
              </div>
              <div className="mt-8 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsFormOpen(false)} className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Hủy Bỏ</button>
                <button type="submit" disabled={formik.isSubmitting} className="py-2.5 px-6 font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 text-white bg-hepco-green hover:bg-green-700">Ghi Nhận Cấp Phát</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Ngày Cấp</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Thiết Bị</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Nhân Viên</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">{new Date(a.assigned_date).toLocaleDateString('vi-VN')}</div>
                      <div className="text-xs text-hepco-green font-medium mt-1">{!a.returned_date && calculateTimeAssigned(a.assigned_date)}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{a.device?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{a.employee?.full_name}</td>
                    <td className="px-6 py-4">
                      {a.returned_date ?
                        <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-medium">Đã trả</span> :
                        <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-medium">Đang mượn</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!a.returned_date && (
                        <div className="flex items-center justify-end gap-2">
                          {a.device?.category?.parent_id === null && (
                            <button onClick={() => { setAssembleDevice(a.device); setIsAssembleModalOpen(true); }} className="px-3 py-1.5 bg-gray-100 text-gray-700 font-medium rounded text-sm hover:bg-gray-200 transition-colors flex items-center gap-1.5 shadow-sm" title="Cấu hình thiết bị">
                              <Package className="w-3.5 h-3.5" /> Cấu hình
                            </button>
                          )}
                          <button onClick={() => handleReturn(a)} className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 hover:bg-yellow-600 transition-colors shadow-sm">
                            <RotateCcw className="w-3.5 h-3.5" /> Thu hồi
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
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Không có dữ liệu cấp phát</h3>
            <p className="text-gray-500 mt-1">Chưa có thiết bị nào được cấp phát hoặc không khớp với tìm kiếm.</p>
          </div>
        )}
      </div>
      <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} />

      {returnItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><RotateCcw className="w-5 h-5 text-yellow-600" /> Thu hồi thiết bị</h3>
              <button onClick={() => setReturnItem(null)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={returnFormik.handleSubmit} className="p-4">
              <p className="text-sm text-gray-600 mb-4">Bạn đang thu hồi <span className="font-semibold">{returnItem.device?.name}</span> từ <span className="font-semibold">{returnItem.employee?.full_name}</span></p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thiết bị sau khi thu hồi <span className="text-red-500">*</span></label>
                  <select
                    name="return_status"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
                    value={returnFormik.values.return_status}
                    onChange={returnFormik.handleChange}
                  >
                    <option value="in_stock">Tồn kho (Bình thường)</option>
                    <option value="broken">Hỏng</option>
                    <option value="maintenance">Đang bảo trì</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thu hồi <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="returned_date"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
                    value={returnFormik.values.returned_date}
                    onChange={returnFormik.handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    name="note"
                    rows={2}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
                    value={returnFormik.values.note}
                    onChange={returnFormik.handleChange}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setReturnItem(null)} className="px-4 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={returnFormik.isSubmitting} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium">Xác nhận Thu Hồi</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAssembleModalOpen && assembleDevice && (() => {
        const existingCategories = assembleDevice.child_devices?.map(c => c.category?.code) || [];
        const checkCanAssemble = (compCode) => {
          if (!compCode) return true;
          if (!PC_COMPONENTS.includes(compCode)) return false;

          const singleLimitCodes = [DEVICE_CATEGORY_CODES.CPU, DEVICE_CATEGORY_CODES.MAINBOARD, DEVICE_CATEGORY_CODES.PSU, DEVICE_CATEGORY_CODES.CASE, DEVICE_CATEGORY_CODES.COOLER];
          return !(singleLimitCodes.includes(compCode) && existingCategories.includes(compCode));
        };

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-6 h-6 text-hepco-green" /> Lắp ráp cấu hình
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Cấu hình linh kiện cho: <span className="font-semibold text-gray-800">{assembleDevice.name}</span></p>
                </div>
                <button onClick={() => { setIsAssembleModalOpen(false); setAssembleDevice(null); }} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 bg-gray-50/50">
                {/* Linh kiện đang lắp */}
                <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Linh kiện đang lắp trong máy ({assembleDevice.child_devices?.length || 0})</h3>
                  <div className="space-y-3">
                    {assembleDevice.child_devices?.length > 0 ? assembleDevice.child_devices.map(comp => (
                      <div key={comp.id} className="flex justify-between items-center p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{comp.name}</p>
                        </div>
                        <button
                          onClick={async () => {
                            await updateDeviceMutation.mutateAsync({ id: comp.id, parent_device_id: null, status: DEVICE_STATUS.IN_STOCK });
                            toast.success('Đã tháo linh kiện');
                            setAssembleDevice(prev => ({ ...prev, child_devices: prev.child_devices.filter(c => c.id !== comp.id) }));
                            queryClient.invalidateQueries({ queryKey: ['assignments'] });
                          }}
                          className="text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded transition-colors"
                        >
                          Tháo ra
                        </button>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 italic text-center py-4">Máy này chưa được lắp linh kiện nào.</p>
                    )}
                  </div>
                </div>

                {/* Linh kiện trong kho */}
                <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">Kho linh kiện sẵn có ({availableComponents.length})</h3>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Tìm linh kiện, S/N..."
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
                        value={assembleSearch}
                        onChange={(e) => setAssembleSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="w-full sm:w-auto py-1.5 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-hepco-green"
                      value={assembleCategory}
                      onChange={(e) => setAssembleCategory(e.target.value)}
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.filter(c => c.is_component).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 max-h-[400px] pr-1">
                    {(() => {
                      if (availableComponents.length === 0) return <p className="text-sm text-gray-500 italic text-center py-4">Không tìm thấy linh kiện phù hợp.</p>;

                      return availableComponents.map(comp => {
                        const canAdd = checkCanAssemble(comp.category?.code);
                      return (
                        <div key={comp.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{comp.name}</p>
                          </div>
                          <button
                            disabled={!canAdd}
                            onClick={async () => {
                              await updateDeviceMutation.mutateAsync({ id: comp.id, parent_device_id: assembleDevice.id, status: assembleDevice.status });
                              toast.success('Đã lắp linh kiện vào máy');
                              setAssembleDevice(prev => ({ ...prev, child_devices: [...(prev.child_devices || []), comp] }));
                              queryClient.invalidateQueries({ queryKey: ['assignments'] });
                            }}
                            className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${canAdd ? 'text-hepco-green bg-green-100 hover:bg-green-200' : 'text-gray-400 bg-gray-200 cursor-not-allowed'}`}
                          >
                            {canAdd ? 'Lắp vào' : 'Đã có'}
                          </button>
                        </div>
                      )
                    })})()}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-white flex justify-end">
                <button onClick={() => { setIsAssembleModalOpen(false); setAssembleDevice(null); }} className="py-2 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                  Hoàn tất
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminAssignmentManager;
