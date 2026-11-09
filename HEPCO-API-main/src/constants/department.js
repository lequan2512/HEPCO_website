const DEPARTMENT_TYPE = {
  OFFICE: 1,
  ENTERPRISE: 2
};

const DEPARTMENT_TYPE_LABELS = {
  [DEPARTMENT_TYPE.OFFICE]: { value: DEPARTMENT_TYPE.OFFICE, label: 'Văn Phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  [DEPARTMENT_TYPE.ENTERPRISE]: { value: DEPARTMENT_TYPE.ENTERPRISE, label: 'Xí Nghiệp', bg: 'bg-purple-100 text-purple-800 border-purple-200' }
};

const DEPARTMENT_TYPE_OPTIONS = Object.values(DEPARTMENT_TYPE_LABELS);

module.exports = {
  DEPARTMENT_TYPE,
  DEPARTMENT_TYPE_LABELS,
  DEPARTMENT_TYPE_OPTIONS
};
