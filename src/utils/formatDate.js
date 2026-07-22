/**
 * Helper định dạng ngày tháng an toàn cho hệ thống Base.vn & HEPCO
 * Hỗ trợ: ISO String, UNIX Timestamp (giây / miligiây), Chuỗi ngày Việt Nam
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return '---';
  try {
    // Nếu là UNIX timestamp dạng số hoặc chuỗi toàn chữ số (VD: 1753200000 hoặc "1753200000")
    if (typeof dateVal === 'number' || (typeof dateVal === 'string' && /^\d+$/.test(dateVal.trim()))) {
      const num = Number(dateVal);
      // Nếu dưới 10 tỷ (10 chữ số) -> Timestamp tính theo GIÂY của Base.vn -> nhân 1000 sang miligiây
      const ms = num < 10000000000 ? num * 1000 : num;
      return new Date(ms).toLocaleDateString('vi-VN');
    }

    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('vi-VN');
  } catch {
    return String(dateVal);
  }
};
