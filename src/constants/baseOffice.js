export const DISPATCH_TYPES = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  INTERNAL: 'internal'
};

export const DISPATCH_TYPE_LABELS = {
  [DISPATCH_TYPES.INCOMING]: { label: 'Công văn đến', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  [DISPATCH_TYPES.OUTGOING]: { label: 'Công văn đi', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  [DISPATCH_TYPES.INTERNAL]: { label: 'Công văn nội bộ', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  // Aliases for Base API variants
  in: { label: 'Công văn đến', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  out: { label: 'Công văn đi', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
};

export const DISPATCH_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const DISPATCH_STATUS_LABELS = {
  [DISPATCH_STATUS.PENDING]: { label: 'Chờ phân công', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  [DISPATCH_STATUS.PROCESSING]: { label: 'Đang xử lý', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  [DISPATCH_STATUS.COMPLETED]: { label: 'Đã hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  [DISPATCH_STATUS.REJECTED]: { label: 'Từ chối/Hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  [DISPATCH_STATUS.CANCELLED]: { label: 'Đã hủy', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  // Numeric API fallback
  '0': { label: 'Chờ phân công', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '1': { label: 'Đang xử lý', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '2': { label: 'Đã hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '3': { label: 'Từ chối/Hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export const REQUEST_STATUS = {
  PENDING: '0',
  APPROVED: '1',
  REJECTED: '2',
  CANCELLED: '3'
};

export const REQUEST_STATUS_LABELS = {
  '0': { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '1': { label: 'Đã phê duyệt', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '2': { label: 'Từ chối', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  '3': { label: 'Đã hủy', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  // String key fallback
  pending: { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  approved: { label: 'Đã phê duyệt', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: 'Từ chối', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  canceled: { label: 'Đã hủy', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  cancelled: { label: 'Đã hủy', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  aborted: { label: 'Đã hủy', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
};

export const TASK_STATUS = {
  TODO: '0',
  IN_PROGRESS: '1',
  COMPLETED: '2',
  FAILED: '3',
  PENDING_REVIEW: '4'
};

export const TASK_STATUS_LABELS = {
  '0': { label: 'Mới giao / Chưa làm', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  '1': { label: 'Đang thực hiện', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '2': { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '3': { label: 'Quá hạn / Thất bại', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  '4': { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  // String key fallback
  todo: { label: 'Mới giao / Chưa làm', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  new: { label: 'Mới giao / Chưa làm', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  doing: { label: 'Đang thực hiện', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  in_progress: { label: 'Đang thực hiện', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  done: { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  completed: { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  failed: { label: 'Quá hạn / Thất bại', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  overdue: { label: 'Quá hạn / Thất bại', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  reviewing: { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  pending_review: { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
};

export const TASK_PRIORITY = {
  NORMAL: '0',
  HIGH: '1',
  URGENT: '2'
};

export const TASK_PRIORITY_LABELS = {
  '0': { label: 'Bình thường', badge: 'bg-gray-100 text-gray-700' },
  '1': { label: 'Ưu tiên', badge: 'bg-amber-100 text-amber-800' },
  '2': { label: 'Khẩn cấp', badge: 'bg-rose-100 text-rose-800 animate-pulse' },
  normal: { label: 'Bình thường', badge: 'bg-gray-100 text-gray-700' },
  high: { label: 'Ưu tiên', badge: 'bg-amber-100 text-amber-800' },
  urgent: { label: 'Khẩn cấp', badge: 'bg-rose-100 text-rose-800 animate-pulse' }
};

export const URGENCY_LEVELS = {
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const URGENCY_LEVEL_LABELS = {
  [URGENCY_LEVELS.NORMAL]: { label: 'Thường', badge: 'bg-gray-100 text-gray-700' },
  [URGENCY_LEVELS.HIGH]: { label: 'Thượng khẩn', badge: 'bg-amber-100 text-amber-800' },
  [URGENCY_LEVELS.URGENT]: { label: 'Hỏa tốc', badge: 'bg-rose-100 text-rose-800 animate-pulse' },
  '0': { label: 'Thường', badge: 'bg-gray-100 text-gray-700' },
  '1': { label: 'Thượng khẩn', badge: 'bg-amber-100 text-amber-800' },
  '2': { label: 'Hỏa tốc', badge: 'bg-rose-100 text-rose-800 animate-pulse' }
};

// Helper Mapping Functions with lowercased key normalization
export const getDispatchTypeLabel = (type) => {
  const key = String(type ?? '').toLowerCase();
  return DISPATCH_TYPE_LABELS[key] || DISPATCH_TYPE_LABELS[type] || { label: type || 'Công văn', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
};

export const getDispatchStatusLabel = (status) => {
  const key = String(status ?? '').toLowerCase();
  return DISPATCH_STATUS_LABELS[key] || DISPATCH_STATUS_LABELS[status] || { label: status || 'Chờ phân công', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
};

export const getRequestStatusLabel = (status) => {
  const key = String(status ?? '').toLowerCase();
  return REQUEST_STATUS_LABELS[key] || REQUEST_STATUS_LABELS[status] || { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
};

export const getTaskStatusLabel = (status) => {
  const key = String(status ?? '').toLowerCase();
  return TASK_STATUS_LABELS[key] || TASK_STATUS_LABELS[status] || { label: 'Mới giao', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
};

export const getTaskPriorityLabel = (priority) => {
  const key = String(priority ?? '').toLowerCase();
  return TASK_PRIORITY_LABELS[key] || TASK_PRIORITY_LABELS[priority] || { label: 'Bình thường', badge: 'bg-gray-100 text-gray-700' };
};

export const getUrgencyLevelLabel = (urgency) => {
  const key = String(urgency ?? '').toLowerCase();
  return URGENCY_LEVEL_LABELS[key] || URGENCY_LEVEL_LABELS[urgency] || { label: urgency || 'Thường', badge: 'bg-gray-100 text-gray-700' };
};
