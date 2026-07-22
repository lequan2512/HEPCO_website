import { X, FileText, Calendar, Building2, User, Paperclip, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { DISPATCH_TYPE_LABELS, DISPATCH_STATUS_LABELS, URGENCY_LEVEL_LABELS } from '../../../../constants/baseOffice';

const DispatchDetailModal = ({ isOpen, onClose, dispatch }) => {
  if (!isOpen || !dispatch) return null;

  const typeConfig = DISPATCH_TYPE_LABELS[dispatch.type] || { label: dispatch.type, bg: 'bg-gray-100', text: 'text-gray-700' };
  const statusConfig = DISPATCH_STATUS_LABELS[dispatch.status] || { label: dispatch.status, bg: 'bg-gray-100', text: 'text-gray-700' };
  const urgencyConfig = URGENCY_LEVEL_LABELS[dispatch.urgency] || { label: dispatch.urgency || 'Thường', badge: 'bg-gray-100 text-gray-700' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-hepco-green/10 text-hepco-green flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-hepco-green">{dispatch.code}</span>
              <h3 className="text-base font-bold text-gray-900 line-clamp-1">{dispatch.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border || 'border-gray-200'}`}>
              {typeConfig.label}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${urgencyConfig.badge}`}>
              Độ khẩn: {urgencyConfig.label}
            </span>
          </div>

          {/* Details Table Card */}
          <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 font-medium">Cơ quan/Nơi gửi:</span>
                <span className="font-semibold text-gray-900">{dispatch.sender}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 font-medium">Nơi nhận:</span>
                <span className="font-semibold text-gray-900">{dispatch.receiver}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 font-medium">Ngày phát hành:</span>
                <span className="font-semibold text-gray-900">
                  {dispatch.created_at ? new Date(dispatch.created_at).toLocaleDateString('vi-VN') : '---'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500 font-medium">Tệp đính kèm:</span>
                <span className="font-semibold text-hepco-green underline cursor-pointer hover:opacity-80">
                  {dispatch.file_name || 'Không có tệp'}
                </span>
              </div>
            </div>
          </div>

          {/* Trích yếu mô tả */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Trích yếu nội dung:</h4>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 text-sm text-gray-800 leading-relaxed">
              {dispatch.description || 'Không có mô tả thêm.'}
            </div>
          </div>

          {/* Progress Timeline */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Tiến trình xử lý công văn:</h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Tiếp nhận công văn</p>
                  <p className="text-xs text-gray-500">Đã lưu vào kho công văn Base Office - {new Date(dispatch.created_at || Date.now()).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="relative flex items-start gap-3">
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  dispatch.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {dispatch.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Chuyển tiếp Ban Giám Đốc chỉ đạo</p>
                  <p className="text-xs text-gray-500">Phân công các phòng ban chức năng thực hiện</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchDetailModal;
