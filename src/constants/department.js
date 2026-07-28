export const DEPARTMENT_TYPE = {
  OFFICE: 1,
  ENTERPRISE: 2,
  // Alias for backward compatibility if needed
  VAN_PHONG: 1,
  XI_NGHIEP: 2
};

export const DEPARTMENT_TYPE_LABELS = {
  [DEPARTMENT_TYPE.OFFICE]: { value: DEPARTMENT_TYPE.OFFICE, label: 'Văn Phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  [DEPARTMENT_TYPE.ENTERPRISE]: { value: DEPARTMENT_TYPE.ENTERPRISE, label: 'Xí Nghiệp', bg: 'bg-purple-100 text-purple-800 border-purple-200' }
};

export const DEPARTMENT_TYPE_OPTIONS = Object.values(DEPARTMENT_TYPE_LABELS);
