export const POS_STATUS = {
  IN_STOCK: 'in_stock',
  IN_USE: 'in_use',
  BORROWED: 'borrowed',
  BROKEN: 'broken',
  RETIRED: 'retired'
};

export const POS_STATUS_LABELS = {
  [POS_STATUS.IN_STOCK]: { value: POS_STATUS.IN_STOCK, label: 'Kho/Dự phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  [POS_STATUS.IN_USE]: { value: POS_STATUS.IN_USE, label: 'Đang cấp phát', bg: 'bg-green-100 text-green-800 border-green-200' },
  [POS_STATUS.BORROWED]: { value: POS_STATUS.BORROWED, label: 'Đang mượn', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  [POS_STATUS.BROKEN]: { value: POS_STATUS.BROKEN, label: 'Đang hỏng', bg: 'bg-red-100 text-red-800 border-red-200' },
  [POS_STATUS.RETIRED]: { value: POS_STATUS.RETIRED, label: 'Thanh lý', bg: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export const POS_STATUS_OPTIONS = Object.values(POS_STATUS_LABELS);
