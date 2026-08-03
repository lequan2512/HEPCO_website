import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Send, HelpCircle } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const FaqContact = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState('faq'); // 'faq' or 'contact'

  const faqs = [
    'Không nắm được thông tin về tăng giá do chính quyền thông báo?',
    'Các khu vực thu gom rác 02 ngày/lần vì sao lại thu tiền bằng khu vực thu gom ngày/lần?',
    'Hộ kinh doanh nhỏ lẻ xả thải còn ít hơn hộ gia đình sao lại thu kinh doanh cao; Nhà nước không quy định các tiêu chí để xác định là hộ kinh doanh (mở hình lớn nhỏ ra sao)?',
    'Nhà nước thu thuế từ các hoạt động sản xuất, kinh doanh, cũng như thu nhập của người dân thì phải chi phí thu dọn vệ sinh chứ tại sao lại bắt người dân phải nộp thêm tiền?',
    'Tại sao không thu theo nhân khẩu mà cào bằng, nhà 1, 2 hộ cũng giống như nhà đông người?'
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
      name: Yup.string().required('Vui lòng nhập tên'),
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

        toast.success('Câu hỏi của bạn đã được gửi thành công!');
        resetForm();
      } catch (error) {
        console.error('Lỗi khi gửi form:', error);
        toast.error('Đã xảy ra lỗi khi gửi. Vui lòng thử lại sau.');
      }
    },
  });

  return (
    <section className="relative py-16 md:py-24 bg-gray-900 overflow-hidden">
      {/* Background image overlay */}
      <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url(https://via.placeholder.com/1920x1080?text=Background+Image)' }}></div>
      <div className="absolute inset-0 bg-green-900/60 mix-blend-multiply"></div>

      <div className="container mx-auto px-4 max-w-8xl relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10 md:mb-16">Liên Hệ</h2>

        <div className="flex flex-col lg:flex-row shadow-2xl rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border-2 border-hepco-green">
          {/* Left Side: Questions (FAQ Accordion & Contact Form) */}
          <div className="w-full lg:w-1/2 bg-white p-6 md:p-10 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-hepco-green">
            <div>
              {/* Tabs header */}
              <div className="flex border-b border-gray-200 mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('faq')}
                  className={`flex items-center gap-2 pb-3 px-4 text-sm md:text-base font-bold transition-all border-b-2 ${
                    activeTab === 'faq'
                      ? 'border-hepco-green text-hepco-green'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  Câu hỏi thường gặp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className={`flex items-center gap-2 pb-3 px-4 text-sm md:text-base font-bold transition-all border-b-2 ${
                    activeTab === 'contact'
                      ? 'border-hepco-green text-hepco-green'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  Gửi câu hỏi
                </button>
              </div>

              {/* Tab 1: FAQ Accordion */}
              {activeTab === 'faq' && (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <button
                        type="button"
                        className="w-full flex justify-between items-center text-left focus:outline-none group"
                        onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                      >
                        <span className={`text-sm md:text-base font-semibold pr-4 transition-colors ${openFaq === index ? 'text-hepco-green' : 'text-gray-700 group-hover:text-hepco-green'}`}>
                          {faq}
                        </span>
                        {openFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-hepco-green flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-hepco-green" />
                        )}
                      </button>
                      {openFaq === index && (
                        <div className="mt-3 text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                          Nội dung trả lời cho câu hỏi này sẽ được cập nhật chi tiết để giải đáp thắc mắc của khách hàng một cách rõ ràng và minh bạch nhất.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Contact Form */}
              {activeTab === 'contact' && (
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Họ và tên"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full bg-gray-50 border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none transition-all ${formik.touched.name && formik.errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-hepco-green'}`}
                      />
                      {formik.touched.name && formik.errors.name ? (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                      ) : null}
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full bg-gray-50 border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none transition-all ${formik.touched.email && formik.errors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-hepco-green'}`}
                      />
                      {formik.touched.email && formik.errors.email ? (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Số điện thoại"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full bg-gray-50 border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none transition-all ${formik.touched.phone && formik.errors.phone ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-hepco-green'}`}
                      />
                      {formik.touched.phone && formik.errors.phone ? (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
                      ) : null}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="subject"
                        placeholder="Tiêu đề"
                        value={formik.values.subject}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full bg-gray-50 border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none transition-all ${formik.touched.subject && formik.errors.subject ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-hepco-green'}`}
                      />
                      {formik.touched.subject && formik.errors.subject ? (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.subject}</div>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <textarea
                      name="message"
                      placeholder="Nội dung câu hỏi..."
                      rows="4"
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full bg-gray-50 border text-gray-800 placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none transition-all resize-none ${formik.touched.message && formik.errors.message ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-hepco-green'}`}
                    ></textarea>
                    {formik.touched.message && formik.errors.message ? (
                      <div className="text-red-500 text-xs mt-1">{formik.errors.message}</div>
                    ) : null}
                  </div>
                  <button type="submit" className="w-full bg-hepco-green hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md">
                    GỬI CÂU HỎI
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Side: Map iframe */}
          <div className="w-full lg:w-1/2 min-h-[400px] lg:min-h-[500px] relative bg-gray-200 flex flex-col">
            <div className="bg-gray-800 text-white px-6 py-3 flex items-center gap-2 text-sm font-semibold border-b border-gray-700">
              <MapPin className="w-4 h-4 text-hepco-green" />
              <span>Bản đồ vị trí HEPCO - 46 Trần Phú, Huế</span>
            </div>
            <div className="flex-1 w-full h-full min-h-[360px] lg:min-h-[460px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d478.30214414111595!2d107.59154364573497!3d16.45440178297318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a146b5a816c7%3A0xada6cb22654e37cc!2zSEVQQ08gLSBDw7RuZyB0eSBDUCBNw7RpIHRyxrDhu51uZyB2w6AgQ8O0bmcgdHLDrG5oIMSQw7QgdGjhu4sgSHXhur8!5e0!3m2!1svi!2s!4v1785397496081!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Bản đồ vị trí HEPCO"
                className="w-full h-full min-h-[360px] lg:min-h-[460px]"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqContact;
