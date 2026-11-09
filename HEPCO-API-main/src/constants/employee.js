const EMPLOYEE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0
};

const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: { value: EMPLOYEE_STATUS.ACTIVE, label: 'Hoạt động', bg: 'bg-green-100 text-green-800 border-green-200' },
  [EMPLOYEE_STATUS.INACTIVE]: { value: EMPLOYEE_STATUS.INACTIVE, label: 'Đã nghỉ việc', bg: 'bg-red-100 text-red-800 border-red-200' }
};

const EMPLOYEE_STATUS_OPTIONS = Object.values(EMPLOYEE_STATUS_LABELS);

const EMPLOYEE_TYPE = {
  FEE_COLLECTOR: 1,
  OFFICE_STAFF: 2
};

const EMPLOYEE_TYPE_LABELS = {
  [EMPLOYEE_TYPE.FEE_COLLECTOR]: { value: EMPLOYEE_TYPE.FEE_COLLECTOR, label: 'NV Thu phí', bg: 'bg-orange-100 text-orange-800 border-orange-200' },
  [EMPLOYEE_TYPE.OFFICE_STAFF]: { value: EMPLOYEE_TYPE.OFFICE_STAFF, label: 'NV Văn phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' }
};

const EMPLOYEE_TYPE_OPTIONS = Object.values(EMPLOYEE_TYPE_LABELS);

module.exports = {
  EMPLOYEE_STATUS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYEE_TYPE,
  EMPLOYEE_TYPE_LABELS,
  EMPLOYEE_TYPE_OPTIONS
};
