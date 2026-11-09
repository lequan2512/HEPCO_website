require('dotenv').config();

const getBaseToken = (url = '') => {
  const urlStr = String(url).toLowerCase();
  const genericToken = process.env.BASE_VN_ACCESS_TOKEN || process.env.BASE_ACCESS_TOKEN || '';

  // Base Wework App Token
  if (urlStr.includes('wework') || urlStr.includes('task')) {
    const token = process.env.BASE_VN_WEWORK_ACCESS_TOKEN || process.env.BASE_VN_WEWORK_TOKEN || genericToken;
    if (token && token.trim()) return token.trim();
    throw new Error('BASE_TOKEN_MISSING: Chưa cấu hình biến môi trường BASE_VN_ACCESS_TOKEN trong file .env');
  }

  // Base Request App Token
  if (urlStr.includes('request')) {
    const token = process.env.BASE_VN_REQUEST_ACCESS_TOKEN || process.env.BASE_VN_REQUEST_TOKEN || genericToken;
    if (token && token.trim()) return token.trim();
    throw new Error('BASE_TOKEN_MISSING: Chưa cấu hình biến môi trường BASE_VN_ACCESS_TOKEN trong file .env');
  }

  // Base Office App Token
  if (urlStr.includes('office') || urlStr.includes('docs')) {
    const token = process.env.BASE_VN_OFFICE_ACCESS_TOKEN || genericToken;
    if (token && token.trim()) return token.trim();
    throw new Error('BASE_TOKEN_MISSING: Chưa cấu hình biến môi trường BASE_VN_ACCESS_TOKEN trong file .env');
  }

  // Fallback if URL is generic
  const fallback = (
    process.env.BASE_VN_OFFICE_ACCESS_TOKEN ||
    process.env.BASE_VN_WEWORK_ACCESS_TOKEN ||
    process.env.BASE_VN_REQUEST_ACCESS_TOKEN ||
    genericToken
  ).trim();

  if (!fallback) {
    throw new Error('BASE_TOKEN_MISSING: Chưa cấu hình Token cho các ứng dụng Base.vn trong file .env');
  }

  return fallback;
};

const formatUrl = (envValue, defaultUrl) => {
  if (envValue && envValue.trim()) {
    const val = envValue.trim();
    return val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
  }
  return defaultUrl;
};

const getBaseOfficeUrl = () => formatUrl(process.env.BASE_OFFICE_DOMAIN || process.env.BASE_VN_OFFICE_URL, 'https://office.base.vn');
const getBaseRequestUrl = () => formatUrl(process.env.BASE_REQUEST_DOMAIN || process.env.BASE_VN_REQUEST_URL, 'https://request.base.vn');
const getBaseWeworkUrl = () => formatUrl(process.env.BASE_WEWORK_DOMAIN || process.env.BASE_VN_WEWORK_URL, 'https://wework.base.vn');

// Helper fetch with timeout (15s default for Base.vn Open API)
const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      const error = new Error('BASE_API_TIMEOUT: Phản hồi từ máy chủ Base.vn quá thời hạn (15s)');
      error.statusCode = 504;
      throw error;
    }
    throw err;
  }
};

// Generic Base.vn Open API caller supporting GET & POST with Access Token v2 support
const fetchBaseApi = async (url, params = {}, method = 'POST') => {
  const token = getBaseToken(url);
  if (!token) {
    throw new Error(`BASE_TOKEN_MISSING: Chưa cấu hình Access Token cho dịch vụ (${url}) trong file .env`);
  }

  let finalUrl = url;
  let options = { headers: {} };

  const authParamKey = 'access_token_v2';

  if (method.toUpperCase() === 'GET') {
    const searchParams = new URLSearchParams({
      [authParamKey]: token,
      ...params
    });
    finalUrl = url.includes('?') ? `${url}&${searchParams.toString()}` : `${url}?${searchParams.toString()}`;
    options.method = 'GET';
  } else {
    const queryParams = new URLSearchParams({
      [authParamKey]: token
    });
    finalUrl = url.includes('?') ? `${url}&${queryParams.toString()}` : `${url}?${queryParams.toString()}`;

    const bodyParams = new URLSearchParams({
      [authParamKey]: token,
      ...params
    });
    options.method = 'POST';
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.body = bodyParams.toString();
  }

  const response = await fetchWithTimeout(finalUrl, options, 15000);

  if (!response.ok) {
    throw new Error(`HTTP Error Status from Base.vn: ${response.status}`);
  }

  const text = await response.text();

  if (text.includes('<!DOCTYPE') || text.includes('Đăng nhập') || text.includes('File Not Found')) {
    const preview = token ? `${token.slice(0, 6)}...${token.slice(-4)}` : 'Chưa cấu hình';
    throw new Error(`Base.vn Token Authentication Error (${preview}): Máy chủ Base.vn yêu cầu đăng nhập. Vui lòng kiểm tra lại Access Token v2 hoặc phân quyền ứng dụng trên Base.vn.`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Base.vn API returned an invalid response format (non-JSON)');
  }

  if (json.code === 0 || (json.message && (json.message.includes('invalid') || json.message.includes('error') || json.message.includes('expired') || json.message.includes('scopes') || json.message.includes('not_found')))) {
    const preview = token ? `${token.slice(0, 6)}...${token.slice(-4)}` : 'Chưa cấu hình';

    switch (json.message) {
      case 'access_token_v2_invalid_1':
        throw new Error(`Token v2 không hợp lệ (mã: access_token_v2_invalid_1). Giá trị truyền vào rỗng hoặc không đúng cú pháp định danh Token v2.`);
      case 'access_token_v2_invalid_3':
        throw new Error(`Token v2 không khả dụng (mã: access_token_v2_invalid_3). Token có thể đã bị xóa, bị vô hiệu hóa, không tồn tại, sai ứng dụng hoặc đã hết hạn từ lâu.`);
      case 'access_token_v2_expired':
        throw new Error(`Token v2 đã hết hạn sử dụng (mã: access_token_v2_expired). Vui lòng tạo hoặc gia hạn Access Token mới trên Base Account.`);
      case 'access_token_v2_insufficient_scopes':
        throw new Error(`Token v2 không đủ phạm vi truy cập (mã: access_token_v2_insufficient_scopes). Token hiện tại chưa được cấp Scope phù hợp cho API này.`);
      case 'access_token_v2_not_found':
        throw new Error(`Thiếu key access_token_v2 (mã: access_token_v2_not_found). API này bắt buộc phải sử dụng tham số access_token_v2.`);
      case 'access_token_invalid_2':
        throw new Error(`Lỗi truyền Token v2 vào key cũ (mã: access_token_invalid_2). Đã truyền Token v2 vào tham số access_token thay vì access_token_v2.`);
      case 'access_token_invalid':
      case 'invalid_access_token':
        throw new Error(`Token API Base.vn không hợp lệ hoặc đã hết hạn (Token hiện tại: ${preview}). Mã lỗi từ Base.vn: "${json.message}". Vui lòng kiểm tra lại Access Token v2 trong .env!`);
      default:
        throw new Error(`Base.vn Error: ${json.message || 'Lỗi API không xác định từ Base.vn'}`);
    }
  }

  return json;
};

const normalizeDispatch = (item) => {
  if (!item) return item;
  const firstFile = Array.isArray(item.files) && item.files.length > 0 ? item.files[0] : null;

  let docType = item.metatype || item.type || item.dispatch_type || 'doc_received';
  if (docType === 'doc_received') docType = 'incoming';
  else if (docType === 'doc_sent') docType = 'outgoing';
  else if (docType === 'internal') docType = 'internal';
  else if (docType === 'ann') docType = 'announcement';

  let dispatchCode = item.scode;
  if (!dispatchCode) {
    if (typeof item.code === 'string') {
      dispatchCode = item.code;
    } else if (item.code && typeof item.code === 'object') {
      dispatchCode = item.code.text
        ? item.code.text
        : [item.code.counter, item.code.day && item.code.month && item.code.year ? `${item.code.day}/${item.code.month}/${item.code.year}` : null].filter(Boolean).join(' - ');
    }
  }
  if (!dispatchCode) {
    dispatchCode = item.number || item.dispatch_code || `CV-${item.id}`;
  }

  const senderInfo = item.ext_sender && item.ext_sender.name
    ? item.ext_sender.name
    : (item.sender_name
      ? `${item.sender_name}${item.sender_dept ? ` (${item.sender_dept})` : ''}`
      : (item.sender || item.from_name || item.unit_sender || item.username || 'Chưa cập nhật'));

  let receiverInfo = item.receiver || item.to_name || item.unit_receiver;
  if (!receiverInfo && Array.isArray(item.teams) && item.teams.length > 0) {
    receiverInfo = `Đơn vị / Team ID: ${item.teams.join(', ')}`;
  }
  if (Array.isArray(receiverInfo)) {
    receiverInfo = receiverInfo.join(', ');
  }
  if (!receiverInfo) {
    receiverInfo = 'Ban Lãnh Đạo - HEPCO';
  }

  return {
    id: String(item.id || item._id || ''),
    code: String(dispatchCode || `CV-${item.id}`),
    title: item.name || item.title || item.subject || 'Văn bản không tiêu đề',
    type: docType,
    sender: String(senderInfo),
    receiver: String(receiverInfo),
    status: item.status !== undefined ? String(item.status) : 'processing',
    urgency: item.urgency || item.priority || 'normal',
    created_at: item.released_date || item.created_at || item.create_time || item.sender_date || (item.since ? new Date(item.since * 1000).toISOString() : new Date().toISOString()),
    file_name: item.file_name || (firstFile ? firstFile.name : '') || (item.file_url ? item.file_url.split('/').pop() : ''),
    file_url: item.file_url || (firstFile ? (firstFile.url || firstFile.path) : '') || item.file_path || '',
    description: item.content || item.description || item.summary || item.sender_note || ''
  };
};

const normalizeRequest = (item) => {
  if (!item) return item;
  return {
    id: String(item.id || ''),
    code: item.code || item.number || `TK-${item.id}`,
    title: item.title || item.name || 'Request / Proposal',
    category: item.category || item.group || 'General Proposal',
    creator: item.creator || item.user_name || item.creator_name || 'Submitter',
    status: String(item.status ?? '0'),
    created_at: item.created_at || item.create_time || new Date().toISOString(),
    amount: item.amount ? `${Number(item.amount).toLocaleString('vi-VN')} VNĐ` : (item.price || '---'),
    description: item.description || item.content || ''
  };
};

/**
 * Helper to compute accurate pagination & slice data in-memory for Base.vn APIs
 */
const computePagination = (normalized, page, limit, rawTotal, isServerPaginated = false) => {
  const total = (typeof rawTotal === 'number' && !isNaN(rawTotal)) ? rawTotal : normalized.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  let pagedData;
  if (isServerPaginated) {
    pagedData = normalized;
  } else {
    const offset = (safePage - 1) * limit;
    pagedData = normalized.slice(offset, offset + limit);
  }

  return {
    data: pagedData,
    meta: {
      total,
      page: safePage,
      limit,
      totalPages
    }
  };
};

/**
 * Fetch dispatch/document list from Base Office
 */
exports.getDispatches = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const search = (query.search || '').trim().toLowerCase();
  const type = query.type || '';
  const status = query.status || '';

  // Request a large batch (up to 1000) from Base Office API to get true document count & list
  const apiParams = { limit: '1000', num: '1000' };
  if (search) {
    apiParams.q = search;
    apiParams.search = search;
  }
  if (type) {
    apiParams.type = type;
    apiParams.metatype = type;
  }
  if (status) {
    apiParams.status = status;
  }

  let json;
  try {
    json = await fetchBaseApi(`${getBaseOfficeUrl()}/extapi/v1/docs/get`, apiParams, 'GET');
  } catch (err1) {
    try {
      json = await fetchBaseApi(`${getBaseOfficeUrl()}/extapi/v1/docs/get`, apiParams, 'POST');
    } catch (err2) {
      throw err1 || err2;
    }
  }

  if (!json) {
    throw new Error('Base Office API trả về phản hồi rỗng');
  }

  const items = json.docs || json.documents || json.dispatches || json.data || json.items || json.list || [];
  let normalized = Array.isArray(items) ? items.map(normalizeDispatch) : [];

  if (search) {
    normalized = normalized.filter(d =>
      (d.title && d.title.toLowerCase().includes(search)) ||
      (d.code && d.code.toLowerCase().includes(search)) ||
      (d.sender && d.sender.toLowerCase().includes(search)) ||
      (d.receiver && d.receiver.toLowerCase().includes(search))
    );
  }
  if (type) {
    normalized = normalized.filter(d => String(d.type) === String(type));
  }
  if (status) {
    normalized = normalized.filter(d => String(d.status) === String(status));
  }

  const totalCount = normalized.length;

  return computePagination(normalized, page, limit, totalCount, false);
};

/**
 * Fetch dispatch detail from Base Office
 */
exports.getDispatchDetail = async (id) => {
  let json;
  try {
    json = await fetchBaseApi(`${getBaseOfficeUrl()}/extapi/v1/docs/get`, { id: String(id) }, 'GET');
  } catch (err1) {
    try {
      json = await fetchBaseApi(`${getBaseOfficeUrl()}/extapi/v1/docs/get`, { id: String(id) }, 'POST');
    } catch (err2) {
      throw err1 || err2;
    }
  }

  if (json && (json.doc || json.document || json.dispatch || json.data)) {
    return normalizeDispatch(json.doc || json.document || json.dispatch || json.data);
  }
  throw new Error('NOT_FOUND');
};

/**
 * Create a new document on Base Office
 */
exports.createDispatch = async (data) => {
  const json = await fetchBaseApi(`${getBaseOfficeUrl()}/extapi/v1/docs/create`, data, 'POST');

  if (!json) {
    throw new Error('Không thể tạo công văn trên Base Office API');
  }

  if (json && (json.id || json.data)) {
    return normalizeDispatch(json.data || json);
  }
  return normalizeDispatch(json);
};

/**
 * Fetch request list (Base Request)
 */
exports.getRequests = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const search = (query.search || '').trim().toLowerCase();
  const status = (query.status || '').trim();

  const apiParams = { limit: '1000', num: '1000' };
  if (search) {
    apiParams.q = search;
    apiParams.search = search;
  }
  if (status) {
    apiParams.status = status;
  }

  let json;
  try {
    json = await fetchBaseApi(`${getBaseRequestUrl()}/extapi/v1/request/list`, apiParams, 'POST');
  } catch (err1) {
    try {
      json = await fetchBaseApi(`${getBaseRequestUrl()}/extapi/v1/request/list`, apiParams, 'GET');
    } catch (err2) {
      throw err1 || err2;
    }
  }

  if (!json) {
    throw new Error('Base Request API trả về phản hồi rỗng');
  }

  const items = json.requests || json.data || json.items || json.list || [];
  let normalized = Array.isArray(items) ? items.map(normalizeRequest) : [];

  if (search) {
    normalized = normalized.filter(r =>
      (r.title && r.title.toLowerCase().includes(search)) ||
      (r.code && r.code.toLowerCase().includes(search)) ||
      (r.creator && r.creator.toLowerCase().includes(search)) ||
      (r.category && r.category.toLowerCase().includes(search))
    );
  }
  if (status) {
    normalized = normalized.filter(r => String(r.status) === String(status));
  }

  const totalCount = normalized.length;

  return computePagination(normalized, page, limit, totalCount, false);
};

/**
 * Fetch task list (Base Wework)
 */
exports.getTasks = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const search = (query.search || '').trim().toLowerCase();
  const status = (query.status || '').trim();

  const apiParams = { limit: '1000', num: '1000' };
  if (search) {
    apiParams.q = search;
    apiParams.search = search;
  }
  if (status) {
    apiParams.status = status;
  }

  let json;
  try {
    json = await fetchBaseApi(`${getBaseWeworkUrl()}/extapi/v3/project/list`, apiParams, 'POST');
  } catch (err1) {
    try {
      json = await fetchBaseApi(`${getBaseWeworkUrl()}/extapi/v3/user/tasks`, apiParams, 'POST');
    } catch (err2) {
      throw err1 || err2;
    }
  }

  if (!json) {
    throw new Error('Base Wework API trả về phản hồi rỗng');
  }

  const projects = Array.isArray(json) ? json : (json.projects || json.data || json.items || []);

  let normalized = Array.isArray(projects) ? projects.map(p => ({
    id: String(p.id || ''),
    title: p.name || p.title || 'Dự án / Công việc',
    project: p.category || p.code || 'Base Wework',
    assignee: Array.isArray(p.managers) && p.managers.length > 0 ? p.managers.map(m => m.username || m.name || m).join(', ') : 'Chưa phân công',
    due_date: p.etime && p.etime !== '0' ? new Date(Number(p.etime) * 1000).toLocaleDateString('vi-VN') : 'Không có hạn',
    status: p.status === '0' || p.stage === 'running' ? 'in_progress' : (p.status || 'in_progress')
  })) : [];

  if (search) {
    normalized = normalized.filter(t =>
      (t.title && t.title.toLowerCase().includes(search)) ||
      (t.project && t.project.toLowerCase().includes(search)) ||
      (t.assignee && t.assignee.toLowerCase().includes(search))
    );
  }
  if (status) {
    normalized = normalized.filter(t => String(t.status) === String(status));
  }

  const totalCount = normalized.length;

  return computePagination(normalized, page, limit, totalCount, false);
};

/**
 * Check real Token connection status from Base.vn
 */
exports.checkHealth = async () => {
  const token = getBaseToken();
  if (!token) {
    return {
      connected: false,
      message: 'BASE_VN_ACCESS_TOKEN chưa được cấu hình trong file .env',
      mode: 'live'
    };
  }

  try {
    const json = await fetchBaseApi(`${getBaseRequestUrl()}/extapi/v1/request/list`, { limit: '1' }, 'POST');
    if (json && (json.requests || json.data || Array.isArray(json))) {
      return {
        connected: true,
        message: 'Base.vn API connection ready (Token v2) - 100% REAL DATA',
        mode: 'live',
        token_preview: `${token.slice(0, 6)}...${token.slice(-4)}`
      };
    }
    return {
      connected: false,
      message: 'Kết nối thất bại: Phản hồi từ Base.vn không khớp dữ liệu',
      mode: 'live'
    };
  } catch (err) {
    return {
      connected: false,
      message: err.message,
      mode: 'live'
    };
  }
};
