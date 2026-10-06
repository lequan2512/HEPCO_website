import { Star } from 'lucide-react';

const HomeTestimonials = () => {
  const testimonials = [
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

  return (
    <section className="py-20 md:py-28 bg-[#fafafa] border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight mb-4">
            Đánh Giá &amp; Sự Tin Cậy
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            Những ghi nhận chân thực từ chính quyền cơ sở, doanh nghiệp đối tác và người dân địa phương.
          </p>
        </div>

        {/* 3 Review Cards Grid (Oakdale Style Minimalist Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-8 sm:p-9 rounded-3xl bg-white border border-gray-200 hover:border-emerald-600/50 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium mb-8">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#10243b] group-hover:text-emerald-700 transition-colors">
                    {item.author}
                  </h4>
                  <p className="text-xs text-gray-500">{item.role}</p>
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
