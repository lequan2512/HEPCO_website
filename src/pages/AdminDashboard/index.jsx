import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ROUTES } from '../../constants/routes';

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
      content: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tiêu đề bài viết'),
      content: Yup.string().test(
        'is-empty', 
        'Vui lòng nhập nội dung bài viết',
        (value) => value && value.replace(/<[^>]+>/g, '').trim().length > 0 // Loại bỏ thẻ HTML để kiểm tra rỗng
      ),
    }),
    onSubmit: (values, { resetForm }) => {
      console.log('Tiêu đề:', values.title);
      console.log('Nội dung HTML (từ ReactQuill):', values.content);
      
      setSuccessMsg('Đăng bài thành công! (Xem log tại console)');
      
      resetForm();
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
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
