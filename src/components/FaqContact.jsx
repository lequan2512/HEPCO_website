import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Send, HelpCircle } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const FaqContact = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' or 'contact'

  const faqs = [
    'Làm thế nào để tra cứu lịch trình thu gom rác tại tuyến đường nhà tôi?',
    'Quy trình đăng ký dịch vụ hút hầm vệ sinh hoặc cắt tỉa cành cây như thế nào?',
    'Doanh nghiệp có thể ký hợp đồng thu gom chất thải công nghiệp định kỳ bằng cách nào?',
    'Cách thức tra cứu và thanh toán tiền dịch vụ vệ sinh môi trường qua hóa đơn điện tử?',
    'Khi phát hiện điểm tập kết rác thải tự phát hoặc sự cố môi trường, tôi phản ánh qua đâu?'
  ];

  const faqAnswers = [
    'Quý khách có thể vào mục "Lịch Gom Rác" ngay trên trang chủ để tra cứu lịch theo từng phường/xã và tuyến đường cụ thể, hoặc liên hệ tổng đài (0234) 3822 052.',
    'Quý khách chỉ cần chọn mục "Đăng ký dịch vụ" trên website hoặc liên hệ hotline. Đội ngũ kỹ thuật của HEPCO sẽ liên hệ lại trong vòng 24 giờ để khảo sát và báo giá cụ thể.',
    'Doanh nghiệp có thể gửi yêu cầu qua form liên hệ hoặc liên hệ trực tiếp phòng Kế hoạch - Kinh doanh của HEPCO. Chúng tôi cung cấp hợp đồng trọn gói kèm đầy đủ chứng từ nghiệm thu môi trường theo luật định.',
    'Quý khách truy cập cổng "Hóa Đơn Điện Tử" tại hoadondientu.hepco.com.vn, nhập mã khách hàng in trên biên lai thu tiền để tra cứu và thanh toán trực tuyến qua các ngân hàng.',
    'Quý khách có thể chụp ảnh và gửi phản ánh qua mục "Báo cáo sự cố" trên website, hoặc gọi hotline khẩn cấp 24/7 để đội cơ động HEPCO tiếp nhận và xử lý nhanh chóng trong ngày.'
  ];

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Vui lòng nhập họ và tên'),
      email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
      phone: Yup.string().matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số').required('Vui lòng nhập số điện thoại'),
      subject: Yup.string().required('Vui lòng nhập tiêu đề'),
      message: Yup.string().required('Vui lòng nhập nội dung'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/u/0/d/1BRxY1y5xSyZYX09Yn0v514ByMSfWNKHPdX58DzmQIBU/formResponse';

        const formData = new FormData();
        formData.append('entry.404545615', values.name);
        formData.append('entry.710400486', values.email);
        formData.append('entry.440170666', values.phone);
        formData.append('entry.786099976', values.subject);
        formData.append('entry.1701173373', values.message);

        await fetch(GOOGLE_FORM_ACTION_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });

        toast.success('Yêu cầu của bạn đã được gửi thành công!');
        resetForm();
      } catch (error) {
        console.error('Lỗi khi gửi form:', error);
        toast.error('Đã xảy ra lỗi khi gửi. Vui lòng thử lại sau.');
      }
    },
  });

  return (
    <section id="faq-contact-section" className="py-20 md:py-28 bg-[#f8fafc] border-b border-gray-200/80 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10243b] tracking-tight leading-tight mb-4">
            Giải Đáp Thắc Mắc &amp; Liên Hệ
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            Chúng tôi luôn lắng nghe và phản hồi mọi câu hỏi, ý kiến đóng góp của quý khách hàng và nhân dân.
          </p>
        </div>

        {/* Content Box (Oakdale Style Clean Split) */}
        <div className="rounded-3xl overflow-hidden bg-white border border-gray-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left Side: Tabs (FAQ & Contact) */}
          <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200/80">
            <div>
              {/* Tab Selector Buttons */}
              <div className="flex border-b border-gray-200 mb-8 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('faq')}
                  className={`flex items-center gap-2 pb-3.5 px-3 text-sm sm:text-base font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === 'faq'
                      ? 'border-[#10243b] text-[#10243b]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>Câu Hỏi Thường Gặp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className={`flex items-center gap-2 pb-3.5 px-3 text-sm sm:text-base font-bold transition-all border-b-2 cursor-pointer ${
                    activeTab === 'contact'
                      ? 'border-[#10243b] text-[#10243b]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Gửi Yêu Cầu Dịch Vụ</span>
                </button>
              </div>

              {/* Tab 1: FAQ Accordion */}
              {activeTab === 'faq' && (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200/80 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:border-emerald-600/40 bg-[#fafafa]"
                    >
                      <button
                        type="button"
                        className="w-full flex justify-between items-center text-left focus:outline-none group cursor-pointer"
                        onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                      >
                        <span className={`text-sm sm:text-base font-bold pr-4 transition-colors ${
                          openFaq === index ? 'text-emerald-700' : 'text-[#10243b] group-hover:text-emerald-700'
                        }`}>
                          {faq}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          openFaq === index ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {openFaq === index ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                      {openFaq === index && (
                        <div className="mt-4 pt-3 border-t border-gray-200/60 text-gray-600 text-sm leading-relaxed">
                          {faqAnswers[index]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Contact Form */}
              {activeTab === 'contact' && (
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Nguyễn Văn A"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full bg-[#fafafa] border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-xl focus:bg-white focus:outline-none transition-all ${
                          formik.touched.name && formik.errors.name
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-gray-200 focus:border-[#10243b]'
                        }`}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="0905 123 456"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full bg-[#fafafa] border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-xl focus:bg-white focus:outline-none transition-all ${
                          formik.touched.phone && formik.errors.phone
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-gray-200 focus:border-[#10243b]'
                        }`}
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full bg-[#fafafa] border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-xl focus:bg-white focus:outline-none transition-all ${
                          formik.touched.email && formik.errors.email
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-gray-200 focus:border-[#10243b]'
                        }`}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Tiêu đề yêu cầu *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        placeholder="Đăng ký thu gom rác / Báo giá"
                        value={formik.values.subject}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full bg-[#fafafa] border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-xl focus:bg-white focus:outline-none transition-all ${
                          formik.touched.subject && formik.errors.subject
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-gray-200 focus:border-[#10243b]'
                        }`}
                      />
                      {formik.touched.subject && formik.errors.subject && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.subject}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Nội dung chi tiết *
                    </label>
                    <textarea
                      name="message"
                      placeholder="Mô tả cụ thể nhu cầu dịch vụ hoặc câu hỏi của quý khách..."
                      rows="4"
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full bg-[#fafafa] border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-xl focus:bg-white focus:outline-none transition-all resize-none ${
                        formik.touched.message && formik.errors.message
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-gray-200 focus:border-[#10243b]'
                      }`}
                    />
                    {formik.touched.message && formik.errors.message && (
                      <div className="text-red-500 text-xs mt-1">{formik.errors.message}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#10243b] hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    GỬI YÊU CẦU CHO CHÚNG TÔI
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Side: Map & Address Info */}
          <div className="lg:col-span-5 bg-[#fafafa] flex flex-col justify-between">
            <div className="p-6 sm:p-8 border-b border-gray-200/80 bg-white">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
                Trụ Sở Chính
              </span>
              <h3 className="text-lg font-black text-[#10243b] mb-2">
                Công ty CP Môi Trường &amp; Công Trình Đô Thị Huế
              </h3>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>46 Trần Phú, Phường Thuận Hóa, Thành phố Huế, Tỉnh Thừa Thiên Huế</span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[340px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d478.30214414111595!2d107.59154364573497!3d16.45440178297318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a146b5a816c7%3A0xada6cb22654e37cc!2zSEVQQ08gLSBDw7RuZyB0eSBDUCBNw7RpIHRyxrDhu51uZyB2w6AgQ8O0bmcgdHLDrG5oIMSQw7QgdGjhu4sgSHXhur8!5e0!3m2!1svi!2s!4v1785397496081!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Bản đồ vị trí HEPCO"
                className="w-full h-full min-h-[340px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqContact;
