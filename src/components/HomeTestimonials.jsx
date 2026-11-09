import { Star } from 'lucide-react';

const DEFAULT_TESTIMONIALS = [
  {
    content:
      'HEPCO luôn chủ động và kịp thời trong công tác thu gom, giữ gìn môi trường các tuyến phố du lịch nội thị luôn văn minh, phong quang và sạch đẹp.',
    author: 'Đại diện UBND Phường',
    role: 'Phường Thuận Hóa, TP. Huế',
    rating: 5,
  },
  {
    content:
      'Dịch vụ xử lý chất thải và hút bùn công nghiệp của HEPCO rất chuyên nghiệp, hồ sơ nghiệm thu rõ ràng, đáp ứng đầy đủ tiêu chuẩn môi trường nghiêm ngặt của nhà máy.',
    author: 'Ban Quản Lý KCN',
    role: 'Khu Công Nghiệp Phú Bài, TT. Huế',
    rating: 5,
  },
  {
    content:
      'Công tác bảo đảm vệ sinh môi trường và bố trí hệ thống thu gom, nhà vệ sinh lưu động cho các kỳ Festival Huế được HEPCO triển khai vô cùng chu đáo và nhanh gọn.',
    author: 'Ban Tổ Chức Sự Kiện',
    role: 'Festival Huế & Lễ Hội Văn Hóa',
    rating: 5,
  },
];

const HomeTestimonials = ({ config }) => {
  const title = config?.title || 'Đánh Giá & Sự Tin Cậy';
  const subtitle = config?.subtitle || 'Những ghi nhận chân thực từ chính quyền cơ sở, doanh nghiệp đối tác và người dân địa phương.';
  const testimonials = Array.isArray(config?.items) && config.items.length > 0
    ? config.items
    : DEFAULT_TESTIMONIALS;

  return (
    <section className="py-20 md:py-28 bg-[#fafafa] border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between p-8 rounded-3xl bg-white border border-gray-200/90 hover:border-emerald-600/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              <div>
                {/* 5 Stars Rating */}
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(Number(item.rating) || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-base text-gray-700 leading-relaxed italic mb-8 font-normal">
                  "{item.content}"
                </p>
              </div>

              {/* Author Meta */}
              <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {item.author ? item.author.charAt(0) : 'H'}
                </div>
                <div>
                  <div className="font-black text-[#10243b] text-sm">
                    {item.author}
                  </div>
                  <div className="text-xs text-gray-500 font-normal">
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonials;
