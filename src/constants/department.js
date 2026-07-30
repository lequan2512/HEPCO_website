export const DEPARTMENT_TYPE = {
  OFFICE: 1,
  ENTERPRISE: 2,
  // Alias for backward compatibility if needed
  VAN_PHONG: 1,
  XI_NGHIEP: 2
};

export const DEPARTMENT_TYPE_LABELS = {
  1: { value: 1, label: 'Văn Phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  2: { value: 2, label: 'Xí Nghiệp', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  '1': { value: 1, label: 'Văn Phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  '2': { value: 2, label: 'Xí Nghiệp', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  'OFFICE': { value: 1, label: 'Văn Phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  'ENTERPRISE': { value: 2, label: 'Xí Nghiệp', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  'VAN_PHONG': { value: 1, label: 'Văn Phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  'XI_NGHIEP': { value: 2, label: 'Xí Nghiệp', bg: 'bg-purple-100 text-purple-800 border-purple-200' }
};

export const getDepartmentTypeConfig = (type) => {
  if (type !== undefined && type !== null && DEPARTMENT_TYPE_LABELS[type]) {
    return DEPARTMENT_TYPE_LABELS[type];
  }
  const num = Number(type);
  if (!isNaN(num) && DEPARTMENT_TYPE_LABELS[num]) {
    return DEPARTMENT_TYPE_LABELS[num];
  }
  return DEPARTMENT_TYPE_LABELS[1];
};

export const DEPARTMENT_TYPE_OPTIONS = [
  DEPARTMENT_TYPE_LABELS[1],
  DEPARTMENT_TYPE_LABELS[2]
];
