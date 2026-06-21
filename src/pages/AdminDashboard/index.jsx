import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ROUTES } from '../../constants/routes';
import { API_BASE_URL } from '../../constants/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate(ROUTES.ADMIN_LOGIN);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      category: 'Hoạt động Công ty',
      content: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tiêu đề bài viết'),
      category: Yup.string().required('Vui lòng chọn danh mục bài viết'),
      content: Yup.string().test(
        'is-empty', 
        'Vui lòng nhập nội dung bài viết',
        (value) => value && value.replace(/<[^>]+>/g, '').trim().length > 0
      ),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: values.title,
            category: values.category,
            content: values.content,
            author: 'Ban Truyền Thông'
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSuccessMsg('Đăng bài viết mới thành công vào cơ sở dữ liệu!');
          resetForm();
          setTimeout(() => {
            setSuccessMsg('');
          }, 3000);
        } else {
          alert(data.error || 'Có lỗi xảy ra khi đăng bài viết!');
        }
      } catch (err) {
        console.error('Lỗi khi đăng bài:', err);
        alert('Không thể kết nối đến máy chủ API để đăng bài!');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex-grow">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý bài viết</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Đăng xuất
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 border border-green-200 rounded shadow-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Tiêu đề bài viết</label>
          <input 
            type="text" 
            name="title"
            className={`w-full p-3 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green ${
              formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập tiêu đề..."
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.title && formik.errors.title ? (
            <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
          ) : null}
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Danh mục bài viết</label>
          <select 
            name="category"
            className={`w-full p-3 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green bg-white ${
              formik.touched.category && formik.errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="Bảo vệ Môi trường">Bảo vệ Môi trường</option>
            <option value="Hoạt động Công ty">Hoạt động Công ty</option>
            <option value="Tin tức Cổ đông">Tin tức Cổ đông</option>
          </select>
          {formik.touched.category && formik.errors.category ? (
            <div className="text-red-500 text-sm mt-1">{formik.errors.category}</div>
          ) : null}
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Nội dung</label>
          <div className={`bg-white ${formik.touched.content && formik.errors.content ? 'border border-red-500 rounded' : ''}`}>
            <ReactQuill 
              theme="snow"
              value={formik.values.content}
              onChange={(content) => {
                formik.setFieldValue('content', content);
              }}
              onBlur={() => {
                formik.setFieldTouched('content', true);
              }}
              modules={modules}
              className="h-96 mb-12"
            />
          </div>
          {formik.touched.content && formik.errors.content ? (
            <div className="text-red-500 text-sm mt-1">{formik.errors.content}</div>
          ) : null}
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="px-8 py-3 bg-[#008c45] hover:bg-green-700 text-white text-lg font-semibold rounded shadow transition-colors"
          >
            Đăng Bài
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDashboard;
