export const DISPATCH_TYPES = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  INTERNAL: 'internal'
};

export const DISPATCH_TYPE_LABELS = {
  [DISPATCH_TYPES.INCOMING]: { label: 'Công văn đến', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  [DISPATCH_TYPES.OUTGOING]: { label: 'Công văn đi', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  [DISPATCH_TYPES.INTERNAL]: { label: 'Công văn nội bộ', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
};

export const DISPATCH_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

export const DISPATCH_STATUS_LABELS = {
  [DISPATCH_STATUS.PENDING]: { label: 'Chờ phân công', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  [DISPATCH_STATUS.PROCESSING]: { label: 'Đang xử lý', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  [DISPATCH_STATUS.COMPLETED]: { label: 'Đã hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  [DISPATCH_STATUS.REJECTED]: { label: 'Từ chối / Hủy', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};

export const REQUEST_STATUS = {
  PENDING: '0',
  APPROVED: '1',
  REJECTED: '2'
};

export const REQUEST_STATUS_LABELS = {
  [REQUEST_STATUS.PENDING]: { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700' },
  [REQUEST_STATUS.APPROVED]: { label: 'Đã phê duyệt', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  [REQUEST_STATUS.REJECTED]: { label: 'Từ chối', bg: 'bg-rose-50', text: 'text-rose-700' }
};

export const URGENCY_LEVELS = {
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const URGENCY_LEVEL_LABELS = {
  [URGENCY_LEVELS.NORMAL]: { label: 'Thường', badge: 'bg-gray-100 text-gray-700' },
  [URGENCY_LEVELS.HIGH]: { label: 'Thượng khẩn', badge: 'bg-amber-100 text-amber-800' },
  [URGENCY_LEVELS.URGENT]: { label: 'Hỏa tốc', badge: 'bg-rose-100 text-rose-800 animate-pulse' }
};
