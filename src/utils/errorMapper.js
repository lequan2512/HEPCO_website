export const ERROR_MESSAGES = {
  // Common
  INTERNAL_ERROR: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.',
  DEFAULT: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
  
  // Auth
  MISSING_CREDENTIALS: 'Vui lòng điền đầy đủ thông tin đăng nhập!',
  IP_NOT_WHITELISTED: 'Truy cập bị từ chối: IP của bạn không có trong danh sách cho phép.',
  INVALID_CREDENTIALS: 'Tài khoản hoặc mật khẩu không chính xác!',
  TOKEN_MISSING: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.',
  TOKEN_INVALID_OR_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  
  // News
  MISSING_REQUIRED_FIELDS: 'Vui lòng điền đầy đủ tiêu đề và nội dung.',
  CREATE_FAILED: 'Đã xảy ra lỗi khi đăng bài, vui lòng thử lại.',
  FETCH_FAILED: 'Không thể tải dữ liệu, vui lòng thử lại.'
};

export const getErrorMessage = (errorCode) => {
  if (!errorCode) return ERROR_MESSAGES.DEFAULT;
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.DEFAULT;
};
