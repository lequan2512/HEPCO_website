export const DEPARTMENT_TYPE = {
  XI_NGHIEP: 'xi_nghiep',
  VAN_PHONG: 'van_phong'
};

export const DEPARTMENT_TYPE_LABELS = {
  [DEPARTMENT_TYPE.XI_NGHIEP]: { value: DEPARTMENT_TYPE.XI_NGHIEP, label: 'Xí Nghiệp', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  [DEPARTMENT_TYPE.VAN_PHONG]: { value: DEPARTMENT_TYPE.VAN_PHONG, label: 'Văn Phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' }
};

export const DEPARTMENT_TYPE_OPTIONS = Object.values(DEPARTMENT_TYPE_LABELS);
