export const ERROR_MESSAGES = {
  // Common
  INTERNAL_ERROR: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.',
  DEFAULT: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',

  // Auth
  MISSING_CREDENTIALS: 'Vui lòng điền đầy đủ thông tin đăng nhập!',
  IP_NOT_WHITELISTED: 'Truy cập bị từ chối!',
  INVALID_CREDENTIALS: 'Tài khoản hoặc mật khẩu không chính xác!',
  TOKEN_MISSING: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.',
  TOKEN_INVALID_OR_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',

  AUTH_CONFIGURATION_ERROR: 'Máy chủ chưa cấu hình xác thực. Vui lòng liên hệ quản trị.',
  CMS_ACCESS_DENIED: 'Tài khoản chưa được cấp quyền quản lý nội dung.',
  INVALID_SERVER_RESPONSE: 'Máy chủ chưa xác nhận kết quả hợp lệ. Hãy kiểm tra danh sách trước khi thử lại.',
  SERVER_CONFIRMATION_UNAVAILABLE: 'Chưa xác nhận được kết quả từ máy chủ. Nội dung nhập vẫn được giữ; hãy kiểm tra trước khi gửi lại.',
  PERMANENT_UPLOAD_REQUIRED: 'Tệp cần được lưu trên máy chủ bằng đường dẫn cố định.',
  LOGIN_RATE_LIMITED: 'Đã có quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.',
  SHOWCASE_CONFLICT: 'Có người đã lưu bản mới hơn. Bản đang sửa được giữ nguyên; tải lại bản đã lưu để đối chiếu.',
  // News
  MISSING_REQUIRED_FIELDS: 'Vui lòng điền đầy đủ tiêu đề và nội dung.',
  CREATE_FAILED: 'Đã xảy ra lỗi khi đăng bài, vui lòng thử lại.',
  FETCH_FAILED: 'Không thể tải dữ liệu, vui lòng thử lại.',

  // IP Whitelist
  INVALID_IPV4_FORMAT: 'Định dạng IP không hợp lệ.',
  IP_ALREADY_EXISTS: 'Địa chỉ IP này đã tồn tại.',

  // Generic Data & Database
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  BAD_REQUEST: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.',
  DATABASE_ERROR: 'Lỗi truy xuất cơ sở dữ liệu. Vui lòng thử lại.',
  DUPLICATE_ENTRY: 'Dữ liệu này đã tồn tại trong hệ thống.',
  DELETE_FAILED: 'Xóa không thành công. Có thể dữ liệu đang được sử dụng.',

  // Employees
  EMPLOYEE_HAS_DEVICES: 'Không thể xóa hoặc vô hiệu hóa vì nhân viên đang giữ thiết bị hoặc máy POS chưa hoàn trả.',

  // Devices & Hardware
  HAS_CHILDREN: 'Không thể thực hiện vì thiết bị này đang chứa linh kiện bên trong. Vui lòng tháo linh kiện ra trước.',
  DEVICE_IN_USE: 'Thiết bị đang được sử dụng hoặc đã bàn giao, không thể thay đổi.',
  ASSEMBLY_CONSTRAINT_FAILED: 'Cấu hình linh kiện không hợp lệ.',
};

export const getErrorMessage = (errorCode) => {
  if (!errorCode) return ERROR_MESSAGES.DEFAULT;
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.DEFAULT;
};
