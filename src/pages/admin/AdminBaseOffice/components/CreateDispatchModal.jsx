import { X, Loader2, Send } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useCreateDispatch } from '../../../../apis/baseOffice';
import { DISPATCH_TYPES, URGENCY_LEVELS } from '../../../../constants/baseOffice';

const CreateDispatchModal = ({ isOpen, onClose, onSuccess }) => {
  const createDispatchMutation = useCreateDispatch();

  const formik = useFormik({
    initialValues: {
      code: '',
      title: '',
      type: DISPATCH_TYPES.INCOMING,
      urgency: URGENCY_LEVELS.NORMAL,
      sender: '',
      receiver: 'Ban Giám Đốc - HEPCO',
      description: '',
      file_name: ''
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Tiêu đề công văn là bắt buộc'),
      type: Yup.string().required('Vui lòng chọn loại công văn'),
      sender: Yup.string().required('Đơn vị/Người gửi là bắt buộc'),
      receiver: Yup.string().required('Đơn vị/Người nhận là bắt buộc'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await createDispatchMutation.mutateAsync(values);
        toast.success('Tạo và phát hành công văn thành công!');
        resetForm();
        onSuccess?.();
        onClose();
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Không thể tạo công văn. Vui lòng thử lại.');
      }
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-hepco-green/10 text-hepco-green flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tạo Công Văn / Trình Ký Mới</h3>
              <p className="text-xs text-gray-500">Đồng bộ trực tiếp lên hệ sinh thái Base.vn Office</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={formik.handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mã công văn */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mã Công Văn (tùy chọn)</label>
              <input
                type="text"
                name="code"
                placeholder="VD: CV-2026/HEPCO-05"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 focus:border-hepco-green"
              />
            </div>

            {/* Loại công văn */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Loại Văn Bản *</label>
              <select
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 focus:border-hepco-green"
              >
                <option value={DISPATCH_TYPES.INCOMING}>Công văn đến</option>
                <option value={DISPATCH_TYPES.OUTGOING}>Công văn đi</option>
                <option value={DISPATCH_TYPES.INTERNAL}>Công văn nội bộ</option>
              </select>
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu Đề / Tên Văn Bản *</label>
            <input
              type="text"
              name="title"
              placeholder="Nhập tiêu đề trích yếu công văn..."
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 ${
                formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300 focus:border-hepco-green'
              }`}
            />
            {formik.touched.title && formik.errors.title && (
              <span className="text-xs text-red-500 mt-1 block">{formik.errors.title}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nơi/Người gửi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nơi Gửi / Cơ Quan Gửi *</label>
              <input
                type="text"
                name="sender"
                placeholder="VD: Sở TN&MT / Phòng Kế Hoạch..."
                value={formik.values.sender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden ${
                  formik.touched.sender && formik.errors.sender ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formik.touched.sender && formik.errors.sender && (
                <span className="text-xs text-red-500 mt-1 block">{formik.errors.sender}</span>
              )}
            </div>

            {/* Nơi nhận */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nơi Nhận / Xử Lý *</label>
              <input
                type="text"
                name="receiver"
                placeholder="VD: Ban Giám Đốc - HEPCO"
                value={formik.values.receiver}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-hidden ${
                  formik.touched.receiver && formik.errors.receiver ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mức độ khẩn */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Độ Khẩn</label>
              <select
                name="urgency"
                value={formik.values.urgency}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden"
              >
                <option value={URGENCY_LEVELS.NORMAL}>Thường</option>
                <option value={URGENCY_LEVELS.HIGH}>Thượng khẩn</option>
                <option value={URGENCY_LEVELS.URGENT}>Hỏa tốc</option>
              </select>
            </div>

            {/* Tệp đính kèm */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên Tệp Đính Kèm (PDF/Word)</label>
              <input
                type="text"
                name="file_name"
                placeholder="VD: Cong_van_302.pdf"
                value={formik.values.file_name}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden"
              />
            </div>
          </div>

          {/* Trích yếu / Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nội dung tóm tắt / Ghi chú</label>
            <textarea
              rows={3}
              name="description"
              placeholder="Tóm tắt yêu cầu xử lý, nhiệm vụ đính kèm..."
              value={formik.values.description}
              onChange={formik.handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-hepco-green/20 focus:border-hepco-green resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || createDispatchMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-hepco-green hover:bg-hepco-green/90 rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              {(formik.isSubmitting || createDispatchMutation.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Tạo Công Văn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDispatchModal;
