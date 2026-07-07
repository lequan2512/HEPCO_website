import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, RotateCcw, X, Search } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Loading from '../../../components/Loading';
import { useGetAssignments, useAddAssignment, useReturnAssignment } from '../../../apis/assignment';
import { useGetDevices } from '../../../apis/device';
import { useGetEmployees } from '../../../apis/employee';
import ConfirmModal from '../../../components/ConfirmModal';

const AdminAssignmentManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading: isLoadingAssignments } = useGetAssignments();
  const { data: devices = [], isLoading: isLoadingDevices } = useGetDevices({});
  const { data: employees = [], isLoading: isLoadingEmployees } = useGetEmployees();
  
  const isLoading = isLoadingAssignments || isLoadingDevices || isLoadingEmployees;

  const addAssignment = useAddAssignment();
  const returnAssignment = useReturnAssignment();

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

  const handleReturn = (item) => {
    setConfirmConfig({
      isOpen: true, title: 'Thu hồi thiết bị', message: `Bạn xác nhận thu hồi thiết bị ID ${item.device_id} từ nhân viên ID ${item.employee_id}?`,
      onConfirm: async () => {
        try {
          await returnAssignment.mutateAsync({ id: item.id, data: { returned_date: new Date().toISOString().split('T')[0], note: 'Đã thu hồi' } });
          toast.success('Đã thu hồi'); queryClient.invalidateQueries(['assignments', 'devices']);
        } catch { toast.error('Lỗi'); }
      }
    });
  };

  if (isLoading) return <Loading />;

  const filteredAssignments = assignments.filter(a => 
    a.device?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.employee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(a.device_id).includes(searchQuery) ||
    String(a.employee_id).includes(searchQuery)
  );

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6 text-hepco-green" /> Cấp Phát Thiết Bị</h1>
        <div className="flex items-center w-full sm:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm thiết bị, nhân viên..."
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
          <button onClick={() => setIsFormOpen(true)} className="flex items-center whitespace-nowrap gap-2 px-4 py-2 bg-hepco-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm w-full sm:w-auto justify-center"><Plus className="w-5 h-5"/> <span>Cấp Phát Mới</span></button>
        </div>
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
                    {devices.filter(d => d.status === 'in_stock').map(d => (
                      <option key={d.id} value={d.id}>{d.name} (S/N: {d.serial_number || 'N/A'})</option>
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
                    <td className="px-6 py-4 text-sm text-gray-800">{new Date(a.assigned_date).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{a.device?.name} <span className="text-gray-400 text-xs font-normal ml-1">(ID: {a.device_id})</span></td>
                    <td className="px-6 py-4 text-sm text-gray-800">{a.employee?.full_name} <span className="text-gray-400 text-xs font-normal ml-1">(ID: {a.employee_id})</span></td>
                    <td className="px-6 py-4">
                      {a.returned_date ? 
                        <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-medium">Đã trả</span> : 
                        <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-medium">Đang mượn</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!a.returned_date && (
                        <button onClick={() => handleReturn(a)} className="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 ml-auto hover:bg-yellow-600 transition-colors shadow-sm">
                          <RotateCcw className="w-3.5 h-3.5"/> Thu hồi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};
export default AdminAssignmentManager;
