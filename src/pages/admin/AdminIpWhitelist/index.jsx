import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, Trash2, ShieldAlert, Edit2, X } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorMapper';
import Loading from '../../../components/Loading';
import { useGetIps, useAddIp, useUpdateIp, useDeleteIp } from '../../../apis/ip';
import ConfirmModal from '../../../components/ConfirmModal';

const AdminIpWhitelist = () => {
  const [editingId, setEditingId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const queryClient = useQueryClient();

  const { data: ips = [], isLoading } = useGetIps({ limit: 20 });

  const addIpMutation = useAddIp();
  const updateIpMutation = useUpdateIp();
  const deleteIpMutation = useDeleteIp();

  const handleAddSuccess = () => {
    toast.success('Thêm IP vào danh sách trắng thành công');
    queryClient.invalidateQueries({ queryKey: ['ips'] });
    formik.resetForm();
  };

  const handleUpdateSuccess = () => {
    toast.success('Cập nhật IP thành công');
    queryClient.invalidateQueries({ queryKey: ['ips'] });
    setEditingId(null);
    formik.resetForm();
  };

  const handleDeleteSuccess = () => {
    toast.success('Xóa IP thành công');
    queryClient.invalidateQueries({ queryKey: ['ips'] });
  };

  const handleError = (error, defaultMsg) => {
    const errorCode = error.response?.data?.errorCode;
    toast.error(getErrorMessage(errorCode) || defaultMsg);
  };

  const formik = useFormik({
    initialValues: {
      ip: '',
      description: ''
    },
    validationSchema: Yup.object({
      ip: Yup.string()
        .required('Vui lòng nhập địa chỉ IP')
        .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^::1$|^[a-fA-F0-9:]+$/, 'Địa chỉ IP không hợp lệ'),
      description: Yup.string()
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingId) {
          await updateIpMutation.mutateAsync({ id: editingId, ...values });
          handleUpdateSuccess();
        } else {
          await addIpMutation.mutateAsync(values);
          handleAddSuccess();
        }
      } catch (error) {
        handleError(error, editingId ? 'Có lỗi xảy ra khi cập nhật IP' : 'Có lỗi xảy ra khi thêm IP');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEdit = (item) => {
    setEditingId(item.id);
    formik.setValues({
      ip: item.ip,
      description: item.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa IP',
      message: 'Bạn có chắc chắn muốn xóa IP này khỏi danh sách trắng? Các IP bị xóa sẽ không thể đăng nhập quản trị nữa.',
      onConfirm: async () => {
        try {
          await deleteIpMutation.mutateAsync(id);
          handleDeleteSuccess();
        } catch (error) {
          handleError(error, 'Có lỗi xảy ra khi xóa IP');
        }
      }
    });
  };

  return (
    <div className="w-full relative">
      {(addIpMutation.isPending || deleteIpMutation.isPending || updateIpMutation.isPending) && <Loading fullScreen message="Đang xử lý..." />}
      
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-hepco-green" />
          IP Whitelist
        </h1>
        <p className="text-gray-500 text-sm mt-2">Chỉ những địa chỉ IP trong danh sách này mới có thể đăng nhập vào hệ thống quản trị.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Thêm IP */}
        <div className="col-span-1">
          <form onSubmit={formik.handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {editingId ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-hepco-green" />}
                {editingId ? 'Cập nhật IP' : 'Thêm IP Mới'}
              </h2>
              {editingId && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Hủy"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ IP <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="ip"
                  placeholder="Ví dụ: 192.168.1.100"
                  className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 focus:border-hepco-green transition-all ${
                    formik.touched.ip && formik.errors.ip ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formik.values.ip}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.ip && formik.errors.ip && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.ip}</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (Không bắt buộc)</label>
                <input 
                  type="text" 
                  name="description"
                  placeholder="Ví dụ: IP Văn phòng Công ty"
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-hepco-green/50 focus:border-hepco-green transition-all"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </div>

              <button 
                type="submit"
                disabled={formik.isSubmitting || addIpMutation.isPending || updateIpMutation.isPending}
                className={`w-full py-2.5 px-4 font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 text-white ${
                  editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-hepco-green hover:bg-green-700'
                }`}
              >
                {editingId ? 'Cập nhật' : 'Thêm vào Whitelist'}
              </button>
            </div>
          </form>
        </div>

        {/* Danh sách IP */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <Loading />
            ) : ips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Địa chỉ IP</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase">Mô tả</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ips.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-800 font-medium">
                        {item.ip}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.description || <span className="text-gray-300 italic">Không có mô tả</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa IP"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa IP"
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
                <ShieldAlert className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-800">Danh sách trống</h3>
                <p className="text-gray-500 mt-1">Chưa có IP nào trong danh sách trắng</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
};

export default AdminIpWhitelist;
