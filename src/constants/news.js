export const ARTICLE_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  HIDDEN: 'hidden'
};

export const ARTICLE_STATUS_LABELS = {
  [ARTICLE_STATUS.PUBLISHED]: {
    value: ARTICLE_STATUS.PUBLISHED,
    label: 'Hiển thị',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  [ARTICLE_STATUS.DRAFT]: {
    value: ARTICLE_STATUS.DRAFT,
    label: 'Bản nháp',
    bg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  [ARTICLE_STATUS.HIDDEN]: {
    value: ARTICLE_STATUS.HIDDEN,
    label: 'Đang ẩn',
    bg: 'bg-gray-100 text-gray-700 border-gray-200'
  }
};

export const ARTICLE_STATUS_OPTIONS = Object.values(ARTICLE_STATUS_LABELS);

export const NEWS_CATEGORY = {
  ALL: 'all',
  COMPANY_ACTIVITY: 'company_activity',
  EVENT: 'event',
  ENVIRONMENT: 'environment',
  ANNOUNCEMENT: 'announcement',
  PUBLIC_DOCUMENT: 'public_document',
  UNION_ACTIVITY: 'union_activity',
  BUSINESS_OPERATION: 'business_operation'
};

export const NEWS_CATEGORY_LABELS = {
  [NEWS_CATEGORY.ALL]: {
    value: NEWS_CATEGORY.ALL,
    label: 'Tất cả chuyên mục',
    bg: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  [NEWS_CATEGORY.COMPANY_ACTIVITY]: {
    value: NEWS_CATEGORY.COMPANY_ACTIVITY,
    label: 'Hoạt động công ty',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  [NEWS_CATEGORY.EVENT]: {
    value: NEWS_CATEGORY.EVENT,
    label: 'Tin tức sự kiện',
    bg: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  [NEWS_CATEGORY.ENVIRONMENT]: {
    value: NEWS_CATEGORY.ENVIRONMENT,
    label: 'Tin tức môi trường',
    bg: 'bg-green-50 text-green-700 border-green-200'
  },
  [NEWS_CATEGORY.ANNOUNCEMENT]: {
    value: NEWS_CATEGORY.ANNOUNCEMENT,
    label: 'Thông báo',
    bg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  [NEWS_CATEGORY.PUBLIC_DOCUMENT]: {
    value: NEWS_CATEGORY.PUBLIC_DOCUMENT,
    label: 'Văn bản & Công khai',
    bg: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  [NEWS_CATEGORY.UNION_ACTIVITY]: {
    value: NEWS_CATEGORY.UNION_ACTIVITY,
    label: 'Hoạt động đoàn thể',
    bg: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  [NEWS_CATEGORY.BUSINESS_OPERATION]: {
    value: NEWS_CATEGORY.BUSINESS_OPERATION,
    label: 'Sản xuất kinh doanh',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
};

export const NEWS_CATEGORY_OPTIONS = Object.values(NEWS_CATEGORY_LABELS);

export const SHAREHOLDER_DOC_TYPE = {
  ALL: 'all',
  AUDITED_FINANCIAL_REPORT: 'audited_financial_report',
  FINANCIAL_REPORT: 'financial_report',
  ANNUAL_REPORT: 'annual_report',
  GOVERNANCE_REPORT: 'governance_report',
  FINANCIAL_SUPERVISION_REPORT: 'financial_supervision_report',
  BOARD_RESOLUTION: 'board_resolution',
  AGM_RESOLUTION_MINUTES: 'agm_resolution_minutes',
  AGM_NOTICE: 'agm_notice',
  DIVIDEND_NOTICE: 'dividend_notice',
  STOCK_TRADING_NOTICE: 'stock_trading_notice',
  PERSONNEL_CHANGE: 'personnel_change',
  EXTRAORDINARY_DISCLOSURE: 'extraordinary_disclosure',
  REGULATORY_DOCUMENT: 'regulatory_document',
  OTHER_DOCUMENT: 'other_document'
};

export const SHAREHOLDER_DOC_TYPE_LABELS = {
  [SHAREHOLDER_DOC_TYPE.ALL]: {
    value: SHAREHOLDER_DOC_TYPE.ALL,
    label: 'Tất cả loại văn bản',
    bg: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  [SHAREHOLDER_DOC_TYPE.AUDITED_FINANCIAL_REPORT]: {
    value: SHAREHOLDER_DOC_TYPE.AUDITED_FINANCIAL_REPORT,
    label: 'Báo cáo tài chính đã kiểm toán',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  [SHAREHOLDER_DOC_TYPE.FINANCIAL_REPORT]: {
    value: SHAREHOLDER_DOC_TYPE.FINANCIAL_REPORT,
    label: 'Báo cáo tài chính',
    bg: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  [SHAREHOLDER_DOC_TYPE.ANNUAL_REPORT]: {
    value: SHAREHOLDER_DOC_TYPE.ANNUAL_REPORT,
    label: 'Báo cáo thường niên',
    bg: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  [SHAREHOLDER_DOC_TYPE.GOVERNANCE_REPORT]: {
    value: SHAREHOLDER_DOC_TYPE.GOVERNANCE_REPORT,
    label: 'Báo cáo quản trị công ty',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  [SHAREHOLDER_DOC_TYPE.FINANCIAL_SUPERVISION_REPORT]: {
    value: SHAREHOLDER_DOC_TYPE.FINANCIAL_SUPERVISION_REPORT,
    label: 'Báo cáo giám sát tài chính',
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  [SHAREHOLDER_DOC_TYPE.AGM_RESOLUTION_MINUTES]: {
    value: SHAREHOLDER_DOC_TYPE.AGM_RESOLUTION_MINUTES,
    label: 'Biên bản & Nghị quyết ĐHĐCĐ',
    bg: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  [SHAREHOLDER_DOC_TYPE.AGM_NOTICE]: {
    value: SHAREHOLDER_DOC_TYPE.AGM_NOTICE,
    label: 'Thông báo họp ĐHĐCĐ',
    bg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  [SHAREHOLDER_DOC_TYPE.BOARD_RESOLUTION]: {
    value: SHAREHOLDER_DOC_TYPE.BOARD_RESOLUTION,
    label: 'Nghị quyết & Quy chế HĐQT',
    bg: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  [SHAREHOLDER_DOC_TYPE.DIVIDEND_NOTICE]: {
    value: SHAREHOLDER_DOC_TYPE.DIVIDEND_NOTICE,
    label: 'Thông báo chi trả cổ tức',
    bg: 'bg-green-50 text-green-700 border-green-200'
  },
  [SHAREHOLDER_DOC_TYPE.STOCK_TRADING_NOTICE]: {
    value: SHAREHOLDER_DOC_TYPE.STOCK_TRADING_NOTICE,
    label: 'Thông báo giao dịch cổ phiếu',
    bg: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  [SHAREHOLDER_DOC_TYPE.PERSONNEL_CHANGE]: {
    value: SHAREHOLDER_DOC_TYPE.PERSONNEL_CHANGE,
    label: 'Thay đổi nhân sự quản trị',
    bg: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  [SHAREHOLDER_DOC_TYPE.EXTRAORDINARY_DISCLOSURE]: {
    value: SHAREHOLDER_DOC_TYPE.EXTRAORDINARY_DISCLOSURE,
    label: 'Công bố thông tin bất thường',
    bg: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  [SHAREHOLDER_DOC_TYPE.REGULATORY_DOCUMENT]: {
    value: SHAREHOLDER_DOC_TYPE.REGULATORY_DOCUMENT,
    label: 'Văn bản gửi cơ quan quản lý',
    bg: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  [SHAREHOLDER_DOC_TYPE.OTHER_DOCUMENT]: {
    value: SHAREHOLDER_DOC_TYPE.OTHER_DOCUMENT,
    label: 'Tài liệu & Thông báo khác',
    bg: 'bg-gray-100 text-gray-700 border-gray-200'
  }
};

export const SHAREHOLDER_DOC_TYPE_OPTIONS = Object.values(SHAREHOLDER_DOC_TYPE_LABELS);

// High-level grouped categories for Shareholder Documents to keep filter UI clean and intuitive
export const SHAREHOLDER_DOC_GROUP = {
  ALL: 'all',
  REPORTS: 'group_reports',
  AGM_BOARD: 'group_agm_board',
  DIVIDEND_STOCK: 'group_dividend_stock',
  DISCLOSURE_OTHER: 'group_disclosure_other'
};

export const SHAREHOLDER_DOC_GROUP_LABELS = {
  [SHAREHOLDER_DOC_GROUP.ALL]: {
    value: SHAREHOLDER_DOC_GROUP.ALL,
    label: 'Tất cả tài liệu',
    shortLabel: 'Tất cả',
    bg: 'bg-gray-100 text-gray-800 border-gray-200',
    types: []
  },
  [SHAREHOLDER_DOC_GROUP.REPORTS]: {
    value: SHAREHOLDER_DOC_GROUP.REPORTS,
    label: 'Báo cáo định kỳ & Tài chính',
    shortLabel: 'Báo cáo & Tài chính',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    types: [
      SHAREHOLDER_DOC_TYPE.AUDITED_FINANCIAL_REPORT,
      SHAREHOLDER_DOC_TYPE.FINANCIAL_REPORT,
      SHAREHOLDER_DOC_TYPE.ANNUAL_REPORT,
      SHAREHOLDER_DOC_TYPE.GOVERNANCE_REPORT,
      SHAREHOLDER_DOC_TYPE.FINANCIAL_SUPERVISION_REPORT
    ]
  },
  [SHAREHOLDER_DOC_GROUP.AGM_BOARD]: {
    value: SHAREHOLDER_DOC_GROUP.AGM_BOARD,
    label: 'Đại hội cổ đông & HĐQT',
    shortLabel: 'ĐHĐCĐ & HĐQT',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    types: [
      SHAREHOLDER_DOC_TYPE.AGM_NOTICE,
      SHAREHOLDER_DOC_TYPE.AGM_RESOLUTION_MINUTES,
      SHAREHOLDER_DOC_TYPE.BOARD_RESOLUTION
    ]
  },
  [SHAREHOLDER_DOC_GROUP.DIVIDEND_STOCK]: {
    value: SHAREHOLDER_DOC_GROUP.DIVIDEND_STOCK,
    label: 'Cổ tức & Giao dịch cổ phiếu',
    shortLabel: 'Cổ tức & Cổ phiếu',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    types: [
      SHAREHOLDER_DOC_TYPE.DIVIDEND_NOTICE,
      SHAREHOLDER_DOC_TYPE.STOCK_TRADING_NOTICE
    ]
  },
  [SHAREHOLDER_DOC_GROUP.DISCLOSURE_OTHER]: {
    value: SHAREHOLDER_DOC_GROUP.DISCLOSURE_OTHER,
    label: 'Nhân sự & Công bố thông tin khác',
    shortLabel: 'Công bố & Khác',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    types: [
      SHAREHOLDER_DOC_TYPE.PERSONNEL_CHANGE,
      SHAREHOLDER_DOC_TYPE.EXTRAORDINARY_DISCLOSURE,
      SHAREHOLDER_DOC_TYPE.REGULATORY_DOCUMENT,
      SHAREHOLDER_DOC_TYPE.OTHER_DOCUMENT
    ]
  }
};

export const SHAREHOLDER_DOC_GROUP_OPTIONS = Object.values(SHAREHOLDER_DOC_GROUP_LABELS);

export const GALLERY_CATEGORY = {
  ALL: 'all',
  COMPANY: 'company',
  EVENT: 'event',
  ENVIRONMENT: 'environment',
  EQUIPMENT: 'equipment',
  PROJECT: 'project'
};

export const GALLERY_CATEGORY_LABELS = {
  [GALLERY_CATEGORY.ALL]: {
    value: GALLERY_CATEGORY.ALL,
    label: 'Tất cả hình ảnh',
    bg: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  [GALLERY_CATEGORY.COMPANY]: {
    value: GALLERY_CATEGORY.COMPANY,
    label: 'Hoạt động công ty',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  [GALLERY_CATEGORY.EVENT]: {
    value: GALLERY_CATEGORY.EVENT,
    label: 'Sự kiện & Đoàn thể',
    bg: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  [GALLERY_CATEGORY.ENVIRONMENT]: {
    value: GALLERY_CATEGORY.ENVIRONMENT,
    label: 'Vệ sinh môi trường',
    bg: 'bg-green-50 text-green-700 border-green-200'
  },
  [GALLERY_CATEGORY.EQUIPMENT]: {
    value: GALLERY_CATEGORY.EQUIPMENT,
    label: 'Phương tiện & Thiết bị',
    bg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  [GALLERY_CATEGORY.PROJECT]: {
    value: GALLERY_CATEGORY.PROJECT,
    label: 'Công trình & Dự án',
    bg: 'bg-purple-50 text-purple-700 border-purple-200'
  }
};

export const GALLERY_CATEGORY_OPTIONS = Object.values(GALLERY_CATEGORY_LABELS);
