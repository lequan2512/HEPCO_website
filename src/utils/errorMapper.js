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
  
  // Devices & Hardware
  HAS_CHILDREN: 'Không thể thực hiện vì thiết bị này đang chứa linh kiện bên trong. Vui lòng tháo linh kiện ra trước.',
  DEVICE_IN_USE: 'Thiết bị đang được sử dụng hoặc đã bàn giao, không thể thay đổi.',
  ASSEMBLY_CONSTRAINT_FAILED: 'Cấu hình linh kiện không hợp lệ.',
};

export const getErrorMessage = (errorCode) => {
  if (!errorCode) return ERROR_MESSAGES.DEFAULT;
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.DEFAULT;
};
