import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Send, HelpCircle } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const DEFAULT_FAQS = [
  {
    question: 'Làm thế nào để tra cứu lịch trình thu gom rác tại tuyến đường nhà tôi?',
    answer: 'Quý khách có thể vào mục "Lịch Gom Rác" ngay trên trang chủ để tra cứu lịch theo từng phường/xã và tuyến đường cụ thể, hoặc liên hệ tổng đài (0234) 3822 052.'
  },
  {
    question: 'Quy trình đăng ký dịch vụ hút hầm vệ sinh hoặc cắt tỉa cành cây như thế nào?',
    answer: 'Quý khách chỉ cần chọn mục "Đăng ký dịch vụ" trên website hoặc liên hệ hotline. Đội ngũ kỹ thuật của HEPCO sẽ liên hệ lại trong vòng 24 giờ để khảo sát và báo giá cụ thể.'
  },
  {
    question: 'Doanh nghiệp có thể ký hợp đồng thu gom chất thải công nghiệp định kỳ bằng cách nào?',
    answer: 'Doanh nghiệp có thể gửi yêu cầu qua form liên hệ hoặc liên hệ trực tiếp phòng Kế hoạch - Kinh doanh của HEPCO. Chúng tôi cung cấp hợp đồng trọn gói kèm đầy đủ chứng từ nghiệm thu môi trường theo luật định.'
  },
  {
    question: 'Cách thức tra cứu và thanh toán tiền dịch vụ vệ sinh môi trường qua hóa đơn điện tử?',
    answer: 'Quý khách truy cập cổng "Hóa Đơn Điện Tử" tại hoadondientu.hepco.com.vn, nhập mã khách hàng in trên biên lai thu tiền để tra cứu và thanh toán trực tuyến qua các ngân hàng.'
  },
  {
    question: 'Khi phát hiện điểm tập kết rác thải tự phát hoặc sự cố môi trường, tôi phản ánh qua đâu?',
    answer: 'Quý khách có thể chụp ảnh và gửi phản ánh qua mục "Báo cáo sự cố" trên website, hoặc gọi hotline khẩn cấp 24/7 để đội cơ động HEPCO tiếp nhận và xử lý nhanh chóng trong ngày.'
  }
];

const FaqContact = ({ config }) => {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' or 'contact'

  const title = config?.title || 'Giải Đáp Thắc Mắc & Liên Hệ';
  const subtitle = config?.subtitle || 'Chúng tôi luôn lắng nghe và phản hồi mọi câu hỏi, ý kiến đóng góp của quý khách hàng và nhân dân.';
  const items = Array.isArray(config?.items) && config.items.length > 0
    ? config.items
    : DEFAULT_FAQS;

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
      phone: Yup.string()
        .matches(/^[0-9+() -]+$/, 'Số điện thoại không hợp lệ')
        .required('Vui lòng nhập số điện thoại'),
      email: Yup.string().email('Email không hợp lệ'),
      subject: Yup.string().required('Vui lòng chọn hoặc nhập tiêu đề'),
      message: Yup.string().required('Vui lòng nhập nội dung tin nhắn'),
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
          body: formData,
          mode: 'no-cors'
        });

        toast.success('Yêu cầu đã được gửi thành công! HEPCO sẽ liên hệ lại quý khách sớm nhất.');
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
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Content Box */}
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
                  {items.map((item, index) => (
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
                          {item.question}
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
                        <div className="mt-4 pt-3 border-t border-gray-200/60 text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                          {item.answer}
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
                      <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Họ và tên *
                      </label>
                      <input
                        id="name"
                        type="text"
                        {...formik.getFieldProps('name')}
                        placeholder="Nguyễn Văn A"
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        {...formik.getFieldProps('phone')}
                        placeholder="0912 345 678"
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...formik.getFieldProps('email')}
                        placeholder="example@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Dịch vụ cần tư vấn *
                      </label>
                      <select
                        id="subject"
                        {...formik.getFieldProps('subject')}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                          formik.touched.subject && formik.errors.subject ? 'border-red-500' : 'border-gray-200'
                        }`}
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        <option value="Thu gom rác sinh hoạt">Thu gom rác sinh hoạt</option>
                        <option value="Hút hầm cầu / bể phốt">Hút hầm cầu / bể phốt</option>
                        <option value="Cắt tỉa cây xanh / Vườn hoa">Cắt tỉa cây xanh / Vườn hoa</option>
                        <option value="Xử lý chất thải công nghiệp">Xử lý chất thải công nghiệp</option>
                        <option value="Dịch vụ sự kiện / Nhà vệ sinh lưu động">Dịch vụ sự kiện / Nhà vệ sinh lưu động</option>
                        <option value="Phản ánh sự cố vệ sinh">Phản ánh sự cố vệ sinh</option>
                        <option value="Khác">Khác</option>
                      </select>
                      {formik.touched.subject && formik.errors.subject && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.subject}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Chi tiết yêu cầu *
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      {...formik.getFieldProps('message')}
                      placeholder="Ghi rõ địa chỉ, khối lượng hoặc tình trạng cần hỗ trợ..."
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        formik.touched.message && formik.errors.message ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {formik.touched.message && formik.errors.message && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{formik.isSubmitting ? 'Đang gửi...' : 'Gửi Thông Tin Yêu Cầu'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Side: Map & Contact Info */}
          <div className="lg:col-span-5 bg-[#fafafa] p-7 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Thông Tin Trụ Sở
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#10243b] mt-1 mb-2">
                  HEPCO Huế
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Công ty Cổ phần Môi trường và Công trình Đô thị Huế.
                </p>
              </div>

              <div className="space-y-3.5 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 block text-xs uppercase">Địa chỉ trụ sở</span>
                    <span>46 Trần Phú, Phường Phước Vĩnh, TP. Huế</span>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed Frame */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-52 sm:h-64 relative bg-gray-200">
                <iframe
                  title="Bản đồ chỉ đường đến HEPCO Huế"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.357193237194!2d107.58784867590895!3d16.457476828929762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a141a0279601%3A0xe96cf03c73bb1e17!2zNDYgVHLhuqduIFBow7osIFBoxrDhu5tjIFbEqW5oLCBUaMOgbmggcGjhu5EgSHXhur8!5e0!3m2!1svi!2s!4v1715694200000!5m2!1svi!2s"
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
              Tổng đài tiếp nhận thông tin 24/7:{' '}
              <a href="tel:02343822052" className="font-bold text-emerald-700 hover:underline">
                (0234) 3822 052
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqContact;
