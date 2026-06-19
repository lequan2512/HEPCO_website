import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ROUTES } from '../../constants/routes';

const AdminLogin = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
      password: Yup.string().required('Vui lòng nhập mật khẩu'),
    }),
    onSubmit: (values) => {
      if (values.username === 'admin' && values.password === '123456') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!');
      }
    },
  });

  return (
    <div className="flex items-center justify-center py-20 bg-gray-50 flex-grow">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-hepco-green mb-6">Đăng nhập Quản trị</h2>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input 
              type="text" 
              name="username"
              className={`w-full mt-1 p-2 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green ${
                formik.touched.username && formik.errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="admin"
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="text-red-500 text-xs mt-1">{formik.errors.username}</div>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
              type="password" 
              name="password"
              className={`w-full mt-1 p-2 border rounded outline-none focus:ring-hepco-green focus:border-hepco-green ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="123456"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
            ) : null}
          </div>
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-[#008c45] hover:bg-green-700 text-white font-semibold rounded transition-colors"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
