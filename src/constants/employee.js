export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: { value: EMPLOYEE_STATUS.ACTIVE, label: 'Hoạt động', bg: 'bg-green-100 text-green-800 border-green-200' },
  [EMPLOYEE_STATUS.INACTIVE]: { value: EMPLOYEE_STATUS.INACTIVE, label: 'Đã nghỉ việc', bg: 'bg-red-100 text-red-800 border-red-200' }
};

export const EMPLOYEE_STATUS_OPTIONS = Object.values(EMPLOYEE_STATUS_LABELS);
