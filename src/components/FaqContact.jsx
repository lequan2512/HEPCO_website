import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import logo from '../assets/images/logo-white.png';

const FaqContact = () => {
  const [openFaq, setOpenFaq] = useState(0);

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
    <section className="relative py-24 bg-gray-900 overflow-hidden">
      {/* Background image overlay */}
      <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url(https://via.placeholder.com/1920x1080?text=Background+Image)' }}></div>
      <div className="absolute inset-0 bg-green-900/60 mix-blend-multiply"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Câu hỏi</h2>

        <div className="flex flex-col lg:flex-row shadow-2xl rounded-xl overflow-hidden bg-white/10 backdrop-blur-md">
          {/* FAQ Accordion */}
          <div className="w-full lg:w-1/2 bg-white p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Câu hỏi thường gặp</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <button
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
                    <div className="mt-4 text-gray-600 text-sm leading-relaxed">
                      Nội dung trả lời cho câu hỏi này sẽ được cập nhật chi tiết để giải đáp thắc mắc của khách hàng một cách rõ ràng và minh bạch nhất.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="w-full lg:w-1/2 bg-hepco-green/90 p-10 backdrop-blur-sm relative">
            {/* watermark logo */}
            <img src={logo} alt="HEPCO" className="absolute top-4 right-4 w-16 h-16 opacity-20 object-contain mix-blend-screen" />
            
            <h3 className="text-2xl font-bold text-white mb-8 text-center drop-shadow-md">Gửi câu hỏi</h3>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Tên"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full bg-transparent border text-white placeholder-white/70 px-4 py-3 rounded focus:outline-none transition-all ${formik.touched.name && formik.errors.name ? 'border-red-400 focus:border-red-400' : 'border-white/40 focus:border-white focus:ring-1 focus:ring-white'}`}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="text-red-300 text-xs mt-1">{formik.errors.name}</div>
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
                    className={`w-full bg-transparent border text-white placeholder-white/70 px-4 py-3 rounded focus:outline-none transition-all ${formik.touched.email && formik.errors.email ? 'border-red-400 focus:border-red-400' : 'border-white/40 focus:border-white focus:ring-1 focus:ring-white'}`}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-red-300 text-xs mt-1">{formik.errors.email}</div>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full bg-transparent border text-white placeholder-white/70 px-4 py-3 rounded focus:outline-none transition-all ${formik.touched.phone && formik.errors.phone ? 'border-red-400 focus:border-red-400' : 'border-white/40 focus:border-white focus:ring-1 focus:ring-white'}`}
                  />
                  {formik.touched.phone && formik.errors.phone ? (
                    <div className="text-red-300 text-xs mt-1">{formik.errors.phone}</div>
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
                    className={`w-full bg-transparent border text-white placeholder-white/70 px-4 py-3 rounded focus:outline-none transition-all ${formik.touched.subject && formik.errors.subject ? 'border-red-400 focus:border-red-400' : 'border-white/40 focus:border-white focus:ring-1 focus:ring-white'}`}
                  />
                  {formik.touched.subject && formik.errors.subject ? (
                    <div className="text-red-300 text-xs mt-1">{formik.errors.subject}</div>
                  ) : null}
                </div>
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Nội dung"
                  rows="4"
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-transparent border text-white placeholder-white/70 px-4 py-3 rounded focus:outline-none transition-all resize-none ${formik.touched.message && formik.errors.message ? 'border-red-400 focus:border-red-400' : 'border-white/40 focus:border-white focus:ring-1 focus:ring-white'}`}
                ></textarea>
                {formik.touched.message && formik.errors.message ? (
                  <div className="text-red-300 text-xs mt-1">{formik.errors.message}</div>
                ) : null}
              </div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded transition-colors shadow-lg shadow-green-900/20">
                GỬI
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqContact;
